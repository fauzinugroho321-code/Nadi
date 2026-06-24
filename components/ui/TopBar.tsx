import { Bell } from 'lucide-react';

export function TopBar() {
  return (
    <div className="fixed top-0 right-0 left-[72px] h-16 flex items-center justify-end px-8 z-40">
      <div className="flex items-center gap-4">
        {/* Notification bell */}
        <button className="relative w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors">
          <Bell className="w-5 h-5 text-white/60" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-cyan-400 rounded-full border-2 border-[#0A0E17]" />
        </button>

        {/* User info */}
        <div className="flex items-center gap-3 pl-4 border-l border-white/10">
          <div className="text-right">
            <div className="text-sm font-medium text-white">John Doe</div>
            <div className="text-xs text-white/50">Employee</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white font-medium text-sm">
            JD
          </div>
        </div>
      </div>
    </div>
  );
}
