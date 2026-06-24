"use client";

import { useState, useEffect } from "react";
import { Search, RefreshCw, Users } from "lucide-react";
import { getAllEmployees } from "@/app/actions/hr"; // REUSE DARI HR!

export default function BossEmployees() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const data = await getAllEmployees();
        setEmployees(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  const filteredEmployees = employees.filter((emp) => 
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (emp.division?.name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 text-amber-400 h-full min-h-[50vh]">
        <RefreshCw className="animate-spin" size={32} />
        <span className="text-sm font-medium animate-pulse">Memuat direktori perusahaan...</span>
      </div>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto px-8 py-8 pb-20">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-100">Executive Directory</h1>
          <p className="text-sm text-slate-400 mt-1">Pantau seluruh staf aktif di perusahaan.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-[#0F1220] focus-within:border-amber-500/50 transition-colors w-72">
          <Search size={16} className="text-slate-500" />
          <input 
            type="text" 
            placeholder="Cari nama atau divisi..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent outline-none text-sm text-slate-200 w-full placeholder:text-slate-600 ml-2" 
          />
        </div>
      </div>

      <div className="rounded-2xl border border-white/5 bg-[#0F1220] overflow-hidden shadow-2xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.02]">
              <th className="py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-wider">Karyawan</th>
              <th className="py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-wider">Divisi</th>
              <th className="py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-wider">Tipe Kerja</th>
              <th className="py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map((emp) => (
              <tr key={emp.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                <td className="py-4 px-6">
                  <p className="text-sm font-bold text-slate-200">{emp.name}</p>
                  <p className="text-[10px] text-amber-500 uppercase tracking-wider font-bold mt-0.5">{emp.role}</p>
                </td>
                <td className="py-4 px-6 text-sm text-slate-300">{emp.division?.name || "-"}</td>
                <td className="py-4 px-6"><span className="text-[10px] font-bold px-3 py-1 rounded bg-slate-800 text-slate-300">{emp.workType}</span></td>
                <td className="py-4 px-6">
                  <span className={`text-[10px] font-bold px-3 py-1 rounded-full border ${emp.isActive ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-slate-800/50 text-slate-500 border-slate-700"}`}>
                    {emp.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}