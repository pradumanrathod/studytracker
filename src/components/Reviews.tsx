import React from 'react';
import { Star, Quote } from 'lucide-react';

type Review = {
  name: string;
  role?: string;
  rating: number; // 0-5
  text: string;
  avatar?: string; // optional url
};

const reviews: Review[] = [
  {
    name: 'Aarav Sharma',
    role: 'College Student',
    rating: 5,
    text:
      'StudyTracker completely changed how I focus. Auto-pause when I leave and clear stats at the end of the day – chef\'s kiss.',
  },
  {
    name: 'Isha Verma',
    role: 'JEE Aspirant',
    rating: 5,
    text:
      'The presence detection is surprisingly accurate and everything runs in the browser. Privacy + productivity in one place.',
  },
  {
    name: 'Rohan Patel',
    role: 'Developer',
    rating: 4,
    text:
      'Beautiful UI and simple controls. Streaks keep me motivated. Would love a native export option next!',
  },
  {
    name: 'Sofía Martínez',
    role: 'Product Manager, Spain',
    rating: 5,
    text:
      'Logged 142 hours in 6 weeks using StudyTracker. My daily distractions dropped by 35% and weekly deep-work blocks doubled.',
  },
  {
    name: 'Kenji Tanaka',
    role: 'Software Engineer, Japan',
    rating: 5,
    text:
      'My average focused time increased by 52 minutes/day and I hit a 14-day streak. Auto-pause/resume works 99% of the time.',
  },
  {
    name: 'Léa Dubois',
    role: 'PhD Candidate, France',
    rating: 4,
    text:
      'Thesis writing time up 28% in the first month. The session stats helped me plan 3 longer focus blocks per day reliably.',
  },
];

const Stars: React.FC<{ value: number }> = ({ value }) => (
  <div className="flex items-center gap-0.5" aria-label={`${value} out of 5 stars`}>
    {Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < value ? 'text-yellow-500 fill-yellow-400' : 'text-gray-600'}`}
      />
    ))}
  </div>
);

const Avatar: React.FC<{ name: string; src?: string }> = ({ name, src }) => {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <div className="relative h-10 w-10 shrink-0 rounded-full bg-gray-800 flex items-center justify-center text-sm font-semibold text-white overflow-hidden">
      {src ? (
        <img src={src} alt={`${name} avatar`} className="h-full w-full object-cover" />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
};

const Reviews: React.FC = () => {
  return (
    <section aria-labelledby="reviews-title" className="mt-12 sm:mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h2
            id="reviews-title"
            className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-violet-400 to-indigo-500 bg-clip-text text-transparent"
          >
            What users are saying
          </h2>
          <p className="mt-2 text-sm sm:text-base text-gray-300">
            Real stories from people using StudyTracker to stay focused
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {reviews.map((r, idx) => (
            <article
              key={idx}
              className="group relative rounded-2xl border bg-gray-900/40 border-gray-700 shadow-sm overflow-hidden"
            >
              {/* Accent gradient border top */}
              <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 opacity-80" />

              <div className="p-5 sm:p-6">
                <div className="flex items-start gap-3">
                  <Avatar name={r.name} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate text-base font-semibold text-white">{r.name}</h3>
                      {r.role && (
                        <span className="truncate text-xs text-gray-400">• {r.role}</span>
                      )}
                    </div>
                    <Stars value={r.rating} />
                  </div>
                  <Quote className="ml-auto h-5 w-5 text-gray-600" />
                </div>

                <p className="mt-4 text-sm leading-relaxed text-gray-300">
                  {r.text}
                </p>
              </div>

              {/* Subtle glow on hover in light mode; toned down for dark */}
              <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute -inset-1 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 blur-2xl" />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Reviews;
