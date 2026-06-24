"use client";

import { useState, useEffect } from "react";
import { LogIn, LogOut, CheckSquare, Bell, ChevronRight, CheckCircle2, RefreshCw, Circle, Clock } from "lucide-react";
import { getTodayAttendance, toggleClockInOut } from "@/app/actions/attendance";
import { getEmployeeDashboardData } from "@/app/actions/employee";
import { format } from "date-fns";

export default function EmployeeDashboard() {
  const [clockedIn, setClockedIn] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [hasClockedOut, setHasClockedOut] = useState(false);
  
  // State untuk data dari database
  const [tasks, setTasks] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // Tarik data absensi dan data dashboard secara bersamaan
        const [record, dashboardData] = await Promise.all([
          getTodayAttendance(),
          getEmployeeDashboardData()
        ]);

        // Proses Absensi (Bypass Vercel TypeScript Strictness)
        if (record && record.clockIn) {
          const clockInTime = new Date(record.clockIn as any).getTime();
          
          if (!record.clockOut) {
            setClockedIn(true);
            const diff = Math.floor((new Date().getTime() - clockInTime) / 1000);
            setElapsed(diff > 0 ? diff : 0);
          } else {
            setClockedIn(false);
            setHasClockedOut(true);
            const clockOutTime = new Date(record.clockOut as any).getTime();
            const diff = Math.floor((clockOutTime - clockInTime) / 1000);
            setElapsed(diff > 0 ? diff : 0);
          }
        }

        // Simpan Tasks & Notifications
        setTasks(dashboardData.tasks);
        setNotifications(dashboardData.notifications);

      } catch (error) {
        console.error("Gagal mengambil data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  useEffect(() => {
    let interval: any;
    if (clockedIn) interval = setInterval(() => setElapsed(s => s + 1), 1000);
    return () => clearInterval(interval);
  }, [clockedIn]);

  const handleClockToggle = async () => {
    if (hasClockedOut) return; 
    setActionLoading(true);
    try {
      await toggleClockInOut(); 
      if (!clockedIn) {
        setClockedIn(true);
        setElapsed(0);
      } else {
        setClockedIn(false);
        setHasClockedOut(true);
      }
    } catch (error) {
      console.error("Gagal melakukan absen:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const fmtTime = (secs: number) => {
    const h = String(Math.floor(secs / 3600)).padStart(2, '0');
    const m = String(Math.floor((secs % 3600) / 60)).padStart(2, '0');
    const s = String(secs % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  if (loading) {
    return (
      <div className="h-64 flex flex-col items-center justify-center gap-3 text-indigo-400">
        <RefreshCw className="animate-spin" />
        <span className="text-sm font-medium animate-pulse">Menyiapkan Dashboard...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Hero Clock In */}
      <section className={`relative rounded-3xl overflow-hidden p-10 transition-all duration-700 ${clockedIn ? 'bg-gradient-to-br from-[#111527] to-[#141130] border-indigo-500/30 shadow-[0_0_60px_rgba(99,102,241,0.1)]' : 'bg-gradient-to-br from-[#111527] to-[#0F1223] border-white/5'}`}>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col items-center gap-6">
             <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400">
               {hasClockedOut ? "Session Completed" : clockedIn ? "Session Active" : "Not Clocked In"}
             </p>
             <button 
                onClick={handleClockToggle} 
                disabled={actionLoading || hasClockedOut}
                className={`w-32 h-32 rounded-full flex flex-col items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50 disabled:scale-100 ${clockedIn ? 'bg-indigo-500/20 border-2 border-indigo-400/50 shadow-[0_0_40px_rgba(99,102,241,0.3)]' : 'bg-gradient-to-br from-indigo-500 to-violet-600 border-2 border-white/10 shadow-2xl hover:scale-105'}`}
             >
               {actionLoading ? (
                 <RefreshCw size={24} className="text-white animate-spin" />
               ) : clockedIn ? (
                 <LogOut size={24} className="text-indigo-200" />
               ) : (
                 <LogIn size={24} className="text-white" />
               )}
               <span className="text-xs font-bold text-white tracking-wide">
                 {hasClockedOut ? "Done for Today" : clockedIn ? "Clock Out" : "Clock In"}
               </span>
             </button>
             <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-emerald-300 flex items-center gap-2">
               <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"/> Working from Office
             </div>
          </div>
          <div className="flex flex-col items-center md:items-end flex-1">
             <div className="text-7xl lg:text-8xl font-black font-mono tracking-tighter text-slate-100">{fmtTime(elapsed)}</div>
             <p className="text-sm text-slate-400 mt-2">
               {hasClockedOut ? "Total work time today" : clockedIn ? "Today's work time" : "Start your session"}
             </p>
             <p className="text-[11px] text-slate-500 mt-4 max-w-xs text-center md:text-right">Only clock-in time and task activity are tracked. We never capture screen content.</p>
          </div>
        </div>
      </section>

      {/* Grid Bawah: Tasks & Notifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Kolom Tasks */}
        <div className="bg-[#111527]/70 border border-indigo-500/10 rounded-2xl p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-white font-semibold flex items-center gap-2"><CheckSquare size={16} className="text-indigo-400"/> Active Tasks</h3>
            <button className="text-xs text-indigo-400 flex items-center hover:text-indigo-300 transition">View all <ChevronRight size={14}/></button>
          </div>
          <div className="space-y-4 flex-1">
             {tasks.length > 0 ? (
               tasks.map((task) => (
                 <div key={task.id} className="flex items-start gap-3 group">
                   {task.status === "IN_PROGRESS" ? (
                     <RefreshCw size={16} className="text-amber-400 shrink-0 mt-0.5 animate-[spin_3s_linear_infinite]" />
                   ) : (
                     <Circle size={16} className="text-slate-500 shrink-0 mt-0.5" />
                   )}
                   <div>
                     <p className="text-sm text-slate-200 group-hover:text-indigo-300 transition-colors cursor-pointer">{task.title}</p>
                     {task.dueDate && (
                       <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
                         <Clock size={10} /> Due {format(new Date(task.dueDate as any), "MMM dd")}
                       </p>
                     )}
                   </div>
                 </div>
               ))
             ) : (
               <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-2 py-4">
                 <CheckCircle2 size={32} className="text-emerald-500/30" />
                 <p className="text-sm">Tidak ada tugas aktif.</p>
                 <p className="text-xs text-slate-600">Santai sejenak, Anda hebat!</p>
               </div>
             )}
          </div>
        </div>

        {/* Kolom Updates */}
        <div className="bg-[#111527]/70 border border-indigo-500/10 rounded-2xl p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-white font-semibold flex items-center gap-2"><Bell size={16} className="text-indigo-400"/> Updates</h3>
          </div>
          <div className="space-y-3 flex-1">
             {notifications.length > 0 ? (
               notifications.map((notif) => (
                 <div key={notif.id} className="p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                   <p className="text-sm text-slate-200">{notif.message}</p>
                   <p className="text-[10px] text-slate-500 mt-1.5">{format(new Date(notif.createdAt as any), "dd MMM yyyy, HH:mm")}</p>
                 </div>
               ))
             ) : (
               <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-2 py-4">
                 <Bell size={32} className="text-slate-700/50" />
                 <p className="text-sm">Belum ada pembaruan terbaru.</p>
               </div>
             )}
          </div>
        </div>

      </div>
    </div>
  );
}