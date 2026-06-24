"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import AccessDeniedToast from "@/components/AccessDeniedToast";

export default function UnauthorizedPage() {
  const router = useRouter();
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    setShowToast(true);
  }, []);

  // useCallback mencegah fungsi terbuat ulang yang bisa memicu loop
  const handleDismiss = useCallback(() => {
    setShowToast(false);
    // Menggunakan replace agar user tidak bisa klik tombol "Back" ke halaman terlarang
    router.replace("/"); 
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0A0E17] flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500 rounded-full blur-[120px]" />
      </div>
      
      <AccessDeniedToast show={showToast} onDismiss={handleDismiss} />
    </div>
  );
}