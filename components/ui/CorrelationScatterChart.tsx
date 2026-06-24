import { motion } from 'motion/react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';

const generateData = () => {
  const divisions = ['Engineering', 'Sales', 'Marketing', 'Operations', 'HR'];
  const colors = {
    Engineering: '#6366F1',
    Sales: '#22D3EE',
    Marketing: '#D946EF',
    Operations: '#F59E0B',
    HR: '#10B981',
  };
  
  const data = [];
  for (let i = 0; i < 40; i++) {
    const division = divisions[Math.floor(Math.random() * divisions.length)];
    data.push({
      attendance: 80 + Math.random() * 20,
      productivity: 75 + Math.random() * 25,
      division,
      color: colors[division as keyof typeof colors],
    });
  }
  return data;
};

const data = generateData();

export function CorrelationScatterChart() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.5 }}
      className="bg-[#1a1e2e]/40 backdrop-blur-sm border border-white/5 rounded-2xl p-6"
    >
      <h3 className="text-lg font-semibold text-gray-200 mb-6">
        Correlation: Attendance vs. Productivity
      </h3>
      
      <ResponsiveContainer width="100%" height={280}>
        <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
          <XAxis 
            type="number" 
            dataKey="attendance" 
            name="Attendance Rate" 
            unit="%" 
            stroke="#9ca3af"
            style={{ fontSize: '12px' }}
            domain={[75, 105]}
            label={{ value: 'Attendance Rate (%)', position: 'bottom', fill: '#9ca3af', fontSize: 12 }}
          />
          <YAxis 
            type="number" 
            dataKey="productivity" 
            name="Productivity Score" 
            unit="%" 
            stroke="#9ca3af"
            style={{ fontSize: '12px' }}
            domain={[70, 105]}
            label={{ value: 'Productivity Score (%)', angle: -90, position: 'insideLeft', fill: '#9ca3af', fontSize: 12 }}
          />
          <Tooltip 
            cursor={{ strokeDasharray: '3 3' }}
            contentStyle={{ 
              backgroundColor: '#1a1e2e', 
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              color: '#e5e7eb'
            }}
            formatter={(value: any) => [`${value.toFixed(1)}%`, '']}
          />
          <ReferenceLine x={90} stroke="#6366F1" strokeDasharray="3 3" strokeOpacity={0.3} />
          <ReferenceLine y={90} stroke="#6366F1" strokeDasharray="3 3" strokeOpacity={0.3} />
          <Scatter name="Employees" data={data} fill="#6366F1">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} opacity={0.8} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>

      {/* Quadrant labels */}
      <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
        <div className="text-gray-500">
          <span className="text-amber-500">●</span> Low Attendance, Low Productivity
        </div>
        <div className="text-gray-400">
          <span className="text-cyan-400">●</span> High Attendance, Low Productivity
        </div>
        <div className="text-gray-400">
          <span className="text-indigo-400">●</span> Low Attendance, High Productivity
        </div>
        <div className="text-gray-300">
          <span className="text-green-400">●</span> High Attendance, High Productivity (Ideal)
        </div>
      </div>
    </motion.div>
  );
}
