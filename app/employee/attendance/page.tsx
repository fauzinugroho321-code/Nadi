"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, CalendarDays, Clock, AlertCircle, RefreshCw, LogIn, LogOut } from "lucide-react";
import { getMyAttendanceHistory } from "@/app/actions/attendance";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isFuture } from "date-fns";

export default function EmployeeAttendance() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State untuk interaksi klik hari
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);

  // Ambil data setiap kali bulan/tahun berubah
  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const data = await getMyAttendanceHistory(currentDate.getFullYear(), currentDate.getMonth());
        setRecords(data);
      } catch (error) {
        console.error("Gagal mengambil riwayat absensi:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [currentDate]);

  // Tombol navigasi bulan
  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  // Saat tanggal di kalender diklik
  const handleDayClick = (day: Date, record: any) => {
    setSelectedDay(day);
    setSelectedRecord(record || null);
  };

  // Hitung Statistik Bulanan
  const presentCount = records.filter(r => r.status === "PRESENT").length;
  const incompleteCount = records.filter(r => r.status === "INCOMPLETE").length;
  const leaveCount = records.filter(r => r.status === "LEAVE").length;
  const absentCount = records.filter(r => r.status === "ABSENT").length;

  // Persiapan render kalender
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const firstDayOffset = monthStart.getDay(); // 0 = Minggu, 1 = Senin, dst.
  const blanks = Array(firstDayOffset).fill(null);

  return (
    <div className="flex flex-col gap-6 h-full pb-10">
      
      {/* Header & Navigasi */}
      <div className="flex items-center justify-between bg-[#111527]/50 p-6 rounded-2xl border border-white/5">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
            <CalendarDays className="text-indigo-400" />
            My Attendance
          </h1>
          <p className="text-sm text-slate-400 mt-1">Rekam jejak kehadiran harian Anda.</p>
        </div>
        <div className="flex bg-[#161B33] border border-indigo-500/30 rounded-xl p-1 items-center shadow-[0_0_15px_rgba(99,102,241,0.15)]">
           <button onClick={handlePrevMonth} className="p-2 text-slate-400 hover:text-white transition"><ChevronLeft size={18}/></button>
           <span className="px-4 text-sm font-bold text-slate-100 min-w-[120px] text-center">
             {format(currentDate, "MMMM yyyy")}
           </span>
           <button onClick={handleNextMonth} className="p-2 text-slate-400 hover:text-white transition"><ChevronRight size={18}/></button>
        </div>
      </div>

      {/* Baris Statistik */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#111527]/70 border border-white/5 rounded-2xl p-5 text-center flex flex-col items-center">
          <div className="text-3xl font-black text-cyan-400 drop-shadow-[0_0_12px_rgba(34,211,238,0.4)]">{presentCount}</div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-2">Present</div>
        </div>
        <div className="bg-[#111527]/70 border border-white/5 rounded-2xl p-5 text-center flex flex-col items-center">
          <div className="text-3xl font-black text-amber-500 drop-shadow-[0_0_12px_rgba(245,158,11,0.4)]">{incompleteCount}</div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-2">Incomplete / Late</div>
        </div>
        <div className="bg-[#111527]/70 border border-white/5 rounded-2xl p-5 text-center flex flex-col items-center">
          <div className="text-3xl font-black text-indigo-400 drop-shadow-[0_0_12px_rgba(99,102,241,0.4)]">{leaveCount}</div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-2">Leave</div>
        </div>
        <div className="bg-[#111527]/70 border border-white/5 rounded-2xl p-5 text-center flex flex-col items-center">
          <div className="text-3xl font-black text-rose-500 drop-shadow-[0_0_12px_rgba(244,63,94,0.4)]">{absentCount}</div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-2">Absent</div>
        </div>
      </div>

      {/* Area Kalender & Panel Detail */}
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Kalender Utama */}
        <div className="flex-1 bg-[#0F1223] border border-white/5 rounded-2xl p-6 relative min-h-[400px]">
          {loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0F1223]/80 backdrop-blur-sm z-10 rounded-2xl text-indigo-400">
               <RefreshCw className="animate-spin mb-3" size={32} />
               <span className="text-sm font-medium animate-pulse">Memuat data...</span>
            </div>
          ) : null}

          {/* Nama Hari */}
          <div className="grid grid-cols-7 mb-4">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
              <div key={day} className="text-center text-[11px] font-bold text-slate-500 uppercase tracking-widest pb-3 border-b border-white/5">
                {day}
              </div>
            ))}
          </div>

          {/* Grid Tanggal */}
          <div className="grid grid-cols-7 gap-2">
            {blanks.map((_, i) => (
              <div key={`blank-${i}`} className="aspect-square rounded-xl bg-white/[0.01]" />
            ))}
            
            {daysInMonth.map((day) => {
              const record = records.find(r => isSameDay(new Date(r.date), day));
              const isFutureDay = isFuture(day) && !isToday(day);
              const isSelected = selectedDay && isSameDay(selectedDay, day);

              // Tentukan warna berdasarkan status
              let bgColor = "bg-white/[0.03] hover:bg-white/10";
              let textColor = "text-slate-300";
              let borderColor = "border-transparent";

              if (record) {
                if (record.status === "PRESENT") { bgColor = "bg-cyan-500/10 hover:bg-cyan-500/20"; textColor = "text-cyan-400"; borderColor = "border-cyan-500/30"; }
                if (record.status === "INCOMPLETE") { bgColor = "bg-amber-500/10 hover:bg-amber-500/20"; textColor = "text-amber-400"; borderColor = "border-amber-500/30"; }
                if (record.status === "LEAVE") { bgColor = "bg-indigo-500/10 hover:bg-indigo-500/20"; textColor = "text-indigo-400"; borderColor = "border-indigo-500/30"; }
                if (record.status === "ABSENT") { bgColor = "bg-rose-500/10 hover:bg-rose-500/20"; textColor = "text-rose-400"; borderColor = "border-rose-500/30"; }
              } else if (isFutureDay) {
                textColor = "text-slate-600";
              } else if (!isFutureDay && !isToday(day)) {
                // Hari kemarin tapi tidak ada record = Merah Pudar (Kemungkinan bolos belum diproses)
                bgColor = "bg-white/[0.02]";
                textColor = "text-slate-500";
              }

              if (isToday(day)) borderColor = "border-white/50";
              if (isSelected) borderColor = "border-white";

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => handleDayClick(day, record)}
                  disabled={isFutureDay}
                  className={`aspect-square rounded-xl border flex flex-col items-center justify-center transition-all ${bgColor} ${borderColor} ${isFutureDay ? "cursor-not-allowed" : "cursor-pointer"} ${isSelected ? "ring-2 ring-indigo-500 ring-offset-2 ring-offset-[#0F1223] scale-95" : ""}`}
                >
                  <span className={`text-lg font-bold ${textColor}`}>{format(day, "d")}</span>
                  {record && <span className={`w-1.5 h-1.5 rounded-full mt-1 ${record.status === 'PRESENT' ? 'bg-cyan-400' : record.status === 'INCOMPLETE' ? 'bg-amber-400' : record.status === 'LEAVE' ? 'bg-indigo-400' : 'bg-rose-400'}`} />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Panel Detail Samping */}
        <div className="w-full lg:w-[340px] bg-[#111527]/70 border border-white/5 rounded-2xl p-6 flex flex-col">
          {!selectedDay ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-4 text-center py-10">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                <CalendarDays size={32} className="opacity-50" />
              </div>
              <p className="text-sm px-4">Klik salah satu tanggal pada kalender untuk melihat detail jam masuk dan jam pulang Anda.</p>
            </div>
          ) : (
            <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300">
               <div className="text-center pb-6 mb-6 border-b border-white/5">
                 <h3 className="text-2xl font-black text-white">{format(selectedDay, "dd MMMM yyyy")}</h3>
                 <p className="text-sm text-slate-400 mt-1">{format(selectedDay, "EEEE")}</p>
               </div>

               {!selectedRecord ? (
                 <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-3 text-center">
                   <AlertCircle size={24} className="text-slate-600" />
                   <p className="text-sm">Tidak ada rekam absensi untuk hari ini.</p>
                 </div>
               ) : (
                 <div className="flex flex-col gap-5">
                   <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                     <div className="flex items-center gap-3">
                       <LogIn className="text-cyan-400" size={20} />
                       <span className="text-sm font-semibold text-slate-300">Clock In</span>
                     </div>
                     <span className="text-lg font-mono font-bold text-white">
                       {selectedRecord.clockIn ? format(new Date(selectedRecord.clockIn), "HH:mm") : "--:--"}
                     </span>
                   </div>

                   <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                     <div className="flex items-center gap-3">
                       <LogOut className="text-indigo-400" size={20} />
                       <span className="text-sm font-semibold text-slate-300">Clock Out</span>
                     </div>
                     <span className="text-lg font-mono font-bold text-white">
                       {selectedRecord.clockOut ? format(new Date(selectedRecord.clockOut), "HH:mm") : "--:--"}
                     </span>
                   </div>

                   <div className="mt-4">
                     <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Status Harian</span>
                     <div className={`px-4 py-3 rounded-xl border text-sm font-bold flex items-center gap-2 ${
                        selectedRecord.status === "PRESENT" ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30" :
                        selectedRecord.status === "INCOMPLETE" ? "bg-amber-500/10 text-amber-400 border-amber-500/30" :
                        selectedRecord.status === "LEAVE" ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/30" :
                        "bg-rose-500/10 text-rose-400 border-rose-500/30"
                     }`}>
                        {selectedRecord.status}
                     </div>
                   </div>
                 </div>
               )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}