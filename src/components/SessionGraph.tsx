import React from 'react';

interface Session {
  id: string;
  duration: number; // in seconds
  startTime: Date;
}

interface SessionGraphProps {
  sessions: Session[];
}

function isSameDay(date1: Date, date2: Date) {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

const BAR_MAX_HEIGHT = 160; // px
const NUM_BARS = 4;

const SessionGraph: React.FC<SessionGraphProps> = ({ sessions }) => {
  // Only include sessions longer than 1 minute and from today
  const today = new Date();
  let filtered = sessions
    .filter(s => s.duration >= 60 && isSameDay(new Date(s.startTime), today))
    .sort((a, b) => b.duration - a.duration)
    .slice(0, NUM_BARS)
    .sort((a, b) => (a.startTime > b.startTime ? 1 : -1)); // show in chronological order

  // Pad to always have 4 bars
  while (filtered.length < NUM_BARS) {
    filtered.push({ id: `empty-${filtered.length}`, duration: 0, startTime: today });
  }

  const maxDuration = Math.max(...filtered.map(s => s.duration));
  const maxHours = maxDuration / 3600;

  // Detect dark mode using Tailwind's dark class on html
  const isDark = typeof window !== 'undefined' && document.documentElement.classList.contains('dark');
  const barGradient = isDark
    ? 'linear-gradient(to top, #f87171, #fbbf24)' // red-400 to yellow-400 (dark)
    : 'linear-gradient(to top, #ff512f, #f09819)'; // red-orange (light)
  const emptyBarColor = isDark ? '#22223b' : '#f3f4f6';
  const emptyBarBorder = isDark ? '#4b5563' : '#d1d5db';

  return (
    <div className="card mt-6 p-4">
      <h3 className="text-lg font-semibold mb-4 text-primary-700 dark:text-primary-300">
        Top 4 Sessions Today
      </h3>
      <div className="relative h-48 w-full border-b border-gray-200 dark:border-gray-700 pb-4">
        {/* Y-axis labels (hours, match max session exactly) */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between z-10">
          {[maxHours, maxHours / 2, 0].map((v, idx) => (
            <span
              key={idx}
              className="text-xs text-gray-400 dark:text-gray-600"
              style={{ height: '1.5rem' }}
            >
              {v === 0 ? '0' : `${v.toFixed(1)}h`}
            </span>
          ))}
        </div>
        {/* Bar chart aligned in a grid */}
        <div className="ml-8 grid grid-cols-4 gap-2 h-full items-end" style={{ height: '100%' }}>
          {filtered.map((s, i) => {
            const heightPx = maxDuration > 0 ? Math.max((s.duration / maxDuration) * BAR_MAX_HEIGHT, 8) : 8;
            const isEmpty = s.duration === 0;
            return (
              <div key={s.id} className="flex flex-col items-center justify-end h-full">
                <div
                  className="w-8 rounded-t-lg transition-all duration-300"
                  style={{
                    height: `${isEmpty ? 8 : heightPx}px`,
                    minHeight: 8,
                    background: isEmpty ? emptyBarColor : barGradient,
                    border: isEmpty ? `1.5px dashed ${emptyBarBorder}` : undefined,
                  }}
                  title={isEmpty ? 'No session' : `${(s.duration / 3600).toFixed(1)} hr`}
                ></div>
              </div>
            );
          })}
        </div>
      </div>
      {/* X-axis labels below the bars */}
      <div className="ml-8 grid grid-cols-4 gap-2 mt-2 text-xs text-gray-500 dark:text-gray-400">
        {[...Array(NUM_BARS)].map((_, i) => (
          <span key={i} className="text-center">{i + 1}</span>
        ))}
      </div>
      <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
        Longest session:{' '}
        <span className="font-bold text-primary-700 dark:text-primary-300">
          {maxHours.toFixed(1)} hr
        </span>
      </div>
    </div>
  );
};

export default SessionGraph;
