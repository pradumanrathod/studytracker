import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    q: 'How does StudyTracker detect if I am studying?',
    a: 'It uses on-device webcam presence detection to auto-start/pause your session. Video is processed locally in your browser and never uploaded.'
  },
  {
    q: 'Do I need to keep my webcam on the whole time?',
    a: 'Only if you want automatic presence-based control. You can turn the webcam off and control the timer manually at any time.'
  },
  {
    q: 'What data is stored and where?',
    a: 'Session history and settings are stored in your browser (localStorage). If you sign in, aggregated stats are synced to the cloud under your account.'
  },
  {
    q: 'Can I use StudyTracker on mobile?',
    a: 'Yes, the app is responsive. Presence detection relies on the webcam, so experience varies by device and browser capabilities.'
  },
  {
    q: 'How is productivity calculated?',
    a: 'We derive focus time, streaks, session counts, and other metrics from your recorded sessions to build a productivity score.'
  },
  {
    q: 'What happens if I step away from my desk?',
    a: 'If presence detection is enabled, the timer will auto-pause after you leave the frame and auto-resume when you return.'
  },
  {
    q: 'Can I export or reset my data?',
    a: 'You can clear local data from your browser settings. Data export features can be added—let us know if you need this!' 
  }
];

const FAQ: React.FC = () => {
  const [open, setOpen] = useState<number | null>(null);
  const toggle = (idx: number) => setOpen((cur) => (cur === idx ? null : idx));
  return (
    <section
      aria-labelledby="faq-title"
      className="mt-10 sm:mt-14"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h2
            id="faq-title"
            className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent"
          >
            Frequently Asked Questions
          </h2>
          <p className="mt-2 text-sm sm:text-base text-gray-300">
            Quick answers to common questions about StudyTracker
          </p>
        </div>

        {/* FAQ accordion (stack) */}
        <div className="max-w-3xl mx-auto space-y-3 sm:space-y-4">
          {faqs.map((item, idx) => {
            const isOpen = open === idx;
            return (
              <div
                key={idx}
                className={`rounded-xl border shadow-sm transition-colors ${
                  isOpen
                    ? 'bg-gray-900/40 border-gray-700'
                    : 'bg-transparent border-gray-700/60'
                }`}
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => toggle(idx)}
                  className="w-full flex items-center justify-between gap-3 text-left px-5 sm:px-6 py-4"
                >
                  <span className="text-base sm:text-lg font-semibold text-white">
                    {item.q}
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-0">
                    <p className="text-sm text-gray-300 leading-relaxed">
                      {item.a}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
