
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Loader2, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

interface VideoUploaderProps {
  onVideoSelected: (file: File) => void;
  isProcessing: boolean;
  onProcessVideo: () => void;
}

const VideoUploader = ({ 
  onVideoSelected, 
  isProcessing, 
  onProcessVideo 
}: VideoUploaderProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedFile(file);
      onVideoSelected(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('video/')) {
        setSelectedFile(file);
        onVideoSelected(file);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  return (
    <div className="space-y-4">
      <div 
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
          isDragging ? "border-primary bg-primary/5" : "border-gray-300",
          selectedFile ? "border-green-300 bg-green-50" : ""
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          type="file"
          accept="video/*"
          onChange={handleFileUpload}
          className="hidden"
          id="video-upload"
        />
        <label 
          htmlFor="video-upload"
          className="cursor-pointer flex flex-col items-center justify-center gap-2"
        >
          <div className={cn(
            "p-4 rounded-full", 
            selectedFile ? "bg-green-100" : "bg-gray-100"
          )}>
            {selectedFile ? (
              <Upload className="h-8 w-8 text-green-500" />
            ) : (
              <Camera className="h-8 w-8 text-gray-500" />
            )}
          </div>
          <span className="text-sm font-medium">
            {selectedFile ? "Video selected" : "Click or drag to upload video"}
          </span>
          <span className="text-xs text-muted-foreground">
            MP4, MOV, or AVI up to 100MB
          </span>
        </label>
        {selectedFile && (
          <div className="mt-3 text-sm bg-green-50 p-2 rounded border border-green-200">
            <div className="font-medium">Selected: {selectedFile.name}</div>
            <div className="text-xs text-muted-foreground">
              {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-center">
        <Button
          onClick={onProcessVideo}
          disabled={!selectedFile || isProcessing}
          className={selectedFile ? "bg-green-600 hover:bg-green-700" : ""}
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Process Video
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default VideoUploader;
