import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Download, Loader2 } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ExportModal({ isOpen, onClose }: ExportModalProps) {
  const [format, setFormat] = useState('pdf');
  const [sections, setSections] = useState({
    overview: true,
    attendance: true,
    productivity: true,
    tasks: true,
    payroll: true,
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      onClose();
      // In a real app, this would trigger the download
    }, 2000);
  };

  const toggleSection = (key: keyof typeof sections) => {
    setSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-[#1a1e2e] border border-white/10 rounded-2xl p-6 w-full max-w-md pointer-events-auto shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-200">Export Report</h2>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-200 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Format selection */}
              <div className="mb-6">
                <label className="text-sm text-gray-400 mb-3 block">Export Format</label>
                <div className="flex gap-3">
                  {['pdf', 'csv', 'excel'].map((fmt) => (
                    <button
                      key={fmt}
                      onClick={() => setFormat(fmt)}
                      className={`flex-1 px-4 py-2.5 rounded-lg border transition-all ${
                        format === fmt
                          ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-400'
                          : 'bg-[#0f1219] border-white/10 text-gray-400 hover:border-white/20'
                      }`}
                    >
                      {fmt.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sections */}
              <div className="mb-6">
                <label className="text-sm text-gray-400 mb-3 block">Include Sections</label>
                <div className="space-y-2">
                  {Object.entries(sections).map(([key, value]) => (
                    <label
                      key={key}
                      className="flex items-center gap-3 p-3 rounded-lg bg-[#0f1219] border border-white/10 cursor-pointer hover:border-white/20 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={() => toggleSection(key as keyof typeof sections)}
                        className="w-4 h-4 rounded border-gray-600 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-0"
                      />
                      <span className="text-sm text-gray-300 capitalize">{key}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Period info */}
              <div className="mb-6 p-3 rounded-lg bg-indigo-500/5 border border-indigo-500/20">
                <div className="text-xs text-gray-400 mb-1">Period</div>
                <div className="text-sm text-gray-200">June 2026 (This Month)</div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-white/10 text-gray-400 hover:text-gray-200 hover:border-white/20 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download size={16} />
                      Generate Report
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
