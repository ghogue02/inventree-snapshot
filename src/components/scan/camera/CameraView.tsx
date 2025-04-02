import React from "react";
import { Loader2, Camera, Scan, AlertTriangle, Wifi, WifiOff } from "lucide-react";
import ScanFrame from "./ScanFrame";
import FlashButton from "./FlashButton";
import { useIsMobile } from "@/hooks/use-mobile";
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
  const isMobile = useIsMobile();
  const connectionStatus = useOfflineStore(state => state.connectionStatus);
  
  if (cameraError) {
    return (
      <div className="text-center p-4">
        <AlertTriangle className="mx-auto h-12 w-12 text-amber-500 mb-2" />
        <p className="text-muted-foreground">{cameraError}</p>
      </div>
    );
  }
  
  if (!isCapturing && !isLoading) {
    return (
      <div className="text-center p-4">
        <p className="text-muted-foreground mb-2">
          {scanMode === 'single' 
            ? 'Capture a single inventory item' 
            : 'Scan multiple items on a shelf'}
        </p>
        {scanMode === 'single' ? (
          <Camera className="mx-auto h-12 w-12 text-muted-foreground" />
        ) : (
          <Scan className="mx-auto h-12 w-12 text-muted-foreground" />
        )}
        {connectionStatus === 'offline' && (
          <div className="mt-4 flex items-center justify-center gap-2 text-amber-500">
            <WifiOff size={16} />
            <span className="text-sm">Offline mode: captures will be processed when online</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div 
      className="relative w-full h-full touch-none bg-black"
      onClick={onContainerTap}
      role="button"
      aria-label="Tap to capture"
      tabIndex={0}
    >
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline
        muted
        className="w-full h-full object-cover bg-black"
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          position: 'absolute',
          top: 0,
          left: 0
        }}
      />
      
      {/* Temporarily comment out overlays for debugging */}
      {/* {isCapturing && <ScanFrame scanMode={scanMode} />} */}
      
      {/* Connection status indicator */}
      {/* {isCapturing && (
        <div className="absolute top-4 right-4 z-10">
          <div className={`px-2 py-1 rounded-full flex items-center gap-1 text-xs font-medium ${
            connectionStatus === 'offline' ? 'bg-amber-100 text-amber-800' : 
            connectionStatus === 'syncing' ? 'bg-blue-100 text-blue-800' : 
            'bg-green-100 text-green-800'
          }`}>
            {connectionStatus === 'offline' ? (
              <>
                <WifiOff size={12} />
                <span>Offline</span>
              </>
            ) : connectionStatus === 'syncing' ? (
              <>
                <Loader2 size={12} className="animate-spin" />
                <span>Syncing</span>
              </>
            ) : (
              <>
                <Wifi size={12} />
                <span>Online</span>
              </>
            )}
          </div>
        </div>
      )} */}

      {/* {isCapturing && (
        <div className="absolute bottom-4 left-4">
          <FlashButton onClick={toggleFlash} />
        </div>
      )} */}
    </div>
  );
};

export default CameraView;
