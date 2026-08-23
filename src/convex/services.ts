import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("services")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();
  },
});

export const get = query({
  args: { id: v.id("services") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
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
        description: "کوتاهی و صاف کردن ناخن‌ها",
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
        description: "تخلیه و مراقبت کیسه مقعد (فقط سگ‌ها)",
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
        description: "حذف موهای ریخته و باز کردن گره‌های مو",
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
