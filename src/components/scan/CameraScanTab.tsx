
import { useEffect } from "react";
import useScanAnalysis from "@/hooks/useScanAnalysis";
import CameraCapture from "./CameraCapture";
import AnalysisResults from "./AnalysisResults";
import { Product } from "@/types/inventory";

interface CameraScanTabProps {
  products: Product[];
  onOpenProductForm: (imageData?: string, analysisResult?: string) => void;
}

const CameraScanTab = ({ products, onOpenProductForm }: CameraScanTabProps) => {
  const {
    capturedImage,
    setCapturedImage,
    isAnalyzing,
    analysisResult,
    recognizedItems,
    resetCapture,
    analyzeImage,
    saveInventoryCounts,
    updateRecognizedItem,
    removeRecognizedItem,
    checkIfItemExists,
    addToInventory
  } = useScanAnalysis(products);

  // Reset state on component mount
  useEffect(() => {
    resetCapture();
  }, [resetCapture]);

  // Handle captured image analysis
  const handleImageCaptured = (imageDataUrl: string) => {
    setCapturedImage(imageDataUrl);
    analyzeImage(imageDataUrl);
  };

  // Handle redirection to add product form
  const handleGoToAddProduct = () => {
    onOpenProductForm(capturedImage || undefined, analysisResult || undefined);
  };

  return (
    <div className="space-y-4">
      <CameraCapture 
        capturedImage={capturedImage}
        onImageCaptured={handleImageCaptured}
        onResetCapture={resetCapture}
        isAnalyzing={isAnalyzing}
      />

      {analysisResult && recognizedItems.length > 0 && (
        <AnalysisResults 
          analysisResult={analysisResult}
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

export default CameraScanTab;
