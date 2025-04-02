
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
    isFlashing,
    streamInitialized
  } = useCamera();
  const isMobile = useIsMobile();
  const [isOptimizing, setIsOptimizing] = useState(false);

  const captureImage = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
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
      // Set canvas size to match the actual video dimensions, not the element size
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;
      
      console.log(`Capturing from video of size ${videoWidth}x${videoHeight}`);
      
      if (!videoWidth || !videoHeight) {
        throw new Error("Cannot get video dimensions");
      }
      
      canvas.width = videoWidth;
      canvas.height = videoHeight;
      
      const context = canvas.getContext("2d");
      if (!context) {
        throw new Error("Cannot get canvas context");
      }
      
      // Clear the canvas first
      context.fillStyle = 'rgb(0, 0, 0)';
      context.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw the video frame to the canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const rawImageData = canvas.toDataURL("image/jpeg", 0.95); // Using higher quality for initial capture
      console.log(`Raw image captured with size: ${Math.round(rawImageData.length / 1024)}KB`);
      
      // Optimize the image before passing it up
      setIsOptimizing(true);
      
      // Use appropriate compression for mode, but higher quality than before
      const quality = scanMode === 'shelf' ? 0.9 : 0.95;
      const maxWidth = scanMode === 'shelf' ? 1800 : 1600;
      
      console.log(`Optimizing image with quality ${quality} and max width ${maxWidth}`);
      const optimizedImage = await optimizeImage(rawImageData, maxWidth, maxWidth, quality);
      console.log(`Optimized image size: ${Math.round(optimizedImage.length / 1024)}KB`);
      
      stopCamera();
      onImageCaptured(optimizedImage);
    } catch (error) {
      console.error("Error capturing image:", error);
      toast.error("Failed to capture image. Please try again.");
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
        className={`video-container bg-gray-800 rounded-md overflow-hidden relative ${
          isCapturing && isMobile ? 'fullscreen min-h-[75vh]' : 'min-h-[350px]'
        } ${isFlashing ? 'bg-white' : ''}`}
        style={{ 
          width: '100%', 
          aspectRatio: isMobile ? '3/4' : '4/3',
          maxHeight: isMobile ? 'calc(100vh - 250px)' : '600px'
        }}
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
