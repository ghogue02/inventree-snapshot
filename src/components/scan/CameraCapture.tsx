
import { useState, useRef } from "react";
import { Camera, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface CameraCaptureProps {
  capturedImage: string | null;
  onImageCaptured: (imageData: string) => void;
  onResetCapture: () => void;
  isAnalyzing: boolean;
}

const CameraCapture = ({ 
  capturedImage, 
  onImageCaptured,
  onResetCapture,
  isAnalyzing
}: CameraCaptureProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const startCamera = async () => {
    try {
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
    } catch (error) {
      console.error("Error starting camera:", error);
      toast.error("Failed to access camera");
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
      <div className="video-container bg-gray-100 rounded-md">
        {!capturedImage ? (
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline
            className={isCapturing ? "opacity-100" : "opacity-0"}
            onLoadedMetadata={() => {
              if (videoRef.current) {
                videoRef.current.classList.remove("opacity-0");
                videoRef.current.classList.add("opacity-100");
              }
            }}
          />
        ) : (
          <img 
            src={capturedImage} 
            alt="Captured inventory" 
            className="w-full h-full object-contain"
          />
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      <div className="flex justify-center gap-2">
        {!isCapturing && !capturedImage && (
          <Button onClick={startCamera}>
            <Camera className="mr-2 h-4 w-4" />
            Start Camera
          </Button>
        )}

        {isCapturing && !capturedImage && (
          <Button onClick={captureImage}>
            <Camera className="mr-2 h-4 w-4" />
            Capture Image
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
