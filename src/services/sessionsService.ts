import { collection, doc, getDocs, orderBy, query, setDoc } from 'firebase/firestore';
import { db } from './firebaseAuth';
import type { StudySession, Break } from '../types';

const sessionsColRef = (uid: string) => collection(db, 'users', uid, 'sessions');
const sessionDocRef = (uid: string, id: string) => doc(db, 'users', uid, 'sessions', id);

// Helpers to serialize/deserialize dates for Firestore
function serializeSession(session: StudySession) {
  return {
    id: session.id,
    startTime: session.startTime instanceof Date ? session.startTime.toISOString() : session.startTime,
    endTime: session.endTime ? (session.endTime instanceof Date ? session.endTime.toISOString() : session.endTime) : null,
    duration: session.duration,
    isActive: session.isActive,
    faceDetected: session.faceDetected,
    breaks: (session.breaks || []).map((b: Break) => ({
      id: b.id,
      reason: b.reason,
      duration: b.duration,
      startTime: b.startTime instanceof Date ? b.startTime.toISOString() : b.startTime,
      endTime: b.endTime ? (b.endTime instanceof Date ? b.endTime.toISOString() : b.endTime) : null,
    })),
  };
}

function deserializeSession(data: any): StudySession {
  return {
    id: data.id,
    startTime: new Date(data.startTime),
    endTime: data.endTime ? new Date(data.endTime) : undefined,
    duration: data.duration ?? 0,
    isActive: Boolean(data.isActive),
    faceDetected: Boolean(data.faceDetected),
    breaks: Array.isArray(data.breaks)
      ? data.breaks.map((b: any) => ({
          id: b.id,
          reason: b.reason,
          duration: b.duration ?? 0,
          startTime: new Date(b.startTime),
          endTime: b.endTime ? new Date(b.endTime) : undefined,
        }))
      : [],
  } as StudySession;
}

export async function listUserSessions(uid: string): Promise<StudySession[]> {
  const q = query(sessionsColRef(uid), orderBy('startTime', 'asc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => deserializeSession({ id: d.id, ...d.data() }));
}

export async function upsertUserSession(uid: string, session: StudySession): Promise<void> {
  const data = serializeSession(session);
  // Store doc id as session.id for stable merges
  await setDoc(sessionDocRef(uid, session.id), data, { merge: true });
}
