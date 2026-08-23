import { motion } from "framer-motion";
import { PawPrint, Shield } from "lucide-react";
import { Link } from "react-router";

export default function NotFound() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="min-h-screen flex flex-col" dir="rtl">
      <div className="flex-1 flex flex-col items-center justify-center">
        <PawPrint className="w-16 h-16 text-primary/30 mb-4" />
        <h1 className="text-4xl font-black mb-2">۴۰۴</h1>
        <p className="text-lg text-muted-foreground mb-6">صفحه مورد نظر یافت نشد</p>
        <Link to="/" className="clay-btn bg-primary text-primary-foreground px-6 py-3 font-bold">
          بازگشت به صفحه اصلی
        </Link>

        {/* Secret admin link */}
        <Link
          to="/admin/login"
          className="mt-12 text-xs text-muted-foreground/20 hover:text-muted-foreground/40 transition-colors inline-flex items-center gap-1 select-none"
          title="پنل مدیریت"
        >
          <Shield className="w-3 h-3" />
        </Link>
      </div>
    </motion.div>
  );
}
