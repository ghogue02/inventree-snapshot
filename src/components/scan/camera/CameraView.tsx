import React from "react";
import { Loader2, Camera, Scan, AlertTriangle, Wifi, WifiOff } from "lucide-react";
import { useOfflineStore } from "@/stores/offlineStore";

interface CameraViewProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  isCapturing: boolean;
  isLoading: boolean;
  cameraError: string | null;
  scanMode: 'single' | 'shelf';
  toggleFlash: (e: React.MouseEvent) => void;
  onContainerTap?: () => void;
}

const CameraView = ({
  videoRef,
  isCapturing,
  isLoading,
  cameraError,
  scanMode,
  toggleFlash,
  onContainerTap
}: CameraViewProps) => {
  const connectionStatus = useOfflineStore(state => state.connectionStatus);

  // Show error state
  if (cameraError) {
    return (
      <div className="flex items-center justify-center h-full bg-black">
        <div className="text-center p-4">
          <AlertTriangle className="mx-auto h-12 w-12 text-amber-500 mb-2" />
          <p className="text-white">{cameraError}</p>
        </div>
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-black">
        <div className="text-center p-4">
          <Loader2 className="mx-auto h-12 w-12 text-white animate-spin mb-2" />
          <p className="text-white">Initializing camera...</p>
        </div>
      </div>
    );
  }

  // Show inactive state
  if (!isCapturing) {
    return (
      <div className="flex items-center justify-center h-full bg-black">
        <div className="text-center p-4">
          <div className="text-white mb-4">
            {scanMode === 'single' ? (
              <Camera className="mx-auto h-12 w-12" />
            ) : (
              <Scan className="mx-auto h-12 w-12" />
            )}
          </div>
          <p className="text-white">
            {scanMode === 'single' 
              ? 'Tap to capture a single item' 
              : 'Tap to scan multiple items'}
          </p>
        </div>
      </div>
    );
  }

  // Active camera view
  return (
    <div 
      className="relative w-full h-full bg-black"
      onClick={onContainerTap}
      role="button"
      aria-label="Tap to capture"
      tabIndex={0}
    >
      {/* Main video element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full"
        style={{
          objectFit: 'cover',
          transform: 'scaleX(-1)' // Mirror the video for selfie-style view
        }}
      />

      {/* Connection status indicator */}
      {connectionStatus === 'offline' && (
        <div className="absolute top-4 right-4 bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-sm flex items-center gap-1">
          <WifiOff size={14} />
          <span>Offline</span>
        </div>
      )}
    </div>
  );
};

export default CameraView;
