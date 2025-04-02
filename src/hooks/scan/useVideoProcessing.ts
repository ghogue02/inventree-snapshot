
import { useState } from "react";
import { toast } from "sonner";
import { processInventoryVideo } from "@/services/apiService";

export const useVideoProcessing = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelected = (file: File) => {
    setSelectedFile(file);
  };

  const processVideo = async () => {
    if (!selectedFile) {
      toast.error("Please select a file first");
      return null;
    }

    setIsUploading(true);

    try {
      const results = await processInventoryVideo(selectedFile);
      setIsUploading(false);
      return results;
    } catch (error) {
      console.error("Error processing video:", error);
      toast.error("Failed to process video");
      setIsUploading(false);
      return null;
    }
  };

  return {
    isUploading,
    selectedFile,
    handleFileSelected,
    processVideo
  };
};
