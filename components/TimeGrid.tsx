import React, { useRef, useEffect } from 'react';
import { TimeBlock, Task } from '../types';
import { TIME_SLOTS, TIME_SLOT_INTERVAL, QUADRANT_CONFIG } from '../constants';
import { isPastTime, cn, formatDate } from '../utils';
import { Lock, X, Plus, Clock } from 'lucide-react';

interface TimeGridProps {
  date: string; // YYYY-MM-DD
  blocks: TimeBlock[];
  tasks: Task[];
  activeTaskId: string | null;
  onSlotClick: (time: string) => void;
  onDeleteBlock: (blockId: string) => void;
}

const TimeGrid: React.FC<TimeGridProps> = ({ 
  date, 
  blocks, 
  tasks, 
  activeTaskId, 
  onSlotClick,
  onDeleteBlock
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!scrollRef.current) return;
      const now = new Date();
      const isToday = formatDate(now) === date;
      let targetTime = "08:00";
      if (isToday) {
         let h = now.getHours();
         if (h < 6) h = 6; 
         targetTime = `${h.toString().padStart(2, '0')}:00`;
      }
      const el = document.getElementById(`time-slot-${targetTime}`);
      if (el && scrollRef.current) {
         const top = el.offsetTop - 80;
         scrollRef.current.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [date]);

  const getBlockAt = (time: string) => blocks.find(b => b.startTime === time && b.date === date);

  const slotsToSkip = new Set<string>();
  blocks.filter(b => b.date === date).forEach(block => {
    const startIndex = TIME_SLOTS.indexOf(block.startTime);
    if (startIndex === -1) return;
    const slotsCovered = Math.ceil(block.durationMinutes / TIME_SLOT_INTERVAL);
    for (let i = 1; i < slotsCovered; i++) {
        if (startIndex + i < TIME_SLOTS.length) {
            slotsToSkip.add(TIME_SLOTS[startIndex + i]);
        }
    }
  });

  return (
    <div className={cn(
        "relative flex flex-col h-full bg-white border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden transition-all duration-300",
        activeTaskId ? "ring-4 ring-black ring-opacity-100" : ""
    )}>
        <div className="p-3 border-b-2 border-black bg-[#E0E7FF] flex justify-between items-center flex-shrink-0">
            <h2 className="font-black text-black text-lg uppercase tracking-tight">Daily Timebox</h2>
            {activeTaskId && (
                <span className="text-xs font-bold text-white bg-black px-2 py-1 uppercase animate-pulse border-2 border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)]">
                    Select Slot
                </span>
            )}
        </div>
      
      <div className="flex-1 overflow-y-auto no-scrollbar scroll-smooth bg-white" ref={scrollRef}>
        <div className="relative min-h-max pb-12">
          {TIME_SLOTS.map((time) => {
            if (slotsToSkip.has(time)) return null;

            const block = getBlockAt(time);
            const task = block ? tasks.find(t => t.id === block.taskId) : null;
            const isPast = isPastTime(date, time);
            
            let heightStyle = {};
            if (block) {
                const slotsCount = Math.ceil(block.durationMinutes / TIME_SLOT_INTERVAL);
                heightStyle = { height: `${slotsCount * 3}rem`, zIndex: 10 }; 
            }

            return (
              <div 
                key={time} 
                id={`time-slot-${time}`}
                className="flex group border-b border-gray-200 last:border-0 relative h-12"
              >
                {/* Time Label */}
                <div className={cn(
                    "w-16 flex-shrink-0 text-xs font-bold font-mono flex items-center justify-center border-r-2 border-gray-200 bg-white",
                    time.endsWith("00") ? "text-black" : "text-gray-400"
                )}>
                  {time}
                </div>

                {/* Slot Content */}
                <div 
                  className={cn(
                    "flex-1 relative transition-colors duration-200",
                    !block && activeTaskId && !isPast && "cursor-pointer hover:bg-black/10",
                    isPast && !block && "opacity-50"
                  )}
                  style={isPast && !block ? {
                      backgroundImage: "repeating-linear-gradient(45deg, #e5e7eb 0px, #e5e7eb 10px, #ffffff 10px, #ffffff 20px)"
                  } : {}}
                  onClick={() => {
                    if (!block && activeTaskId && !isPast) {
                        onSlotClick(time);
                    }
                  }}
                >
                  {/* Selection Hover */}
                  {!block && activeTaskId && !isPast && (
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-[#85E3FF]/20">
                          <Plus className="w-6 h-6 text-black" strokeWidth={3} />
                      </div>
                  )}

                  {/* Past Indicator Icon */}
                  {isPast && !block && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                       <Lock className="w-4 h-4 text-gray-400" />
                    </div>
                  )}

                  {/* Task Block */}
                  {block && task && (
                    <div 
                        style={heightStyle}
                        className={cn(
                            "absolute top-0 left-0 right-0 m-1 p-2 flex flex-col border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] overflow-hidden transition-transform",
                            QUADRANT_CONFIG[task.quadrant].color,
                            isPast && "opacity-80 grayscale-[0.3]"
                        )}
                    >
                         <div className="flex justify-between items-start">
                            <span className="font-bold text-xs truncate pr-4 leading-tight text-black">{task.title}</span>
                             {!isPast && (
                                <button 
                                    onClick={(e) => { e.stopPropagation(); onDeleteBlock(block.id); }}
                                    className="text-black hover:bg-black hover:text-white border border-transparent hover:border-black rounded-none p-0.5 flex-shrink-0 transition-colors"
                                >
                                    <X className="w-3 h-3" strokeWidth={3} />
                                </button>
                             )}
                             {isPast && <Lock className="w-3 h-3 text-black/50 flex-shrink-0" />}
                         </div>
                         <div className="mt-auto flex items-center pt-1 border-t border-black/10">
                            <Clock className="w-3 h-3 mr-1" strokeWidth={2.5} />
                            <span className="text-[10px] font-bold">{block.durationMinutes}m</span>
                         </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TimeGrid;