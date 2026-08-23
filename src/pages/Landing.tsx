import { motion } from "framer-motion";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import {
  Scissors, Bath, Sparkles, Heart, Clock, Star, Phone, MapPin,
  PawPrint, Crown, CalendarCheck, Shield, ChevronLeft, Rabbit, ScissorsIcon,
} from "lucide-react";
import { Link } from "react-router";

const easeOut = [0.22, 1, 0.36, 1] as const;
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6, ease: easeOut } }),
};
const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: (i: number) => ({ opacity: 1, scale: 1, transition: { delay: i * 0.12, duration: 0.5, ease: easeOut } }),
};

const services = [
  { icon: Bath, name: "شستشو", desc: "شستشوی کامل با شامپوی مخصوص", price: "۲۵۰,۰۰۰", color: "from-sky-200 to-blue-100", pets: "سگ، گربه، خرگوش" },
  { icon: Scissors, name: "اصلاح با قیچی", desc: "ارایش و اصلاح مو با قیچی متناسب با نژاد", price: "۴۰۰,۰۰۰", color: "from-rose-200 to-pink-100", pets: "سگ، گربه" },
  { icon: ScissorsIcon, name: "اصلاح با ماشین", desc: "اصلاح سریع و یکدست با ماشین", price: "۳۰۰,۰۰۰", color: "from-amber-200 to-orange-100", pets: "سگ، گربه" },
  { icon: Sparkles, name: "اصلاح ترکیبی", desc: "ترکیب قیچی و ماشین برای بهترین نتیجه", price: "۴۵۰,۰۰۰", color: "from-violet-200 to-purple-100", pets: "سگ، گربه" },
  { icon: PawPrint, name: "کوتاهی ناخن", desc: "کوتاهی و صاف کردن ناخن‌ها", price: "۱۰۰,۰۰۰", color: "from-emerald-200 to-teal-100", pets: "سگ، گربه، خرگوش" },
  { icon: Heart, name: "تخلیه کیسه مقعد", desc: "مراقبت تخصصی (فقط سگ‌ها)", price: "۱۲۰,۰۰۰", color: "from-pink-200 to-rose-100", pets: "سگ" },
  { icon: Crown, name: "دیشیدینگ و باز کردن گره", desc: "حذف موهای ریخته و باز کردن گره", price: "۳۵۰,۰۰۰", color: "from-orange-200 to-amber-100", pets: "سگ، گربه" },
];

const features = [
  { icon: Shield, title: "تیم متخصص", desc: "گرومرهای حرفه‌ای با سال‌ها تجربه" },
  { icon: Heart, title: "محیط آرام", desc: "فضایی آرام برای راحتی حیوان شما" },
  { icon: Clock, title: "رزرو آنلاین", desc: "رزرو نوبت در کمتر از ۱ دقیقه" },
  { icon: Star, title: "رضایت ۱۰۰٪", desc: "بیش از ۵۰۰ مشتری راضی" },
];

export default function Landing() {
  const portfolio = useQuery(api.portfolio.listPublished);

  return (
    <div className="min-h-screen overflow-hidden" dir="rtl">
      {/* Hero */}
      <section className="relative min-h-[85vh] flex items-center justify-center px-4 py-12 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-gradient-to-br from-orange-200/40 to-amber-200/30 rounded-full blur-3xl animate-float-slow" />
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-gradient-to-tr from-amber-100/30 to-orange-100/20 rounded-full blur-3xl animate-float" />
          <div className="absolute top-1/4 left-1/3 w-48 h-48 bg-gradient-to-br from-rose-100/30 to-orange-50/20 rounded-full blur-2xl animate-float-slow" />
        </div>

        <div className="relative max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, ease: easeOut }} className="text-center md:text-right order-2 md:order-1">
            <div className="inline-flex items-center gap-2 clay-card px-4 py-2 mb-6">
              <PawPrint className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">مرکز تخصصی گرومینگ حیوانات</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black leading-tight mb-6">
              <span className="block">صالح</span>
              <span className="block bg-gradient-to-l from-primary via-amber-500 to-orange-400 bg-clip-text text-transparent">گرومر</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed max-w-lg mx-auto md:mx-0">
              اصلاح، شستشو و مراقبت تخصصی سگ، گربه و خرگوهای شما با بهترین کیفیت و محیطی آرام و حرفه‌ای
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
              <Link to="/auth?returnTo=/booking" className="clay-btn bg-primary text-primary-foreground px-8 py-4 text-lg font-bold inline-flex items-center gap-2">
                <CalendarCheck className="w-5 h-5" /> رزرو نوبت <ChevronLeft className="w-4 h-4" />
              </Link>
              <Link to="/portfolio" className="clay-card-hover px-8 py-4 text-lg font-bold inline-flex items-center gap-2 bg-card">
                نمونه کارها
              </Link>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2, ease: easeOut }} className="flex justify-center order-1 md:order-2">
            <div className="relative">
              <div className="w-72 h-72 md:w-96 md:h-96 rounded-[2rem] overflow-hidden clay-card p-2">
                <div className="w-full h-full rounded-[1.5rem] overflow-hidden bg-gradient-to-br from-primary/10 to-amber-100/50 relative">
                  <img src="/saleh.jpg" alt="صالح گرومر" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden'); }} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center hidden">
                    <PawPrint className="w-20 h-20 text-primary/30 mb-3" />
                    <span className="text-primary/40 font-bold text-sm">صالح گرومر</span>
                    <span className="text-primary/25 text-xs mt-1">گرومر حرفه‌ای حیوانات</span>
                  </div>
                </div>
              </div>
              <motion.div animate={{ y: [-5, 5, -5] }} transition={{ duration: 3, repeat: Infinity }} className="absolute -bottom-4 -left-4 w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-50 clay-blob flex items-center justify-center">
                <PawPrint className="w-8 h-8 text-primary" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-6 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={scaleIn} custom={0}
            className="clay-card px-8 py-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[{ n: "۵۰۰+", l: "مشتری راضی" }, { n: "۳۰۰۰+", l: "خدمات انجام شده" }, { n: "۵⭐", l: "امتیاز" }, { n: "۷+", l: "سال تجربه" }].map((s) => (
              <div key={s.l}><div className="text-2xl md:text-3xl font-black text-primary">{s.n}</div><div className="text-sm text-muted-foreground mt-1">{s.l}</div></div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="text-center mb-14">
            <h2 className="text-3xl md:text-5xl font-black mb-4">خدمات <span className="bg-gradient-to-l from-primary to-amber-500 bg-clip-text text-transparent">ما</span></h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">مجموعه‌ای کامل از خدمات گرومینگ برای سگ، گربه و خرگوش</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {services.map((s, i) => (
              <motion.div key={s.name} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={scaleIn} custom={i} className="clay-card-hover p-5">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-3 shadow-md`}>
                  <s.icon className="w-6 h-6 text-foreground/80" />
                </div>
                <h3 className="font-bold mb-1">{s.name}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed mb-2">{s.desc}</p>
                <div className="text-xs text-primary/70 mb-2">🐾 {s.pets}</div>
                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                  <span className="text-sm font-black text-primary">{s.price} تومان</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-gradient-to-b from-transparent via-secondary/30 to-transparent">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="text-center mb-14">
            <h2 className="text-3xl md:text-5xl font-black mb-4">چرا <span className="bg-gradient-to-l from-primary to-amber-500 bg-clip-text text-transparent">صالح گرومر</span>؟</h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div key={f.title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={scaleIn} custom={i} className="clay-card p-6 text-center">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-4">
                  <f.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio Preview */}
      {portfolio && portfolio.length > 0 && (
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="text-center mb-14">
              <h2 className="text-3xl md:text-5xl font-black mb-4">نمونه <span className="bg-gradient-to-l from-primary to-amber-500 bg-clip-text text-transparent">کارها</span></h2>
            </motion.div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {portfolio.slice(0, 8).map((item, i) => (
                <motion.div key={item._id} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={scaleIn} custom={i} className="clay-card-hover overflow-hidden group">
                  <div className="aspect-square overflow-hidden bg-gradient-to-br from-primary/5 to-amber-50">
                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="p-3">
                    <h3 className="font-bold text-sm">{item.title}</h3>
                    {item.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.description}</p>}
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link to="/portfolio" className="clay-card-hover px-8 py-3 font-bold inline-flex items-center gap-2 bg-card">
                مشاهده همه <ChevronLeft className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={scaleIn} custom={0}
            className="clay-card p-10 md:p-14 text-center bg-gradient-to-br from-primary/5 via-card to-amber-50/50 relative overflow-hidden">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/5 rounded-full blur-2xl" />
            <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-amber-100/30 rounded-full blur-2xl" />
            <div className="relative">
              <PawPrint className="w-12 h-12 text-primary mx-auto mb-4" />
              <h2 className="text-3xl md:text-4xl font-black mb-4">آماده‌اید نوبت رزرو کنید؟</h2>
              <p className="text-muted-foreground text-lg mb-8 max-w-lg mx-auto">همین الان با چند کلیک ساده، نوبت گرومینگ حیوان خانگی‌تان را رزرو کنید</p>
              <Link to="/auth?returnTo=/booking" className="clay-btn bg-primary text-primary-foreground px-10 py-4 text-lg font-bold inline-flex items-center gap-2">
                <CalendarCheck className="w-5 h-5" /> رزرو نوبت آنلاین <ChevronLeft className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-amber-500 clay-blob flex items-center justify-center">
                  <PawPrint className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-black">صالح گرومر</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">مرکز تخصصی گرومینگ و اصلاح سگ، گربه و خرگوش با بیش از ۷ سال تجربه</p>
            </div>
            <div>
              <h3 className="font-bold mb-4">دسترسی سریع</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#services" className="hover:text-primary transition-colors">خدمات</a></li>
                <li><Link to="/portfolio" className="hover:text-primary transition-colors">نمونه کارها</Link></li>
                <li><Link to="/contact" className="hover:text-primary transition-colors">تماس با ما</Link></li>
                <li><Link to="/auth?returnTo=/booking" className="hover:text-primary transition-colors">رزرو نوبت</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">ارتباط با ما</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><Phone className="w-4 h-4 text-primary" /> ۰۹۱۲-XXX-XXXX</li>
                <li className="flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" /> تهران</li>
              </ul>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t border-border/50 text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} صالح گرومر. تمامی حقوق محفوظ است.
          </div>
        </div>
      </footer>
    </div>
  );
}
