
import { useState, useRef, useEffect } from "react";
import { Camera, Loader2, RefreshCw, AlertTriangle, Scan } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

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
        },
        audio: false
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        mediaStreamRef.current = stream;
        setIsCapturing(true);
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
    }
  };

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    
    if (!context) return;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const imageDataUrl = canvas.toDataURL("image/jpeg");
    onImageCaptured(imageDataUrl);
    
    stopCamera();
  };

  return (
    <div className="space-y-4">
      <div className="video-container bg-gray-100 rounded-md min-h-[280px] flex items-center justify-center relative">
        {!capturedImage ? (
          <>
            {cameraError ? (
              <div className="text-center p-4">
                <AlertTriangle className="mx-auto h-12 w-12 text-amber-500 mb-2" />
                <p className="text-muted-foreground">{cameraError}</p>
              </div>
            ) : (
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
          <img 
            src={capturedImage} 
            alt="Captured inventory" 
            className="w-full h-full object-contain rounded-md"
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

      <div className="flex justify-center gap-2">
        {!isCapturing && !capturedImage && (
          <Button 
            onClick={startCamera} 
            className={cameraError ? "bg-amber-600 hover:bg-amber-700" : ""}
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
          <Button onClick={captureImage}>
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
          </Button>
        )}

        {capturedImage && !isAnalyzing && (
          <Button disabled>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Analyzing...
          </Button>
        )}

        {isAnalyzing && (
          <Button disabled>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Analyzing...
          </Button>
        )}
      </div>
    </div>
  );
};

export default CameraCapture;
