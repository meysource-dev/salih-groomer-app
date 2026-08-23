import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Check, ArrowRight, Loader2, AlertCircle, PawPrint, ChevronRight, ChevronLeft, Phone } from "lucide-react";
import { Link } from "react-router";

const PERSIAN_MONTHS = ["فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور", "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"];
const PERSIAN_WEEKDAYS = ["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه"];

function toPersianDigits(num) {
  const pd = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return String(num).replace(/\d/g, (d) => pd[parseInt(d)]);
}

function gregorianToJalali(gy, gm, gd) {
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  let jy = gy <= 1600 ? 0 : 979;
  const jump = gy > 1600 ? Math.floor(gy / 4) - Math.floor(gy / 100) + Math.floor(gy / 400) : 0;
  let jp = gy <= 1600 ? 0 : jump;
  let days = Math.floor(365.25 * (jy + 979)) - Math.floor(365.25 * 979) + Math.floor(30.0001 * 18) + gd + (gm > 2 ? 1 : 0) + g_d_m[gm - 1] - 80;
  jy = 0;
  let y = -1595 + 33 * Math.floor(days / 12053);
  days %= 12053;
  y += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) { y += Math.floor((days - 1) / 365); days = (days - 1) % 365; }
  let m, d;
  if (days < 186) { m = 1 + Math.floor(days / 31); d = 1 + (days % 31); }
  else { m = 7 + Math.floor((days - 186) / 30); d = 1 + ((days - 186) % 30); }
  void jp;
  return [y, m, d];
}

function jalaliToGregorian(jy, jm, jd) {
  jy += 1595;
  const days = -355668 + 365 * jy + Math.floor(jy / 33) * 8 + Math.floor(((jy % 33) + 3) / 4) + jd + (jm < 7 ? (jm - 1) * 31 : (jm - 7) * 30 + 186);
  const gy = 400 * Math.floor(days / 146097) + 100 * Math.floor(((days % 146097) + 100) / 146100) + Math.floor(((days % 146100) + 100) / 36525) + Math.floor(days % 146100 % 36525 / 366);
  const dayOfYear = days - (365 * Math.floor(days / 146097) + Math.floor(((days % 146097) + 100) / 146100) + Math.floor(((days % 146100) + 100) / 36525) + Math.floor(((days % 146100) % 36525 + 366) / 366) * (365 < (days % 146097) - Math.floor(((days % 146100) + 100) / 146100) + Math.floor(((days % 146100) + 100) / 36525) * 365 + Math.floor(((days % 146100) % 36525 + 366) / 366) * 365 ? 366 : 365));
  const gm = dayOfYear < 182 ? 1 + Math.floor(dayOfYear / 31) : 7 + Math.floor((dayOfYear - 186) / 30);
  const gd = dayOfYear - (gm < 7 ? (gm - 1) * 31 : (gm - 7) * 30 + 186) + 1;
  return [gy, gm, gd];
}

function validateIranianPhone(phone) {
  return /^09\d{9}$/.test(phone);
}

export default function Booking() {
  const services = useQuery(api.services.list);
  const createAppointment = useMutation(api.appointments.create);
  const now = new Date();
  const todayJ = gregorianToJalali(now.getFullYear(), now.getMonth() + 1, now.getDate());
  const [viewYear, setViewYear] = useState(todayJ[0]);
  const [viewMonth, setViewMonth] = useState(todayJ[1]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedServiceId, setSelectedServiceId] = useState(null);
  const [petType, setPetType] = useState("dog");
  const [petName, setPetName] = useState("");
  const [petBreed, setPetBreed] = useState("");
  const [petWeight, setPetWeight] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const { daysInMonth, startDay } = useMemo(() => {
    const [gy] = jalaliToGregorian(viewYear, viewMonth, 15);
    const firstDow = new Date(gy, viewMonth - 1, 1);
    const lastDay = new Date(gy, viewMonth, 0);
    return { daysInMonth: lastDay.getDate(), startDay: (firstDow.getDay() + 1) % 7 };
  }, [viewYear, viewMonth]);

  const calendarDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < startDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);
    return days;
  }, [daysInMonth, startDay]);

  const selectedServiceData = services?.find((s) => s._id === selectedServiceId);
  const isPast = (day) => viewYear < todayJ[0] || (viewYear === todayJ[0] && viewMonth < todayJ[1]) || (viewYear === todayJ[0] && viewMonth === todayJ[1] && day <= todayJ[2]);

  const handleDateClick = (day) => {
    if (isPast(day)) return;
    const [gy, gm, gd] = jalaliToGregorian(viewYear, viewMonth, day);
    setSelectedDate(`${gy}-${String(gm).padStart(2, "0")}-${String(gd).padStart(2, "0")}`);
    setSelectedTime(null);
  };

  const handlePhoneChange = (value) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    setPhone(digits);
    setPhoneError(digits.length === 11 && !validateIranianPhone(digits) ? "شماره موبایل نامعتبر است (مثال: ۰۹۱۲۱۲۳۴۵۶۷)" : "");
  };

  const handleSubmit = async () => {
    if (!selectedServiceId || !selectedDate || !selectedTime || !petName || !selectedServiceData) return;
    if (!phone || !validateIranianPhone(phone)) { setPhoneError("شماره موبایل نامعتبر است (باید ۱۱ رقم و با ۰۹ شروع شود)"); return; }
    setIsSubmitting(true); setError(null);
    try {
      await createAppointment({ serviceId: selectedServiceId, date: selectedDate, time: selectedTime, petName, petType, petBreed: petBreed || undefined, petWeight: petWeight ? Number(petWeight) : undefined, phone, notes: notes || undefined, price: selectedServiceData.price });
      setSuccess(true);
    } catch (err) { setError(err instanceof Error ? err.message : "خطا در ثبت نوبت"); } finally { setIsSubmitting(false); }
  };

  if (success) return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20 bg-background" dir="rtl">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="clay-card p-10 text-center max-w-md w-full">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-emerald-100 to-emerald-50 clay-blob flex items-center justify-center mb-6"><Check className="w-10 h-10 text-emerald-600" /></div>
        <h2 className="text-2xl font-black mb-3">نوبت ثبت شد! 🎉</h2>
        <p className="text-muted-foreground mb-6">نوبت {petName} عزیز ثبت شد. با شماره {toPersianDigits(phone)} تماس گرفته می‌شود.</p>
        <Link to="/dashboard" className="clay-btn bg-primary text-primary-foreground px-6 py-3 font-bold inline-flex items-center justify-center gap-2 w-full">مشاهده نوبت‌ها <ArrowRight className="w-4 h-4" /></Link>
      </motion.div>
    </div>
  );

  if (!services) return <div className="min-h-screen flex items-center justify-center bg-background" dir="rtl"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
  const canSubmit = selectedServiceId && petName && validateIranianPhone(phone) && !isSubmitting;

  return (
    <div className="min-h-screen bg-background px-4 py-10" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-4"><ArrowRight className="w-4 h-4" /> بازگشت</Link>
          <h1 className="text-3xl md:text-4xl font-black">رزرو <span className="bg-gradient-to-l from-primary to-amber-500 bg-clip-text text-transparent">نوبت</span></h1>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="clay-card p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => { if (viewMonth === 1) { setViewMonth(12); setViewYear(viewYear - 1); } else setViewMonth(viewMonth - 1); setSelectedDate(null); setSelectedTime(null); }} className="w-10 h-10 rounded-xl clay-card flex items-center justify-center hover:bg-secondary/50 transition-colors"><ChevronRight className="w-5 h-5" /></button>
            <h2 className="text-xl font-black">{PERSIAN_MONTHS[viewMonth - 1]} {toPersianDigits(viewYear)}</h2>
            <button onClick={() => { if (viewMonth === 12) { setViewMonth(1); setViewYear(viewYear + 1); } else setViewMonth(viewMonth + 1); setSelectedDate(null); setSelectedTime(null); }} className="w-10 h-10 rounded-xl clay-card flex items-center justify-center hover:bg-secondary/50 transition-colors"><ChevronLeft className="w-5 h-5" /></button>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-2">{PERSIAN_WEEKDAYS.map((d) => <div key={d} className="text-center text-xs font-bold text-muted-foreground py-2">{d}</div>)}</div>
          <div className="grid grid-cols-7 gap-1">{calendarDays.map((day, i) => {
            if (day === null) return <div key={`e-${i}`} className="aspect-square" />;
            const past = isPast(day);
            const [gy, gm, gd] = jalaliToGregorian(viewYear, viewMonth, day);
            const dateStr = `${gy}-${String(gm).padStart(2, "0")}-${String(gd).padStart(2, "0")}`;
            return <button key={`d-${i}`} onClick={() => !past && handleDateClick(day)} disabled={past} className={`aspect-square rounded-xl flex flex-col items-center justify-center text-sm font-bold transition-all ${past ? "text-muted-foreground/30 cursor-not-allowed bg-muted/30" : selectedDate === dateStr ? "bg-primary text-primary-foreground shadow-md scale-105" : "hover:bg-secondary/60 hover:scale-105"}`}>{toPersianDigits(day)}{past && viewYear === todayJ[0] && viewMonth === todayJ[1] && day === todayJ[2] && <span className="text-[8px] text-muted-foreground/40 mt-0.5">امروز</span>}</button>;
          })}</div>
        </motion.div>

        <AnimatePresence>{selectedDate && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="clay-card p-6 mb-8 overflow-hidden">
          <div className="flex items-center gap-2 mb-4"><Calendar className="w-5 h-5 text-primary" /><h3 className="font-bold">ساعت‌های قابل رزرو</h3></div>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">{["09:00","09:30","10:00","10:30","11:00","11:30","12:00","12:30","14:00","14:30","15:00","15:30","16:00","16:30","17:00","17:30"].map((time) => <button key={time} onClick={() => setSelectedTime(time)} className={`py-2.5 px-3 rounded-xl text-sm font-bold transition-all ${selectedTime === time ? "bg-primary text-primary-foreground shadow-md" : "clay-card hover:bg-secondary/50"}`}>{toPersianDigits(time)}</button>)}</div>
        </motion.div>}</AnimatePresence>

        {selectedDate && selectedTime && <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="clay-card p-6 mb-8">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2"><PawPrint className="w-5 h-5 text-primary" /> فرم رزرو</h3>
          <div className="space-y-5">
            <div><label className="block text-sm font-bold mb-2">نوع خدمت *</label><div className="grid grid-cols-1 sm:grid-cols-2 gap-2">{services.map((s) => <button key={s._id} onClick={() => setSelectedServiceId(s._id)} className={`clay-card p-3 text-right transition-all ${selectedServiceId === s._id ? "ring-2 ring-primary" : "hover:bg-secondary/50"}`}><div className="font-bold text-sm">{s.name}</div><div className="text-sm font-black text-primary mt-1">{toPersianDigits(s.price.toLocaleString())} تومان</div></button>)}</div></div>
            <div><label className="block text-sm font-bold mb-2">نوع حیوان *</label><div className="flex gap-2">{[["dog","🐕 سگ"],["cat","🐈 گربه"],["rabbit","🐇 خرگوش"]].map(([v, l]) => <button key={v} onClick={() => setPetType(v)} className={`clay-card flex-1 py-3 text-center text-sm font-bold transition-all ${petType === v ? "ring-2 ring-primary" : "hover:bg-secondary/50"}`}>{l}</button>)}</div></div>
            <div><label className="block text-sm font-bold mb-2">نام حیوان *</label><input type="text" value={petName} onChange={(e) => setPetName(e.target.value)} placeholder="مثلاً پپی" className="clay-input w-full px-4 py-3 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary" /></div>
            <div><label className="block text-sm font-bold mb-2">شماره موبایل *</label><div className="relative"><Phone className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" /><input type="tel" value={phone} onChange={(e) => handlePhoneChange(e.target.value)} placeholder="09121234567" dir="ltr" maxLength={11} className={`clay-input w-full pr-9 pl-4 py-3 text-sm border focus:outline-none focus:ring-2 focus:ring-primary ${phoneError ? "border-red-400" : ""}`} /></div>{phoneError && <p className="text-red-500 text-xs mt-1">{phoneError}</p>}{!phoneError && phone.length === 11 && validateIranianPhone(phone) && <p className="text-emerald-600 text-xs mt-1 flex items-center gap-1"><Check className="w-3 h-3" /> شماره معتبر است</p>}</div>
            <div><label className="block text-sm font-bold mb-2">نژاد (اختیاری)</label><input type="text" value={petBreed} onChange={(e) => setPetBreed(e.target.value)} placeholder="مثلاً پomeranian" className="clay-input w-full px-4 py-3 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary" /></div>
            <div><label className="block text-sm font-bold mb-2">وزن (اختیاری)</label><input type="number" value={petWeight} onChange={(e) => setPetWeight(e.target.value)} placeholder="کیلوگرم" min="0" max="100" className="clay-input w-full px-4 py-3 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary" /></div>
            <div><label className="block text-sm font-bold mb-2">توضیحات</label><textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="ویژگی‌های اخلاقی پت خود را بنویسید..." className="clay-input w-full px-4 py-3 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary resize-none" /></div>
            {selectedServiceData && <div className="clay-card p-4 bg-gradient-to-l from-primary/5 to-amber-50/50"><div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">هزینه تقریبی</span><span className="text-xl font-black text-primary">{toPersianDigits(selectedServiceData.price.toLocaleString())} تومان</span></div></div>}
          </div>
          {error && <div className="clay-card p-4 mt-4 flex items-center gap-2 text-red-600 bg-red-50/50"><AlertCircle className="w-4 h-4 shrink-0" /><span className="text-sm">{error}</span></div>}
          <div className="flex justify-start mt-6"><button onClick={handleSubmit} disabled={!canSubmit} className="clay-btn bg-primary text-primary-foreground px-10 py-3 font-bold inline-flex items-center gap-2 disabled:opacity-40">{isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> در حال ثبت...</> : <>ثبت نوبت <Check className="w-4 h-4" /></>}</button></div>
        </motion.div>}
      </div>
    </div>
  );
}
