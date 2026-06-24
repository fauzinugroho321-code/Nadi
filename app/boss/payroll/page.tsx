"use client";

import { useState, useEffect } from "react";
import { Download, RefreshCw, CheckCircle2, DollarSign, Users, Building2, Send } from "lucide-react";
import { getPayrollApprovals, approveAndPayPayroll } from "@/app/actions/boss";

export default function BossPayroll() {
  const [payrolls, setPayrolls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  
  const period = "2026-06"; // Sesuai dengan draf dari HR

  const fetchData = async () => {
    try {
      const data = await getPayrollApprovals(period);
      setPayrolls(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async () => {
    setProcessing(true);
    try {
      await approveAndPayPayroll(period);
      await fetchData(); // Tarik data baru setelah sukses dicairkan
    } catch (error) {
      console.error(error);
    } finally {
      setProcessing(false);
    }
  };

  const idr = (n: number) => "Rp " + new Intl.NumberFormat("id-ID").format(n);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 text-indigo-400 h-full min-h-[50vh]">
        <RefreshCw className="animate-spin" size={32} />
        <span className="text-sm font-medium animate-pulse">Menarik laporan keuangan dari meja HR...</span>
      </div>
    );
  }

  // Hitung ringkasan eksekutif
  const totalEmployees = payrolls.length;
  const totalBudget = payrolls.reduce((acc, curr) => acc + Number(curr.totalAmount), 0);
  const isAllPaid = payrolls.every(p => p.status === "PAID" || p.status === "APPROVED");
  const isPendingBoss = payrolls.some(p => p.status === "SUBMITTED");

  return (
    <main className="flex-1 overflow-y-auto px-6 py-6 pb-20">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 mb-1">Payroll Approval</h1>
          <p className="text-sm text-slate-400">Review dan otorisasi pencairan dana untuk <span className="text-indigo-400 font-bold">{period}</span></p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border border-white/10 text-slate-300 bg-[#0F1420] hover:bg-white/5 transition-colors">
          <Download size={14} /> Export Report
        </button>
      </div>

      {/* Ringkasan Eksekutif */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-[#0F1520] border border-indigo-500/10 rounded-2xl p-6 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><DollarSign size={64} /></div>
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Total Pengeluaran</h3>
          <div className="text-3xl font-black text-white font-mono tracking-tighter">{idr(totalBudget)}</div>
        </div>
        
        <div className="bg-[#0F1520] border border-indigo-500/10 rounded-2xl p-6 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><Users size={64} /></div>
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Total Karyawan</h3>
          <div className="text-3xl font-black text-white font-mono tracking-tighter">{totalEmployees} <span className="text-sm font-medium text-slate-500 tracking-normal">Orang</span></div>
        </div>
        
        <div className="bg-[#0F1520] border border-indigo-500/10 rounded-2xl p-6 shadow-lg flex flex-col justify-center items-start">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Status Bulan Ini</h3>
          {isAllPaid ? (
             <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2">
               <CheckCircle2 size={18}/> Cleared & Paid
             </span>
          ) : isPendingBoss ? (
             <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 animate-pulse">
               Menunggu Persetujuan Anda
             </span>
          ) : (
             <span className="bg-slate-800 text-slate-400 border border-slate-700 px-4 py-2.5 rounded-xl text-sm font-bold">
               Belum ada draf dari HR
             </span>
          )}
        </div>
      </div>

      {/* Tabel Rincian */}
      {payrolls.length > 0 && (
        <div className="bg-[#0F1520] border border-indigo-500/10 rounded-2xl overflow-hidden mb-8 shadow-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-indigo-500/20 bg-indigo-500/5">
                <th className="py-4 px-5 text-xs font-black text-slate-400 uppercase tracking-wider">Karyawan</th>
                <th className="py-4 px-5 text-xs font-black text-slate-400 uppercase tracking-wider">Divisi</th>
                <th className="py-4 px-5 text-xs font-black text-slate-400 uppercase tracking-wider text-right">Gaji Pokok</th>
                <th className="py-4 px-5 text-xs font-black text-slate-400 uppercase tracking-wider text-right">Tunjangan</th>
                <th className="py-4 px-5 text-xs font-black text-indigo-400 uppercase tracking-wider text-right">Net Take Home</th>
              </tr>
            </thead>
            <tbody>
              {payrolls.map(p => (
                <tr key={p.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 px-5 font-bold text-slate-200">{p.user.name}</td>
                  <td className="py-4 px-5 text-xs font-medium text-slate-400"><span className="flex items-center gap-1.5"><Building2 size={12}/> {p.user.division?.name || "-"}</span></td>
                  <td className="py-4 px-5 text-right font-mono text-sm text-slate-300">{idr(Number(p.baseSalary))}</td>
                  <td className="py-4 px-5 text-right font-mono text-sm text-emerald-400">+{idr(Number(p.allowance))}</td>
                  <td className="py-4 px-5 text-right font-mono text-sm font-bold text-indigo-300">{idr(Number(p.totalAmount))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tombol Eksekusi Meja Bos! */}
      {isPendingBoss && (
        <div className="flex justify-end border-t border-white/10 pt-6">
          <button 
            onClick={handleApprove}
            disabled={processing}
            className="flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 hover:scale-[0.98] transition-transform text-white font-black shadow-[0_0_30px_rgba(99,102,241,0.5)] disabled:opacity-50"
          >
            {processing ? <RefreshCw size={20} className="animate-spin" /> : <Send size={20} />}
            Approve & Transfer Dana Sekarang
          </button>
        </div>
      )}
    </main>
  );
}