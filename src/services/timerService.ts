import { StudySession, Break, TimerState, UserStats } from '../types';
import { format, startOfDay, startOfWeek, startOfMonth, isSameDay, isSameWeek, isSameMonth, differenceInCalendarDays } from 'date-fns';

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
  private lastPersistMs: number = 0; // throttle persistence while running


  constructor() {
    this.loadSessions();
  }

  // Persist current progress without changing state; use before page unload
  flushProgress(): void {
    if (this.currentSession && this.currentSession.isActive && this.activeStartMs) {
      const delta = Math.floor((Date.now() - this.activeStartMs) / 1000);
      this.currentSession.duration = this.accumulatedSeconds + delta;
    }
    this.saveSessions();
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
    this.lastPersistMs = Date.now();
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
    // Persist progress so reloads reflect up-to-date durations
    this.saveSessions();
    this.updateStats();
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
        // Persist at most every 5 seconds to survive reloads mid-session
        const now = Date.now();
        if (now - this.lastPersistMs >= 5000) {
          this.saveSessions();
          this.updateStats();
          this.lastPersistMs = now;
        }
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

    // Only count sessions longer than 1 minute
    const validSessions = this.sessions.filter(session => session.duration >= 60);
    const totalFocusTime = validSessions.reduce((total, session) => total + session.duration, 0);
    const totalSessions = validSessions.length;

    const todaySessions = validSessions.filter(session => 
      isSameDay(session.startTime, now)
    );
    const todayFocusTime = todaySessions.reduce((total, session) => total + session.duration, 0);

    const thisWeekSessions = this.sessions.filter(session => 
      isSameWeek(session.startTime, now)
    );
    const thisWeekFocusTime = thisWeekSessions.reduce((total, session) => total + session.duration, 0);

    const thisMonthSessions = this.sessions.filter(session => 
      isSameMonth(session.startTime, now)
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

  // Calendar-day based current streak: consecutive days up to today with any valid session (>=60s)
  private calculateCurrentStreak(): number {
    const validSessions = this.sessions.filter(s => s.duration >= 60);
    if (validSessions.length === 0) return 0;
    const daysWithSessions = new Set<string>(
      validSessions.map(s => format(s.startTime, 'yyyy-MM-dd'))
    );
    let streak = 0;
    let cursor = new Date();
    while (daysWithSessions.has(format(cursor, 'yyyy-MM-dd'))) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    }
    return streak;
  }

  // Calendar-day based longest streak over unique days with any valid session
  private calculateLongestStreak(): number {
    const validSessions = this.sessions.filter(s => s.duration >= 60);
    if (validSessions.length === 0) return 0;
    const uniqueDays = Array.from(
      new Set(validSessions.map(s => format(s.startTime, 'yyyy-MM-dd')))
    )
      .map(d => new Date(d))
      .sort((a, b) => a.getTime() - b.getTime());

    let longest = 1;
    let streak = 1;
    for (let i = 1; i < uniqueDays.length; i++) {
      const diff = differenceInCalendarDays(uniqueDays[i], uniqueDays[i - 1]);
      if (diff === 1) {
        streak++;
        if (streak > longest) longest = streak;
      } else if (diff > 1) {
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
