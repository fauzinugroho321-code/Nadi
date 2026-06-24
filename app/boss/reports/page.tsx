"use client";

import { useState, useEffect } from "react";
import { ChevronDown, Download, RefreshCw, BarChart2 } from "lucide-react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, Tooltip, ResponsiveContainer } from "recharts";
import { getCompanyReportsData } from "@/app/actions/boss"; // <--- INI PENTING, MEMANGGIL DARI DATABASE

export default function BossReports() {
  const [activeTab, setActiveTab] = useState("overview");
  const [radarData, setRadarData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const data = await getCompanyReportsData();
        setRadarData(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 text-indigo-400 h-[60vh]">
        <RefreshCw className="animate-spin" size={32} />
        <span className="text-sm font-medium animate-pulse">Menghitung analitik perusahaan...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-100 mb-2">Reports & Analytics</h1>
          <p className="text-gray-400">Company-wide performance intelligence</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-[#1a1e2e]/60 border border-white/10 rounded-lg text-sm text-gray-300 flex items-center gap-2">This Month <ChevronDown size={14}/></button>
          <button className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 rounded-lg text-sm flex items-center gap-2 hover:bg-indigo-500/20"><Download size={14}/> Export Full Report</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-white/5">
        {["overview", "attendance", "productivity", "payroll"].map(t => (
          <button key={t} onClick={() => setActiveTab(t)} className={`pb-3 text-sm font-medium capitalize border-b-2 transition-colors ${activeTab === t ? "border-indigo-500 text-indigo-400" : "border-transparent text-gray-500 hover:text-gray-300"}`}>{t}</button>
        ))}
      </div>

      {/* Overview Content */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="col-span-1 md:col-span-2 bg-[#1a1e2e]/40 border border-white/5 rounded-2xl p-6 h-[400px] flex flex-col items-center justify-center text-slate-500">
             <BarChart2 size={48} className="mb-4 opacity-20" />
             <p className="text-sm">Modul Analitik Lanjutan sedang dalam pengembangan.</p>
             <p className="text-xs mt-2">Gunakan grafik Radar di sebelah kanan untuk melihat ringkasan divisi.</p>
           </div>
           
           <div className="bg-[#1a1e2e]/40 border border-white/5 rounded-2xl p-6 h-[400px]">
             <h3 className="text-lg font-semibold text-gray-200 mb-4">Division Performance Radar</h3>
             <ResponsiveContainer width="100%" height="80%">
               <RadarChart data={radarData}>
                 <PolarGrid stroke="#ffffff20" />
                 <PolarAngleAxis dataKey="subject" stroke="#9ca3af" fontSize={10} />
                 <Tooltip contentStyle={{ backgroundColor: '#151929', borderColor: '#374151', color: '#fff' }} itemStyle={{ color: '#818CF8' }} />
                 <Radar name="Performance" dataKey="Productivity" stroke="#6366F1" fill="#6366F1" fillOpacity={0.4} />
               </RadarChart>
             </ResponsiveContainer>
           </div>
        </div>
      )}

      {activeTab !== "overview" && (
        <div className="flex items-center justify-center h-48 border border-dashed border-white/10 rounded-2xl text-slate-500">
          Detail laporan untuk tab <strong className="ml-1 uppercase text-indigo-400">{activeTab}</strong> tersedia pada versi Enterprise.
        </div>
      )}
    </div>
  );
}