import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// --- Input sanitization helpers ---
function sanitizeString(input: string, maxLen: number): string {
  // Remove null bytes, trim, truncate
  return input.replace(/\0/g, "").trim().slice(0, maxLen);
}

function sanitizePhone(phone: string): string {
  // Only allow digits, exactly 11 chars starting with 09
  const digits = phone.replace(/\D/g, "").slice(0, 11);
  return digits;
}

// Maximum booking per phone per day (rate limit)
const MAX_BOOKINGS_PER_DAY = 3;

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
    // --- Validate & sanitize all inputs ---
    const ownerName = sanitizeString(args.ownerName, 100);
    const petName = sanitizeString(args.petName, 100);
    const phone = sanitizePhone(args.phone);
    const petBreed = args.petBreed ? sanitizeString(args.petBreed, 100) : undefined;
    const notes = args.notes ? sanitizeString(args.notes, 500) : undefined;
    const petWeight =
      args.petWeight !== undefined && args.petWeight !== null
        ? Math.min(Math.max(Number(args.petWeight), 0), 200)
        : undefined;

    // Validate required fields
    if (!ownerName) throw new Error("نام صاحب پت الزامی است");
    if (!petName) throw new Error("نام حیوان الزامی است");
    if (!/^09\d{9}$/.test(phone)) {
      throw new Error("شماره موبایل نامعتبر است");
    }
    if (args.serviceIds.length === 0) {
      throw new Error("حداقل یک خدمت انتخاب کنید");
    }
    if (args.serviceIds.length > 5) {
      throw new Error("حداکثر ۵ خدمت قابل انتخاب است");
    }

    // Validate date format (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(args.date)) {
      throw new Error("تاریخ نامعتبر است");
    }

    // Validate time format (HH:MM)
    if (!/^\d{2}:\d{2}$/.test(args.time)) {
      throw new Error("ساعت نامعتبر است");
    }

    // Validate petType
    if (!["dog", "cat", "rabbit"].includes(args.petType)) {
      throw new Error("نوع حیوان نامعتبر است");
    }

    // Validate totalPrice is reasonable
    if (typeof args.totalPrice !== "number" || args.totalPrice < 0 || args.totalPrice > 50000000) {
      throw new Error("قیمت نامعتبر است");
    }

    // --- Rate limiting: max 3 bookings per phone per day ---
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const dayTimestamp = todayStart.getTime();

    const rateLimit = await ctx.db
      .query("booking_rate_limits")
      .withIndex("by_phone_date", (q) =>
        q.eq("phone", phone).eq("date", dayTimestamp)
      )
      .first();

    if (rateLimit && rateLimit.count >= MAX_BOOKINGS_PER_DAY) {
      throw new Error("شما در امروز بیش از حد مجاز نوبت ثبت کرده‌اید");
    }

    // --- Check for conflicting appointments ---
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

    // --- Check services are valid and active ---
    for (const serviceId of args.serviceIds) {
      const svc = await ctx.db.get(serviceId);
      if (!svc || !svc.isActive) {
        throw new Error("یکی از خدمات انتخاب شده نامعتبر است");
      }
    }

    // --- Verify totalPrice matches actual service prices ---
    let calculatedPrice = 0;
    for (const serviceId of args.serviceIds) {
      const svc = await ctx.db.get(serviceId);
      if (svc) calculatedPrice += svc.price;
    }
    if (args.totalPrice !== calculatedPrice) {
      throw new Error("قیمت محاسبه شده با خدمات انتخابی مطابقت ندارد");
    }

    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject || `guest_${phone}`;

    // --- Create the appointment ---
    const appointmentId = await ctx.db.insert("appointments", {
      userId,
      ownerName,
      serviceIds: args.serviceIds,
      date: args.date,
      time: args.time,
      petName,
      petType: args.petType,
      petBreed,
      petWeight,
      phone,
      notes,
      totalPrice: args.totalPrice,
      status: "pending",
      createdAt: Date.now(),
    });

    // --- Update rate limit ---
    if (rateLimit) {
      await ctx.db.patch(rateLimit._id, { count: rateLimit.count + 1 });
    } else {
      await ctx.db.insert("booking_rate_limits", {
        phone,
        date: dayTimestamp,
        count: 1,
      });
    }

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
    // Allow owner to cancel their own appointment
    const identity = await ctx.auth.getUserIdentity();
    if (identity) {
      if (appointment.userId === identity.subject) {
        await ctx.db.patch(args.id, { status: "cancelled" });
        return;
      }
    }
    // Allow guest to cancel by phone match (stored in appointment)
    // For now, only allow owner or admin
    throw new Error("فقط صاحب رزرو یا مدیر می‌تواند آن را لغو کند");
  },
});

// Admin: update status — REQUIRES ADMIN TOKEN
export const updateStatus = mutation({
  args: {
    id: v.id("appointments"),
    token: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("cancelled"),
      v.literal("completed"),
    ),
  },
  handler: async (ctx, args) => {
    // Verify admin session
    const session = await ctx.db
      .query("admin_sessions")
      .withIndex("by_token", (q: any) => q.eq("token", args.token))
      .first();
    if (!session) throw new Error("غیرمجاز: لطفاً وارد شوید");
    if (Date.now() - session.createdAt > 24 * 60 * 60 * 1000) {
      await ctx.db.delete(session._id);
      throw new Error("جلسه منقضی شده");
    }
    const admin = await ctx.db.get(session.adminId);
    if (!admin || !admin.isActive) throw new Error("حساب مدیر غیرفعال است");

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
