import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
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
    // Allow both authenticated and unauthenticated users
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
      throw new Error("\u0627\u06cc\u0646 \u0632\u0645\u0627\u0646 \u0642\u0628\u0644\u0627\u064b \u0631\u0632\u0631\u0648 \u0634\u062f\u0647 \u0627\u0633\u062a");
    }

    const appointmentId = await ctx.db.insert("appointments", {
      userId: userId as any,
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
      .withIndex("by_user", (q) => q.eq("userId", userId as any))
      .order("desc")
      .collect();

    const results = [];
    for (const apt of appointments) {
      const services = [];
      const sids = (apt as any).serviceIds || ((apt as any).serviceId ? [(apt as any).serviceId] : []);
      if (Array.isArray(sids)) {
        for (const sid of sids) {
          const svc = await ctx.db.get(sid);
          if (svc) services.push(svc);
        }
      }
      results.push({ ...apt, services, totalPrice: (apt as any).totalPrice || (apt as any).price || 0 });
    }
    return results;
  },
});

// Admin: list all appointments
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const appointments = await ctx.db
      .query("appointments")
      .order("desc")
      .collect();
    const results = [];
    for (const apt of appointments) {
      const services = [];
      const sids = (apt as any).serviceIds || ((apt as any).serviceId ? [(apt as any).serviceId] : []);
      if (Array.isArray(sids)) {
        for (const sid of sids) {
          const svc = await ctx.db.get(sid);
          if (svc) services.push(svc);
        }
      }
      results.push({ ...apt, services, totalPrice: (apt as any).totalPrice || (apt as any).price || 0 });
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
