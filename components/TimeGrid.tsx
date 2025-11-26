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
    // Scroll to available time area (current time for today, or 8am for future)
    const timer = setTimeout(() => {
      if (!scrollRef.current) return;

      const now = new Date();
      const isToday = formatDate(now) === date;
      
      let targetTime = "08:00"; // Default start view for future days
      
      if (isToday) {
         let h = now.getHours();
         // Clamp to visible range generally
         if (h < 6) h = 6; 
         // Target the current hour
         targetTime = `${h.toString().padStart(2, '0')}:00`;
      }

      // Find the element
      const el = document.getElementById(`time-slot-${targetTime}`);
      
      if (el && scrollRef.current) {
         const top = el.offsetTop - 80; // Buffer to show a bit of context above
         scrollRef.current.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
      }
    }, 100); // Small delay to ensure render
    
    return () => clearTimeout(timer);
  }, [date]);

  // Helper to find a block starting at a specific time
  const getBlockAt = (time: string) => blocks.find(b => b.startTime === time && b.date === date);

  // Render logic handling
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
        "relative flex flex-col h-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden transition-all duration-300",
        activeTaskId ? "ring-2 ring-indigo-400 ring-offset-2" : ""
    )}>
        <div className="p-3 border-b border-slate-100 bg-slate-50 flex justify-between items-center flex-shrink-0">
            <h2 className="font-semibold text-slate-700 text-sm">Daily Timebox</h2>
            {activeTaskId && (
                <span className="text-[10px] animate-pulse font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Click a slot below
                </span>
            )}
        </div>
      
      <div className="flex-1 overflow-y-auto no-scrollbar scroll-smooth" ref={scrollRef}>
        <div className="relative min-h-max pb-12">
          {TIME_SLOTS.map((time) => {
            if (slotsToSkip.has(time)) return null;

            const block = getBlockAt(time);
            const task = block ? tasks.find(t => t.id === block.taskId) : null;
            const isPast = isPastTime(date, time);
            
            // Calculate height for block
            let heightStyle = {};
            if (block) {
                const slotsCount = Math.ceil(block.durationMinutes / TIME_SLOT_INTERVAL);
                heightStyle = { height: `${slotsCount * 3}rem`, zIndex: 10 }; 
            }

            return (
              <div 
                key={time} 
                id={`time-slot-${time}`}
                className="flex group border-b border-slate-100 last:border-0 relative"
              >
                {/* Time Label */}
                <div className="w-14 flex-shrink-0 text-[10px] text-slate-400 font-mono flex items-start justify-center pt-2 border-r border-slate-100 bg-slate-50/50">
                  {time}
                </div>

                {/* Slot Content */}
                <div 
                  className={cn(
                    "flex-1 relative transition-colors duration-200",
                    !block && "h-12", // Default slot height (3rem)
                    !block && activeTaskId && !isPast && "cursor-pointer hover:bg-indigo-50 bg-indigo-50/30",
                    isPast && !block && "bg-slate-50/80",
                    isPast && !block && "bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAIklEQVQIW2NkQAKrVq36zwjjgzhhYWGMYAEYB8RmROaABADeOQ8CXl/xfgAAAABJRU5ErkJggg==')] opacity-50" // Pattern
                  )}
                  onClick={() => {
                    if (!block && activeTaskId && !isPast) {
                        onSlotClick(time);
                    }
                  }}
                >
                  {/* Active Selection visual cue */}
                  {!block && activeTaskId && !isPast && (
                      <div className="absolute inset-0 border-2 border-dashed border-indigo-200 opacity-0 group-hover:opacity-100 pointer-events-none flex items-center justify-center">
                          <Plus className="w-4 h-4 text-indigo-400" />
                      </div>
                  )}

                  {/* Past Indicator Label for Empty Slots */}
                  {isPast && !block && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="text-[10px] text-slate-300 uppercase font-bold tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Passed</span>
                    </div>
                  )}

                  {/* Render Task Block */}
                  {block && task && (
                    <div 
                        style={heightStyle}
                        className={cn(
                            "absolute top-0 left-0 right-0 m-0.5 rounded p-2 text-xs flex flex-col shadow-sm border overflow-hidden transition-transform",
                            QUADRANT_CONFIG[task.quadrant].color,
                            isPast && "opacity-75 grayscale-[0.3]"
                        )}
                    >
                         <div className="flex justify-between items-start">
                            <span className="font-semibold truncate pr-4 leading-tight">{task.title}</span>
                             {/* Only allow deleting future blocks */}
                             {!isPast && (
                                <button 
                                    onClick={(e) => { e.stopPropagation(); onDeleteBlock(block.id); }}
                                    className="text-current opacity-50 hover:opacity-100 hover:bg-black/10 rounded p-0.5 flex-shrink-0"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                             )}
                             {isPast && <Lock className="w-3 h-3 opacity-40 flex-shrink-0" />}
                         </div>
                         <div className="mt-auto flex items-center opacity-80 pt-1">
                            <Clock className="w-3 h-3 mr-1" />
                            <span className="text-[10px]">{block.durationMinutes}m</span>
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