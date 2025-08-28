import React from 'react';
import { Star, Quote } from 'lucide-react';

type Review = {
  name: string;
  role?: string;
  rating: number; // 0-5
  text: string;
  country?: string; // ISO 3166-1 alpha-2 (e.g., 'US')
};

const reviews: Review[] = [
  {
    name: 'Emily Carter',
    role: 'Medical Student, USA',
    rating: 5,
    text:
      "I didn’t realize how much time I lost between sessions. The auto-pause when I leave my desk is a lifesaver. I’m up ~10 focused hours/week now.",
    country: 'US',
  },

  {
    name: 'Kenji Tanaka',
    role: 'Software Engineer, Japan',
    rating: 5,
    text:
      'Average focus up by ~50 minutes/day. Hit a 14‑day streak without thinking about the timer. Auto resume feels almost magical.',
    country: 'JP',
  },
  {
    name: 'Arjun Mehta',
    role: 'IIT Aspirant, India',
    rating: 5,
    text:
      'My mock test prep finally feels structured. I do 3 deep-work blocks daily now and the weekly graph keeps me honest.',
    country: 'IN',
  },
  {
    name: 'Aarav Sharma',
    role: 'College Student, India',
    rating: 5,
    text:
      "Switched from manual timers. StudyTracker just… handles it. End‑of‑day stats are oddly satisfying.",
    country: 'IN',
  },
  {
    name: 'Chris E.',
    role: 'Developer, New York',
    rating: 4,
    text:
      'Beautiful UI and simple controls. Streaks keep me motivated. Would love a native export option next!',
    country: 'US',
  },
  {
    name: 'Sofía Martínez',
    role: 'Data Analyst Intern, Spain',
    rating: 5,
    text:
      'Logged 142 hours in 6 weeks. My daily distractions dropped massively and weekly deep‑work blocks doubled.',
    country: 'ES',
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

// Avatar removed per request (no user photos)

// Convert ISO country code to emoji flag
const flagFromISO = (iso?: string) => {
  if (!iso) return '';
  const code = iso.toUpperCase();
  if (code.length !== 2) return '';
  const OFFSET = 127397; // regional indicator offset
  return String.fromCodePoint(code.charCodeAt(0) + OFFSET, code.charCodeAt(1) + OFFSET);
};

// Shuffle helper (Fisher–Yates)
const shuffle = <T,>(arr: T[]): T[] => {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const Reviews: React.FC = () => {
  const randomized = React.useMemo(() => shuffle(reviews), []);
  return (
    <section aria-labelledby="reviews-title" className="mt-12 sm:mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/30">
            Trusted by thousands of users worldwide
          </div>
          <h2
            id="reviews-title"
            className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-violet-400 to-indigo-500 bg-clip-text text-transparent"
          >
            What users are saying
          </h2>
          <p className="mt-2 text-sm sm:text-base text-gray-300">
            Real stories from the US, UK, Australia, Japan, India—and beyond.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {randomized.map((r, idx) => (
            <article
              key={idx}
              className="group relative rounded-2xl border bg-gray-900/40 border-gray-700 shadow-sm overflow-hidden"
            >
              {/* Accent gradient border top */}
              <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 opacity-80" />

              <div className="p-5 sm:p-6">
                <div className="flex items-start">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate text-base font-semibold text-white">{r.name}</h3>
                      {(r.role || r.country) && (
                        <span className="truncate text-xs text-gray-400">
                          • {r.role} {r.country ? ` ${flagFromISO(r.country)}` : ''}
                        </span>
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
