import React from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { useCountdown } from '../hooks/useCountdown';

interface LiveCountdownProps {
  endTime: string;
  variant?: 'compact' | 'hero' | 'digital';
  className?: string;
}

export const LiveCountdown: React.FC<LiveCountdownProps> = ({
  endTime,
  variant = 'compact',
  className = '',
}) => {
  const { days, hours, minutes, seconds, isEnded, totalSeconds } = useCountdown(endTime);

  const isEndingSoon = !isEnded && totalSeconds < 3600; // less than 1 hour

  if (isEnded) {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/50 ${className}`}>
        <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
        <span>Auction Ended</span>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium tracking-wide ${
          isEndingSoon
            ? 'bg-rose-500/15 text-rose-600 dark:text-rose-300 border border-rose-500/30 animate-pulse'
            : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
        } ${className}`}
      >
        {isEndingSoon ? (
          <AlertTriangle className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400 shrink-0" />
        ) : (
          <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
        )}
        <span>
          {days > 0 ? `${days}d ` : ''}
          {hours.toString().padStart(2, '0')}:
          {minutes.toString().padStart(2, '0')}:
          {seconds.toString().padStart(2, '0')}
        </span>
      </div>
    );
  }

  // Digital card display
  return (
    <div className={`flex items-center gap-2 sm:gap-3 ${className}`}>
      {days > 0 && (
        <div className="flex flex-col items-center">
          <div className="w-14 sm:w-16 h-14 sm:h-16 rounded-xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700/60 shadow-sm dark:shadow-inner flex items-center justify-center text-xl sm:text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
            {days.toString().padStart(2, '0')}
          </div>
          <span className="text-[10px] uppercase font-semibold text-slate-500 dark:text-slate-400 mt-1 tracking-wider">Days</span>
        </div>
      )}

      <div className="flex flex-col items-center">
        <div className="w-14 sm:w-16 h-14 sm:h-16 rounded-xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700/60 shadow-sm dark:shadow-inner flex items-center justify-center text-xl sm:text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
          {hours.toString().padStart(2, '0')}
        </div>
        <span className="text-[10px] uppercase font-semibold text-slate-500 dark:text-slate-400 mt-1 tracking-wider">Hours</span>
      </div>

      <span className="text-xl sm:text-2xl font-bold text-slate-400 dark:text-slate-600 -mt-4">:</span>

      <div className="flex flex-col items-center">
        <div className="w-14 sm:w-16 h-14 sm:h-16 rounded-xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700/60 shadow-sm dark:shadow-inner flex items-center justify-center text-xl sm:text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
          {minutes.toString().padStart(2, '0')}
        </div>
        <span className="text-[10px] uppercase font-semibold text-slate-500 dark:text-slate-400 mt-1 tracking-wider">Mins</span>
      </div>

      <span className="text-xl sm:text-2xl font-bold text-slate-400 dark:text-slate-600 -mt-4">:</span>

      <div className="flex flex-col items-center">
        <div className={`w-14 sm:w-16 h-14 sm:h-16 rounded-xl bg-slate-100 dark:bg-slate-900/90 border shadow-sm dark:shadow-inner flex items-center justify-center text-xl sm:text-2xl font-bold font-mono ${
          isEndingSoon
            ? 'text-rose-600 dark:text-rose-400 border-rose-500/40 animate-pulse'
            : 'text-emerald-600 dark:text-emerald-400 border-slate-200 dark:border-slate-700/60'
        }`}>
          {seconds.toString().padStart(2, '0')}
        </div>
        <span className="text-[10px] uppercase font-semibold text-slate-500 dark:text-slate-400 mt-1 tracking-wider">Secs</span>
      </div>
    </div>
  );
};
