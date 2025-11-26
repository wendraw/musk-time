import { EisenhowerQuadrant } from './types';

export const QUADRANT_CONFIG = {
  [EisenhowerQuadrant.DO]: {
    label: 'Do First',
    description: 'Important & Urgent',
    color: 'bg-red-100 text-red-700 border-red-200',
    indicator: 'bg-red-500',
    hover: 'hover:bg-red-50'
  },
  [EisenhowerQuadrant.SCHEDULE]: {
    label: 'Schedule',
    description: 'Important, Not Urgent',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    indicator: 'bg-blue-500',
    hover: 'hover:bg-blue-50'
  },
  [EisenhowerQuadrant.DELEGATE]: {
    label: 'Delegate',
    description: 'Not Important, Urgent',
    color: 'bg-amber-100 text-amber-700 border-amber-200',
    indicator: 'bg-amber-500',
    hover: 'hover:bg-amber-50'
  },
  [EisenhowerQuadrant.DELETE]: {
    label: 'Eliminate',
    description: 'Neither',
    color: 'bg-slate-100 text-slate-700 border-slate-200',
    indicator: 'bg-slate-400',
    hover: 'hover:bg-slate-50'
  }
};

export const TIME_SLOT_INTERVAL = 15; // Minutes
export const START_HOUR = 6; // 6 AM
export const END_HOUR = 23; // 11 PM

// Generate time slots strings "06:00", "06:15", etc.
export const generateTimeSlots = (): string[] => {
  const slots: string[] = [];
  for (let h = START_HOUR; h <= END_HOUR; h++) {
    for (let m = 0; m < 60; m += TIME_SLOT_INTERVAL) {
      const hourStr = h.toString().padStart(2, '0');
      const minStr = m.toString().padStart(2, '0');
      slots.push(`${hourStr}:${minStr}`);
    }
  }
  return slots;
};

export const TIME_SLOTS = generateTimeSlots();