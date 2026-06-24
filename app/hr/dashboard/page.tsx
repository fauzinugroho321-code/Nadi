"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronRight, CheckCircle2, AlertCircle, Play, Zap, Check } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

// Data Dummy (Nanti diganti dengan Prisma)
const LEAVES = [{ id: 1, name: "Arief Budiman", type: "Annual Leave" }, { id: 2, name: "Siti Rahayu", type: "Sick Leave" }];
const ATTENDANCE = [{ id: 1, name: "Maya Putri", issue: "Forgot clock-out" }];
const ATTENDANCE_CHART = [
  { name: "Present", value: 68, color: "#22D3EE" },
  { name: "Late", value: 12, color: "#F59E0B" },
  { name: "Absent", value: 8, color: "#F87171" },
  { name: "On Leave", value: 12, color: "#818CF8" },
];

function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl flex flex-col p-4 ${className}`} style={{ background: "linear-gradient(158deg, #0F1220 0%, #0C1019 100%)", border: "1px solid rgba(99,102,241,0.13)", boxShadow: "0 4px 28px rgba(0,0,0,0.5)" }}>
      {children}
    </div>
  );
}

export default function HRDashboard() {
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

  return (
    <main className="flex-1 overflow-y-auto px-5 py-4" style={{ scrollbarWidth: "none" }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-[17px] font-black text-slate-100 tracking-tight leading-tight">Good morning, Ayu</h1>
          <p className="text-[10.5px] text-slate-500 mt-[3px] font-medium">{today}</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.07)]">
          <AlertCircle size={12} />
          7 items need your attention today
        </div>
      </div>

      {/* Primary Row */}
      <div className="grid grid-cols-3 gap-3.5 mb-3.5">
        <Panel>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-[12.5px] font-black text-slate-100">Pending Leave Approvals</h3>
            <span className="text-[9.5px] font-bold px-2 py-[2px] rounded-full text-indigo-400 bg-indigo-500/20 border border-indigo-500/30">{LEAVES.length} Requests</span>
          </div>
          <div className="flex flex-col gap-[6px]">
            {LEAVES.map(leave => (
              <div key={leave.id} className="flex items-center justify-between p-2 rounded-[11px] bg-indigo-500/5 border border-indigo-500/10">
                 <p className="text-[11px] font-semibold text-slate-200">{leave.name}</p>
                 <button className="text-[10px] font-bold px-[10px] py-[5px] rounded-lg text-white bg-gradient-to-br from-indigo-500 to-violet-500">Approve</button>
              </div>
            ))}
          </div>
        </Panel>

        <Panel>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-[12.5px] font-black text-slate-100">Incomplete Attendance</h3>
            <span className="text-[9.5px] font-bold px-2 py-[2px] rounded-full text-amber-500 bg-amber-500/10 border border-amber-500/30">{ATTENDANCE.length} Flagged</span>
          </div>
          <div className="flex flex-col gap-[6px]">
            {ATTENDANCE.map(issue => (
              <div key={issue.id} className="flex items-center justify-between p-2 rounded-[11px] bg-amber-500/5 border border-amber-500/10">
                 <p className="text-[11px] font-semibold text-slate-200">{issue.name}</p>
                 <button className="text-[10px] font-bold px-[10px] py-[5px] rounded-lg text-amber-400 border border-amber-500/30">Correct</button>
              </div>
            ))}
          </div>
        </Panel>

        <Panel>
          <h3 className="text-[12.5px] font-black text-slate-100 mb-4">Payroll Draft Status</h3>
          <div className="flex items-center gap-2 px-3 py-2 rounded-[10px] mb-3 bg-amber-500/5 border border-amber-500/10">
             <AlertCircle size={12} className="text-amber-400" />
             <p className="text-[11px] text-slate-400"><span className="font-bold text-amber-300">8 employees</span> missing entries</p>
          </div>
          <button className="w-full mt-auto py-[9px] rounded-xl text-[11px] font-black text-white flex items-center justify-center gap-[7px] bg-gradient-to-br from-indigo-500 to-violet-500">
            <Play size={11} /> Continue Payroll
          </button>
        </Panel>
      </div>

      {/* Secondary Row */}
      <div className="grid grid-cols-2 gap-3.5">
         <Panel>
           <h3 className="text-[12.5px] font-black text-slate-100 mb-3">Team Attendance Summary</h3>
           <div className="flex items-center gap-4">
             <div className="relative w-[108px] h-[108px]">
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie data={ATTENDANCE_CHART} cx="50%" cy="50%" innerRadius={29} outerRadius={50} paddingAngle={2} dataKey="value" strokeWidth={0}>
                     {ATTENDANCE_CHART.map((e, i) => <Cell key={i} fill={e.color} />)}
                   </Pie>
                 </PieChart>
               </ResponsiveContainer>
               <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                 <span className="text-[15px] font-black text-slate-100">68%</span>
               </div>
             </div>
             <div className="flex-1 grid grid-cols-2 gap-3">
               {ATTENDANCE_CHART.map((item) => (
                 <div key={item.name}>
                   <p className="text-[9.5px] text-slate-500 leading-tight">{item.name}</p>
                   <p className="text-[11px] font-black leading-tight" style={{ color: item.color }}>{item.value}%</p>
                 </div>
               ))}
             </div>
           </div>
         </Panel>
      </div>
    </main>
  );
}