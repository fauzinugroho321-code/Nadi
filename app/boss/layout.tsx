"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { LayoutDashboard, Users, Clock, CalendarDays, CheckSquare, DollarSign, BarChart2, Settings, Search, Bell } from "lucide-react";
import LogoutButton from "@/components/ui/LogoutButton";
import { getUserProfile, getMyNotifications } from "@/app/actions/user";

const NAV_ITEMS = [
  { id: "/boss/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { id: "/boss/employees", icon: Users, label: "Employees" },
  { id: "/boss/attendance", icon: Clock, label: "Attendance" },
  { id: "/boss/tasks", icon: CheckSquare, label: "Tasks" },
  { id: "/boss/payroll", icon: DollarSign, label: "Payroll" },
  { id: "/boss/leave-requests", icon: CalendarDays, label: "Leave Requests" },
  { id: "/boss/reports", icon: BarChart2, label: "Reports" },
  { id: "/boss/settings", icon: Settings, label: "Settings" },
];

export default function BossLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [hovered, setHovered] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);

  const [notifs, setNotifs] = useState<any[]>([]);
  const [showNotif, setShowNotif] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    getUserProfile().then(setProfile).catch(console.error);
    getMyNotifications().then(setNotifs).catch(console.error);
  }, []);

  const initials = profile?.name ? profile.name.substring(0, 2).toUpperCase() : "BS";

  if (pathname.match(/^\/boss\/employees\/[^/]+$/)) return <>{children}</>;

  return (
    <div className="flex h-screen overflow-hidden font-sans bg-[#0A0E17] text-white">
      <aside className="fixed left-0 top-0 h-full flex flex-col items-center py-6 z-50 w-[72px]">
       <div className="mb-12 w-11 h-11 rounded-xl overflow-hidden shadow-[0_0_16px_rgba(99,102,241,0.5)] border border-white/10 shrink-0">
  <img src="/nadi.jpg" alt="Logo" className="w-full h-full object-cover" />
</div>
        <nav className="flex-1 flex flex-col gap-3 relative w-full items-center">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.id);
            return (
              <div key={item.id} className="relative flex items-center justify-center w-full" onMouseEnter={() => setHovered(item.id)} onMouseLeave={() => setHovered(null)}>
                {isActive && <div className="absolute left-0 w-1 h-8 bg-indigo-500 rounded-r-full shadow-[0_0_12px_rgba(99,102,241,0.6)]" />}
                <Link href={item.id} className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200 ${isActive ? 'text-indigo-400 bg-indigo-500/15' : 'text-gray-500 hover:text-gray-300'}`}><item.icon size={20} /></Link>
                <AnimatePresence>
                  {hovered === item.id && (
                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="absolute left-14 z-50 px-4 py-2 rounded-full bg-[#1a1e2e]/90 backdrop-blur-xl border border-indigo-500/20 whitespace-nowrap"><span className="text-sm text-gray-200">{item.label}</span></motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>
        <LogoutButton />
        <div className="mt-4 w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-sm font-medium shadow-lg">{initials}</div>
      </aside>

      <div className="flex flex-col flex-1 ml-[72px] min-w-0 relative z-10">
        <header className="h-16 border-b border-white/5 backdrop-blur-sm bg-[#0A0E17]/50 px-8 flex items-center justify-between sticky top-0 z-40">
          
          {/* SEARCH BOS */}
          <div className="flex items-center gap-4 flex-1 max-w-xl relative">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onFocus={() => setShowSearch(true)} onBlur={() => setTimeout(() => setShowSearch(false), 200)} placeholder="Search analytics, reports, employees..." className="w-full pl-9 pr-4 py-2 bg-[#1a1e2e]/60 border border-white/10 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-indigo-500/50" />
            </div>
            <AnimatePresence>
              {showSearch && searchQuery && (
                <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} className="absolute left-0 top-12 mt-1 w-full bg-[#151929] border border-indigo-500/20 rounded-xl shadow-2xl p-2 z-50">
                  <div className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-white/5 mb-1">Executive Search</div>
                  <div className="p-4 text-xs text-slate-400 text-center flex flex-col gap-1 items-center">
                    <Search size={16} className="text-cyan-400 mb-1 animate-pulse" />
                    <span>Mencari data "{searchQuery}"...</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-4 relative">
            {/* NOTIF BOS */}
            <div className="relative">
              <button onClick={() => setShowNotif(!showNotif)} className={`relative p-2 rounded-lg transition-colors ${showNotif ? "bg-indigo-500/20 text-indigo-400" : "text-gray-400 hover:text-gray-200"}`}>
                <Bell size={18} />
                {notifs.length > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.6)]" />}
              </button>
              <AnimatePresence>
                {showNotif && (
                  <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className="absolute right-0 mt-3 w-80 bg-[#151B28] border border-indigo-500/20 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden z-50">
                    <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                      <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Executive Alerts</h3>
                    </div>
                    <div className="max-h-72 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
                      {notifs.length === 0 ? (
                        <div className="p-8 text-[11px] text-slate-500 text-center flex flex-col items-center gap-2"><Bell size={20} className="opacity-20"/> No alerts pending.</div>
                      ) : (
                        notifs.map(n => (
                          <div key={n.id} className="p-4 border-b border-white/5 hover:bg-white/[0.03] transition-colors cursor-pointer">
                            <p className="text-[12px] text-slate-300 leading-relaxed">{n.message}</p>
                            <p className="text-[9px] text-slate-500 mt-2 font-medium uppercase tracking-wider">{new Date(n.createdAt).toLocaleDateString()}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <div className="flex items-center gap-3 pl-4 border-l border-white/10">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-medium text-gray-200">{profile?.name || "Loading..."}</div>
                <div className="text-xs text-gray-500">Executive Director</div>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-8" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(99,102,241,0.2) transparent" }}>
          {children}
        </main>
      </div>
    </div>
  );
}