import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { motion } from "framer-motion";
import { PawPrint, ArrowRight } from "lucide-react";
import { Link } from "react-router";

const easeOut = [0.22, 1, 0.36, 1];
const scaleIn = { hidden: { opacity: 0, scale: 0.9 }, visible: (i) => ({ opacity: 1, scale: 1, transition: { delay: i * 0.08, duration: 0.5, ease: easeOut } }) };

export default function Portfolio() {
  const items = useQuery(api.portfolio.listPublished);

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <section className="py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"><div className="absolute -top-20 right-1/3 w-64 h-64 bg-gradient-to-br from-amber-200/30 to-orange-100/20 rounded-full blur-3xl" /></div>
        <div className="max-w-6xl mx-auto text-center relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ease: easeOut }}>
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary/15 to-amber-100/50 clay-blob flex items-center justify-center mb-6"><PawPrint className="w-8 h-8 text-primary" /></div>
            <h1 className="text-4xl md:text-5xl font-black mb-4">نمونه <span className="bg-gradient-to-l from-primary to-amber-500 bg-clip-text text-transparent">کارها</span></h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">نمونه‌هایی از خدمات گرومینگ انجام شده توسط صالح گرومر</p>
          </motion.div>
        </div>
      </section>

      <section className="pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          {!items ? <div className="flex justify-center py-20"><div className="animate-pulse text-muted-foreground">در حال بارگذاری...</div></div>
            : items.length === 0 ? <div className="text-center py-20"><PawPrint className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" /><p className="text-muted-foreground text-lg">هنوز نمونه کاری اضافه نشده است</p><p className="text-sm text-muted-foreground/60 mt-2">به زودی نمونه کارهای ما اینجا نمایش داده می‌شود</p></div>
            : <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {items.map((item, i) => <motion.div key={item._id} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={scaleIn} custom={i} className="clay-card-hover overflow-hidden group cursor-pointer">
                <div className="aspect-square overflow-hidden bg-gradient-to-br from-primary/5 to-amber-50"><img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" /></div>
                <div className="p-4"><h3 className="font-bold">{item.title}</h3>{item.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{item.description}</p>}
                  <div className="flex items-center gap-3 mt-2">{item.petType && <span className="text-xs px-2 py-0.5 rounded-lg bg-primary/10 text-primary font-medium">{item.petType === "dog" ? "🐕 سگ" : item.petType === "cat" ? "🐈 گربه" : item.petType}</span>}{item.serviceType && <span className="text-xs px-2 py-0.5 rounded-lg bg-amber-100 text-amber-700 font-medium">{item.serviceType}</span>}</div>
                </div>
              </motion.div>)}
            </div>}
        </div>
      </section>

      <section className="py-12 px-4 border-t border-border/50"><div className="max-w-2xl mx-auto text-center"><p className="text-muted-foreground mb-4">می‌خواهید حیوان خانگی شما هم اینجا باشد؟</p><Link to="/auth?returnTo=/booking" className="clay-btn bg-primary text-primary-foreground px-8 py-3 font-bold inline-flex items-center gap-2"><PawPrint className="w-4 h-4" /> رزرو نوبت <ArrowRight className="w-4 h-4" /></Link></div></section>
    </div>
  );
}
