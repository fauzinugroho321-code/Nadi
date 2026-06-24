"use client";

import { useState, useEffect } from "react";
import { getEmployeeTasks, updateTaskStatus, createDemoTask } from "@/app/actions/task";
import { format } from "date-fns";
import { 
  Circle, RefreshCw, CheckCircle2, GripVertical, 
  Clock, PlusCircle, LayoutGrid, Search 
} from "lucide-react";

const COLUMNS = [
  { id: "TODO", label: "To Do", icon: Circle, color: "text-slate-400", border: "border-slate-500/30", bg: "bg-slate-500/10" },
  { id: "IN_PROGRESS", label: "In Progress", icon: RefreshCw, color: "text-amber-400", border: "border-amber-500/30", bg: "bg-amber-500/10" },
  { id: "DONE", label: "Done", icon: CheckCircle2, color: "text-emerald-400", border: "border-emerald-500/30", bg: "bg-emerald-500/10" }
];

export default function TasksKanbanPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  // Fungsi memuat tugas dari database
  const fetchTasks = async () => {
    try {
      const data = await getEmployeeTasks();
      setTasks(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Saat kartu mulai diseret
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("taskId", taskId);
    e.currentTarget.classList.add("opacity-50", "scale-95");
  };

  // Saat kartu dilepas dari seretan
  const handleDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove("opacity-50", "scale-95");
  };

  // Mengizinkan kolom untuk menerima jatuhan kartu
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); 
  };

  // Saat kartu mendarat di kolom baru
  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    if (!taskId) return;

    // 1. Optimistic Update (UI langsung berubah agar terasa cepat tanpa delay)
    setTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, status: newStatus } : t));

    // 2. Simpan ke Database via Server Action
    try {
      await updateTaskStatus(taskId, newStatus as any);
    } catch (error) {
      console.error("Gagal menyimpan ke database");
      fetchTasks(); // Kembalikan ke asal jika gagal
    }
  };

  // Fungsi membuat tugas bohongan (untuk testing)
  const handleAddDemoTask = async () => {
    setCreating(true);
    await createDemoTask();
    await fetchTasks();
    setCreating(false);
  };

  if (loading) {
    return (
      <div className="h-64 flex flex-col items-center justify-center gap-3 text-indigo-400">
        <RefreshCw className="animate-spin" />
        <span className="text-sm font-medium animate-pulse">Memuat Papan Tugas...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 h-full min-h-[85vh]">
      
      {/* Header Halaman */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[#111527]/50 p-6 rounded-2xl border border-white/5">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <LayoutGrid className="text-indigo-400" />
            My Tasks Board
          </h1>
          <p className="text-sm text-slate-400 mt-1">Seret dan lepas kartu untuk memperbarui status tugas Anda.</p>
        </div>
        
        <button 
          onClick={handleAddDemoTask}
          disabled={creating}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-xl transition-all shadow-[0_0_20px_rgba(99,102,241,0.2)] disabled:opacity-50"
        >
          {creating ? <RefreshCw size={16} className="animate-spin" /> : <PlusCircle size={16} />}
          Buat Tugas Demo
        </button>
      </div>

      {/* Papan Kanban (Kolom) */}
      <div className="flex flex-col lg:flex-row gap-6 flex-1 overflow-x-auto pb-4" style={{ scrollbarWidth: "thin" }}>
        {COLUMNS.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.id);
          
          return (
            <div 
              key={col.id} 
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
              className="flex-1 min-w-[300px] flex flex-col bg-[#0F1223] rounded-2xl border border-white/5 overflow-hidden"
            >
              {/* Kepala Kolom */}
              <div className={`px-5 py-4 border-b border-white/5 flex items-center justify-between`}>
                <div className="flex items-center gap-2.5">
                  <div className={`p-1.5 rounded-md ${col.bg} border ${col.border}`}>
                    <col.icon size={14} className={col.color} />
                  </div>
                  <h3 className="font-semibold text-slate-200">{col.label}</h3>
                </div>
                <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-xs font-bold text-slate-400">
                  {colTasks.length}
                </div>
              </div>

              {/* Area Jatuh Kartu (Isi Kolom) */}
              <div className="flex-1 p-4 flex flex-col gap-3 min-h-[200px]">
                {colTasks.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center border-2 border-dashed border-white/5 rounded-xl text-slate-600 text-sm">
                    Jatuhkan di sini
                  </div>
                ) : (
                  colTasks.map((task) => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      onDragEnd={handleDragEnd}
                      className="bg-[#161B33] border border-white/5 p-4 rounded-xl cursor-grab active:cursor-grabbing hover:border-indigo-500/30 hover:shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition-all group"
                    >
                      <div className="flex items-start gap-3">
                        <GripVertical size={16} className="text-slate-600 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab shrink-0" />
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-slate-200 mb-1 leading-tight">{task.title}</h4>
                          {task.description && (
                            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{task.description}</p>
                          )}
                          <div className="flex items-center gap-4 mt-4">
                            {task.dueDate && (
                              <div className="flex items-center gap-1.5 text-[10px] font-medium px-2 py-1 rounded bg-white/5 text-slate-400">
                                <Clock size={10} /> 
                                {format(new Date(task.dueDate), "dd MMM")}
                              </div>
                            )}
                            <div className={`text-[10px] font-bold tracking-wider ${col.color}`}>
                              {col.label.toUpperCase()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
      
    </div>
  );
}