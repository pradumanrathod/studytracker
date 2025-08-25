import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebaseAuth';
import type { UserStats } from '../types';

const DEFAULT_STATS: UserStats = {
  totalFocusTime: 0,
  totalSessions: 0,
  currentStreak: 0,
  longestStreak: 0,
  averageSessionLength: 0,
  todayFocusTime: 0,
  thisWeekFocusTime: 0,
  thisMonthFocusTime: 0,
};

const statsDocRef = (uid: string) => doc(db, 'users', uid, 'stats', 'current');

export async function getUserStats(uid: string): Promise<UserStats> {
  const snap = await getDoc(statsDocRef(uid));
  if (!snap.exists()) {
    // Initialize doc with defaults on first read
    await setDoc(statsDocRef(uid), DEFAULT_STATS, { merge: true });
    return DEFAULT_STATS;
  }
  const data = snap.data() as Partial<UserStats>;
  return { ...DEFAULT_STATS, ...data } as UserStats;
}

export async function setUserStats(uid: string, stats: UserStats): Promise<void> {
  await setDoc(statsDocRef(uid), stats, { merge: true });
}
