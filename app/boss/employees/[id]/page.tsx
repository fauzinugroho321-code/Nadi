"use client";

import { useState, useEffect } from "react";
import { Flag, X, RefreshCw } from "lucide-react";
import Link from "next/link";
import { motion } from "motion/react";
import { getEmployeeDetail } from "@/app/actions/hr";
import { format } from "date-fns";

export default function BossEmployeeDetail({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState("Overview");
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
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#080B11]/90 backdrop-blur-md">
        <div className="flex flex-col items-center gap-3 text-indigo-400">
          <RefreshCw className="animate-spin" size={32} />
          <span className="text-sm font-medium animate-pulse">Menarik berkas karyawan...</span>
        </div>
      </div>
    );
  }

  if (!emp) return <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#080B11]/90 text-white">Karyawan tidak ditemukan. <Link href="/boss/employees" className="ml-2 text-indigo-400">Kembali</Link></div>;

  const initials = emp.name.substring(0, 2).toUpperCase();
  const currentSalary = emp.salaries?.[0] || { baseSalary: 0, allowance: 0 };
  const totalGaji = Number(currentSalary.baseSalary) + Number(currentSalary.allowance);
  const idr = (n: number) => "Rp " + new Intl.NumberFormat("id-ID").format(n);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#080B11]/90 backdrop-blur-md">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative flex flex-col w-full max-w-5xl h-[85vh] bg-[#151B28] rounded-[22px] border border-white/10 shadow-2xl overflow-hidden">
                 
        {/* Header Modal */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-white/5 bg-[#151B28]/80 z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-xl font-bold text-white shadow-[0_0_20px_rgba(99,102,241,0.4)]">{initials}</div>
            <div>
              <h2 className="text-2xl font-bold text-white">{emp.name}</h2>
              <p className="text-sm text-slate-400 mt-1">{emp.role} <span className="bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full text-xs ml-2 border border-indigo-500/20">{emp.division?.name || "No Division"}</span></p>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex gap-6 mr-6">
                <div className="text-center"><div className="text-xl font-bold text-cyan-400">{emp.workType}</div><div className="text-xs text-slate-500">Work Type</div></div>
             </div>
             <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-amber-500/30 text-amber-400 bg-amber-500/10 text-sm font-semibold hover:bg-amber-500/20"><Flag size={14}/> Flag for HR</button>
             <Link href="/boss/employees" className="p-2 text-slate-500 hover:text-white"><X size={20}/></Link>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex px-8 border-b border-white/5">
          {["Overview", "Attendance", "Profile"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === tab ? "border-indigo-500 text-indigo-400" : "border-transparent text-slate-500 hover:text-slate-300"}`}>{tab}</button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8">
           {activeTab === "Overview" && (
             <div>
                <h3 className="text-white font-bold mb-4">Informasi Gaji</h3>
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

           {activeTab === "Attendance" && (
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

           {activeTab === "Profile" && (
             <div className="grid grid-cols-2 gap-6 max-w-2xl">
               <div>
                 <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Full Name</label>
                 <input type="text" readOnly value={emp.name} className="w-full bg-[#151929] border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none" />
               </div>
               <div>
                 <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email Address</label>
                 <input type="email" readOnly value={emp.email} className="w-full bg-[#151929] border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none" />
               </div>
             </div>
           )}
        </div>
      </motion.div>
    </div>
  );
}