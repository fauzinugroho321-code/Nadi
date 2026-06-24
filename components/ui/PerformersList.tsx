import { motion } from 'motion/react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const topPerformers = [
  { name: 'Sarah Chen', division: 'Engineering', score: 97, change: '+3' },
  { name: 'Michael Rodriguez', division: 'Sales', score: 95, change: '+5' },
  { name: 'Emily Johnson', division: 'Marketing', score: 94, change: '+2' },
  { name: 'David Kim', division: 'Operations', score: 93, change: '+4' },
  { name: 'Jennifer Lee', division: 'Engineering', score: 92, change: '+1' },
];

const bottomPerformers = [
  { name: 'Alex Thompson', division: 'Operations', score: 68, change: '-2' },
  { name: 'Maria Garcia', division: 'HR', score: 71, change: '-1' },
  { name: 'James Wilson', division: 'Sales', score: 74, change: '-3' },
  { name: 'Lisa Anderson', division: 'Marketing', score: 76, change: '0' },
  { name: 'Robert Davis', division: 'Engineering', score: 78, change: '+1' },
];

export function PerformersList() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.9, duration: 0.5 }}
      className="bg-[#1a1e2e]/40 backdrop-blur-sm border border-white/5 rounded-2xl p-6"
    >
      <h3 className="text-lg font-semibold text-gray-200 mb-6">
        Top & Bottom Performers
      </h3>

      {/* Top Performers */}
      <div className="mb-6">
        <div className="text-sm text-gray-400 mb-3 flex items-center gap-2">
          <TrendingUp size={16} className="text-cyan-400" />
          Top 5 Performers
        </div>
        <div className="space-y-3">
          {topPerformers.map((performer, index) => (
            <motion.div
              key={performer.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1 + index * 0.06, duration: 0.3 }}
              className="flex items-center justify-between p-3 rounded-lg bg-cyan-500/5 border border-cyan-500/10"
            >
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-200">{performer.name}</div>
                <div className="text-xs text-gray-500">{performer.division}</div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-cyan-400">{performer.change}</span>
                <div className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20">
                  <span className="text-sm font-semibold text-cyan-400 tabular-nums">{performer.score}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-white/5 my-6" />

      {/* Bottom Performers */}
      <div>
        <div className="text-sm text-gray-400 mb-3 flex items-center gap-2">
          <TrendingDown size={16} className="text-amber-400" />
          Needs Support
        </div>
        <div className="space-y-3">
          {bottomPerformers.map((performer, index) => (
            <motion.div
              key={performer.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.3 + index * 0.06, duration: 0.3 }}
              className="flex items-center justify-between p-3 rounded-lg bg-amber-500/5 border border-amber-500/10"
            >
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-200">{performer.name}</div>
                <div className="text-xs text-gray-500">{performer.division}</div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-amber-400">{performer.change}</span>
                <div className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
                  <span className="text-sm font-semibold text-amber-400 tabular-nums">{performer.score}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <button className="w-full mt-6 text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
        View Full Ranking →
      </button>
    </motion.div>
  );
}
