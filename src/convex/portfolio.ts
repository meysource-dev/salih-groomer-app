import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Helper to verify admin token
async function requireAdminToken(ctx: any, token: string) {
  const session = await ctx.db
    .query("admin_sessions")
    .withIndex("by_token", (q: any) => q.eq("token", token))
    .first();
  if (!session) {
    throw new Error("غیرمجاز: لطفاً وارد شوید");
  }
  if (Date.now() - session.createdAt > 24 * 60 * 60 * 1000) {
    await ctx.db.delete(session._id);
    throw new Error("جلسه منقضی شده");
  }
  const admin = await ctx.db.get(session.adminId);
  if (!admin || !admin.isActive) {
    throw new Error("حساب مدیر غیرفعال است");
  }
  return admin;
}

export const listPublished = query({
  args: {},
  handler: async (ctx) => {
    const items = await ctx.db
      .query("portfolio")
      .withIndex("by_published", (q) => q.eq("isPublished", true))
      .collect();

    const results = [];
    for (const item of items) {
      let url = item.imageUrl;
      if (item.imageUrl && !item.imageUrl.startsWith("http")) {
        try {
          const storageUrl = await ctx.storage.getUrl(item.imageUrl);
          if (storageUrl) url = storageUrl;
        } catch {}
      }
      results.push({ ...item, imageUrl: url });
    }
    return results;
  },
});

// Admin: list all
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const items = await ctx.db.query("portfolio").collect();
    const results = [];
    for (const item of items) {
      let url = item.imageUrl;
      if (item.imageUrl && !item.imageUrl.startsWith("http")) {
        try {
          const storageUrl = await ctx.storage.getUrl(item.imageUrl);
          if (storageUrl) url = storageUrl;
        } catch {}
      }
      results.push({ ...item, imageUrl: url });
    }
    return results;
  },
});

// Admin: generate upload URL — REQUIRES ADMIN TOKEN
export const generateUploadUrl = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    await requireAdminToken(ctx, args.token);
    return await ctx.storage.generateUploadUrl();
  },
});

// Admin: create portfolio item — REQUIRES ADMIN TOKEN
export const create = mutation({
  args: {
    token: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    imageUrl: v.string(),
    petType: v.optional(v.string()),
    serviceType: v.optional(v.string()),
    isPublished: v.boolean(),
  },
  handler: async (ctx, args) => {
    await requireAdminToken(ctx, args.token);

    // Sanitize inputs
    const title = args.title.trim().slice(0, 200);
    const description = args.description ? args.description.trim().slice(0, 1000) : undefined;

    if (!title) throw new Error("عنوان الزامی است");

    const existing = await ctx.db.query("portfolio").collect();
    return await ctx.db.insert("portfolio", {
      title,
      description,
      imageUrl: args.imageUrl,
      petType: args.petType,
      serviceType: args.serviceType,
      isPublished: args.isPublished,
      order: existing.length,
      createdAt: Date.now(),
    });
  },
});

// Admin: update — REQUIRES ADMIN TOKEN
export const update = mutation({
  args: {
    id: v.id("portfolio"),
    token: v.string(),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    petType: v.optional(v.string()),
    serviceType: v.optional(v.string()),
    isPublished: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireAdminToken(ctx, args.token);
    const { id, token, ...fields } = args;

    if (fields.title !== undefined) {
      fields.title = fields.title.trim().slice(0, 200);
    }
    if (fields.description !== undefined) {
      fields.description = fields.description.trim().slice(0, 1000);
    }

    await ctx.db.patch(id, fields);
  },
});

// Admin: delete — REQUIRES ADMIN TOKEN
export const remove = mutation({
  args: { id: v.id("portfolio"), token: v.string() },
  handler: async (ctx, args) => {
    await requireAdminToken(ctx, args.token);

    const item = await ctx.db.get(args.id);
    if (item?.imageUrl && !item.imageUrl.startsWith("http")) {
      try {
        await ctx.storage.delete(item.imageUrl as any);
      } catch {}
    }
    await ctx.db.delete(args.id);
  },
});
