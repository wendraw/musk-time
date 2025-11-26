export enum EisenhowerQuadrant {
  DO = 'DO',             // Important & Urgent
  SCHEDULE = 'SCHEDULE', // Important & Not Urgent
  DELEGATE = 'DELEGATE', // Not Important & Urgent
  DELETE = 'DELETE'      // Not Important & Not Urgent (Eliminate)
}

export interface Task {
  id: string;
  title: string;
  quadrant: EisenhowerQuadrant;
  completed: boolean;
  durationMinutes: number; // Default estimated duration
  createdAt: number;
}

export interface TimeBlock {
  id: string;
  taskId: string;
  startTime: string; // Format "HH:mm"
  date: string; // Format "YYYY-MM-DD"
  durationMinutes: number;
}

// Helper type for the drag/drop or click-to-schedule state
export interface SchedulingState {
  activeTaskId: string | null;
  mode: 'idle' | 'selecting_slot';
}
