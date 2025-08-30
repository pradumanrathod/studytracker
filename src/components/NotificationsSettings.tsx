import React, { useEffect, useState } from 'react';
import { saveReminderSettings, initNotifications, ReminderSettings } from '../services/notifications';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebaseAuth';

const defaultTime = '19:00';

const NotificationsSettings: React.FC = () => {
  const [uid, setUid] = useState<string | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [time, setTime] = useState(defaultTime);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUid(u?.uid || null));
    return () => unsub();
  }, []);

  const handleSave = async () => {
    if (!uid) {
      setStatus('Please login to enable reminders.');
      return;
    }
    setSaving(true);
    setStatus(null);
    const token = await initNotifications();
    const settings: ReminderSettings = {
      enabled: true,
      timeHHMM: time,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
    try {
      await saveReminderSettings(uid, settings, token);
      setStatus('Reminders enabled. You will get a daily push.');
      setEnabled(true);
    } catch (e: any) {
      console.error('[Notifications] enable failed', e);
      const msg = e?.message || e?.code || String(e);
      setStatus(`Failed to save settings: ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDisable = async () => {
    if (!uid) return;
    setSaving(true);
    try {
      await saveReminderSettings(uid, { enabled: false, timeHHMM: time, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone });
      setEnabled(false);
      setStatus('Reminders disabled.');
    } catch (e: any) {
      console.error('[Notifications] disable failed', e);
      const msg = e?.message || e?.code || String(e);
      setStatus(`Failed to disable: ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h4 className="text-base font-semibold mb-1">Daily Study Reminder</h4>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Get a push notification every day to start your study session.</p>

      <div className="flex flex-col md:flex-row md:items-end md:flex-nowrap gap-3 mb-3">
        <div className="min-w-[5rem] md:w-auto">
          <input
            type="time"
            aria-label="Reminder time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="input-field w-28 md:w-32 h-9 px-2 text-sm"
          />
        </div>

        <div className="flex gap-2 md:items-end">
          {!enabled ? (
            <button onClick={handleSave} disabled={saving} className="btn-primary h-9 px-3 py-0 text-xs flex items-center justify-center disabled:opacity-60">
              {saving ? 'Saving…' : 'Enable Reminders'}
            </button>
          ) : (
            <button onClick={handleDisable} disabled={saving} className="h-9 px-3 py-0 text-xs rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium flex items-center justify-center disabled:opacity-60">
              {saving ? 'Saving…' : 'Disable Reminders'}
            </button>
          )}
          {status && <span className="text-sm text-gray-600 dark:text-gray-300 self-center md:self-end">{status}</span>}
        </div>
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400">Note: On iOS Safari, install the app to Home Screen to receive push notifications.</p>
    </div>
  );
};

export default NotificationsSettings;
