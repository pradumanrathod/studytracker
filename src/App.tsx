
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  Square, 
  Camera, 
  CameraOff, 
  BarChart3, 
  Settings,
  Trophy,
  Clock,
  Moon,
  Sun,
  User as UserIcon
} from 'lucide-react';
import { timerService } from './services/timerService';
import { getUserStats as getUserStatsRemote, setUserStats as setUserStatsRemote } from './services/statsService';
import { listUserSessions, upsertUserSession } from './services/sessionsService';
import { signInWithGoogle, signOutUser, auth } from './services/firebaseAuth';
import { onAuthStateChanged, User } from 'firebase/auth';
import { personDetectionService } from './services/personDetection';
import { TimerState, StudySession, UserStats } from './types';
import TimerDisplay from './components/TimerDisplay';
import StatsDashboard from './components/StatsDashboard';
import SessionGraph from './components/SessionGraph';
import WebcamView from './components/WebcamView';
import SettingsPanel from './components/SettingsPanel';
import MilestonesPanel from './components/MilestonesPanel';
import Footer from './components/Footer';
import FAQ from './components/FAQ';
import Reviews from './components/Reviews';
import WaterTankTimer from './components/WaterTankTimer';
import StreakHeatmap from './components/StreakHeatmap';
import { useNavigate } from 'react-router-dom';


// Onboarding component removed per request


// UserDropdown component for navbar
const UserDropdown: React.FC<{ user: User, onSignOut: () => void }> = ({ user, onSignOut }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);
  const initial = user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || '?';
  return (
    <div className="relative" ref={ref}>
      <button
        className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-300 via-orange-400 to-indigo-400 flex items-center justify-center text-lg font-bold text-white shadow border-2 border-white dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-400"
        onClick={() => setOpen((v) => !v)}
        title={user.displayName || user.email || 'User'}
      >
        {initial}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 animate-fade-in">
          <div className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200 border-b border-gray-100 dark:border-gray-800">
            {user.displayName || user.email}
          </div>
          <button
            className="w-full text-left px-4 py-2 text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-b-lg transition-colors"
            onClick={() => { setOpen(false); onSignOut(); }}
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
};

function App() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      // Update auth state; no auto-redirect for guests
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, []);
  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [currentSession, setCurrentSession] = useState<StudySession | null>(null);
  const [personPresent, setPersonPresent] = useState(false);
  const [stats, setStats] = useState<UserStats>({
    totalFocusTime: 0,
    totalSessions: 0,
    currentStreak: 0,
    longestStreak: 0,
    averageSessionLength: 0,
    todayFocusTime: 0,
    thisWeekFocusTime: 0,
    thisMonthFocusTime: 0,
  });
  const [activeTab, setActiveTab] = useState<'stats' | 'milestones' | 'settings'>('stats');
  const [webcamEnabled, setWebcamEnabled] = useState(false);
  const [webcamError, setWebcamError] = useState<string | null>(null);
  const [webcamStarting, setWebcamStarting] = useState(false);
  const [showAwayAlert, setShowAwayAlert] = useState(false);
  // Dark mode only
  const [isDarkMode] = useState<boolean>(true);
  const [sessionActive, setSessionActive] = useState(false); // true after Start is clicked, false after End
  const [manuallyPaused, setManuallyPaused] = useState(false); // Track if user manually paused
  // Track if stats have been loaded from Firestore or local cache to avoid overwriting with zeros
  const [statsLoaded, setStatsLoaded] = useState(false);
  // Onboarding removed

  const videoRef = useRef<HTMLVideoElement>(null);
  // canvasRef not needed for COCO-SSD

  // Ensure restricted tabs are not active for guests
  useEffect(() => {
    if (!user && (activeTab === 'milestones' || activeTab === 'settings')) {
      setActiveTab('stats');
    }
  }, [user, activeTab]);

  useEffect(() => {
    // Set up timer service callbacks
    timerService.setCallbacks(
      (state) => setTimerState(state),
      (session) => setCurrentSession(session)
    );
    // Do not call updateStats() here to avoid overwriting loaded stats with zeros
  }, []);

  // Load and merge sessions from Firestore when user logs in
  useEffect(() => {
    const syncSessions = async () => {
      if (!user?.uid) return;
      try {
        const remote = await listUserSessions(user.uid);
        if (remote && remote.length) {
          timerService.mergeSessions(remote);
          // ensure UI reflects merged data
          setCurrentSession(timerService.getCurrentSession());
          setStats(timerService.getStats());
        }
      } catch (e) {
        console.warn('Failed to load sessions from Firestore:', e);
      }
    };
    syncSessions();
  }, [user]);

  // Warn user before page unload about potential data loss
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Make sure we persist in-progress time
      try {
        timerService.flushProgress();
      } catch {}
      if (timerState === 'running' || currentSession?.isActive) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [timerState, currentSession]);

  // LocalStorage helpers for per-user stats persistence
  const statsStorageKey = (uid?: string | null) => `studytracker:stats:${uid ?? 'guest'}`;
  const loadStatsFromStorage = (uid?: string | null): UserStats | null => {
    try {
      const raw = localStorage.getItem(statsStorageKey(uid));
      if (!raw) return null;
      const parsed = JSON.parse(raw) as UserStats;
      return parsed;
    } catch (err) {
      console.warn('Failed to load stats from storage:', err);
      return null;
    }
  };
  const saveStatsToStorage = (uid?: string | null, data?: UserStats) => {
    try {
      const toSave = data ?? stats;
      localStorage.setItem(statsStorageKey(uid), JSON.stringify(toSave));
    } catch (err) {
      console.warn('Failed to save stats to storage:', err);
    }
  };

  useEffect(() => {
    // Update stats when session changes
    updateStats();
  }, [currentSession]);

  // Persist stats whenever they change (per user) AFTER initial load
  useEffect(() => {
    if (!statsLoaded) return; // avoid writing zeros before real stats are loaded
    // Always cache locally per-user for faster load
    saveStatsToStorage(user?.uid, stats);
    // If authenticated, also persist to Firestore
    if (user?.uid) {
      setUserStatsRemote(user.uid, stats).catch((err) => {
        console.warn('Failed to save stats to Firestore:', err);
      });
    }
  }, [stats, user, statsLoaded]);

  // Load per-user stats when user changes
  useEffect(() => {
    const load = async () => {
      if (user?.uid) {
        try {
          const remote = await getUserStatsRemote(user.uid);
          // compute local stats from existing sessions
          const localComputed = timerService.getStats();
          console.log('[Stats] Remote fetched for', user.uid, remote);
          console.log('[Stats] Local computed from sessions', localComputed);
          // Merge by taking the maximum per metric so we don't regress due to stale remote
          const merged: UserStats = {
            totalFocusTime: Math.max(remote.totalFocusTime, localComputed.totalFocusTime),
            totalSessions: Math.max(remote.totalSessions, localComputed.totalSessions),
            currentStreak: Math.max(remote.currentStreak, localComputed.currentStreak),
            longestStreak: Math.max(remote.longestStreak, localComputed.longestStreak),
            averageSessionLength: Math.max(remote.averageSessionLength, localComputed.averageSessionLength),
            todayFocusTime: Math.max(remote.todayFocusTime, localComputed.todayFocusTime),
            thisWeekFocusTime: Math.max(remote.thisWeekFocusTime, localComputed.thisWeekFocusTime),
            thisMonthFocusTime: Math.max(remote.thisMonthFocusTime, localComputed.thisMonthFocusTime),
          };

          setStats(merged);
          // also cache locally and push to Firestore if we used local
          saveStatsToStorage(user.uid, merged);
          setUserStatsRemote(user.uid, merged).catch((err) => console.warn('Failed to push merged stats to Firestore:', err));
          console.log('[Stats] Using MERGED stats ->', merged);
          setStatsLoaded(true);
          return;
        } catch (err) {
          console.warn('Failed to load stats from Firestore, using local cache:', err);
        }
      }
      // guest or remote failed: compute from sessions and prefer it over cached if higher
      const cached = loadStatsFromStorage(user?.uid) ?? {
        totalFocusTime: 0,
        totalSessions: 0,
        currentStreak: 0,
        longestStreak: 0,
        averageSessionLength: 0,
        todayFocusTime: 0,
        thisWeekFocusTime: 0,
        thisMonthFocusTime: 0,
      };
      const computed = timerService.getStats();
      const mergedGuest: UserStats = {
        totalFocusTime: Math.max(cached.totalFocusTime, computed.totalFocusTime),
        totalSessions: Math.max(cached.totalSessions, computed.totalSessions),
        currentStreak: Math.max(cached.currentStreak, computed.currentStreak),
        longestStreak: Math.max(cached.longestStreak, computed.longestStreak),
        averageSessionLength: Math.max(cached.averageSessionLength, computed.averageSessionLength),
        todayFocusTime: Math.max(cached.todayFocusTime, computed.todayFocusTime),
        thisWeekFocusTime: Math.max(cached.thisWeekFocusTime, computed.thisWeekFocusTime),
        thisMonthFocusTime: Math.max(cached.thisMonthFocusTime, computed.thisMonthFocusTime),
      };
      setStats(mergedGuest);
      saveStatsToStorage(user?.uid, mergedGuest);
      setStatsLoaded(true);
    };
    load();
  }, [user]);

  useEffect(() => {
    // Only control timer if sessionActive is true
    if (sessionActive) {
      if (personPresent && timerState === 'idle') {
        timerService.startSession();
      } else if (!personPresent && timerState === 'running') {
        timerService.pauseSession();
        setShowAwayAlert(true);
      } else if (personPresent && timerState === 'paused' && !manuallyPaused) {
        // Only auto-resume if not manually paused
        timerService.resumeSession();
        setShowAwayAlert(false);
      } else if (!personPresent) {
        setShowAwayAlert(true);
      } else {
        setShowAwayAlert(false);
      }
    } else {
      // If session is not active, always pause and hide alert
      if (timerState === 'running' || timerState === 'paused') {
        timerService.pauseSession();
      }
      setShowAwayAlert(false);
    }
  }, [personPresent, timerState, sessionActive, manuallyPaused]);

  const updateStats = () => {
    setStats(timerService.getStats());
  };

  // Onboarding removed

  // Onboarding removed

  const handleStartSession = async () => {
    try {
      if (!webcamEnabled) {
        if (videoRef.current) {
          setWebcamStarting(true);
          await personDetectionService.startDetection(
            videoRef.current,
            setPersonPresent
          );
          setWebcamEnabled(true);
          setWebcamStarting(false);
        }
      }
      setSessionActive(true); // Mark session as active after Start is clicked
      // Smooth scroll to the timer section after starting
      setTimeout(() => {
        const el = document.getElementById('timer-section');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    } catch (error) {
      setWebcamError('Failed to start webcam: ' + error);
      console.error('Failed to start webcam:', error);
      setWebcamStarting(false);
    }
  };

  const handlePauseSession = () => {
    timerService.pauseSession();
    setManuallyPaused(true); // Mark as manually paused
  };

  const handleResumeSession = () => {
    timerService.resumeSession();
    setManuallyPaused(false); // Clear manual pause flag
  };

  const handleEndSession = async () => {
    const ended = timerService.endSession();
    setSessionActive(false); // Mark session as inactive
    setManuallyPaused(false); // Reset manual pause flag
    setShowAwayAlert(false);
    // Auto-stop webcam and detection on session end
    try {
      personDetectionService.stopDetection();
    } catch {}
    setWebcamEnabled(false);
    setPersonPresent(false);
    // Persist the ended session to Firestore for cross-device stats/history
    try {
      if (user?.uid && ended && ended.duration >= 60) {
        await upsertUserSession(user.uid, ended);
      }
    } catch (e) {
      console.warn('Failed to save session to Firestore:', e);
    }
    // Recompute stats immediately after ending a session and persist
    const recomputed = timerService.getStats();
    setStats(recomputed);
    saveStatsToStorage(user?.uid, recomputed);
    if (user?.uid) {
      setUserStatsRemote(user.uid, recomputed).catch((err) => console.warn('Failed to save stats to Firestore:', err));
    }
  };

  const handleToggleWebcam = async () => {
    try {
      setWebcamError(null);
      if (webcamEnabled) {
        personDetectionService.stopDetection();
        setWebcamEnabled(false);
      } else {
        if (videoRef.current) {
          setWebcamStarting(true);
          await personDetectionService.startDetection(
            videoRef.current,
            setPersonPresent
          );
          setWebcamEnabled(true);
          setWebcamStarting(false);
        } else {
          setWebcamError('Webcam element not found.');
          setWebcamStarting(false);
        }
      }
    } catch (err) {
      setWebcamError('Error accessing webcam: ' + err);
      setWebcamStarting(false);
    }
  };



  // no-op: theme locked to dark



  // Force dark class on mount
  useEffect(() => {
    try { localStorage.setItem('studytracker:theme', 'dark'); } catch {}
    document.documentElement.classList.add('dark');
  }, []);

  const handleSignOut = async () => {
    await signOutUser();
    // Proactively stop webcam on explicit sign-out; stay on page
    try {
      personDetectionService.stopDetection();
      setWebcamEnabled(false);
      setPersonPresent(false);
    } catch {}
    // Refresh the page to reset state cleanly after logout
    window.location.reload();
  };

    return (
    <div className={`min-h-screen transition-colors duration-300 bg-gradient-to-br from-indigo-950 via-gray-900 to-purple-950`}>
      {/* Header */}
      <header className={`sticky top-0 z-50 transition-colors duration-300 backdrop-blur supports-[backdrop-filter]:backdrop-blur bg-gray-900/70 border-b border-gray-800`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Left: Brand */}
            <div className="flex items-center gap-3">
              <img src="/models/logo.png" alt="StudyTracker" className="h-14 sm:h-16 w-auto rounded-lg shadow-sm ring-1 ring-black/5" />
              <span className="hidden sm:inline text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
                StudyTracker
              </span>
            </div>

            {/* Center: (nav removed as requested) */}

            {/* Right: Controls */}
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                onClick={handleToggleWebcam}
                className={`flex items-center gap-2 px-2 sm:px-3 py-2 rounded-lg transition-colors ${
                  webcamEnabled 
                    ? 'bg-green-900/40 text-green-200 hover:bg-green-900/50' 
                    : 'bg-gray-800 text-gray-200 hover:bg-gray-700'
                }`}
                title={webcamEnabled ? 'Webcam On' : 'Webcam Off'}
              >
                {webcamEnabled ? <Camera className="h-4 w-4" /> : <CameraOff className="h-4 w-4" />}
                <span className="hidden sm:inline text-sm font-medium">
                  {webcamEnabled ? 'Webcam On' : 'Webcam Off'}
                </span>
              </button>

              {/* Theme toggle removed: dark mode only */}

              {/* User sign-in icon */}
              <div className="ml-1">
                {user ? (
                  <UserDropdown user={user} onSignOut={handleSignOut} />
                ) : (
                  <button
                    title="Go to Login"
                    onClick={() => navigate('/login')}
                    className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    <UserIcon className="w-6 h-6" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-10 py-12 lg:py-16">
        {/* Welcome Section */}
        <div className="mb-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative overflow-hidden rounded-3xl border border-white/10 shadow-2xl ring-1 ring-black/40"
          >
            {/* Animated Background */}
            <div className={`absolute inset-0 ${
              isDarkMode 
                ? 'bg-gradient-to-br from-indigo-900 via-purple-900 to-fuchsia-900' 
                : 'bg-gradient-to-br from-pink-300 via-purple-400 to-indigo-500'
            }`}>
              {/* Aurora/spotlights */}
              <div className="absolute -top-24 -left-16 w-72 h-72 bg-fuchsia-500/25 blur-[80px] rounded-full"></div>
              <div className="absolute -bottom-20 -right-16 w-80 h-80 bg-sky-500/25 blur-[90px] rounded-full"></div>
              <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-emerald-400/10 blur-[70px] rounded-full"></div>
              {/* Subtle grid */}
              <div className="absolute inset-0 opacity-20 [mask-image:linear-gradient(to_bottom,white,transparent)] pointer-events-none bg-[linear-gradient(to_right,rgba(255,255,255,0.15)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.15)_1px,transparent_1px)] bg-[size:22px_22px]"></div>
              {/* Noise overlay */}
              <div className="absolute inset-0 opacity-[0.08] mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'><filter id=\'n\'><feTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'2\' stitchTiles=\'stitch\'/></filter><rect width=\'100%\' height=\'100%\' filter=\'url(%23n)\' opacity=\'0.6\'/></svg>\')' }}></div>
              {/* Floating sparkles */}
              <div className="absolute top-4 left-4 w-2 h-2 bg-white/30 rounded-full animate-pulse"></div>
              <div className="absolute top-8 right-8 w-3 h-3 bg-white/20 rounded-full animate-bounce-slow"></div>
              <div className="absolute bottom-6 left-8 w-1 h-1 bg-white/40 rounded-full animate-pulse-slow"></div>
              <div className="absolute bottom-8 right-4 w-2 h-2 bg-white/25 rounded-full animate-bounce"></div>
            </div>
            
            {/* Content */}
            <div className="relative p-8 md:p-14 text-center space-y-7">
              {/* Main Title */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                <h2 className="text-4xl md:text-6xl font-black text-white mb-3 tracking-tight drop-shadow-[0_4px_20px_rgba(0,0,0,0.45)]">
                  Welcome to{' '}
                  <span className="relative inline-block bg-gradient-to-r from-yellow-300 via-orange-400 to-pink-400 bg-clip-text text-transparent">
                    StudyTracker
                    {/* underline glow */}
                    <span className="absolute -bottom-1 left-0 right-0 h-[6px] bg-gradient-to-r from-yellow-300/50 via-orange-400/50 to-pink-400/50 blur rounded-full"></span>
                  </span>
                </h2>
                <div className="w-28 h-1.5 bg-gradient-to-r from-yellow-300 via-orange-400 to-pink-400 mx-auto rounded-full shadow-[0_0_20px_rgba(251,191,36,0.6)]"></div>
              </motion.div>
              
              {/* Subtitle - concise on mobile, detailed on desktop */}
              {/* Mobile short copy */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.5 }}
                className="block md:hidden text-sm text-white/90 max-w-md mx-auto leading-snug"
              >
                Auto-track study time with your webcam. Simple. Fast. Focused.
              </motion.p>
              {/* Desktop full copy */}
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="hidden md:block text-lg md:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed"
              >
                Your smart focus companion that uses 
                <span className="font-semibold text-yellow-300"> webcam face detection</span> to automatically track your study sessions. 
                Stay focused, build discipline, and achieve your goals with intelligent monitoring and motivation.
              </motion.p>
              
              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55, duration: 0.45 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-2"
              >
                <button
                  onClick={handleStartSession}
                  disabled={webcamStarting}
                  className={
                    'px-6 py-3 rounded-xl text-white font-semibold shadow-lg shadow-orange-500/30 transition-all duration-300 ' +
                    'bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 hover:from-yellow-300 hover:via-orange-400 hover:to-pink-400 ' +
                    'disabled:opacity-80 disabled:cursor-not-allowed'
                  }
                >
                  {webcamStarting ? 'Starting Focus…' : 'Start Focus'}
                </button>
                <a
                  href="#stats-desktop"
                  className="px-6 py-3 rounded-xl font-semibold bg-white/10 text-white hover:bg-white/15 border border-white/15 backdrop-blur transition-colors"
                >
                  Learn More
                </a>
              </motion.div>

              
              {/* Feature Highlights */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-10 pt-8"
              >
                <div className="flex items-center justify-center gap-2 text-white/85">
                  <div className="w-2 h-2 bg-yellow-300 rounded-full shadow-[0_0_12px_rgba(251,191,36,0.7)]"></div>
                  <span className="text-sm font-medium">Smart Face Detection</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-white/85">
                  <div className="w-2 h-2 bg-orange-300 rounded-full shadow-[0_0_12px_rgba(253,186,116,0.7)]"></div>
                  <span className="text-sm font-medium">Auto Session Tracking</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-white/85">
                  <div className="w-2 h-2 bg-pink-300 rounded-full shadow-[0_0_12px_rgba(249,168,212,0.7)]"></div>
                  <span className="text-sm font-medium">Progress Analytics</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12 xl:gap-16">
          {/* Webcam + Away Alert (mobile first) */}
          <div className="order-1 lg:order-none lg:col-span-3 space-y-4 sm:space-y-6">
            {/* Webcam View (hidden if off) */}
            <div className={`card${webcamEnabled ? '' : ' hidden'}`}>
              <h3 className={`text-lg font-semibold mb-4 text-white`}>
                Live Monitoring
              </h3>
              <WebcamView
                videoRef={videoRef}
                canvasRef={undefined}
                faceDetectionState={{
                  isDetecting: webcamEnabled,
                  faceDetected: personPresent,
                  confidence: personPresent ? 1 : 0,
                  lastDetection: new Date(),
                }}
                webcamEnabled={webcamEnabled}
                onToggleWebcam={handleToggleWebcam}
                webcamError={webcamError}
                isStarting={webcamStarting}
              />
            </div>
            {webcamError && (
              <div className="p-4 bg-red-100 text-red-800 rounded-lg mt-2">
                {webcamError}
              </div>
            )}

            {/* Away Alert */}
            <AnimatePresence>
              {showAwayAlert && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`border rounded-lg p-4 ${
                    isDarkMode 
                      ? 'bg-yellow-900/20 border-yellow-700 text-yellow-200' 
                      : 'bg-warning-50 border-warning-200 text-warning-800'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5" />
                    <div>
                      <h3 className="text-sm font-medium">
                        You've been away for a while
                      </h3>
                      <p className="text-sm opacity-80">
                        Return to your desk to continue your focus session
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Desktop Stats moved to sit next to Timer (see below) */}
          </div>

          {/* Timer (desktop: right column) */}
          <div className="order-2 lg:order-none lg:col-span-1 space-y-4 sm:space-y-6">
            <div id="timer-section" className="card">
              <TimerDisplay
                timerState={timerState}
                currentSession={currentSession}
                onStart={handleStartSession}
                onPause={handlePauseSession}
                onResume={handleResumeSession}
                onEnd={handleEndSession}
                isStarting={webcamStarting}
              />
            </div>
            {user ? (
              <>
                <SessionGraph sessions={timerService.getSessions().filter(s => s.duration >= 60)} />
                <StreakHeatmap sessions={timerService.getSessions()} />
              </>
            ) : (
              <div className={`mt-4 rounded-lg border p-6 text-center bg-gray-800/80 border-gray-700`}>
                <h3 className={`text-lg font-semibold mb-1 text-white`}>Login to see session history</h3>
                <p className={`text-gray-400`}>Your session graph is available after signing in.</p>
              </div>
            )}
          </div>

          {/* Desktop Stats (left, same row as Timer) */}
          <div id="stats-desktop" className="hidden lg:block lg:col-span-2 space-y-6">
            {/* Navigation Tabs */}
            <div className={`rounded-lg shadow-sm border p-1 transition-colors duration-300 bg-gray-800/80 border-gray-700`}>
              <div className="flex space-x-1">
                {[
                  { id: 'stats', label: 'Stats', icon: BarChart3 },
                  { id: 'milestones', label: 'Milestones', icon: Trophy },
                  { id: 'settings', label: 'Settings', icon: Settings },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const disabled = !user && (tab.id === 'milestones' || tab.id === 'settings');
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        if (disabled) {
                          navigate('/login');
                          return;
                        }
                        setActiveTab(tab.id as any);
                      }}
                      aria-disabled={disabled}
                      disabled={disabled}
                      className={`flex-1 flex items-center justify-center space-x-1 sm:space-x-2 py-2 px-2 sm:px-3 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                        disabled
                          ? 'cursor-not-allowed opacity-50 text-gray-500'
                          : activeTab === tab.id
                            ? 'bg-primary-600 text-white'
                            : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                      }`}
                    >
                      <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Content Panels */}
            <div className="card min-h-[400px]">
              <AnimatePresence mode="wait">
                {activeTab === 'stats' && (
                  <motion.div
                    key="stats"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <StatsDashboard stats={stats} user={user} isLoading={!statsLoaded} />
                  </motion.div>
                )}

                {activeTab === 'milestones' && (
                  <motion.div
                    key="milestones"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    {user ? (
                      <MilestonesPanel stats={stats} />
                    ) : (
                      <div className={`rounded-lg border p-6 text-center bg-gray-800/80 border-gray-700`}>
                        <h3 className={`text-lg font-semibold mb-1 text-white`}>Login required</h3>
                        <p className={`text-gray-400`}>Sign in to view and track your milestones.</p>
                        <div className="mt-4">
                          <button onClick={() => navigate('/login')} className="px-4 py-2 rounded-md bg-primary-600 text-white">Go to Login</button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'settings' && (
                  <motion.div
                    key="settings"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    {user ? (
                      <SettingsPanel />
                    ) : (
                      <div className={`rounded-lg border p-6 text-center bg-gray-800/80 border-gray-700`}>
                        <h3 className={`text-lg font-semibold mb-1 text-white`}>Login required</h3>
                        <p className={`text-gray-400`}>Sign in to access your settings.</p>
                        <div className="mt-4">
                          <button onClick={() => navigate('/login')} className="px-4 py-2 rounded-md bg-primary-600 text-white">Go to Login</button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Mobile Stats and Navigation (below timer) */}
          <div id="stats-mobile" className="order-3 lg:order-none lg:col-span-2 space-y-6 lg:hidden">
            {/* Navigation Tabs */}
            <div className={`rounded-lg shadow-sm border p-1 transition-colors duration-300 ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-200'
            }`}>
              <div className="flex space-x-1">
                {[
                  { id: 'stats', label: 'Stats', icon: BarChart3 },
                  { id: 'milestones', label: 'Milestones', icon: Trophy },
                  { id: 'settings', label: 'Settings', icon: Settings },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const disabled = !user && (tab.id === 'milestones' || tab.id === 'settings');
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        if (disabled) {
                          navigate('/login');
                          return;
                        }
                        setActiveTab(tab.id as any);
                      }}
                      aria-disabled={disabled}
                      disabled={disabled}
                      className={`flex-1 flex items-center justify-center space-x-1 sm:space-x-2 py-2 px-2 sm:px-3 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                        activeTab === tab.id
                          ? isDarkMode
                            ? 'bg-primary-600 text-white'
                            : 'bg-primary-100 text-primary-700'
                          : disabled
                            ? 'cursor-not-allowed opacity-50 text-gray-500'
                            : isDarkMode
                              ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Content Panels */}
            <div className="card min-h-[400px]">
              <AnimatePresence mode="wait">
                {activeTab === 'stats' && (
                  <motion.div
                    key="stats"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <StatsDashboard stats={stats} user={user} />
                  </motion.div>
                )}

                {activeTab === 'milestones' && (
                  <motion.div
                    key="milestones"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <MilestonesPanel stats={stats} />
                  </motion.div>
                )}

                {activeTab === 'settings' && (
                  <motion.div
                    key="settings"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <SettingsPanel />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>

      {/* Water Tank Focus - full width section above Reviews */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-10 pb-12">
        <div className="card">
          {user ? (
            <WaterTankTimer
              elapsedSeconds={currentSession?.duration ?? 0}
              defaultPlannedMinutes={60}
            />
          ) : (
            <div className={`text-center`}>
              <h3 className={`text-lg font-semibold mb-1 text-white`}>Login to see focus tank</h3>
              <p className={`text-gray-400`}>Sign in to track and visualize your planned focus.</p>
              <div className="mt-4">
                <button onClick={() => navigate('/login')} className="px-4 py-2 rounded-md bg-primary-600 text-white">Go to Login</button>
              </div>
            </div>
          )}
        </div>
      </section>

      <Reviews />
      <FAQ />
      <Footer />
    </div>
  );
}

export default App;
