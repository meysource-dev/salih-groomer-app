import { motion } from "framer-motion";
import {
  Scissors,
  Bath,
  Sparkles,
  Heart,
  Clock,
  Star,
  Phone,
  MapPin,
  PawPrint,
  Crown,
  CalendarCheck,
  Shield,
  ChevronLeft,
} from "lucide-react";
import { Link } from "react-router";

const easeOut = [0.22, 1, 0.36, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: easeOut },
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: i * 0.12, duration: 0.5, ease: easeOut },
  }),
};

const services = [
  {
    icon: Bath,
    name: "شستشوی کامل",
    desc: "شستشو با شامپوی مخصوص + خشک کردن + شانه‌زنی",
    price: "۳۵۰,۰۰۰",
    duration: "۶۰ دقیقه",
    color: "from-blue-200 to-sky-100",
    shadow: "shadow-blue-200/50",
  },
  {
    icon: Scissors,
    name: "ارایش و پیرایش",
    desc: "اصلاح و ارایش مو متناسب با نژاد و سلیقه شما",
    price: "۵۰۰,۰۰۰",
    duration: "۹۰ دقیقه",
    color: "from-rose-200 to-pink-100",
    shadow: "shadow-rose-200/50",
  },
  {
    icon: Sparkles,
    name: "شستشو و اصلاح",
    desc: "شستشو همراه با اصلاح سر و صورت و ناخن",
    price: "۴۵۰,۰۰۰",
    duration: "۷۵ دقیقه",
    color: "from-amber-200 to-orange-100",
    shadow: "shadow-amber-200/50",
  },
  {
    icon: PawPrint,
    name: "پدیکور و مانیکور",
    desc: "کوتاهی ناخن، تمیز کردن و مراقبت از پنجه‌ها",
    price: "۱۵۰,۰۰۰",
    duration: "۳۰ دقیقه",
    color: "from-emerald-200 to-teal-100",
    shadow: "shadow-emerald-200/50",
  },
  {
    icon: Crown,
    name: "پکیج VIP",
    desc: "شستشو + اصلاح + پدیکور + تمیز کردن + عطر مخصوص",
    price: "۸۰۰,۰۰۰",
    duration: "۱۲۰ دقیقه",
    color: "from-violet-200 to-purple-100",
    shadow: "shadow-violet-200/50",
  },
  {
    icon: Heart,
    name: "تمیز کردن گوش و چشم",
    desc: "پاکسازی تخصصی گوش‌ها و اطراف چشم",
    price: "۱۰۰,۰۰۰",
    duration: "۲۰ دقیقه",
    color: "from-pink-200 to-rose-100",
    shadow: "shadow-pink-200/50",
  },
];

const features = [
  {
    icon: Shield,
    title: "تیم متخصص",
    desc: "گرومرهای حرفه‌ای با سال‌ها تجربه در اصلاح و مراقبت حیوانات",
  },
  {
    icon: Heart,
    title: "محیط آرام",
    desc: "فضایی آرام و دوستانه برای حس راحتی حیوان خانگی شما",
  },
  {
    icon: Clock,
    title: "رزرو آنلاین",
    desc: "رزرو نوبت در کمتر از ۱ دقیقه بدون نیاز به تماس تلفنی",
  },
  {
    icon: Star,
    title: "رضایت ۱۰۰٪",
    desc: "بیش از ۵۰۰ مشتری راضی از خدمات حرفه‌ای ما",
  },
];

const testimonials = [
  {
    name: "مریم احمدی",
    pet: "سگ نژاد شیتزو",
    text: "خیلی راضیم! سگم بعد از اصلاح خیلی خوشگل شده و محیط گرومینگ واقعاً حرفه‌ایه.",
    stars: 5,
  },
  {
    name: "علی رضایی",
    pet: "گربه پرشین",
    text: "بهترین گرومینگی که رفتم. تیم صالح خیلی مهربون با حیوانات رفتار می‌کنن.",
    stars: 5,
  },
  {
    name: "سارا محمدی",
    pet: "سگ نژاد پودل",
    text: "رزرو آنلاین خیلی راحت بود. کیفیت کار عالی و قیمت‌ها مناسبه.",
    stars: 5,
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen overflow-hidden" dir="rtl">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center px-4 py-20 overflow-hidden">
        {/* Background decorative blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-gradient-to-br from-orange-200/40 to-rose-200/30 rounded-full blur-3xl animate-float-slow" />
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-gradient-to-tr from-sky-200/30 to-blue-200/20 rounded-full blur-3xl animate-float" />
          <div className="absolute top-1/3 left-1/4 w-48 h-48 bg-gradient-to-br from-amber-100/40 to-yellow-100/30 rounded-full blur-2xl animate-float-slow" />
          <div className="absolute bottom-1/4 right-1/5 w-32 h-32 bg-gradient-to-br from-violet-200/30 to-pink-200/20 rounded-full blur-2xl animate-float" />
        </div>

        <div className="relative max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: easeOut }}
            className="inline-flex items-center gap-2 clay-card px-5 py-2.5 mb-8"
          >
            <PawPrint className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">
              مرکز تخصصی گرومینگ حیوانات خانگی
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: easeOut }}
            className="text-5xl md:text-7xl lg:text-8xl font-black leading-tight tracking-tight mb-6"
          >
            <span className="block">صالح</span>
            <span className="block bg-gradient-to-l from-primary via-rose-500 to-amber-500 bg-clip-text text-transparent">
              گرومر
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25, ease: easeOut }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            اصلاح، شستشو و مراقبت تخصصی سگ و گربه شما با بهترین کیفیت و
            محیطی آرام و حرفه‌ای. همین الان نوبت رزرو کنید!
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              to="/auth?returnTo=/booking"
              className="clay-btn bg-primary text-primary-foreground px-8 py-4 text-lg font-bold inline-flex items-center gap-2"
            >
              <CalendarCheck className="w-5 h-5" />
              رزرو نوبت آنلاین
              <ChevronLeft className="w-4 h-4" />
            </Link>
            <a
              href="#services"
              className="clay-card-hover px-8 py-4 text-lg font-bold inline-flex items-center gap-2 bg-card"
            >
              مشاهده خدمات
            </a>
          </motion.div>

          {/* Floating pet icons */}
          <div className="absolute top-10 left-10 md:left-20 opacity-20">
            <motion.div
              animate={{ y: [-5, 5, -5] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <PawPrint className="w-16 h-16 text-primary rotate-[-15deg]" />
            </motion.div>
          </div>
          <div className="absolute bottom-10 right-10 md:right-20 opacity-20">
            <motion.div
              animate={{ y: [5, -5, 5] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <PawPrint className="w-12 h-12 text-amber-400 rotate-[20deg]" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="relative py-6 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={scaleIn}
            custom={0}
            className="clay-card px-8 py-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center"
          >
            {[
              { num: "۵۰۰+", label: "مشتری راضی" },
              { num: "۳۰۰۰+", label: "خدمات انجام شده" },
              { num: "۵⭐", label: "امتیاز میانگین" },
              { num: "۷+", label: "سال تجربه" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl md:text-3xl font-black text-primary">
                  {stat.num}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
            className="text-center mb-14"
          >
            <h2 className="text-3xl md:text-5xl font-black mb-4">
              خدمات{" "}
              <span className="bg-gradient-to-l from-primary to-rose-500 bg-clip-text text-transparent">
                ما
              </span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              مجموعه‌ای کامل از خدمات گرومینگ برای سگ و گربه عزیز شما
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, i) => (
              <motion.div
                key={service.name}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={scaleIn}
                custom={i}
                className="clay-card-hover p-6 flex flex-col"
              >
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-4 shadow-lg ${service.shadow}`}
                >
                  <service.icon className="w-7 h-7 text-foreground/80" />
                </div>
                <h3 className="text-xl font-bold mb-2">{service.name}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4 flex-1">
                  {service.desc}
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                  <div>
                    <div className="text-lg font-black text-primary">
                      {service.price} تومان
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" />
                    {service.duration}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-transparent via-secondary/30 to-transparent">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
            className="text-center mb-14"
          >
            <h2 className="text-3xl md:text-5xl font-black mb-4">
              چرا{" "}
              <span className="bg-gradient-to-l from-primary to-amber-500 bg-clip-text text-transparent">
                صالح گرومر
              </span>
              ؟
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              ما بهترین تجربه را برای حیوان خانگی و صاحبش فراهم می‌کنیم
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feat, i) => (
              <motion.div
                key={feat.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={scaleIn}
                custom={i}
                className="clay-card p-6 text-center"
              >
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-4">
                  <feat.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">{feat.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feat.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
            className="text-center mb-14"
          >
            <h2 className="text-3xl md:text-5xl font-black mb-4">
              نظرات{" "}
              <span className="bg-gradient-to-l from-amber-500 to-primary bg-clip-text text-transparent">
                مشتریان
              </span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={scaleIn}
                custom={i}
                className="clay-card p-6"
              >
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: t.stars }).map((_, si) => (
                    <Star
                      key={si}
                      className="w-4 h-4 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                  «{t.text}»
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 clay-blob flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">
                      {t.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm font-bold">{t.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {t.pet}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={scaleIn}
            custom={0}
            className="clay-card p-10 md:p-14 text-center bg-gradient-to-br from-primary/5 via-card to-rose-50/50 relative overflow-hidden"
          >
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/5 rounded-full blur-2xl" />
            <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-rose-100/30 rounded-full blur-2xl" />
            <div className="relative">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-primary/15 to-primary/5 clay-blob flex items-center justify-center mb-6">
                <PawPrint className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-3xl md:text-4xl font-black mb-4">
                آماده‌اید نوبت رزرو کنید؟
              </h2>
              <p className="text-muted-foreground text-lg mb-8 max-w-lg mx-auto">
                همین الان با چند کلیک ساده، نوبت گرومینگ حیوان خانگی‌تان را
                رزرو کنید
              </p>
              <Link
                to="/auth?returnTo=/booking"
                className="clay-btn bg-primary text-primary-foreground px-10 py-4 text-lg font-bold inline-flex items-center gap-2"
              >
                <CalendarCheck className="w-5 h-5" />
                رزرو نوبت آنلاین
                <ChevronLeft className="w-4 h-4" />
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
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-rose-500 clay-blob flex items-center justify-center">
                  <PawPrint className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-black">صالح گرومر</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                مرکز تخصصی گرومینگ، اصلاح و پیرایش سگ و گربه با بیش از ۷ سال
                تجربه
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-4">دسترسی سریع</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#services" className="hover:text-primary transition-colors">
                    خدمات
                  </a>
                </li>
                <li>
                  <Link to="/auth?returnTo=/booking" className="hover:text-primary transition-colors">
                    رزرو نوبت
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">ارتباط با ما</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-primary" />
                  ۰۲۱-۱۲۳۴۵۶۷۸
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  تهران، خیابان ولیعصر
                </li>
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
