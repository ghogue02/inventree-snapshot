
import { useState, useEffect } from "react";
import VideoUploader from "./VideoUploader";
import AnalysisResults from "./AnalysisResults";
import useScanAnalysis from "@/hooks/useScanAnalysis";
import { Product } from "@/types/inventory";

interface VideoScanTabProps {
  products: Product[];
  onOpenProductForm: (imageData?: string, analysisResult?: string) => void;
}

const VideoScanTab = ({ products, onOpenProductForm }: VideoScanTabProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const {
    isUploading,
    analysisResult,
    recognizedItems,
    resetCapture,
    processVideo,
    saveInventoryCounts,
    updateRecognizedItem,
    removeRecognizedItem,
    checkIfItemExists,
    addToInventory
  } = useScanAnalysis(products);

  // Reset state when component mounts
  useEffect(() => {
    resetCapture();
  }, [resetCapture]);

  const handleFileSelected = (file: File) => {
    setSelectedFile(file);
  };

  const handleProcessVideo = async () => {
    if (selectedFile) {
      await processVideo(selectedFile);
    }
  };

  // Handle redirection to add product form
  const handleGoToAddProduct = () => {
    onOpenProductForm(undefined, analysisResult || undefined);
  };

  return (
    <div className="space-y-4">
      <VideoUploader 
        onVideoSelected={handleFileSelected}
        isProcessing={isUploading} 
        onProcessVideo={handleProcessVideo}
      />

      {recognizedItems.length > 0 && (
        <AnalysisResults
          analysisResult={analysisResult || ""}
          recognizedItems={recognizedItems}
          products={products}
          onSaveInventoryCounts={saveInventoryCounts}
          onGoToAddProduct={handleGoToAddProduct}
          onResetCapture={resetCapture}
          onUpdateItem={updateRecognizedItem}
          onRemoveItem={removeRecognizedItem}
          onAddToInventory={addToInventory}
          checkIfItemExists={checkIfItemExists}
        />
      )}
    </div>
  );
};

export default VideoScanTab;
