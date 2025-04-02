
import { useRef, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useIsMobile } from "@/hooks/use-mobile";
import { useCamera } from "./camera/useCamera";
import CameraView from "./camera/CameraView";
import CaptureControls from "./camera/CaptureControls";
import CapturedImageView from "./camera/CapturedImageView";

interface CameraCaptureProps {
  capturedImage: string | null;
  onImageCaptured: (imageData: string) => void;
  onResetCapture: () => void;
  isAnalyzing: boolean;
  scanMode: 'single' | 'shelf';
}

const CameraCapture = ({ 
  capturedImage, 
  onImageCaptured,
  onResetCapture,
  isAnalyzing,
  scanMode
}: CameraCaptureProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const { 
    videoRef, 
    isCapturing, 
    isLoading, 
    cameraError, 
    startCamera, 
    stopCamera, 
    toggleFlash,
    triggerCaptureEffect,
    isFlashing
  } = useCamera();
  const isMobile = useIsMobile();

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    // Add haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }

    // Visual feedback
    triggerCaptureEffect();
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    
    if (!context) return;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const imageDataUrl = canvas.toDataURL("image/jpeg", 0.85);
    onImageCaptured(imageDataUrl);
    
    stopCamera();
  };

  const handleContainerTap = () => {
    // Only capture on tap if we're actively capturing and on mobile
    if (isCapturing && isMobile) {
      captureImage();
    }
  };

  return (
    <div className="space-y-4">
      <div 
        ref={videoContainerRef}
        className={`video-container bg-gray-100 rounded-md min-h-[280px] flex items-center justify-center relative overflow-hidden ${isFlashing ? 'bg-white' : ''}`}
      >
        {!capturedImage ? (
          <CameraView 
            videoRef={videoRef}
            isCapturing={isCapturing}
            isLoading={isLoading}
            cameraError={cameraError}
            scanMode={scanMode}
            toggleFlash={toggleFlash}
            onContainerTap={handleContainerTap}
          />
        ) : (
          <CapturedImageView 
            capturedImage={capturedImage}
            isAnalyzing={isAnalyzing}
          />
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {cameraError && (
        <Alert variant="destructive" className="bg-red-50">
          <AlertDescription className="flex items-center">
            <AlertTriangle className="h-4 w-4 mr-2" />
            {cameraError}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex justify-center">
        <CaptureControls 
          isCapturing={isCapturing}
          isLoading={isLoading}
          capturedImage={capturedImage}
          cameraError={cameraError}
          scanMode={scanMode}
          onStartCamera={startCamera}
          onCaptureImage={captureImage}
        />
      </div>
      
      {isMobile && isCapturing && !capturedImage && (
        <p className="text-center text-sm text-muted-foreground mt-2">
          Tap anywhere on the image to capture
        </p>
      )}
    </div>
  );
};

export default CameraCapture;
