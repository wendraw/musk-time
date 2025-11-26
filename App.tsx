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
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Layout, 
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

  const addTask = (e: React.FormEvent) => {
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

  const toggleTaskComplete = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    // Also remove associated blocks
    setBlocks(prev => prev.filter(b => b.taskId !== id));
    if (schedulingState.activeTaskId === id) {
      setSchedulingState({ activeTaskId: null, mode: 'idle' });
    }
  };

  const startScheduling = (task: Task) => {
    if (schedulingState.activeTaskId === task.id) {
      // Toggle off
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
      
      const newBlock: TimeBlock = {
        id: uuidv4(),
        taskId: task.id,
        startTime: time,
        date: dateStr,
        durationMinutes: task.durationMinutes
      };

      setBlocks(prev => [...prev, newBlock]);
      setSchedulingState({ activeTaskId: null, mode: 'idle' }); // Reset after placement
    }
  };

  const deleteBlock = (blockId: string) => {
    setBlocks(prev => prev.filter(b => b.id !== blockId));
  };

  // --- Computed Data ---
  const currentFormattedDate = formatDate(currentDate);
  
  // Sort tasks: Incomplete first, then by Quadrant priority logic (Do > Schedule > Delegate > Delete)
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

  return (
    <div className="h-screen w-full bg-slate-50 text-slate-900 flex flex-col md:p-4 overflow-hidden font-sans">
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl mx-auto w-full bg-white md:rounded-2xl shadow-xl border border-slate-200 overflow-hidden h-full">
      
        {/* LEFT PANEL: INBOX & TASKS */}
        <div className="w-full md:w-4/12 lg:w-3/12 flex flex-col border-r border-slate-200 h-[45%] md:h-full z-10 shadow-md md:shadow-none bg-white">
          
          {/* Header */}
          <div className="p-4 md:p-6 border-b border-slate-100 bg-white flex-shrink-0">
            <div className="flex items-center gap-2 mb-1">
               <Layout className="w-6 h-6 text-indigo-600" />
               <h1 className="text-xl font-bold tracking-tight text-slate-800">MuskTime</h1>
            </div>
            <p className="text-xs md:text-sm text-slate-500">Plan tasks. Assign time. Execute.</p>
            
            {/* Progress Bar */}
            <div className="mt-4 flex items-center gap-2 text-xs font-medium text-slate-600">
               <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${progress}%` }}></div>
               </div>
               <span>{progress}%</span>
            </div>
          </div>

          {/* Add Task Form */}
          <div className="p-3 md:p-4 bg-slate-50/50 border-b border-slate-100 flex-shrink-0">
            <form onSubmit={addTask} className="space-y-2">
              <div>
                <input
                  type="text"
                  placeholder="New task..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                />
              </div>
              
              <div className="flex gap-2">
                  <select 
                      value={newTaskDuration} 
                      onChange={(e) => setNewTaskDuration(Number(e.target.value))}
                      className="px-2 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 outline-none focus:border-indigo-500 bg-white"
                  >
                      <option value={15}>15 m</option>
                      <option value={30}>30 m</option>
                      <option value={60}>60 m</option>
                  </select>
                  <div className="flex-1"></div>
                  <button 
                      type="submit" 
                      disabled={!newTaskTitle.trim()}
                      className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 transition-all shadow-sm"
                  >
                      <Plus className="w-3 h-3" /> Add
                  </button>
              </div>
              
              <QuadrantSelector value={newTaskQuadrant} onChange={setNewTaskQuadrant} />
            </form>
          </div>

          {/* Task List - SCROLLABLE AREA */}
          <div className="flex-1 overflow-y-auto p-3 bg-slate-50/30">
              <div className="flex items-center gap-2 mb-2 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                  <ListTodo className="w-3 h-3" /> 
                  Backlog
              </div>
              {sortedTasks.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                      <p className="text-sm">No tasks.</p>
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
        <div className="flex-1 flex flex-col h-[55%] md:h-full bg-slate-50 relative overflow-hidden">
          
          {/* Date Navigation */}
          <div className="p-3 md:p-4 flex items-center justify-between bg-white border-b border-slate-200 shadow-sm z-20 flex-shrink-0">
            <button 
              onClick={() => handleDateChange(-1)} 
              className="p-1.5 md:p-2 hover:bg-slate-100 rounded-full transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-slate-600" />
            </button>
            
            <div className="flex flex-col items-center">
               <div className="flex items-center gap-2 text-base md:text-lg font-bold text-slate-800">
                  <Calendar className="w-4 h-4 md:w-5 md:h-5 text-indigo-500" />
                  {getReadableDate(currentDate)}
               </div>
               {isToday ? (
                   <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full mt-0.5">TODAY</span>
               ) : (
                   <button 
                      onClick={goToToday}
                      className="text-[10px] font-bold text-slate-500 hover:text-indigo-600 bg-slate-100 hover:bg-indigo-50 px-2 py-0.5 rounded-full mt-0.5 transition-colors flex items-center gap-1"
                   >
                      <RotateCcw className="w-3 h-3" /> Back to Today
                   </button>
               )}
            </div>

            <button 
              onClick={() => handleDateChange(1)}
              className="p-1.5 md:p-2 hover:bg-slate-100 rounded-full transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-slate-600" />
            </button>
          </div>

          {/* Schedule Hint Banner */}
          {schedulingState.mode === 'selecting_slot' && (
              <div className="bg-indigo-600 text-white text-xs py-2 px-4 text-center font-medium shadow-md animate-in slide-in-from-top-2 flex justify-between items-center flex-shrink-0">
                  <span className="truncate flex-1 text-left">
                    Select a time slot for: <strong>{tasks.find(t => t.id === schedulingState.activeTaskId)?.title}</strong>
                  </span>
                  <button 
                      onClick={() => setSchedulingState({activeTaskId: null, mode: 'idle'})}
                      className="ml-4 bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider"
                  >
                      Cancel
                  </button>
              </div>
          )}

          {/* Grid Container - SCROLLABLE AREA */}
          <div className="flex-1 p-2 md:p-4 overflow-hidden flex flex-col">
              <TimeGrid 
                  date={currentFormattedDate}
                  blocks={blocks}
                  tasks={tasks}
                  activeTaskId={schedulingState.activeTaskId}
                  onSlotClick={handleSlotClick}
                  onDeleteBlock={deleteBlock}
              />
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;