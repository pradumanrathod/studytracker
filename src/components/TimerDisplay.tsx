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
}

const TimerDisplay: React.FC<TimerDisplayProps> = ({
  timerState,
  currentSession,
  onStart,
  onPause,
  onResume,
  onEnd,
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
        return 'text-success-600';
      case 'paused':
        return 'text-warning-600';
      case 'break':
        return 'text-primary-600';
      default:
        return 'text-gray-600';
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
        return 'bg-success-100 text-success-800';
      case 'paused':
        return 'bg-warning-100 text-warning-800';
      case 'break':
        return 'bg-primary-100 text-primary-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="text-center space-y-4 sm:space-y-6">
      {/* Status Badge */}
      <div className="flex justify-center">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor()}`}>
          {getStatusText()}
        </span>
      </div>

      {/* Timer Display */}
      <div className="space-y-2">
        <motion.div
          key={currentSession?.duration || 0}
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          className={`text-4xl sm:text-5xl md:text-6xl font-mono font-bold ${getTimerColor()}`}
        >
          {formatTime(currentSession?.duration || 0)}
        </motion.div>
        
        {currentSession && (
          <div className="text-xs sm:text-sm text-gray-500">
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
            className="btn-primary flex items-center space-x-2"
          >
            <Play className="h-5 w-5" />
            <span>Start Focus</span>
          </motion.button>
        )}

        {timerState === 'running' && (
          <>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onPause}
              className="btn-secondary flex items-center space-x-2 rounded-lg px-4"
            >
              <Pause className="h-5 w-5" />
              <span>Pause</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onEnd}
              className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center space-x-2"
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
              className="btn-primary flex items-center space-x-2"
            >
              <Play className="h-5 w-5" />
              <span>Resume</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onEnd}
              className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center space-x-2"
            >
              <Square className="h-5 w-5" />
              <span>End</span>
            </motion.button>
          </>
        )}
      </div>

      {/* Session Info */}
      {currentSession && (
        <div className="bg-gray-50 rounded-lg p-3 sm:p-4 space-y-2">
          <div className="flex justify-between text-xs sm:text-sm">
            <span className="text-gray-600">Session Duration:</span>
            <span className="font-medium text-gray-600">{formatTime(currentSession.duration)}</span>
          </div>
          
          {currentSession.breaks.length > 0 && (
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-gray-600">Breaks Taken:</span>
              <span className="font-medium">{currentSession.breaks.length}</span>
            </div>
          )}
          
          <div className="flex justify-between text-xs sm:text-sm">
            <span className="text-gray-600">Face Detected:</span>
            <span className={`font-medium ${currentSession.faceDetected ? 'text-success-600' : 'text-red-600'}`}>
              {currentSession.faceDetected ? 'Yes' : 'No'}
            </span>
          </div>
        </div>
      )}
    </div>
    
  );
};

export default TimerDisplay;
