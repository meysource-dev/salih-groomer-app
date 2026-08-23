import { motion } from "framer-motion";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Scissors, Bath, Sparkles, Heart, Clock, Star, Phone, MapPin, PawPrint, Crown, CalendarCheck, Shield, ChevronLeft } from "lucide-react";
import { Link } from "react-router";

const easeOut = [0.22, 1, 0.36, 1];
const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6, ease: easeOut } }) };
const scaleIn = { hidden: { opacity: 0, scale: 0.9 }, visible: (i) => ({ opacity: 1, scale: 1, transition: { delay: i * 0.12, duration: 0.5, ease: easeOut } }) };

const services = [
  { icon: Bath, name: "شستشو", desc: "شستشوی کامل با شامپوی مخصوص", price: "۲۵۰,۰۰۰", color: "from-sky-200 to-blue-100", pets: "سگ، گربه، خرگوش" },
  { icon: Scissors, name: "اصلاح با قیچی", desc: "ارایش و اصلاح مو با قیچی متناسب با نژاد", price: "۴۰۰,۰۰۰", color: "from-rose-200 to-pink-100", pets: "سگ، گربه" },
  { icon: Scissors, name: "اصلاح با ماشین", desc: "اصلاح سریع و یکدست با ماشین", price: "۳۰۰,۰۰۰", color: "from-amber-200 to-orange-100", pets: "سگ، گربه" },
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
    <div className="min-h-screen overflow-hidden" dir="rtl" itemScope itemType="https://schema.org/WebPage">
      <header>
      {/* Hero */}
      <section className="hero-section" itemProp="mainContentOfPage">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="deco-blob deco-blob-1 animate-float-slow" />
          <div className="deco-blob deco-blob-2 animate-float" />
        </div>
        <div className="relative max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, ease: easeOut }} className="text-center md:text-right order-2 md:order-1">
            <div className="inline-flex items-center gap-2 clay-card px-4 py-2 mb-4">
              <PawPrint className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">مرکز تخصصی گرومینگ حیوانات</span>
            </div>
            <h1 className="hero-title mb-4">
              <span>صالح </span>
              <span className="text-gradient-primary">گرومر</span>
            </h1>
            <p className="hero-subtitle mb-6">اصلاح، شستشو و مراقبت تخصصی سگ، گربه و خرگوهای شما با بهترین کیفیت</p>
            <div className="flex flex-col sm:flex-row items-center gap-3 justify-center md:justify-start">
              <Link to="/auth?returnTo=/booking" className="clay-btn bg-primary text-primary-foreground px-7 py-3.5 text-lg font-bold inline-flex items-center gap-2">
                <CalendarCheck className="w-5 h-5" /> رزرو نوبت <ChevronLeft className="w-4 h-4" />
              </Link>
              <Link to="/portfolio" className="clay-card-hover px-7 py-3.5 text-lg font-bold inline-flex items-center gap-2 bg-card">نمونه کارها</Link>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2, ease: easeOut }} className="flex justify-center order-1 md:order-2">
            <div className="relative">
              <div className="w-64 h-64 md:w-80 md:h-80 rounded-[2rem] overflow-hidden clay-card p-2">
                <div className="w-full h-full rounded-[1.5rem] overflow-hidden relative">
                  <img src="/hero.jpg" alt="گرومینگ حیوانات خانگی - صالح گرومر" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; e.target.nextElementSibling?.classList.remove('hidden'); }} />
                  <div className="absolute inset-0 hidden"><img src="/hero-illustration.svg" alt="صالح گرومر" className="w-full h-full object-contain" /></div>
                </div>
              </div>
              <motion.div animate={{ y: [-5, 5, -5] }} transition={{ duration: 3, repeat: Infinity }} className="absolute -bottom-3 -left-3 w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-50 clay-blob flex items-center justify-center"><PawPrint className="w-7 h-7 text-primary" /></motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="page-section px-4">
        <div className="page-container">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={scaleIn} custom={0} className="clay-card px-6 py-4 grid grid-stats text-center">
            {[{ n: "۵۰۰+", l: "مشتری راضی" }, { n: "۳۰۰۰+", l: "خدمات" }, { n: "۵⭐", l: "امتیاز" }, { n: "۷+", l: "سال تجربه" }].map((s) => <div key={s.l}><div className="text-xl md:text-2xl font-black text-primary">{s.n}</div><div className="text-xs text-muted-foreground">{s.l}</div></div>)}
          </motion.div>
        </div>
      </section>

      <article itemProp="mainContentOfPage">
      {/* Services */}
      <section id="services" className="page-section-lg px-4" itemProp="about">
        <div className="page-container">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-black mb-2">خدمات <span className="text-gradient-primary">ما</span></h2>
            <p className="text-muted-foreground">مجموعه‌ای کامل از خدمات گرومینگ</p>
          </motion.div>
          <div className="grid-services">
            {services.map((s, i) => (
              <motion.div key={s.name} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={scaleIn} custom={i} className="clay-card-hover service-card">
                <div className={`service-card-icon bg-gradient-to-br ${s.color}`}><s.icon className="w-6 h-6 text-foreground/80" /></div>
                <h3 className="font-bold mb-1">{s.name}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed mb-1">{s.desc}</p>
                <div className="text-xs text-primary/70 mb-1">🐾 {s.pets}</div>
                <div className="service-card-price">{s.price} تومان</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="page-section-lg px-4 bg-gradient-to-b from-transparent via-secondary/30 to-transparent">
        <div className="page-container">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-black mb-2">چرا <span className="text-gradient-primary">صالح گرومر</span>؟</h2>
          </motion.div>
          <div className="grid-features">{features.map((f, i) => (
            <motion.div key={f.title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={scaleIn} custom={i} className="clay-card p-5 text-center">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-3"><f.icon className="w-7 h-7 text-primary" /></div>
              <h3 className="font-bold mb-1">{f.title}</h3>
              <p className="text-muted-foreground text-sm">{f.desc}</p>
            </motion.div>
          ))}</div>
        </div>
      </section>

      {/* Portfolio Preview */}
      {portfolio && portfolio.length > 0 && <section className="page-section-lg px-4">
        <div className="page-container">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-black mb-2">نمونه <span className="text-gradient-primary">کارها</span></h2>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {portfolio.slice(0, 8).map((item, i) => (
              <motion.div key={item._id} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={scaleIn} custom={i} className="clay-card-hover overflow-hidden group">
                <div className="aspect-square overflow-hidden bg-gradient-to-br from-primary/5 to-amber-50"><img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" /></div>
                <div className="p-2.5"><h3 className="font-bold text-sm">{item.title}</h3>{item.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{item.description}</p>}</div>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-6"><Link to="/portfolio" className="clay-card-hover px-6 py-2.5 font-bold inline-flex items-center gap-2 bg-card text-sm">مشاهده همه <ChevronLeft className="w-4 h-4" /></Link></div>
        </div>
      </section>}

      </article>

      {/* CTA */}
      <section className="page-section-lg px-4" itemProp="potentialAction" itemScope itemType="https://schema.org/ReserveAction">
        <div className="page-container max-w-3xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={scaleIn} custom={0} className="clay-card cta-card p-8 md:p-12 text-center relative">
            <div className="relative z-10">
              <PawPrint className="w-10 h-10 text-primary mx-auto mb-3" />
              <h2 className="text-2xl md:text-3xl font-black mb-3">آماده‌اید نوبت رزرو کنید؟</h2>
              <p className="text-muted-foreground mb-6 max-w-lg mx-auto">همین الان با چند کلیک ساده، نوبت گرومینگ حیوان خانگی‌تان را رزرو کنید</p>
              <Link to="/auth?returnTo=/booking" className="clay-btn bg-primary text-primary-foreground px-8 py-3.5 text-lg font-bold inline-flex items-center gap-2">
                <CalendarCheck className="w-5 h-5" /> رزرو نوبت آنلاین <ChevronLeft className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      </header>

      <main>
      {/* Footer */}
      <footer className="footer px-4" itemProp="footer">
        <div className="page-container">
          <div className="footer-grid">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-amber-500 clay-blob flex items-center justify-center"><PawPrint className="w-4 h-4 text-white" /></div>
                <span className="text-lg font-black">صالح گرومر</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">مرکز تخصصی گرومینگ و اصلاح سگ، گربه و خرگوش</p>
            </div>
            <div>
              <h3 className="font-bold mb-3 text-sm">دسترسی سریع</h3>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                <li><a href="#services" className="hover:text-primary transition-colors">خدمات</a></li>
                <li><Link to="/portfolio" className="hover:text-primary transition-colors">نمونه کارها</Link></li>
                <li><Link to="/contact" className="hover:text-primary transition-colors">تماس با ما</Link></li>
                <li><Link to="/auth?returnTo=/booking" className="hover:text-primary transition-colors">رزرو نوبت</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-3 text-sm">ارتباط با ما</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><Phone className="w-4 h-4 text-primary" /> ۰۹۱۲-XXX-XXXX</li>
                <li className="flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" /> تهران</li>
              </ul>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-border/50 text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} صالح گرومر. تمامی حقوق محفوظ است.
          </div>
        </div>
      </footer>
      </main>
    </div>
  );
}
