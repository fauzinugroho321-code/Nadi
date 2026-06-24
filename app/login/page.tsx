"use client";

import { useState, useEffect } from "react";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { loginAction, getPublicMetrics } from "@/app/actions/auth"; 

// QRS complex path
const QRS = "M 0,60 L 50,60 L 65,46 L 75,53 L 83,60 L 122,60 L 132,67 L 140,5 L 148,78 L 156,60 L 205,60 L 217,43 L 243,43 L 256,60 L 400,60";

function ECGWaveform({ duration = 5 }: { duration?: number }) {
  return (
    <div className="h-32 overflow-hidden relative w-full">
      {[32, 64, 96].map(y => (
        <div key={y} className="absolute left-0 right-0 h-px pointer-events-none" style={{ top: y, background: "rgba(34,211,238,.055)" }} />
      ))}
      <div className="absolute left-0 top-0 bottom-0 w-16 z-10 bg-gradient-to-r from-[#080C15] to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 z-10 bg-gradient-to-l from-[#080C15] to-transparent pointer-events-none" />
      <div className="flex h-full w-[400%]" style={{ animation: `ecg-scroll ${duration}s linear infinite`, willChange: "transform" }}>
        {["a", "b", "c", "d"].map(id => (
          <svg key={id} viewBox="0 0 400 120" className="h-full flex-[0_0_25%]" preserveAspectRatio="none">
            <defs>
              <filter id={`g${id}`} x="-40%" y="-130%" width="180%" height="360%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
            <path d={QRS} fill="none" stroke="#22D3EE" strokeWidth="22" strokeOpacity=".04" strokeLinecap="round" strokeLinejoin="round" />
            <path d={QRS} fill="none" stroke="#22D3EE" strokeWidth="6" strokeOpacity=".28" strokeLinecap="round" strokeLinejoin="round" filter={`url(#g${id})`} />
            <path d={QRS} fill="none" stroke="#22D3EE" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ))}
      </div>
    </div>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(""); 
  
  // State untuk menampung metrik dinamis
  const [metrics, setMetrics] = useState<any[]>([
    { value: "...", label: "Attendance", sub: "This month" },
    { value: "...", label: "Tasks Done", sub: "All time" },
    { value: "...", label: "Active Staff", sub: "Registered" }
  ]);

  // Tarik data saat halaman dimuat
  useEffect(() => {
    getPublicMetrics().then(setMetrics).catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    
    const res = await loginAction(email, password);
    if (res?.error) {
      setErrorMsg(res.error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#0A0E17] text-slate-200 font-sans">
      <style>{`
        @keyframes ecg-scroll { to { transform: translateX(-25%); } }
        @keyframes btn-spin { to { transform: rotate(360deg); } }
        .live-dot { animation: dot-pulse 1.8s ease-in-out infinite; }
        @keyframes dot-pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.45;transform:scale(.65)} }
        .form-slide { animation: fade-up .65s cubic-bezier(.22,1,.36,1) both; }
        @keyframes fade-up { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
      
      {/* LEFT PANEL */}
      <div className="hidden lg:flex flex-col relative shrink-0 w-[55%] bg-[#080C15] overflow-hidden p-10 xl:p-12">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_90%_65%_at_62%_38%,rgba(99,102,241,.22)_0%,rgba(99,102,241,.07)_48%,transparent_72%)]" />
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_65%_30%_at_50%_62%,rgba(34,211,238,.07)_0%,transparent_65%)]" />
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_1px_1px,rgba(99,102,241,.13)_1px,transparent_0)] bg-[size:28px_28px]" />
        
        <div className="relative z-10 flex flex-col h-full">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center shadow-[0_0_22px_rgba(99,102,241,.5),0_0_8px_rgba(34,211,238,.2)]">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M2,11 L5,11 L7.5,5.5 L10,16.5 L12.5,8 L14.5,13 L16.5,11 L20,11" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
            <span className="font-extrabold text-2xl text-slate-100 tracking-tight">nadi</span>
            <div className="live-dot w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_9px_#22D3EE] mt-1 self-start ml-0.5" />
          </div>
          
          <div className="mt-auto mb-10">
            <p className="text-indigo-300/80 text-xs font-semibold tracking-widest uppercase mb-4">Performance Intelligence</p>
            <h1 className="font-black text-4xl xl:text-5xl leading-tight text-slate-100 tracking-tight max-w-md mb-5">Track every pulse of your team's performance</h1>
            <p className="text-slate-400/80 text-base leading-relaxed max-w-sm">Real-time attendance, lightweight activity monitoring, and payroll   unified for every role in your organization.</p>
          </div>
          
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-cyan-400 text-[10px] font-bold tracking-widest uppercase">Live Monitor</span>
              <div className="flex-1 h-px bg-gradient-to-r from-cyan-400/40 to-transparent" />
              <span className="text-cyan-400/50 text-[10px] font-medium">Real-time</span>
            </div>
            <ECGWaveform />
          </div>
          
          {/* DINAMIS METRICS RENDER */}
          <div className="flex gap-3 pb-2">
            {metrics.map((m, idx) => (
              <div key={idx} className="flex-1 min-w-0 bg-[#0F1322]/80 border border-indigo-500/20 rounded-xl p-4 backdrop-blur-md transition-colors hover:border-indigo-500/40">
                <div className="flex items-baseline gap-1.5 mb-1">
                  <span className="font-bold text-2xl tracking-tight text-slate-100 leading-none">{m.value}</span>
                </div>
                <div className="text-indigo-300 text-xs font-medium">{m.label}</div>
                <div className="text-slate-500 text-[10px] mt-0.5">{m.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT PANEL - Login Form */}
      <div className="flex-1 flex flex-col items-center justify-center relative bg-[#0B0F1A]">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_55%_at_35%_50%,rgba(99,102,241,.07)_0%,transparent_68%)]" />
        
        <div className="form-slide relative z-10 w-full max-w-[400px] px-8">
          <div className="hidden lg:flex items-center gap-2 mb-8">
             <div className="w-7 h-7 rounded-md bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center">
               <svg width="14" height="14" viewBox="0 0 22 22" fill="none"><path d="M2,11 L5,11 L7.5,5.5 L10,16.5 L12.5,8 L14.5,13 L16.5,11 L20,11" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
             </div>
             <span className="font-bold text-sm text-indigo-500 tracking-wide">nadi</span>
          </div>
          <div className="mb-8">
            <h2 className="font-extrabold text-3xl text-slate-100 tracking-tight mb-2">Welcome back</h2>
            <p className="text-slate-500 text-sm leading-relaxed">Enter your credentials to access your dashboard.</p>
          </div>
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2 animate-in slide-in-from-top-2">
                <AlertCircle size={16} />
                {errorMsg}
              </div>
            )}
            <div>
              <label className="block text-slate-400 text-[13px] font-medium mb-2">Email address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@company.com" className="w-full bg-[#0F1322]/90 border border-indigo-500/20 rounded-xl px-4 py-3 text-sm text-slate-100 outline-none focus:border-indigo-500/60 focus:shadow-[0_0_0_3px_rgba(99,102,241,.18),0_0_18px_rgba(99,102,241,.1)] transition-all placeholder:text-slate-600" />
            </div>
            <div>
              <label className="block text-slate-400 text-[13px] font-medium mb-2">Password</label>
              <div className="relative">
                <input type={showPwd ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required placeholder=" " className="w-full bg-[#0F1322]/90 border border-indigo-500/20 rounded-xl pl-4 pr-11 py-3 text-sm text-slate-100 outline-none focus:border-indigo-500/60 focus:shadow-[0_0_0_3px_rgba(99,102,241,.18),0_0_18px_rgba(99,102,241,.1)] transition-all placeholder:text-slate-600" />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-indigo-300 transition-colors outline-none">
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <div className="flex justify-end mt-2">
                <a href="/login/forgot-password" className="text-xs font-medium text-slate-500 hover:text-indigo-300 transition-colors">Forgot password?</a>
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full py-3.5 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white text-[15px] font-bold shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_32px_rgba(99,102,241,0.5)] transition-all hover:-translate-y-px active:translate-y-0 disabled:opacity-75 disabled:cursor-wait flex items-center justify-center gap-2">
              {loading ? <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: "btn-spin .75s linear infinite" }}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" /></svg> Signing in...</> : "Sign In"}
            </button>
          </form>
          
          <div className="flex items-center gap-3 my-8">
            <div className="flex-1 h-px bg-indigo-500/10" />
            <span className="text-[11px] font-medium text-slate-600 uppercase tracking-widest">Internal Access Only</span>
            <div className="flex-1 h-px bg-indigo-500/10" />
          </div>
          <p className="text-center text-xs text-slate-500 leading-relaxed">
            Need access? <span className="text-slate-400">Contact your HR administrator</span> to request an account.
          </p>
        </div>
      </div>
    </div>
  );
}