
// Type definitions for extended MediaTrack capabilities
interface ExtendedMediaTrackCapabilities extends MediaTrackCapabilities {
  torch?: boolean;
}

interface ExtendedMediaTrackConstraintSet extends MediaTrackConstraintSet {
  torch?: boolean;
}

export type { ExtendedMediaTrackCapabilities, ExtendedMediaTrackConstraintSet };
