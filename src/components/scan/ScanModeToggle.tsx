
import React from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Camera, Scan } from "lucide-react";

interface ScanModeToggleProps {
  scanMode: 'single' | 'shelf';
  onModeChange: (mode: 'single' | 'shelf') => void;
  autoAdvance: boolean;
  onAutoAdvanceChange: (enabled: boolean) => void;
}

const ScanModeToggle = ({ 
  scanMode, 
  onModeChange, 
  autoAdvance, 
  onAutoAdvanceChange 
}: ScanModeToggleProps) => {
  return (
    <div className="flex justify-between items-center">
      <ToggleGroup 
        type="single" 
        value={scanMode} 
        onValueChange={(value) => value && onModeChange(value as 'single' | 'shelf')}
      >
        <ToggleGroupItem value="single" className="flex items-center gap-1">
          <Camera className="h-4 w-4" />
          Single Item
        </ToggleGroupItem>
        <ToggleGroupItem value="shelf" className="flex items-center gap-1">
          <Scan className="h-4 w-4" />
          Shelf Scan
        </ToggleGroupItem>
      </ToggleGroup>
      
      {scanMode === 'shelf' && (
        <div className="flex items-center space-x-2">
          <Switch 
            id="auto-advance" 
            checked={autoAdvance}
            onCheckedChange={onAutoAdvanceChange}
          />
          <Label htmlFor="auto-advance" className="text-sm">Auto-advance</Label>
        </div>
      )}
    </div>
  );
};

export default ScanModeToggle;
