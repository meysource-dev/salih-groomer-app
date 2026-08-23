import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, LogOut, CalendarCheck, CheckCircle, XCircle, Hourglass, PawPrint, Loader2, DollarSign, Image, Plus, Trash2, Settings, X, Upload } from "lucide-react";
import { useNavigate } from "react-router";

const statusMap = {
  pending: { label: "\u062f\u0631 \u0627\u0646\u062a\u0638\u0627\u0631", color: "text-amber-600 bg-amber-50", icon: Hourglass },
  confirmed: { label: "\u062a\u0623\u06cc\u06cc\u062f \u0634\u062f\u0647", color: "text-emerald-600 bg-emerald-50", icon: CheckCircle },
  cancelled: { label: "\u0644\u063a\u0648 \u0634\u062f\u0647", color: "text-red-500 bg-red-50", icon: XCircle },
  completed: { label: "\u0627\u0646\u062c\u0627\u0645 \u0634\u062f\u0647", color: "text-blue-600 bg-blue-50", icon: CheckCircle },
};

function toPersianDigits(num) {
  const pd = ["\u06f0", "\u06f1", "\u06f2", "\u06f3", "\u06f4", "\u06f5", "\u06f6", "\u06f7", "\u06f8", "\u06f9"];
  return String(num).replace(/\d/g, (d) => pd[parseInt(d)]).replace(/-/g, "/");
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const appointments = useQuery(api.appointments.listAll);
  const updateStatus = useMutation(api.appointments.updateStatus);
  const services = useQuery(api.services.listAll);
  const updatePrice = useMutation(api.services.updatePrice);
  const portfolio = useQuery(api.portfolio.listAll);
  const createPortfolio = useMutation(api.portfolio.create);
  const removePortfolio = useMutation(api.portfolio.remove);
  const generateUploadUrl = useMutation(api.portfolio.generateUploadUrl);

  const [adminName, setAdminName] = useState("");
  const [activeTab, setActiveTab] = useState("appointments");
  const [editingPrice, setEditingPrice] = useState(null);
  const [newPrice, setNewPrice] = useState("");

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

  const handlePriceSave = async (serviceId) => {
    const price = Number(newPrice);
    if (isNaN(price) || price < 0) return;
    await updatePrice({ id: serviceId, price });
    setEditingPrice(null);
    setNewPrice("");
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setUploadError("\u0641\u0642\u0637 \u062a\u0648\u0635\u06cc\u0641 \u0627\u0635\u0644\u06cc \u0628\u0627\u0634\u062f");
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
      // 1. Generate upload URL
      const uploadUrl = await generateUploadUrl();
      // 2. Upload file to Convex storage
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": portfolioFile.type },
        body: portfolioFile,
      });
      if (!result.ok) throw new Error("\u062e\u0637\u0627 \u062f\u0631 \u0622\u067e\u0644\u0648\u062f");
      const { storageId } = await result.json();
      // 3. Create portfolio entry with storage URL
      await createPortfolio({
        title: portfolioTitle,
        description: portfolioDesc || undefined,
        imageUrl: storageId,
        petType: portfolioPetType || undefined,
        isPublished: true,
      });
      // Reset
      setShowPortfolioModal(false);
      setPortfolioTitle("");
      setPortfolioDesc("");
      setPortfolioPetType("");
      setPortfolioFile(null);
      setPortfolioPreview(null);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "\u062e\u0637\u0627 \u062f\u0631 \u0622\u067e\u0644\u0648\u062f");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeletePortfolio = async (id) => {
    if (confirm("\u0622\u06cc\u0627 \u0627\u0632 \u062d\u0630\u0641 \u0627\u06cc\u0646 \u0646\u0645\u0648\u0646\u0647 \u0645\u0637\u0645\u0626\u0646 \u0647\u0633\u062a\u06cc\u062f\u061f")) {
      await removePortfolio({ id });
    }
  };

  if (!appointments || !services) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
  }

  const pending = appointments.filter((a) => a.status === "pending");
  const confirmed = appointments.filter((a) => a.status === "confirmed");
  const totalRevenue = appointments.filter((a) => a.status !== "cancelled").reduce((sum, a) => sum + (a.totalPrice || 0), 0);

  const tabs = [
    { id: "appointments", label: "\u0646\u0648\u0628\u062a\u200c\u0647\u0627", icon: CalendarCheck },
    { id: "services", label: "\u062e\u062f\u0645\u062a\u0647\u0627", icon: Settings },
    { id: "portfolio", label: "\u0646\u0645\u0648\u0646\u0647 \u06a9\u0627\u0631", icon: Image },
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
              <h1 className="text-2xl font-black">{"\u067e\u0646\u0644 \u0645\u062f\u06cc\u0631\u06cc\u062a"}</h1>
              <p className="text-sm text-muted-foreground">{"\u062e\u0648\u0634 \u0622\u0645\u062f\u06cc\u062f"} {adminName}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="clay-card px-4 py-2.5 text-sm font-bold inline-flex items-center gap-2 hover:bg-secondary/50 transition-colors">
            <LogOut className="w-4 h-4" /> {"\u062e\u0631\u0648\u062c"}
          </button>
        </motion.header>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "\u062f\u0631 \u0627\u0646\u062a\u0638\u0627\u0631", value: pending.length, color: "from-amber-100 to-amber-50" },
            { label: "\u062a\u0623\u06cc\u06cc\u062f \u0634\u062f\u0647", value: confirmed.length, color: "from-emerald-100 to-emerald-50" },
            { label: "\u06a9\u0644 \u0646\u0648\u0628\u062a\u200c\u0647\u0627", value: appointments.length, color: "from-primary/10 to-primary/5" },
            { label: "\u062f\u0631\u0622\u0645\u062f", value: `${toPersianDigits(totalRevenue.toLocaleString())} \u062a`, color: "from-green-100 to-green-50" },
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
            <h2 className="text-lg font-bold mb-4">{"\u0647\u0645\u0647 \u0646\u0648\u0628\u062a\u200c\u0647\u0627"}</h2>
            {appointments.length === 0 ? (
              <div className="clay-card p-8 text-center text-muted-foreground">{"\u0647\u0646\u0648\u0632 \u0646\u0648\u0628\u062a\u06cc \u062b\u0628\u062a \u0646\u0634\u062f\u0647"}</div>
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
                              {apt.services?.map((s) => s.name).join(" + ") || "\u062e\u062f\u0645\u062a"} {"\u2014"} {apt.petName}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {apt.date} {"\u0633\u0627\u0639\u062a"} {toPersianDigits(apt.time)} {"\u2022"} {apt.petType === "dog" ? "\ud83d\udc15 \u0633\u06af" : apt.petType === "cat" ? "\ud83d\udc08 \u06af\u0631\u0628\u0647" : "\ud83d\udc07 \u062e\u0631\u06af\u0648\u0634"}
                              {apt.petBreed && ` \u2022 ${apt.petBreed}`}
                            </div>
                            <div className="text-xs text-muted-foreground mt-0.5">
                              {"\ud83d\udcde"} {toPersianDigits(apt.phone)} {"\u2022"} {toPersianDigits((apt.totalPrice || 0).toLocaleString())} {"\u062a\u0648\u0645\u0627\u0646"}
                            </div>
                            {apt.notes && <div className="text-xs text-muted-foreground mt-1 italic">{"\ud83d\udcdd"} {apt.notes}</div>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${status.color}`}>
                            <StatusIcon className="w-3 h-3" />
                            {status.label}
                          </div>
                          <select value={apt.status} onChange={(e) => updateStatus({ id: apt._id, status: e.target.value })} className="text-xs border border-border rounded-lg px-2 py-1 bg-background">
                            <option value="pending">{"\u062f\u0631 \u0627\u0646\u062a\u0638\u0627\u0631"}</option>
                            <option value="confirmed">{"\u062a\u0623\u06cc\u06cc\u062f"}</option>
                            <option value="completed">{"\u0627\u0646\u062c\u0627\u0645 \u0634\u062f\u0647"}</option>
                            <option value="cancelled">{"\u0644\u063a\u0648"}</option>
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

        {/* ========== Services Tab ========== */}
        {activeTab === "services" && (
          <div>
            <h2 className="text-lg font-bold mb-4">{"\u0645\u062f\u06cc\u0631\u06cc\u062a \u0642\u06cc\u0645\u062a \u062e\u062f\u0645\u062a\u200c\u0647\u0627"}</h2>
            <div className="space-y-3">
              {services.map((svc) => (
                <div key={svc._id} className="clay-card p-5 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="font-bold">{svc.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{svc.nameEn} {"\u2022"} {svc.duration} {"\u062f\u0642\u06cc\u0642\u0647"}</div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {editingPrice === svc._id ? (
                      <div className="flex items-center gap-2">
                        <input type="number" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} placeholder={String(svc.price)} className="clay-input w-32 px-3 py-2 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary" autoFocus />
                        <button onClick={() => handlePriceSave(svc._id)} className="clay-btn bg-emerald-600 text-white px-3 py-2 text-xs font-bold">{"\u0630\u062e\u06cc\u0631\u0647"}</button>
                        <button onClick={() => setEditingPrice(null)} className="clay-card px-3 py-2 text-xs font-bold">{"\u0644\u063a\u0648"}</button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="text-lg font-black text-primary">{toPersianDigits(svc.price.toLocaleString())} {"\u062a\u0648\u0645\u0627\u0646"}</div>
                        <button onClick={() => { setEditingPrice(svc._id); setNewPrice(String(svc.price)); }} className="clay-card px-3 py-2 text-xs font-bold inline-flex items-center gap-1 hover:bg-secondary/50">
                          <DollarSign className="w-3 h-3" /> {"\u062a\u063a\u06cc\u06cc\u0631"}
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
              <h2 className="text-lg font-bold">{"\u0646\u0645\u0648\u0646\u0647 \u06a9\u0627\u0631"}</h2>
              <button onClick={() => setShowPortfolioModal(true)} className="clay-btn bg-primary text-primary-foreground px-5 py-2.5 text-sm font-bold inline-flex items-center gap-2">
                <Plus className="w-4 h-4" /> {"\u0627\u0636\u0627\u0641\u0647 \u0646\u0645\u0648\u0646\u0647 \u06a9\u0627\u0631"}
              </button>
            </div>

            {!portfolio ? (
              <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
            ) : portfolio.length === 0 ? (
              <div className="clay-card p-8 text-center text-muted-foreground">{"\u0647\u0646\u0648\u0632 \u0646\u0645\u0648\u0646\u0647 \u06a9\u0627\u0631\u06cc \u062b\u0628\u062a \u0646\u0634\u062f\u0647. \u0636\u063a\u0637 \u062f\u06a9\u0645\u0647 \u0627\u0636\u0627\u0641\u0647 \u0646\u0645\u0648\u0646\u0647 \u06a9\u0627\u0631 \u0628\u0631\u0627\u06cc \u0634\u0631\u0648\u0639 \u06a9\u0646\u06cc\u062f."}</div>
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
                          {item.isPublished ? "\u0645\u0646\u0634\u0631" : "\u067e\u06cc\u0634\u0646\u0648\u06cc\u0634"}
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
      </div>

      {/* ========== Portfolio Modal ========== */}
      <AnimatePresence>
        {showPortfolioModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4" dir="rtl">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => !isUploading && setShowPortfolioModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-lg clay-card p-6 z-10">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-black flex items-center gap-2">
                  <Image className="w-5 h-5 text-primary" /> {"\u0627\u0636\u0627\u0641\u0647 \u0646\u0645\u0648\u0646\u0647 \u06a9\u0627\u0631"}
                </h3>
                <button onClick={() => !isUploading && setShowPortfolioModal(false)} className="w-8 h-8 rounded-lg hover:bg-secondary/50 flex items-center justify-center transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* File Upload Area */}
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
                    <div className="text-sm text-muted-foreground">{"\u0639\u06a9\u0633 \u0631\u0627 \u0628\u0631\u0627\u06cc \u0627\u0646\u062a\u062e\u0627\u0628 \u06a9\u0644\u06cc\u06a9 \u06a9\u0646\u06cc\u062f"}</div>
                    <div className="text-xs text-muted-foreground">JPG, PNG, WebP</div>
                  </button>
                )}
              </div>

              {/* Form Fields */}
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-bold mb-1">{"\u0639\u0646\u0648\u0627\u0646 *"} </label>
                  <input type="text" value={portfolioTitle} onChange={(e) => setPortfolioTitle(e.target.value)} placeholder={"\u0645\u062b\u0644\u0627\u064b \u0627\u0635\u0644\u06cc \u0646\u0645\u0648\u0646\u0647"} className="clay-input w-full px-4 py-2.5 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">{"\u062a\u0648\u0636\u06cc\u062d\u0627\u062a"}</label>
                  <textarea value={portfolioDesc} onChange={(e) => setPortfolioDesc(e.target.value)} rows={2} placeholder={"\u062a\u0635\u0639\u06cc\u0641 \u0646\u0645\u0648\u0646\u0647"} className="clay-input w-full px-4 py-2.5 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">{"\u0646\u0648\u0639 \u062d\u06cc\u0648\u0627\u0646"}</label>
                  <select value={portfolioPetType} onChange={(e) => setPortfolioPetType(e.target.value)} className="clay-input w-full px-4 py-2.5 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary">
                    <option value="">{"\u0647\u0645\u0647"}</option>
                    <option value="dog">{"\ud83d\udc15 \u0633\u06af"}</option>
                    <option value="cat">{"\ud83d\udc08 \u06af\u0631\u0628\u0647"}</option>
                    <option value="rabbit">{"\ud83d\udc07 \u062e\u0631\u06af\u0648\u0634"}</option>
                  </select>
                </div>
              </div>

              {/* Error */}
              {uploadError && (
                <div className="mt-3 text-sm text-red-500 bg-red-50 p-3 rounded-xl">{uploadError}</div>
              )}

              {/* Submit */}
              <div className="flex justify-start gap-3 mt-5">
                <button onClick={handleSubmitPortfolio} disabled={!portfolioTitle || !portfolioFile || isUploading} className="clay-btn bg-primary text-primary-foreground px-6 py-2.5 text-sm font-bold inline-flex items-center gap-2 disabled:opacity-40">
                  {isUploading ? <><Loader2 className="w-4 h-4 animate-spin" /> {"\u062f\u0631 \u062d\u0627\u0644 \u0622\u067e\u0644\u0648\u062f..."}</> : <><Upload className="w-4 h-4" /> {"\u0622\u067e\u0644\u0648\u062f \u0648 \u0627\u0636\u0627\u0641\u0647"}</>}
                </button>
                <button onClick={() => setShowPortfolioModal(false)} disabled={isUploading} className="clay-card px-5 py-2.5 text-sm font-bold hover:bg-secondary/50 transition-colors">
                  {"\u0644\u063a\u0648"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
