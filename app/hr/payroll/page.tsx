"use client";

import { useState, useEffect } from "react";
import { Download, ChevronLeft, ChevronRight, RefreshCw, Send, CheckCircle2, ShieldCheck } from "lucide-react";
import { getPayrollDrafts, submitPayrollBatch } from "@/app/actions/hr";

export default function Payroll() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<"DRAFT" | "SUBMITTED" | "APPROVED">("DRAFT");
  
  const period = "2026-06"; // Set bulan Juni 2026

  useEffect(() => {
    const fetchDrafts = async () => {
      try {
        const data = await getPayrollDrafts(period);
        
        // Pengecekan status: Apakah bulan ini sudah di-submit ke Boss?
        const isAlreadySubmitted = data.some((emp: any) => emp.payrolls[0]?.status === "SUBMITTED");
        const isAlreadyApproved = data.some((emp: any) => emp.payrolls[0]?.status === "APPROVED" || emp.payrolls[0]?.status === "PAID");
        
        if (isAlreadyApproved) setStatus("APPROVED");
        else if (isAlreadySubmitted) setStatus("SUBMITTED");
        
        // Bersihkan dan siapkan datanya untuk tabel
        const formatted = data.map((emp: any) => {
          const salaryData = emp.salaries[0] || { baseSalary: 10000000, allowance: 2500000 }; // Fallback jika HR belum set gaji
          const deductions = 0; // Default 0 untuk simulasi
          const totalAmount = Number(salaryData.baseSalary) + Number(salaryData.allowance) - deductions;

          return {
            id: emp.id,
            name: emp.name,
            division: emp.division?.name || "Unassigned",
            initials: emp.name.substring(0,2).toUpperCase(),
            baseSalary: Number(salaryData.baseSalary),
            allowances: Number(salaryData.allowance),
            deductions,
            totalAmount
          };
        });

        setEmployees(formatted);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchDrafts();
  }, []);

  const handleSubmitToBoss = async () => {
    setSubmitting(true);
    try {
      const payload = employees.map((emp: any) => ({
        userId: emp.id,
        baseSalary: emp.baseSalary,
        allowance: emp.allowances,
        deductions: emp.deductions,
        totalAmount: emp.totalAmount,
      }));
      await submitPayrollBatch(period, payload);
      setStatus("SUBMITTED");
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const idr = (n: number) => "Rp " + new Intl.NumberFormat("id-ID").format(n);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 text-indigo-400 h-full min-h-[50vh]">
        <RefreshCw className="animate-spin" size={32} />
        <span className="text-sm font-medium animate-pulse">Menghitung gaji seluruh karyawan...</span>
      </div>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto px-6 py-6 pb-32 relative">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 mb-1">Payroll Management</h1>
          <p className="text-sm text-slate-400">Periode: <span className="text-indigo-400 font-bold">{period}</span>   {employees.length} employees</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border border-white/10 text-slate-300 bg-[#0F1420] hover:bg-white/5 transition-colors">
          <Download size={14} /> Export Draft
        </button>
      </div>

      {status === "SUBMITTED" && (
        <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 animate-in fade-in slide-in-from-top-4">
           <ShieldCheck className="text-amber-400 shrink-0 mt-0.5" size={20} />
           <div>
             <h3 className="text-sm font-bold text-amber-400">Menunggu Persetujuan BOS</h3>
             <p className="text-xs text-amber-400/80 mt-1">Draf payroll bulan ini sudah dikirimkan ke BOS dan sedang menunggu persetujuan akhir sebelum dana dicairkan.</p>
           </div>
        </div>
      )}

      {/* Tabel Editor Gaji */}
      <div className="bg-[#0F1520] border border-indigo-500/10 rounded-2xl overflow-hidden mb-6 shadow-xl">
        <div className="grid grid-cols-6 gap-4 p-5 border-b border-indigo-500/20 bg-indigo-500/5 text-xs font-black text-slate-400 uppercase tracking-wider">
          <div className="col-span-2">Employee</div>
          <div className="text-right">Base Salary</div>
          <div className="text-right">Allowances</div>
          <div className="text-right">Deductions</div>
          <div className="text-right text-indigo-400">Net Salary</div>
        </div>
        
        {employees.map((emp: any) => (
          <div key={emp.id} className="grid grid-cols-6 gap-4 p-5 border-b border-white/5 items-center hover:bg-white/[0.02] transition-colors">
             <div className="col-span-2 flex items-center gap-4">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold shadow-md">{emp.initials}</div>
                <div><p className="text-sm font-bold text-white">{emp.name}</p><p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mt-0.5">{emp.division}</p></div>
             </div>
             <div className="text-right text-sm text-slate-300 font-mono">{idr(emp.baseSalary)}</div>
             <div className="text-right text-sm text-emerald-400 font-mono">+{idr(emp.allowances)}</div>
             <div className="text-right text-sm text-rose-400 font-mono">{emp.deductions > 0 ? `-${idr(emp.deductions)}` : "-"}</div>
             <div className="text-right text-sm text-indigo-300 font-bold font-mono bg-indigo-500/10 py-1.5 px-3 rounded-lg inline-block ml-auto">{idr(emp.totalAmount)}</div>
          </div>
        ))}
      </div>

      {/* Action Footer (Sticky Bottom) - Hanya aktif jika masih DRAFT */}
      {status === "DRAFT" && (
        <div className="fixed bottom-0 left-[60px] md:left-[72px] right-0 bg-[#0A0E17]/90 backdrop-blur-xl border-t border-indigo-500/30 px-8 py-5 flex items-center justify-between z-50 animate-in slide-in-from-bottom-10 duration-500">
          <p className="text-sm text-slate-400">Review semua entri gaji. Jika sudah benar, kirimkan ke Boss untuk disetujui.</p>
          <button 
            onClick={handleSubmitToBoss}
            disabled={submitting}
            className="px-6 py-3 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 hover:scale-[0.98] transition-transform text-white text-sm font-bold shadow-[0_0_20px_rgba(99,102,241,0.4)] disabled:opacity-50 flex items-center gap-2"
          >
            {submitting ? <RefreshCw size={18} className="animate-spin" /> : <Send size={18} />}
            Submit for Approval
          </button>
        </div>
      )}
    </main>
  );
}