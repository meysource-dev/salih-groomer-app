import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { PawPrint, Menu, X, Home, Image, Phone, CalendarCheck, Shield } from "lucide-react";

const navLinks = [
  { to: "/", label: "خانه", icon: Home },
  { to: "/portfolio", label: "نمونه کارها", icon: Image },
  { to: "/contact", label: "تماس با ما", icon: Phone },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  return (
    <>
      {/* Floating Navbar */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-4 left-4 right-4 z-50 transition-all duration-300 ${
          scrolled ? "top-2" : "top-4"
        }`}
      >
        <div
          className={`max-w-5xl mx-auto rounded-2xl transition-all duration-300 ${
            scrolled
              ? "bg-background/80 backdrop-blur-xl shadow-lg border border-border/50"
              : "bg-background/60 backdrop-blur-md border border-border/30"
          }`}
        >
          <div className="flex items-center justify-between px-4 py-3">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                <PawPrint className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-black hidden sm:block">صالح گرومر</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>

            {/* CTA + Mobile Toggle */}
            <div className="flex items-center gap-2">
              <Link
                to="/auth?returnTo=/booking"
                className="clay-btn bg-primary text-primary-foreground px-5 py-2 text-sm font-bold inline-flex items-center gap-2"
              >
                <CalendarCheck className="w-4 h-4" />
                <span className="hidden sm:inline">رزرو نوبت</span>
              </Link>
              <Link
                to="/admin/login"
                className="w-9 h-9 rounded-xl clay-card flex items-center justify-center hover:bg-secondary/50 transition-colors"
                title="پنل مدیریت"
              >
                <Shield className="w-4 h-4 text-muted-foreground" />
              </Link>

              <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden w-10 h-10 rounded-xl clay-card flex items-center justify-center"
              >
                {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 md:hidden"
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/20 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute top-20 left-4 right-4 clay-card p-4"
            >
              <div className="flex flex-col gap-1">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = location.pathname === link.to;
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer to prevent content from hiding behind fixed navbar */}
      <div className="h-20" />
    </>
  );
}
