import React from 'react';
import { Task, EisenhowerQuadrant } from '../types';
import { QUADRANT_CONFIG } from '../constants';
import { CheckCircle2, Circle, Clock, Trash2, CalendarPlus } from 'lucide-react';
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

  return (
    <div 
      className={cn(
        "group relative flex items-start p-3 mb-2 rounded-lg border transition-all duration-200 bg-white",
        isSelected ? "ring-2 ring-indigo-500 border-indigo-500 shadow-md transform scale-[1.02]" : "border-slate-200 hover:shadow-sm",
        task.completed && "opacity-60 bg-slate-50",
        config.hover
      )}
    >
      {/* Priority Indicator Line */}
      <div className={cn("absolute left-0 top-0 bottom-0 w-1 rounded-l-lg", config.indicator)} />

      {/* Completion Toggle */}
      <button 
        onClick={(e) => { e.stopPropagation(); onToggleComplete(task.id); }}
        className="ml-2 mr-3 mt-0.5 text-slate-400 hover:text-green-500 transition-colors flex-shrink-0"
      >
        {task.completed ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <Circle className="w-5 h-5" />}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0 mr-1">
        <h3 className={cn(
          "text-sm font-medium leading-snug break-words",
          task.completed ? "line-through text-slate-500" : "text-slate-800"
        )}>
          {task.title}
        </h3>
        
        <div className="flex flex-wrap items-center gap-2 mt-1.5">
          <span className={cn("text-[10px] px-1.5 py-0.5 rounded border bg-opacity-50 font-medium", config.color)}>
            {config.label}
          </span>
          <span className="flex items-center text-[10px] text-slate-400">
            <Clock className="w-3 h-3 mr-1" />
            {task.durationMinutes}m
          </span>
          {isScheduled && (
             <span className="text-[10px] text-indigo-600 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded font-medium">
               Scheduled
             </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col items-end gap-1 ml-1">
        {!task.completed && (
           <button 
            onClick={() => onSelectForSchedule(task)}
            title="Add to daily schedule"
            className={cn(
              "flex items-center gap-1.5 px-2 py-1.5 rounded transition-all shadow-sm border",
              isSelected 
                ? "bg-indigo-600 text-white border-indigo-600" 
                : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50"
            )}
          >
            <CalendarPlus className="w-3.5 h-3.5" />
            <span className="text-[10px] font-semibold whitespace-nowrap">
                {isSelected ? 'Selecting...' : 'Schedule'}
            </span>
          </button>
        )}
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
          className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
          title="Delete task"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default TaskCard;