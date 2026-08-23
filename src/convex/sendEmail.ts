"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";

export const sendBookingNotification = action({
  args: {
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
      dog: "\ud83d\udc15 \u0633\u06af",
      cat: "\ud83d\udc08 \u06af\u0631\u0628\u0647",
      rabbit: "\ud83d\udc07 \u062e\u0631\u06af\u0648\u0634",
    };

    const servicesList = args.serviceNames
      .map((s) => `<li style="padding: 4px 0;">${s}</li>`)
      .join("");

    const htmlContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="fa">
      <head><meta charset="UTF-8"></head>
      <body style="font-family: Tahoma, Arial, sans-serif; background: #FFF5EC; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 14px rgba(0,0,0,0.1);">
          <div style="background: linear-gradient(135deg, #C4703A, #E8945A); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">\ud83d\udc3e \u0631\u0632\u0631\u0648 \u0646\u0648\u0628\u062a \u062c\u062f\u06cc\u062f</h1>
            <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0 0;">\u0635\u0627\u0644\u062d \u06af\u0631\u0648\u0645\u0631</p>
          </div>
          <div style="padding: 30px;">
            <h2 style="color: #C4703A; margin-top: 0;">\u0627\u0637\u0644\u0627\u0639\u0627\u062a \u0631\u0632\u0631\u0648</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; color: #666;">\u0646\u0627\u0645 \u062d\u06cc\u0648\u0627\u0646:</td><td style="padding: 8px 0; font-weight: bold;">${args.petName}</td></tr>
              <tr><td style="padding: 8px 0; color: #666;">\u0646\u0648\u0639 \u062d\u06cc\u0648\u0627\u0646:</td><td style="padding: 8px 0; font-weight: bold;">${petTypeFa[args.petType] || args.petType}</td></tr>
              ${args.petBreed ? `<tr><td style="padding: 8px 0; color: #666;">\u0646\u0632\u0627\u062f:</td><td style="padding: 8px 0; font-weight: bold;">${args.petBreed}</td></tr>` : ""}
              ${args.petWeight ? `<tr><td style="padding: 8px 0; color: #666;">\u0639\u0646\u0648\u0627\u0646:</td><td style="padding: 8px 0; font-weight: bold;">${args.petWeight} \u06a9\u06cc\u0644\u0648\u06af\u0631\u0645</td></tr>` : ""}
              <tr><td style="padding: 8px 0; color: #666;">\u0634\u0645\u0627\u0631\u0647 \u062a\u0645\u0627\u0633:</td><td style="padding: 8px 0; font-weight: bold; direction: ltr; text-align: right;">${args.phone}</td></tr>
              <tr><td style="padding: 8px 0; color: #666;">\u062e\u062f\u0645\u062a\u200c\u0647\u0627:</td><td style="padding: 8px 0; font-weight: bold;"><ul style="margin: 0; padding-right: 16px;">${servicesList}</ul></td></tr>
              <tr><td style="padding: 8px 0; color: #666;">\u062a\u0627\u0631\u06cc\u062e:</td><td style="padding: 8px 0; font-weight: bold;">${args.date}</td></tr>
              <tr><td style="padding: 8px 0; color: #666;">\u0633\u0627\u0639\u062a:</td><td style="padding: 8px 0; font-weight: bold;">${args.time}</td></tr>
              <tr><td style="padding: 8px 0; color: #666;">\u0647\u0632\u06cc\u0646\u0647:</td><td style="padding: 8px 0; font-weight: bold; color: #C4703A; font-size: 18px;">${args.totalPrice.toLocaleString("fa-IR")} \u062a\u0648\u0645\u0627\u0646</td></tr>
              ${args.notes ? `<tr><td style="padding: 8px 0; color: #666;">\u062a\u0648\u0636\u06cc\u062d\u0627\u062a:</td><td style="padding: 8px 0;">${args.notes}</td></tr>` : ""}
            </table>
          </div>
          <div style="background: #f8f4f0; padding: 16px; text-align: center; color: #999; font-size: 12px;">
            \u0627\u06cc\u0646 \u0627\u06cc\u0645\u06cc\u0644 \u062a\u0648\u0633\u0637 \u0633\u06cc\u0633\u062a\u0645 \u0631\u0632\u0631\u0648 \u0622\u0646\u0644\u0627\u06cc\u0646 \u0635\u0627\u0644\u062d \u06af\u0631\u0648\u0645\u0631 \u0627\u0631\u0633\u0627\u0644 \u0634\u062f\u0647 \u0627\u0633\u062a
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
          subject: `\ud83d\udc3e \u0631\u0632\u0631\u0648 \u062c\u062f\u06cc\u062f: ${args.petName} - ${args.serviceNames.join(", ")}`,
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
