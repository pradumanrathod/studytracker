import React, { useEffect, useMemo, useState } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { Droplets, TimerReset } from 'lucide-react';

interface WaterTankTimerProps {
  // External elapsed (optional) - ignored if using internal timer controls
  elapsedSeconds?: number;
  // set the planned total time in minutes
  defaultPlannedMinutes?: number;
}

const clamp = (v: number, min = 0, max = 1) => Math.max(min, Math.min(max, v));

const WaterTankTimer: React.FC<WaterTankTimerProps> = ({ elapsedSeconds, defaultPlannedMinutes = 60 }) => {
  const [plannedMinutes, setPlannedMinutes] = useState<number>(defaultPlannedMinutes);
  const [internalElapsed, setInternalElapsed] = useState<number>(0);
  const [state, setState] = useState<'idle' | 'running' | 'paused'>('idle');
  const [completed, setCompleted] = useState(false);

  // Prefer internal timer for this component as per request
  const effectiveElapsed = internalElapsed;
  const plannedSeconds = Math.max(60, Math.round(plannedMinutes * 60));
  const progress = clamp(effectiveElapsed / plannedSeconds, 0, 1);
  const percentage = Math.round(progress * 100);

  // Smooth, gradual water level (no sudden jumps)
  const fill = useMotionValue(percentage);
  const fillHeight = useTransform(fill, (v) => `${v}%`);

  useEffect(() => {
    const controls = animate(fill, percentage, { duration: 0.8, ease: 'easeInOut' });
    return () => controls.stop();
  }, [percentage, fill]);

  // Tick internal timer
  useEffect(() => {
    if (state !== 'running') return;
    const id = setInterval(() => {
      setInternalElapsed((s) => s + 1);
    }, 1000);
    return () => clearInterval(id);
  }, [state]);

  // Auto reset on completion
  useEffect(() => {
    if (state === 'running' && effectiveElapsed >= plannedSeconds) {
      // brief celebration then reset
      setCompleted(true);
      setTimeout(() => setCompleted(false), 1500);
      setInternalElapsed(0);
      setState('idle');
    }
  }, [effectiveElapsed, plannedSeconds, state]);

  const droplets = useMemo(() => {
    // New SVG raindrops: straighter, fast, with subtle shape variation
    return Array.from({ length: 48 }).map((_, i) => ({
      id: i,
      left: Math.random() * 86 + 7, // 7% to 93%
      delay: Math.random() * 1.2,
      duration: 1.1 + Math.random() * 0.8, // faster
      swayDuration: 1.0 + Math.random() * 0.6,
      size: 6 + Math.random() * 8, // base size controls SVG viewport scale
      tilt: (Math.random() - 0.5) * 6, // slight tilt degrees
    }));
  }, []);

  const WaveLayer: React.FC<{ y: number; opacity: number; color: string; speed: number; bob?: boolean; bobAmp?: number; bobDur?: number }>
    = ({ y, opacity, color, speed, bob = true, bobAmp = 2, bobDur = 3 }) => (
    <motion.div className="absolute left-0 right-0" style={{ bottom: y }}
      animate={ bob ? { y: [0, -bobAmp, 0, bobAmp, 0] } : undefined }
      transition={ bob ? { repeat: Infinity, duration: bobDur, ease: 'easeInOut' } : undefined }
    >
      <div className="relative w-full h-8 overflow-hidden" style={{ opacity }}>
        <motion.div
          className="absolute top-0 left-0 h-full"
          style={{ width: '200%' }}
          animate={{ x: ['0%', '-50%'] }}
          transition={{ repeat: Infinity, duration: speed, ease: 'linear' }}
        >
          <svg viewBox="0 0 1200 100" preserveAspectRatio="none" className="h-full w-[50%] inline-block" style={{ color }}>
            <path d="M0,40 C300,90 900,-10 1200,40 L1200,100 L0,100 Z" fill="currentColor" />
          </svg>
          <svg viewBox="0 0 1200 100" preserveAspectRatio="none" className="h-full w-[50%] inline-block" style={{ color }}>
            <path d="M0,40 C300,90 900,-10 1200,40 L1200,100 L0,100 Z" fill="currentColor" />
          </svg>
        </motion.div>
      </div>
    </motion.div>
  );

  return (
    <div className="rounded-2xl border border-gray-700 bg-gray-900/60 backdrop-blur p-5 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-white">
          <Droplets className="h-5 w-5 text-sky-400" />
          <h3 className="text-base sm:text-lg font-semibold">Focus Tank</h3>
        </div>
        <div className="text-xs text-gray-400">Plan your session and watch it fill up</div>
      </div>

      {/* Two-column layout: left controls, right tank */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left: Timer controls */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Planned Time (minutes)</label>
            <input
              type="number"
              min={1}
              max={600}
              value={plannedMinutes}
              onChange={(e) => setPlannedMinutes(Number(e.target.value) || 0)}
              className="w-full rounded-lg bg-gray-800 border border-gray-700 text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="flex items-center gap-3 text-sm">
            <div className="px-3 py-2 rounded-lg border border-gray-700 text-gray-300 select-none">
              Goal: <span className="text-white font-semibold">{Math.round(plannedSeconds / 60)}m</span>
            </div>
            <button
              title="Reset to 60m"
              onClick={() => setPlannedMinutes(60)}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-100 border border-gray-700 transition"
            >
              <TimerReset className="h-4 w-4" /> Reset
            </button>
          </div>

          {/* Control buttons */}
          <div className="flex flex-wrap gap-3">
            {state === 'idle' && (
              <button
                onClick={() => { setInternalElapsed(0); setState('running'); }}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow border border-emerald-500/30"
              >Start</button>
            )}
            {state === 'running' && (
              <>
                <button
                  onClick={() => setState('paused')}
                  className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white shadow border border-amber-500/30"
                >Pause</button>
                <button
                  onClick={() => { setInternalElapsed(0); setState('idle'); }}
                  className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white shadow border border-rose-500/30"
                >End</button>
              </>
            )}
            {state === 'paused' && (
              <>
                <button
                  onClick={() => setState('running')}
                  className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white shadow border border-sky-500/30"
                >Resume</button>
                <button
                  onClick={() => { setInternalElapsed(0); setState('idle'); }}
                  className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white shadow border border-rose-500/30"
                >End</button>
              </>
            )}
          </div>
        </div>

        {/* Right: Tank */}
        <div className="relative h-80 sm:h-[26rem] rounded-2xl border border-gray-700 bg-gradient-to-b from-gray-900 to-gray-950 overflow-hidden">
          {/* Completion toast */}
          <div className={`absolute top-3 inset-x-0 flex justify-center pointer-events-none transition-opacity ${completed ? 'opacity-100' : 'opacity-0'}`}>
            <div className="px-4 py-2 rounded-full bg-emerald-700/70 text-white text-xs border border-emerald-500/40 shadow">
              Goal complete! Tank reset.
            </div>
          </div>
          {/* Tank interior grid */}
          <div className="absolute inset-0 opacity-30 bg-[linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:20px_20px]"></div>

          {/* Filling water - gradual via motion value */}
          <motion.div
            className="absolute bottom-0 left-0 right-0"
            style={{ height: fillHeight }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-sky-700/80 via-sky-600/70 to-sky-400/60" />
            {/* Water shine */}
            <div className="absolute inset-x-0 top-0 h-10 bg-white/20 blur-md" />
            {/* Flowing waves near the top of water (more layers + gentle bob) */}
            <WaveLayer y={34} opacity={0.25} color="rgba(125,211,252,0.6)" speed={9} bobAmp={1.5} bobDur={3.8} />
            <WaveLayer y={28} opacity={0.45} color="rgba(125,211,252,0.7)" speed={8} bobAmp={2} bobDur={3.2} />
            <WaveLayer y={22} opacity={0.32} color="rgba(56,189,248,0.7)" speed={10} bobAmp={1.8} bobDur={3.6} />
            <WaveLayer y={16} opacity={0.28} color="rgba(56,189,248,0.65)" speed={11} bobAmp={1.6} bobDur={3.4} />
            <WaveLayer y={10} opacity={0.22} color="rgba(14,165,233,0.7)" speed={12.5} bobAmp={1.4} bobDur={3.1} />
            <WaveLayer y={4} opacity={0.18} color="rgba(14,165,233,0.65)" speed={14} bobAmp={1.2} bobDur={3.0} />
          </motion.div>

          {/* Droplets falling: render only while running for realism */}
          {state === 'running' && droplets.map((d) => (
            <React.Fragment key={d.id}>
              {/* New SVG raindrop with subtle tilt and glossy body */}
              <motion.svg
                className="absolute top-0"
                style={{ left: `${d.left}%`, width: d.size, height: d.size * 2.2, filter: 'drop-shadow(0 0 6px rgba(125,211,252,0.35))' }}
                viewBox="0 0 24 48"
                initial={{ y: -30, opacity: 0, rotate: 0 }}
                animate={{ y: 'calc(100% - 10px)', opacity: [0, 1, 1, 0.85, 0.65, 0], rotate: d.tilt }}
                transition={{ repeat: Infinity, delay: d.delay, duration: d.duration, ease: 'easeIn' }}
              >
                {/* Trail */}
                <linearGradient id={`trail-${d.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(186,230,253,0.0)" />
                  <stop offset="100%" stopColor="rgba(186,230,253,0.4)" />
                </linearGradient>
                <rect x="10.5" y="0" width="3" height="28" fill={`url(#trail-${d.id})`} rx="1.5" />
                {/* Body */}
                <path
                  d="M12 6 C10 12 6 16 6 22 C6 31 12 36 12 36 C12 36 18 31 18 22 C18 16 14 12 12 6 Z"
                  fill="url(#gradBody)"
                />
                {/* Highlight */}
                <ellipse cx="9.5" cy="18" rx="2.5" ry="5" fill="rgba(255,255,255,0.5)" />
                <defs>
                  <linearGradient id="gradBody" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(186,230,253,0.95)" />
                    <stop offset="100%" stopColor="rgba(56,189,248,0.85)" />
                  </linearGradient>
                </defs>
              </motion.svg>

              {/* Splash ripple synced with drop timing near the bottom */}
              <motion.span
                className="absolute rounded-full"
                style={{ left: `${d.left}%`, bottom: 4, width: d.size * 3.5, height: d.size * 1.2, border: '1px solid rgba(186,230,253,0.45)' }}
                initial={{ opacity: 0, scaleX: 0.4, scaleY: 0.6 }}
                animate={{ opacity: [0, 0, 0.6, 0.2, 0], scaleX: [0.4, 0.95, 1.25], scaleY: [0.6, 0.9, 1] }}
                transition={{ repeat: Infinity, delay: d.delay + (d.duration * 0.98), duration: 0.5, ease: 'easeOut' }}
              />
            </React.Fragment>
          ))}

          {/* Progress label */}
          <div className="absolute inset-x-0 bottom-3 flex items-center justify-center">
            <div className="px-3 py-1.5 rounded-full bg-gray-900/70 border border-gray-700 text-white text-xs">
              {percentage}% complete
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaterTankTimer;
