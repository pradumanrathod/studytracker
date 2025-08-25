
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Face Detection</h3>
        <div className="flex items-center gap-3">
          <div className={`flex items-center space-x-2 ${getStatusColor()}`}>
            {getStatusIcon()}
            <span className="text-sm font-medium">{getStatusText()}</span>
          </div>
          <button
            onClick={onToggleWebcam}
            disabled={!!isStarting}
            className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-colors
              ${webcamEnabled ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-success-600 text-white hover:bg-success-700'}
              ${isStarting ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            <Camera className="h-4 w-4" />
            {webcamEnabled ? 'Stop Webcam' : (isStarting ? 'Starting…' : 'Start Webcam')}
          </button>
        </div>
      </div>

      {/* Webcam Container */}
      <div className="relative bg-gray-900 rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          className="w-full h-64 sm:h-80 md:h-96 lg:h-[28rem] object-cover transform scale-x-[-1]"
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

        {/* Detection Overlay */}
        {faceDetectionState.isDetecting && (
          <div className="absolute top-4 right-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${
                faceDetectionState.faceDetected
                  ? 'bg-success-100 text-success-800 dark:bg-success-900/40 dark:text-success-200'
                  : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200'
              }`}
            >
              {faceDetectionState.faceDetected ? (
                <Eye className="h-4 w-4" />
              ) : (
                <EyeOff className="h-4 w-4" />
              )}
              <span>
                {faceDetectionState.faceDetected
                  ? `${Math.round(faceDetectionState.confidence * 100)}%`
                  : 'Away'}
              </span>
            </motion.div>
          </div>
        )}

        {/* Away Warning */}
      </div>

      {/* Detection Info */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 sm:p-4 space-y-3">
        {webcamError && (
          <div className="flex items-start gap-2 p-2 rounded border border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-200 text-sm">
            <AlertCircle className="h-4 w-4 mt-0.5" />
            <span>{webcamError}</span>
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
          <div>
            <span className="text-gray-600 dark:text-gray-300">Detection Status:</span>
            <div className="font-medium text-gray-900 dark:text-gray-100">
              {faceDetectionState.isDetecting ? 'Active' : 'Inactive'}
            </div>
          </div>
          
          <div>
            <span className="text-gray-600 dark:text-gray-300">Confidence:</span>
            <div className="font-medium text-gray-900 dark:text-gray-100">
              {faceDetectionState.isDetecting
                ? `${Math.round(faceDetectionState.confidence * 100)}%`
                : 'N/A'}
            </div>
          </div>
          
          <div>
            <span className="text-gray-600 dark:text-gray-300">Last Detection:</span>
            <div className="font-medium text-gray-900 dark:text-gray-100">
              {faceDetectionState.isDetecting
                ? faceDetectionState.lastDetection.toLocaleTimeString()
                : 'N/A'}
            </div>
          </div>
          
          <div>
            <span className="text-gray-600 dark:text-gray-300">Face Present:</span>
            <div className={`font-medium ${
              faceDetectionState.faceDetected
                ? 'text-success-600 dark:text-success-400'
                : 'text-red-600 dark:text-red-400'
            }`}>
              {faceDetectionState.faceDetected ? 'Yes' : 'No'}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="text-xs text-gray-500 dark:text-gray-300 bg-white dark:bg-gray-800 rounded p-3 border dark:border-gray-700">
          <p className="font-medium mb-1">How it works:</p>
          <ul className="space-y-1">
            <li>• Position yourself in front of the camera</li>
            <li>• The app will automatically detect when you're present</li>
            <li>• Sessions can auto-start when you're detected</li>
            <li>• Sessions pause when you leave your desk</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default WebcamView;
