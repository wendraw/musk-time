import Dexie, { Table } from 'dexie';
import { Task, TimeBlock } from './types';

// Using class-based inheritance to properly inherit Dexie methods like transaction() and version()
export class MuskTimeDB extends Dexie {
  tasks!: Table<Task>;
  blocks!: Table<TimeBlock>;

  constructor() {
    super('MuskTimeDB');
    this.version(1).stores({
      tasks: 'id, quadrant, completed, createdAt', // Indexable fields
      blocks: 'id, taskId, date, startTime'
    });
  }
}

export const db = new MuskTimeDB();

// Migration Helper
export const migrateFromLocalStorage = async () => {
  const storedTasks = localStorage.getItem('musktime_tasks');
  const storedBlocks = localStorage.getItem('musktime_blocks');
  const migrated = localStorage.getItem('musktime_migrated_v1');

  if (migrated) return;

  if (storedTasks) {
    const tasks: Task[] = JSON.parse(storedTasks);
    if (tasks.length > 0) {
      await db.tasks.bulkPut(tasks);
    }
  }

  if (storedBlocks) {
    const blocks: TimeBlock[] = JSON.parse(storedBlocks);
    if (blocks.length > 0) {
      await db.blocks.bulkPut(blocks);
    }
  }

  localStorage.setItem('musktime_migrated_v1', 'true');
  // Optional: Clean up old keys
  // localStorage.removeItem('musktime_tasks');
  // localStorage.removeItem('musktime_blocks');
};