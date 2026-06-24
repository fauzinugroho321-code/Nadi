import { motion } from 'motion/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';

const data = [
  { month: 'Jan', attendance: 94, productivity: 87, taskCompletion: 89 },
  { month: 'Feb', attendance: 96, productivity: 85, taskCompletion: 91 },
  { month: 'Mar', attendance: 93, productivity: 88, taskCompletion: 87 },
  { month: 'Apr', attendance: 95, productivity: 90, taskCompletion: 93 },
  { month: 'May', attendance: 97, productivity: 92, taskCompletion: 94 },
  { month: 'Jun', attendance: 96, productivity: 91, taskCompletion: 92 },
];

export function PerformanceTrendsChart() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.5 }}
      className="bg-[#1a1e2e]/40 backdrop-blur-sm border border-white/5 rounded-2xl p-6 h-full"
    >
      <h3 className="text-lg font-semibold text-gray-200 mb-6">
        Key Performance Metrics — Trend Over Time
      </h3>
      
      <ResponsiveContainer width="100%" height={320}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22D3EE" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#22D3EE" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorProductivity" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#D946EF" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#D946EF" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
          <XAxis 
            dataKey="month" 
            stroke="#9ca3af" 
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="#9ca3af" 
            style={{ fontSize: '12px' }}
            domain={[80, 100]}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1a1e2e', 
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              color: '#e5e7eb'
            }}
          />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="line"
          />
          <Area
            type="monotone"
            dataKey="attendance"
            stroke="#22D3EE"
            strokeWidth={2.5}
            fill="url(#colorAttendance)"
            name="Attendance Rate"
            dot={{ fill: '#22D3EE', r: 4 }}
            activeDot={{ r: 6, stroke: '#22D3EE', strokeWidth: 2 }}
          />
          <Area
            type="monotone"
            dataKey="productivity"
            stroke="#6366F1"
            strokeWidth={2.5}
            fill="url(#colorProductivity)"
            name="Productivity Score"
            dot={{ fill: '#6366F1', r: 4 }}
            activeDot={{ r: 6, stroke: '#6366F1', strokeWidth: 2 }}
          />
          <Area
            type="monotone"
            dataKey="taskCompletion"
            stroke="#D946EF"
            strokeWidth={2.5}
            fill="url(#colorTasks)"
            name="Task Completion"
            dot={{ fill: '#D946EF', r: 4 }}
            activeDot={{ r: 6, stroke: '#D946EF', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
