import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, LogOut, CalendarCheck, CheckCircle, XCircle, Hourglass, PawPrint, Loader2, DollarSign, Image, Plus, Trash2, Settings, X, Upload, BarChart3, Filter, CalendarDays, ChevronDown, Clock } from "lucide-react";
import { useNavigate } from "react-router";

const SALON_PERCENTAGE = 50;

const statusMap = {
  pending: { label: "در انتظار", color: "text-amber-600 bg-amber-50", icon: Hourglass },
  confirmed: { label: "تأیید شده", color: "text-emerald-600 bg-emerald-50", icon: CheckCircle },
  cancelled: { label: "لغو شده", color: "text-red-500 bg-red-50", icon: XCircle },
  completed: { label: "انجام شده", color: "text-blue-600 bg-blue-50", icon: CheckCircle },
};

const petTypeLabels = { dog: "🐕 سگ", cat: "🐈 گربه", rabbit: "🐇 خرگوش" };
const jalaliDayNames = ["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه"];

function toPersianDigits(num) {
  const pd = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return String(num).replace(/\d/g, (d) => pd[parseInt(d)]);
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [filterPetType, setFilterPetType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [incomePeriod, setIncomePeriod] = useState("all");
  const [expandedDay, setExpandedDay] = useState(null);

  const appointments = useQuery(api.appointments.listAll, {
    petType: filterPetType || undefined,
    status: filterStatus || undefined,
  });
  const updateStatus = useMutation(api.appointments.updateStatus);
  const services = useQuery(api.services.listAll);
  const updatePrice = useMutation(api.services.updatePrice);
  const portfolio = useQuery(api.portfolio.listAll);
  const createPortfolio = useMutation(api.portfolio.create);
  const removePortfolio = useMutation(api.portfolio.remove);
  const generateUploadUrl = useMutation(api.portfolio.generateUploadUrl);
  const workingDays = useQuery(api.workingDays.listAll);
  const updateDay = useMutation(api.workingDays.updateDay);

  const [adminName, setAdminName] = useState("");
  const [activeTab, setActiveTab] = useState("appointments");
  const [editingPrice, setEditingPrice] = useState(null);
  const [newPrice, setNewPrice] = useState("");
  const [dayEdits, setDayEdits] = useState({});

  // Portfolio modal state
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  const [portfolioTitle, setPortfolioTitle] = useState("");
  const [portfolioDesc, setPortfolioDesc] = useState("");
  const [portfolioPetType, setPortfolioPetType] = useState("");
  const [portfolioFile, setPortfolioFile] = useState(null);
  const [portfolioPreview, setPortfolioPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef(null);

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

  // Income: only from completed appointments
  const incomeStats = useMemo(() => {
    if (!appointments) return { gross: 0, net: 0, count: 0 };
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

    let filtered = appointments.filter((a) => a.status === "completed");

    if (incomePeriod === "today") {
      filtered = filtered.filter((a) => a.date === today);
    } else if (incomePeriod === "month") {
      const monthPrefix = today.slice(0, 7);
      filtered = filtered.filter((a) => a.date?.startsWith(monthPrefix));
    } else if (incomePeriod === "3months") {
      filtered = filtered.filter((a) => {
        if (!a.date) return false;
        const d = new Date(a.date);
        const diffDays = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
        return diffDays <= 90;
      });
    } else if (incomePeriod === "6months") {
      filtered = filtered.filter((a) => {
        if (!a.date) return false;
        const d = new Date(a.date);
        const diffDays = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
        return diffDays <= 180;
      });
    }

    const gross = filtered.reduce((sum, a) => sum + (a.totalPrice || 0), 0);
    return { gross, net: Math.round(gross * (SALON_PERCENTAGE / 100)), count: filtered.length };
  }, [appointments, incomePeriod]);

  const handlePriceSave = async (serviceId) => {
    const price = Number(newPrice);
    if (isNaN(price) || price < 0) return;
    await updatePrice({ id: serviceId, price });
    setEditingPrice(null);
    setNewPrice("");
  };

  const handleDayToggle = async (day) => {
    const edit = dayEdits[day.dayOfWeek] || {};
    await updateDay({
      dayOfWeek: day.dayOfWeek,
      isActive: !day.isActive,
      startTime: edit.startTime || day.startTime || "09:00",
      endTime: edit.endTime || day.endTime || "18:00",
    });
  };

  const handleDayTimeSave = async (dayOfWeek) => {
    const edit = dayEdits[dayOfWeek] || {};
    const day = workingDays?.find((d) => d.dayOfWeek === dayOfWeek);
    await updateDay({
      dayOfWeek,
      isActive: day?.isActive ?? true,
      startTime: edit.startTime || day?.startTime || "09:00",
      endTime: edit.endTime || day?.endTime || "18:00",
    });
  };

  const updateDayEdit = (dayOfWeek, field, value) => {
    setDayEdits((prev) => ({
      ...prev,
      [dayOfWeek]: { ...(prev[dayOfWeek] || {}), [field]: value },
    }));
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setUploadError("فقط تصویر اصلی باشد");
      return;
    }
    setUploadError("");
    setPortfolioFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPortfolioPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmitPortfolio = async () => {
    if (!portfolioFile || !portfolioTitle) return;
    setIsUploading(true);
    setUploadError("");
    try {
      const uploadUrl = await generateUploadUrl();
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": portfolioFile.type },
        body: portfolioFile,
      });
      if (!result.ok) throw new Error("خطا در آپلود");
      const { storageId } = await result.json();
      await createPortfolio({
        title: portfolioTitle,
        description: portfolioDesc || undefined,
        imageUrl: storageId,
        petType: portfolioPetType || undefined,
        isPublished: true,
      });
      setShowPortfolioModal(false);
      setPortfolioTitle("");
      setPortfolioDesc("");
      setPortfolioPetType("");
      setPortfolioFile(null);
      setPortfolioPreview(null);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "خطا در آپلود");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeletePortfolio = async (id) => {
    if (confirm("آیا از حذف این نمونه مطمئن هستید؟")) {
      await removePortfolio({ id });
    }
  };

  if (!appointments || !services) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
  }

  const pending = appointments.filter((a) => a.status === "pending");
  const confirmed = appointments.filter((a) => a.status === "confirmed");

  const tabs = [
    { id: "appointments", label: "نوبت‌ها", icon: CalendarCheck },
    { id: "income", label: "درآمد گرومر", icon: BarChart3 },
    { id: "services", label: "قیمت خدمات", icon: DollarSign },
    { id: "portfolio", label: "نمونه کار", icon: Image },
    { id: "workingDays", label: "روزهای کاری", icon: CalendarDays },
  ];

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <div className="mx-auto max-w-6xl px-4 py-10">
        {/* Header */}
        <motion.header initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/15 to-amber-100/50 clay-blob flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-black">پنل مدیریت</h1>
              <p className="text-sm text-muted-foreground">خوش آمدید {adminName}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="clay-card px-4 py-2.5 text-sm font-bold inline-flex items-center gap-2 hover:bg-secondary/50 transition-colors">
            <LogOut className="w-4 h-4" /> خروج
          </button>
        </motion.header>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "در انتظار", value: pending.length, color: "from-amber-100 to-amber-50" },
            { label: "تأیید شده", value: confirmed.length, color: "from-emerald-100 to-emerald-50" },
            { label: "کل نوبت‌ها", value: appointments.length, color: "from-primary/10 to-primary/5" },
            { label: "درآمد خالص", value: `${toPersianDigits(incomeStats.net.toLocaleString())} ت`, color: "from-green-100 to-green-50" },
          ].map((s) => (
            <div key={s.label} className="clay-card p-4 text-center">
              <div className={`w-10 h-10 mx-auto rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-2`}>
                <CalendarCheck className="w-5 h-5 text-primary" />
              </div>
              <div className="text-xl font-black">{s.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${activeTab === tab.id ? "bg-primary text-primary-foreground shadow-md" : "clay-card hover:bg-secondary/50"}`}>
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ========== Appointments Tab ========== */}
        {activeTab === "appointments" && (
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <h2 className="text-lg font-bold flex items-center gap-2"><Filter className="w-4 h-4" /> فیلتر نوبت‌ها</h2>
              <select value={filterPetType} onChange={(e) => setFilterPetType(e.target.value)} className="clay-card px-3 py-2 text-sm font-bold border border-border rounded-xl bg-background">
                <option value="">همه حیوانات</option>
                <option value="dog">🐕 سگ</option>
                <option value="cat">🐈 گربه</option>
                <option value="rabbit">🐇 خرگوش</option>
              </select>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="clay-card px-3 py-2 text-sm font-bold border border-border rounded-xl bg-background">
                <option value="">همه وضعیت‌ها</option>
                <option value="pending">در انتظار</option>
                <option value="confirmed">تأیید شده</option>
                <option value="completed">انجام شده</option>
                <option value="cancelled">لغو شده</option>
              </select>
              {(filterPetType || filterStatus) && (
                <button onClick={() => { setFilterPetType(""); setFilterStatus(""); }} className="text-xs text-red-500 font-bold">پاک کردن فیلتر</button>
              )}
            </div>

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
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-amber-50 flex items-center justify-center shrink-0">
                            <PawPrint className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <div className="font-bold text-sm">
                              {apt.ownerName && <span className="text-primary">👤 {apt.ownerName}</span>}
                              {" — "}
                              {apt.services?.map((s) => s.name).join(" + ") || "خدمت"} — {apt.petName}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {apt.date} ساعت {toPersianDigits(apt.time)} • {petTypeLabels[apt.petType] || apt.petType}
                              {apt.petBreed && ` • ${apt.petBreed}`}
                            </div>
                            <div className="text-xs text-muted-foreground mt-0.5">
                              📞 {toPersianDigits(apt.phone)} • {toPersianDigits((apt.totalPrice || 0).toLocaleString())} تومان
                            </div>
                            {apt.notes && <div className="text-xs text-muted-foreground mt-1 italic">📝 {apt.notes}</div>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${status.color}`}>
                            <StatusIcon className="w-3 h-3" />
                            {status.label}
                          </div>
                          <select value={apt.status} onChange={(e) => updateStatus({ id: apt._id, status: e.target.value })} className="text-xs border border-border rounded-lg px-2 py-1 bg-background">
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
        )}

        {/* ========== Income Tab ========== */}
        {activeTab === "income" && (
          <div>
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><BarChart3 className="w-5 h-5" /> درآمد گرومر</h2>
            <p className="text-sm text-muted-foreground mb-4">فقط نوبت‌های انجام شده در درآمد لحاظ می‌شوند</p>

            <div className="flex gap-2 mb-6 flex-wrap">
              {[["all", "کل"], ["today", "امروز"], ["month", "این ماه"], ["3months", "۳ ماه اخیر"], ["6months", "۶ ماه اخیر"]].map(([key, label]) => (
                <button key={key} onClick={() => setIncomePeriod(key)} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${incomePeriod === key ? "bg-primary text-primary-foreground shadow-md" : "clay-card hover:bg-secondary/50"}`}>
                  {label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="clay-card p-6 text-center">
                <div className="text-sm text-muted-foreground mb-1">درآمد کل (ناخالص)</div>
                <div className="text-2xl font-black text-primary">{toPersianDigits(incomeStats.gross.toLocaleString())} تومان</div>
                <div className="text-xs text-muted-foreground mt-1">{incomeStats.count} نوبت انجام شده</div>
              </div>
              <div className="clay-card p-6 text-center">
                <div className="text-sm text-muted-foreground mb-1">درآمد خالص گرومر (پس از کسورات)</div>
                <div className="text-2xl font-black text-emerald-600">{toPersianDigits(incomeStats.net.toLocaleString())} تومان</div>
                <div className="text-xs text-muted-foreground mt-1">%{SALON_PERCENTAGE} سهم سالن کسر شده</div>
              </div>
            </div>
          </div>
        )}

        {/* ========== Services Tab ========== */}
        {activeTab === "services" && (
          <div>
            <h2 className="text-lg font-bold mb-4">مدیریت قیمت خدمات</h2>
            <div className="space-y-3">
              {services.map((svc) => (
                <div key={svc._id} className="clay-card p-5 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="font-bold">{svc.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{svc.nameEn} • {svc.duration} دقیقه • {svc.petTypes.map((p) => petTypeLabels[p] || p).join("، ")}</div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {editingPrice === svc._id ? (
                      <div className="flex items-center gap-2">
                        <input type="number" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} placeholder={String(svc.price)} className="clay-input w-32 px-3 py-2 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary" autoFocus />
                        <button onClick={() => handlePriceSave(svc._id)} className="clay-btn bg-emerald-600 text-white px-3 py-2 text-xs font-bold">ذخیره</button>
                        <button onClick={() => setEditingPrice(null)} className="clay-card px-3 py-2 text-xs font-bold">لغو</button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="text-lg font-black text-primary">{toPersianDigits(svc.price.toLocaleString())} تومان</div>
                        <button onClick={() => { setEditingPrice(svc._id); setNewPrice(String(svc.price)); }} className="clay-card px-3 py-2 text-xs font-bold inline-flex items-center gap-1 hover:bg-secondary/50">
                          <DollarSign className="w-3 h-3" /> تغییر قیمت
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========== Portfolio Tab ========== */}
        {activeTab === "portfolio" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">نمونه کار</h2>
              <button onClick={() => setShowPortfolioModal(true)} className="clay-btn bg-primary text-primary-foreground px-5 py-2.5 text-sm font-bold inline-flex items-center gap-2">
                <Plus className="w-4 h-4" /> افزودن نمونه کار
              </button>
            </div>

            {!portfolio ? (
              <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
            ) : portfolio.length === 0 ? (
              <div className="clay-card p-8 text-center text-muted-foreground">هنوز نمونه کاری ثبت نشده</div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {portfolio.map((item) => (
                  <div key={item._id} className="clay-card overflow-hidden">
                    <div className="aspect-square overflow-hidden bg-gradient-to-br from-primary/5 to-amber-50">
                      <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = "none"; }} />
                    </div>
                    <div className="p-3">
                      <div className="font-bold text-sm">{item.title}</div>
                      {item.description && <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{item.description}</div>}
                      <div className="flex items-center justify-between mt-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${item.isPublished ? "bg-emerald-50 text-emerald-600" : "bg-muted text-muted-foreground"}`}>
                          {item.isPublished ? "منتشر" : "پیش‌نویس"}
                        </span>
                        <button onClick={() => handleDeletePortfolio(item._id)} className="text-red-400 hover:text-red-600 transition-colors p-1">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========== Working Days Tab ========== */}
        {activeTab === "workingDays" && (
          <div>
            <h2 className="text-lg font-bold mb-2 flex items-center gap-2"><CalendarDays className="w-5 h-5" /> روزهای کاری</h2>
            <p className="text-sm text-muted-foreground mb-6">روزهای فعال را انتخاب کنید و ساعت شروع و پایان شیفت را تعیین کنید. سیستم به صورت خودکار شیفت‌ها را بر اساس ۳ ساعت گرومینگ و ۳۰ دقیقه استراحت محاسبه می‌کند.</p>

            <div className="space-y-3">
              {workingDays && workingDays.map((day) => {
                const isExpanded = expandedDay === day.dayOfWeek;
                const edit = dayEdits[day.dayOfWeek] || {};
                const start = edit.startTime ?? day.startTime ?? "09:00";
                const end = edit.endTime ?? day.endTime ?? "18:00";

                return (
                  <div key={day.dayOfWeek} className={`clay-card overflow-hidden transition-all ${day.isActive ? "" : "opacity-50"}`}>
                    {/* Day header - clickable */}
                    <button onClick={() => setExpandedDay(isExpanded ? null : day.dayOfWeek)}
                      className="w-full flex items-center justify-between p-4 text-right">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${day.isActive ? "bg-primary/15" : "bg-muted/50"}`}>
                          {day.isActive ? <CheckCircle className="w-5 h-5 text-primary" /> : <XCircle className="w-5 h-5 text-muted-foreground" />}
                        </div>
                        <div className="text-left">
                          <div className="font-bold">{jalaliDayNames[day.dayOfWeek]}</div>
                          {day.isActive && (
                            <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {toPersianDigits(start)} تا {toPersianDigits(end)}
                              {day.generatedSlots?.length > 0 && <span className="text-primary">• {toPersianDigits(day.generatedSlots.length)} شیفت</span>}
                            </div>
                          )}
                          {!day.isActive && <div className="text-xs text-red-400 mt-0.5">تعطیل</div>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={(e) => { e.stopPropagation(); handleDayToggle(day); }}
                          className={`relative w-12 h-6 rounded-full transition-colors ${day.isActive ? "bg-primary" : "bg-muted"}`}>
                          <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${day.isActive ? "right-0.5" : "right-[26px]"}`} />
                        </button>
                        <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                      </div>
                    </button>

                    {/* Expanded: time config + generated slots */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                          <div className="px-4 pb-4 border-t border-border/30">
                            <div className="flex flex-wrap items-center gap-4 mt-3 mb-3">
                              <div className="flex items-center gap-2">
                                <label className="text-xs font-bold">شروع شیفت از ساعت:</label>
                                <input type="time" value={start} onChange={(e) => updateDayEdit(day.dayOfWeek, "startTime", e.target.value)}
                                  className="clay-input px-3 py-1.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                              </div>
                              <div className="flex items-center gap-2">
                                <label className="text-xs font-bold">تا ساعت:</label>
                                <input type="time" value={end} onChange={(e) => updateDayEdit(day.dayOfWeek, "endTime", e.target.value)}
                                  className="clay-input px-3 py-1.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                              </div>
                              <button onClick={() => handleDayTimeSave(day.dayOfWeek)} className="clay-btn bg-emerald-600 text-white px-4 py-1.5 text-xs font-bold">
                                ذخیره ساعت
                              </button>
                            </div>

                            {/* Generated time slots */}
                            {day.generatedSlots && day.generatedSlots.length > 0 && (
                              <div className="mt-2">
                                <div className="text-xs font-bold text-muted-foreground mb-2">شیفت‌های ایجاد شده (هر شیفت ۳ ساعت + ۳۰ دقیقه استراحت):</div>
                                <div className="flex flex-wrap gap-2">
                                  {day.generatedSlots.map((slot, i) => {
                                    const [h, m] = slot.split(":").map(Number);
                                    const endMin = h * 60 + m + 180;
                                    const endH = Math.floor(endMin / 60);
                                    const endM = endMin % 60;
                                    const endStr = `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`;
                                    return (
                                      <div key={slot} className="clay-card px-3 py-2 text-xs font-bold text-primary bg-primary/5 rounded-lg">
                                        🕐 {toPersianDigits(slot)} — {toPersianDigits(endStr)}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {day.isActive && day.generatedSlots?.length === 0 && (
                              <p className="text-xs text-amber-600 mt-2">ساعت انتخابی برای ایجاد شیفت ۳ ساعته کافی نیست</p>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ========== Portfolio Modal ========== */}
      <AnimatePresence>
        {showPortfolioModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4" dir="rtl">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => !isUploading && setShowPortfolioModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-lg clay-card p-6 z-10">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-black flex items-center gap-2">
                  <Image className="w-5 h-5 text-primary" /> افزودن نمونه کار
                </h3>
                <button onClick={() => !isUploading && setShowPortfolioModal(false)} className="w-8 h-8 rounded-lg hover:bg-secondary/50 flex items-center justify-center transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-4">
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                {portfolioPreview ? (
                  <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-primary/5 to-amber-50">
                    <img src={portfolioPreview} alt="Preview" className="w-full h-48 object-cover" />
                    <button onClick={() => { setPortfolioFile(null); setPortfolioPreview(null); if (fileInputRef.current) fileInputRef.current.value = ""; }} className="absolute top-2 left-2 w-8 h-8 rounded-lg bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button onClick={() => fileInputRef.current?.click()} className="w-full h-48 rounded-xl border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center gap-3 transition-colors hover:bg-primary/5">
                    <Upload className="w-10 h-10 text-muted-foreground" />
                    <div className="text-sm text-muted-foreground">عکس را برای انتخاب کلیک کنید</div>
                    <div className="text-xs text-muted-foreground">JPG, PNG, WebP</div>
                  </button>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-bold mb-1">عنوان *</label>
                  <input type="text" value={portfolioTitle} onChange={(e) => setPortfolioTitle(e.target.value)} placeholder="مثلاً اصلاح نمونه" className="clay-input w-full px-4 py-2.5 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">توضیحات</label>
                  <textarea value={portfolioDesc} onChange={(e) => setPortfolioDesc(e.target.value)} rows={2} placeholder="توصف نمونه" className="clay-input w-full px-4 py-2.5 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">نوع حیوان</label>
                  <select value={portfolioPetType} onChange={(e) => setPortfolioPetType(e.target.value)} className="clay-input w-full px-4 py-2.5 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary">
                    <option value="">همه</option>
                    <option value="dog">🐕 سگ</option>
                    <option value="cat">🐈 گربه</option>
                    <option value="rabbit">🐇 خرگوش</option>
                  </select>
                </div>
              </div>

              {uploadError && (
                <div className="mt-3 text-sm text-red-500 bg-red-50 p-3 rounded-xl">{uploadError}</div>
              )}

              <div className="flex justify-start gap-3 mt-5">
                <button onClick={handleSubmitPortfolio} disabled={!portfolioTitle || !portfolioFile || isUploading} className="clay-btn bg-primary text-primary-foreground px-6 py-2.5 text-sm font-bold inline-flex items-center gap-2 disabled:opacity-40">
                  {isUploading ? <><Loader2 className="w-4 h-4 animate-spin" /> در حال آپلود...</> : <><Upload className="w-4 h-4" /> آپلود و اضافه</>}
                </button>
                <button onClick={() => setShowPortfolioModal(false)} disabled={isUploading} className="clay-card px-5 py-2.5 text-sm font-bold hover:bg-secondary/50 transition-colors">
                  لغو
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
