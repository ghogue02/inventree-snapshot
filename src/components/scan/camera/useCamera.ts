
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

  useEffect(() => {
    return () => {
      // Clean up by stopping camera stream when component unmounts
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      setCameraError(null);
      setIsLoading(true);
      
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
        
        // Make sure video is playing before considering it loaded
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play()
              .then(() => {
                setIsCapturing(true);
                setIsLoading(false);
                // Initialize flash in off state
                initializeFlash(stream, false);
              })
              .catch(error => {
                console.error("Error playing video:", error);
                setCameraError("Failed to start camera stream");
                setIsLoading(false);
              });
          }
        };
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
      
      // Make sure to clear the video source when stopping
      if (videoRef.current) {
        videoRef.current.srcObject = null;
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

  const handleToggleFlash = () => {
    toggleFlash(mediaStreamRef.current);
  };

  return {
    videoRef,
    isCapturing,
    isLoading,
    cameraError,
    flashActive,
    isFlashing,
    startCamera,
    stopCamera,
    triggerCaptureEffect,
    toggleFlash: handleToggleFlash,
    mediaStreamRef
  };
}
