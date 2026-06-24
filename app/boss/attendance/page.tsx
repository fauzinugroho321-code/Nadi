"use client";

import { useState, useEffect } from "react";
import { RefreshCw, Download } from "lucide-react";
import { getAllAttendances } from "@/app/actions/hr"; // REUSE DARI HR
import { format } from "date-fns";

export default function BossAttendance() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendances = async () => {
      try {
        const data = await getAllAttendances();
        setRecords(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchAttendances();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 text-amber-400 h-full min-h-[50vh]">
        <RefreshCw className="animate-spin" size={32} />
        <span className="text-sm font-medium animate-pulse">Menarik log absensi global...</span>
      </div>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto px-8 py-8 pb-20">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-100">Attendance Log</h1>
          <p className="text-sm text-slate-400 mt-1">Pantauan kehadiran harian seluruh staf.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl border border-white/10 bg-[#0F1420] text-slate-300 hover:bg-white/5 transition-colors">
          <Download size={16} /> Export CSV
        </button>
      </div>

      <div className="rounded-2xl border border-white/5 bg-[#0F1220] overflow-hidden shadow-2xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.02]">
              <th className="py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-wider">Karyawan</th>
              <th className="py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-wider">Tanggal</th>
              <th className="py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-wider">Clock In / Out</th>
              <th className="py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody>
            {records.map((row) => (
              <tr key={row.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                <td className="py-4 px-6 text-sm font-bold text-slate-200">{row.user.name}</td>
                <td className="py-4 px-6 text-sm text-slate-400">{format(new Date(row.date), "dd MMM yyyy")}</td>
                <td className="py-4 px-6 text-sm text-slate-300 font-mono">
                  <span className="text-cyan-400">{row.clockIn ? format(new Date(row.clockIn), "HH:mm") : "--:--"}</span> 
                  <span className="text-slate-500 mx-2">→</span> 
                  <span className="text-indigo-400">{row.clockOut ? format(new Date(row.clockOut), "HH:mm") : "--:--"}</span>
                </td>
                <td className="py-4 px-6">
                  <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full border tracking-wider ${
                    row.status === "PRESENT" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                    row.status === "INCOMPLETE" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                    row.status === "LEAVE" ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" :
                    "bg-rose-500/10 text-rose-400 border-rose-500/20"
                  }`}>{row.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}