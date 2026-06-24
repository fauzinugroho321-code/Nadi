"use client";

import { useState, useEffect } from "react";
import { CheckSquare, Circle, RefreshCw, CheckCircle2, Clock, Check, Play, AlertCircle } from "lucide-react";
import { getEmployeeTasks, updateTaskStatus } from "@/app/actions/task";
import { format, isPast, isToday } from "date-fns";
import { motion, AnimatePresence } from "motion/react";

const COLUMNS = [
  { id: "TODO", label: "To Do", icon: Circle, color: "text-slate-400", border: "border-slate-500/20" },
  { id: "IN_PROGRESS", label: "In Progress", icon: Play, color: "text-amber-400", border: "border-amber-500/30" },
  { id: "DONE", label: "Completed", icon: CheckCircle2, color: "text-emerald-400", border: "border-emerald-500/30" }
];

export default function EmployeeTasks() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [movingTask, setMovingTask] = useState<string | null>(null);

  const fetchTasks = async () => {
    try {
      const data = await getEmployeeTasks();
      setTasks(data);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  useEffect(() => { fetchTasks(); }, []);

  const handleMoveTask = async (taskId: string, newStatus: "TODO" | "IN_PROGRESS" | "DONE" | "LATE") => {
    setMovingTask(taskId);
    try {
      // Optimistic update
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
      await updateTaskStatus(taskId, newStatus);
    } catch (error) {
      await fetchTasks(); // Revert on failure
    } finally {
      setMovingTask(null);
    }
  };

  if (loading) return <div className="flex-1 flex items-center justify-center text-indigo-400 h-full mt-20"><RefreshCw className="animate-spin" size={32} /></div>;

  return (
    <main className="flex-1 flex flex-col h-full overflow-hidden pb-10">
      <div className="px-6 py-6 pb-4">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-100 mb-1 flex items-center gap-2">
              <CheckSquare size={24} className="text-indigo-400" /> My Workspace
            </h1>
            <p className="text-sm text-slate-400">Atur progres pekerjaan Anda. Geser ke status berikutnya jika sudah dimulai.</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto px-6 pb-6" style={{ scrollbarWidth: "thin" }}>
        <div className="flex gap-6 min-w-max h-full items-start">
           {COLUMNS.map(col => {
              const colTasks = tasks.filter(t => t.status === col.id);
              return (
              <div key={col.id} className="w-80 flex flex-col max-h-[75vh] bg-[#0F1220]/80 rounded-2xl p-4 border border-white/5 flex-shrink-0">
                 <h3 className={`font-bold text-sm mb-4 flex items-center justify-between border-b ${col.border} pb-3`}>
                   <div className={`flex items-center gap-2 ${col.color}`}><col.icon size={16} />{col.label}</div>
                   <span className="bg-[#151929] text-slate-400 px-2.5 py-0.5 rounded-full text-xs border border-white/5 shadow-inner">{colTasks.length}</span>
                 </h3>
                 
                 <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-1" style={{ scrollbarWidth: "none" }}>
                   <AnimatePresence>
                     {colTasks.length === 0 ? (
                       <div className="p-4 rounded-xl border border-dashed border-white/10 flex flex-col items-center justify-center text-center opacity-50 py-8">
                         <col.icon size={24} className={`mb-2 ${col.color}`} />
                         <p className="text-xs text-slate-500 font-medium">Kosong</p>
                       </div>
                     ) : (
                       colTasks.map((task) => {
                         const overdue = task.dueDate && isPast(new Date(task.dueDate)) && !isToday(new Date(task.dueDate)) && task.status !== "DONE";
                         return (
                         <motion.div layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} key={task.id} className={`relative bg-[#161B33] border p-4 rounded-xl shadow-lg group ${overdue ? 'border-rose-500/40 shadow-[0_0_15px_rgba(244,63,94,0.1)]' : 'border-white/5 hover:border-indigo-500/30'} transition-colors`}>
                           {movingTask === task.id && (
                             <div className="absolute inset-0 z-10 bg-[#161B33]/80 backdrop-blur-sm rounded-xl flex items-center justify-center">
                               <RefreshCw size={20} className="text-indigo-400 animate-spin" />
                             </div>
                           )}
                           
                           {overdue && (
                             <div className="absolute -top-2 -right-2 bg-rose-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-lg flex items-center gap-1 animate-pulse"><AlertCircle size={10}/> TERLAMBAT</div>
                           )}

                           <h4 className={`text-sm font-bold mb-1.5 leading-tight ${task.status === "DONE" ? "text-slate-400 line-through" : "text-slate-200"}`}>{task.title}</h4>
                           <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mb-4">{task.description}</p>
                           
                           <div className="flex items-center justify-between pt-3 border-t border-white/5">
                             <div className={`flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase ${overdue ? 'text-rose-400' : 'text-slate-500'}`}>
                               <Clock size={12} /> {task.dueDate ? format(new Date(task.dueDate), "dd MMM") : "No Due"}
                             </div>
                             
                             <div className="flex gap-1.5">
                               {task.status === "TODO" && (
                                 <button onClick={() => handleMoveTask(task.id, "IN_PROGRESS")} className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-colors" title="Mulai Kerjakan"><Play size={14} /></button>
                               )}
                               {task.status === "IN_PROGRESS" && (
                                 <button onClick={() => handleMoveTask(task.id, "DONE")} className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors" title="Tandai Selesai"><Check size={14} strokeWidth={3} /></button>
                               )}
                             </div>
                           </div>
                         </motion.div>
                       )})
                     )}
                   </AnimatePresence>
                 </div>
              </div>
           )})}
        </div>
      </div>
    </main>
  );
}