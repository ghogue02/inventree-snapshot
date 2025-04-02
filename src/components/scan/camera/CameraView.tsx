
import React from "react";
import { Loader2, Camera, Scan, AlertTriangle } from "lucide-react";
import ScanFrame from "./ScanFrame";
import FlashButton from "./FlashButton";
import { useIsMobile } from "@/hooks/use-mobile";

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
      </div>
    );
  }
  
  return (
    <div className="relative w-full h-full" onClick={onContainerTap}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/10">
          <div className="bg-white/90 px-4 py-2 rounded-full flex items-center">
            <Loader2 className="animate-spin mr-2 h-5 w-5 text-primary" />
            <span className="text-sm font-medium">Accessing camera...</span>
          </div>
        </div>
      )}
      
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline
        muted
        className={`w-full h-full object-cover rounded-md transition-opacity duration-300 ${isCapturing ? 'opacity-100' : 'opacity-0'}`}
      />
      
      {isCapturing && <ScanFrame scanMode={scanMode} />}
      
      {isCapturing && isMobile && (
        <div className="absolute bottom-4 left-4">
          <FlashButton onClick={(e) => {
            e.stopPropagation();
            toggleFlash(e);
          }} />
        </div>
      )}
    </div>
  );
};

export default CameraView;
