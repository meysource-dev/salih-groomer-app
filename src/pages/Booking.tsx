import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Scissors,
  Bath,
  Sparkles,
  PawPrint,
  Crown,
  Heart,
  Calendar,
  Clock,
  Check,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CalendarCheck,
} from "lucide-react";
import { Link, useNavigate } from "react-router";

const iconMap: Record<string, React.FC<{ className?: string }>> = {
  bath: Bath,
  scissors: Scissors,
  sparkles: Sparkles,
  pawPrint: PawPrint,
  crown: Crown,
  eye: Heart,
};

const timeSlots = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
];

const persianWeekdays = ["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه"];

function toPersianDigits(num: number | string): string {
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return String(num)
    .replace(/\d/g, (d) => persianDigits[parseInt(d)])
    .replace(/-/g, "/");
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const weekday = persianWeekdays[date.getDay()];
  return `${weekday} ${toPersianDigits(day)} ${toPersianDigits(month)}`;
}

function getNextDays(count: number) {
  const days: { date: string; label: string }[] = [];
  const today = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dateStr = d.toISOString().split("T")[0];
    days.push({
      date: dateStr,
      label: formatDate(dateStr),
    });
  }
  return days;
}

export default function Booking() {
  const services = useQuery(api.services.list);
  const bookedSlots = useQuery(
    api.appointments.getBookedSlots,
    {} as any,
  );
  const createAppointment = useMutation(api.appointments.create);
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [petName, setPetName] = useState("");
  const [petType, setPetType] = useState<"dog" | "cat">("dog");
  const [petBreed, setPetBreed] = useState("");
  const [petWeight, setPetWeight] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const days = getNextDays(14);
  const selectedServiceData = services?.find((s) => s._id === selectedService);

  // Get booked times for the selected date
  const bookedTimesForDate = bookedSlots
    ?.filter((s) => s.date === selectedDate && s.time)
    .map((s) => s.time) || [];

  const handleSubmit = async () => {
    if (!selectedService || !selectedDate || !selectedTime || !petName) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await createAppointment({
        serviceId: selectedService as any,
        date: selectedDate,
        time: selectedTime,
        petName,
        petType,
        petBreed: petBreed || undefined,
        petWeight: petWeight ? Number(petWeight) : undefined,
        notes: notes || undefined,
      });
      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "خطا در ثبت نوبت. لطفاً دوباره تلاش کنید."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-20" dir="rtl">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="clay-card p-10 md:p-14 text-center max-w-md w-full"
        >
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-emerald-100 to-emerald-50 clay-blob flex items-center justify-center mb-6">
            <Check className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-black mb-3">نوبت شما ثبت شد! 🎉</h2>
          <p className="text-muted-foreground mb-6">
            نوبت {petName} عزیز برای {selectedServiceData?.name} در{" "}
            {formatDate(selectedDate!)} ساعت {toPersianDigits(selectedTime!)} ثبت شد.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              to="/dashboard"
              className="clay-btn bg-primary text-primary-foreground px-6 py-3 font-bold inline-flex items-center justify-center gap-2"
            >
              مشاهده نوبت‌ها
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              بازگشت به صفحه اصلی
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!services) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir="rtl">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-10" dir="rtl">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-4"
          >
            <ArrowRight className="w-4 h-4" />
            بازگشت به صفحه اصلی
          </Link>
          <h1 className="text-3xl md:text-4xl font-black">
            رزرو{" "}
            <span className="bg-gradient-to-l from-primary to-rose-500 bg-clip-text text-transparent">
              نوبت
            </span>
          </h1>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  step === s
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : step > s
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {step > s ? <Check className="w-4 h-4" /> : toPersianDigits(s)}
              </div>
              {s < 4 && (
                <div
                  className={`w-8 h-0.5 rounded-full transition-all duration-300 ${
                    step > s ? "bg-emerald-300" : "bg-border"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Select Service */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Scissors className="w-5 h-5 text-primary" />
                خدمت مورد نظر را انتخاب کنید
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {services.map((service) => {
                  const Icon = iconMap[service.icon] || PawPrint;
                  return (
                    <button
                      key={service._id}
                      onClick={() => setSelectedService(service._id)}
                      className={`clay-card-hover p-5 text-right transition-all ${
                        selectedService === service._id
                          ? "ring-2 ring-primary ring-offset-2"
                          : ""
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center shrink-0">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold mb-1">{service.name}</h3>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {service.description}
                          </p>
                          <div className="flex items-center gap-4 mt-3">
                            <span className="text-sm font-bold text-primary">
                              {toPersianDigits(service.price.toLocaleString())} تومان
                            </span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {toPersianDigits(service.duration)} دقیقه
                            </span>
                          </div>
                        </div>
                        {selectedService === service._id && (
                          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3 text-primary-foreground" />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="flex justify-start mt-8">
                <button
                  onClick={() => setStep(2)}
                  disabled={!selectedService}
                  className="clay-btn bg-primary text-primary-foreground px-8 py-3 font-bold inline-flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  مرحله بعد
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Select Date & Time */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                تاریخ و ساعت را انتخاب کنید
              </h2>

              {/* Date Selection */}
              <div className="mb-6">
                <h3 className="text-sm font-bold text-muted-foreground mb-3">
                  تاریخ
                </h3>
                <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2">
                  {days.map((day) => (
                    <button
                      key={day.date}
                      onClick={() => {
                        setSelectedDate(day.date);
                        setSelectedTime(null);
                      }}
                      className={`clay-card px-4 py-3 text-center shrink-0 min-w-[100px] transition-all ${
                        selectedDate === day.date
                          ? "ring-2 ring-primary"
                          : "hover:bg-secondary/50"
                      }`}
                    >
                      <div className="text-sm font-bold">{day.label.split(" ")[0]}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {day.label.split(" ").slice(1).join(" ")}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Selection */}
              {selectedDate && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <h3 className="text-sm font-bold text-muted-foreground mb-3">
                    ساعت
                  </h3>
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                    {timeSlots.map((time) => {
                      const isBooked = bookedTimesForDate.includes(time);
                      return (
                        <button
                          key={time}
                          onClick={() => !isBooked && setSelectedTime(time)}
                          disabled={isBooked}
                          className={`py-2.5 px-3 rounded-xl text-sm font-bold transition-all ${
                            isBooked
                              ? "bg-muted text-muted-foreground/40 cursor-not-allowed line-through"
                              : selectedTime === time
                              ? "bg-primary text-primary-foreground shadow-md"
                              : "clay-card hover:bg-secondary/50"
                          }`}
                        >
                          {toPersianDigits(time)}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              <div className="flex justify-between mt-8">
                <button
                  onClick={() => setStep(1)}
                  className="clay-card px-6 py-3 font-bold inline-flex items-center gap-2 hover:bg-secondary/50"
                >
                  مرحله قبل
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!selectedDate || !selectedTime}
                  className="clay-btn bg-primary text-primary-foreground px-8 py-3 font-bold inline-flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  مرحله بعد
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Pet Info */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <PawPrint className="w-5 h-5 text-primary" />
                اطلاعات حیوان خانگی
              </h2>

              <div className="space-y-5">
                {/* Pet Type */}
                <div>
                  <label className="block text-sm font-bold mb-2">
                    نوع حیوان
                  </label>
                  <div className="flex gap-3">
                    {[
                      { value: "dog", label: "🐕 سگ", icon: "🐕" },
                      { value: "cat", label: "🐈 گربه", icon: "🐈" },
                    ].map((t) => (
                      <button
                        key={t.value}
                        onClick={() => setPetType(t.value as "dog" | "cat")}
                        className={`clay-card flex-1 py-4 text-center text-lg font-bold transition-all ${
                          petType === t.value
                            ? "ring-2 ring-primary"
                            : "hover:bg-secondary/50"
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pet Name */}
                <div>
                  <label className="block text-sm font-bold mb-2">
                    نام حیوان *
                  </label>
                  <input
                    type="text"
                    value={petName}
                    onChange={(e) => setPetName(e.target.value)}
                    placeholder="مثلاً پپی"
                    className="clay-input w-full px-4 py-3 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* Pet Breed */}
                <div>
                  <label className="block text-sm font-bold mb-2">
                    نژاد (اختیاری)
                  </label>
                  <input
                    type="text"
                    value={petBreed}
                    onChange={(e) => setPetBreed(e.target.value)}
                    placeholder="مثلاً شیتزو، پودل، پرشین"
                    className="clay-input w-full px-4 py-3 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* Pet Weight */}
                <div>
                  <label className="block text-sm font-bold mb-2">
                    وزن به کیلوگرم (اختیاری)
                  </label>
                  <input
                    type="number"
                    value={petWeight}
                    onChange={(e) => setPetWeight(e.target.value)}
                    placeholder="مثلاً ۸"
                    min="0"
                    max="100"
                    className="clay-input w-full px-4 py-3 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-bold mb-2">
                    توضیحات (اختیاری)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="هر نکته خاصی که باید بدانیم..."
                    rows={3}
                    className="clay-input w-full px-4 py-3 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-between mt-8">
                <button
                  onClick={() => setStep(2)}
                  className="clay-card px-6 py-3 font-bold inline-flex items-center gap-2 hover:bg-secondary/50"
                >
                  مرحله قبل
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setStep(4)}
                  disabled={!petName}
                  className="clay-btn bg-primary text-primary-foreground px-8 py-3 font-bold inline-flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  مرحله بعد
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Confirmation */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-primary" />
                تأیید نهایی
              </h2>

              <div className="clay-card p-6 space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">خدمت</span>
                  <span className="text-sm font-bold">
                    {selectedServiceData?.name}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">تاریخ</span>
                  <span className="text-sm font-bold">
                    {selectedDate && formatDate(selectedDate)}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">ساعت</span>
                  <span className="text-sm font-bold">
                    {selectedTime && toPersianDigits(selectedTime)}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">نام حیوان</span>
                  <span className="text-sm font-bold">{petName}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">نوع حیوان</span>
                  <span className="text-sm font-bold">
                    {petType === "dog" ? "🐕 سگ" : "🐈 گربه"}
                  </span>
                </div>
                {petBreed && (
                  <div className="flex items-center justify-between py-3 border-b border-border/50">
                    <span className="text-sm text-muted-foreground">نژاد</span>
                    <span className="text-sm font-bold">{petBreed}</span>
                  </div>
                )}
                {petWeight && (
                  <div className="flex items-center justify-between py-3 border-b border-border/50">
                    <span className="text-sm text-muted-foreground">وزن</span>
                    <span className="text-sm font-bold">
                      {toPersianDigits(petWeight)} کیلوگرم
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between pt-3">
                  <span className="text-sm text-muted-foreground">هزینه</span>
                  <span className="text-lg font-black text-primary">
                    {selectedServiceData &&
                      toPersianDigits(
                        selectedServiceData.price.toLocaleString()
                      )}{" "}
                    تومان
                  </span>
                </div>
              </div>

              {error && (
                <div className="clay-card p-4 mt-4 flex items-center gap-2 text-red-600 bg-red-50/50">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <div className="flex justify-between mt-8">
                <button
                  onClick={() => setStep(3)}
                  className="clay-card px-6 py-3 font-bold inline-flex items-center gap-2 hover:bg-secondary/50"
                >
                  مرحله قبل
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="clay-btn bg-primary text-primary-foreground px-10 py-3 font-bold inline-flex items-center gap-2 disabled:opacity-40"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      در حال ثبت...
                    </>
                  ) : (
                    <>
                      ثبت نوبت
                      <Check className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
