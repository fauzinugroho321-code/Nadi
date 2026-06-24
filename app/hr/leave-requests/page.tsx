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

  // Modal Tolak Cuti
  const [rejectModal, setRejectModal] = useState<{ isOpen: boolean; id: string }>({ isOpen: false, id: "" });
  const [rejectNote, setRejectNote] = useState("");

  const fetchData = async () => {
    try {
      const data = await getAllLeaveRequests();
      setRequests(data);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    try {
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status: "APPROVED" } : r));
      await updateLeaveStatus(id, "APPROVED");
    } catch (error) { fetchData(); } finally { setActionLoading(null); }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(rejectModal.id);
    try {
      setRequests(prev => prev.map(r => r.id === rejectModal.id ? { ...r, status: "REJECTED" } : r));
      await updateLeaveStatus(rejectModal.id, "REJECTED", rejectNote);
      setRejectModal({ isOpen: false, id: "" });
      setRejectNote("");
    } catch (error) { fetchData(); } finally { setActionLoading(null); }
  };

  const pending = requests.filter((r) => r.status === "PENDING");
  const history = requests.filter((r) => r.status !== "PENDING");

  if (loading) return <div className="flex-1 flex justify-center text-indigo-400 h-full mt-20"><RefreshCw className="animate-spin" size={32} /></div>;

  return (
    <main className="flex-1 overflow-y-auto px-6 py-5 pb-20">
      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 mb-1">Leave Requests</h1>
          <p className="text-sm text-slate-400">Tinjau dan setujui pengajuan libur karyawan.</p>
        </div>
        <button onClick={() => alert("Laporan PDF berhasil di-generate!")} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border border-indigo-500/20 text-indigo-400 bg-indigo-500/10 shadow-[0_0_15px_rgba(99,102,241,0.1)] hover:bg-indigo-500/20 transition-colors">
          <Download size={14} /> Export
        </button>
      </div>

      {/* Daftar Tunggu */}
      <div className="mb-10">
        <h2 className="font-bold text-base text-slate-100 mb-4 flex items-center gap-2">
          Pending Review <span className="bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full text-xs">{pending.length}</span>
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
                <motion.div key={req.id} exit={{ opacity: 0, height: 0 }} className="rounded-2xl p-5 mb-3 border border-indigo-500/10 bg-[#131B27] flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold shrink-0">{initials}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm text-slate-200 flex items-center gap-2">
                      {req.requester.name} <span className="text-[10px] text-slate-500 px-2 py-0.5 rounded bg-white/5 border border-white/5">{req.requester.division?.name || "No Division"}</span>
                    </div>
                    <div className="text-sm font-medium text-slate-300 mt-1">
                      {format(new Date(req.startDate), "dd MMM")} - {format(new Date(req.endDate), "dd MMM yyyy")} <span className="text-indigo-400 text-xs ml-2">({days} hari) • {req.type}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-2 p-2.5 bg-[#0F1220] rounded-lg border border-white/5 inline-block">{req.reason}</p>
                  </div>
                  <div className="flex gap-2">
                    <button disabled={actionLoading === req.id} onClick={() => handleApprove(req.id)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors">
                      {actionLoading === req.id ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />} Approve
                    </button>
                    <button disabled={actionLoading === req.id} onClick={() => setRejectModal({ isOpen: true, id: req.id })} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-colors">
                      <X size={14} /> Reject
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Riwayat */}
      <div>
        <h2 className="font-bold text-base text-slate-100 mb-4">Processed History</h2>
        {history.length === 0 ? <p className="text-sm text-slate-500 italic">Belum ada riwayat cuti.</p> : (
          <div className="rounded-2xl border border-indigo-500/10 bg-[#0F1220] overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-indigo-500/5 border-b border-indigo-500/10 text-xs text-slate-400 uppercase tracking-wider font-semibold">
                <tr><th className="px-5 py-4">Employee</th><th className="px-5 py-4">Date Range</th><th className="px-5 py-4">Type</th><th className="px-5 py-4">Status</th></tr>
              </thead>
              <tbody>
                {history.map(req => (
                  <tr key={req.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="px-5 py-3"><p className="text-sm font-semibold text-slate-200">{req.requester.name}</p><p className="text-[10px] text-slate-500">{req.requester.division?.name || "-"}</p></td>
                    <td className="px-5 py-3 text-sm text-slate-300">{format(new Date(req.startDate), "dd MMM yyyy")} - {format(new Date(req.endDate), "dd MMM yyyy")}</td>
                    <td className="px-5 py-3 text-[10px] font-bold tracking-wider uppercase text-slate-400">{req.type}</td>
                    <td className="px-5 py-3">
                      {req.status === "APPROVED" ? <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] px-2.5 py-1 rounded-full font-bold">Approved</span> : <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] px-2.5 py-1 rounded-full font-bold">Rejected</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL PENOLAKAN */}
      <AnimatePresence>
        {rejectModal.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.form initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} onSubmit={handleRejectSubmit} className="bg-[#151929] border border-rose-500/30 rounded-2xl p-6 w-full max-w-sm shadow-2xl relative">
              <button type="button" onClick={() => setRejectModal({ isOpen: false, id: "" })} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X size={18}/></button>
              <h2 className="text-lg font-bold text-rose-400 mb-1">Tolak Pengajuan Cuti</h2>
              <p className="text-xs text-slate-400 mb-5">Berikan alasan mengapa pengajuan ini ditolak.</p>
              
              <textarea required autoFocus rows={3} value={rejectNote} onChange={e => setRejectNote(e.target.value)} placeholder="Misal: Kuota cuti sudah habis, atau sedang banyak proyek..." className="w-full bg-[#0F1220] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-rose-500 resize-none mb-4" />
              
              <button type="submit" disabled={actionLoading === rejectModal.id} className="w-full py-3 rounded-xl bg-rose-500 text-white font-black flex items-center justify-center gap-2 hover:bg-rose-600 transition-colors disabled:opacity-50">
                {actionLoading === rejectModal.id ? <RefreshCw size={16} className="animate-spin" /> : "Konfirmasi Penolakan"}
              </button>
            </motion.form>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}