import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    ownerName: v.string(),
    serviceIds: v.array(v.id("services")),
    date: v.string(),
    time: v.string(),
    petName: v.string(),
    petType: v.string(),
    petBreed: v.optional(v.string()),
    petWeight: v.optional(v.number()),
    phone: v.string(),
    notes: v.optional(v.string()),
    totalPrice: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject || `guest_${args.phone}`;

    // Check for conflicting appointments on same date+time
    const existing = await ctx.db
      .query("appointments")
      .withIndex("by_date", (q) => q.eq("date", args.date))
      .collect();

    const conflict = existing.find(
      (a) => a.time === args.time && a.status !== "cancelled",
    );
    if (conflict) {
      throw new Error("این زمان قبلاً رزرو شده است");
    }

    const appointmentId = await ctx.db.insert("appointments", {
      userId,
      ownerName: args.ownerName,
      serviceIds: args.serviceIds,
      date: args.date,
      time: args.time,
      petName: args.petName,
      petType: args.petType,
      petBreed: args.petBreed,
      petWeight: args.petWeight,
      phone: args.phone,
      notes: args.notes,
      totalPrice: args.totalPrice,
      status: "pending",
      createdAt: Date.now(),
    });

    return appointmentId;
  },
});

export const listByUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const userId = identity.subject;
    const appointments = await ctx.db
      .query("appointments")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    const results = [];
    for (const apt of appointments) {
      const services = [];
      if (Array.isArray(apt.serviceIds)) {
        for (const sid of apt.serviceIds) {
          const svc = await ctx.db.get(sid);
          if (svc) services.push(svc);
        }
      }
      results.push({ ...apt, services });
    }
    return results;
  },
});

// Admin: list all appointments with optional filters
export const listAll = query({
  args: {
    petType: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let appointments;

    if (args.status) {
      appointments = await ctx.db
        .query("appointments")
        .withIndex("by_status", (q) => q.eq("status", args.status as any))
        .order("desc")
        .collect();
    } else {
      appointments = await ctx.db
        .query("appointments")
        .order("desc")
        .collect();
    }

    // Filter by petType if specified
    let filtered = appointments;
    if (args.petType) {
      filtered = appointments.filter((a) => a.petType === args.petType);
    }

    const results = [];
    for (const apt of filtered) {
      const services = [];
      if (Array.isArray(apt.serviceIds)) {
        for (const sid of apt.serviceIds) {
          const svc = await ctx.db.get(sid);
          if (svc) services.push(svc);
        }
      }
      results.push({ ...apt, services });
    }
    return results;
  },
});

export const cancel = mutation({
  args: { id: v.id("appointments") },
  handler: async (ctx, args) => {
    const appointment = await ctx.db.get(args.id);
    if (!appointment) throw new Error("Appointment not found");
    await ctx.db.patch(args.id, { status: "cancelled" });
  },
});

// Admin: update status
export const updateStatus = mutation({
  args: {
    id: v.id("appointments"),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("cancelled"),
      v.literal("completed"),
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status });
  },
});

export const getBookedSlots = query({
  args: { date: v.string() },
  handler: async (ctx, args) => {
    const appointments = await ctx.db
      .query("appointments")
      .withIndex("by_date", (q) => q.eq("date", args.date))
      .collect();
    return appointments
      .filter((a) => a.status !== "cancelled")
      .map((a) => ({ date: a.date, time: a.time }));
  },
});
