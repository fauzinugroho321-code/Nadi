"use client";

import { useState, useEffect } from "react";
import { User, Lock, Mail, Building2, RefreshCw, CheckCircle2, Save } from "lucide-react";
import { getUserProfile } from "@/app/actions/user";

export default function EmployeeProfile() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // State untuk form password
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    getUserProfile().then(setProfile).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    
    if (newPwd !== confirmPwd) {
      setErrorMsg("Password baru dan konfirmasi tidak cocok.");
      return;
    }
    if (newPwd.length < 6) {
      setErrorMsg("Password baru minimal 6 karakter.");
      return;
    }

    setIsSaving(true);
    
    // Simulasi jeda server untuk menyimpan password
    setTimeout(() => {
      setIsSaving(false);
      setSuccessMsg("Password berhasil diperbarui!");
      setCurrentPwd(""); setNewPwd(""); setConfirmPwd("");
      
      // Hilangkan pesan sukses setelah 3 detik
      setTimeout(() => setSuccessMsg(""), 3000);
    }, 1200);
  };

  if (loading) return <div className="flex-1 flex justify-center mt-20 text-indigo-400"><RefreshCw className="animate-spin" size={32} /></div>;

  return (
    <main className="flex-1 max-w-4xl mx-auto w-full pb-20">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-100 mb-1">Profile Settings</h1>
        <p className="text-sm text-slate-400">Kelola informasi pribadi dan keamanan akun Anda.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Panel Info Diri (Kiri) */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-[#0F1220] border border-indigo-500/10 rounded-2xl p-6 shadow-xl flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white text-3xl font-black shadow-[0_0_30px_rgba(99,102,241,0.3)] mb-4 border-4 border-[#0A0E17]">
              {profile?.name ? profile.name.substring(0,2).toUpperCase() : "US"}
            </div>
            <h2 className="text-lg font-bold text-white">{profile?.name}</h2>
            <p className="text-xs text-indigo-400 font-medium uppercase tracking-widest mt-1 mb-4">{profile?.role}</p>
            
            <div className="w-full space-y-3 mt-2 text-left">
              <div className="flex items-center gap-3 text-sm p-3 rounded-xl bg-white/5 border border-white/5">
                <Mail size={16} className="text-slate-500" />
                <span className="text-slate-300 truncate">{profile?.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm p-3 rounded-xl bg-white/5 border border-white/5">
                <Building2 size={16} className="text-slate-500" />
                <span className="text-slate-300">{profile?.division?.name || "Tidak ada divisi"}</span>
              </div>
              <div className="flex items-center gap-3 text-sm p-3 rounded-xl bg-white/5 border border-white/5">
                <User size={16} className="text-slate-500" />
                <span className="text-slate-300">{profile?.workType}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Panel Ganti Password (Kanan) */}
        <div className="md:col-span-2">
          <div className="bg-[#0F1220] border border-indigo-500/10 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
               <div className="p-2 bg-indigo-500/10 rounded-lg"><Lock size={18} className="text-indigo-400"/></div>
               <div>
                 <h3 className="font-bold text-slate-100">Keamanan Akun</h3>
                 <p className="text-xs text-slate-500">Perbarui kata sandi Anda secara berkala.</p>
               </div>
            </div>

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold mb-4">
                  {errorMsg}
                </div>
              )}
              {successMsg && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold mb-4 flex items-center gap-2">
                  <CheckCircle2 size={16} /> {successMsg}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Password Saat Ini</label>
                <input type="password" required value={currentPwd} onChange={e => setCurrentPwd(e.target.value)} className="w-full bg-[#161B33] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-indigo-500 transition-colors" placeholder="Masukkan password lama" />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Password Baru</label>
                  <input type="password" required value={newPwd} onChange={e => setNewPwd(e.target.value)} className="w-full bg-[#161B33] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-indigo-500 transition-colors" placeholder="Minimal 6 karakter" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Konfirmasi Password</label>
                  <input type="password" required value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} className="w-full bg-[#161B33] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-indigo-500 transition-colors" placeholder="Ulangi password baru" />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button type="submit" disabled={isSaving || !currentPwd || !newPwd || !confirmPwd} className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-lg hover:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed">
                  {isSaving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
                  {isSaving ? "Menyimpan..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>

      </div>
    </main>
  );
}