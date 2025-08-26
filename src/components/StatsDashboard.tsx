import React from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, 
  Calendar, 
  TrendingUp, 
  Target, 
  Award, 
  BarChart3,
  Zap,
  Users
} from 'lucide-react';
import { UserStats } from '../types';
import type { User } from 'firebase/auth';

interface StatsDashboardProps {
  stats: UserStats;
  user?: User | null;
  isLoading?: boolean;
}

const StatsDashboard: React.FC<StatsDashboardProps> = ({ stats, user, isLoading }) => {
  const isDarkMode = true; // Dark-only UI
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getProductivityScore = (): number => {
    // Calculate productivity score based on various factors
    const dailyGoal = 4 * 60 * 60; // 4 hours
    const weeklyGoal = 25 * 60 * 60; // 25 hours
    const streakBonus = Math.min(stats.currentStreak * 10, 50); // Max 50% bonus
    
    const dailyScore = Math.min((stats.todayFocusTime / dailyGoal) * 100, 100);
    const weeklyScore = Math.min((stats.thisWeekFocusTime / weeklyGoal) * 100, 100);
    const averageScore = Math.min((stats.averageSessionLength / (45 * 60)) * 100, 100); // 45 min sessions
    
    return Math.round((dailyScore * 0.4 + weeklyScore * 0.4 + averageScore * 0.2) + streakBonus);
  };

  const statCards = [
    {
      title: 'Today\'s Focus',
      value: formatDuration(stats.todayFocusTime),
      icon: Clock,
      color: 'text-primary-600',
      bgColor: 'bg-primary-50',
    },
    {
      title: 'This Week',
      value: formatDuration(stats.thisWeekFocusTime),
      icon: Calendar,
      color: 'text-success-600',
      bgColor: 'bg-success-50',
    },
    {
      title: 'Current Streak',
      value: `${stats.currentStreak} days`,
      icon: Zap,
      color: 'text-warning-600',
      bgColor: 'bg-warning-50',
    },
    {
      title: 'Total Sessions',
      value: stats.totalSessions.toString(),
      icon: Target,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  const detailStats = [
    {
      label: 'Total Focus Time',
      value: formatTime(stats.totalFocusTime),
      description: 'All-time accumulated focus time',
    },
    {
      label: 'Longest Streak',
      value: `${stats.longestStreak} days`,
      description: 'Your best consecutive day streak',
    },
    {
      label: 'Average Session',
      value: formatDuration(stats.averageSessionLength),
      description: 'Typical session length',
    },
    {
      label: 'This Month',
      value: formatDuration(stats.thisMonthFocusTime),
      description: 'Focus time this month',
    },
  ];

  const productivityScore = getProductivityScore();

  // If user is not logged in, prompt to login instead of showing stats
  if (!user) {
    return (
      <div className={`flex items-center justify-center min-h-[300px] rounded-lg border bg-gray-900/60 border-gray-700 backdrop-blur`}>
        <div className="text-center p-6">
          <BarChart3 className={`text-gray-400 w-10 h-10 mx-auto mb-3`} />
          <h3 className={`text-white text-lg font-semibold mb-1`}>Login to see stats</h3>
          <p className={`text-gray-400`}>Sign in to sync and view your progress, streaks, and detailed analytics.</p>
        </div>
      </div>
    );
  }

  // Loading skeleton while stats are fetched
  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Productivity score skeleton */}
        <div className={`rounded-lg p-4 sm:p-6 bg-gray-900/60 border border-gray-700`}>
          <div className="flex items-center justify-between">
            <div className={`h-5 w-40 rounded bg-gray-700`}></div>
            <div className={`h-8 w-16 rounded bg-gray-700`}></div>
          </div>
          <div className={`mt-4 h-2 w-full rounded-full bg-gray-700`}></div>
        </div>

        {/* Quick stats grid skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={`rounded-lg p-4 bg-gray-900/60 border border-gray-700 backdrop-blur`}>
              <div className="flex items-center space-x-3">
                <div className={`h-6 w-6 rounded bg-gray-700`}></div>
                <div className="flex-1 space-y-2">
                  <div className={`h-3 w-24 rounded bg-gray-700`}></div>
                  <div className={`h-4 w-20 rounded bg-gray-700`}></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Detailed stats skeleton */}
        <div className="space-y-4">
          <div className={`h-5 w-40 rounded bg-gray-700`}></div>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex justify-between items-center py-3 border-b border-transparent">
              <div className={`h-4 w-48 rounded bg-gray-700`}></div>
              <div className={`h-5 w-20 rounded bg-gray-700`}></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className={`text-lg font-semibold mb-4 text-white`}>Your Progress</h2>
        
        {/* Productivity Score */}
        <div className="relative overflow-hidden rounded-lg p-4 sm:p-6 mb-6 border border-gray-700 bg-gradient-to-br from-primary-600/30 via-purple-600/20 to-transparent">
          <div className="pointer-events-none absolute inset-0 opacity-30" style={{background: 'radial-gradient(800px 200px at 0% 0%, rgba(99,102,241,0.25), transparent 60%)'}} />
          <div className="relative text-white">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <div>
                <h3 className="text-lg font-semibold">Productivity Score</h3>
                <p className="text-primary-100/80 text-sm">Based on your focus patterns</p>
              </div>
              <div className="text-center sm:text-right">
                <div className="text-2xl sm:text-3xl font-bold">{productivityScore}%</div>
                <div className="text-primary-100/80 text-sm">
                  {productivityScore >= 80 ? 'Excellent!' : 
                   productivityScore >= 60 ? 'Good!' : 
                   productivityScore >= 40 ? 'Keep going!' : 'Getting started!'}
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4 bg-white/20 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(productivityScore, 100)}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="bg-white h-2 rounded-full"
              />
            </div>
          </div>
        </div>

                 {/* Quick Stats Grid */}
         <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`rounded-lg p-4 bg-gray-900/60 border border-gray-700 backdrop-blur`}
              >
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center">
                    <Icon className={`h-5 w-5 ${stat.color.replace('text-', 'text-')}`} />
                  </div>
                  <div>
                    <div className={`text-sm text-gray-300`}>{stat.title}</div>
                    <div className={`text-lg font-semibold ${stat.color.replace('text-', 'text-')}`}>
                      {stat.value}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Detailed Stats */}
        <div className="space-y-4">
          <h3 className={`text-md font-semibold text-white`}>Detailed Statistics</h3>
          {detailStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex justify-between items-center py-3 border-b border-gray-700 last:border-b-0"
            >
              <div>
                <div className={`font-medium text-white`}>{stat.label}</div>
                <div className={`text-sm text-gray-400`}>{stat.description}</div>
              </div>
              <div className={`text-lg font-semibold text-white`}>
                {stat.value}
              </div>
            </motion.div>
          ))}
        </div>

                 {/* Insights */}
         <div className={`mt-6 rounded-lg p-3 sm:p-4 bg-blue-900/20 border border-blue-700`}>
          <h3 className={`text-md font-semibold mb-2 text-blue-200`}>Insights</h3>
          <div className={`space-y-2 text-xs sm:text-sm text-blue-200`}>
            {stats.currentStreak > 0 && (
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4" />
                <span>You're on a {stats.currentStreak}-day streak! Keep it up!</span>
              </div>
            )}
            
            {stats.averageSessionLength > 45 * 60 && (
              <div className="flex items-center space-x-2">
                <Award className="h-4 w-4" />
                <span>Your average session length is excellent!</span>
              </div>
            )}
            
            {stats.todayFocusTime > 2 * 60 * 60 && (
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4" />
                <span>Great focus today! You've exceeded 2 hours.</span>
              </div>
            )}
            
            {stats.totalSessions > 10 && (
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span>You've completed {stats.totalSessions} focus sessions!</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsDashboard;
