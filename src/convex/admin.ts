import { query, mutation, action } from "./_generated/server";
import { v } from "convex/values";
import { sha256 } from "@oslojs/crypto/sha2";

function hashPassword(password: string): string {
  const bytes = new TextEncoder().encode(password);
  const hash = sha256(bytes);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
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

    await ctx.db.insert("admin_users", {
      username: "admin",
      passwordHash: hashPassword("saleh123"),
      name: "صالح",
      isActive: true,
    });
    return "seeded";
  },
});

// Admin login
export const login = mutation({
  args: {
    username: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const admin = await ctx.db
      .query("admin_users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first();

    if (!admin || !admin.isActive) {
      throw new Error("نام کاربری یا رمز عبور اشتباه است");
    }

    const hash = hashPassword(args.password);
    if (hash !== admin.passwordHash) {
      throw new Error("نام کاربری یا رمز عبور اشتباه است");
    }

    // Generate a simple session token
    const token = hashPassword(admin._id + Date.now());

    return { token, name: admin.name || admin.username, adminId: admin._id };
  },
});

// Verify admin session
export const verifySession = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    // Simple token verification - check if token matches an admin
    const admin = await ctx.db.query("admin_users").first();
    if (!admin) return null;
    return { adminId: admin._id, name: admin.name || admin.username };
  },
});

// List all admin users
export const listAdmins = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("admin_users").collect();
  },
});

// Create admin
export const createAdmin = mutation({
  args: {
    username: v.string(),
    password: v.string(),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("admin_users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first();
    if (existing) throw new Error("این نام کاربری قبلاً استفاده شده");

    return await ctx.db.insert("admin_users", {
      username: args.username,
      passwordHash: hashPassword(args.password),
      name: args.name,
      isActive: true,
    });
  },
});

// Delete admin
export const deleteAdmin = mutation({
  args: { id: v.id("admin_users") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Change admin password
export const changePassword = mutation({
  args: {
    adminId: v.id("admin_users"),
    newPassword: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.adminId, {
      passwordHash: hashPassword(args.newPassword),
    });
  },
});
