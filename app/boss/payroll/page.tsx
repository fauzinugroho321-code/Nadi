"use client";

import { useState, useEffect } from "react";
import { Download, RefreshCw, Send, CheckCircle2, DollarSign, Users, Building2, XCircle } from "lucide-react";
import { getPayrollApprovals, approveAndPayPayroll, rejectPayroll } from "@/app/actions/boss";

export default function BossPayroll() {
  const [payrolls, setPayrolls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  
  // Periode dinamis mengikuti bulan berjalan
  const period = new Date().getFullYear() + "-" + String(new Date().getMonth() + 1).padStart(2, '0');

  const fetchData = async () => {
    try {
      const data = await getPayrollApprovals(period);
      setPayrolls(data);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleApprove = async () => {
    if (!confirm("Otorisasi pencairan dana untuk bulan ini? Tindakan ini tidak dapat dibatalkan.")) return;
    setProcessing(true);
    try {
      await approveAndPayPayroll(period);
      await fetchData(); 
    } catch (error) { console.error(error); } finally { setProcessing(false); }
  };

  const handleReject = async () => {
    if (!confirm("Tolak draf ini dan kembalikan ke HR untuk direvisi?")) return;
    setProcessing(true);
    try {
      await rejectPayroll(period);
      await fetchData(); 
    } catch (error) { console.error(error); } finally { setProcessing(false); }
  };

  // FITUR BARU: Export Data ke CSV (Excel) untuk BOS
  const handleExportCSV = () => {
    const headers = ["Nama Karyawan,Divisi,Gaji Pokok,Tunjangan,Potongan,Net Take Home,Status"];
    const rows = payrolls.map(p => {
      const divName = p.user.division?.name || "-";
      return `"${p.user.name}","${divName}",${p.baseSalary},${p.allowance},${p.deductions},${p.totalAmount},"${p.status}"`;
    });

    const csvContent = "data:text/csv;charset=utf-8," + headers.concat(rows).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Executive_Payroll_Report_${period}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const idr = (n: number) => "Rp " + new Intl.NumberFormat("id-ID").format(n);

  if (loading) return <div className="flex-1 flex items-center justify-center text-indigo-400 h-full mt-20"><RefreshCw className="animate-spin" size={32} /></div>;

  const totalEmployees = payrolls.length;
  const totalBudget = payrolls.reduce((acc, curr) => acc + Number(curr.totalAmount), 0);
  const isAllPaid = payrolls.length > 0 && payrolls.every(p => p.status === "PAID" || p.status === "APPROVED");
  const isPendingBoss = payrolls.some(p => p.status === "SUBMITTED");

  return (
    <main className="flex-1 overflow-y-auto px-6 py-6 pb-20">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 mb-1">Payroll Approval</h1>
          <p className="text-sm text-slate-400">Review dan otorisasi pencairan dana untuk <span className="text-indigo-400 font-bold">{period}</span></p>
        </div>
        {/* Tombol Export CSV sekarang memanggil handleExportCSV */}
        <button onClick={handleExportCSV} disabled={payrolls.length === 0} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border border-white/10 text-slate-300 bg-[#0F1420] hover:bg-white/5 transition-colors disabled:opacity-50">
          <Download size={14} /> Export Report
        </button>
      </div>

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

      {payrolls.length > 0 && (
        <div className="bg-[#0F1520] border border-indigo-500/10 rounded-2xl overflow-hidden mb-8 shadow-xl">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-indigo-500/20 bg-indigo-500/5">
                <th className="py-4 px-5 text-xs font-black text-slate-400 uppercase tracking-wider">Karyawan</th>
                <th className="py-4 px-5 text-xs font-black text-slate-400 uppercase tracking-wider">Divisi</th>
                <th className="py-4 px-5 text-xs font-black text-slate-400 uppercase tracking-wider text-right">Gaji Pokok</th>
                <th className="py-4 px-5 text-xs font-black text-slate-400 uppercase tracking-wider text-right">Tunjangan</th>
                <th className="py-4 px-5 text-xs font-black text-rose-400 uppercase tracking-wider text-right">Potongan</th>
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
                  <td className="py-4 px-5 text-right font-mono text-sm text-rose-400">{Number(p.deductions) > 0 ? `-${idr(Number(p.deductions))}` : "-"}</td>
                  <td className="py-4 px-5 text-right font-mono text-sm font-bold text-indigo-300">{idr(Number(p.totalAmount))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isPendingBoss && (
        <div className="flex justify-end border-t border-white/10 pt-6 gap-4">
          <button onClick={handleReject} disabled={processing} className="flex items-center gap-2 px-6 py-4 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20 font-bold transition-colors disabled:opacity-50">
            <XCircle size={20} /> Reject & Revisi
          </button>
          <button onClick={handleApprove} disabled={processing} className="flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 hover:scale-[0.98] transition-transform text-white font-black shadow-[0_0_30px_rgba(99,102,241,0.5)] disabled:opacity-50">
            {processing ? <RefreshCw size={20} className="animate-spin" /> : <Send size={20} />}
            Approve & Transfer Dana Sekarang
          </button>
        </div>
      )}
    </main>
  );
}