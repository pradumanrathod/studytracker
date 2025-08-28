import React from 'react';
import { Camera, Play, Pause, Square, BarChart3, Shield, CheckCircle2 } from 'lucide-react';

const Step: React.FC<{ icon: React.ReactNode; title: string; desc: string; className?: string }> = ({ icon, title, desc, className }) => (
  <div className={`rounded-2xl border bg-gray-900/50 border-gray-700 p-4 sm:p-5 ${className ?? ''}`}>
    <div className="flex items-start gap-3">
      <div className="mt-0.5 text-yellow-300">{icon}</div>
      <div>
        <h4 className="text-sm sm:text-base font-semibold text-white">{title}</h4>
        <p className="text-xs sm:text-sm text-gray-300 mt-1">{desc}</p>
      </div>
    </div>
  </div>
);

type HowToUseProps = {
  onStartFocus?: () => void;
  isStarting?: boolean;
};

const HowToUse: React.FC<HowToUseProps> = ({ onStartFocus, isStarting }) => {
  return (
    <section
      id="how-to-use"
      aria-labelledby="how-to-use-title"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-14"
    >
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-300 ring-1 ring-indigo-500/30">
          Quick start
        </div>
        <h3 id="how-to-use-title" className="mt-2 text-xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-yellow-300 to-pink-400 bg-clip-text text-transparent">
          How to use this app
        </h3>
        <p className="mt-2 text-xs sm:text-base text-gray-300">
          Get set up in under a minute. StudyTracker uses privacy-friendly face presence detection in your browser.
        </p>
      </div>

      {/* Mobile: swipeable carousel of steps */}
      <div className="block sm:hidden -mx-4 px-4 overflow-x-auto">
        <div className="flex gap-3 snap-x snap-mandatory">
          <Step className="min-w-[85%] snap-start"
            icon={<Camera className="h-5 w-5" />}
            title="Enable your webcam"
            desc="Click Webcam to turn it on. Detection runs locally in your browser."
          />
          <Step className="min-w-[85%] snap-start"
            icon={<Play className="h-5 w-5" />}
            title="Start Focus"
            desc="Timer runs when you’re present, auto‑pauses if you step away."
          />
          <Step className="min-w-[85%] snap-start"
            icon={<Pause className="h-5 w-5" />}
            title="Pause/Resume"
            desc="Pause anytime. Auto‑resume when you return (unless paused manually)."
          />
          <Step className="min-w-[85%] snap-start"
            icon={<Square className="h-5 w-5" />}
            title="End Session"
            desc="End to save your progress. Sub‑1‑minute sessions are ignored."
          />
          <Step className="min-w-[85%] snap-start"
            icon={<BarChart3 className="h-5 w-5" />}
            title="Review your stats"
            desc="See totals, streaks, and history. Sign in to sync devices."
          />
          <Step className="min-w-[85%] snap-start"
            icon={<Shield className="h-5 w-5" />}
            title="Privacy‑first"
            desc="Only presence is detected. No video leaves your device."
          />
        </div>
      </div>

      {/* Tablet/Desktop grid */}
      <div className="hidden sm:grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <Step icon={<Camera className="h-5 w-5" />} title="Enable your webcam" desc="Click Webcam to turn it on. No images are uploaded; detection runs locally in your browser." />
        <Step icon={<Play className="h-5 w-5" />} title="Start Focus" desc="Press Start Focus. The timer runs when you’re present and auto-pauses if you step away." />
        <Step icon={<Pause className="h-5 w-5" />} title="Pause/Resume" desc="Manually pause anytime. We’ll auto-resume when you return if you didn’t pause manually." />
        <Step icon={<Square className="h-5 w-5" />} title="End Session" desc="End to save your progress. Sessions under 1 minute are ignored to keep stats clean." />
        <Step icon={<BarChart3 className="h-5 w-5" />} title="Review your stats" desc="See daily/weekly totals, streaks, and session history. Sign in to sync across devices." />
        <Step icon={<Shield className="h-5 w-5" />} title="Privacy-first" desc="Only presence is detected. No video leaves your device. You control the webcam at all times." />
      </div>

      {/* Start Focus CTA */}
      {onStartFocus && (
        <div className="mt-8 text-center">
          <button
            onClick={onStartFocus}
            disabled={isStarting}
            className={
              'px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl text-white font-semibold shadow-lg shadow-orange-500/30 transition-all duration-300 ' +
              'bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 hover:from-yellow-300 hover:via-orange-400 hover:to-pink-400 ' +
              'disabled:opacity-80 disabled:cursor-not-allowed'
            }
          >
            {isStarting ? 'Starting Focus…' : 'Start Focus'}
          </button>
        </div>
      )}

      <div className="mt-6 flex items-center justify-center gap-2 text-green-300">
        <span className="text-xs sm:text-sm text-center">Tip: Keep your face in view for the most accurate tracking.</span>
      </div>
    </section>
  );
};

export default HowToUse;
