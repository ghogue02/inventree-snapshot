
import React from "react";
import { Loader2 } from "lucide-react";

interface CapturedImageViewProps {
  capturedImage: string;
  isAnalyzing: boolean;
}

const CapturedImageView = ({ capturedImage, isAnalyzing }: CapturedImageViewProps) => {
  return (
    <div className="relative w-full h-full">
      <img 
        src={capturedImage} 
        alt="Captured inventory" 
        className="w-full h-full object-contain rounded-md"
      />
      {isAnalyzing && (
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center rounded-md">
          <div className="bg-white/90 px-4 py-2 rounded-full flex items-center animate-pulse-light">
            <Loader2 className="animate-spin mr-2 h-5 w-5 text-primary" />
            <span className="text-sm font-medium">Analyzing...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CapturedImageView;
