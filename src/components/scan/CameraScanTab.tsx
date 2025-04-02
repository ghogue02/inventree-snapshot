import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { InventoryRecognitionResult, Product } from "@/types/inventory";
import CameraCapture from "@/components/scan/CameraCapture";
import AnalysisResults from "@/components/scan/AnalysisResults";
import BatchScanResults from "@/components/scan/BatchScanResults";
import ScanModeToggle from "./ScanModeToggle";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface CameraScanTabProps {
  capturedImage: string | null;
  onImageCaptured: (imageData: string) => void;
  onResetCapture: () => void;
  isAnalyzing: boolean;
  scanMode: 'single' | 'shelf';
  setScanMode: (mode: 'single' | 'shelf') => void;
  analysisResult: string | null;
  recognizedItems: InventoryRecognitionResult[];
  products: Product[];
  onSaveInventoryCounts: () => void;
  onGoToAddProduct: () => void;
  onUpdateItem: (index: number, item: InventoryRecognitionResult) => void;
  onRemoveItem: (index: number) => void;
  onAddToInventory: (item: InventoryRecognitionResult) => Promise<Product | null>;
  checkIfItemExists: (name: string) => Product | undefined;
  selectedItemIndex: number | null;
  onSelectItem: (index: number) => void;
  onUndoLastAction: () => void;
  autoAdvance: boolean;
  setAutoAdvance: (enabled: boolean) => void;
}

const CameraScanTab = ({
  capturedImage,
  onImageCaptured,
  onResetCapture,
  isAnalyzing,
  scanMode,
  setScanMode,
  analysisResult,
  recognizedItems,
  products,
  onSaveInventoryCounts,
  onGoToAddProduct,
  onUpdateItem,
  onRemoveItem,
  onAddToInventory,
  checkIfItemExists,
  selectedItemIndex,
  onSelectItem,
  onUndoLastAction,
  autoAdvance,
  setAutoAdvance
}: CameraScanTabProps) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="space-y-4">
      <Card className={isMobile ? "overflow-hidden shadow-sm border-0 sm:border" : ""}>
        <CardContent className={cn(isMobile ? "p-0 sm:p-3" : "p-6 space-y-4", "overflow-visible")}>
          <div className={`flex justify-between items-center ${isMobile ? 'p-3' : 'mb-4'}`}>
            <ScanModeToggle
              scanMode={scanMode}
              onModeChange={setScanMode}
              autoAdvance={autoAdvance}
              onAutoAdvanceChange={setAutoAdvance}
            />
          </div>
          
          <div className="camera-container" style={{ width: '100%' }}>
            <CameraCapture 
              capturedImage={capturedImage}
              onImageCaptured={onImageCaptured}
              onResetCapture={onResetCapture}
              isAnalyzing={isAnalyzing}
              scanMode={scanMode}
            />
          </div>
        </CardContent>
      </Card>

      {analysisResult && recognizedItems.length > 0 && (
        scanMode === 'shelf' ? (
          <BatchScanResults
            analysisResult={analysisResult}
            recognizedItems={recognizedItems}
            products={products}
            onSaveInventoryCounts={onSaveInventoryCounts}
            onGoToAddProduct={onGoToAddProduct}
            onResetCapture={onResetCapture}
            onUpdateItem={onUpdateItem}
            onRemoveItem={onRemoveItem}
            onAddToInventory={onAddToInventory}
            checkIfItemExists={checkIfItemExists}
            selectedItemIndex={selectedItemIndex}
            onSelectItem={onSelectItem}
            onUndoLastAction={onUndoLastAction}
          />
        ) : (
          <AnalysisResults 
            analysisResult={analysisResult}
            recognizedItems={recognizedItems}
            products={products}
            onSaveInventoryCounts={onSaveInventoryCounts}
            onGoToAddProduct={onGoToAddProduct}
            onResetCapture={onResetCapture}
            onUpdateItem={onUpdateItem}
            onRemoveItem={onRemoveItem}
            onAddToInventory={onAddToInventory}
            checkIfItemExists={checkIfItemExists}
          />
        )
      )}
    </div>
  );
};

export default CameraScanTab;
