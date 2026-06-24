"use client";

import { useEffect } from "react";
import { ShieldAlert, X } from "lucide-react";

export default function AccessDeniedToast({ show, onDismiss }: { show: boolean; onDismiss: () => void; }) {
  useEffect(() => {
    if (show) {
      // Panggil onDismiss setelah 4 detik
      const timer = setTimeout(() => {
        onDismiss();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [show, onDismiss]);

  if (!show) return null;

  return (
    <>
      {/* Background Redup */}
      <div className="fixed inset-0 z-[9000] bg-[#05070E]/60 backdrop-blur-sm animate-in fade-in duration-300" />
      
      {/* Kotak Toast */}
      <div className="fixed top-6 right-6 z-[9999] w-[380px] max-w-[calc(100vw-48px)] animate-in slide-in-from-top-4 fade-in duration-300">
        <div className="relative rounded-[20px] bg-[#121622]/95 backdrop-blur-xl border border-amber-500/30 shadow-2xl overflow-hidden">
          <div className="pt-6 px-6 pb-4">
            <button onClick={onDismiss} className="absolute top-4 right-4 p-1 rounded-md hover:bg-white/10 text-slate-400 transition-colors">
              <X size={16} />
            </button>

            <div className="flex gap-4 items-start">
              <div className="relative shrink-0 mt-1">
                <div className="absolute -inset-2 rounded-full bg-amber-500/20 blur-md animate-pulse" />
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-amber-500/10 border border-amber-500/30 relative">
                  <ShieldAlert size={20} className="text-amber-500" />
                </div>
              </div>

              <div className="flex-1">
                <div className="text-slate-100 font-bold text-base tracking-tight">Akses Ditolak</div>
                <div className="text-slate-400 text-sm leading-relaxed mt-1">
                  Anda tidak memiliki izin (role) untuk melihat halaman ini. <br/>
                  <span className="text-slate-300 font-medium">Mengembalikan halaman...</span>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar Murni CSS */}
          <div className="h-1 bg-white/5 w-full">
            <div className="h-full w-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-300 origin-left animate-[shrink_4s_linear_forwards]" />
          </div>
        </div>
        <style>{`@keyframes shrink { from { transform: scaleX(1); } to { transform: scaleX(0); } }`}</style>
      </div>
    </>
  );
}