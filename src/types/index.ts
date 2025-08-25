export interface StudySession {
  id: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // in seconds
  isActive: boolean;
  faceDetected: boolean;
  breaks: Break[];
}

export interface Break {
  id: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // in seconds
  reason: 'away' | 'manual' | 'distraction';
}

export interface UserStats {
  totalFocusTime: number; // in seconds
  totalSessions: number;
  currentStreak: number;
  longestStreak: number;
  averageSessionLength: number; // in seconds
  todayFocusTime: number; // in seconds
  thisWeekFocusTime: number; // in seconds
  thisMonthFocusTime: number; // in seconds
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  type: 'time' | 'streak' | 'sessions';
  threshold: number;
  achieved: boolean;
  achievedAt?: Date;
  icon: string;
}

export interface AppSettings {
  autoStart: boolean;
  autoPause: boolean;
  breakReminder: boolean;
  breakReminderMinutes: number;
  notifications: boolean;
  webcamEnabled: boolean;
  theme: 'light' | 'dark' | 'auto';
}

export type TimerState = 'idle' | 'running' | 'paused' | 'break';

