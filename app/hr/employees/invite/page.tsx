"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, UserPlus, RefreshCw, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getAllDivisions, inviteEmployee } from "@/app/actions/hr";

export default function InviteEmployee() {
  const router = useRouter();
  const [divisions, setDivisions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [divisionId, setDivisionId] = useState("");
  const [workType, setWorkType] = useState<"WFO" | "WFH" | "HYBRID">("WFO");

  // Ambil daftar divisi dari database untuk opsi Dropdown
  useEffect(() => {
    getAllDivisions()
      .then((data) => {
        setDivisions(data);
        if (data.length > 0) setDivisionId(data[0].id); // Set default opsi pertama
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");

    try {
      await inviteEmployee({ name, email, password, divisionId, workType });
      router.push("/hr/employees"); // Sukses? Kembalikan ke halaman tabel!
    } catch (error: any) {
      setErrorMsg(error.message || "Gagal menambahkan karyawan.");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 text-indigo-400 h-full min-h-[50vh]">
        <RefreshCw className="animate-spin" size={32} />
        <span className="text-sm font-medium animate-pulse">Menyiapkan formulir pendaftaran...</span>
      </div>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto px-8 py-8 pb-20">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 flex items-center gap-4">
          <Link href="/hr/employees" className="p-2.5 rounded-xl bg-[#0F1220] border border-indigo-500/20 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-100 flex items-center gap-2">
              <UserPlus size={22} className="text-indigo-400" /> Invite New Employee
            </h1>
            <p className="text-sm text-slate-400 mt-1">Daftarkan staf baru ke dalam sistem perusahaan.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 rounded-2xl border border-indigo-500/10 bg-[#0F1220] shadow-2xl flex flex-col gap-6">
          
          {errorMsg && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center gap-2">
              <AlertCircle size={16} /> {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Nama Lengkap</label>
              <input 
                type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Contoh: Budi Santoso"
                className="w-full bg-[#151929] border border-indigo-500/20 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-indigo-500 focus:shadow-[0_0_15px_rgba(99,102,241,0.2)] transition-all placeholder:text-slate-600" 
              />
            </div>
            
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Email Perusahaan</label>
              <input 
                type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="budi@nadi.app"
                className="w-full bg-[#151929] border border-indigo-500/20 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-indigo-500 focus:shadow-[0_0_15px_rgba(99,102,241,0.2)] transition-all placeholder:text-slate-600" 
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Password Akses</label>
              <input 
                type="text" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Set password awal"
                className="w-full bg-[#151929] border border-indigo-500/20 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-indigo-500 focus:shadow-[0_0_15px_rgba(99,102,241,0.2)] transition-all placeholder:text-slate-600" 
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Penempatan Divisi</label>
              <select 
                value={divisionId} onChange={(e) => setDivisionId(e.target.value)} required
                className="w-full bg-[#151929] border border-indigo-500/20 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-indigo-500 transition-all cursor-pointer"
              >
                {divisions.map(div => (
                  <option key={div.id} value={div.id}>{div.name}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Tipe Kerja (Default)</label>
              <div className="flex gap-4">
                {(["WFO", "WFH", "HYBRID"] as const).map(type => (
                  <label key={type} className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${workType === type ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400 font-bold shadow-[0_0_15px_rgba(99,102,241,0.2)]' : 'bg-[#151929] border-indigo-500/20 text-slate-400 hover:border-indigo-500/50'}`}>
                    <input type="radio" name="workType" value={type} checked={workType === type} onChange={(e) => setWorkType(e.target.value as any)} className="hidden" />
                    {type}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-6 border-t border-white/5 flex justify-end">
            <button type="submit" disabled={submitting} className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white font-black shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:scale-[0.98] transition-transform disabled:opacity-50">
              {submitting ? <RefreshCw size={18} className="animate-spin" /> : <UserPlus size={18} />}
              Daftarkan Karyawan
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}