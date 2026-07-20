import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  trend?: { value: string; positive: boolean };
  variant?: 'solid' | 'glass';
}

const StatCard = ({ label, value, icon, trend, variant = 'glass' }: StatCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={clsx(
        'flex items-center justify-between rounded-2xl p-5',
        variant === 'solid' ? 'gradient-card' : 'glass-card'
      )}
    >
      <div>
        <p className={clsx('text-sm font-medium', variant === 'solid' ? 'text-white/80' : 'text-slate-500 dark:text-slate-400')}>
          {label}
        </p>
        <p className={clsx('mt-1 text-2xl font-extrabold', variant === 'solid' ? 'text-white' : 'text-slate-800 dark:text-white')}>
          {value}
        </p>
        {trend && (
          <p className={clsx('mt-1 text-xs font-semibold', trend.positive ? 'text-emerald-500' : 'text-red-500')}>
            {trend.positive ? '▲' : '▼'} {trend.value}
          </p>
        )}
      </div>
      <div
        className={clsx(
          'flex h-12 w-12 items-center justify-center rounded-xl text-2xl',
          variant === 'solid' ? 'bg-white/20 text-white' : 'bg-primary-100 text-primary-600 dark:bg-primary-500/20 dark:text-primary-300'
        )}
      >
        {icon}
      </div>
    </motion.div>
  );
};

export default StatCard;
