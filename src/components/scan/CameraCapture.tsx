import { useRef, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useIsMobile } from "@/hooks/use-mobile";
import { useCamera } from "./camera/useCamera";
import CameraView from "./camera/CameraView";
import CaptureControls from "./camera/CaptureControls";
import CapturedImageView from "./camera/CapturedImageView";
import { optimizeImage } from "@/utils/imageUtils";
import { toast } from "sonner";

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
  const { 
    videoRef, 
    isCapturing, 
    isLoading, 
    cameraError, 
    startCamera, 
    stopCamera, 
    toggleFlash,
    triggerCaptureEffect,
    isFlashing,
    streamInitialized
  } = useCamera();
  const isMobile = useIsMobile();
  const [isOptimizing, setIsOptimizing] = useState(false);

  const captureImage = async () => {
    if (!videoRef.current || !canvasRef.current || !streamInitialized) {
      console.error("Cannot capture - video or canvas not ready");
      return;
    }
    
    console.log("Capturing image");
    
    // Add haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }

    // Visual feedback
    triggerCaptureEffect();
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    try {
      // Get the actual video dimensions
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;
      
      console.log(`Video dimensions: ${videoWidth}x${videoHeight}`);
      
      if (!videoWidth || !videoHeight) {
        throw new Error("Video dimensions not available");
      }
      
      // Set canvas size to match video
      canvas.width = videoWidth;
      canvas.height = videoHeight;
      
      const context = canvas.getContext('2d');
      if (!context) {
        throw new Error("Cannot get canvas context");
      }
      
      // Draw the video frame to the canvas
      context.save();
      // Mirror the image horizontally if needed (since video is mirrored)
      context.scale(-1, 1);
      context.drawImage(video, -videoWidth, 0, videoWidth, videoHeight);
      context.restore();
      
      const rawImageData = canvas.toDataURL("image/jpeg", 0.95);
      console.log(`Raw capture size: ${Math.round(rawImageData.length / 1024)}KB`);
      
      if (rawImageData.length < 10000) {
        throw new Error("Captured image is too small - camera may not be ready");
      }
      
      // Optimize the image
      setIsOptimizing(true);
      const quality = scanMode === 'shelf' ? 0.9 : 0.95;
      const maxWidth = scanMode === 'shelf' ? 1800 : 1600;
      
      const optimizedImage = await optimizeImage(rawImageData, maxWidth, maxWidth, quality);
      console.log(`Optimized size: ${Math.round(optimizedImage.length / 1024)}KB`);
      
      stopCamera();
      onImageCaptured(optimizedImage);
    } catch (error) {
      console.error("Capture error:", error);
      toast.error("Failed to capture image. Please try again.");
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Camera viewport with fixed aspect ratio */}
      <div className="relative w-full" style={{ aspectRatio: isMobile ? '3/4' : '4/3' }}>
        <div className="absolute inset-0 bg-black rounded-lg overflow-hidden">
          {!capturedImage ? (
            <CameraView 
              videoRef={videoRef}
              isCapturing={isCapturing}
              isLoading={isLoading || isOptimizing}
              cameraError={cameraError}
              scanMode={scanMode}
              toggleFlash={toggleFlash}
              onContainerTap={isMobile ? captureImage : undefined}
            />
          ) : (
            <CapturedImageView 
              capturedImage={capturedImage}
              isAnalyzing={isAnalyzing}
            />
          )}
        </div>
      </div>

      {/* Hidden canvas for image capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Error display */}
      {cameraError && (
        <Alert variant="destructive" className="mt-4">
          <AlertDescription className="flex items-center">
            <AlertTriangle className="h-4 w-4 mr-2" />
            {cameraError}
          </AlertDescription>
        </Alert>
      )}

      {/* Controls */}
      <div className="flex justify-center mt-4">
        <CaptureControls 
          isCapturing={isCapturing}
          isLoading={isLoading || isOptimizing}
          capturedImage={capturedImage}
          cameraError={cameraError}
          scanMode={scanMode}
          onStartCamera={startCamera}
          onCaptureImage={captureImage}
        />
      </div>
      
      {/* Mobile tap hint */}
      {isMobile && isCapturing && !capturedImage && streamInitialized && (
        <p className="text-center text-sm text-muted-foreground">
          Tap the camera view to capture
        </p>
      )}
    </div>
  );
};

export default CameraCapture;
