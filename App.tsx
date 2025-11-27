import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  Task, 
  TimeBlock, 
  EisenhowerQuadrant, 
  SchedulingState 
} from './types';
import { formatDate, getReadableDate } from './utils';
import TaskCard from './components/TaskCard';
import QuadrantSelector from './components/QuadrantSelector';
import TimeGrid from './components/TimeGrid';
import CustomSelect from './components/CustomSelect';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Box,
  ListTodo,
  RotateCcw
} from 'lucide-react';

const App: React.FC = () => {
  // --- State ---
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [blocks, setBlocks] = useState<TimeBlock[]>([]);
  
  // New Task Input State
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskQuadrant, setNewTaskQuadrant] = useState<EisenhowerQuadrant>(EisenhowerQuadrant.DO);
  const [newTaskDuration, setNewTaskDuration] = useState<number>(30); // Default 30 min

  // Scheduling State
  const [schedulingState, setSchedulingState] = useState<SchedulingState>({
    activeTaskId: null,
    mode: 'idle'
  });

  // --- Persistence ---
  useEffect(() => {
    const storedTasks = localStorage.getItem('musktime_tasks');
    const storedBlocks = localStorage.getItem('musktime_blocks');
    if (storedTasks) setTasks(JSON.parse(storedTasks));
    if (storedBlocks) setBlocks(JSON.parse(storedBlocks));
  }, []);

  useEffect(() => {
    localStorage.setItem('musktime_tasks', JSON.stringify(tasks));
    localStorage.setItem('musktime_blocks', JSON.stringify(blocks));
  }, [tasks, blocks]);

  // --- Handlers ---
  const handleDateChange = (days: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + days);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const addTask = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const task: Task = {
      id: uuidv4(),
      title: newTaskTitle,
      quadrant: newTaskQuadrant,
      completed: false,
      durationMinutes: newTaskDuration,
      createdAt: Date.now()
    };

    setTasks(prev => [task, ...prev]);
    setNewTaskTitle('');
    setNewTaskDuration(30);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      addTask(e);
    }
  };

  const toggleTaskComplete = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    setBlocks(prev => prev.filter(b => b.taskId !== id));
    if (schedulingState.activeTaskId === id) {
      setSchedulingState({ activeTaskId: null, mode: 'idle' });
    }
  };

  const startScheduling = (task: Task) => {
    // If task is already scheduled for today, maybe just scroll to it?
    // For now we allow re-selecting to move it, but user requested no duplicates.
    // If we click "Schedule" on a scheduled task, let's just allow the mode switch 
    // but handle the duplicate check in the actual slot click.
    
    if (schedulingState.activeTaskId === task.id) {
      setSchedulingState({ activeTaskId: null, mode: 'idle' });
    } else {
      setSchedulingState({ activeTaskId: task.id, mode: 'selecting_slot' });
    }
  };

  const handleSlotClick = (time: string) => {
    if (schedulingState.mode === 'selecting_slot' && schedulingState.activeTaskId) {
      const task = tasks.find(t => t.id === schedulingState.activeTaskId);
      if (!task) return;

      const dateStr = formatDate(currentDate);
      
      // Check for duplicates
      const isAlreadyScheduled = blocks.some(b => b.taskId === task.id && b.date === dateStr);
      if (isAlreadyScheduled) {
        // Optionally alert user or just reset state. 
        // For a cleaner UI, we just cancel the action silently or could shake UI.
        // We'll just reset the state to indicate "action failed/completed"
        setSchedulingState({ activeTaskId: null, mode: 'idle' });
        return;
      }
      
      const newBlock: TimeBlock = {
        id: uuidv4(),
        taskId: task.id,
        startTime: time,
        date: dateStr,
        durationMinutes: task.durationMinutes
      };

      setBlocks(prev => [...prev, newBlock]);
      setSchedulingState({ activeTaskId: null, mode: 'idle' }); 
    }
  };

  const handleTaskDrop = (taskId: string, time: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const dateStr = formatDate(currentDate);
    
    // Check for duplicates
    const isAlreadyScheduled = blocks.some(b => b.taskId === taskId && b.date === dateStr);
    if (isAlreadyScheduled) {
      return;
    }
    
    const newBlock: TimeBlock = {
      id: uuidv4(),
      taskId: task.id,
      startTime: time,
      date: dateStr,
      durationMinutes: task.durationMinutes
    };

    setBlocks(prev => [...prev, newBlock]);
  };

  const deleteBlock = (blockId: string) => {
    setBlocks(prev => prev.filter(b => b.id !== blockId));
  };

  // --- Computed Data ---
  const currentFormattedDate = formatDate(currentDate);
  
  const quadrantOrder = {
    [EisenhowerQuadrant.DO]: 1,
    [EisenhowerQuadrant.SCHEDULE]: 2,
    [EisenhowerQuadrant.DELEGATE]: 3,
    [EisenhowerQuadrant.DELETE]: 4
  };
  
  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return quadrantOrder[a.quadrant] - quadrantOrder[b.quadrant];
  });

  const getScheduledStatus = (taskId: string) => {
     return blocks.some(b => b.taskId === taskId && b.date === currentFormattedDate);
  };

  // Stats
  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;
  const progress = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  const isToday = formatDate(currentDate) === formatDate(new Date());

  const durationOptions = [
    { label: '15 MIN', value: 15 },
    { label: '30 MIN', value: 30 },
    { label: '60 MIN', value: 60 },
  ];

  return (
    <div className="h-screen w-full bg-[#f8f8f8] text-black flex flex-col md:p-6 overflow-hidden font-sans">
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl mx-auto w-full bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden h-full">
      
        {/* LEFT PANEL: INBOX & TASKS */}
        <div className="w-full md:w-4/12 lg:w-3/12 flex flex-col border-r-2 border-black h-[45%] md:h-full z-10 bg-white">
          
          {/* Header */}
          <div className="p-5 border-b-2 border-black bg-white flex-shrink-0">
            <div className="flex items-center gap-3 mb-2">
               <div className="bg-black text-white p-1.5">
                  <Box className="w-6 h-6" strokeWidth={3} />
               </div>
               <h1 className="text-2xl font-black tracking-tighter uppercase">MuskTime</h1>
            </div>
            
            {/* Brutalist Progress Bar */}
            <div className="mt-4 border-2 border-black h-4 bg-white relative">
               <div className="h-full bg-[#FF9AA2] border-r-2 border-black" style={{ width: `${progress}%` }}></div>
               <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold tracking-widest pointer-events-none">
                  {progress}% COMPLETED
               </div>
            </div>
          </div>

          {/* Add Task Form */}
          <div className="p-4 bg-[#F3F4F6] border-b-2 border-black flex-shrink-0 z-20">
            <form onSubmit={addTask} className="space-y-3">
              <div>
                <textarea
                  placeholder="NEW TASK..."
                  rows={2}
                  className="w-full px-3 py-2 border-2 border-black text-sm font-bold uppercase placeholder:text-gray-400 focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all resize-none block"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>
              
              <div className="flex gap-2">
                  <CustomSelect 
                    value={newTaskDuration} 
                    onChange={(val) => setNewTaskDuration(Number(val))} 
                    options={durationOptions}
                    className="flex-shrink-0 w-28"
                  />
                  
                  <button 
                      type="submit" 
                      disabled={!newTaskTitle.trim()}
                      className="flex-1 px-3 py-2 bg-[#9CA3AF] text-white text-xs font-black uppercase hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black active:translate-y-[2px] active:translate-x-[2px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  >
                      <Plus className="w-4 h-4" strokeWidth={4} /> ADD TASK
                  </button>
              </div>
              
              <QuadrantSelector value={newTaskQuadrant} onChange={setNewTaskQuadrant} />
            </form>
          </div>

          {/* Task List - SCROLLABLE AREA */}
          <div className="flex-1 overflow-y-auto p-4 bg-white">
              <div className="flex items-center gap-2 mb-4 text-black text-xs font-black uppercase tracking-widest border-b-2 border-black pb-1">
                  <ListTodo className="w-4 h-4" /> 
                  Backlog
              </div>
              {sortedTasks.length === 0 ? (
                  <div className="text-center py-8 opacity-40">
                      <p className="text-sm font-bold uppercase">No tasks in queue</p>
                  </div>
              ) : (
                  <div className="pb-2">
                    {sortedTasks.map(task => (
                        <TaskCard 
                            key={task.id} 
                            task={task} 
                            onToggleComplete={toggleTaskComplete}
                            onDelete={deleteTask}
                            onSelectForSchedule={startScheduling}
                            isSelected={schedulingState.activeTaskId === task.id}
                            isScheduled={getScheduledStatus(task.id)}
                        />
                    ))}
                  </div>
              )}
          </div>
        </div>

        {/* RIGHT PANEL: TIMEBOX GRID */}
        <div className="flex-1 flex flex-col h-[55%] md:h-full bg-gray-50 relative overflow-hidden">
          
          {/* Date Navigation */}
          <div className="p-4 flex items-center justify-between bg-white border-b-2 border-black flex-shrink-0">
            <button 
              onClick={() => handleDateChange(-1)} 
              className="p-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:shadow-none transition-all"
            >
              <ChevronLeft className="w-5 h-5 text-black" strokeWidth={3} />
            </button>
            
            <div className="flex flex-col items-center">
               <div className="flex items-center gap-2 text-xl font-black text-black uppercase tracking-tight">
                  <Calendar className="w-5 h-5 text-black" strokeWidth={3} />
                  {getReadableDate(currentDate)}
               </div>
               {isToday ? (
                   <span className="text-[10px] font-black text-white bg-black px-3 py-0.5 border-2 border-black mt-1">TODAY</span>
               ) : (
                   <button 
                      onClick={goToToday}
                      className="text-[10px] font-bold text-black border-2 border-black hover:bg-black hover:text-white px-2 py-0.5 mt-1 transition-colors flex items-center gap-1 uppercase"
                   >
                      <RotateCcw className="w-3 h-3" /> Return to Today
                   </button>
               )}
            </div>

            <button 
              onClick={() => handleDateChange(1)}
              className="p-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:shadow-none transition-all"
            >
              <ChevronRight className="w-5 h-5 text-black" strokeWidth={3} />
            </button>
          </div>

          {/* Schedule Hint Banner */}
          {schedulingState.mode === 'selecting_slot' && (
              <div className="bg-black text-white text-sm py-3 px-6 text-center font-bold uppercase shadow-md flex justify-between items-center flex-shrink-0 border-b-2 border-white">
                  <span className="truncate flex-1 text-left">
                    PLACING: <span className="text-[#85E3FF]">{tasks.find(t => t.id === schedulingState.activeTaskId)?.title}</span>
                  </span>
                  <button 
                      onClick={() => setSchedulingState({activeTaskId: null, mode: 'idle'})}
                      className="ml-4 bg-white text-black px-2 py-1 border-2 border-white hover:bg-gray-200 text-xs font-black"
                  >
                      CANCEL
                  </button>
              </div>
          )}

          {/* Grid Container - SCROLLABLE AREA */}
          <div className="flex-1 p-4 overflow-hidden flex flex-col bg-[#85E3FF]/10">
              <TimeGrid 
                  date={currentFormattedDate}
                  blocks={blocks}
                  tasks={tasks}
                  activeTaskId={schedulingState.activeTaskId}
                  onSlotClick={handleSlotClick}
                  onDeleteBlock={deleteBlock}
                  onTaskDrop={handleTaskDrop}
              />
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;