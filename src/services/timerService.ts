import { StudySession, Break, TimerState, UserStats } from '../types';
import { format, startOfDay, startOfWeek, startOfMonth, isSameDay, isSameWeek, isSameMonth } from 'date-fns';

class TimerService {
  private currentSession: StudySession | null = null;
  private sessions: StudySession[] = [];
  private timerInterval: NodeJS.Timeout | null = null;
  private state: TimerState = 'idle';
  private onStateChange: ((state: TimerState) => void) | null = null;
  private onSessionUpdate: ((session: StudySession) => void) | null = null;
  // Track active time accounting for pauses
  private activeStartMs: number | null = null; // when session last started/resumed
  private accumulatedSeconds: number = 0; // total active seconds before current run


  constructor() {
    this.loadSessions();
  }


  startSession(): StudySession {
    if (this.currentSession?.isActive) {
      throw new Error('Session already active');
    }

    const session: StudySession = {
      id: this.generateId(),
      startTime: new Date(),
      duration: 0,
      isActive: true,
      faceDetected: true,
      breaks: [],
    };

    this.currentSession = session;
    this.sessions.push(session);
    this.state = 'running';
    // initialize active tracking
    this.accumulatedSeconds = 0;
    this.activeStartMs = Date.now();
    this.startTimer();
    this.updateCallbacks();
    this.saveSessions();

    return session;
  }

  pauseSession(): void {
    if (!this.currentSession?.isActive) return;

    // accumulate time up to now
    if (this.activeStartMs) {
      const delta = Math.floor((Date.now() - this.activeStartMs) / 1000);
      this.accumulatedSeconds += delta;
      this.currentSession.duration = this.accumulatedSeconds;
      this.activeStartMs = null;
    }
    this.currentSession.isActive = false;
    this.state = 'paused';
    this.stopTimer();
    this.updateCallbacks();
  }

  resumeSession(): void {
    if (!this.currentSession || this.currentSession.isActive) return;

    this.currentSession.isActive = true;
    this.state = 'running';
    // start a new active window
    this.activeStartMs = Date.now();
    this.startTimer();
    this.updateCallbacks();
  }

  endSession(): StudySession | null {
    if (!this.currentSession) return null;

    // finalize duration including any in-progress active time
    if (this.activeStartMs) {
      const delta = Math.floor((Date.now() - this.activeStartMs) / 1000);
      this.accumulatedSeconds += delta;
    }
    this.currentSession.isActive = false;
    this.currentSession.endTime = new Date();
    this.currentSession.duration = this.accumulatedSeconds;
    
    this.state = 'idle';
    this.stopTimer();
    // reset trackers
    this.activeStartMs = null;
    this.accumulatedSeconds = 0;
    
    const endedSession = { ...this.currentSession };
    this.currentSession = null;
    
    this.updateCallbacks();
    this.saveSessions();
    this.updateStats();

    return endedSession;
  }

  addBreak(reason: 'away' | 'manual' | 'distraction' = 'manual'): void {
    if (!this.currentSession?.isActive) return;

    const breakItem: Break = {
      id: this.generateId(),
      startTime: new Date(),
      duration: 0,
      reason,
    };

    this.currentSession.breaks.push(breakItem);
    this.saveSessions();
  }

  endBreak(): void {
    if (!this.currentSession?.breaks.length) return;

    const lastBreak = this.currentSession.breaks[this.currentSession.breaks.length - 1];
    if (!lastBreak.endTime) {
      lastBreak.endTime = new Date();
      lastBreak.duration = this.calculateBreakDuration(lastBreak);
      this.saveSessions();
    }
  }

  
  private startTimer(): void {
    this.timerInterval = setInterval(() => {
      if (this.currentSession?.isActive) {
        const runningSeconds = this.activeStartMs ? Math.floor((Date.now() - this.activeStartMs) / 1000) : 0;
        this.currentSession.duration = this.accumulatedSeconds + runningSeconds;
        this.updateCallbacks();
      }
    }, 1000);
  }

  private stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  // No longer used: duration tracked via accumulatedSeconds + activeStartMs

  private calculateBreakDuration(breakItem: Break): number {
    const endTime = breakItem.endTime || new Date();
    return Math.floor((endTime.getTime() - breakItem.startTime.getTime()) / 1000);
  }

  getCurrentSession(): StudySession | null {
    return this.currentSession ? { ...this.currentSession } : null;
  }

  getSessions(): StudySession[] {
    return [...this.sessions];
  }

  // Merge external sessions (e.g., Firestore) with local sessions, deduping by id.
  // If an incoming session has the same id, prefer the one with a greater duration or with an endTime.
  mergeSessions(external: StudySession[]): void {
    const byId = new Map<string, StudySession>();
    // Seed with current sessions
    for (const s of this.sessions) {
      byId.set(s.id, { ...s });
    }
    // Merge incoming
    for (const inc of external) {
      const existing = byId.get(inc.id);
      if (!existing) {
        byId.set(inc.id, { ...inc });
      } else {
        // Prefer record that looks more "final"
        const pickInc = (
          (inc.endTime && !existing.endTime) ||
          (inc.duration ?? 0) > (existing.duration ?? 0)
        );
        byId.set(inc.id, pickInc ? { ...inc } : existing);
      }
    }
    // Do not overwrite an active currentSession in memory; keep it as-is
    const activeId = this.currentSession?.id;
    this.sessions = Array.from(byId.values()).map((s) => ({
      ...s,
      // Rehydrate Dates in case callers passed plain objects
      startTime: new Date(s.startTime),
      endTime: s.endTime ? new Date(s.endTime) : undefined,
      breaks: (s.breaks || []).map((b) => ({
        ...b,
        startTime: new Date(b.startTime),
        endTime: b.endTime ? new Date(b.endTime) : undefined,
      })),
    }));
    // Ensure the active session (if any) remains present and consistent
    if (activeId) {
      const idx = this.sessions.findIndex((s) => s.id === activeId);
      if (idx >= 0 && this.currentSession) {
        this.sessions[idx] = { ...this.currentSession };
      }
    }
    this.saveSessions();
    this.updateStats();
  }

  getState(): TimerState {
    return this.state;
  }

  getStats(): UserStats {
    const now = new Date();
    const today = startOfDay(now);
    const thisWeek = startOfWeek(now);
    const thisMonth = startOfMonth(now);

    // Only count sessions longer than 1 minute
    const validSessions = this.sessions.filter(session => session.duration >= 60);
    const totalFocusTime = validSessions.reduce((total, session) => total + session.duration, 0);
    const totalSessions = validSessions.length;

    const todaySessions = validSessions.filter(session => 
      isSameDay(session.startTime, today)
    );
    const todayFocusTime = todaySessions.reduce((total, session) => total + session.duration, 0);

    const thisWeekSessions = this.sessions.filter(session => 
      isSameWeek(session.startTime, thisWeek)
    );
    const thisWeekFocusTime = thisWeekSessions.reduce((total, session) => total + session.duration, 0);

    const thisMonthSessions = this.sessions.filter(session => 
      isSameMonth(session.startTime, thisMonth)
    );
    const thisMonthFocusTime = thisMonthSessions.reduce((total, session) => total + session.duration, 0);

    const averageSessionLength = totalSessions > 0 ? totalFocusTime / totalSessions : 0;

    // Calculate streaks
    const currentStreak = this.calculateCurrentStreak();
    const longestStreak = this.calculateLongestStreak();

    return {
      totalFocusTime,
      totalSessions,
      currentStreak,
      longestStreak,
      averageSessionLength,
      todayFocusTime,
      thisWeekFocusTime,
      thisMonthFocusTime,
    };
  }

  // Rolling 24-hour window streak logic (strict consecutive)
  private calculateCurrentStreak(): number {
    const validSessions = this.sessions.filter(s => s.duration >= 60);
    if (validSessions.length === 0) return 0;
    // Sort by startTime ascending
    const sorted = [...validSessions].sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
    let streak = 1;
    for (let i = sorted.length - 1; i > 0; i--) {
      const prev = sorted[i - 1].startTime.getTime();
      const curr = sorted[i].startTime.getTime();
      if (curr - prev <= 24 * 60 * 60 * 1000) {
        streak++;
      } else {
        streak = 1;
      }
    }
    return streak;
  }

  // Rolling 24-hour window longest streak logic (strict consecutive)
  private calculateLongestStreak(): number {
    const validSessions = this.sessions.filter(s => s.duration >= 60);
    if (validSessions.length === 0) return 0;
    // Sort by startTime ascending
    const sorted = [...validSessions].sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
    let longest = 1;
    let streak = 1;
    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1].startTime.getTime();
      const curr = sorted[i].startTime.getTime();
      if (curr - prev <= 24 * 60 * 60 * 1000) {
        streak++;
        if (streak > longest) longest = streak;
      } else {
        streak = 1;
      }
    }
    return longest;
  }

  setCallbacks(
    onStateChange: (state: TimerState) => void,
    onSessionUpdate: (session: StudySession) => void
  ): void {
    this.onStateChange = onStateChange;
    this.onSessionUpdate = onSessionUpdate;
  }

  private updateCallbacks(): void {
    if (this.onStateChange) {
      this.onStateChange(this.state);
    }
    
    if (this.onSessionUpdate && this.currentSession) {
      this.onSessionUpdate({ ...this.currentSession });
    }
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private saveSessions(): void {
    try {
      localStorage.setItem('studytracker_sessions', JSON.stringify(this.sessions));
    } catch (error) {
      console.error('Failed to save sessions:', error);
    }
  }

  private loadSessions(): void {
    try {
      const saved = localStorage.getItem('studytracker_sessions');
      if (saved) {
        this.sessions = JSON.parse(saved).map((session: any) => ({
          ...session,
          startTime: new Date(session.startTime),
          endTime: session.endTime ? new Date(session.endTime) : undefined,
          breaks: session.breaks.map((breakItem: any) => ({
            ...breakItem,
            startTime: new Date(breakItem.startTime),
            endTime: breakItem.endTime ? new Date(breakItem.endTime) : undefined,
          })),
        }));
      }
    } catch (error) {
      console.error('Failed to load sessions:', error);
      this.sessions = [];
    }
  }

  private updateStats(): void {
    // This could be used to trigger stats updates or notifications
    const stats = this.getStats();
    console.log('Updated stats:', stats);
  }

  formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }
}

export const timerService = new TimerService();
