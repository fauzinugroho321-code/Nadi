// components/ui/LogoutButton.tsx
"use client";

import { LogOut } from "lucide-react";
import { logoutAction } from "@/app/actions/auth";

export default function LogoutButton() {
  return (
    <button
      onClick={() => logoutAction()}
      className="w-10 h-10 mt-auto flex items-center justify-center rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-200"
      title="Log Out"
    >
      <LogOut size={18} />
    </button>
  );
}