import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { motion } from "framer-motion";
import { CalendarCheck, Clock, XCircle, CheckCircle, Loader2, PawPrint } from "lucide-react";
import { Link } from "react-router";

function toPersianDigits(num) {
  const pd = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return String(num).replace(/\d/g, (d) => pd[parseInt(d)]);
}

const statusMap = {
  pending: { label: "در انتظار", color: "text-amber-600 bg-amber-50" },
  confirmed: { label: "تأیید شده", color: "text-emerald-600 bg-emerald-50" },
  cancelled: { label: "لغو شده", color: "text-red-500 bg-red-50" },
  completed: { label: "انجام شده", color: "text-blue-600 bg-blue-50" },
};

const petTypeLabels = { dog: "🐕 سگ", cat: "🐈 گربه", rabbit: "🐇 خرگوش" };

export default function Dashboard() {
  const appointments = useQuery(api.appointments.listByUser);
  const cancel = useMutation(api.appointments.cancel);

  if (!appointments) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="min-h-screen bg-background px-4 py-10" dir="rtl">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-black flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/15 to-amber-100/50 clay-blob flex items-center justify-center">
              <CalendarCheck className="w-5 h-5 text-primary" />
            </div>
            نوبت‌های من
          </h1>
          <Link to="/booking" className="clay-btn bg-primary text-primary-foreground px-4 py-2 text-sm font-bold">
            + رزرو جدید
          </Link>
        </div>

        {appointments.length === 0 ? (
          <div className="clay-card p-10 text-center">
            <PawPrint className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">هنوز نوبتی ثبت نکرده‌اید</p>
            <Link to="/booking" className="clay-btn bg-primary text-primary-foreground px-6 py-2.5 text-sm font-bold inline-flex items-center gap-2">
              <CalendarCheck className="w-4 h-4" /> رزرو نوبت
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {appointments.map((apt, i) => {
              const status = statusMap[apt.status];
              return (
                <motion.div key={apt._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="clay-card p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="font-bold text-sm">
                        {apt.services?.map((s) => s.name).join(" + ") || "خدمت"}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {apt.date} ساعت {toPersianDigits(apt.time)} • {petTypeLabels[apt.petType] || apt.petType}
                        {apt.petName && ` • ${apt.petName}`}
                      </div>
                      {apt.ownerName && <div className="text-xs text-primary mt-0.5">👤 {apt.ownerName}</div>}
                      <div className="text-sm font-bold text-primary mt-1">{toPersianDigits((apt.totalPrice || 0).toLocaleString())} تومان</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-lg text-xs font-bold ${status.color}`}>{status.label}</span>
                      {apt.status === "pending" && (
                        <button onClick={() => cancel({ id: apt._id })} className="text-red-500 hover:text-red-700 text-xs font-bold inline-flex items-center gap-1 transition-colors">
                          <XCircle className="w-3 h-3" /> لغو
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
