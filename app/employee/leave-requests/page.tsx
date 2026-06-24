"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Check, CalendarDays, RefreshCw, Clock, XCircle } from "lucide-react";
import { getMyLeaveRequests, submitLeaveRequest } from "@/app/actions/leave";
import { format } from "date-fns";

export default function EmployeeLeaveRequests() {
  const [showForm, setShowForm] = useState(false);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // State untuk form
  const [type, setType] = useState<"CUTI" | "IZIN" | "SAKIT">("CUTI");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");

  // Mengambil riwayat cuti dari database
  const fetchRequests = async () => {
    try {
      const data = await getMyLeaveRequests();
      setRequests(data);
    } catch (error) {
      console.error("Gagal mengambil data cuti", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Mengirim form ke database
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await submitLeaveRequest({
        type,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason,
      });
      // Reset form & tutup panel
      setShowForm(false);
      setStartDate("");
      setEndDate("");
      setReason("");
      setType("CUTI");
      // Tarik ulang data terbaru
      await fetchRequests();
    } catch (error) {
      console.error("Gagal mengajukan cuti", error);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <span className="bg-emerald-500/20 text-emerald-400 text-[11px] px-3 py-1 rounded-full font-bold inline-flex items-center gap-1"><Check size={12}/> Approved</span>;
      case "REJECTED":
        return <span className="bg-rose-500/20 text-rose-400 text-[11px] px-3 py-1 rounded-full font-bold inline-flex items-center gap-1"><XCircle size={12}/> Rejected</span>;
      default:
        return <span className="bg-amber-500/20 text-amber-400 text-[11px] px-3 py-1 rounded-full font-bold inline-flex items-center gap-1"><Clock size={12}/> Pending</span>;
    }
  };

  if (loading) {
    return (
      <div className="h-64 flex flex-col items-center justify-center gap-3 text-indigo-400">
        <RefreshCw className="animate-spin" />
        <span className="text-sm font-medium animate-pulse">Memuat riwayat cuti...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 h-full pb-10">
      <div className="flex items-center justify-between bg-[#111527]/50 p-6 rounded-2xl border border-white/5">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
            <CalendarDays className="text-indigo-400" />
            Leave & Absence
          </h1>
          <p className="text-sm text-slate-400 mt-1">Ajukan dan pantau status permohonan libur Anda.</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)} 
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 transition-colors text-white rounded-xl text-sm font-medium shadow-[0_0_20px_rgba(99,102,241,0.2)]"
        >
          <Plus size={16} /> New Request
        </button>
      </div>

      {/* Quota Rings (Tampilan visual sementara) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-2">
         {[
           { label: "Sisa Cuti", val: "12", color: "text-cyan-400", border: "border-cyan-400", shadow: "shadow-[0_0_15px_rgba(34,211,238,0.2)]" },
           { label: "Cuti Terpakai", val: "0", color: "text-indigo-400", border: "border-indigo-400", shadow: "shadow-[0_0_15px_rgba(99,102,241,0.2)]" },
           { label: "Izin Sakit", val: "0", color: "text-amber-400", border: "border-amber-400", shadow: "shadow-[0_0_15px_rgba(245,158,11,0.2)]" },
           { label: "Tanpa Keterangan", val: "0", color: "text-rose-400", border: "border-rose-400", shadow: "shadow-[0_0_15px_rgba(244,63,94,0.2)]" }
         ].map(item => (
           <div key={item.label} className="bg-[#111527]/70 border border-white/5 rounded-2xl p-5 flex flex-col items-center justify-center gap-3">
             <div className={`w-16 h-16 rounded-full border-4 ${item.border} flex items-center justify-center ${item.shadow}`}>
                <span className={`text-xl font-bold ${item.color}`}>{item.val}</span>
             </div>
             <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{item.label}</span>
           </div>
         ))}
      </div>

      {/* Form Pengajuan Cuti Mulus */}
      <AnimatePresence>
        {showForm && (
           <motion.form 
              onSubmit={handleSubmit}
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: "auto" }} 
              exit={{ opacity: 0, height: 0 }} 
              className="bg-[#0F1223] border border-indigo-500/30 p-6 rounded-2xl overflow-hidden"
            >
              <h3 className="text-lg font-bold text-white mb-5">Form Pengajuan Cuti</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                 <div>
                   <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest block mb-2">Tipe Cuti</label>
                   <select 
                     value={type} 
                     onChange={(e: any) => setType(e.target.value)}
                     className="w-full bg-[#161B33] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500"
                   >
                     <option value="CUTI">Cuti Tahunan</option>
                     <option value="IZIN">Izin Keperluan</option>
                     <option value="SAKIT">Sakit</option>
                   </select>
                 </div>
                 <div>
                   <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest block mb-2">Tanggal Mulai</label>
                   <input 
                     type="date" required 
                     value={startDate} onChange={(e) => setStartDate(e.target.value)}
                     className="w-full bg-[#161B33] border border-white/10 rounded-xl px-4 py-2 text-sm text-white outline-none focus:border-indigo-500" 
                     color-scheme="dark" 
                   />
                 </div>
                 <div>
                   <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest block mb-2">Tanggal Selesai</label>
                   <input 
                     type="date" required min={startDate}
                     value={endDate} onChange={(e) => setEndDate(e.target.value)}
                     className="w-full bg-[#161B33] border border-white/10 rounded-xl px-4 py-2 text-sm text-white outline-none focus:border-indigo-500" 
                     color-scheme="dark" 
                   />
                 </div>
              </div>
              
              <div className="mb-6">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest block mb-2">Alasan Pengajuan</label>
                <textarea 
                  required rows={3} placeholder="Jelaskan alasan cuti/izin Anda..."
                  value={reason} onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-[#161B33] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-indigo-500 resize-none" 
                />
              </div>

              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 text-sm font-medium text-slate-400 hover:text-white transition-colors">Batal</button>
                <button type="submit" disabled={submitting} className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-br from-indigo-500 to-violet-500 text-white font-medium rounded-xl shadow-lg disabled:opacity-50">
                  {submitting ? <RefreshCw size={16} className="animate-spin" /> : <Check size={16} />}
                  Kirim Pengajuan
                </button>
              </div>
           </motion.form>
        )}
      </AnimatePresence>

      {/* Riwayat Pengajuan Cuti (Real dari DB) */}
      <div className="mt-2">
        <h2 className="text-lg font-bold text-white mb-4">Riwayat Pengajuan</h2>
        
        {requests.length === 0 ? (
          <div className="bg-[#111527]/50 border border-white/5 rounded-2xl p-10 flex flex-col items-center justify-center text-slate-500">
            <CalendarDays size={40} className="mb-3 opacity-20" />
            <p className="text-sm">Belum ada riwayat pengajuan cuti.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {requests.map((req) => (
              <div key={req.id} className="bg-[#0F1223] border border-white/5 hover:border-white/10 transition-colors rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                 <div>
                   <div className="flex items-center gap-3 mb-2">
                     <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                       {req.type}
                     </span>
                     <span className="text-xs text-slate-500 font-medium">
                       Diajukan pada {format(new Date(req.createdAt), "dd MMM yyyy")}
                     </span>
                   </div>
                   <p className="text-slate-200 font-semibold text-sm">
                     {format(new Date(req.startDate), "dd MMM yyyy")} — {format(new Date(req.endDate), "dd MMM yyyy")}
                   </p>
                   <p className="text-xs text-slate-500 mt-1 line-clamp-1 max-w-lg">{req.reason}</p>
                 </div>
                 <div className="text-left sm:text-right shrink-0">
                   {getStatusBadge(req.status)}
                 </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}