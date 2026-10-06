import { useState, useEffect, useMemo } from 'react';

export interface CountdownResult {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
  isEnded: boolean;
  formatted: string;
}

export const useCountdown = (endTimeIso: string | Date | undefined): CountdownResult => {
  const targetTime = useMemo(() => {
    if (!endTimeIso) return 0;
    return new Date(endTimeIso).getTime();
  }, [endTimeIso]);

  const [timeLeft, setTimeLeft] = useState<number>(() => {
    if (!targetTime) return 0;
    return Math.max(0, targetTime - Date.now());
  });

  useEffect(() => {
    if (!targetTime) {
      setTimeLeft(0);
      return;
    }

    const calculateTimeLeft = () => {
      const difference = targetTime - Date.now();
      setTimeLeft(Math.max(0, difference));
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [targetTime]);

  const totalSeconds = Math.floor(timeLeft / 1000);
  const isEnded = totalSeconds <= 0;

  const days = Math.floor(totalSeconds / (3600 * 24));
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  const formatted = useMemo(() => {
    if (isEnded) return 'Ended';
    if (days > 0) {
      return `${days}d ${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
    }
    return `${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
  }, [days, hours, minutes, seconds, isEnded]);

  return {
    days,
    hours,
    minutes,
    seconds,
    totalSeconds,
    isEnded,
    formatted,
  };
};
