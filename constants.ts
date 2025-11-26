import { EisenhowerQuadrant } from './types';

export const QUADRANT_CONFIG = {
  [EisenhowerQuadrant.DO]: {
    label: 'DO FIRST',
    description: 'Important & Urgent',
    color: 'bg-[#FF9AA2] text-black border-black', // Salmon Pink
    indicator: 'bg-black',
    hover: 'hover:bg-[#FFB7B2]'
  },
  [EisenhowerQuadrant.SCHEDULE]: {
    label: 'SCHEDULE',
    description: 'Important, Not Urgent',
    color: 'bg-[#85E3FF] text-black border-black', // Sky Blue
    indicator: 'bg-black',
    hover: 'hover:bg-[#ACE7FF]'
  },
  [EisenhowerQuadrant.DELEGATE]: {
    label: 'DELEGATE',
    description: 'Not Important, Urgent',
    color: 'bg-[#B5EAD7] text-black border-black', // Mint Green
    indicator: 'bg-black',
    hover: 'hover:bg-[#C7F9E5]'
  },
  [EisenhowerQuadrant.DELETE]: {
    label: 'ELIMINATE',
    description: 'Neither',
    color: 'bg-[#E2F0CB] text-black border-black', // Light Lime/Grey
    indicator: 'bg-black',
    hover: 'hover:bg-[#F0F8E2]'
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