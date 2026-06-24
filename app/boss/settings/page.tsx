"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Building2, Briefcase, CalendarDays, CreditCard, Bell, Shield, RefreshCw, CheckCircle2 } from "lucide-react";
import { getUserProfile } from "@/app/actions/user";

const categories = [
  { key: "company", label: "Company Profile", icon: Building2 },
  { key: "account", label: "Account & Security", icon: Shield },
  { key: "leave", label: "Leave Quotas", icon: CalendarDays },
  { key: "notifications", label: "Notifications", icon: Bell },
];

export default function BossSettings() {
  const [activeCategory, setActiveCategory] = useState("company");
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserProfile().then(setProfile).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 text-indigo-400 h-[60vh]">
        <RefreshCw className="animate-spin" size={32} />
        <span className="text-sm font-medium animate-pulse">Memuat konfigurasi...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-8rem)]">
      {/* Left Menu Panel */}
      <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="w-full md:w-[240px] shrink-0 rounded-2xl p-3 bg-white/[0.02] border border-white/5 flex flex-col gap-1">
        <div className="px-3 py-2 mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Settings</div>
        {categories.map((cat) => (
          <button 
            key={cat.key} 
            onClick={() => setActiveCategory(cat.key)} 
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${activeCategory === cat.key ? "bg-indigo-500/10 border-l-2 border-indigo-500 text-indigo-100 font-semibold" : "text-slate-400 hover:bg-white/5 hover:text-slate-200"}`}
          >
            <cat.icon size={16} className={activeCategory === cat.key ? "text-indigo-400" : "text-slate-500"} />
            {cat.label}
          </button>
        ))}
      </motion.div>

      {/* Right Content Panel */}
      <div className="flex-1 min-w-0 overflow-y-auto pr-2 pb-10" style={{ scrollbarWidth: "none" }}>
        <AnimatePresence mode="wait">
          <motion.div key={activeCategory} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div className="text-xl font-bold text-white mb-6 capitalize">{categories.find(c => c.key === activeCategory)?.label}</div>
            
            <div className="bg-white/[0.03] border border-indigo-500/10 rounded-2xl p-6 min-h-[400px]">
              
              {/* KONTEN: COMPANY PROFILE */}
              {activeCategory === "company" && (
                <div className="max-w-xl space-y-5">
                   <div>
                     <label className="text-xs text-slate-400 font-semibold uppercase tracking-widest block mb-2">Company Name</label>
                     <input type="text" defaultValue="Nadi Corporation" className="w-full bg-[#1A1E2E] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500" />
                   </div>
                   <div>
                     <label className="text-xs text-slate-400 font-semibold uppercase tracking-widest block mb-2">Headquarters Address</label>
                     <textarea rows={3} defaultValue="Kasihan, Special Region of Yogyakarta, Indonesia" className="w-full bg-[#1A1E2E] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500 resize-none" />
                   </div>
                   <button className="px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-bold rounded-xl mt-2 transition-colors">Save Configurations</button>
                </div>
              )}

              {/* KONTEN: ACCOUNT & SECURITY */}
              {activeCategory === "account" && (
                <div className="max-w-xl space-y-5">
                   <div className="flex items-center gap-4 mb-6 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                      <div className="w-12 h-12 rounded-full bg-indigo-500 flex items-center justify-center text-lg font-black text-white">{profile?.name?.substring(0,2).toUpperCase()}</div>
                      <div>
                        <p className="text-white font-bold">{profile?.name}</p>
                        <p className="text-xs text-indigo-400 uppercase tracking-widest">{profile?.role}</p>
                      </div>
                   </div>
                   <div>
                     <label className="text-xs text-slate-400 font-semibold uppercase tracking-widest block mb-2">Registered Email</label>
                     <input type="text" readOnly value={profile?.email} className="w-full bg-[#1A1E2E] opacity-50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-400 outline-none cursor-not-allowed" />
                     <p className="text-[10px] text-slate-500 mt-1">Email Direktur tidak dapat diubah dari dashboard.</p>
                   </div>
                   <hr className="border-white/5 my-6" />
                   <div>
                     <label className="text-xs text-slate-400 font-semibold uppercase tracking-widest block mb-2">Update Password</label>
                     <input type="password" placeholder="Masukkan password baru" className="w-full bg-[#1A1E2E] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500" />
                   </div>
                   <button className="px-6 py-2.5 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 text-rose-400 text-sm font-bold rounded-xl mt-2 transition-colors">Force Update Password</button>
                </div>
              )}

              {/* KONTEN: LAINNYA */}
              {(activeCategory === "leave" || activeCategory === "notifications") && (
                <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                   <CheckCircle2 size={48} className="mb-4 text-emerald-500/30" />
                   <p className="text-sm font-medium">Pengaturan default sudah diterapkan dengan baik.</p>
                   <p className="text-xs mt-1 text-center max-w-sm">Anda bisa mengubah batas kuota cuti dan sistem notifikasi email pada pembaruan aplikasi Nadi versi 2.0.</p>
                </div>
              )}

            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}