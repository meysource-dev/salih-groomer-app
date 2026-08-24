import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

const DEFAULT_START = "09:00";
const DEFAULT_END = "18:00";

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

// Admin: set working day status and times — REQUIRES ADMIN TOKEN
export const updateDay = mutation({
  args: {
    token: v.string(),
    dayOfWeek: v.number(),
    isActive: v.boolean(),
    startTime: v.optional(v.string()),
    endTime: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdminToken(ctx, args.token);

    // Validate dayOfWeek
    if (args.dayOfWeek < 0 || args.dayOfWeek > 6) {
      throw new Error("روز هفته نامعتبر است");
    }

    // Validate time format
    const timeRegex = /^\d{2}:\d{2}$/;
    if (args.startTime && !timeRegex.test(args.startTime)) {
      throw new Error("ساعت شروع نامعتبر است");
    }
    if (args.endTime && !timeRegex.test(args.endTime)) {
      throw new Error("ساعت پایان نامعتبر است");
    }

    // Validate start < end
    if (args.startTime && args.endTime && args.startTime >= args.endTime) {
      throw new Error("ساعت شروع باید قبل از ساعت پایان باشد");
    }

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
