"use client";

import { useState, useEffect } from "react";
import { Search, Filter, RefreshCw, X, Building2, Briefcase, Download } from "lucide-react";
import { getAllAttendances, fixAttendanceEntry } from "@/app/actions/hr";
import { format } from "date-fns";
import { motion, AnimatePresence } from "motion/react";

export default function HRAttendance() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [fixModal, setFixModal] = useState<{ isOpen: boolean; record: any }>({ isOpen: false, record: null });
  const [detailModal, setDetailModal] = useState<{ isOpen: boolean; record: any }>({ isOpen: false, record: null });
  
  const [clockIn, setClockIn] = useState("");
  const [clockOut, setClockOut] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchAttendances = async () => {
    try {
      const data = await getAllAttendances();
      setRecords(data);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  useEffect(() => { fetchAttendances(); }, []);

  const handleFixSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const baseDate = new Date(fixModal.record.date).toISOString().split('T')[0];
      const newClockIn = new Date(`${baseDate}T${clockIn}:00`);
      const newClockOut = clockOut ? new Date(`${baseDate}T${clockOut}:00`) : null;
      await fixAttendanceEntry(fixModal.record.id, newClockIn, newClockOut);
      setFixModal({ isOpen: false, record: null });
      await fetchAttendances();
    } catch (error) { console.error(error); } finally { setSubmitting(false); }
  };

  // FITUR BARU: Export Data ke CSV (Excel)
  const handleExportCSV = () => {
    const headers = ["Nama Karyawan,Divisi,Tipe Kerja,Tanggal,Clock In,Clock Out,Status"];
    const rows = filteredRecords.map(r => {
      const inTime = r.clockIn ? format(new Date(r.clockIn), "HH:mm") : "--:--";
      const outTime = r.clockOut ? format(new Date(r.clockOut), "HH:mm") : "--:--";
      const date = format(new Date(r.date), "yyyy-MM-dd");
      const divName = r.user.division?.name || "No Division";
      return `"${r.user.name}","${divName}","${r.user.workType}","${date}","${inTime}","${outTime}","${r.status}"`;
    });

    const csvContent = "data:text/csv;charset=utf-8," + headers.concat(rows).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Data_Absensi_${format(new Date(), "yyyyMMdd")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredRecords = records.filter(r => 
    r.user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (r.user.division?.name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div className="flex-1 flex items-center justify-center text-indigo-400 h-full mt-20"><RefreshCw className="animate-spin" size={32} /></div>;

  return (
    <main className="flex-1 overflow-y-auto px-6 py-5 pb-20">
      <div className="flex flex-col md:flex-row justify-between md:items-end mb-6 gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-100">Attendance Log</h1>
          <p className="text-xs text-slate-400 mt-1">Manage and monitor employee daily attendance</p>
        </div>
        <div className="flex gap-2 items-center flex-wrap">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#0F1220] border border-indigo-500/20 focus-within:border-indigo-500/50 transition-colors">
            <Search size={14} className="text-slate-500" />
            <input type="text" placeholder="Cari nama / divisi..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="bg-transparent text-xs text-slate-200 outline-none w-32 md:w-40" />
          </div>
          <button onClick={handleExportCSV} className="flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg transition-colors">
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-indigo-500/10 bg-[#0F1220] overflow-hidden shadow-xl overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-indigo-500/10 bg-indigo-500/5">
              <th className="py-4 px-5 text-xs font-black text-slate-300 uppercase tracking-wider">Employee</th>
              <th className="py-4 px-5 text-xs font-black text-slate-300 uppercase tracking-wider">Date</th>
              <th className="py-4 px-5 text-xs font-black text-slate-300 uppercase tracking-wider">Clock In/Out</th>
              <th className="py-4 px-5 text-xs font-black text-slate-300 uppercase tracking-wider">Status</th>
              <th className="py-4 px-5 text-xs font-black text-slate-300 uppercase tracking-wider text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.map((row) => (
              <tr key={row.id} className="border-b border-indigo-500/5 hover:bg-white/[0.02] transition-colors">
                <td className="py-4 px-5">
                  <div className="text-sm font-semibold text-slate-200">{row.user.name}</div>
                  <div className="text-[10px] text-slate-500">{row.user.division?.name || "No Div"}</div>
                </td>
                <td className="py-4 px-5 text-xs text-slate-400">{format(new Date(row.date), "dd MMM yyyy")}</td>
                <td className="py-4 px-5 text-xs text-slate-300 font-mono">
                  <span className="text-cyan-400">{row.clockIn ? format(new Date(row.clockIn), "HH:mm") : "--:--"}</span>
                  <span className="text-slate-500 mx-1"> - </span>
                  <span className="text-indigo-400">{row.clockOut ? format(new Date(row.clockOut), "HH:mm") : "--:--"}</span>
                </td>
                <td className="py-4 px-5">
                  <span className={`text-[10px] font-bold px-3 py-1 rounded-full border tracking-wider ${
                    row.status === "PRESENT" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                    row.status === "INCOMPLETE" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                    row.status === "LEAVE" ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" :
                    "bg-rose-500/10 text-rose-400 border-rose-500/20"
                  }`}>{row.status}</span>
                </td>
                <td className="py-4 px-5 flex justify-end gap-2">
                  {row.status === "INCOMPLETE" ? (
                    <button onClick={() => { 
                      setFixModal({ isOpen: true, record: row });
                      setClockIn(row.clockIn ? format(new Date(row.clockIn), "HH:mm") : "");
                      setClockOut(row.clockOut ? format(new Date(row.clockOut), "HH:mm") : "");
                    }} className="text-[10px] font-bold px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 transition-colors">Fix Entry</button>
                  ) : (
                    <button onClick={() => setDetailModal({ isOpen: true, record: row })} className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors"><Search size={14} /></button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Detail dan Modal Fix (Sama seperti sebelumnya) */}
      <AnimatePresence>
        {fixModal.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.form initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} onSubmit={handleFixSubmit} className="bg-[#151929] border border-amber-500/30 rounded-2xl p-6 w-full max-w-sm shadow-2xl relative">
              <button type="button" onClick={() => setFixModal({ isOpen: false, record: null })} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X size={18}/></button>
              <h2 className="text-lg font-bold text-white mb-1">Koreksi Absensi</h2>
              <p className="text-xs text-slate-400 mb-5">Atur jam manual untuk <span className="text-amber-400 font-bold">{fixModal.record?.user.name}</span></p>
              <div className="flex gap-4 mb-6">
                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Clock In</label>
                  <input type="time" required value={clockIn} onChange={e => setClockIn(e.target.value)} className="w-full bg-[#0F1220] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-amber-500" color-scheme="dark" />
                </div>
                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Clock Out</label>
                  <input type="time" value={clockOut} onChange={e => setClockOut(e.target.value)} className="w-full bg-[#0F1220] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-amber-500" color-scheme="dark" />
                </div>
              </div>
              <button type="submit" disabled={submitting} className="w-full py-3 rounded-xl bg-amber-500 text-amber-950 font-black flex items-center justify-center gap-2 hover:scale-[0.98] transition-transform">
                {submitting ? <RefreshCw size={16} className="animate-spin" /> : "Simpan Koreksi"}
              </button>
            </motion.form>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {detailModal.isOpen && detailModal.record && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[#151929] border border-indigo-500/30 rounded-2xl p-6 w-full max-w-sm shadow-2xl relative">
              <button type="button" onClick={() => setDetailModal({ isOpen: false, record: null })} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"><X size={18}/></button>
              <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white font-bold shadow-lg">
                  {detailModal.record.user.name.substring(0,2).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white leading-tight">{detailModal.record.user.name}</h2>
                  <p className="text-xs text-indigo-400 font-medium">{format(new Date(detailModal.record.date), "EEEE, dd MMMM yyyy")}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-[#0F1220] rounded-xl border border-white/5">
                  <Building2 size={16} className="text-slate-500" />
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Divisi</div>
                    <div className="text-sm font-semibold text-slate-200">{detailModal.record.user.division?.name || "Tidak ada divisi"}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-[#0F1220] rounded-xl border border-white/5">
                  <Briefcase size={16} className="text-slate-500" />
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Tipe Kerja</div>
                    <div className="text-sm font-semibold text-slate-200">{detailModal.record.user.workType}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-2">
                   <div className="p-3 bg-[#0F1220] rounded-xl border border-white/5 text-center">
                     <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Clock In</div>
                     <div className="text-lg font-mono font-bold text-cyan-400">{detailModal.record.clockIn ? format(new Date(detailModal.record.clockIn), "HH:mm") : "--:--"}</div>
                   </div>
                   <div className="p-3 bg-[#0F1220] rounded-xl border border-white/5 text-center">
                     <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Clock Out</div>
                     <div className="text-lg font-mono font-bold text-indigo-400">{detailModal.record.clockOut ? format(new Date(detailModal.record.clockOut), "HH:mm") : "--:--"}</div>
                   </div>
                </div>
              </div>
              <button onClick={() => setDetailModal({ isOpen: false, record: null })} className="w-full mt-6 py-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold hover:bg-indigo-500/20 transition-colors">
                Tutup Jendela
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}