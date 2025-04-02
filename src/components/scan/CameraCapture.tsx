
import { useState, useRef, useEffect } from "react";
import { Camera, Loader2, RefreshCw, AlertTriangle, Scan } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useIsMobile } from "@/hooks/use-mobile";
import { ExtendedMediaTrackCapabilities, ExtendedMediaTrackConstraintSet } from "@/types/media-extensions";

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
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [flashActive, setFlashActive] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    return () => {
      // Clean up by stopping camera stream when component unmounts
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      setCameraError(null);
      
      const constraints = {
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        mediaStreamRef.current = stream;
        setIsCapturing(true);
        
        // Try to enable flash if available
        try {
          const track = stream.getVideoTracks()[0];
          const capabilities = track.getCapabilities() as ExtendedMediaTrackCapabilities;
          
          if (capabilities?.torch) {
            await track.applyConstraints({
              advanced: [{ torch: false } as ExtendedMediaTrackConstraintSet],
            });
          }
        } catch (e) {
          console.log("Flash not supported on this device");
        }
      }
    } catch (error: any) {
      console.error("Error starting camera:", error);
      
      let errorMessage = "Failed to access camera";
      
      if (error.name === "NotFoundError") {
        errorMessage = "No camera detected on this device or browser";
      } else if (error.name === "NotAllowedError") {
        errorMessage = "Camera access was denied. Please allow camera permissions to continue.";
      } else if (error.name === "AbortError") {
        errorMessage = "Camera access was aborted. Please try again.";
      } else if (error.name === "NotReadableError") {
        errorMessage = "Camera is in use by another application.";
      } else if (error.message?.includes("Requested device not found")) {
        errorMessage = "Camera device not found. Please make sure your device has a working camera.";
      }
      
      setCameraError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
      setIsCapturing(false);
      setFlashActive(false);
    }
  };

  const toggleFlash = async () => {
    if (!mediaStreamRef.current) return;
    
    try {
      const track = mediaStreamRef.current.getVideoTracks()[0];
      const capabilities = track.getCapabilities() as ExtendedMediaTrackCapabilities;
      
      if (capabilities?.torch) {
        const newFlashState = !flashActive;
        await track.applyConstraints({
          advanced: [{ torch: newFlashState } as ExtendedMediaTrackConstraintSet],
        });
        setFlashActive(newFlashState);
        toast.success(newFlashState ? "Flash turned on" : "Flash turned off");
      } else {
        toast.error("Flash not supported on this device");
      }
    } catch (e) {
      console.error("Error toggling flash:", e);
      toast.error("Failed to toggle flash");
    }
  };

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    // Add haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    
    if (!context) return;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const imageDataUrl = canvas.toDataURL("jpeg", 0.85);
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
        className="video-container bg-gray-100 rounded-md min-h-[280px] flex items-center justify-center relative overflow-hidden"
        onClick={handleContainerTap}
      >
        {!capturedImage ? (
          <>
            {cameraError ? (
              <div className="text-center p-4">
                <AlertTriangle className="mx-auto h-12 w-12 text-amber-500 mb-2" />
                <p className="text-muted-foreground">{cameraError}</p>
              </div>
            ) : (
              <div className="relative w-full h-full">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline
                  className={isCapturing ? "w-full h-full object-cover rounded-md" : "hidden"}
                  onLoadedMetadata={() => {
                    if (videoRef.current) {
                      videoRef.current.classList.remove("opacity-0");
                      videoRef.current.classList.add("opacity-100");
                    }
                  }}
                />
                
                {isCapturing && (
                  <div className="absolute inset-0 pointer-events-none">
                    {/* Scan frame guides */}
                    <div className={`
                      border-2 border-white border-opacity-70 rounded-lg 
                      absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
                      ${scanMode === 'single' ? 'w-4/5 h-2/3' : 'w-11/12 h-4/5'}
                    `}>
                      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-white border-opacity-80 rounded-tl"></div>
                      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-white border-opacity-80 rounded-tr"></div>
                      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-white border-opacity-80 rounded-bl"></div>
                      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-white border-opacity-80 rounded-br"></div>
                    </div>
                  </div>
                )}
                
                {isCapturing && isMobile && (
                  <div className="absolute bottom-4 left-4">
                    <Button 
                      size="sm" 
                      variant="secondary" 
                      className="bg-black/40 hover:bg-black/60 text-white rounded-full w-10 h-10 p-0 flex items-center justify-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFlash();
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 2v20c0 .6.4 1 1 1h2c.6 0 1-.4 1-1V2c0-.6-.4-1-1-1h-2a1 1 0 0 0-1 1Z"></path>
                        <path d="m19 14 2-2-2-2"></path>
                        <path d="M5 14 3 12l2-2"></path>
                        <path d="M8 14h13"></path>
                        <path d="M8 10h13"></path>
                      </svg>
                    </Button>
                  </div>
                )}
              </div>
            )}
            {!isCapturing && !cameraError && (
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
            )}
          </>
        ) : (
          <div className="relative w-full h-full">
            <img 
              src={capturedImage} 
              alt="Captured inventory" 
              className="w-full h-full object-contain rounded-md"
            />
            {isAnalyzing && (
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center rounded-md">
                <div className="bg-white/90 px-4 py-2 rounded-full flex items-center">
                  <Loader2 className="animate-spin mr-2 h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">Analyzing...</span>
                </div>
              </div>
            )}
          </div>
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
        {!isCapturing && !capturedImage && (
          <Button 
            onClick={startCamera} 
            className={`${cameraError ? "bg-amber-600 hover:bg-amber-700" : ""} w-full sm:w-auto`}
            size={isMobile ? "lg" : "default"}
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
        )}

        {isCapturing && !capturedImage && (
          <Button 
            onClick={captureImage} 
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
        )}
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
