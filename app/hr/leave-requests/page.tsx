"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Download, Check, X, RefreshCw, CalendarDays, CheckCircle2, XCircle } from "lucide-react";
import { getAllLeaveRequests, updateLeaveStatus } from "@/app/actions/hr";
import { format, differenceInDays } from "date-fns";

export default function LeaveRequests() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Fungsi penarik data dari server action
  const fetchData = async () => {
    try {
      const data = await getAllLeaveRequests();
      setRequests(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Fungsi trigger Approve / Reject
  const handleAction = async (id: string, status: "APPROVED" | "REJECTED") => {
    setActionLoading(id);
    try {
      // Optimistic update: Langsung ubah UI agar terasa responsif tanpa delay
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
      await updateLeaveStatus(id, status);
    } catch (error) {
      console.error(error);
      fetchData(); // Rollback jika gagal
    } finally {
      setActionLoading(null);
    }
  };

  // Memisahkan data yang belum diproses dan yang sudah menjadi riwayat
  const pending = requests.filter((r) => r.status === "PENDING");
  const history = requests.filter((r) => r.status !== "PENDING");

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 text-indigo-400 h-full min-h-[50vh]">
        <RefreshCw className="animate-spin" size={32} />
        <span className="text-sm font-medium animate-pulse">Mencari pengajuan cuti...</span>
      </div>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto px-6 py-5 pb-20">
      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 mb-1">Leave Requests</h1>
          <p className="text-sm text-slate-400">Tinjau dan setujui pengajuan libur karyawan.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border border-indigo-500/20 text-indigo-400 bg-indigo-500/10 shadow-[0_0_15px_rgba(99,102,241,0.1)] hover:bg-indigo-500/20 transition-colors">
            <Download size={14} /> Export
          </button>
        </div>
      </div>

      {/* Daftar Tunggu (Pending) */}
      <div className="mb-10">
        <h2 className="font-bold text-base text-slate-100 mb-4 flex items-center gap-2">
          Pending Review 
          <span className="bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full text-xs">{pending.length}</span>
        </h2>
        
        {pending.length === 0 ? (
          <div className="bg-[#131B27]/50 border border-indigo-500/10 rounded-2xl p-8 flex flex-col items-center text-slate-500">
            <CheckCircle2 size={32} className="mb-2 opacity-30 text-emerald-400" />
            <p className="text-sm">Semua pengajuan cuti sudah diproses. Meja Anda bersih!</p>
          </div>
        ) : (
          <AnimatePresence>
            {pending.map((req) => {
              const initials = req.requester.name.split(' ').map((n: string) => n[0]).join('').substring(0,2).toUpperCase();
              const days = differenceInDays(new Date(req.endDate), new Date(req.startDate)) + 1;
              
              return (
                <motion.div key={req.id} exit={{ opacity: 0, height: 0, marginBottom: 0 }} className="rounded-2xl p-5 mb-3 border border-indigo-500/10 bg-[#131B27] flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold shadow-[0_0_15px_rgba(99,102,241,0.3)] shrink-0">{initials}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm text-slate-200 flex items-center gap-2">
                      {req.requester.name} 
                      <span className="text-[10px] text-slate-500 font-normal px-2 py-0.5 rounded bg-white/5 border border-white/5">{req.requester.division?.name || "No Division"}</span>
                    </div>
                    <div className="text-sm font-medium text-slate-300 mt-1">
                      {format(new Date(req.startDate), "dd MMM")} - {format(new Date(req.endDate), "dd MMM yyyy")} 
                      <span className="text-indigo-400 text-xs ml-2">({days} hari) • {req.type}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-2 p-2.5 bg-[#0F1220] rounded-lg border border-white/5 inline-block">{req.reason}</p>
                  </div>
                  <div className="flex sm:flex-col gap-2 w-full sm:w-auto mt-3 sm:mt-0">
                    <button disabled={actionLoading === req.id} onClick={() => handleAction(req.id, "APPROVED")} className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors disabled:opacity-50">
                      {actionLoading === req.id ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />} Approve
                    </button>
                    <button disabled={actionLoading === req.id} onClick={() => handleAction(req.id, "REJECTED")} className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-colors disabled:opacity-50">
                      {actionLoading === req.id ? <RefreshCw size={14} className="animate-spin" /> : <X size={14} />} Reject
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Riwayat yang sudah diproses */}
      <div>
        <h2 className="font-bold text-base text-slate-100 mb-4">Processed History</h2>
        {history.length === 0 ? (
           <p className="text-sm text-slate-500 italic">Belum ada riwayat cuti yang diproses.</p>
        ) : (
          <div className="rounded-2xl border border-indigo-500/10 bg-[#0F1220] overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-indigo-500/5 border-b border-indigo-500/10 text-xs text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-5 py-4">Employee</th>
                  <th className="px-5 py-4">Date Range</th>
                  <th className="px-5 py-4">Type</th>
                  <th className="px-5 py-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {history.map(req => (
                  <tr key={req.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3">
                      <p className="text-sm font-semibold text-slate-200">{req.requester.name}</p>
                      <p className="text-[10px] text-slate-500">{req.requester.division?.name || "-"}</p>
                    </td>
                    <td className="px-5 py-3 text-sm text-slate-300">
                      {format(new Date(req.startDate), "dd MMM yyyy")} - {format(new Date(req.endDate), "dd MMM yyyy")}
                    </td>
                    <td className="px-5 py-3 text-[10px] font-bold tracking-wider uppercase text-slate-400">{req.type}</td>
                    <td className="px-5 py-3">
                      {req.status === "APPROVED" ? (
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] px-2.5 py-1 rounded-full font-bold inline-flex items-center gap-1"><Check size={10}/> Approved</span>
                      ) : (
                        <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] px-2.5 py-1 rounded-full font-bold inline-flex items-center gap-1"><XCircle size={10}/> Rejected</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}