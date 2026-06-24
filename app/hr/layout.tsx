"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { LayoutDashboard, Users, Clock, CalendarDays, CheckSquare, DollarSign, Building2, Search, Bell } from "lucide-react";
import LogoutButton from "@/components/ui/LogoutButton";
import { getUserProfile, getMyNotifications } from "@/app/actions/user";

const NAV_ITEMS = [
  { id: "/hr/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { id: "/hr/employees", icon: Users, label: "Employees" },
  { id: "/hr/attendance", icon: Clock, label: "Attendance" },
  { id: "/hr/leave-requests", icon: CalendarDays, label: "Leave Requests" },
  { id: "/hr/tasks", icon: CheckSquare, label: "Tasks" },
  { id: "/hr/payroll", icon: DollarSign, label: "Payroll" },
  { id: "/hr/divisions", icon: Building2, label: "Divisions" },
];

export default function HRLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [hov, setHov] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  
  // State Baru untuk Notifikasi & Search
  const [notifs, setNotifs] = useState<any[]>([]);
  const [showNotif, setShowNotif] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    getUserProfile().then(setProfile).catch(console.error);
    getMyNotifications().then(setNotifs).catch(console.error);
  }, []);

  const initials = profile?.name ? profile.name.substring(0, 2).toUpperCase() : "HR";

  return (
    <div className="flex h-screen overflow-hidden font-sans" style={{ background: "#0A0E17" }}>
      <div className="fixed pointer-events-none z-0" style={{ width: 560, height: 560, borderRadius: "50%", top: -140, left: 160, background: "radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 68%)" }} />
      <aside className="fixed left-0 top-0 h-full z-50 flex flex-col items-center py-5 w-[60px]">
<div className="mb-5 flex flex-col items-center gap-[7px]">
  <div className="w-10 h-10 rounded-[10px] overflow-hidden shadow-[0_0_22px_rgba(99,102,241,0.5)] border border-white/10 shrink-0">
    <img src="/nadi.jpg" alt="Logo" className="w-full h-full object-cover" />
  </div>
</div>
        <nav className="flex flex-col gap-[2px] flex-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.id);
            return (
              <div key={item.id} className="relative flex items-center" onMouseEnter={() => setHov(item.id)} onMouseLeave={() => setHov(null)}>
                {isActive && <div className="absolute left-0 w-[3px] h-5 rounded-r-full" style={{ background: "#6366F1", boxShadow: "0 0 12px #6366F1" }} />}
                <Link href={item.id} className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-150 ${isActive ? "text-indigo-400 bg-indigo-500/10" : "text-slate-600 hover:text-slate-400"}`}>
                  <item.icon size={17} strokeWidth={isActive ? 2.5 : 2} />
                </Link>
                <AnimatePresence>
                  {hov === item.id && (
                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="absolute left-[48px] flex items-center gap-2 px-3 py-[7px] rounded-full whitespace-nowrap pointer-events-none" style={{ background: "rgba(8,11,21,0.94)", border: "1px solid rgba(99,102,241,0.22)", backdropFilter: "blur(20px)" }}>
                      <span className="text-[11px] font-semibold text-slate-200">{item.label}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>
        <LogoutButton />
      </aside>

      <div className="flex flex-col flex-1 ml-[60px] min-w-0 relative z-10">
        <header className="flex items-center gap-4 px-6 h-[52px] flex-shrink-0" style={{ borderBottom: "1px solid rgba(99,102,241,0.09)" }}>
          
          {/* SEARCH BAR INTERAKTIF */}
          <div className="relative w-64 z-50">
            <div className={`flex items-center gap-2.5 px-3 py-[7px] rounded-xl transition-colors ${showSearch ? "bg-[#151929] border border-indigo-500/50" : "bg-[#0F1220] border border-indigo-500/12"}`}>
              <Search size={13} className="text-slate-600" />
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onFocus={() => setShowSearch(true)} onBlur={() => setTimeout(() => setShowSearch(false), 200)} placeholder="Search employees, requests..." className="bg-transparent text-[11px] text-slate-300 placeholder-slate-600 outline-none w-full" />
            </div>
            <AnimatePresence>
              {showSearch && searchQuery && (
                <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} className="absolute left-0 mt-2 w-full bg-[#151929] border border-indigo-500/20 rounded-xl shadow-2xl p-2">
                  <div className="px-3 py-2 text-[9px] font-bold text-slate-500 uppercase tracking-widest border-b border-white/5 mb-1">Search Results</div>
                  <div className="p-4 text-xs text-slate-400 text-center flex flex-col gap-1 items-center">
                    <Search size={16} className="text-indigo-400 mb-1 animate-pulse" />
                    <span>Mencari "{searchQuery}"...</span>
                    <span className="text-[9px] text-slate-500 mt-1">Tekan 'Enter' untuk global search.</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex-1" />
          
          {/* NOTIFICATION BELL INTERAKTIF */}
          <div className="relative z-50">
            <button onClick={() => setShowNotif(!showNotif)} className={`relative p-[7px] rounded-xl transition-colors ${showNotif ? "bg-indigo-500/10 text-indigo-400" : "hover:bg-white/[.04] text-slate-400"}`}>
              <Bell size={16} />
              {notifs.length > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.6)]" />}
            </button>
            <AnimatePresence>
              {showNotif && (
                <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className="absolute right-0 mt-3 w-72 bg-[#151929] border border-indigo-500/20 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden">
                  <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                    <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Notifications</h3>
                    <span className="text-[10px] text-indigo-400 font-medium cursor-pointer hover:underline">Mark all read</span>
                  </div>
                  <div className="max-h-72 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
                    {notifs.length === 0 ? (
                      <div className="p-8 text-[11px] text-slate-500 text-center flex flex-col items-center gap-2"><Bell size={20} className="opacity-20"/> All caught up!</div>
                    ) : (
                      notifs.map(n => (
                        <div key={n.id} className="p-4 border-b border-white/5 hover:bg-white/[0.03] transition-colors cursor-pointer">
                          <p className="text-[11px] text-slate-300 leading-relaxed">{n.message}</p>
                          <p className="text-[9px] text-slate-500 mt-2 font-medium uppercase tracking-wider">{new Date(n.createdAt).toLocaleDateString()}</p>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div className="flex items-center gap-2.5 pl-3 border-l border-indigo-500/20">
            <div className="text-right">
              <p className="text-[11px] font-bold text-slate-200">{profile?.name || "Loading..."}</p>
              <p className="text-[9px] text-indigo-400 font-semibold tracking-widest uppercase">HR Manager</p>
            </div>
            <div className="w-8 h-8 rounded-full text-white text-[10px] font-black flex items-center justify-center bg-gradient-to-br from-indigo-500 to-violet-500 shadow-lg">{initials}</div>
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}