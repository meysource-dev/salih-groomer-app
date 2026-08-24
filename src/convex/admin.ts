import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// --- Password hashing with salt using Web Crypto via SubtleCrypto ---
// We use a simple PBKDF2-like approach with SHA-256 + salt

async function hashPassword(password: string, salt?: string): Promise<string> {
  const encoder = new TextEncoder();
  const saltBytes = salt
    ? new Uint8Array(salt.match(/.{1,2}/g)!.map((b) => parseInt(b, 16)))
    : crypto.getRandomValues(new Uint8Array(16));

  const data = encoder.encode(password);
  const combined = new Uint8Array(saltBytes.length + data.length);
  combined.set(saltBytes, 0);
  combined.set(data, saltBytes.length);

  const hashBuffer = await crypto.subtle.digest("SHA-256", combined);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  const saltHex = Array.from(saltBytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  // Return salt:hash so we can verify later
  return `${saltHex}:${hashHex}`;
}

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [saltHex] = stored.split(":");
  const hash = await hashPassword(password, saltHex);
  return hash === stored;
}

// --- Helper: verify admin session token ---
async function requireAdmin(ctx: any, token: string) {
  const session = await ctx.db
    .query("admin_sessions")
    .withIndex("by_token", (q: any) => q.eq("token", token))
    .first();

  if (!session) {
    throw new Error("غیرمجاز: لطفاً وارد شوید");
  }

  // Check expiry (24 hours)
  if (Date.now() - session.createdAt > 24 * 60 * 60 * 1000) {
    await ctx.db.delete(session._id);
    throw new Error("جلسه منقضی شده. لطفاً دوباره وارد شوید");
  }

  const admin = await ctx.db.get(session.adminId);
  if (!admin || !admin.isActive) {
    await ctx.db.delete(session._id);
    throw new Error("حساب مدیر غیرفعال است");
  }

  return admin;
}

// Seed default admin user (run once)
export const seedAdmin = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("admin_users")
      .withIndex("by_username", (q) => q.eq("username", "admin"))
      .first();
    if (existing) return "already_seeded";

    // Use a default password — admin should change it after first login
    const passwordHash = await hashPassword("saleh123");

    await ctx.db.insert("admin_users", {
      username: "admin",
      passwordHash,
      name: "صالح",
      isActive: true,
    });
    return "seeded";
  },
});

// Admin login — returns a session token
export const login = mutation({
  args: {
    username: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    // Basic input validation
    if (!args.username || args.username.length < 3) {
      throw new Error("نام کاربری نامعتبر است");
    }
    if (!args.password || args.password.length < 4) {
      throw new Error("رمز عبور نامعتبر است");
    }

    const admin = await ctx.db
      .query("admin_users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first();

    if (!admin || !admin.isActive) {
      // Generic error to prevent username enumeration
      throw new Error("نام کاربری یا رمز عبور اشتباه است");
    }

    const valid = await verifyPassword(args.password, admin.passwordHash);
    if (!valid) {
      throw new Error("نام کاربری یا رمز عبور اشتباه است");
    }

    // Invalidate any existing sessions for this admin
    const oldSessions = await ctx.db
      .query("admin_sessions")
      .withIndex("by_adminId", (q) => q.eq("adminId", admin._id))
      .collect();
    for (const s of oldSessions) {
      await ctx.db.delete(s._id);
    }

    // Create new session
    const tokenBytes = crypto.getRandomValues(new Uint8Array(32));
    const token = Array.from(tokenBytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    await ctx.db.insert("admin_sessions", {
      token,
      adminId: admin._id,
      createdAt: Date.now(),
    });

    return { token, name: admin.name || admin.username, adminId: admin._id };
  },
});

// Verify admin session (for checking if user is still logged in)
export const verifySession = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    if (!args.token || args.token.length !== 64) return null;

    const session = await ctx.db
      .query("admin_sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!session) return null;

    // Check expiry
    if (Date.now() - session.createdAt > 24 * 60 * 60 * 1000) {
      return null;
    }

    const admin = await ctx.db.get(session.adminId);
    if (!admin || !admin.isActive) return null;

    return { adminId: admin._id, name: admin.name || admin.username };
  },
});

// Admin logout — destroy session
export const logout = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("admin_sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();
    if (session) {
      await ctx.db.delete(session._id);
    }
    return "ok";
  },
});

// Change admin password (requires session)
export const changePassword = mutation({
  args: {
    token: v.string(),
    currentPassword: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx, args.token);

    const valid = await verifyPassword(args.currentPassword, admin.passwordHash);
    if (!valid) {
      throw new Error("رمز عبور فعلی اشتباه است");
    }

    if (!args.newPassword || args.newPassword.length < 6) {
      throw new Error("رمز عبور جدید باید حداقل ۶ کاراکتر باشد");
    }

    const newHash = await hashPassword(args.newPassword);
    await ctx.db.patch(admin._id, { passwordHash: newHash });

    // Invalidate all other sessions
    const sessions = await ctx.db
      .query("admin_sessions")
      .withIndex("by_adminId", (q) => q.eq("adminId", admin._id))
      .collect();
    for (const s of sessions) {
      if (s.token !== args.token) {
        await ctx.db.delete(s._id);
      }
    }

    return "ok";
  },
});

// Admin-only: create admin (requires existing admin session)
export const createAdmin = mutation({
  args: {
    token: v.string(),
    username: v.string(),
    password: v.string(),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);

    if (!args.username || args.username.length < 3) {
      throw new Error("نام کاربری باید حداقل ۳ کاراکتر باشد");
    }
    if (!args.password || args.password.length < 6) {
      throw new Error("رمز عبور باید حداقل ۶ کاراکتر باشد");
    }

    const existing = await ctx.db
      .query("admin_users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first();
    if (existing) throw new Error("این نام کاربری قبلاً استفاده شده");

    return await ctx.db.insert("admin_users", {
      username: args.username,
      passwordHash: await hashPassword(args.password),
      name: args.name,
      isActive: true,
    });
  },
});

// Admin-only: delete admin (requires session)
export const deleteAdmin = mutation({
  args: { token: v.string(), id: v.id("admin_users") },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx, args.token);
    if (args.id === admin._id) {
      throw new Error("نمی‌توانید حساب خود را حذف کنید");
    }
    await ctx.db.delete(args.id);
  },
});
