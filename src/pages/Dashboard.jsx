import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import { CalendarCheck, Clock, LogOut, Plus, PawPrint, CheckCircle, XCircle, Hourglass } from "lucide-react";
import { Link, useNavigate } from "react-router";

const statusMap = {
  pending: { label: "\u062f\u0631 \u0627\u0646\u062a\u0638\u0627\u0631 \u062a\u0623\u06cc\u06cc\u062f", color: "text-amber-600 bg-amber-50", icon: Hourglass },
  confirmed: { label: "\u062a\u0623\u06cc\u06cc\u062f \u0634\u062f\u0647", color: "text-emerald-600 bg-emerald-50", icon: CheckCircle },
  cancelled: { label: "\u0644\u063a\u0648 \u0634\u062f\u0647", color: "text-red-500 bg-red-50", icon: XCircle },
  completed: { label: "\u0627\u0646\u062c\u0627\u0645 \u0634\u062f\u0647", color: "text-blue-600 bg-blue-50", icon: CheckCircle },
};

function toPersianDigits(num) {
  const pd = ["\u06f0", "\u06f1", "\u06f2", "\u06f3", "\u06f4", "\u06f5", "\u06f6", "\u06f7", "\u06f8", "\u06f9"];
  return String(num).replace(/\d/g, (d) => pd[parseInt(d)]).replace(/-/g, "/");
}

const persianWeekdays = ["\u06cc\u06a9\u0634\u0646\u0628\u0647", "\u062f\u0648\u0634\u0646\u0628\u0647", "\u0633\u0647\u200c\u0634\u0646\u0628\u0647", "\u0686\u0647\u0627\u0631\u0634\u0646\u0628\u0647", "\u067e\u0646\u062c\u0634\u0646\u0628\u0647", "\u062c\u0645\u0639\u0647", "\u0634\u0646\u0628\u0647"];

function formatDateTime(dateStr, time) {
  const d = new Date(dateStr);
  const wd = persianWeekdays[d.getDay()];
  const parts = dateStr.split("-");
  return `${wd} ${toPersianDigits(parts[2])}/${toPersianDigits(parts[1])}/${toPersianDigits(parts[0])} \u0633\u0627\u0639\u062a ${toPersianDigits(time)}`;
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
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/15 to-amber-100/50 clay-blob flex items-center justify-center"><PawPrint className="w-5 h-5 text-primary" /></div>
              <h1 className="text-2xl font-black">{"\u0633\u0644\u0627\u0645"}{user?.name ? ` ${user.name}` : ""} {"\ud83d\udc4b"}</h1>
            </div>
            <p className="text-sm text-muted-foreground mr-13">{"\u0645\u062f\u06cc\u0631\u06cc\u062a \u0646\u0648\u0628\u062a\u200c\u0647\u062a\u0646\u06af\u06cc \u06af\u0631\u0648\u0645\u06cc\u0646\u06af \u0634\u0645\u0627"}</p>
          </div>
          <div className="flex gap-3">
            <Link to="/booking" className="clay-btn bg-primary text-primary-foreground px-5 py-2.5 text-sm font-bold inline-flex items-center gap-2"><Plus className="w-4 h-4" /> {"\u0631\u0632\u0631\u0648 \u0646\u0648\u0628\u062a \u062c\u062f\u06cc\u062f"}</Link>
            <button onClick={handleSignOut} className="clay-card px-4 py-2.5 text-sm font-bold inline-flex items-center gap-2 hover:bg-secondary/50 transition-colors"><LogOut className="w-4 h-4" /> {"\u062e\u0631\u0648\u062c"}</button>
          </div>
        </motion.header>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "\u067e\u06cc\u0634 \u0631\u0648", value: upcoming?.length ?? 0, color: "from-primary/10 to-primary/5" },
            { label: "\u0627\u0646\u062c\u0627\u0645 \u0634\u062f\u0647", value: past?.filter((a) => a.status === "completed").length ?? 0, color: "from-emerald-100 to-emerald-50" },
            { label: "\u0644\u063a\u0648 \u0634\u062f\u0647", value: past?.filter((a) => a.status === "cancelled").length ?? 0, color: "from-red-100 to-red-50" },
          ].map((s) => (
            <div key={s.label} className="clay-card p-4 text-center">
              <div className={`w-10 h-10 mx-auto rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-2`}><CalendarCheck className="w-5 h-5 text-primary" /></div>
              <div className="text-2xl font-black">{toPersianDigits(s.value)}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
            </div>
          ))}
        </motion.div>

        <section className="mb-10">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><CalendarCheck className="w-5 h-5 text-primary" /> {"\u0646\u0648\u0628\u062a\u200c\u0647\u062a\u0646\u06af\u06cc \u067e\u06cc\u0634 \u0631\u0648"}</h2>
          {!upcoming || upcoming.length === 0 ? (
            <div className="clay-card p-8 text-center">
              <CalendarCheck className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground mb-4">{"\u0647\u0646\u0648\u0632 \u0646\u0648\u0628\u062a\u06cc \u062b\u0628\u062a \u0646\u06a9\u0631\u062f\u0647\u200c\u0627\u06cc\u062f"}</p>
              <Link to="/booking" className="clay-btn bg-primary text-primary-foreground px-6 py-2.5 text-sm font-bold inline-flex items-center gap-2"><Plus className="w-4 h-4" /> {"\u0631\u0632\u0631\u0648 \u0646\u0648\u0628\u062a"}</Link>
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
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-amber-50 flex items-center justify-center shrink-0"><PawPrint className="w-6 h-6 text-primary" /></div>
                        <div>
                          <h3 className="font-bold">{apt.services?.map((s) => s.name).join(" + ") || "\u062e\u062f\u0645\u062a"}</h3>
                          <div className="text-sm text-muted-foreground mt-1">{apt.petName} \u2022 {formatDateTime(apt.date, apt.time)}</div>
                          <div className="text-sm font-bold text-primary mt-1">{toPersianDigits(apt.totalPrice.toLocaleString())} {"\u062a\u0648\u0645\u0627\u0646"}</div>
                        </div>
                      </div>
                      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ${status.color}`}><StatusIcon className="w-3.5 h-3.5" /> {status.label}</div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>

        {past && past.length > 0 && (
          <section>
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Clock className="w-5 h-5 text-muted-foreground" /> {"\u0646\u0648\u0628\u062a\u200c\u0647\u062a\u0646\u06af\u06cc \u0642\u0628\u0644\u06cc"}</h2>
            <div className="space-y-3">
              {past.map((apt, i) => {
                const status = statusMap[apt.status];
                const StatusIcon = status.icon;
                return (
                  <motion.div key={apt._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="clay-card p-5 opacity-70">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0"><PawPrint className="w-5 h-5 text-muted-foreground" /></div>
                        <div>
                          <h3 className="font-bold text-sm">{apt.services?.map((s) => s.name).join(" + ") || "\u062e\u062f\u0645\u062a"}</h3>
                          <div className="text-xs text-muted-foreground mt-1">{apt.petName} \u2022 {formatDateTime(apt.date, apt.time)}</div>
                        </div>
                      </div>
                      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ${status.color}`}><StatusIcon className="w-3.5 h-3.5" /> {status.label}</div>
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
