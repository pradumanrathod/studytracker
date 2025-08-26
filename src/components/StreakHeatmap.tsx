import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface SessionLike {
  id?: string;
  duration: number; // seconds
  startTime: Date | string;
}

interface StreakHeatmapProps {
  sessions: SessionLike[];
  months?: number; // how many past months to show
  minSecondsForActiveDay?: number;
}

function toDayKey(d: Date): string {
  const nd = new Date(d);
  nd.setHours(0, 0, 0, 0);
  return nd.toISOString();
}

function addDays(d: Date, n: number): Date {
  const nd = new Date(d);
  nd.setDate(nd.getDate() + n);
  return nd;
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function endOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

const GREEN_SCALE_DARK = [
  "#374151", // empty (dark gray)
  "#14532d",
  "#166534",
  "#15803d",
  "#16a34a",
];

const GREEN_SCALE_LIGHT = [
  "#374151", // empty (dark gray)
  "#bbf7d0",
  "#86efac",
  "#4ade80",
  "#22c55e",
];

const CELL_SIZE = 18;
const CELL_GAP = 6;

const StreakHeatmap: React.FC<StreakHeatmapProps> = ({
  sessions,
  months = 1,
  minSecondsForActiveDay = 60,
}) => {
  const [offset, setOffset] = useState(0); // 0 = current month, 1 = previous month (older), -1 = next month (newer)
  const [gridWidth, setGridWidth] = useState(0);
  const gridWrapperRef = useRef<HTMLDivElement | null>(null);
  // Build data grouped by day
  const totals = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of sessions) {
      const d = new Date(s.startTime as any);
      const key = toDayKey(d);
      map.set(key, (map.get(key) || 0) + (s.duration || 0));
    }
    return map;
  }, [sessions]);

  const isDark =
    typeof window !== "undefined" &&
    document.documentElement.classList.contains("dark");
  const scale = isDark ? GREEN_SCALE_DARK : GREEN_SCALE_LIGHT;

  const levelFor = (seconds: number) => {
    if (seconds < minSecondsForActiveDay) return 0;
    const mins = seconds / 60;
    if (mins >= 90) return 4;
    if (mins >= 45) return 3;
    if (mins >= 20) return 2;
    return 1;
  };

  const formatDateOnly = (date: Date) =>
    date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

  // Determine navigation bounds based on first session month and current month
  const firstSessionDate = useMemo(() => {
    if (!sessions?.length) return null;
    let min = new Date(sessions[0].startTime as any);
    for (const s of sessions) {
      const d = new Date(s.startTime as any);
      if (d < min) min = d;
    }
    return new Date(min.getFullYear(), min.getMonth(), 1);
  }, [sessions]);

  const currentMonthStart = useMemo(() => {
    const t = new Date();
    return new Date(t.getFullYear(), t.getMonth(), 1);
  }, []);

  const monthsBetween = (from: Date, to: Date) =>
    (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());

  const maxPastOffset = useMemo(() => {
    if (!firstSessionDate) return 0; // no sessions -> only current month
    const diff = monthsBetween(firstSessionDate, currentMonthStart);
    return Math.max(0, diff);
  }, [firstSessionDate, currentMonthStart]);

  // Clamp offset within bounds [0, maxPastOffset]
  const safeSetOffset = (next: number) => {
    const clamped = Math.min(Math.max(next, 0), maxPastOffset);
    setOffset(clamped);
  };

  useEffect(() => {
    const handle = () => {
      if (gridWrapperRef.current) {
        setGridWidth(gridWrapperRef.current.clientWidth);
      }
    };
    handle();
    window.addEventListener("resize", handle);
    return () => window.removeEventListener("resize", handle);
  }, []);

  // Build array of months to render (only one month)
  const today = new Date();
  const monthsToRender: { start: Date; end: Date; label: string }[] = [];
  for (let i = 0; i < months; i++) {
    const d = new Date(today.getFullYear(), today.getMonth() - (i + offset), 1);
    monthsToRender.unshift({
      start: startOfMonth(d),
      end: endOfMonth(d),
      label: d.toLocaleString("default", { month: "short", year: "numeric" }),
    });
  }

  return (
    <div className="card p-4 mt-4 min-h-[260px]">
      {/* Header with centered month and arrows on both sides */}
      <div className="grid grid-cols-3 items-center mb-3">
        <div className="flex justify-start">
          <button
            onClick={() => safeSetOffset(offset + 1)}
            className={`p-1 rounded hover:bg-gray-700/60 ${offset >= maxPastOffset ? 'opacity-40 pointer-events-none' : ''}`}
            title="Previous month"
          >
            <ChevronLeft size={18} />
          </button>
        </div>
        <div className="flex justify-center">
          <h3 className="text-sm font-semibold text-white">
            {monthsToRender[0]?.label}
          </h3>
        </div>
        <div className="flex justify-end">
          <button
            onClick={() => safeSetOffset(offset - 1)}
            className={`p-1 rounded hover:bg-gray-700/60 ${offset <= 0 ? 'opacity-40 pointer-events-none' : ''}`}
            title="Next month"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="flex gap-4 overflow-hidden" ref={gridWrapperRef}>
        {monthsToRender.map(({ start, end, label }) => {
          const days: Date[] = [];
          const d = new Date(start);
          while (d <= end) {
            days.push(new Date(d));
            d.setDate(d.getDate() + 1);
          }

          // Only render valid days; compute columns by packing 7 rows per column
          const cols = Math.ceil(days.length / 7);
          const gap = CELL_GAP;
          const computedSize = gridWidth > 0 && cols > 0
            ? Math.floor((gridWidth - (cols - 1) * gap) / cols)
            : CELL_SIZE;
          // increase a bit compared to previous setting
          const cellSize = Math.min(computedSize, 20);

          // Compute stats for this visible month
          const isActive = (d: Date) => (totals.get(toDayKey(d)) || 0) >= minSecondsForActiveDay;
          let maxStreak = 0;
          let cur = 0;
          for (let i = 0; i < days.length; i++) {
            if (isActive(days[i])) {
              cur += 1;
              if (cur > maxStreak) maxStreak = cur;
            } else {
              cur = 0;
            }
          }
          const activeDaysCount = days.reduce((acc, d) => acc + (isActive(d) ? 1 : 0), 0);

          return (
            <div key={label} className="w-full flex justify-center">
              <div className="flex items-start gap-6">
                {/* Grid */}
                <div className="flex justify-center">
                  <div
                    className="grid"
                    style={{
                      gridTemplateRows: `repeat(7, ${cellSize}px)`,
                      gridAutoFlow: "column",
                      gap,
                    }}
                  >
                    {days.map((day) => {
                      const key = toDayKey(day);
                      const seconds = totals.get(key) || 0;
                      const level = levelFor(seconds);
                      return (
                        <div
                          key={key}
                          className="rounded-[2px]"
                          style={{
                            width: cellSize,
                            height: cellSize,
                            backgroundColor: scale[level],
                          }}
                          title={formatDateOnly(day)}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Right-side stats */}
                <div className="shrink-0 flex flex-col gap-2 text-sm">
                  <div className="bg-gray-800/50 rounded-md px-3 py-2">
                    <div className="text-gray-400">Max streak</div>
                    <div className="text-white font-semibold text-base">{maxStreak} days</div>
                  </div>
                  <div className="bg-gray-800/50 rounded-md px-3 py-2">
                    <div className="text-gray-400">Active days</div>
                    <div className="text-white font-semibold text-base">{activeDaysCount}</div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
;

export default StreakHeatmap;
