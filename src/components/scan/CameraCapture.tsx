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
      const videoWidth = video.videoWidth || 1280;
      const videoHeight = video.videoHeight || 720;
      
      console.log(`Capturing from video of size ${videoWidth}x${videoHeight}`);
      
      canvas.width = videoWidth;
      canvas.height = videoHeight;
      
      const context = canvas.getContext('2d');
      if (!context) {
        throw new Error("Cannot get canvas context");
      }
      
      // Clear the canvas first
      context.fillStyle = '#000000';
      context.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw the video frame to the canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const rawImageData = canvas.toDataURL("image/jpeg", 0.95);
      console.log(`Raw image captured with size: ${Math.round(rawImageData.length / 1024)}KB`);
      
      if (rawImageData.length < 10000) {
        console.error("Image data is too small, likely an empty or failed capture");
        throw new Error("Failed to capture image - camera may not be fully initialized");
      }
      
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
      // Removed redundant setIsOptimizing(false) as it's handled in finally
    } catch (error) {
      console.error("Error capturing image:", error);
      toast.error("Failed to capture image. Please try again.");
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleContainerTap = () => {
    // Only capture on tap if we're actively capturing and on mobile
    if (isCapturing && isMobile && streamInitialized) {
      captureImage();
    }
  };

  return (
    <div className="space-y-4 relative">
      <div 
        ref={videoContainerRef}
        className={`video-container rounded-md overflow-hidden relative ${
          isFlashing ? 'bg-white' : 'bg-black'
        }`}
        style={{
          width: '100%', // Keep width
          // Temporarily use fixed height for debugging
          height: '500px',
          // aspectRatio: isMobile ? '3/4' : '4/3', // Temporarily remove
          // minHeight: '350px', // Temporarily remove
          // maxHeight: isMobile ? 'calc(100vh - 220px)' : '600px', // Temporarily remove
          position: 'relative', // Ensure position is set for z-index
          zIndex: 1 // Lower z-index slightly, just in case controls need to be higher
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

      {/* Controls container with better positioning */}
      <div className="flex justify-center z-20 pb-2 mt-2">
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
      
      {isMobile && isCapturing && !capturedImage && streamInitialized && (
        <p className="text-center text-sm text-muted-foreground mt-1">
          Tap anywhere on the image to capture
        </p>
      )}
    </div>
  );
};

export default CameraCapture;
