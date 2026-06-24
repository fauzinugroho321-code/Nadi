"use client";

import { useState, useEffect } from "react";
import { Users, DollarSign, Activity, TrendingUp, AlertCircle, RefreshCw, CheckCircle2, ArrowRight } from "lucide-react";
import { getBossDashboardSummary } from "@/app/actions/boss";
import Link from "next/link";

export default function BossDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const summary = await getBossDashboardSummary();
        setData(summary);
      } catch (error) {
        console.error("Gagal mengambil data eksekutif:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  const idr = (n: number) => "Rp " + new Intl.NumberFormat("id-ID").format(n || 0);
  const todayStr = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

  if (loading || !data) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 text-amber-400 h-full min-h-[50vh]">
        <RefreshCw className="animate-spin" size={32} />
        <span className="text-sm font-medium animate-pulse">Menghimpun metrik perusahaan...</span>
      </div>
    );
  }

  // Hitung tingkat kehadiran (Attendance Rate)
  const totalRecorded = data.attendance.present + data.attendance.incomplete + data.attendance.absent + data.attendance.leave;
  const attendanceRate = totalRecorded === 0 ? 0 : Math.round((data.attendance.present / totalRecorded) * 100);

  return (
    <main className="flex-1 overflow-y-auto px-8 py-8 pb-20">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-100 tracking-tight">Executive Overview</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">{todayStr}</p>
        </div>
        <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-full flex items-center gap-3 shadow-lg">
           <span className="relative flex h-3 w-3">
             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
             <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
           </span>
           <span className="text-xs font-bold text-slate-300">All Systems Operational</span>
        </div>
      </div>

      {/* Peringatan Persetujuan Gaji! */}
      {data.pendingPayrollCount > 0 && (
        <div className="mb-8 p-5 rounded-2xl bg-gradient-to-r from-amber-500/20 to-transparent border border-amber-500/30 flex items-center justify-between animate-in fade-in slide-in-from-top-4">
           <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400">
               <AlertCircle size={24} />
             </div>
             <div>
               <h3 className="text-base font-bold text-amber-400">Payroll Approval Required</h3>
               <p className="text-xs text-amber-400/80 mt-1">Terdapat <b>{data.pendingPayrollCount} slip gaji</b> bulan ini yang menunggu otorisasi akhir Anda.</p>
             </div>
           </div>
           <Link href="/boss/payroll" className="px-6 py-3 rounded-xl bg-amber-500 text-amber-950 font-black text-sm hover:scale-105 transition-transform flex items-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.3)]">
             Review & Approve <ArrowRight size={16} />
           </Link>
        </div>
      )}

      {/* Metrik Utama (High-Level Metrics) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Metrik 1: Total Headcount */}
        <div className="bg-[#0A0D14] border border-white/5 rounded-3xl p-6 relative overflow-hidden group hover:border-amber-500/30 transition-colors">
           <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity"><Users size={80} /></div>
           <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Company Headcount</h3>
           <div className="flex items-end gap-3">
             <div className="text-6xl font-black text-white">{data.totalEmployees}</div>
             <div className="text-sm font-bold text-emerald-400 flex items-center gap-1 pb-1.5"><TrendingUp size={14}/> Active</div>
           </div>
        </div>

        {/* Metrik 2: Payroll Burn Rate */}
        <div className="bg-[#0A0D14] border border-white/5 rounded-3xl p-6 relative overflow-hidden group hover:border-amber-500/30 transition-colors">
           <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity"><DollarSign size={80} /></div>
           <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Monthly Payroll Est.</h3>
           <div className="text-3xl lg:text-4xl font-black text-white font-mono tracking-tighter mt-4">
             {data.totalPayroll > 0 ? idr(data.totalPayroll) : "Calculating..."}
           </div>
        </div>

        {/* Metrik 3: Attendance Rate */}
        <div className="bg-[#0A0D14] border border-white/5 rounded-3xl p-6 relative overflow-hidden group hover:border-amber-500/30 transition-colors">
           <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity"><Activity size={80} /></div>
           <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Today's Attendance Rate</h3>
           <div className="flex items-end gap-3">
             <div className="text-6xl font-black text-white">{attendanceRate}%</div>
             <div className="text-sm font-bold text-slate-500 pb-2">of workforce</div>
           </div>
        </div>
      </div>

      {/* Rincian Kehadiran Minimalis */}
      <div>
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          <Activity size={16} /> Workforce Distribution Today
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#0F131D] p-5 rounded-2xl border border-cyan-500/10">
            <div className="text-3xl font-black text-cyan-400">{data.attendance.present}</div>
            <div className="text-xs text-slate-500 font-semibold mt-1">Present (WFO/WFH)</div>
          </div>
          <div className="bg-[#0F131D] p-5 rounded-2xl border border-amber-500/10">
            <div className="text-3xl font-black text-amber-500">{data.attendance.incomplete}</div>
            <div className="text-xs text-slate-500 font-semibold mt-1">Late / Incomplete</div>
          </div>
          <div className="bg-[#0F131D] p-5 rounded-2xl border border-indigo-500/10">
            <div className="text-3xl font-black text-indigo-400">{data.attendance.leave}</div>
            <div className="text-xs text-slate-500 font-semibold mt-1">On Leave</div>
          </div>
          <div className="bg-[#0F131D] p-5 rounded-2xl border border-rose-500/10">
            <div className="text-3xl font-black text-rose-400">{data.attendance.absent}</div>
            <div className="text-xs text-slate-500 font-semibold mt-1">Absent</div>
          </div>
        </div>
      </div>

    </main>
  );
}