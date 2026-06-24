"use client";

import { useState, useEffect } from "react";
import { Lock, Check, X, RefreshCw } from "lucide-react";
import { getUserProfile } from "@/app/actions/user";

export default function EmployeeProfile() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getUserProfile();
        setUser(data);
      } catch (error) {
        console.error("Gagal memuat profil", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const getStrength = (pw: string) => {
    if (!pw) return { w: '0%', bg: 'transparent', label: '' };
    if (pw.length < 6) return { w: '33%', bg: '#F59E0B', label: 'Weak' };
    if (pw.length < 10) return { w: '66%', bg: '#6366F1', label: 'Moderate' };
    return { w: '100%', bg: '#22D3EE', label: 'Strong' };
  };

  const strength = getStrength(password);

  if (loading) {
    return (
      <div className="h-64 flex flex-col items-center justify-center gap-3 text-indigo-400">
        <RefreshCw className="animate-spin" />
        <span className="text-sm font-medium animate-pulse">Memuat profil Anda...</span>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12 animate-in fade-in duration-500">
      {/* Hero Avatar */}
      <div className="flex flex-col items-center justify-center py-8">
        <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-indigo-500/30 mb-4 shadow-[0_0_30px_rgba(99,102,241,0.2)]">
          {/* Avatar dinamis berdasarkan nama user */}
          <img src={`https://api.dicebear.com/8.x/notionists/svg?seed=${user.name}`} alt="Avatar" className="w-full h-full object-cover bg-indigo-500/10" />
        </div>
        <h1 className="text-2xl font-bold text-white">{user.name}</h1>
        <p className="text-slate-400 text-sm mt-1 uppercase tracking-wider font-semibold">
          {user.division?.name || "No Division"} • {user.role}
        </p>
      </div>

      {/* Info Pribadi */}
      <div className="bg-[#11141F] border border-white/5 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-5">Personal Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-xs text-slate-500 uppercase font-semibold block mb-2">Display Name</label>
            <input type="text" readOnly defaultValue={user.name} className="w-full bg-[#1A1D2E] border border-white/10 rounded-xl px-4 py-2 text-white outline-none opacity-80 cursor-not-allowed" />
          </div>
          <div>
            <label className="text-xs text-slate-500 uppercase font-semibold block mb-2">Email Address</label>
            <div className="flex items-center justify-between text-slate-400 px-3 py-2 bg-[#1A1D2E] border border-white/10 rounded-xl opacity-80">
              {user.email} <Lock size={14}/>
            </div>
            <p className="text-[10px] text-slate-500 px-2 mt-2">Data diri dikelola oleh HR Administrator</p>
          </div>
        </div>
      </div>

      {/* Password & Security (Simulasi UI) */}
      <div className="bg-[#11141F] border border-white/5 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-5">Password & Security</h2>
        <div className="space-y-4 max-w-sm">
           <div>
             <label className="text-xs text-slate-500 uppercase font-semibold block mb-2">New Password</label>
             <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-[#1A1D2E] border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-indigo-500/50" />
           </div>
           {password && (
              <div className="flex items-center gap-3">
                <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full transition-all duration-300" style={{ width: strength.w, backgroundColor: strength.bg }} />
                </div>
                <span className="text-xs font-semibold w-16" style={{ color: strength.bg }}>{strength.label}</span>
              </div>
           )}
           <button className="w-full py-2.5 bg-indigo-500 hover:bg-indigo-600 transition-colors text-white font-bold rounded-xl mt-2">Update Password</button>
        </div>
      </div>

      {/* My Data (Transparency) */}
      <div className="bg-[#11141F] border border-white/5 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-2">My Data</h2>
        <p className="text-sm text-slate-400 mb-6">Here's what Nadi tracks about you. We believe you should always know what data is recorded.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <div className="bg-cyan-500/5 border border-cyan-500/10 p-4 rounded-xl flex items-start gap-3">
             <div className="w-6 h-6 rounded-md bg-cyan-500/10 flex items-center justify-center shrink-0 mt-0.5"><Check size={12} className="text-cyan-400"/></div>
             <div><p className="text-sm text-slate-200 font-semibold">Clock-in and clock-out times</p><p className="text-xs text-slate-500 mt-1">Used to calculate attendance and work hours.</p></div>
           </div>
           <div className="bg-white/5 border border-white/5 p-4 rounded-xl flex items-start gap-3">
             <div className="w-6 h-6 rounded-md bg-white/5 flex items-center justify-center shrink-0 mt-0.5"><X size={12} className="text-slate-500"/></div>
             <div><p className="text-sm text-slate-500 font-semibold line-through">Screen content or screenshots</p><p className="text-xs text-slate-500 mt-1">We never capture what's on your screen.</p></div>
           </div>
        </div>
      </div>
    </div>
  );
}