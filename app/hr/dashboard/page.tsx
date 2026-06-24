"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronRight, CheckCircle2, AlertCircle, Play, Zap, Check, RefreshCw } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { getHRDashboardSummary } from "@/app/actions/hr";
import Link from "next/link";

function Panel({ children, className = "", id }: { children: React.ReactNode; className?: string; id?: string }) {
  return (
    <div id={id} className={`rounded-2xl flex flex-col p-4 ${className}`} style={{ background: "linear-gradient(158deg, #0F1220 0%, #0C1019 100%)", border: "1px solid rgba(99,102,241,0.13)", boxShadow: "0 4px 28px rgba(0,0,0,0.5)" }}>
      {children}
    </div>
  );
}

export default function HRDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const summary = await getHRDashboardSummary();
        setData(summary);
      } catch (error) { console.error(error); } finally { setLoading(false); }
    };
    fetchSummary();
  }, []);

  const scrollToAttention = () => {
    document.getElementById("attention-section")?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const todayStr = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

  if (loading || !data) return (
    <div className="flex-1 flex flex-col items-center justify-center gap-3 text-indigo-400 h-full mt-20">
      <RefreshCw className="animate-spin" size={32} />
      <span className="text-sm font-medium animate-pulse">Menyiapkan panel kendali HR...</span>
    </div>
  );

  const ATTENDANCE_CHART = [
    { name: "Present", value: data.stats.present, color: "#22D3EE" },
    { name: "Late/Inc", value: data.stats.incomplete, color: "#F59E0B" },
    { name: "Absent", value: data.stats.absent, color: "#F87171" },
    { name: "On Leave", value: data.stats.leave, color: "#818CF8" },
  ];

  const totalRecorded = data.stats.present + data.stats.incomplete + data.stats.absent + data.stats.leave;
  const presentPercentage = totalRecorded === 0 ? 0 : Math.round((data.stats.present / totalRecorded) * 100);
  const totalAttention = data.pendingLeaves.length + data.flaggedAttendance.length;

  return (
    <main className="flex-1 overflow-y-auto px-5 py-4 pb-20" style={{ scrollbarWidth: "none" }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-[17px] font-black text-slate-100 tracking-tight leading-tight">Good morning, HR!</h1>
          <p className="text-[10.5px] text-slate-500 mt-[3px] font-medium">{todayStr}</p>
        </div>
        
        {/* BUG FIX: Badge sekarang bisa diklik dan akan scroll ke bawah */}
        {totalAttention > 0 && (
          <button onClick={scrollToAttention} className="flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.07)] hover:bg-amber-500/20 transition-colors animate-pulse cursor-pointer">
            <AlertCircle size={12} />
            {totalAttention} items need your attention today
          </button>
        )}
      </div>

      <div id="attention-section" className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mb-3.5 scroll-mt-20">
        <Panel>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-[12.5px] font-black text-slate-100">Pending Leaves</h3>
            <span className="text-[9.5px] font-bold px-2 py-[2px] rounded-full text-indigo-400 bg-indigo-500/20 border border-indigo-500/30">{data.pendingLeaves.length} Requests</span>
          </div>
          <div className="flex flex-col gap-[6px] flex-1">
            {data.pendingLeaves.length === 0 ? (
               <div className="flex-1 flex items-center justify-center text-[10px] text-slate-500 italic border border-dashed border-white/5 rounded-[11px]">Clear!</div>
            ) : (
              data.pendingLeaves.map((leave: any) => (
                <div key={leave.id} className="flex items-center justify-between p-2 rounded-[11px] bg-indigo-500/5 border border-indigo-500/10">
                   <p className="text-[11px] font-semibold text-slate-200">{leave.requester.name}</p>
                   <Link href="/hr/leave-requests" className="text-[10px] font-bold px-[10px] py-[5px] rounded-lg text-white bg-gradient-to-br from-indigo-500 to-violet-500 hover:scale-95 transition-transform">Review</Link>
                </div>
              ))
            )}
          </div>
        </Panel>

        <Panel>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-[12.5px] font-black text-slate-100">Active / Flagged</h3>
            <span className="text-[9.5px] font-bold px-2 py-[2px] rounded-full text-amber-500 bg-amber-500/10 border border-amber-500/30">{data.flaggedAttendance.length} Flagged</span>
          </div>
          <div className="flex flex-col gap-[6px] flex-1">
            {data.flaggedAttendance.length === 0 ? (
               <div className="flex-1 flex items-center justify-center text-[10px] text-slate-500 italic border border-dashed border-white/5 rounded-[11px]">Clear!</div>
            ) : (
              data.flaggedAttendance.map((issue: any) => (
                <div key={issue.id} className="flex items-center justify-between p-2 rounded-[11px] bg-amber-500/5 border border-amber-500/10">
                   <p className="text-[11px] font-semibold text-slate-200">{issue.user.name}</p>
                   <Link href="/hr/attendance" className="text-[10px] font-bold px-[10px] py-[5px] rounded-lg text-amber-400 border border-amber-500/30 hover:bg-amber-500/10 transition-colors">Track</Link>
                </div>
              ))
            )}
          </div>
        </Panel>

        <Panel>
          <h3 className="text-[12.5px] font-black text-slate-100 mb-4">Payroll Status</h3>
          <div className="flex items-center gap-2 px-3 py-2 rounded-[10px] mb-3 bg-cyan-500/5 border border-cyan-500/10">
             <CheckCircle2 size={12} className="text-cyan-400" />
             <p className="text-[11px] text-slate-400">Ready to calculate for this month.</p>
          </div>
          <Link href="/hr/payroll" className="w-full mt-auto py-[9px] rounded-xl text-[11px] font-black text-white flex items-center justify-center gap-[7px] bg-gradient-to-br from-indigo-500 to-violet-500 hover:scale-[0.98] transition-transform">
            <Play size={11} /> Open Payroll
          </Link>
        </Panel>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
         <Panel>
           <h3 className="text-[12.5px] font-black text-slate-100 mb-3">Today's Attendance</h3>
           <div className="flex items-center gap-4">
             <div className="relative w-[108px] h-[108px]">
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie data={ATTENDANCE_CHART} cx="50%" cy="50%" innerRadius={35} outerRadius={50} paddingAngle={2} dataKey="value" strokeWidth={0}>
                     {ATTENDANCE_CHART.map((e, i) => <Cell key={i} fill={e.color} />)}
                   </Pie>
                 </PieChart>
               </ResponsiveContainer>
               <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                 <span className="text-[15px] font-black text-slate-100">{presentPercentage}%</span>
               </div>
             </div>
             <div className="flex-1 grid grid-cols-2 gap-3">
               {ATTENDANCE_CHART.map((item) => (
                 <div key={item.name}>
                   <p className="text-[9.5px] text-slate-500 leading-tight mb-0.5">{item.name}</p>
                   <p className="text-[11px] font-black leading-tight" style={{ color: item.color }}>{item.value} Staff</p>
                 </div>
               ))}
             </div>
           </div>
         </Panel>
      </div>
    </main>
  );
}