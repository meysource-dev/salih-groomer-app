import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import {
  CalendarCheck, Clock, LogOut, Plus, PawPrint,
  CheckCircle, XCircle, Hourglass,
} from "lucide-react";
import { Link, useNavigate } from "react-router";

const statusMap: Record<string, { label: string; color: string; icon: React.FC<{ className?: string }> }> = {
  pending: { label: "در انتظار تأیید", color: "text-amber-600 bg-amber-50", icon: Hourglass },
  confirmed: { label: "تأیید شده", color: "text-emerald-600 bg-emerald-50", icon: CheckCircle },
  cancelled: { label: "لغو شده", color: "text-red-500 bg-red-50", icon: XCircle },
  completed: { label: "انجام شده", color: "text-blue-600 bg-blue-50", icon: CheckCircle },
};

function toPersianDigits(num: number | string): string {
  const pd = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return String(num).replace(/\d/g, (d) => pd[parseInt(d)]).replace(/-/g, "/");
}

const persianWeekdays = ["یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه", "شنبه"];

function formatDateTime(dateStr: string, time: string) {
  const d = new Date(dateStr);
  const wd = persianWeekdays[d.getDay()];
  const parts = dateStr.split("-");
  return `${wd} ${toPersianDigits(parts[2])}/${toPersianDigits(parts[1])}/${toPersianDigits(parts[0])} ساعت ${toPersianDigits(time)}`;
}

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const appointments = useQuery(api.appointments.listByUser);

  const handleSignOut = async () => { await signOut(); navigate("/"); };

  const upcoming = appointments?.filter((a) => a.status !== "cancelled" && a.status !== "completed");
  const past = appointments?.filter((a) => a.status === "cancelled" || a.status === "completed");

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <div className="mx-auto max-w-4xl px-4 py-10">
        <motion.header initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/15 to-amber-100/50 clay-blob flex items-center justify-center">
                <PawPrint className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-2xl font-black">سلام{user?.name ? ` ${user.name}` : ""} 👋</h1>
            </div>
            <p className="text-sm text-muted-foreground mr-13">مدیریت نوبت‌های گرومینگ حیوان خانگی شما</p>
          </div>
          <div className="flex gap-3">
            <Link to="/booking" className="clay-btn bg-primary text-primary-foreground px-5 py-2.5 text-sm font-bold inline-flex items-center gap-2">
              <Plus className="w-4 h-4" /> رزرو نوبت جدید
            </Link>
            <button onClick={handleSignOut} className="clay-card px-4 py-2.5 text-sm font-bold inline-flex items-center gap-2 hover:bg-secondary/50 transition-colors">
              <LogOut className="w-4 h-4" /> خروج
            </button>
          </div>
        </motion.header>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "پیش رو", value: upcoming?.length ?? 0, color: "from-primary/10 to-primary/5" },
            { label: "انجام شده", value: past?.filter((a) => a.status === "completed").length ?? 0, color: "from-emerald-100 to-emerald-50" },
            { label: "لغو شده", value: past?.filter((a) => a.status === "cancelled").length ?? 0, color: "from-red-100 to-red-50" },
          ].map((s) => (
            <div key={s.label} className="clay-card p-4 text-center">
              <div className={`w-10 h-10 mx-auto rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-2`}>
                <CalendarCheck className="w-5 h-5 text-primary" />
              </div>
              <div className="text-2xl font-black">{toPersianDigits(s.value)}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Upcoming */}
        <section className="mb-10">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><CalendarCheck className="w-5 h-5 text-primary" /> نوبت‌های پیش رو</h2>
          {!upcoming || upcoming.length === 0 ? (
            <div className="clay-card p-8 text-center">
              <CalendarCheck className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground mb-4">هنوز نوبتی ثبت نکرده‌اید</p>
              <Link to="/booking" className="clay-btn bg-primary text-primary-foreground px-6 py-2.5 text-sm font-bold inline-flex items-center gap-2">
                <Plus className="w-4 h-4" /> رزرو نوبت
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {upcoming.map((apt, i) => {
                const status = statusMap[apt.status];
                const StatusIcon = status.icon;
                return (
                  <motion.div key={apt._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="clay-card p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-amber-50 flex items-center justify-center shrink-0">
                          <PawPrint className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-bold">{apt.service?.name ?? "خدمت"}</h3>
                          <div className="text-sm text-muted-foreground mt-1">{apt.petName} • {formatDateTime(apt.date, apt.time)}</div>
                          <div className="text-sm font-bold text-primary mt-1">{toPersianDigits(apt.price.toLocaleString())} تومان</div>
                        </div>
                      </div>
                      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ${status.color}`}>
                        <StatusIcon className="w-3.5 h-3.5" /> {status.label}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>

        {/* Past */}
        {past && past.length > 0 && (
          <section>
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Clock className="w-5 h-5 text-muted-foreground" /> نوبت‌های قبلی</h2>
            <div className="space-y-3">
              {past.map((apt, i) => {
                const status = statusMap[apt.status];
                const StatusIcon = status.icon;
                return (
                  <motion.div key={apt._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="clay-card p-5 opacity-70">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                          <PawPrint className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div>
                          <h3 className="font-bold text-sm">{apt.service?.name ?? "خدمت"}</h3>
                          <div className="text-xs text-muted-foreground mt-1">{apt.petName} • {formatDateTime(apt.date, apt.time)}</div>
                        </div>
                      </div>
                      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ${status.color}`}>
                        <StatusIcon className="w-3.5 h-3.5" /> {status.label}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
