"use client";

import { useEffect, useState } from "react";
import { Download, CheckCircle2, RefreshCw, PlusCircle, AlertCircle, Clock } from "lucide-react";
import { getMyPayrolls, createDemoPayroll } from "@/app/actions/payroll";

export default function EmployeePayroll() {
  const [payrolls, setPayrolls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [displaySalary, setDisplaySalary] = useState(0);

  // Ambil data dari database
  const fetchPayrolls = async () => {
    try {
      const data = await getMyPayrolls();
      setPayrolls(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayrolls();
  }, []);

  const latestPayroll = payrolls[0]; // Ambil slip gaji yang paling baru

  // Animasi angka menghitung naik (Count-Up)
  useEffect(() => {
    if (latestPayroll) {
      const targetSalary = Number(latestPayroll.totalAmount);
      let current = 0;
      const step = targetSalary / 30;
      const timer = setInterval(() => {
        current += step;
        if (current >= targetSalary) {
          setDisplaySalary(targetSalary);
          clearInterval(timer);
        } else {
          setDisplaySalary(current);
        }
      }, 30);
      return () => clearInterval(timer);
    }
  }, [latestPayroll]);

  // Tombol trigger data demo
  const handleGenerateDemo = async () => {
    setGenerating(true);
    await createDemoPayroll();
    await fetchPayrolls();
    setGenerating(false);
  };

  // Helper pemformat Rupiah
  const fmtRp = (n: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

  if (loading) {
    return (
      <div className="h-64 flex flex-col items-center justify-center gap-3 text-indigo-400">
        <RefreshCw className="animate-spin" />
        <span className="text-sm font-medium animate-pulse">Membuka brankas slip gaji...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      <div className="flex items-start md:items-center justify-between flex-col md:flex-row gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">My Payroll</h1>
          <p className="text-slate-400">Your salary history and payslips.</p>
        </div>
        
        {/* Tampilkan tombol demo HANYA jika database payroll kosong */}
        {!latestPayroll && (
          <button
            onClick={handleGenerateDemo}
            disabled={generating}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-xl transition-all shadow-[0_0_20px_rgba(99,102,241,0.2)] disabled:opacity-50"
          >
            {generating ? <RefreshCw size={16} className="animate-spin" /> : <PlusCircle size={16} />}
            Buat Demo Slip Gaji
          </button>
        )}
      </div>

      {!latestPayroll ? (
         <div className="bg-[#111527]/50 border border-white/5 rounded-2xl p-10 flex flex-col items-center justify-center text-slate-500 text-center gap-3">
           <AlertCircle size={40} className="opacity-30" />
           <p>Belum ada slip gaji yang diterbitkan untuk Anda bulan ini.</p>
           <p className="text-xs">Klik tombol "Buat Demo Slip Gaji" di atas untuk simulasi.</p>
         </div>
      ) : (
        <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 md:p-10 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.3)] relative overflow-hidden animate-in zoom-in-95 duration-500">
          {/* Latar Belakang Ambient */}
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="flex items-center justify-between mb-10 relative z-10">
            <h2 className="text-xl font-semibold text-white">Periode: {latestPayroll.period}</h2>
            <span className={`border px-4 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 ${
              latestPayroll.status === "PAID" ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/30" : "bg-amber-500/20 text-amber-400 border-amber-500/30"
            }`}>
              {latestPayroll.status === "PAID" ? <CheckCircle2 size={16}/> : <Clock size={16}/>}
              {latestPayroll.status}
            </span>
          </div>

          <div className="mb-10 pb-8 border-b border-white/10 relative z-10">
            <p className="text-slate-400 mb-2">Total Diterima</p>
            <div className="text-5xl md:text-6xl font-black text-white font-mono tracking-tighter mb-2">{fmtRp(displaySalary)}</div>
            <p className="text-sm text-slate-500">Net Take-Home Pay</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
            {/* Pemasukan */}
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Earnings (Pemasukan)</h3>
              <div className="space-y-4 text-sm">
                 <div className="flex justify-between"><span className="text-slate-400">Gaji Pokok</span><span className="text-white font-mono">{fmtRp(Number(latestPayroll.baseSalary))}</span></div>
                 <div className="flex justify-between"><span className="text-slate-400">Tunjangan</span><span className="text-white font-mono">{fmtRp(Number(latestPayroll.allowance))}</span></div>
                 <div className="flex justify-between pt-3 border-t border-white/10 font-bold"><span className="text-slate-300">Total Pemasukan</span><span className="text-white font-mono">{fmtRp(Number(latestPayroll.baseSalary) + Number(latestPayroll.allowance))}</span></div>
              </div>
            </div>

            {/* Potongan */}
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Deductions (Potongan)</h3>
              <div className="space-y-4 text-sm">
                {Number(latestPayroll.deductions) > 0 ? (
                   <>
                     <div className="flex justify-between"><span className="text-slate-400">Potongan (Pajak/Lainnya)</span><span className="text-rose-400 font-mono">-{fmtRp(Number(latestPayroll.deductions))}</span></div>
                     <div className="flex justify-between pt-3 border-t border-white/10 font-bold"><span className="text-slate-300">Total Potongan</span><span className="text-rose-400 font-mono">-{fmtRp(Number(latestPayroll.deductions))}</span></div>
                   </>
                ) : (
                  <div className="text-slate-500 italic">Tidak ada potongan bulan ini. Hebat!</div>
                )}
              </div>
            </div>
          </div>

          <button className="w-full mt-10 py-4 rounded-xl border-2 border-indigo-500/30 text-indigo-400 font-bold hover:bg-indigo-500/10 transition-colors flex items-center justify-center gap-2 relative z-10">
            <Download size={18} /> Download Slip Gaji (PDF)
          </button>
        </div>
      )}
    </div>
  );
}