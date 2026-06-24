import { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  CalendarCheck, 
  CheckSquare, 
  Wallet, 
  Calendar, 
  FileBarChart, 
  Settings 
} from 'lucide-react';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/boss/dashboard' },
  { icon: Users, label: 'Employees', path: '/boss/employees' },
  { icon: CalendarCheck, label: 'Attendance', path: '/boss/attendance' },
  { icon: CheckSquare, label: 'Tasks', path: '/boss/tasks' },
  { icon: Wallet, label: 'Payroll', path: '/boss/payroll' },
  { icon: Calendar, label: 'Leave Requests', path: '/boss/leave' },
  { icon: FileBarChart, label: 'Reports', path: '/boss/reports', active: true },
  { icon: Settings, label: 'Settings', path: '/boss/settings' },
];

export function Sidebar() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <aside className="fixed left-0 top-0 h-screen w-[72px] flex flex-col items-center py-6 z-50">
      {/* Logo */}
      <div className="mb-12">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
          <span className="text-white font-bold text-lg">N</span>
        </div>
      </div>

      {/* Nav Icons */}
      <nav className="flex-1 flex flex-col gap-6 relative">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = item.active;
          const isHovered = hoveredIndex === index;

          return (
            <div
              key={item.path}
              className="relative"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Active indicator */}
              {isActive && (
                <div className="absolute -left-9 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-500 rounded-r-full shadow-[0_0_12px_rgba(99,102,241,0.6)]" />
              )}

              {/* Icon button */}
              <button
                className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'text-indigo-400'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                <Icon size={22} />
              </button>

              {/* Hover label */}
              {isHovered && (
                <div className="absolute left-14 top-1/2 -translate-y-1/2 whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-200">
                  <div className="px-4 py-2 rounded-full bg-[#1a1e2e]/80 backdrop-blur-xl border border-indigo-500/20 shadow-[0_0_24px_rgba(99,102,241,0.15)]">
                    <span className="text-sm text-gray-200">{item.label}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* User avatar */}
      <div className="mt-6">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
          <span className="text-white text-sm font-medium">JD</span>
        </div>
      </div>
    </aside>
  );
}
