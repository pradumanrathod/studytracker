import React from 'react';
import { Bell, Camera, Settings, Trash2, Download } from 'lucide-react';

const SectionCard: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
  <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-6 mb-6 border border-gray-100 dark:border-gray-800">
    <div className="flex items-center mb-4">
      <span className="mr-2 text-primary-500 dark:text-primary-400">{icon}</span>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
    </div>
    {children}
  </div>
);

const SettingsPanel: React.FC = () => {
  return (
    <div className="max-w-xl mx-auto py-8 px-4">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 tracking-tight text-center">Settings</h2>

      <SectionCard title="Break Reminders" icon={<Bell className="h-5 w-5" />}>
        <p className="text-sm text-gray-700 dark:text-gray-300 ml-1">Get notified when you've been away for too long.</p>
      </SectionCard>

      <SectionCard title="Notifications" icon={<Bell className="h-5 w-5" />}>
        <p className="text-sm text-gray-700 dark:text-gray-300 ml-1">Receive browser notifications for important events.</p>
      </SectionCard>

      <SectionCard title="Webcam" icon={<Camera className="h-5 w-5" />}>
        <p className="text-sm text-gray-700 dark:text-gray-300 ml-1">Use webcam for automatic person detection.</p>
      </SectionCard>

  {/* Appearance section removed as requested */}

      <SectionCard title="Data Management" icon={<Download className="h-5 w-5" />}>
        <button className="w-full flex items-center justify-center gap-2 py-2 mb-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-white font-semibold transition">
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
              // Optionally clear all localStorage for this app:
              // localStorage.clear();
              window.location.reload();
            }
          }}
        >
          <Trash2 className="h-4 w-4" /> Clear All Data
        </button>
      </SectionCard>

      <div className="mt-8 text-center text-xs text-gray-500 dark:text-gray-400">
        StudyTracker v1.0.0 &mdash; A smart focus timer with person detection.<br />
        Built with React, TypeScript, and TensorFlow.js
      </div>
    </div>
  );
};

export default SettingsPanel;
