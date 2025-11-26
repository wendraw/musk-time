import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const isPastTime = (dateStr: string, timeStr: string): boolean => {
  const now = new Date();
  const [hours, minutes] = timeStr.split(':').map(Number);
  
  const checkDate = new Date(dateStr);
  checkDate.setHours(hours, minutes, 0, 0);

  // If the date is strictly before today (ignoring time for a moment to be safe on timezone edges if just comparing strings, but here we use Date obj)
  const todayStr = formatDate(now);
  
  if (dateStr < todayStr) return true;
  if (dateStr > todayStr) return false;

  // Same day check
  return checkDate < now;
};

export const getReadableDate = (date: Date): string => {
  return new Intl.DateTimeFormat('zh-CN', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  }).format(date);
};
