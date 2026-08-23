import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

const DEFAULT_START = "09:00";
const DEFAULT_END = "18:00";

// Public: get active working days
export const listActive = query({
  args: {},
  handler: async (ctx) => {
    const days = await ctx.db.query("working_days").collect();
    if (days.length === 0) {
      return [0, 1, 2, 3, 4, 5]; // Sat-Fri
    }
    return days.filter((d) => d.isActive).map((d) => d.dayOfWeek);
  },
});

// Public: get time slots for a specific Jalali weekday
// Generates slots based on 3hr grooming + 30min gap
export const getSlotsForDay = query({
  args: { dayOfWeek: v.number() },
  handler: async (ctx, args) => {
    const day = await ctx.db
      .query("working_days")
      .withIndex("by_dayOfWeek", (q) => q.eq("dayOfWeek", args.dayOfWeek))
      .first();

    if (!day || !day.isActive) return [];

    const start = day.startTime || DEFAULT_START;
    const end = day.endTime || DEFAULT_END;

    // Generate time slots: 3hr sessions with 30min gap
    const slots = [];
    const [startH, startM] = start.split(":").map(Number);
    const [endH, endM] = end.split(":").map(Number);
    let currentMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    while (currentMinutes + 180 <= endMinutes) { // 180 = 3 hours
      const h = Math.floor(currentMinutes / 60);
      const m = currentMinutes % 60;
      slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
      currentMinutes += 210; // 3hr work + 30min gap = 210 minutes
    }

    return slots;
  },
});

// Admin: get all working days with full info
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const days = await ctx.db.query("working_days").collect();
    const existingDays = new Set(days.map((d) => d.dayOfWeek));

    // Add default entries for days not yet configured
    const result = [...days];
    for (let i = 0; i < 7; i++) {
      if (!existingDays.has(i)) {
        result.push({
          _id: `default_${i}` as any,
          _creationTime: 0,
          dayOfWeek: i,
          isActive: true,
          startTime: DEFAULT_START,
          endTime: DEFAULT_END,
        } as any);
      }
    }

    // Sort by dayOfWeek
    result.sort((a, b) => a.dayOfWeek - b.dayOfWeek);

    // Generate time slots for each active day
    return result.map((day) => {
      const slots = [];
      if (day.isActive) {
        const start = day.startTime || DEFAULT_START;
        const end = day.endTime || DEFAULT_END;
        const [startH, startM] = start.split(":").map(Number);
        const [endH, endM] = end.split(":").map(Number);
        let currentMinutes = startH * 60 + startM;
        const endMinutes = endH * 60 + endM;

        while (currentMinutes + 180 <= endMinutes) {
          const h = Math.floor(currentMinutes / 60);
          const m = currentMinutes % 60;
          slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
          currentMinutes += 210;
        }
      }
      return { ...day, generatedSlots: slots };
    });
  },
});

// Admin: set working day status and times
export const updateDay = mutation({
  args: {
    dayOfWeek: v.number(),
    isActive: v.boolean(),
    startTime: v.optional(v.string()),
    endTime: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("working_days")
      .withIndex("by_dayOfWeek", (q) => q.eq("dayOfWeek", args.dayOfWeek))
      .first();

    const data = {
      isActive: args.isActive,
      startTime: args.startTime || DEFAULT_START,
      endTime: args.endTime || DEFAULT_END,
    };

    if (existing) {
      await ctx.db.patch(existing._id, data);
    } else {
      await ctx.db.insert("working_days", {
        dayOfWeek: args.dayOfWeek,
        ...data,
      });
    }
  },
});
