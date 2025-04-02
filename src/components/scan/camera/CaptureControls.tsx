
import React from "react";
import { Button } from "@/components/ui/button";
import { Camera, Loader2, RefreshCw, Scan } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface CaptureControlsProps {
  isCapturing: boolean;
  isLoading: boolean;
  capturedImage: string | null;
  cameraError: string | null;
  scanMode: 'single' | 'shelf';
  onStartCamera: () => void;
  onCaptureImage: () => void;
}

const CaptureControls = ({
  isCapturing,
  isLoading,
  capturedImage,
  cameraError,
  scanMode,
  onStartCamera,
  onCaptureImage
}: CaptureControlsProps) => {
  const isMobile = useIsMobile();

  if (isLoading) {
    return (
      <Button disabled className="opacity-50">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Starting Camera...
      </Button>
    );
  }

  if (isCapturing && !capturedImage) {
    return (
      <Button 
        onClick={onCaptureImage} 
        size={isMobile ? "lg" : "default"}
        className={`${isMobile ? "fixed bottom-6 left-1/2 transform -translate-x-1/2 z-10 rounded-full h-16 w-16 shadow-lg p-0 flex items-center justify-center" : ""}`}
      >
        {isMobile ? (
          <div className="rounded-full h-12 w-12 border-4 border-white"></div>
        ) : (
          <>
            {scanMode === 'shelf' ? (
              <>
                <Scan className="mr-2 h-4 w-4" />
                Scan Shelf
              </>
            ) : (
              <>
                <Camera className="mr-2 h-4 w-4" />
                Capture Item
              </>
            )}
          </>
        )}
      </Button>
    );
  }

  if (!isCapturing && !capturedImage) {
    return (
      <Button 
        onClick={onStartCamera} 
        className={`${cameraError ? "bg-amber-600 hover:bg-amber-700" : ""} w-full sm:w-auto`}
        size={isMobile ? "lg" : "default"}
        disabled={isLoading}
      >
        {cameraError ? (
          <>
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </>
        ) : (
          <>
            <Camera className="mr-2 h-4 w-4" />
            Start Camera
          </>
        )}
      </Button>
    );
  }

  // Return null if none of the conditions match
  return null;
};

export default CaptureControls;
