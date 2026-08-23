import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Check, ArrowRight, ArrowLeft, Loader2, AlertCircle, PawPrint, ChevronRight, ChevronLeft, Phone } from "lucide-react";
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
  let days =
    365 * (gy - 621) +
    Math.floor((gy - 621 + 3) / 4) -
    Math.floor((gy - 621 + 99) / 100) +
    Math.floor((gy - 621 + 399) / 400) +
    gd +
    g_d_m[gm - 1] +
    (gm > 2 ? (gy % 4 === 0 && (gy % 100 !== 0 || gy % 400 === 0) ? 1 : 0) : -1);
  jy = 979 + Math.floor(days / 12053);
  days %= 12053;
  jy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) { jy += Math.floor((days - 1) / 365); days = (days - 1) % 365; }
  let jm, jd;
  if (days < 186) { jm = 1 + Math.floor(days / 31); jd = 1 + (days % 31); }
  else { jm = 7 + Math.floor((days - 186) / 30); jd = 1 + ((days - 186) % 30); }
  return [jy, jm, jd];
}

function jalaliToGregorian(jy, jm, jd) {
  jy += 1595;
  let days =
    -355668 +
    365 * jy +
    Math.floor(jy / 33) * 8 +
    Math.floor(((jy % 33) + 3) / 4) +
    jd +
    (jm < 7 ? (jm - 1) * 31 : (jm - 7) * 30 + 186);
  const gy = 400 * Math.floor(days / 146097) + 100 * Math.floor(((days % 146097) + 100) / 146100) + Math.floor(((days % 146100) + 100) / 36525) + Math.floor(((days % 146100) % 36525 + 366) / 366);
  const dayOfYear = days - (365 * Math.floor(days / 146097) + Math.floor(((days % 146097) + 100) / 146100) + Math.floor(((days % 146100) + 100) / 36525) + Math.floor(((days % 146100) % 36525 + 366) / 366) - 1);
  const gm = dayOfYear < 182 ? 1 + Math.floor(dayOfYear / 31) : 7 + Math.floor((dayOfYear - 186) / 30);
  const gd = dayOfYear - (gm < 7 ? (gm - 1) * 31 : (gm - 7) * 30 + 186) + 1;
  return [gy, gm, gd];
}

function jalaliDaysInMonth(jy, jm) {
  if (jm <= 6) return 31;
  if (jm <= 11) return 30;
  const leap = ((jy - 474) % 2820) < 21;
  return leap ? 30 : 29;
}

function getFirstDayOfWeekJalali(jy, jm) {
  const [gy, gm, gd] = jalaliToGregorian(jy, jm, 1);
  const dow = new Date(gy, gm - 1, gd).getDay();
  return (dow + 1) % 7;
}

function validateIranianPhone(phone) {
  return /^09\d{9}$/.test(phone);
}

function isServiceDisabled(service, selectedIds, allServices) {
  if (selectedIds.length === 0) return false;
  const selectedServices = allServices.filter((s) => selectedIds.includes(s._id));
  const hasCombined = selectedServices.some((s) => s.order === 4);
  const hasScissors = selectedServices.some((s) => s.order === 2);
  const hasClipper = selectedServices.some((s) => s.order === 3);
  if (service.order === 4) return hasScissors || hasClipper;
  if (service.order === 2 || service.order === 3) return hasCombined;
  return false;
}

export default function Booking() {
  const now = new Date();
  const todayJ = gregorianToJalali(now.getFullYear(), now.getMonth() + 1, now.getDate());

  // All useState hooks first
  const [viewYear, setViewYear] = useState(todayJ[0]);
  const [viewMonth, setViewMonth] = useState(todayJ[1]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedServiceIds, setSelectedServiceIds] = useState([]);
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

  // Then Convex hooks
  const services = useQuery(api.services.list);
  const createAppointment = useMutation(api.appointments.create);
  const bookedSlots = useQuery(
    api.appointments.getBookedSlots,
    selectedDate ? { date: selectedDate } : "skip"
  );

  const daysInMonth = useMemo(() => jalaliDaysInMonth(viewYear, viewMonth), [viewYear, viewMonth]);
  const startDay = useMemo(() => getFirstDayOfWeekJalali(viewYear, viewMonth), [viewYear, viewMonth]);

  const calendarDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < startDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);
    return days;
  }, [daysInMonth, startDay]);

  const selectedServiceDataList = useMemo(
    () => services?.filter((s) => selectedServiceIds.includes(s._id)) || [],
    [services, selectedServiceIds]
  );

  const totalPrice = useMemo(
    () => selectedServiceDataList.reduce((sum, s) => sum + s.price, 0),
    [selectedServiceDataList]
  );

  const isPast = (day) =>
    viewYear < todayJ[0] ||
    (viewYear === todayJ[0] && viewMonth < todayJ[1]) ||
    (viewYear === todayJ[0] && viewMonth === todayJ[1] && day <= todayJ[2]);

  const handleDateClick = (day) => {
    if (isPast(day)) return;
    const [gy, gm, gd] = jalaliToGregorian(viewYear, viewMonth, day);
    setSelectedDate(`${gy}-${String(gm).padStart(2, "0")}-${String(gd).padStart(2, "0")}`);
    setSelectedTime(null);
  };

  const handleServiceToggle = (serviceId) => {
    setSelectedServiceIds((prev) =>
      prev.includes(serviceId) ? prev.filter((id) => id !== serviceId) : [...prev, serviceId]
    );
  };

  const handlePhoneChange = (value) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    setPhone(digits);
    setPhoneError(digits.length === 11 && !validateIranianPhone(digits) ? "شماره موبایل نامعتبر است (مثال: 09121234567)" : "");
  };

  const handleSubmit = async () => {
    if (selectedServiceIds.length === 0 || !selectedDate || !selectedTime || !petName) return;
    if (!phone || !validateIranianPhone(phone)) {
      setPhoneError("شماره موبایل نامعتبر است (باید 11 رقم و با 09 شروع شود)");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await createAppointment({
        serviceIds: selectedServiceIds,
        date: selectedDate,
        time: selectedTime,
        petName,
        petType,
        petBreed: petBreed || undefined,
        petWeight: petWeight ? Number(petWeight) : undefined,
        phone,
        notes: notes || undefined,
        totalPrice,
      });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در ثبت نوبت");
    } finally {
      setIsSubmitting(false);
    }
  };

  const navigateMonth = (dir) => {
    if (dir === -1) {
      if (viewMonth === 1) { setViewMonth(12); setViewYear(viewYear - 1); }
      else setViewMonth(viewMonth - 1);
    } else {
      if (viewMonth === 12) { setViewMonth(1); setViewYear(viewYear + 1); }
      else setViewMonth(viewMonth + 1);
    }
    setSelectedDate(null);
    setSelectedTime(null);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-20 bg-background" dir="rtl">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="clay-card p-10 text-center max-w-md w-full">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-emerald-100 to-emerald-50 clay-blob flex items-center justify-center mb-6">
            <Check className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-black mb-3">نوبت ثبت شد! 🎉</h2>
          <p className="text-muted-foreground mb-6">
            نوبت {petName} عزیز ثبت شد. با شماره {toPersianDigits(phone)} تماس گرفته می‌شود.
          </p>
          <Link to="/" className="clay-btn bg-primary text-primary-foreground px-6 py-3 font-bold inline-flex items-center justify-center gap-2 w-full">
            بازگشت به صفحه اصلی
          </Link>
        </motion.div>
      </div>
    );
  }

  if (!services) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background" dir="rtl">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const canSubmit = selectedServiceIds.length > 0 && selectedDate && selectedTime && petName && validateIranianPhone(phone) && !isSubmitting;

  return (
    <div className="min-h-screen bg-background px-4 py-10" dir="rtl">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-4">
            <ArrowRight className="w-4 h-4" /> بازگشت
          </Link>
          <h1 className="text-3xl md:text-4xl font-black">
            رزرو <span className="bg-gradient-to-l from-primary to-amber-500 bg-clip-text text-transparent">نوبت</span>
          </h1>
        </div>

        {/* Calendar */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="clay-card p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => navigateMonth(-1)} className="w-10 h-10 rounded-xl clay-card flex items-center justify-center hover:bg-secondary/50 transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-black">{PERSIAN_MONTHS[viewMonth - 1]} {toPersianDigits(viewYear)}</h2>
            <button onClick={() => navigateMonth(1)} className="w-10 h-10 rounded-xl clay-card flex items-center justify-center hover:bg-secondary/50 transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {PERSIAN_WEEKDAYS.map((d) => (
              <div key={d} className="text-center text-xs font-bold text-muted-foreground py-2">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, i) => {
              if (day === null) return <div key={`e-${i}`} className="aspect-square" />;
              const past = isPast(day);
              const [gy, gm, gd] = jalaliToGregorian(viewYear, viewMonth, day);
              const dateStr = `${gy}-${String(gm).padStart(2, "0")}-${String(gd).padStart(2, "0")}`;
              const isToday = viewYear === todayJ[0] && viewMonth === todayJ[1] && day === todayJ[2];
              return (
                <button key={`d-${i}`} onClick={() => !past && handleDateClick(day)} disabled={past}
                  className={`aspect-square rounded-xl flex flex-col items-center justify-center text-sm font-bold transition-all ${past ? "text-muted-foreground/30 cursor-not-allowed bg-muted/30" : selectedDate === dateStr ? "bg-primary text-primary-foreground shadow-md scale-105" : "hover:bg-secondary/60 hover:scale-105"}`}>
                  {toPersianDigits(day)}
                  {isToday && <span className="text-[8px] text-primary/60 mt-0.5">امروز</span>}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Time Slots */}
        <AnimatePresence>
          {selectedDate && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="clay-card p-6 mb-8 overflow-hidden">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-primary" />
                <h3 className="font-bold">ساعت‌های قابل رزرو</h3>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {["09:00","09:30","10:00","10:30","11:00","11:30","12:00","12:30","14:00","14:30","15:00","15:30","16:00","16:30","17:00","17:30"].map((time) => {
                  const isBooked = bookedSlots?.some((s) => s.time === time);
                  return (
                    <button key={time} onClick={() => !isBooked && setSelectedTime(time)} disabled={isBooked}
                      className={`py-2.5 px-3 rounded-xl text-sm font-bold transition-all ${isBooked ? "bg-muted/50 text-muted-foreground/40 cursor-not-allowed line-through" : selectedTime === time ? "bg-primary text-primary-foreground shadow-md" : "clay-card hover:bg-secondary/50"}`}>
                      {toPersianDigits(time)}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Booking Form */}
        {selectedDate && selectedTime && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="clay-card p-6 mb-8">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <PawPrint className="w-5 h-5 text-primary" /> فرم رزرو
            </h3>
            <div className="space-y-5">
              {/* Multi-Service Selection */}
              <div>
                <label className="block text-sm font-bold mb-2">خدمات را انتخاب کنید * ({toPersianDigits(selectedServiceIds.length)} مورد)</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {services.map((s) => {
                    const disabled = isServiceDisabled(s, selectedServiceIds, services);
                    const selected = selectedServiceIds.includes(s._id);
                    return (
                      <button key={s._id} onClick={() => !disabled && handleServiceToggle(s._id)} disabled={disabled}
                        className={`clay-card p-3 text-right transition-all relative ${disabled && !selected ? "opacity-40 cursor-not-allowed" : selected ? "ring-2 ring-primary bg-primary/5" : "hover:bg-secondary/50"}`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-bold text-sm">{s.name}</div>
                            <div className="text-xs text-muted-foreground mt-0.5">{toPersianDigits(s.price.toLocaleString())} تومان</div>
                          </div>
                          <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${selected ? "bg-primary border-primary" : "border-border"}`}>
                            {selected && <Check className="w-3 h-3 text-white" />}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Pet Type */}
              <div>
                <label className="block text-sm font-bold mb-2">نوع حیوان *</label>
                <div className="flex gap-2">
                  {[["dog", "🐕 سگ"], ["cat", "🐈 گربه"], ["rabbit", "🐇 خرگوش"]].map(([v, l]) => (
                    <button key={v} onClick={() => setPetType(v)} className={`clay-card flex-1 py-3 text-center text-sm font-bold transition-all ${petType === v ? "ring-2 ring-primary" : "hover:bg-secondary/50"}`}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pet Name */}
              <div>
                <label className="block text-sm font-bold mb-2">نام حیوان *</label>
                <input type="text" value={petName} onChange={(e) => setPetName(e.target.value)} placeholder="مثلاً پپی" className="clay-input w-full px-4 py-3 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-bold mb-2">شماره موبایل *</label>
                <div className="relative">
                  <Phone className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                  <input type="tel" value={phone} onChange={(e) => handlePhoneChange(e.target.value)} placeholder="09121234567" dir="ltr" maxLength={11} className={`clay-input w-full pr-9 pl-4 py-3 text-sm border focus:outline-none focus:ring-2 focus:ring-primary ${phoneError ? "border-red-400" : ""}`} />
                </div>
                {phoneError && <p className="text-red-500 text-xs mt-1">{phoneError}</p>}
                {!phoneError && phone.length === 11 && validateIranianPhone(phone) && (
                  <p className="text-emerald-600 text-xs mt-1 flex items-center gap-1">
                    <Check className="w-3 h-3" /> شماره معتبر است
                  </p>
                )}
              </div>

              {/* Breed */}
              <div>
                <label className="block text-sm font-bold mb-2">نژاد (اختیاری)</label>
                <input type="text" value={petBreed} onChange={(e) => setPetBreed(e.target.value)} placeholder="مثلاً Pomeranian" className="clay-input w-full px-4 py-3 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>

              {/* Weight */}
              <div>
                <label className="block text-sm font-bold mb-2">وزن (اختیاری)</label>
                <input type="number" value={petWeight} onChange={(e) => setPetWeight(e.target.value)} placeholder="کیلوگرم" min="0" max="100" className="clay-input w-full px-4 py-3 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-bold mb-2">توضیحات</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="ویژگی‌های اخلاقی پت خود را بنویسید..." className="clay-input w-full px-4 py-3 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
              </div>

              {/* Selected Services Summary & Total Price */}
              {selectedServiceIds.length > 0 && (
                <div className="clay-card p-4 bg-gradient-to-l from-primary/5 to-amber-50/50">
                  <div className="text-sm font-bold mb-2">خدمات انتخاب شده:</div>
                  {selectedServiceDataList.map((s) => (
                    <div key={s._id} className="flex items-center justify-between text-sm py-1">
                      <span className="text-muted-foreground">{s.name}</span>
                      <span className="font-bold">{toPersianDigits(s.price.toLocaleString())} تومان</span>
                    </div>
                  ))}
                  <div className="border-t border-border/50 mt-2 pt-2 flex items-center justify-between">
                    <span className="font-bold">جمع قابل تخصیص</span>
                    <span className="text-xl font-black text-primary">{toPersianDigits(totalPrice.toLocaleString())} تومان</span>
                  </div>
                </div>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="clay-card p-4 mt-4 flex items-center gap-2 text-red-600 bg-red-50/50">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Submit */}
            <div className="flex justify-start mt-6">
              <button onClick={handleSubmit} disabled={!canSubmit} className="clay-btn bg-primary text-primary-foreground px-10 py-3 font-bold inline-flex items-center gap-2 disabled:opacity-40">
                {isSubmitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> در حال ثبت...</>
                ) : (
                  <>ثبت نوبت <Check className="w-4 h-4" /></>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
