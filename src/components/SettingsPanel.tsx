import React from 'react';
import { Bell, Camera, Settings, Trash2, Download } from 'lucide-react';
import NotificationsSettings from './NotificationsSettings';

const SectionCard: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
  <div className="card mb-6">
    <div className="flex items-center mb-3">
      <span className="mr-2 text-primary-600 dark:text-primary-400">{icon}</span>
      <h3 className="text-lg font-semibold">{title}</h3>
    </div>
    {children}
  </div>
);

const SettingsPanel: React.FC = () => {
  return (
    <div className="mx-auto w-full max-w-5xl py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Customize reminders, notifications, and data preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SectionCard title="Break Reminders" icon={<Bell className="h-5 w-5" />}>
          <p className="text-sm text-gray-600 dark:text-gray-300 ml-1">Get notified when you've been away for too long.</p>
        </SectionCard>

        <SectionCard title="Notifications" icon={<Bell className="h-5 w-5" />}>
          <p className="text-sm text-gray-600 dark:text-gray-300 ml-1 mb-3">Receive browser notifications for important events.</p>
          <NotificationsSettings />
        </SectionCard>

        <SectionCard title="Webcam" icon={<Camera className="h-5 w-5" />}>
          <p className="text-sm text-gray-600 dark:text-gray-300 ml-1">Use webcam for automatic person detection.</p>
        </SectionCard>

        {/* Appearance section removed as requested */}

        <SectionCard title="Data Management" icon={<Download className="h-5 w-5" />}>
          <button className="btn-primary w-full flex items-center justify-center gap-2 mb-2">
            <Download className="h-4 w-4" /> Export Data
          </button>
          <button
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition"
            onClick={() => {
              if (window.confirm('Are you sure you want to clear all data? This cannot be undone.')) {
                localStorage.removeItem('studytracker_sessions');
                localStorage.removeItem('studytracker_settings');
                localStorage.removeItem('studytracker_stats');
                localStorage.removeItem('studytracker_milestones');
                window.location.reload();
              }
            }}
          >
            <Trash2 className="h-4 w-4" /> Clear All Data
          </button>
        </SectionCard>
      </div>

      <div className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
        StudyTracker v1.0.0 — Built with React + TypeScript
      </div>
    </div>
  );
};

export default SettingsPanel;
