import { Download, ChevronDown, ChevronUp, TrendingUp, TrendingDown } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface SalaryComponent {
  label: string;
  amount: number;
}

interface HistoricalPayslip {
  month: string;
  year: number;
  netSalary: number;
  status: 'Paid' | 'Processing' | 'Pending';
  earnings: SalaryComponent[];
  deductions: SalaryComponent[];
  salaryChange?: number; // compared to previous month
}

interface PayslipHistoryProps {
  history: HistoricalPayslip[];
}

export function PayslipHistory({ history }: PayslipHistoryProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
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

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-white mb-6">Payslip History</h2>

      <div className="space-y-3">
        {history.map((payslip, index) => {
          const isExpanded = expandedIndex === index;
          const totalEarnings = payslip.earnings.reduce((sum, item) => sum + item.amount, 0);
          const totalDeductions = payslip.deductions.reduce((sum, item) => sum + item.amount, 0);

          return (
            <motion.div
              key={`${payslip.month}-${payslip.year}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                delay: index * 0.08,
                duration: 0.4,
                ease: [0.22, 1, 0.36, 1]
              }}
              className="relative bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300"
            >
              {/* Main row */}
              <div
                className="p-5 flex items-center gap-4 cursor-pointer"
                onClick={() => toggleExpand(index)}
              >
                {/* Month/Year */}
                <div className="flex-shrink-0 w-32">
                  <div className="text-white font-bold">
                    {payslip.month} {payslip.year}
                  </div>
                </div>

                {/* Net salary */}
                <div className="flex-1">
                  <div className="text-white font-bold text-lg">
                    {formatCurrency(payslip.netSalary)}
                  </div>
                </div>

                {/* Salary change indicator */}
                {payslip.salaryChange !== undefined && payslip.salaryChange !== 0 && (
                  <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
                    payslip.salaryChange > 0 
                      ? 'bg-cyan-500/20 text-cyan-400' 
                      : 'bg-rose-500/20 text-rose-400'
                  }`}>
                    {payslip.salaryChange > 0 ? (
                      <>
                        <TrendingUp className="w-4 h-4" />
                        <span>+{formatCurrency(payslip.salaryChange)}</span>
                      </>
                    ) : (
                      <>
                        <TrendingDown className="w-4 h-4" />
                        <span>{formatCurrency(payslip.salaryChange)}</span>
                      </>
                    )}
                  </div>
                )}

                {/* Status badge */}
                <div className={`px-3 py-1 rounded-full border text-sm font-medium ${getStatusColor(payslip.status)}`}>
                  {payslip.status}
                </div>

                {/* Download icon */}
                <button 
                  className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Handle download
                  }}
                >
                  <Download className="w-4 h-4 text-white/60 hover:text-white/90" />
                </button>

                {/* Expand icon */}
                <div className="w-9 h-9 flex items-center justify-center">
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-white/60" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-white/60" />
                  )}
                </div>
              </div>

              {/* Expanded details */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div className="px-5 pb-5 border-t border-white/5">
                      <div className="grid grid-cols-2 gap-8 pt-5">
                        {/* Earnings */}
                        <div>
                          <h4 className="text-xs font-bold text-white/50 mb-3 uppercase tracking-wide">
                            Earnings
                          </h4>
                          <div className="space-y-2">
                            {payslip.earnings.map((item) => (
                              <div key={item.label} className="flex justify-between text-sm">
                                <span className="text-white/60">{item.label}</span>
                                <span className="text-white/90">{formatCurrency(item.amount)}</span>
                              </div>
                            ))}
                            <div className="flex justify-between text-sm pt-2 border-t border-white/5 font-semibold">
                              <span className="text-white/80">Total</span>
                              <span className="text-white">{formatCurrency(totalEarnings)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Deductions */}
                        <div>
                          <h4 className="text-xs font-bold text-white/50 mb-3 uppercase tracking-wide">
                            Deductions
                          </h4>
                          <div className="space-y-2">
                            {payslip.deductions.map((item) => (
                              <div key={item.label} className="flex justify-between text-sm">
                                <span className="text-white/60">{item.label}</span>
                                <span className="text-rose-400/80">-{formatCurrency(item.amount)}</span>
                              </div>
                            ))}
                            <div className="flex justify-between text-sm pt-2 border-t border-white/5 font-semibold">
                              <span className="text-white/80">Total</span>
                              <span className="text-rose-400">-{formatCurrency(totalDeductions)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
