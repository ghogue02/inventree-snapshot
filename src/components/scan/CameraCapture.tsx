
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
  const [isOptimizing, setIsOptimizing] = useState(false);

  const captureImage = async () => {
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
    
    const rawImageData = canvas.toDataURL("image/jpeg", 0.85);
    
    try {
      // Optimize the image before passing it up
      setIsOptimizing(true);
      
      // Use more compression for shelf mode (likely larger scenes)
      const quality = scanMode === 'shelf' ? 0.7 : 0.85;
      const maxWidth = scanMode === 'shelf' ? 1280 : 1024;
      
      const optimizedImage = await optimizeImage(rawImageData, maxWidth, maxWidth, quality);
      
      stopCamera();
      onImageCaptured(optimizedImage);
    } catch (error) {
      console.error("Error optimizing image:", error);
      toast.error("Failed to process image. Using original quality.");
      stopCamera();
      // Fall back to unoptimized image
      onImageCaptured(rawImageData);
    } finally {
      setIsOptimizing(false);
    }
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
        className={`video-container bg-gray-100 rounded-md overflow-hidden relative ${
          isCapturing && isMobile ? 'fullscreen min-h-[65vh]' : 'min-h-[280px]'
        } ${isFlashing ? 'bg-white' : ''}`}
      >
        {!capturedImage ? (
          <CameraView 
            videoRef={videoRef}
            isCapturing={isCapturing}
            isLoading={isLoading || isOptimizing}
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
          isLoading={isLoading || isOptimizing}
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
