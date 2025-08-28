
import React from 'react';
import { motion } from 'framer-motion';
import { Camera, Eye, EyeOff, AlertCircle } from 'lucide-react';

interface WebcamViewProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef?: React.RefObject<HTMLCanvasElement>;
  faceDetectionState: {
    isDetecting: boolean;
    faceDetected: boolean;
    confidence: number;
    lastDetection: Date;
  };
  webcamEnabled: boolean;
  onToggleWebcam: () => void | Promise<void>;
  webcamError?: string | null;
  isStarting?: boolean;
}

const WebcamView: React.FC<WebcamViewProps> = ({
  videoRef,
  canvasRef,
  faceDetectionState,
  webcamEnabled,
  onToggleWebcam,
  webcamError,
  isStarting,
}) => {
  const getStatusColor = (): string => {
    if (faceDetectionState.isDetecting) {
      return faceDetectionState.faceDetected
        ? 'text-success-600 dark:text-success-400'
        : 'text-red-600 dark:text-red-400';
    }
    return 'text-gray-600 dark:text-gray-300';
  };

  const getStatusText = (): string => {
    if (!faceDetectionState.isDetecting) {
      return 'Initializing...';
    }
    return faceDetectionState.faceDetected ? 'Face Detected' : 'No Face Detected';
  };

  const getStatusIcon = () => {
    if (!faceDetectionState.isDetecting) {
      return <Camera className="h-5 w-5" />;
    }
    return faceDetectionState.faceDetected ? (
      <Eye className="h-5 w-5" />
    ) : (
      <EyeOff className="h-5 w-5" />
    );
  };

  return (
    <div className="space-y-3 sm:space-y-4">

      {/* Webcam Container */}
      <div className="relative bg-gray-900 rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          className="w-full h-52 sm:h-72 md:h-96 lg:h-[28rem] object-cover transform scale-x-[-1]"
          autoPlay
          muted
          playsInline
        />
        
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full transform scale-x-[-1]"
          style={{ pointerEvents: 'none' }}
        />

        {/* Starting Overlay */}
        {isStarting && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <div className="flex items-center gap-3 text-white">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
              <span className="font-medium">Starting webcam…</span>
            </div>
          </div>
        )}

        {/* Detection Overlay removed as requested */}

        {/* Away Warning */}
      </div>

      {/* Centered Start/Stop button below video */}
      <div className="text-center">
        <button
          onClick={onToggleWebcam}
          disabled={!!isStarting}
          className={`px-3 py-2 sm:px-4 sm:py-2 rounded-md text-sm sm:text-base font-medium inline-flex items-center gap-2 transition-colors
            ${webcamEnabled ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-success-600 text-white hover:bg-success-700'}
            ${isStarting ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          <Camera className="h-4 w-4" />
          <span>{webcamEnabled ? 'Stop Webcam' : (isStarting ? 'Starting…' : 'Start Webcam')}</span>
        </button>
      </div>

      {/* Rules at the bottom (all screens) */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 sm:p-4">
        <p className="font-medium text-xs sm:text-sm mb-1">Rules</p>
        <ul className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 space-y-1">
          <li>• Keep your face in view for accurate tracking</li>
          <li>• Ensure decent lighting and sit facing the camera</li>
          <li>• Start/Stop the webcam anytime using the button above</li>
          <li>• Click End Session to save your progress</li>
        </ul>
      </div>
    </div>
  );
};

export default WebcamView;
