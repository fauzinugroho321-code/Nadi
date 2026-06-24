import { motion } from 'motion/react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from 'recharts';

const data = [
  { subject: 'Attendance', Engineering: 97, Sales: 92, Marketing: 89, Operations: 95, HR: 94 },
  { subject: 'Productivity', Engineering: 88, Sales: 94, Marketing: 91, Operations: 87, HR: 85 },
  { subject: 'Task Completion', Engineering: 91, Sales: 89, Marketing: 93, Operations: 90, HR: 88 },
  { subject: 'Leave Usage', Engineering: 85, Sales: 88, Marketing: 92, Operations: 86, HR: 90 },
];

export function DivisionRadarChart() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7, duration: 0.5 }}
      className="bg-[#1a1e2e]/40 backdrop-blur-sm border border-white/5 rounded-2xl p-6 h-full"
    >
      <h3 className="text-lg font-semibold text-gray-200 mb-6">
        Division Performance Radar
      </h3>
      
      <ResponsiveContainer width="100%" height={320}>
        <RadarChart data={data}>
          <PolarGrid stroke="#ffffff20" />
          <PolarAngleAxis 
            dataKey="subject" 
            stroke="#9ca3af"
            style={{ fontSize: '12px' }}
          />
          <PolarRadiusAxis 
            angle={90} 
            domain={[0, 100]} 
            stroke="#9ca3af"
            style={{ fontSize: '11px' }}
          />
          <Radar
            name="Engineering"
            dataKey="Engineering"
            stroke="#6366F1"
            fill="#6366F1"
            fillOpacity={0.25}
            strokeWidth={2}
          />
          <Radar
            name="Sales"
            dataKey="Sales"
            stroke="#22D3EE"
            fill="#22D3EE"
            fillOpacity={0.25}
            strokeWidth={2}
          />
          <Radar
            name="Marketing"
            dataKey="Marketing"
            stroke="#D946EF"
            fill="#D946EF"
            fillOpacity={0.25}
            strokeWidth={2}
          />
          <Radar
            name="Operations"
            dataKey="Operations"
            stroke="#F59E0B"
            fill="#F59E0B"
            fillOpacity={0.25}
            strokeWidth={2}
          />
          <Radar
            name="HR"
            dataKey="HR"
            stroke="#10B981"
            fill="#10B981"
            fillOpacity={0.25}
            strokeWidth={2}
          />
          <Legend 
            wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
