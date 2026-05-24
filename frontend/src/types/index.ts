export type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

export type TaskCategory = 'Work' | 'Study' | 'Creative' | 'Personal' | 'Other';

export interface Session {
  id?: string;
  name: string;
  date: string;
  category: TaskCategory;
  pomodorosCompleted: number;
  workDuration: number;
  breakDuration: number;
  status: 'Completed' | 'Interrupted';
  notes?: string;
  syncedToNotion?: boolean;
}
