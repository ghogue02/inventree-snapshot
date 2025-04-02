
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { InventoryRecognitionResult, Product } from "@/types/inventory";
import VideoUploader from "@/components/scan/VideoUploader";
import BatchScanResults from "@/components/scan/BatchScanResults";
import { useIsMobile } from "@/hooks/use-mobile";

interface VideoScanTabProps {
  isProcessing: boolean;
  onVideoSelected: (file: File) => void;
  onProcessVideo: () => Promise<InventoryRecognitionResult[] | null>;
  recognizedItems: InventoryRecognitionResult[];
  products: Product[];
  onSaveInventoryCounts: () => void;
  onGoToAddProduct: () => void;
  onResetCapture: () => void;
  onUpdateItem: (index: number, item: InventoryRecognitionResult) => void;
  onRemoveItem: (index: number) => void;
  onAddToInventory: (item: InventoryRecognitionResult) => Promise<Product | null>;
  checkIfItemExists: (name: string) => Product | undefined;
  selectedItemIndex: number | null;
  onSelectItem: (index: number) => void;
  onUndoLastAction: () => void;
  analysisResult: string | null;
}

const VideoScanTab = ({
  isProcessing,
  onVideoSelected,
  onProcessVideo,
  recognizedItems,
  products,
  onSaveInventoryCounts,
  onGoToAddProduct,
  onResetCapture,
  onUpdateItem,
  onRemoveItem,
  onAddToInventory,
  checkIfItemExists,
  selectedItemIndex,
  onSelectItem,
  onUndoLastAction,
  analysisResult
}: VideoScanTabProps) => {
  const isMobile = useIsMobile();
  
  return (
    <Card>
      <CardContent className={isMobile ? "p-3" : "p-6 space-y-4"}>
        <VideoUploader 
          onVideoSelected={onVideoSelected}
          isProcessing={isProcessing} 
          onProcessVideo={onProcessVideo}
        />

        {recognizedItems.length > 0 && (
          <BatchScanResults
            analysisResult={analysisResult || ""}
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
        )}
      </CardContent>
    </Card>
  );
};

export default VideoScanTab;
