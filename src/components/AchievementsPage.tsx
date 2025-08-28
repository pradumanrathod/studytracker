import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, Share2, Download, Trophy, Sparkles, Star, Home } from 'lucide-react';
import { timerService } from '../services/timerService';
import { auth } from '../services/firebaseAuth';
import { onAuthStateChanged, User } from 'firebase/auth';

// Compliment tiers based on minutes studied today
function getTier(minutes: number) {
  if (minutes >= 240) return { title: 'KING', emoji: '👑', color: 'from-yellow-300 via-amber-400 to-orange-500', sub: 'Unstoppable. Absolute mastery today.' };
  if (minutes >= 180) return { title: 'LION', emoji: '🦁', color: 'from-orange-300 via-orange-400 to-pink-500', sub: 'Dominant focus. Huge progress.' };
  if (minutes >= 120) return { title: 'TIGER', emoji: '🐯', color: 'from-pink-300 via-fuchsia-400 to-violet-500', sub: 'Ferocious effort. You owned it.' };
  if (minutes >= 60)  return { title: 'WARRIOR', emoji: '🛡️', color: 'from-violet-300 via-indigo-400 to-blue-500', sub: 'Strong, consistent grind.' };
  if (minutes >= 30)  return { title: 'RISING STAR', emoji: '🌟', color: 'from-sky-300 via-cyan-400 to-emerald-500', sub: 'Momentum is building. Keep going!' };
  return { title: 'GETTING STARTED', emoji: '✨', color: 'from-emerald-300 via-teal-400 to-sky-500', sub: 'Every minute counts. Proud of you for showing up.' };
}

const AchievementsPage: React.FC = () => {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const stats = useMemo(() => timerService.getStats(), []);
  const todayMins = Math.floor((stats?.todayFocusTime ?? 0) / 60);
  const tier = getTier(todayMins);
  const cardRef = useRef<HTMLDivElement>(null);

  // Subscribe to auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  // Capture helper: prefers html-to-image, falls back to html2canvas
  const captureCardToBlob = async (): Promise<Blob | null> => {
    if (!cardRef.current) return null;
    // Ensure web fonts are ready to avoid glyph issues
    if ((document as any).fonts?.ready) {
      try { await (document as any).fonts.ready; } catch {}
    }
    const node = cardRef.current;

    // Try html-to-image first (often better with gradients/filters)
    try {
      const hti = await import('html-to-image');
      const dataUrl = await hti.toPng(node, {
        backgroundColor: '#0b1020',
        pixelRatio: Math.min(3, (window.devicePixelRatio || 1) * 2),
        cacheBust: true,
        includeQueryParams: true,
        canvasWidth: node.scrollWidth,
      });
      const res = await fetch(dataUrl);
      return await res.blob();
    } catch (e) {
      console.warn('html-to-image failed, falling back to html2canvas', e);
    }

    // Fallback to html2canvas
    try {
      const html2canvas = (await import('html2canvas')).default;
      const scale = Math.min(3, (window.devicePixelRatio || 1) * 2);
      const canvas = await html2canvas(node, {
        backgroundColor: '#0b1020',
        scale,
        useCORS: true,
        logging: false,
      });
      return await new Promise((resolve) => canvas.toBlob((b) => resolve(b), 'image/png'));
    } catch (e) {
      console.warn('html2canvas capture failed', e);
      return null;
    }
  };

  const handleDownloadImage = async () => {
    try {
      setBusy(true);
      setExporting(true);
      // allow DOM to update styles for export
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      const blob = await captureCardToBlob();
      if (!blob) throw new Error('capture failed');
      const data = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = data;
      a.download = `StudyTracker_Achievement_${new Date().toISOString().slice(0,10)}.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(data), 3000);
    } catch (e) {
      alert('Could not generate the image. Please try again on a different browser or take a system screenshot.');
      console.warn(e);
    } finally {
      setExporting(false);
      setBusy(false);
    }
  };

  const handleShare = async () => {
    const shareText = `I studied ${todayMins} minutes today on StudyTracker! 🚀`;
    const shareUrl = `${window.location.origin}/achievements`;
    try {
      setBusy(true);
      // Prefer native file share if available (Android Chrome)
      if ((navigator as any).canShare) {
        setExporting(true);
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
        const blob: Blob | null = await captureCardToBlob();
        if (blob) {
          const file = new File([blob], 'achievement.png', { type: 'image/png' });
          if ((navigator as any).canShare({ files: [file] })) {
            // Try files-only first (WhatsApp is more reliable with this)
            try {
              await (navigator as any).share({ files: [file] });
              return;
            } catch (err) {
              // Fallback to including text as some targets require it
              try {
                await (navigator as any).share({ files: [file], title: 'My StudyTracker Achievement', text: shareText });
                return;
              } catch {}
            }
          }
        }
      }

      // If we reach here, image share via Web Share API isn't supported.
      // Capture and download the image first, then open WhatsApp with text so user can attach the downloaded image.
      setExporting(true);
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      const blob = await captureCardToBlob();
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'achievement.png'; a.click();
        setTimeout(() => URL.revokeObjectURL(url), 3000);
      }

      const waHref = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`;
      const waLink = document.createElement('a');
      waLink.href = waHref;
      waLink.target = '_blank';
      waLink.rel = 'noopener noreferrer';
      document.body.appendChild(waLink);
      waLink.click();
      document.body.removeChild(waLink);
    } catch (e) {
      console.warn('Share failed, falling back to download', e);
      await handleDownloadImage();
    } finally {
      setExporting(false);
      setBusy(false);
    }
  };

  // Show login CTA for guests
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-gray-900 to-purple-950 py-8 sm:py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-start mb-6">
            <button onClick={() => navigate('/')} className="inline-flex items-center gap-2 text-gray-300 hover:text-white">
              <Home className="h-5 w-5" />
            </button>
          </div>
          <div className="relative overflow-hidden rounded-3xl border border-white/10 ring-1 ring-black/40 shadow-2xl p-6 sm:p-12 text-center bg-gradient-to-br from-gray-900/60 to-gray-900/20">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-500/10 text-yellow-300 ring-1 ring-yellow-500/30">
              <Sparkles className="h-4 w-4" /> Achievements
            </div>
            <h1 className="mt-3 text-2xl sm:text-4xl font-black text-white">Login to see today's achievement</h1>
            <p className="mt-2 text-gray-300 max-w-xl mx-auto text-sm">Sign in to sync your focus stats, unlock milestones, and share your daily achievement card.</p>
            <div className="mt-6 sm:mt-8 flex items-center justify-center">
              <button
                onClick={() => navigate('/login')}
                className="inline-flex items-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 text-white font-semibold shadow-lg shadow-orange-500/30"
              >
                Go to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-gray-900 to-purple-950 py-8 sm:py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-start mb-6">
          <button onClick={() => navigate('/')} className="inline-flex items-center gap-2 text-gray-300 hover:text-white">
            <Home className="h-5 w-5" />
          </button>
        </div>

        {/* Hero Card to screenshot */}
        <div ref={cardRef} className="relative overflow-hidden rounded-3xl border border-white/10 ring-1 ring-black/40 shadow-2xl p-6 sm:p-12 text-center bg-gradient-to-br from-gray-900/60 to-gray-900/20">
          {!exporting && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute -top-24 -left-16 w-72 h-72 bg-fuchsia-500/25 blur-[80px] rounded-full" />
              <div className="absolute -bottom-24 -right-16 w-80 h-80 bg-sky-500/25 blur-[90px] rounded-full" />
              <div className="absolute inset-0 opacity-20 [mask-image:linear-gradient(to_bottom,white,transparent)] bg-[linear-gradient(to_right,rgba(255,255,255,0.15)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.15)_1px,transparent_1px)] bg-[size:22px_22px]" />
            </div>
          )}

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/30">
            <Sparkles className="h-4 w-4" /> Daily Achievement
          </div>

          <h1 className="mt-3 text-3xl sm:text-5xl font-black text-white">
            You studied
            <span className="block mt-2 text-white">
              {todayMins} minutes today
            </span>
          </h1>
          <p className="mt-2 sm:mt-3 text-gray-300 text-sm">That's {Math.floor(todayMins/60)}h {todayMins%60}m of focused work. Be proud of your commitment.</p>

          <div className={`mt-6 sm:mt-8 mx-auto max-w-md rounded-2xl border border-white/10 p-4 sm:p-5 bg-gradient-to-r ${tier.color} text-gray-900`}>
            <div className="flex items-center justify-center gap-3">
              <span className="text-3xl" aria-hidden>{tier.emoji}</span>
              <div>
                <div className="text-lg sm:text-2xl font-extrabold tracking-wide">{tier.title}</div>
                <div className="text-xs sm:text-sm opacity-90">{tier.sub}</div>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-gray-700 bg-gray-900/50 p-5 text-left">
              <div className="text-gray-400 text-sm">Sessions</div>
              <div className="mt-1 text-2xl font-bold text-white">{stats.totalSessions}</div>
            </div>
            <div className="rounded-2xl border border-gray-700 bg-gray-900/50 p-5 text-left">
              <div className="text-gray-400 text-sm">Current Streak</div>
              <div className="mt-1 text-2xl font-bold text-white">{stats.currentStreak} days</div>
            </div>
            <div className="rounded-2xl border border-gray-700 bg-gray-900/50 p-5 text-left">
              <div className="text-gray-400 text-sm">Longest Streak</div>
              <div className="mt-1 text-2xl font-bold text-white">{stats.longestStreak} days</div>
            </div>
          </div>

          {/* Badges */}
          <div className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            <span className="inline-flex h-9 items-center gap-2 px-4 rounded-full bg-white/10 text-white border border-white/10 text-sm font-medium"><Trophy className="h-4 w-4"/> Daily Winner</span>
            <span className="inline-flex h-9 items-center gap-2 px-4 rounded-full bg-white/10 text-white border border-white/10 text-sm font-medium"><Crown className="h-4 w-4"/> Consistency</span>
            <span className="inline-flex h-9 items-center gap-2 px-4 rounded-full bg-white/10 text-white border border-white/10 text-sm font-medium"><Star className="h-4 w-4"/> Focus Ninja</span>
          </div>
        </div>

        {/* CTA row */}
        <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button onClick={handleShare} disabled={busy} className="inline-flex items-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 text-white font-semibold shadow-lg shadow-orange-500/30 disabled:opacity-70">
            <Share2 className="h-5 w-5" /> Share achievement
          </button>
          <button onClick={handleDownloadImage} disabled={busy} className="inline-flex items-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl bg-white/10 text-white border border-white/15 hover:bg-white/15">
            <Download className="h-5 w-5" /> Download image
          </button>
        </div>

        <p className="mt-3 sm:mt-4 text-center text-gray-400 text-xs sm:text-sm">Tip: If sharing doesn't open, we'll download the image instead.</p>
      </div>
    </div>
  );
};

export default AchievementsPage;
