import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Public: get active working days
export const listActive = query({
  args: {},
  handler: async (ctx) => {
    const days = await ctx.db.query("working_days").collect();
    // If no working days configured, all days are active by default
    if (days.length === 0) {
      return [0, 1, 2, 3, 4, 5]; // Sat-Fri (Jalali)
    }
    return days.filter((d) => d.isActive).map((d) => d.dayOfWeek);
  },
});

// Admin: get all working days
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const days = await ctx.db.query("working_days").collect();
    // If none configured, default all to active
    if (days.length === 0) {
      return [0, 1, 2, 3, 4, 5].map((dayOfWeek) => ({
        _id: `default_${dayOfWeek}` as any,
        dayOfWeek,
        isActive: true,
      }));
    }
    return days;
  },
});

// Admin: set working day status
export const setActive = mutation({
  args: {
    dayOfWeek: v.number(),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("working_days")
      .withIndex("by_dayOfWeek", (q) => q.eq("dayOfWeek", args.dayOfWeek))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { isActive: args.isActive });
    } else {
      await ctx.db.insert("working_days", {
        dayOfWeek: args.dayOfWeek,
        isActive: args.isActive,
      });
    }
  },
});
