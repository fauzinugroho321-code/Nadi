"use client";

import { useState, useEffect } from "react";
import { Search, Filter, RefreshCw } from "lucide-react";
import { getAllAttendances } from "@/app/actions/hr";
import { format } from "date-fns";

export default function HRAttendance() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Ambil data absensi seluruh karyawan dari database
  useEffect(() => {
    const fetchAttendances = async () => {
      try {
        const data = await getAllAttendances();
        setRecords(data);
      } catch (error) {
        console.error("Gagal mengambil log absensi:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAttendances();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 text-indigo-400 h-full min-h-[50vh]">
        <RefreshCw className="animate-spin" size={32} />
        <span className="text-sm font-medium animate-pulse">Menarik data mesin absensi...</span>
      </div>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto px-6 py-5">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-xl font-black text-slate-100">Attendance Log</h1>
          <p className="text-xs text-slate-400 mt-1">Manage and monitor employee daily attendance</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.1)] hover:bg-indigo-500/20 transition-colors">
            <Filter size={14} /> Filter Date
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-indigo-500/10 bg-[#0F1220] overflow-hidden shadow-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-indigo-500/10 bg-indigo-500/5">
              <th className="py-4 px-5 text-xs font-black text-slate-300 uppercase tracking-wider">Employee</th>
              <th className="py-4 px-5 text-xs font-black text-slate-300 uppercase tracking-wider">Date</th>
              <th className="py-4 px-5 text-xs font-black text-slate-300 uppercase tracking-wider">Clock In/Out</th>
              <th className="py-4 px-5 text-xs font-black text-slate-300 uppercase tracking-wider">Type</th>
              <th className="py-4 px-5 text-xs font-black text-slate-300 uppercase tracking-wider">Status</th>
              <th className="py-4 px-5 text-xs font-black text-slate-300 uppercase tracking-wider text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {records.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-sm text-slate-500">
                  Belum ada data absensi yang tercatat di sistem.
                </td>
              </tr>
            ) : (
              records.map((row) => (
                <tr key={row.id} className="border-b border-indigo-500/5 hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 px-5 text-sm font-semibold text-slate-200">{row.user.name}</td>
                  <td className="py-4 px-5 text-xs text-slate-400">{format(new Date(row.date), "dd MMM yyyy")}</td>
                  <td className="py-4 px-5 text-xs text-slate-300 font-mono">
                    <span className="text-cyan-400">{row.clockIn ? format(new Date(row.clockIn), "HH:mm") : "--:--"}</span> 
                    <span className="text-slate-500 mx-1">→</span> 
                    <span className="text-indigo-400">{row.clockOut ? format(new Date(row.clockOut), "HH:mm") : "--:--"}</span>
                  </td>
                  <td className="py-4 px-5">
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded bg-slate-800 text-slate-300 uppercase tracking-wider">
                      {row.actualWorkType || row.user.workType}
                    </span>
                  </td>
                  <td className="py-4 px-5">
                    <span className={`text-[10px] font-bold px-3 py-1 rounded-full border tracking-wider ${
                      row.status === "PRESENT" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                      row.status === "INCOMPLETE" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                      row.status === "LEAVE" ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" :
                      "bg-rose-500/10 text-rose-400 border-rose-500/20"
                    }`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="py-4 px-5 flex justify-end gap-2">
                    {row.status === "INCOMPLETE" ? (
                      <button className="text-[10px] font-bold px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 transition-colors">Fix Entry</button>
                    ) : (
                      <button className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors"><Search size={14} /></button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}