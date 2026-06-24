"use client";

import { useState, useEffect } from "react";
import { Circle, RefreshCw, CheckCircle2, Clock } from "lucide-react";
import { getAllCompanyTasks } from "@/app/actions/hr"; // REUSE DARI HR
import { format } from "date-fns";

const COLUMNS = [
  { id: "TODO", label: "To Do", icon: Circle, color: "text-slate-400", border: "border-slate-500/30", bg: "bg-slate-500/10" },
  { id: "IN_PROGRESS", label: "In Progress", icon: RefreshCw, color: "text-amber-400", border: "border-amber-500/30", bg: "bg-amber-500/10" },
  { id: "DONE", label: "Done", icon: CheckCircle2, color: "text-emerald-400", border: "border-emerald-500/30", bg: "bg-emerald-500/10" }
];

export default function BossTasks() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const data = await getAllCompanyTasks();
        setTasks(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 text-amber-400 h-full min-h-[50vh]">
        <RefreshCw className="animate-spin" size={32} />
        <span className="text-sm font-medium animate-pulse">Menyiapkan Papan Kanban Global...</span>
      </div>
    );
  }

  return (
    <main className="flex-1 flex flex-col h-full overflow-hidden pb-10 px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-100">Company Kanban Board</h1>
        <p className="text-sm text-slate-500 mt-1">Pantau seluruh produktivitas dari atas.</p>
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
        <div className="flex gap-6 min-w-max h-full items-start">
           {COLUMNS.map(col => {
              const colTasks = tasks.filter(t => t.status === col.id);
              return (
              <div key={col.id} className="w-80 flex flex-col max-h-[70vh] bg-[#0F1220]/80 rounded-2xl p-4 border border-white/5 flex-shrink-0 shadow-2xl">
                 <h3 className="font-bold text-sm text-slate-200 mb-4 flex items-center justify-between border-b border-white/5 pb-3">
                   <div className="flex items-center gap-2">
                     <col.icon size={16} className={col.color} /> {col.label}
                   </div>
                   <span className="bg-white/10 text-slate-300 px-2.5 py-0.5 rounded-full text-xs">{colTasks.length}</span>
                 </h3>
                 <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-1" style={{ scrollbarWidth: "none" }}>
                   {colTasks.map((task) => (
                     <div key={task.id} className="bg-[#161B33] border border-white/5 p-4 rounded-xl shadow-lg">
                       <h4 className="text-sm font-bold text-slate-200 mb-1 leading-tight">{task.title}</h4>
                       <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
                         <div className="flex items-center gap-2">
                           <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-[9px] font-bold text-amber-400">
                              {task.assignee?.name.substring(0,2).toUpperCase()}
                           </div>
                           <span className="text-[11px] text-slate-400 font-medium">{task.assignee?.name}</span>
                         </div>
                       </div>
                     </div>
                   ))}
                 </div>
              </div>
           )})}
        </div>
      </div>
    </main>
  );
}