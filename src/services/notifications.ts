import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebaseAuth';

let messaging: Messaging | null = null;

export type ReminderSettings = {
  enabled: boolean;
  timeHHMM: string; // "07:30"
  timezone: string; // e.g., "Asia/Kolkata"
  updatedAt?: any;
};

const VAPID_PUBLIC_KEY = (window as any)?.STUDYTRACKER_VAPID_PUBLIC_KEY || '';

export const initNotifications = async (): Promise<string | null> => {
  try {
    if (!('Notification' in window)) {
      console.warn('[Notifications] Not supported');
      return null;
    }
    // Ensure service worker is registered (CRA/Vite will serve from public/)
    const reg = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    messaging = getMessaging();

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('[Notifications] Permission not granted');
      return null;
    }

    if (!VAPID_PUBLIC_KEY) {
      console.warn('[Notifications] Missing VAPID public key. Set window.STUDYTRACKER_VAPID_PUBLIC_KEY');
      return null;
    }

    const token = await getToken(messaging, { vapidKey: VAPID_PUBLIC_KEY, serviceWorkerRegistration: reg });
    return token || null;
  } catch (e) {
    console.warn('[Notifications] init error', e);
    return null;
  }
};

export const saveReminderSettings = async (uid: string, settings: ReminderSettings, fcmToken?: string | null) => {
  const tz = settings.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
  const payload: ReminderSettings & { fcmToken?: string | null } = {
    ...settings,
    timezone: tz,
    updatedAt: serverTimestamp(),
    ...(fcmToken ? { fcmToken } : {}),
  };
  await setDoc(doc(db, 'reminders', uid), payload, { merge: true });
};

export const listenForegroundMessages = (cb: (title: string, body: string, data?: any) => void) => {
  try {
    if (!messaging) messaging = getMessaging();
    onMessage(messaging, (payload) => {
      const title = payload.notification?.title || 'StudyTracker';
      const body = payload.notification?.body || '';
      cb(title, body, payload.data);
    });
  } catch {}
};
