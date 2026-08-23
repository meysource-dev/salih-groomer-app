import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listPublished = query({
  args: {},
  handler: async (ctx) => {
    const items = await ctx.db
      .query("portfolio")
      .withIndex("by_published", (q) => q.eq("isPublished", true))
      .collect();

    // Resolve storage IDs to URLs
    const results = [];
    for (const item of items) {
      let url = item.imageUrl;
      // If it looks like a Convex storage ID (not a URL), resolve it
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

    // Resolve storage IDs to URLs
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
    if (item?.imageUrl && !item.imageUrl.startsWith("http")) {
      try {
        await ctx.storage.delete(item.imageUrl as any);
      } catch {}
    }
    await ctx.db.delete(args.id);
  },
});
