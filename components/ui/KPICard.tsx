import { useEffect, useState } from 'react';
import { motion } from 'motion/react';

interface KPICardProps {
  label: string;
  value: string | number;
  color?: 'indigo' | 'cyan' | 'white';
  delay?: number;
}

export function KPICard({ label, value, color = 'white', delay = 0 }: KPICardProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const numericValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.]/g, '')) : value;
  const isPercentage = typeof value === 'string' && value.includes('%');
  const isCurrency = typeof value === 'string' && value.includes('$');
  const prefix = isCurrency ? '$' : '';
  const suffix = isPercentage ? '%' : '';

  useEffect(() => {
    let startTime: number;
    const duration = 1000;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      // Ease-out function
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = easeOut * numericValue;
      
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    const timer = setTimeout(() => {
      requestAnimationFrame(animate);
    }, delay);

    return () => clearTimeout(timer);
  }, [numericValue, delay]);

  const colorClasses = {
    indigo: 'text-indigo-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]',
    cyan: 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]',
    white: 'text-gray-200',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay / 1000, duration: 0.5 }}
      className="bg-[#1a1e2e]/40 backdrop-blur-sm border border-white/5 rounded-2xl p-6"
    >
      <div className="text-sm text-gray-400 mb-2">{label}</div>
      <div className={`text-3xl font-bold tabular-nums ${colorClasses[color]}`}>
        {prefix}{typeof value === 'string' && value.includes('/') 
          ? value 
          : Math.round(displayValue)}{suffix}
      </div>
    </motion.div>
  );
}
