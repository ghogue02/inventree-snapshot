import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { useFlash } from "./useFlash";

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isFlashing, setIsFlashing] = useState(false);
  const { flashActive, toggleFlash, initializeFlash } = useFlash();
  const [streamInitialized, setStreamInitialized] = useState(false);

  // Cleanup function to properly stop camera and clear references
  const cleanup = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => {
        try {
          track.stop();
        } catch (e) {
          console.error("Error stopping track:", e);
        }
      });
      mediaStreamRef.current = null;
    }
    
    if (videoRef.current) {
      try {
        videoRef.current.srcObject = null;
        videoRef.current.onloadedmetadata = null;
        videoRef.current.onplaying = null;
        videoRef.current.onerror = null;
      } catch (e) {
        console.error("Error cleaning up video element:", e);
      }
    }
    
    setIsCapturing(false);
    setStreamInitialized(false);
    setIsLoading(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, []);

  const startCamera = async () => {
    try {
      // Ensure we're starting fresh
      cleanup();
      setCameraError(null);
      setIsLoading(true);

      // Verify video element exists
      if (!videoRef.current) {
        throw new Error("Video element not initialized");
      }
      
      // Request camera access with high resolution
      const constraints = {
        video: {
          facingMode: "environment",
          width: { ideal: 1920, min: 1280 },
          height: { ideal: 1080, min: 720 },
          aspectRatio: { ideal: 4/3 }
        },
        audio: false
      };
      
      console.log("Requesting camera access...");
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log("Camera access granted");
      
      // Store stream reference
      mediaStreamRef.current = stream;
      
      // Set up video element
      videoRef.current.srcObject = stream;
      
      // Wait for video to be ready
      await new Promise<void>((resolve, reject) => {
        if (!videoRef.current) {
          reject(new Error("Video element lost during initialization"));
          return;
        }

        // Safety timeout
        const timeout = setTimeout(() => {
          console.warn("Camera initialization timeout - attempting to proceed");
          if (videoRef.current?.readyState >= 2) { // HAVE_CURRENT_DATA or better
            setIsCapturing(true);
            setStreamInitialized(true);
            resolve();
          } else {
            reject(new Error("Video stream not ready after timeout"));
          }
        }, 5000);

        // Success handler
        const handlePlaying = () => {
          clearTimeout(timeout);
          console.log("Video stream active", {
            width: videoRef.current?.videoWidth,
            height: videoRef.current?.videoHeight
          });
          setIsCapturing(true);
          setStreamInitialized(true);
          resolve();
        };

        // Error handler
        const handleError = (event: Event) => {
          clearTimeout(timeout);
          const videoError = (event.target as HTMLVideoElement).error;
          reject(new Error(`Video error: ${videoError?.message || 'Unknown error'}`));
        };

        // Set up event listeners
        videoRef.current.onplaying = handlePlaying;
        videoRef.current.onerror = handleError;

        // Start playback
        videoRef.current.play().catch(reject);
      });

      // Initialize flash if available
      try {
        await initializeFlash(stream, false);
      } catch (e) {
        console.warn("Flash initialization failed:", e);
      }

      setIsLoading(false);
      console.log("Camera setup complete");

    } catch (error) {
      console.error("Camera initialization failed:", error);
      cleanup();
      
      let errorMessage = "Failed to access camera";
      
      if (error instanceof Error) {
        if (error.name === "NotFoundError" || error.message.includes("Requested device not found")) {
          errorMessage = "No camera found on this device";
        } else if (error.name === "NotAllowedError") {
          errorMessage = "Camera access denied. Please check your permissions.";
        } else if (error.name === "NotReadableError") {
          errorMessage = "Camera is in use by another application";
        } else if (error.message.includes("timeout")) {
          errorMessage = "Camera initialization timed out. Please try again.";
        }
      }
      
      setCameraError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const stopCamera = () => {
    cleanup();
  };

  const triggerCaptureEffect = () => {
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 100);
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
