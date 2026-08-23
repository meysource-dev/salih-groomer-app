import { motion } from "framer-motion";
import { Phone, MapPin, Clock, PawPrint, Shield, Star, MessageCircle } from "lucide-react";
import { Link } from "react-router";

export default function Contact() {
  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Hero */}
      <section className="py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 left-1/4 w-64 h-64 bg-gradient-to-br from-amber-200/30 to-orange-100/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-gradient-to-br from-orange-100/20 to-amber-50/20 rounded-full blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl md:text-5xl font-black mb-4">
              درباره <span className="bg-gradient-to-l from-primary to-amber-500 bg-clip-text text-transparent">صالح گرومر</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              با بیش از ۷ سال تجربه در حوزه گرومینگ و مراقبت حیوانات خانگی
            </p>
          </motion.div>
        </div>
      </section>

      {/* About with Owner Photo */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="clay-card p-8 md:p-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              <div className="order-2 md:order-1">
                <h2 className="text-2xl font-black mb-4">چرا ما را انتخاب کنید؟</h2>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  صالح گرومر با تیمی متخصص و محیطی آرام، بهترین تجربه گرومینگ را برای حیوان خانگی شما فراهم می‌کند.
                  ما با استفاده از بهترین مواد و تجهیزات، سلامت و زیبایی حیوان عزیز شما را تضمین می‌کنیم.
                </p>
                <div className="space-y-3">
                  {[
                    { icon: Shield, text: "تیم گرومرهای حرفه‌ای و باتجربه" },
                    { icon: PawPrint, text: "محیط آرام و مجهز مخصوص حیوانات" },
                    { icon: Star, text: "استفاده از بهترین مواد بهداشتی" },
                    { icon: Clock, text: "سرویس‌دهی سریع و منظم" },
                  ].map((item) => (
                    <div key={item.text} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><item.icon className="w-4 h-4 text-primary" /></div>
                      <span className="text-sm font-medium">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="order-1 md:order-2 flex justify-center">
                <div className="w-64 h-80 md:w-72 md:h-88 rounded-3xl overflow-hidden clay-card p-2">
                  <div className="w-full h-full rounded-[1.5rem] overflow-hidden bg-gradient-to-br from-primary/10 to-amber-100/50 relative">
                    <img src="/saleh.jpg" alt="صالح گرومر - گرومر حرفه‌ای" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden'); }} />
                    <div className="absolute inset-0 hidden flex-col items-center justify-center">
                      <img src="/hero-illustration.svg" alt="صالح گرومر" className="w-full h-full object-contain" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Owner name */}
            <div className="text-center mt-8 pt-6 border-t border-border/50">
              <p className="text-lg font-black">صالح گرومر</p>
              <p className="text-sm text-muted-foreground">گرومر حرفه‌ای حیوانات خانگی</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-16 px-4 bg-gradient-to-b from-transparent via-secondary/20 to-transparent">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-black text-center mb-12">ارتباط با ما</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Phone, title: "تلفن", info: "۰۹۱۲-XXX-XXXX", desc: "تماس یا پیامک" },
              { icon: MapPin, title: "آدرس", info: "تهران", desc: "خیابان ولیعصر، نبش کوچه ..." },
              { icon: Clock, title: "ساعات کاری", info: "شنبه تا پنجشنبه", desc: "۹ صبح تا ۶ عصر" },
            ].map((c) => (
              <motion.div key={c.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="clay-card p-6 text-center">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-4"><c.icon className="w-7 h-7 text-primary" /></div>
                <h3 className="font-bold mb-1">{c.title}</h3>
                <p className="text-primary font-bold">{c.info}</p>
                <p className="text-sm text-muted-foreground mt-1">{c.desc}</p>
              </motion.div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <a href="https://wa.me/989120000000" target="_blank" rel="noopener noreferrer" className="clay-btn bg-emerald-600 text-white px-8 py-3 font-bold inline-flex items-center gap-2">
              <MessageCircle className="w-5 h-5" /> پیام در واتساپ
            </a>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <Link to="/auth?returnTo=/booking" className="clay-btn bg-primary text-primary-foreground px-10 py-4 text-lg font-bold inline-flex items-center gap-2">
            رزرو نوبت آنلاین
          </Link>
        </div>
      </section>
    </div>
  );
}
