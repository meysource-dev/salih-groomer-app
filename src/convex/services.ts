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
        name: "شستشوی کامل",
        nameEn: "Full Bath & Dry",
        description: "شستشوی کامل با شامپوی مخصوص، خشک کردن و شانه‌زنی",
        price: 350000,
        duration: 60,
        petType: "both" as const,
        icon: "bath",
        isActive: true,
      },
      {
        name: "ارایش و پیرایش",
        nameEn: "Haircut & Styling",
        description: "اصلاح و ارایش مو متناسب با نژاد و سلیقه صاحب",
        price: 500000,
        duration: 90,
        petType: "both" as const,
        icon: "scissors",
        isActive: true,
      },
      {
        name: "شستشو و اصلاح",
        nameEn: "Wash & Trim",
        description: "شستشو همراه با اصلاح سر و صورت و ناخن",
        price: 450000,
        duration: 75,
        petType: "both" as const,
        icon: "sparkles",
        isActive: true,
      },
      {
        name: "پدیکور و مانیکور",
        nameEn: "Nail Trim & Paw Care",
        description: "کوتاهی ناخن، تمیز کردن و مراقبت از پنجه‌ها",
        price: 150000,
        duration: 30,
        petType: "both" as const,
        icon: "pawPrint",
        isActive: true,
      },
      {
        name: "تمیز کردن گوش و چشم",
        nameEn: "Ear & Eye Cleaning",
        description: "پاکسازی تخصصی گوش‌ها و اطراف چشم",
        price: 100000,
        duration: 20,
        petType: "both" as const,
        icon: "eye",
        isActive: true,
      },
      {
        name: "پکیج VIP",
        nameEn: "VIP Full Package",
        description: "شستشو، اصلاح، پدیکور، تمیز کردن گوش و چشم، عطر مخصوص",
        price: 800000,
        duration: 120,
        petType: "both" as const,
        icon: "crown",
        isActive: true,
      },
    ];

    for (const service of services) {
      await ctx.db.insert("services", service);
    }
    return "seeded";
  },
});
