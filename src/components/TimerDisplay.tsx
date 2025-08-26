import React from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Square, RotateCcw } from 'lucide-react';
import { TimerState, StudySession } from '../types';
import { timerService } from '../services/timerService';

interface TimerDisplayProps {
  timerState: TimerState;
  currentSession: StudySession | null;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onEnd: () => void;
  isStarting?: boolean;
}

const TimerDisplay: React.FC<TimerDisplayProps> = ({
  timerState,
  currentSession,
  onStart,
  onPause,
  onResume,
  onEnd,
  isStarting,
}) => {
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = (): string => {
    switch (timerState) {
      case 'running':
        return 'text-emerald-400';
      case 'paused':
        return 'text-amber-400';
      case 'break':
        return 'text-sky-400';
      default:
        return 'text-gray-300';
    }
  };

  const getStatusText = (): string => {
    switch (timerState) {
      case 'running':
        return 'Focusing...';
      case 'paused':
        return 'Paused';
      case 'break':
        return 'On Break';
      default:
        return 'Ready to Focus';
    }
  };

  const getStatusColor = (): string => {
    switch (timerState) {
      case 'running':
        return 'bg-emerald-500/15 text-emerald-300 ring-1 ring-inset ring-emerald-500/20';
      case 'paused':
        return 'bg-amber-500/15 text-amber-300 ring-1 ring-inset ring-amber-500/20';
      case 'break':
        return 'bg-sky-500/15 text-sky-300 ring-1 ring-inset ring-sky-500/20';
      default:
        return 'bg-gray-700/40 text-gray-300 ring-1 ring-inset ring-gray-600/30';
    }
  };

  return (
    <div className="text-center space-y-5 sm:space-y-7">
      {/* Status Badge */}
      <div className="flex justify-center">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium shadow-sm ${getStatusColor()}`}>
          {getStatusText()}
        </span>
      </div>

      {/* Timer Display */}
      <div className="space-y-3">
        <motion.div
          key={currentSession?.duration || 0}
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          className={`text-5xl sm:text-6xl md:text-7xl font-mono font-bold drop-shadow-xl ${getTimerColor()}`}
        >
          {formatTime(currentSession?.duration || 0)}
        </motion.div>
        
        {currentSession && (
          <div className="text-xs sm:text-sm text-gray-400">
            Started at {currentSession.startTime.toLocaleTimeString()}
          </div>
        )}
      </div>

      {/* Control Buttons */}
      <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
        {timerState === 'idle' && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onStart}
            disabled={!!isStarting}
            className={`inline-flex items-center justify-center space-x-2 rounded-lg px-5 py-2.5 bg-primary-600 hover:bg-primary-500 text-white shadow-md shadow-primary-900/30 transition-colors ${isStarting ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            <Play className="h-5 w-5" />
            <span>{isStarting ? 'Starting…' : 'Start Focus'}</span>
          </motion.button>
        )}

        {timerState === 'running' && (
          <>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onPause}
              className="inline-flex items-center justify-center space-x-2 rounded-lg px-5 py-2.5 bg-gray-700 hover:bg-gray-600 text-gray-100 border border-gray-600 transition-colors"
            >
              <Pause className="h-5 w-5" />
              <span>Pause</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onEnd}
              className="inline-flex items-center justify-center space-x-2 rounded-lg px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-900/20 transition-colors"
            >
              <Square className="h-5 w-5" />
              <span>End</span>
            </motion.button>
          </>
        )}

        {timerState === 'paused' && (
          <>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onResume}
              className="inline-flex items-center justify-center space-x-2 rounded-lg px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-900/20 transition-colors"
            >
              <Play className="h-5 w-5" />
              <span>Resume</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onEnd}
              className="inline-flex items-center justify-center space-x-2 rounded-lg px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-900/20 transition-colors"
            >
              <Square className="h-5 w-5" />
              <span>End</span>
            </motion.button>
          </>
        )}
      </div>

      {/* Session Info */}
      {currentSession && (
        <div className="rounded-lg p-3 sm:p-4 space-y-2 bg-gray-900/60 border border-gray-700 backdrop-blur">
          <div className="flex justify-between text-xs sm:text-sm">
            <span className="text-gray-400">Session Duration:</span>
            <span className="font-medium text-gray-200">{formatTime(currentSession.duration)}</span>
          </div>
          
          {currentSession.breaks.length > 0 && (
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-gray-400">Breaks Taken:</span>
              <span className="font-medium text-gray-200">{currentSession.breaks.length}</span>
            </div>
          )}
          
          <div className="flex justify-between text-xs sm:text-sm">
            <span className="text-gray-400">Face Detected:</span>
            <span className={`font-medium ${currentSession.faceDetected ? 'text-emerald-400' : 'text-red-400'}`}>
              {currentSession.faceDetected ? 'Yes' : 'No'}
            </span>
          </div>
        </div>
      )}
    </div>
    
  );
};

export default TimerDisplay;
