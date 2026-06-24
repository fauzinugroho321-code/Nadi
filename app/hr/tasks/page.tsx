"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Circle, RefreshCw, CheckCircle2, Clock, X, AlertTriangle } from "lucide-react";
import { getAllCompanyTasks, getAllEmployees, createTask } from "@/app/actions/hr";
import { format } from "date-fns";
import { motion, AnimatePresence } from "motion/react";

const COLUMNS = [
  { id: "TODO", label: "To Do", icon: Circle, color: "text-slate-400" },
  { id: "IN_PROGRESS", label: "In Progress", icon: RefreshCw, color: "text-amber-400" },
  { id: "DONE", label: "Done", icon: CheckCircle2, color: "text-emerald-400" }
];

export default function HRTasks() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [dueDate, setDueDate] = useState("");

  const fetchData = async () => {
    try {
      const [tData, eData] = await Promise.all([getAllCompanyTasks(), getAllEmployees()]);
      setTasks(tData); setEmployees(eData);
      if (eData.length > 0) setAssigneeId(eData[0].id);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAssignTask = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true);
    try {
      await createTask({ title, description: desc, assigneeId, dueDate: new Date(dueDate) });
      setShowModal(false); setTitle(""); setDesc(""); setDueDate(""); await fetchData();
    } catch (error) { console.error(error); } finally { setSubmitting(false); }
  };

  const filteredTasks = tasks.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()) || t.assignee?.name.toLowerCase().includes(searchQuery.toLowerCase()));

  if (loading) return <div className="flex-1 flex justify-center text-indigo-400 h-full mt-20"><RefreshCw className="animate-spin" size={32} /></div>;

  return (
    <main className="flex-1 flex flex-col h-full overflow-hidden pb-10">
      <div className="px-6 py-6 pb-2">
        <div className="flex items-center justify-between mb-4">
          <div><h1 className="text-2xl font-bold text-slate-100">Company Tasks</h1></div>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500 text-white text-sm font-bold shadow-lg hover:scale-95 transition-all"><Plus size={16} /> Assign Task</button>
        </div>
        <div className="flex gap-2 mb-4">
           <div className="flex items-center gap-2 px-3 py-2 bg-[#1A1F30] border border-indigo-500/10 rounded-xl flex-1 max-w-xs focus-within:border-indigo-500/50 transition-colors">
              <Search size={14} className="text-slate-500"/>
              <input type="text" placeholder="Cari nama tugas atau assignee..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-transparent outline-none text-sm text-white w-full placeholder:text-slate-600" />
           </div>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto px-6 pb-6" style={{ scrollbarWidth: "thin" }}>
        <div className="flex gap-6 min-w-max h-full items-start">
           {COLUMNS.map(col => {
              const colTasks = filteredTasks.filter(t => t.status === col.id);
              return (
              <div key={col.id} className="w-80 flex flex-col max-h-[70vh] bg-[#0F1220]/80 rounded-2xl p-4 border border-white/5 flex-shrink-0">
                 <h3 className="font-bold text-sm text-slate-200 mb-4 flex items-center justify-between border-b border-white/5 pb-3">
                   <div className="flex items-center gap-2"><col.icon size={14} className={col.color} />{col.label}</div>
                   <span className="bg-white/10 text-slate-300 px-2 py-0.5 rounded-full text-xs">{colTasks.length}</span>
                 </h3>
                 <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-1" style={{ scrollbarWidth: "none" }}>
                   {colTasks.map((task) => {
                     // BUG FIX: Indikator Overdue
                     const isOverdue = task.dueDate && new Date(task.dueDate).setHours(0,0,0,0) < new Date().setHours(0,0,0,0) && task.status !== "DONE";
                     
                     return (
                     <div key={task.id} className={`relative bg-[#161B33] border p-4 rounded-xl transition-colors ${isOverdue ? 'border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.1)]' : 'border-white/5 hover:border-indigo-500/30'}`}>
                       {isOverdue && (
                         <div className="absolute -top-2 -right-2 bg-rose-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-lg flex items-center gap-1 animate-pulse"><AlertTriangle size={10}/> OVERDUE</div>
                       )}
                       <h4 className="text-sm font-medium text-slate-200 mb-1 leading-tight pr-4">{task.title}</h4>
                       <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mb-3">{task.description}</p>
                       <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                         <div className="flex items-center gap-2">
                           <div className="w-5 h-5 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-[8px] font-bold text-white shadow-sm">{task.assignee?.name.substring(0,2).toUpperCase()}</div>
                           <span className="text-[10px] text-slate-400 font-medium">{task.assignee?.name.split(" ")[0]}</span>
                         </div>
                         {task.dueDate && <div className={`flex items-center gap-1 text-[10px] font-medium ${isOverdue ? 'text-rose-400' : 'text-slate-400'}`}><Clock size={10} />{format(new Date(task.dueDate), "dd MMM")}</div>}
                       </div>
                     </div>
                   )})}
                 </div>
              </div>
           )})}
        </div>
      </div>

      {/* Modal Assign Task */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.form initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} onSubmit={handleAssignTask} className="bg-[#151929] border border-indigo-500/20 rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
              <button type="button" onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X size={18}/></button>
              <h2 className="text-lg font-bold text-white mb-5">Assign New Task</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Task Title</label>
                  <input type="text" required value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-[#0F1220] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Description</label>
                  <textarea rows={2} value={desc} onChange={e => setDesc(e.target.value)} className="w-full bg-[#0F1220] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500 resize-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Assign To</label>
                  <select value={assigneeId} onChange={e => setAssigneeId(e.target.value)} required className="w-full bg-[#0F1220] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500">
                    {employees.filter(e => e.role !== "BOSS" && e.role !== "HR").map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Due Date</label>
                  <input type="date" required value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full bg-[#0F1220] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500" color-scheme="dark" />
                </div>
              </div>
              <button type="submit" disabled={submitting} className="w-full py-3 mt-6 rounded-xl bg-indigo-500 text-white font-bold flex items-center justify-center gap-2">
                {submitting ? <RefreshCw size={16} className="animate-spin" /> : "Deploy Task"}
              </button>
            </motion.form>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}