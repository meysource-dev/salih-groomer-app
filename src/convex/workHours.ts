import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Default working hours (Saturday=0 to Friday=6)
const DEFAULT_HOURS: Record<number, string[]> = {
  0: ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"],
  1: ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"],
  2: ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"],
  3: ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"],
  4: ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"],
  5: ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"],
  6: [], // Friday - closed
};

// Get available time slots for a specific date
export const getSlotsForDate = query({
  args: { date: v.string() },
  handler: async (ctx, args) => {
    const d = new Date(args.date);
    // JS getDay(): 0=Sunday, 1=Monday, ... 6=Saturday
    // We want: 0=Saturday, ... 6=Friday
    const weekday = (d.getDay() + 1) % 7;

    const workHour = await ctx.db
      .query("work_hours")
      .withIndex("by_weekday", (q) => q.eq("weekday", weekday))
      .first();

    if (!workHour || !workHour.isActive || workHour.slots.length === 0) {
      return { slots: [], isWorkingDay: false };
    }

    return { slots: workHour.slots, isWorkingDay: true };
  },
});

// Get all work hours (for admin)
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("work_hours").collect();
  },
});

// Admin: seed default work hours
export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("work_hours").first();
    if (existing) return "already_seeded";

    for (const [weekday, slots] of Object.entries(DEFAULT_HOURS)) {
      await ctx.db.insert("work_hours", {
        weekday: Number(weekday),
        slots,
        isActive: slots.length > 0,
      });
    }
    return "seeded";
  },
});

// Admin: update work hours for a weekday
export const update = mutation({
  args: {
    weekday: v.number(),
    slots: v.array(v.string()),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("work_hours")
      .withIndex("by_weekday", (q) => q.eq("weekday", args.weekday))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        slots: args.slots,
        isActive: args.isActive,
      });
    } else {
      await ctx.db.insert("work_hours", {
        weekday: args.weekday,
        slots: args.slots,
        isActive: args.isActive,
      });
    }
  },
});
