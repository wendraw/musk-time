import React, { useState } from 'react';
import { Task, EisenhowerQuadrant } from '../types';
import { QUADRANT_CONFIG } from '../constants';
import { Check, Clock, Trash2, CalendarPlus, Square, X } from 'lucide-react';
import { cn } from '../utils';

interface TaskCardProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onSelectForSchedule: (task: Task) => void;
  isSelected?: boolean;
  isScheduled?: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({ 
  task, 
  onToggleComplete, 
  onDelete, 
  onSelectForSchedule,
  isSelected,
  isScheduled
}) => {
  const config = QUADRANT_CONFIG[task.quadrant];
  const [isDragging, setIsDragging] = useState(false);

  const isDraggable = !task.completed && !isScheduled;

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    if (!isDraggable) {
      e.preventDefault();
      return;
    }
    
    e.dataTransfer.setData('taskId', task.id);
    e.dataTransfer.effectAllowed = 'copyMove';
    
    // Delay adding the opacity class so the browser generates a full-opacity drag image (ghost)
    // before making the source element transparent.
    setTimeout(() => setIsDragging(true), 0);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <div 
      draggable={isDraggable}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={cn(
        "group relative flex flex-col p-3 mb-3 border-2 border-black transition-all duration-100",
        isSelected 
          ? "bg-black text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)] translate-x-[2px] translate-y-[2px]" 
          : cn("bg-white text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]", 
               // Hover effects only if interactive
               isDraggable && "hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:-rotate-1 cursor-grab active:cursor-grabbing"),
        task.completed && "opacity-60 bg-gray-100 cursor-default",
        isScheduled && !task.completed && "opacity-90 bg-gray-50", // Slightly dimmed if scheduled
        isDragging && "opacity-30 grayscale border-dashed", // Visual cue for source during drag
        !isSelected && !task.completed && config.color,
        !isDraggable && !task.completed && "cursor-not-allowed"
      )}
    >
      <div className="flex items-start justify-between gap-3">
         {/* Checkbox */}
        <button 
          onClick={(e) => { e.stopPropagation(); onToggleComplete(task.id); }}
          className={cn(
            "w-6 h-6 border-2 border-black flex items-center justify-center flex-shrink-0 transition-colors mt-0.5",
            task.completed ? "bg-black text-white" : "bg-white hover:bg-gray-50",
            isSelected && !task.completed && "border-white"
          )}
          title={task.completed ? "Mark as incomplete" : "Mark as complete"}
        >
          {task.completed && <Check className="w-4 h-4" strokeWidth={4} />}
        </button>

        <div className="flex-1 min-w-0 flex flex-col gap-1">
          <h3 className={cn(
            "font-bold text-sm leading-tight break-words whitespace-pre-wrap",
            task.completed && "line-through decoration-2"
          )}>
            {task.title}
          </h3>
          
          <div className="flex flex-wrap items-center gap-2 mt-1">
            {/* Tag retains color even when selected to show importance */}
            <span className={cn(
              "text-[10px] font-black uppercase px-1.5 py-0.5 border border-black",
              config.color,
              // If card is black (selected), ensure tag has white border to pop
              isSelected ? "border-white" : "",
              // If card is colored (bg), make tag white to pop
              !isSelected && !task.completed && "bg-white"
            )}>
              {config.label}
            </span>
            
            <span className={cn(
              "flex items-center text-[10px] font-bold border border-black px-1.5 py-0.5",
               isSelected ? "bg-white text-black border-white" : "bg-white text-black"
            )}>
              <Clock className="w-3 h-3 mr-1" strokeWidth={3} />
              {task.durationMinutes}m
            </span>
            
            {isScheduled && (
               <span className={cn(
                 "text-[10px] font-bold border border-black px-1.5 py-0.5 bg-[#E0E7FF] text-black",
                 isSelected ? "border-white" : ""
               )}>
                 SCHEDULED
               </span>
            )}
          </div>
        </div>
      </div>

      {/* Actions Row */}
      <div className={cn(
          "flex justify-end gap-2 mt-3 pt-2 border-t-2 border-dashed",
          isSelected ? "border-white/30" : "border-black/20"
      )}>
        {!task.completed && !isScheduled && (
           <button 
            onClick={() => onSelectForSchedule(task)}
            className={cn(
              "flex items-center gap-1 px-2 py-1 border-2 border-black text-[10px] font-bold uppercase transition-all active:translate-y-0.5 active:shadow-none",
              isSelected 
                ? "bg-white text-black border-white" 
                : "bg-white text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-yellow-50"
            )}
          >
            <CalendarPlus className="w-3.5 h-3.5" strokeWidth={2.5} />
            {isSelected ? 'PICK TIME' : 'SCHEDULE'}
          </button>
        )}
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
          className={cn(
            "p-1 border-2 border-black transition-all active:translate-y-0.5 active:shadow-none",
            "bg-[#FF9AA2] text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-[#ff808a]",
            isSelected && "border-white"
          )}
          title="Delete"
        >
          <Trash2 className="w-3.5 h-3.5" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
};

export default TaskCard;