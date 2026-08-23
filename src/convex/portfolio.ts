import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listPublished = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("portfolio")
      .withIndex("by_published", (q) => q.eq("isPublished", true))
      .collect();
  },
});

// Admin: list all
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("portfolio").collect();
  },
});

// Admin: generate upload URL for Convex file storage
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

// Admin: create with image URL (from Convex storage or external)
export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    imageUrl: v.string(),
    petType: v.optional(v.string()),
    serviceType: v.optional(v.string()),
    isPublished: v.boolean(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("portfolio").collect();
    return await ctx.db.insert("portfolio", {
      ...args,
      order: existing.length,
      createdAt: Date.now(),
    });
  },
});

// Admin: update
export const update = mutation({
  args: {
    id: v.id("portfolio"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    petType: v.optional(v.string()),
    serviceType: v.optional(v.string()),
    isPublished: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    await ctx.db.patch(id, fields);
  },
});

// Admin: delete
export const remove = mutation({
  args: { id: v.id("portfolio") },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.id);
    // Delete associated file from storage if it's a Convex upload
    if (item?.imageUrl) {
      try {
        const storageId = item.imageUrl.split("/").pop();
        if (storageId) await ctx.storage.delete(storageId as any);
      } catch {}
    }
    await ctx.db.delete(args.id);
  },
});
