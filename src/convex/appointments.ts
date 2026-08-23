import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    serviceId: v.id("services"),
    date: v.string(),
    time: v.string(),
    petName: v.string(),
    petType: v.union(v.literal("dog"), v.literal("cat")),
    petBreed: v.optional(v.string()),
    petWeight: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = (await ctx.auth.getUserIdentity())?.subject;
    if (!userId) throw new Error("Not authenticated");

    // Check for conflicting appointments
    const existing = await ctx.db
      .query("appointments")
      .withIndex("by_date", (q) => q.eq("date", args.date))
      .collect();

    const conflict = existing.find(
      (a) =>
        a.time === args.time &&
        a.status !== "cancelled" &&
        a.serviceId === args.serviceId,
    );
    if (conflict) {
      throw new Error("این زمان قبلاً رزرو شده است");
    }

    const appointmentId = await ctx.db.insert("appointments", {
      userId: userId as any,
      serviceId: args.serviceId,
      date: args.date,
      time: args.time,
      petName: args.petName,
      petType: args.petType,
      petBreed: args.petBreed,
      petWeight: args.petWeight,
      notes: args.notes,
      status: "pending",
      createdAt: Date.now(),
    });

    return appointmentId;
  },
});

export const listByUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = (await ctx.auth.getUserIdentity())?.subject;
    if (!userId) return [];

    const appointments = await ctx.db
      .query("appointments")
      .withIndex("by_user", (q) => q.eq("userId", userId as any))
      .order("desc")
      .collect();

    const results = [];
    for (const apt of appointments) {
      const service = await ctx.db.get(apt.serviceId);
      results.push({ ...apt, service });
    }
    return results;
  },
});

export const cancel = mutation({
  args: { id: v.id("appointments") },
  handler: async (ctx, args) => {
    const userId = (await ctx.auth.getUserIdentity())?.subject;
    if (!userId) throw new Error("Not authenticated");

    const appointment = await ctx.db.get(args.id);
    if (!appointment) throw new Error("Appointment not found");
    if (appointment.userId !== userId) throw new Error("Not authorized");

    await ctx.db.patch(args.id, { status: "cancelled" });
  },
});

export const getBookedSlots = query({
  args: { date: v.string(), serviceId: v.id("services") },
  handler: async (ctx, args) => {
    const appointments = await ctx.db
      .query("appointments")
      .withIndex("by_date", (q) => q.eq("date", args.date))
      .collect();

    return appointments
      .filter((a) => a.status !== "cancelled" && a.serviceId === args.serviceId)
      .map((a) => ({ date: a.date, time: a.time }));
  },
});
