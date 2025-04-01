
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Loader2 } from "lucide-react";

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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedFile(file);
      onVideoSelected(file);
    }
  };

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
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
          <div className="p-4 rounded-full bg-gray-100">
            <Camera className="h-8 w-8 text-gray-500" />
          </div>
          <span className="text-sm font-medium">Click to upload video</span>
          <span className="text-xs text-muted-foreground">
            MP4, MOV, or AVI up to 100MB
          </span>
        </label>
        {selectedFile && (
          <div className="mt-2 text-sm">
            Selected: {selectedFile.name}
          </div>
        )}
      </div>

      <div className="flex justify-center">
        <Button
          onClick={onProcessVideo}
          disabled={!selectedFile || isProcessing}
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Loader2 className="mr-2 h-4 w-4" />
              Process Video
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default VideoUploader;
