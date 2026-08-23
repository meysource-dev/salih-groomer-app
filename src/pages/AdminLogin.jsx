import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { motion } from "framer-motion";
import { Shield, User, Lock, Loader2, AlertCircle, PawPrint } from "lucide-react";
import { useNavigate } from "react-router";

export default function AdminLogin() {
  const login = useMutation(api.admin.login);
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); setError(null);
    try {
      const result = await login({ username, password });
      localStorage.setItem("admin_token", result.token);
      localStorage.setItem("admin_name", result.name);
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در ورود");
    } finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4" dir="rtl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary/15 to-amber-100/50 clay-blob flex items-center justify-center mb-4"><Shield className="w-8 h-8 text-primary" /></div>
          <h1 className="text-2xl font-black">پنل مدیریت</h1>
          <p className="text-sm text-muted-foreground mt-1">صالح گرومر</p>
        </div>
        <form onSubmit={handleSubmit} className="clay-card p-6 space-y-4">
          {error && <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-xl text-sm"><AlertCircle className="w-4 h-4 shrink-0" />{error}</div>}
          <div><label className="block text-sm font-bold mb-1.5">نام کاربری</label><div className="relative"><User className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" /><input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="نام کاربری" className="clay-input w-full pr-9 pl-4 py-2.5 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary" required autoFocus /></div></div>
          <div><label className="block text-sm font-bold mb-1.5">رمز عبور</label><div className="relative"><Lock className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" /><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="رمز عبور" className="clay-input w-full pr-9 pl-4 py-2.5 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary" required /></div></div>
          <button type="submit" disabled={isLoading || !username || !password} className="clay-btn bg-primary text-primary-foreground w-full py-3 font-bold inline-flex items-center justify-center gap-2 disabled:opacity-40">
            {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> در حال ورود...</> : <><Shield className="w-4 h-4" /> ورود به پنل</>}
          </button>
        </form>
        <div className="text-center mt-6"><a href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1"><PawPrint className="w-3.5 h-3.5" /> بازگشت به سایت</a></div>
      </motion.div>
    </div>
  );
}
