"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";

// HTML-escape user input to prevent XSS
function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export const sendBookingNotification = action({
  args: {
    ownerName: v.string(),
    petName: v.string(),
    petType: v.string(),
    petBreed: v.optional(v.string()),
    petWeight: v.optional(v.number()),
    phone: v.string(),
    notes: v.optional(v.string()),
    serviceNames: v.array(v.string()),
    totalPrice: v.number(),
    date: v.string(),
    time: v.string(),
  },
  handler: async (ctx, args) => {
    const adminEmail = process.env.ADMIN_EMAIL || "salehjaferi@gmail.com";
    const resendApiKey = process.env.RESEND_API_KEY;

    if (!resendApiKey) {
      console.log("RESEND_API_KEY not configured. Skipping email.");
      console.log("Booking details:", JSON.stringify(args, null, 2));
      return { sent: false, reason: "no_api_key" };
    }

    const petTypeFa: Record<string, string> = {
      dog: "🐕 سگ",
      cat: "🐈 گربه",
      rabbit: "🐇 خرگوش",
    };

    // Sanitize all user inputs for HTML
    const safeOwnerName = escapeHtml(args.ownerName);
    const safePetName = escapeHtml(args.petName);
    const safePhone = escapeHtml(args.phone);
    const safeDate = escapeHtml(args.date);
    const safeTime = escapeHtml(args.time);
    const safeNotes = args.notes ? escapeHtml(args.notes) : "";
    const safePetBreed = args.petBreed ? escapeHtml(args.petBreed) : "";
    const safePetType = petTypeFa[args.petType] || escapeHtml(args.petType);

    const servicesList = args.serviceNames
      .map((s) => `<li style="padding: 4px 0;">${escapeHtml(s)}</li>`)
      .join("");

    const htmlContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="fa">
      <head><meta charset="UTF-8"></head>
      <body style="font-family: Tahoma, Arial, sans-serif; background: #FFF5EC; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 14px rgba(0,0,0,0.1);">
          <div style="background: linear-gradient(135deg, #C4703A, #E8945A); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🐾 رزرو نوبت جدید</h1>
            <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0 0;">صالح گرومر</p>
          </div>
          <div style="padding: 30px;">
            <h2 style="color: #C4703A; margin-top: 0;">اطلاعات رزرو</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; color: #666;">نام صاحب:</td><td style="padding: 8px 0; font-weight: bold;">${safeOwnerName}</td></tr>
              <tr><td style="padding: 8px 0; color: #666;">نام حیوان:</td><td style="padding: 8px 0; font-weight: bold;">${safePetName}</td></tr>
              <tr><td style="padding: 8px 0; color: #666;">نوع حیوان:</td><td style="padding: 8px 0; font-weight: bold;">${safePetType}</td></tr>
              ${safePetBreed ? `<tr><td style="padding: 8px 0; color: #666;">نژاد:</td><td style="padding: 8px 0; font-weight: bold;">${safePetBreed}</td></tr>` : ""}
              ${args.petWeight ? `<tr><td style="padding: 8px 0; color: #666;">وزن:</td><td style="padding: 8px 0; font-weight: bold;">${args.petWeight} کیلوگرم</td></tr>` : ""}
              <tr><td style="padding: 8px 0; color: #666;">شماره تماس:</td><td style="padding: 8px 0; font-weight: bold; direction: ltr; text-align: right;">${safePhone}</td></tr>
              <tr><td style="padding: 8px 0; color: #666;">خدمات:</td><td style="padding: 8px 0; font-weight: bold;"><ul style="margin: 0; padding-right: 16px;">${servicesList}</ul></td></tr>
              <tr><td style="padding: 8px 0; color: #666;">تاریخ:</td><td style="padding: 8px 0; font-weight: bold;">${safeDate}</td></tr>
              <tr><td style="padding: 8px 0; color: #666;">ساعت:</td><td style="padding: 8px 0; font-weight: bold;">${safeTime}</td></tr>
              <tr><td style="padding: 8px 0; color: #666;">هزینه:</td><td style="padding: 8px 0; font-weight: bold; color: #C4703A; font-size: 18px;">${args.totalPrice.toLocaleString("fa-IR")} تومان</td></tr>
              ${safeNotes ? `<tr><td style="padding: 8px 0; color: #666;">توضیحات:</td><td style="padding: 8px 0;">${safeNotes}</td></tr>` : ""}
            </table>
          </div>
          <div style="background: #f8f4f0; padding: 16px; text-align: center; color: #999; font-size: 12px;">
            این ایمیل توسط سیستم رزرو آنلاین صالح گرومر ارسال شده است
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Saleh Groomer <onboarding@resend.dev>",
          to: [adminEmail],
          subject: `🐾 رزرو جدید: ${safePetName} - ${args.serviceNames.join(", ")}`,
          html: htmlContent,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error("Email send failed:", error);
        return { sent: false, reason: error };
      }

      return { sent: true };
    } catch (error) {
      console.error("Email error:", error);
      return { sent: false, reason: String(error) };
    }
  },
});
