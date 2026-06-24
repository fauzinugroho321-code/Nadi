"use client";

import { useState, useEffect } from "react";
import { Check, X, RefreshCw, CheckCircle2, XCircle } from "lucide-react";
import { getAllLeaveRequests, updateLeaveStatus } from "@/app/actions/hr"; // REUSE DARI HR
import { format } from "date-fns";

export default function BossLeaveRequests() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

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

  const handleAction = async (id: string, status: "APPROVED" | "REJECTED") => {
    setActionLoading(id);
    try {
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
      await updateLeaveStatus(id, status);
    } catch (error) {
      console.error(error);
      fetchData(); 
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 text-amber-400 h-full min-h-[50vh]">
        <RefreshCw className="animate-spin" size={32} />
        <span className="text-sm font-medium animate-pulse">Menarik data cuti...</span>
      </div>
    );
  }

  const pending = requests.filter((r) => r.status === "PENDING");
  const history = requests.filter((r) => r.status !== "PENDING");

  return (
    <main className="flex-1 overflow-y-auto px-8 py-8 pb-20">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-100 mb-1">Leave Authorizations</h1>
        <p className="text-sm text-slate-400">Persetujuan cuti tingkat eksekutif.</p>
      </div>

      <div className="mb-10">
        <h2 className="font-bold text-sm text-amber-500 mb-4 uppercase tracking-widest">Pending Review ({pending.length})</h2>
        {pending.length === 0 ? (
          <div className="bg-[#131B27]/50 border border-white/5 rounded-2xl p-8 flex flex-col items-center text-slate-500">
            <CheckCircle2 size={32} className="mb-2 opacity-30 text-emerald-400" />
            <p className="text-sm">Tidak ada cuti yang menunggu persetujuan Anda.</p>
          </div>
        ) : (
          pending.map((req) => (
            <div key={req.id} className="rounded-2xl p-5 mb-3 border border-amber-500/10 bg-[#131B27] flex items-center justify-between shadow-lg">
              <div>
                <div className="font-bold text-sm text-slate-200">{req.requester.name} <span className="text-[10px] ml-2 text-slate-500 font-normal border border-white/10 px-2 py-0.5 rounded">{req.requester.division?.name || "No Division"}</span></div>
                <div className="text-sm text-slate-400 mt-1">{format(new Date(req.startDate), "dd MMM")} - {format(new Date(req.endDate), "dd MMM yyyy")} <span className="text-amber-400 ml-2">({req.type})</span></div>
                <p className="text-xs text-slate-500 mt-2 bg-black/20 p-2 rounded-lg inline-block border border-white/5">"{req.reason}"</p>
              </div>
              <div className="flex gap-2">
                <button disabled={actionLoading === req.id} onClick={() => handleAction(req.id, "APPROVED")} className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors">
                  {actionLoading === req.id ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />} Approve
                </button>
                <button disabled={actionLoading === req.id} onClick={() => handleAction(req.id, "REJECTED")} className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-colors">
                  {actionLoading === req.id ? <RefreshCw size={14} className="animate-spin" /> : <X size={14} />} Reject
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div>
        <h2 className="font-bold text-sm text-slate-500 mb-4 uppercase tracking-widest">Processed History</h2>
        <div className="rounded-2xl border border-white/5 bg-[#0F1220] overflow-hidden shadow-xl">
          <table className="w-full text-left">
            <thead className="bg-white/[0.02] border-b border-white/5 text-xs text-slate-400 uppercase tracking-wider font-semibold">
              <tr><th className="px-6 py-4">Karyawan</th><th className="px-6 py-4">Tanggal</th><th className="px-6 py-4">Status</th></tr>
            </thead>
            <tbody>
              {history.map(req => (
                <tr key={req.id} className="border-b border-white/5">
                  <td className="px-6 py-4 text-sm font-bold text-slate-200">{req.requester.name}</td>
                  <td className="px-6 py-4 text-sm text-slate-400">{format(new Date(req.startDate), "dd MMM")} - {format(new Date(req.endDate), "dd MMM yyyy")}</td>
                  <td className="px-6 py-4">
                    {req.status === "APPROVED" ? (
                      <span className="text-emerald-400 text-[10px] font-bold"><CheckCircle2 size={12} className="inline mr-1"/> APPROVED</span>
                    ) : (
                      <span className="text-rose-400 text-[10px] font-bold"><XCircle size={12} className="inline mr-1"/> REJECTED</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}