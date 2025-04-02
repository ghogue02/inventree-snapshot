
import { useState } from "react";
import { toast } from "sonner";
import { ExtendedMediaTrackCapabilities, ExtendedMediaTrackConstraintSet } from "@/types/media-extensions";

export function useFlash() {
  const [flashActive, setFlashActive] = useState(false);

  const toggleFlash = async (mediaStream: MediaStream | null) => {
    if (!mediaStream) return;
    
    try {
      const track = mediaStream.getVideoTracks()[0];
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

  const initializeFlash = async (mediaStream: MediaStream | null, initialState: boolean = false) => {
    if (!mediaStream) return;
    
    try {
      const track = mediaStream.getVideoTracks()[0];
      const capabilities = track.getCapabilities() as ExtendedMediaTrackCapabilities;
      
      if (capabilities?.torch) {
        await track.applyConstraints({
          advanced: [{ torch: initialState } as ExtendedMediaTrackConstraintSet],
        });
        setFlashActive(initialState);
      }
    } catch (e) {
      console.log("Flash not supported on this device");
    }
  };

  return { flashActive, toggleFlash, initializeFlash };
}
