"use client";

import { useState, useEffect } from "react";
import { Plus, Users, Edit2, RefreshCw, Building2, X } from "lucide-react";
import { getAllDivisions, createDivision } from "@/app/actions/hr";
import { motion, AnimatePresence } from "motion/react";

export default function HRDivisions() {
  const [divisions, setDivisions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State untuk Modal Tambah Divisi
  const [showModal, setShowModal] = useState(false);
  const [newDivName, setNewDivName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchDivisions = async () => {
    try {
      const data = await getAllDivisions();
      setDivisions(data);
    } catch (error) {
      console.error("Gagal memuat divisi:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDivisions(); }, []);

  const handleAddDivision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDivName.trim()) return;
    setSubmitting(true);
    try {
      await createDivision(newDivName);
      setShowModal(false);
      setNewDivName("");
      await fetchDivisions(); // Refresh data
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const formatCompactRp = (n: number) => {
    if (n === 0) return "Belum diatur";
    if (n >= 1000000000) return `Rp ${(n / 1000000000).toFixed(1)}B`;
    if (n >= 1000000) return `Rp ${(n / 1000000).toFixed(0)}M`;
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
  };

  if (loading) return (
    <div className="flex-1 flex flex-col items-center justify-center gap-3 text-indigo-400 h-full min-h-[50vh]">
      <RefreshCw className="animate-spin" size={32} />
    </div>
  );

  return (
    <main className="flex-1 overflow-y-auto px-6 py-5 pb-20 relative">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-xl font-black text-slate-100">Divisions & Departments</h1>
          <p className="text-xs text-slate-400 mt-1">Manage company structure and teams</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/20 hover:scale-[0.98] transition-transform">
          <Plus size={14} /> Add Division
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {divisions.map((div) => (
          <div key={div.id} className="p-5 rounded-2xl border border-indigo-500/10 bg-[#0F1220] shadow-xl relative group hover:border-indigo-500/30 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4">
               <Building2 size={18} className="text-indigo-400" />
            </div>
            <h3 className="text-lg font-black text-slate-100 mb-4">{div.name}</h3>
            <div className="flex items-center gap-4 text-sm text-slate-400 mb-1">
              <span className="flex items-center gap-1.5 font-medium"><Users size={14} className="text-indigo-400"/> {div.headcount} Employees</span>
            </div>
            <div className="mt-4 pt-4 border-t border-indigo-500/10 flex justify-between items-center">
              <span className="text-[10px] uppercase font-bold text-slate-500">Est. Payroll</span>
              <span className={`text-xs font-bold ${div.budget > 0 ? "text-emerald-400" : "text-slate-500"}`}>{formatCompactRp(div.budget)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Add Division */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.form initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} onSubmit={handleAddDivision} className="bg-[#151929] border border-indigo-500/20 rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
              <button type="button" onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X size={18}/></button>
              <h2 className="text-lg font-bold text-white mb-4">Create New Division</h2>
              <div className="mb-6">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Division Name</label>
                <input type="text" autoFocus required value={newDivName} onChange={e => setNewDivName(e.target.value)} placeholder="e.g. Marketing, IT Support" className="w-full bg-[#0F1220] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-indigo-500" />
              </div>
              <button type="submit" disabled={submitting} className="w-full py-3 rounded-xl bg-indigo-500 text-white font-bold flex items-center justify-center gap-2 disabled:opacity-50">
                {submitting ? <RefreshCw size={16} className="animate-spin" /> : "Save Division"}
              </button>
            </motion.form>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}