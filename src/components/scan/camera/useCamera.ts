
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { useFlash } from "./useFlash";

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isFlashing, setIsFlashing] = useState(false); // State for capture visual feedback
  const { flashActive, toggleFlash, initializeFlash } = useFlash();
  const [streamInitialized, setStreamInitialized] = useState(false);

  useEffect(() => {
    return () => {
      // Clean up by stopping camera stream when component unmounts
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      // Ensure cleanup from previous attempts
      stopCamera();
      setCameraError(null);
      setIsLoading(true);
      
      // Request camera with high resolution
      const constraints = {
        video: {
          facingMode: "environment",
          width: { ideal: 1920, min: 1280 },
          height: { ideal: 1080, min: 720 },
          aspectRatio: { ideal: 4/3 }
        },
        audio: false
      };
      
      console.log("Requesting camera with constraints:", constraints);
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log("Camera stream obtained");
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        mediaStreamRef.current = stream;
        
        // Use a promise to handle video playing or error
        try {
          await new Promise<void>((resolve, reject) => {
            if (!videoRef.current) {
              reject(new Error("Video element became null"));
              return;
            }

            const timeout = setTimeout(() => {
              // Safety timeout in case events don't fire
              console.log("Camera initialization timeout - proceeding anyway");
              setIsCapturing(true);
              setIsLoading(false);
              setStreamInitialized(true);
              resolve();
            }, 5000);
            
            // Event listener for when the video starts playing
            videoRef.current.onplaying = () => {
              clearTimeout(timeout);
              console.log("Video is playing");
              setIsCapturing(true);
              setIsLoading(false);
              setStreamInitialized(true);
              initializeFlash(stream, false);
              
              console.log("Video dimensions:", {
                videoWidth: videoRef.current?.videoWidth,
                videoHeight: videoRef.current?.videoHeight
              });
              resolve();
            };
            
            // Event listener for metadata loaded
            videoRef.current.onloadedmetadata = () => {
              console.log("Video metadata loaded, starting playback");
              videoRef.current?.play().catch(error => {
                console.error("Error playing video after metadata loaded:", error);
                reject(error);
              });
            };

            // Event listener for errors during video loading/playback
            videoRef.current.onerror = (e) => {
              clearTimeout(timeout);
              console.error("Video element error:", e);
              reject(new Error("Failed to load video stream"));
            };
          });
          
        } catch (error) {
          console.error("Error in video initialization:", error);
          throw new Error("Failed to initialize video stream: " + (error instanceof Error ? error.message : "unknown error"));
        }
      } else {
        throw new Error("Video element not available");
      }
    } catch (error: any) {
      console.error("Error starting camera:", error);
      setIsLoading(false);
      
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
      setStreamInitialized(false);
      
      // Make sure to clear the video source when stopping
      if (videoRef.current) {
        videoRef.current.srcObject = null;
        videoRef.current.onplaying = null;
        videoRef.current.onloadedmetadata = null;
        videoRef.current.onerror = null;
      }
    }
  };

  // Visual feedback flash effect for capture
  const triggerCaptureEffect = () => {
    setIsFlashing(true);
    setTimeout(() => {
      setIsFlashing(false);
    }, 100); // Quick 100ms flash
  };

  const handleToggleFlash = (e: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    toggleFlash(mediaStreamRef.current);
  };

  return {
    videoRef,
    isCapturing,
    isLoading,
    cameraError,
    flashActive,
    isFlashing,
    streamInitialized,
    startCamera,
    stopCamera,
    triggerCaptureEffect,
    toggleFlash: handleToggleFlash,
    mediaStreamRef
  };
}
