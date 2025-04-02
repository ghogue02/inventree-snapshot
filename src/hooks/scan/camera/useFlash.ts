
import { useState } from "react";
import { toast } from "sonner";
import { ExtendedMediaTrackCapabilities, ExtendedMediaTrackConstraintSet } from "@/types/media-extensions";

export function useFlash() {
  const [flashActive, setFlashActive] = useState(false);
  const [flashSupported, setFlashSupported] = useState<boolean | null>(null);

  const toggleFlash = async (mediaStream: MediaStream | null) => {
    if (!mediaStream) return;
    
    try {
      const track = mediaStream.getVideoTracks()[0];
      const capabilities = track.getCapabilities() as ExtendedMediaTrackCapabilities;
      
      if (capabilities?.torch) {
        setFlashSupported(true);
        const newFlashState = !flashActive;
        await track.applyConstraints({
          advanced: [{ torch: newFlashState } as ExtendedMediaTrackConstraintSet],
        });
        setFlashActive(newFlashState);
        toast.success(newFlashState ? "Flash turned on" : "Flash turned off", {
          duration: 1500,
        });
      } else {
        setFlashSupported(false);
        toast.error("Flash not supported on this device", {
          duration: 3000,
        });
      }
    } catch (e) {
      console.error("Error toggling flash:", e);
      setFlashSupported(false);
      toast.error("Failed to toggle flash");
    }
  };

  const initializeFlash = async (mediaStream: MediaStream | null, initialState: boolean = false) => {
    if (!mediaStream) return;
    
    try {
      const track = mediaStream.getVideoTracks()[0];
      const capabilities = track.getCapabilities() as ExtendedMediaTrackCapabilities;
      
      if (capabilities?.torch) {
        setFlashSupported(true);
        await track.applyConstraints({
          advanced: [{ torch: initialState } as ExtendedMediaTrackConstraintSet],
        });
        setFlashActive(initialState);
      } else {
        setFlashSupported(false);
      }
    } catch (e) {
      console.log("Flash not supported on this device");
      setFlashSupported(false);
    }
  };

  return { flashActive, flashSupported, toggleFlash, initializeFlash };
}
