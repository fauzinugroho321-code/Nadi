"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Mail, CheckCircle2, RefreshCw, RotateCcw } from "lucide-react";
import Link from "next/link";

// Background Animasi ECG 
function EcgBackground() {
  const TOTAL_WIDTH = 2800;
  const d = "M 0 0 L 60 0 L 80 0 L 90 -6 L 100 -50 L 112 28 L 122 -14 L 132 8 L 142 0 L 200 0 ".repeat(14);
  
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <svg viewBox={`0 -80 ${TOTAL_WIDTH} 120`} className="absolute top-[18%] left-0 w-[200%] h-[120px] opacity-20 animate-[ecg-scroll_18s_linear_infinite]" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="ecg-top" x1="0" y1="0" x2={TOTAL_WIDTH} y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#22D3EE" stopOpacity="0" />
            <stop offset="50%" stopColor="#818CF8" stopOpacity="1" />
            <stop offset="100%" stopColor="#22D3EE" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={d} fill="none" stroke="url(#ecg-top)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.12)_0%,transparent_70%)] blur-[40px]" />
    </div>
  );
}

export default function ForgotPassword() {
  const [stage, setStage] = useState<"form" | "sent">("form");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStage("sent");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0E17] via-[#0D1120] to-[#0A0E17] flex flex-col items-center justify-center p-5 relative overflow-hidden font-sans">
      <style>{`@keyframes ecg-scroll { to { transform: translateX(-50%); } }`}</style>
      <EcgBackground />

      <div className="relative z-10 w-full max-w-[440px] flex flex-col items-center">
        <div className="w-full flex items-center justify-between mb-7">
          <div className="flex items-center gap-2">
             <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center">
               <svg width="14" height="14" viewBox="0 0 22 22" fill="none"><path d="M2,11 L5,11 L7.5,5.5 L10,16.5 L12.5,8 L14.5,13 L16.5,11 L20,11" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
             </div>
             <span className="font-bold text-sm text-indigo-500 tracking-wide">nadi</span>
          </div>
          <Link href="/login" className="flex items-center gap-1.5 text-slate-400 hover:text-indigo-300 transition-colors text-[13px] font-medium">
            <ArrowLeft size={14} /> Back to login
          </Link>
        </div>

        <div className="w-full rounded-2xl bg-[#11141F]/90 backdrop-blur-xl border border-white/5 shadow-[0_24px_64px_rgba(0,0,0,0.6)] overflow-hidden transition-all duration-300">
          <div className="h-0.5 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-70" />
          
          <div className="p-9">
            {stage === "form" ? (
              <form onSubmit={handleSubmit}>
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mb-6 shadow-[0_0_18px_rgba(99,102,241,0.2)]">
                  <Mail size={22} className="text-indigo-400" />
                </div>
                <h1 className="text-2xl font-extrabold text-slate-100 mb-2 tracking-tight">Forgot your password?</h1>
                <p className="text-sm text-slate-400 mb-7 leading-relaxed">Enter the email address associated with your Nadi account and we'll send you a link to reset your password.</p>
                
                <div className="mb-6">
                  <label className="block text-[12.5px] font-semibold text-slate-400 uppercase tracking-widest mb-2">Email Address</label>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" className="w-full h-12 rounded-xl bg-[#0C0F1A] border border-white/10 px-4 text-sm text-slate-200 outline-none focus:border-indigo-500 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.18)] transition-all" />
                </div>

                <button type="submit" disabled={loading || !email} className="w-full h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white font-bold text-[15px] shadow-[0_0_20px_rgba(99,102,241,0.4)] disabled:opacity-50 disabled:shadow-none transition-all flex items-center justify-center gap-2 hover:scale-[0.99]">
                  {loading ? <><RefreshCw size={16} className="animate-spin" /> Sending</> : "Send Reset Link"}
                </button>
              </form>
            ) : (
              <div className="animate-in fade-in zoom-in duration-300">
                <div className="relative w-[52px] h-[52px] mb-6">
                  <div className="absolute -inset-2 rounded-full bg-[radial-gradient(circle,rgba(34,211,238,0.2)_0%,transparent_70%)] animate-pulse" />
                  <div className="w-full h-full rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center relative shadow-[0_0_20px_rgba(34,211,238,0.2)]">
                    <CheckCircle2 size={24} className="text-cyan-400" />
                  </div>
                </div>
                <h1 className="text-2xl font-extrabold text-slate-100 mb-2 tracking-tight">Check your email</h1>
                <p className="text-sm text-slate-400 mb-1">We've sent a password reset link to</p>
                <p className="text-sm font-semibold text-indigo-300 mb-6">{email}</p>
                
                <button onClick={() => setStage("form")} className="w-full h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white font-bold text-[15px] shadow-[0_0_20px_rgba(99,102,241,0.4)] flex items-center justify-center gap-2 mb-4 hover:scale-[0.99] transition-transform">
                  <RotateCcw size={16} /> Back to login
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}