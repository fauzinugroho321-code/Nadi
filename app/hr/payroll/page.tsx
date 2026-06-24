"use client";

import { useState, useEffect } from "react";
import { Download, RefreshCw, Send, ShieldCheck, Edit3, XCircle } from "lucide-react";
import { getPayrollDrafts, submitPayrollBatch, cancelPayrollSubmit } from "@/app/actions/hr";
import { format } from "date-fns";

export default function Payroll() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<"DRAFT" | "SUBMITTED" | "APPROVED">("DRAFT");

  const period = new Date().getFullYear() + "-" + String(new Date().getMonth() + 1).padStart(2, '0');

  const fetchDrafts = async () => {
    try {
      const data = await getPayrollDrafts(period);
      const isAlreadySubmitted = data.some((emp: any) => emp.payrolls[0]?.status === "SUBMITTED");
      const isAlreadyApproved = data.some((emp: any) => emp.payrolls[0]?.status === "APPROVED" || emp.payrolls[0]?.status === "PAID");
      
      if (isAlreadyApproved) setStatus("APPROVED");
      else if (isAlreadySubmitted) setStatus("SUBMITTED");
      else setStatus("DRAFT");
      
      const formatted = data.map((emp: any) => {
        const salaryData = emp.salaries[0] || { baseSalary: 10000000, allowance: 2500000 };
        const existingDeduction = emp.payrolls[0]?.deductions || 0;
        
        return {
          id: emp.id,
          name: emp.name,
          division: emp.division?.name || "Unassigned",
          initials: emp.name.substring(0,2).toUpperCase(),
          baseSalary: Number(salaryData.baseSalary),
          allowances: Number(salaryData.allowance),
          deductions: Number(existingDeduction),
          totalAmount: Number(salaryData.baseSalary) + Number(salaryData.allowance) - Number(existingDeduction)
        };
      });
      setEmployees(formatted);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  useEffect(() => { fetchDrafts(); }, []);

  const handleDeductionChange = (id: string, newDeduction: string) => {
    const numDeduction = Number(newDeduction) || 0;
    setEmployees(prev => prev.map(emp => {
      if (emp.id === id) {
        return { ...emp, deductions: numDeduction, totalAmount: emp.baseSalary + emp.allowances - numDeduction };
      }
      return emp;
    }));
  };

  const handleSubmitToBoss = async () => {
    setSubmitting(true);
    try {
      const payload = employees.map(emp => ({
        userId: emp.id,
        baseSalary: emp.baseSalary,
        allowance: emp.allowances,
        deductions: emp.deductions,
        totalAmount: emp.totalAmount,
      }));
      await submitPayrollBatch(period, payload);
      setStatus("SUBMITTED");
    } catch (error) { console.error(error); } finally { setSubmitting(false); }
  };

  const handleCancelSubmit = async () => {
    if (!confirm("Tarik kembali draf gaji ini? BOS tidak akan bisa melihatnya lagi.")) return;
    setSubmitting(true);
    try {
      await cancelPayrollSubmit(period);
      await fetchDrafts(); 
    } catch (error) { console.error(error); } finally { setSubmitting(false); }
  };

  // FITUR BARU: Export Data ke CSV (Excel)
  const handleExportCSV = () => {
    const headers = ["Nama Karyawan,Divisi,Gaji Pokok,Tunjangan,Potongan,Net Gaji (Take Home Pay),Status"];
    const rows = employees.map(emp => {
      return `"${emp.name}","${emp.division}",${emp.baseSalary},${emp.allowances},${emp.deductions},${emp.totalAmount},"${status}"`;
    });

    const csvContent = "data:text/csv;charset=utf-8," + headers.concat(rows).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Draf_Payroll_${period}_${format(new Date(), "yyyyMMdd")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const idr = (n: number) => "Rp " + new Intl.NumberFormat("id-ID").format(n);

  if (loading) return <div className="flex-1 flex items-center justify-center text-indigo-400 h-full mt-20"><RefreshCw className="animate-spin" size={32} /></div>;

  return (
    <main className="flex-1 overflow-y-auto px-6 py-6 pb-32 relative">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 mb-1">Payroll Management</h1>
          <p className="text-sm text-slate-400">Periode: <span className="text-indigo-400 font-bold">{period}</span> • {employees.length} employees</p>
        </div>
        
        {/* Tombol Export Aktif */}
        <button onClick={handleExportCSV} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border border-indigo-500/20 text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 shadow-lg transition-colors">
          <Download size={14} /> Export CSV
        </button>
      </div>

      {status === "SUBMITTED" && (
        <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between animate-in fade-in slide-in-from-top-4">
           <div className="flex items-start gap-3">
             <ShieldCheck className="text-amber-400 shrink-0 mt-0.5" size={20} />
             <div>
               <h3 className="text-sm font-bold text-amber-400">Menunggu Persetujuan BOS</h3>
               <p className="text-xs text-amber-400/80 mt-1">Draf payroll ini sudah dikirim. Anda masih bisa menariknya jika ada revisi selama BOS belum menyetujui.</p>
             </div>
           </div>
           <button onClick={handleCancelSubmit} disabled={submitting} className="px-4 py-2 rounded-lg bg-rose-500/20 text-rose-400 font-bold text-xs hover:bg-rose-500/30 transition-colors flex items-center gap-2">
             {submitting ? <RefreshCw size={14} className="animate-spin"/> : <XCircle size={14}/>} Tarik Draf
           </button>
        </div>
      )}
      {status === "APPROVED" && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3 animate-in fade-in slide-in-from-top-4">
           <ShieldCheck className="text-emerald-400 shrink-0 mt-0.5" size={20} />
           <div>
             <h3 className="text-sm font-bold text-emerald-400">Payroll Sukses Dicairkan</h3>
             <p className="text-xs text-emerald-400/80 mt-1">Gaji bulan ini sudah disetujui dan ditransfer. Data sudah dikunci permanen.</p>
           </div>
        </div>
      )}

      {/* Tabel Editor Gaji */}
      <div className="bg-[#0F1520] border border-indigo-500/10 rounded-2xl overflow-hidden mb-6 shadow-xl">
        <div className="grid grid-cols-6 gap-4 p-5 border-b border-indigo-500/20 bg-indigo-500/5 text-xs font-black text-slate-400 uppercase tracking-wider">
          <div className="col-span-2">Employee</div>
          <div className="text-right">Base Salary</div>
          <div className="text-right">Allowances</div>
          <div className="text-right flex items-center justify-end gap-1"><Edit3 size={12}/> Deductions</div>
          <div className="text-right text-indigo-400">Net Salary</div>
        </div>
        
        {employees.map((emp) => (
          <div key={emp.id} className="grid grid-cols-6 gap-4 p-5 border-b border-white/5 items-center hover:bg-white/[0.02] transition-colors">
             <div className="col-span-2 flex items-center gap-4">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold">{emp.initials}</div>
                <div><p className="text-sm font-bold text-white">{emp.name}</p><p className="text-[10px] uppercase text-slate-500 font-semibold">{emp.division}</p></div>
             </div>
             <div className="text-right text-sm text-slate-300 font-mono">{idr(emp.baseSalary)}</div>
             <div className="text-right text-sm text-emerald-400 font-mono">+{idr(emp.allowances)}</div>
             
             {/* Input Deductions */}
             <div className="text-right flex justify-end">
               <div className="relative w-28">
                 <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-mono">Rp</span>
                 <input 
                   type="number" 
                   disabled={status !== "DRAFT"}
                   value={emp.deductions || ""} 
                   onChange={(e) => handleDeductionChange(emp.id, e.target.value)}
                   placeholder="0"
                   className="w-full bg-[#161B33] border border-white/10 rounded-lg py-1.5 pl-7 pr-2 text-right text-sm text-rose-400 font-mono outline-none focus:border-rose-500 disabled:opacity-50"
                 />
               </div>
             </div>

             <div className="text-right text-sm text-indigo-300 font-bold font-mono bg-indigo-500/10 py-1.5 px-3 rounded-lg inline-block ml-auto">{idr(emp.totalAmount)}</div>
          </div>
        ))}
      </div>

      {status === "DRAFT" && (
        <div className="fixed bottom-0 left-[60px] md:left-[72px] right-0 bg-[#0A0E17]/90 backdrop-blur-xl border-t border-indigo-500/30 px-8 py-5 flex items-center justify-between z-50">
          <p className="text-sm text-slate-400">Review dan isi potongan pajak/BPJS jika ada. Jika sudah benar, kirimkan ke Boss.</p>
          <button onClick={handleSubmitToBoss} disabled={submitting} className="px-6 py-3 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white text-sm font-bold shadow-[0_0_20px_rgba(99,102,241,0.4)] disabled:opacity-50 flex items-center gap-2 hover:scale-[0.98] transition-transform">
            {submitting ? <RefreshCw size={18} className="animate-spin" /> : <Send size={18} />}
            Submit for Approval
          </button>
        </div>
      )}
    </main>
  );
}