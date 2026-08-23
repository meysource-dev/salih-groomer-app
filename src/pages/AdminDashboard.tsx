import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, LogOut, CalendarCheck, Clock, CheckCircle, XCircle, Hourglass, PawPrint, Loader2 } from "lucide-react";
import { useNavigate } from "react-router";

const statusMap: Record<string, { label: string; color: string; icon: React.FC<{ className?: string }> }> = {
  pending: { label: "در انتظار", color: "text-amber-600 bg-amber-50", icon: Hourglass },
  confirmed: { label: "تأیید شده", color: "text-emerald-600 bg-emerald-50", icon: CheckCircle },
  cancelled: { label: "لغو شده", color: "text-red-500 bg-red-50", icon: XCircle },
  completed: { label: "انجام شده", color: "text-blue-600 bg-blue-50", icon: CheckCircle },
};

function toPersianDigits(num: number | string): string {
  const pd = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return String(num).replace(/\d/g, (d) => pd[parseInt(d)]).replace(/-/g, "/");
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const appointments = useQuery(api.appointments.listAll);
  const updateStatus = useMutation(api.appointments.updateStatus);
  const [adminName, setAdminName] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    const name = localStorage.getItem("admin_name");
    if (!token) { navigate("/admin/login"); return; }
    setAdminName(name || "Admin");
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_name");
    navigate("/admin/login");
  };

  if (!appointments) return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;

  const pending = appointments.filter((a) => a.status === "pending");
  const confirmed = appointments.filter((a) => a.status === "confirmed");
  const totalRevenue = appointments.filter((a) => a.status !== "cancelled").reduce((sum, a) => sum + a.price, 0);

  const handleStatusChange = async (id: string, status: string) => {
    await updateStatus({ id: id as any, status: status as any });
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <motion.header initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/15 to-amber-100/50 clay-blob flex items-center justify-center"><Shield className="w-5 h-5 text-primary" /></div>
            <div>
              <h1 className="text-2xl font-black">پنل مدیریت</h1>
              <p className="text-sm text-muted-foreground">خوش آمدید {adminName}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="clay-card px-4 py-2.5 text-sm font-bold inline-flex items-center gap-2 hover:bg-secondary/50 transition-colors"><LogOut className="w-4 h-4" /> خروج</button>
        </motion.header>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "در انتظار", value: pending.length, color: "from-amber-100 to-amber-50" },
            { label: "تأیید شده", value: confirmed.length, color: "from-emerald-100 to-emerald-50" },
            { label: "کل نوبت‌ها", value: appointments.length, color: "from-primary/10 to-primary/5" },
            { label: "درآمد", value: `${toPersianDigits(totalRevenue.toLocaleString())} ت`, color: "from-green-100 to-green-50" },
          ].map((s) => (
            <div key={s.label} className="clay-card p-4 text-center">
              <div className={`w-10 h-10 mx-auto rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-2`}><CalendarCheck className="w-5 h-5 text-primary" /></div>
              <div className="text-xl font-black">{s.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Appointments */}
        <h2 className="text-lg font-bold mb-4">همه نوبت‌ها</h2>
        {appointments.length === 0 ? (
          <div className="clay-card p-8 text-center text-muted-foreground">هنوز نوبتی ثبت نشده</div>
        ) : (
          <div className="space-y-3">
            {appointments.map((apt, i) => {
              const status = statusMap[apt.status];
              const StatusIcon = status.icon;
              return (
                <motion.div key={apt._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="clay-card p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-amber-50 flex items-center justify-center shrink-0"><PawPrint className="w-5 h-5 text-primary" /></div>
                      <div>
                        <div className="font-bold text-sm">{apt.service?.name ?? "خدمت"} — {apt.petName}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {apt.date} ساعت {toPersianDigits(apt.time)} • {apt.petType === "dog" ? "🐕 سگ" : apt.petType === "cat" ? "🐈 گربه" : "🐇 خرگوش"}
                          {apt.petBreed && ` • ${apt.petBreed}`}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">📞 {toPersianDigits(apt.phone)} • {toPersianDigits(apt.price.toLocaleString())} تومان</div>
                        {apt.notes && <div className="text-xs text-muted-foreground mt-1 italic">📝 {apt.notes}</div>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${status.color}`}><StatusIcon className="w-3 h-3" />{status.label}</div>
                      <select value={apt.status} onChange={(e) => handleStatusChange(apt._id, e.target.value)} className="text-xs border border-border rounded-lg px-2 py-1 bg-background">
                        <option value="pending">در انتظار</option>
                        <option value="confirmed">تأیید</option>
                        <option value="completed">انجام شده</option>
                        <option value="cancelled">لغو</option>
                      </select>
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
