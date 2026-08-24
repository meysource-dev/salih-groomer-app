import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Helper to verify admin token
async function requireAdminToken(ctx: any, token: string) {
  const session = await ctx.db
    .query("admin_sessions")
    .withIndex("by_token", (q: any) => q.eq("token", token))
    .first();
  if (!session) {
    throw new Error("غیرمجاز: لطفاً وارد شوید");
  }
  // Check expiry (24h)
  if (Date.now() - session.createdAt > 24 * 60 * 60 * 1000) {
    await ctx.db.delete(session._id);
    throw new Error("جلسه منقضی شده. لطفاً دوباره وارد شوید");
  }
  const admin = await ctx.db.get(session.adminId);
  if (!admin || !admin.isActive) {
    throw new Error("حساب مدیر غیرفعال است");
  }
  return admin;
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("services")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();
  },
});

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("services").collect();
  },
});

export const get = query({
  args: { id: v.id("services") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Admin: update service price — REQUIRES ADMIN TOKEN
export const updatePrice = mutation({
  args: {
    id: v.id("services"),
    price: v.number(),
    token: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdminToken(ctx, args.token);

    if (typeof args.price !== "number" || args.price < 0 || args.price > 50000000) {
      throw new Error("قیمت نامعتبر است");
    }

    await ctx.db.patch(args.id, { price: Math.round(args.price) });
  },
});

// Admin: update service — REQUIRES ADMIN TOKEN
export const update = mutation({
  args: {
    id: v.id("services"),
    token: v.string(),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    duration: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireAdminToken(ctx, args.token);
    const { id, token, ...fields } = args;

    // Validate fields
    if (fields.price !== undefined && (fields.price < 0 || fields.price > 50000000)) {
      throw new Error("قیمت نامعتبر است");
    }
    if (fields.duration !== undefined && (fields.duration < 5 || fields.duration > 600)) {
      throw new Error("مدت زمان نامعتبر است");
    }

    await ctx.db.patch(id, fields);
  },
});

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("services")
      .withIndex("by_active")
      .first();
    if (existing) return "already_seeded";

    const services = [
      {
        name: "شستشو",
        nameEn: "Bath & Wash",
        description: "شستشوی کامل با شامپوی مخصوص + خشک کردن",
        price: 250000,
        duration: 45,
        petTypes: ["dog", "cat", "rabbit"],
        icon: "bath",
        isActive: true,
        order: 1,
      },
      {
        name: "اصلاح با قیچی",
        nameEn: "Scissor Haircut",
        description: "اصلاح و ارایش مو با قیچی متناسب با نژاد",
        price: 400000,
        duration: 90,
        petTypes: ["dog", "cat"],
        icon: "scissors",
        isActive: true,
        order: 2,
      },
      {
        name: "اصلاح با ماشین",
        nameEn: "Clipper Haircut",
        description: "اصلاح سریع و یکدست با ماشین اصلاح",
        price: 300000,
        duration: 60,
        petTypes: ["dog", "cat"],
        icon: "scissors",
        isActive: true,
        order: 3,
      },
      {
        name: "اصلاح ترکیبی",
        nameEn: "Combined Haircut",
        description: "ترکیب قیچی و ماشین برای بهترین نتیجه",
        price: 450000,
        duration: 100,
        petTypes: ["dog", "cat"],
        icon: "scissors",
        isActive: true,
        order: 4,
      },
      {
        name: "کوتاهی ناخن",
        nameEn: "Nail Trim",
        description: "کوتاهی و صاف کردن ناخن\u200cها",
        price: 100000,
        duration: 20,
        petTypes: ["dog", "cat", "rabbit"],
        icon: "pawPrint",
        isActive: true,
        order: 5,
      },
      {
        name: "تخلیه کیسه مقعد",
        nameEn: "Anal Gland Expression",
        description: "تخلیه و مراقبت کیسه مقعد (فقط سگ\u200cها)",
        price: 120000,
        duration: 15,
        petTypes: ["dog"],
        icon: "heart",
        isActive: true,
        order: 6,
      },
      {
        name: "دیشیدینگ و باز کردن گره",
        nameEn: "Deshedding & Dematting",
        description: "حذف موهای ریخته و باز کردن گره\u200cهای مو",
        price: 350000,
        duration: 60,
        petTypes: ["dog", "cat"],
        icon: "sparkles",
        isActive: true,
        order: 7,
      },
    ];

    for (const service of services) {
      await ctx.db.insert("services", service);
    }
    return "seeded";
  },
});
