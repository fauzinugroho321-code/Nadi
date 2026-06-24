import { Download, CheckCircle2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { motion } from 'motion/react';

interface SalaryComponent {
  label: string;
  amount: number;
}

interface PayslipData {
  month: string;
  year: number;
  status: 'Paid' | 'Processing' | 'Pending';
  employeeName: string;
  netSalary: number;
  earnings: SalaryComponent[];
  deductions: SalaryComponent[];
}

interface CurrentPayslipProps {
  data: PayslipData;
}

export function CurrentPayslip({ data }: CurrentPayslipProps) {
  const [displaySalary, setDisplaySalary] = useState(0);

  const totalEarnings = data.earnings.reduce((sum, item) => sum + item.amount, 0);
  const totalDeductions = data.deductions.reduce((sum, item) => sum + item.amount, 0);
  
  // Calculate proportions for the visual bar
  const takeHomePercent = (data.netSalary / totalEarnings) * 100;
  const deductionsPercent = (totalDeductions / totalEarnings) * 100;

  // Count-up animation for net salary
  useEffect(() => {
    const duration = 1000; // 1 second
    const steps = 60;
    const increment = data.netSalary / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(current + increment, data.netSalary);
      setDisplaySalary(Math.floor(current));

      if (step >= steps) {
        setDisplaySalary(data.netSalary);
        clearInterval(timer);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [data.netSalary]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = () => {
    switch (data.status) {
      case 'Paid':
        return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      case 'Processing':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'Pending':
        return 'bg-amber-500/10 text-amber-400/70 border-amber-500/20';
      default:
        return 'bg-white/10 text-white/70 border-white/20';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="relative bg-white/[0.03] border border-white/10 rounded-2xl p-8 backdrop-blur-sm"
      style={{
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.05)'
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-semibold text-white/90">
          {data.month} {data.year}
        </h2>
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ 
            delay: 0.2, 
            type: 'spring', 
            stiffness: 300, 
            damping: 15 
          }}
          className={`px-4 py-1.5 rounded-full border flex items-center gap-2 ${getStatusColor()}`}
        >
          {data.status === 'Paid' && <CheckCircle2 className="w-4 h-4" />}
          <span className="text-sm font-medium">{data.status}</span>
        </motion.div>
      </div>

      {/* Hero section - Net salary */}
      <div className="mb-10 pb-8 border-b border-white/10">
        <div className="text-sm text-white/40 mb-2">{data.employeeName}</div>
        <div className="text-6xl font-bold text-white mb-2 tracking-tight">
          {formatCurrency(displaySalary)}
        </div>
        <div className="text-sm text-white/50">Net Take-Home Pay</div>
      </div>

      {/* Breakdown */}
      <div className="space-y-8 mb-8">
        {/* Earnings */}
        <div>
          <h3 className="text-sm font-bold text-white/70 mb-4 uppercase tracking-wide">Earnings</h3>
          <div className="space-y-3">
            {data.earnings.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                className="flex justify-between items-center"
              >
                <span className="text-white/60">{item.label}</span>
                <span className="text-white font-medium">{formatCurrency(item.amount)}</span>
              </motion.div>
            ))}
            <div className="flex justify-between items-center pt-3 border-t border-white/5">
              <span className="text-white/80 font-semibold">Total Earnings</span>
              <span className="text-white font-bold">{formatCurrency(totalEarnings)}</span>
            </div>
          </div>
        </div>

        {/* Deductions */}
        <div>
          <h3 className="text-sm font-bold text-white/70 mb-4 uppercase tracking-wide">Deductions</h3>
          <div className="space-y-3">
            {data.deductions.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.05 }}
                className="flex justify-between items-center"
              >
                <span className="text-white/60">{item.label}</span>
                <span className="text-rose-400/80 font-medium">-{formatCurrency(item.amount)}</span>
              </motion.div>
            ))}
            <div className="flex justify-between items-center pt-3 border-t border-white/5">
              <span className="text-white/80 font-semibold">Total Deductions</span>
              <span className="text-rose-400 font-bold">-{formatCurrency(totalDeductions)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Proportional bar */}
      <div className="mb-6">
        <div className="h-2 bg-white/5 rounded-full overflow-hidden flex">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${takeHomePercent}%` }}
            transition={{ duration: 0.7, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="bg-gradient-to-r from-indigo-500 to-violet-500"
            style={{ boxShadow: '0 0 12px rgba(99, 102, 241, 0.5)' }}
          />
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${deductionsPercent}%` }}
            transition={{ duration: 0.7, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="bg-rose-500/60"
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-white/40">
          <span>Take-Home: {takeHomePercent.toFixed(1)}%</span>
          <span>Deductions: {deductionsPercent.toFixed(1)}%</span>
        </div>
      </div>

      {/* Download button */}
      <button className="w-full py-3.5 px-6 rounded-xl border-2 border-indigo-500/30 text-indigo-400 font-medium flex items-center justify-center gap-2 hover:bg-indigo-500/10 hover:border-indigo-500/50 hover:shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all duration-300 group">
        <Download className="w-5 h-5 group-hover:animate-bounce" />
        Download Payslip (PDF)
      </button>
    </motion.div>
  );
}
