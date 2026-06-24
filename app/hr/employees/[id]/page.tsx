"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, User, Calendar, DollarSign, RefreshCw } from "lucide-react";
import Link from "next/link";
import { getEmployeeDetail } from "@/app/actions/hr";
import { format } from "date-fns";

const TABS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "salary", label: "Salary History", icon: DollarSign },
  { id: "attendance", label: "Recent Activity", icon: Calendar },
];

export default function EmployeeDetail({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState("profile");
  const [emp, setEmp] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEmployeeDetail(params.id)
      .then(setEmp)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 text-indigo-400 h-[60vh]">
        <RefreshCw className="animate-spin" size={32} />
        <span className="text-sm font-medium animate-pulse">Menarik berkas karyawan...</span>
      </div>
    );
  }

  if (!emp) return <div className="p-10 text-white">Karyawan tidak ditemukan.</div>;

  const currentSalary = emp.salaries?.[0] || { baseSalary: 0, allowance: 0 };
  const totalGaji = Number(currentSalary.baseSalary) + Number(currentSalary.allowance);
  const idr = (n: number) => "Rp " + new Intl.NumberFormat("id-ID").format(n);

  return (
    <main className="flex-1 overflow-y-auto px-6 py-5">
      <div className="mb-6 flex items-center gap-4">
        <button onClick={() => window.history.back()} className="p-2 rounded-xl bg-[#0F1220] border border-indigo-500/20 text-slate-400 hover:text-indigo-400">
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-xl font-black text-slate-100">{emp.name}</h1>
          <p className="text-xs text-indigo-400 font-bold mt-0.5 tracking-wider uppercase">{emp.role} • {emp.division?.name || "No Division"}</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6 border-b border-indigo-500/10 pb-4 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === tab.id
                 ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/30"
                 : "text-slate-500 hover:text-slate-300 hover:bg-white/[0.02]"
            }`}
          >
            <tab.icon size={14} /> {tab.label}
          </button>
        ))}
      </div>

      <div className="p-6 rounded-2xl border border-indigo-500/10 bg-[#0F1220] shadow-xl min-h-[300px]">
        {activeTab === "profile" && (
          <div className="grid grid-cols-2 gap-6 max-w-2xl">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Full Name</label>
              <input type="text" readOnly value={emp.name} className="w-full bg-[#151929] border border-indigo-500/20 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email Address</label>
              <input type="email" readOnly value={emp.email} className="w-full bg-[#151929] border border-indigo-500/20 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Work Type</label>
              <input type="text" readOnly value={emp.workType} className="w-full bg-[#151929] border border-indigo-500/20 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none uppercase" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Status</label>
              <input type="text" readOnly value={emp.isActive ? "ACTIVE" : "INACTIVE"} className="w-full bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20 rounded-lg px-3 py-2 text-sm outline-none" />
            </div>
          </div>
        )}

        {activeTab === "salary" && (
          <div>
            <h3 className="text-white font-bold mb-4">Current Salary Settings</h3>
            <div className="flex gap-10">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Base Salary</p>
                <p className="text-xl font-mono text-slate-200 mt-1">{idr(Number(currentSalary.baseSalary))}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Allowance</p>
                <p className="text-xl font-mono text-emerald-400 mt-1">+{idr(Number(currentSalary.allowance))}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Total Monthly</p>
                <p className="text-xl font-mono font-bold text-indigo-400 mt-1">{idr(totalGaji)}</p>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === "attendance" && (
          <div>
             <h3 className="text-white font-bold mb-4">5 Hari Kehadiran Terakhir</h3>
             {emp.attendances.length === 0 ? <p className="text-slate-500 text-sm">Belum ada absen.</p> : (
               <table className="w-full text-left text-sm text-slate-300">
                 <tbody>
                   {emp.attendances.map((a: any) => (
                     <tr key={a.id} className="border-b border-white/5">
                       <td className="py-2">{format(new Date(a.date), "dd MMM yyyy")}</td>
                       <td className="py-2">{a.clockIn ? format(new Date(a.clockIn), "HH:mm") : "--"} - {a.clockOut ? format(new Date(a.clockOut), "HH:mm") : "--"}</td>
                       <td className="py-2 text-right"><span className="text-[10px] px-2 py-1 rounded bg-white/5">{a.status}</span></td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             )}
          </div>
        )}
      </div>
    </main>
  );
}