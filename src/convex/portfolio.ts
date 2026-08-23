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

// Admin: create
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
    await ctx.db.delete(args.id);
  },
});
