import React from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  Award, 
  Star, 
  Target, 
  Clock, 
  Zap, 
  Calendar,
  CheckCircle,
  Circle
} from 'lucide-react';
import { UserStats, Milestone } from '../types';

interface MilestonesPanelProps {
  stats: UserStats;
}

const MilestonesPanel: React.FC<MilestonesPanelProps> = ({ stats }) => {
  const milestones: Milestone[] = [
    // Time-based milestones
    {
      id: 'first-hour',
      title: 'First Hour',
      description: 'Complete your first hour of focused work',
      type: 'time',
      threshold: 60 * 60,
      achieved: stats.totalFocusTime >= 60 * 60,
      icon: 'clock',
    },
    {
      id: 'five-hours',
      title: 'Five Hour Warrior',
      description: 'Accumulate 5 hours of focus time',
      type: 'time',
      threshold: 5 * 60 * 60,
      achieved: stats.totalFocusTime >= 5 * 60 * 60,
      icon: 'target',
    },
    {
      id: 'ten-hours',
      title: 'Dedicated Learner',
      description: 'Reach 10 hours of total focus time',
      type: 'time',
      threshold: 10 * 60 * 60,
      achieved: stats.totalFocusTime >= 10 * 60 * 60,
      icon: 'award',
    },
    {
      id: 'twenty-five-hours',
      title: 'Focus Master',
      description: 'Achieve 25 hours of focused work',
      type: 'time',
      threshold: 25 * 60 * 60,
      achieved: stats.totalFocusTime >= 25 * 60 * 60,
      icon: 'trophy',
    },
    {
      id: 'fifty-hours',
      title: 'Productivity Champion',
      description: 'Complete 50 hours of focus sessions',
      type: 'time',
      threshold: 50 * 60 * 60,
      achieved: stats.totalFocusTime >= 50 * 60 * 60,
      icon: 'star',
    },

    // Session-based milestones
    {
      id: 'first-session',
      title: 'Getting Started',
      description: 'Complete your first focus session',
      type: 'sessions',
      threshold: 1,
      achieved: stats.totalSessions >= 1,
      icon: 'target',
    },
    {
      id: 'ten-sessions',
      title: 'Consistent Focuser',
      description: 'Complete 10 focus sessions',
      type: 'sessions',
      threshold: 10,
      achieved: stats.totalSessions >= 10,
      icon: 'award',
    },
    {
      id: 'twenty-five-sessions',
      title: 'Session Veteran',
      description: 'Complete 25 focus sessions',
      type: 'sessions',
      threshold: 25,
      achieved: stats.totalSessions >= 25,
      icon: 'trophy',
    },
    {
      id: 'fifty-sessions',
      title: 'Focus Legend',
      description: 'Complete 50 focus sessions',
      type: 'sessions',
      threshold: 50,
      achieved: stats.totalSessions >= 50,
      icon: 'star',
    },

    // Streak-based milestones
    {
      id: 'three-day-streak',
      title: 'Three Day Streak',
      description: 'Maintain focus for 3 consecutive days',
      type: 'streak',
      threshold: 3,
      achieved: stats.longestStreak >= 3,
      icon: 'zap',
    },
    {
      id: 'week-streak',
      title: 'Week Warrior',
      description: 'Maintain focus for 7 consecutive days',
      type: 'streak',
      threshold: 7,
      achieved: stats.longestStreak >= 7,
      icon: 'calendar',
    },
    {
      id: 'two-week-streak',
      title: 'Discipline Master',
      description: 'Maintain focus for 14 consecutive days',
      type: 'streak',
      threshold: 14,
      achieved: stats.longestStreak >= 14,
      icon: 'trophy',
    },
    {
      id: 'month-streak',
      title: 'Monthly Champion',
      description: 'Maintain focus for 30 consecutive days',
      type: 'streak',
      threshold: 30,
      achieved: stats.longestStreak >= 30,
      icon: 'star',
    },
  ];

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'clock': return Clock;
      case 'target': return Target;
      case 'award': return Award;
      case 'trophy': return Trophy;
      case 'star': return Star;
      case 'zap': return Zap;
      case 'calendar': return Calendar;
      default: return Target;
    }
  };

  const getProgress = (milestone: Milestone): number => {
    switch (milestone.type) {
      case 'time':
        return Math.min((stats.totalFocusTime / milestone.threshold) * 100, 100);
      case 'sessions':
        return Math.min((stats.totalSessions / milestone.threshold) * 100, 100);
      case 'streak':
        return Math.min((stats.longestStreak / milestone.threshold) * 100, 100);
      default:
        return 0;
    }
  };

  const getCurrentValue = (milestone: Milestone): string => {
    switch (milestone.type) {
      case 'time':
        const hours = Math.floor(stats.totalFocusTime / 3600);
        const minutes = Math.floor((stats.totalFocusTime % 3600) / 60);
        return `${hours}h ${minutes}m`;
      case 'sessions':
        return `${stats.totalSessions} sessions`;
      case 'streak':
        return `${stats.longestStreak} days`;
      default:
        return '0';
    }
  };

  const getThresholdValue = (milestone: Milestone): string => {
    switch (milestone.type) {
      case 'time':
        const hours = Math.floor(milestone.threshold / 3600);
        const minutes = Math.floor((milestone.threshold % 3600) / 60);
        return `${hours}h ${minutes}m`;
      case 'sessions':
        return `${milestone.threshold} sessions`;
      case 'streak':
        return `${milestone.threshold} days`;
      default:
        return milestone.threshold.toString();
    }
  };

  const achievedMilestones = milestones.filter(m => m.achieved);
  const unachievedMilestones = milestones.filter(m => !m.achieved);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-black dark:text-white mb-4">Milestones & Achievements</h2>

        {/* Summary */}
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg p-4 text-white mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">Achievement Progress</h3>
              <p className="text-yellow-100 text-sm">Unlock your potential</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-white">{achievedMilestones.length}</div>
              <div className="text-yellow-100 text-sm">of {milestones.length} unlocked</div>
            </div>
          </div>
          <div className="mt-4 bg-white bg-opacity-20 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(achievedMilestones.length / milestones.length) * 100}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="bg-white h-2 rounded-full"
            />
          </div>
        </div>

        {/* Achieved */}
        {achievedMilestones.length > 0 && (
          <div className="mb-6">
            <h3 className="text-md font-semibold text-black dark:text-white mb-3">Achieved</h3>
            <div className="space-y-3">
              {achievedMilestones.map((milestone, index) => {
                const Icon = getIcon(milestone.icon);
                return (
                  <motion.div
                    key={milestone.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-green-50 border border-green-200 rounded-lg p-4"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="bg-green-100 p-2 rounded-full">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <Icon className="h-4 w-4 text-green-600" />
                          <h4 className="font-semibold text-green-900">{milestone.title}</h4>
                        </div>
                        <p className="text-sm text-green-700 mt-1">{milestone.description}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* In Progress */}
        <div>
          <h3 className="text-md font-semibold text-black dark:text-white mb-3">In Progress</h3>
          <div className="space-y-3">
            {unachievedMilestones.slice(0, 5).map((milestone, index) => {
              const Icon = getIcon(milestone.icon);
              const progress = getProgress(milestone);
              return (
                <motion.div
                  key={milestone.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-50 border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="bg-gray-200 p-2 rounded-full">
                      <Circle className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <Icon className="h-4 w-4 text-gray-600" />
                        <h4 className="font-semibold text-gray-900">{milestone.title}</h4>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium text-gray-900">
                        {getCurrentValue(milestone)} / {getThresholdValue(milestone)}
                      </span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="bg-indigo-500 h-2 rounded-full"
                      />
                    </div>
                    <div className="text-xs text-gray-500 text-right">
                      {Math.round(progress)}% complete
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
          {unachievedMilestones.length > 5 && (
            <div className="text-center mt-4">
              <p className="text-sm text-gray-500">
                +{unachievedMilestones.length - 5} more milestones to unlock
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MilestonesPanel;
