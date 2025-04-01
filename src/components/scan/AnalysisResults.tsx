
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Plus, RefreshCw } from "lucide-react";
import { InventoryRecognitionResult } from "@/types/inventory";
import RecognizedItemsList from "./RecognizedItemsList";

interface AnalysisResultsProps {
  analysisResult: string;
  recognizedItems: InventoryRecognitionResult[];
  products: any[];
  onSaveInventoryCounts: () => void;
  onGoToAddProduct: () => void;
  onResetCapture: () => void;
  onUpdateItem: (index: number, item: InventoryRecognitionResult) => void;
  onRemoveItem: (index: number) => void;
}

const AnalysisResults = ({
  analysisResult,
  recognizedItems,
  products,
  onSaveInventoryCounts,
  onGoToAddProduct,
  onResetCapture,
  onUpdateItem,
  onRemoveItem
}: AnalysisResultsProps) => {
  return (
    <Card className="mt-6">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-2">Analysis Results</h3>
        <div className="mb-4 whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded-md border">
          {analysisResult}
        </div>

        {recognizedItems.length > 0 && (
          <>
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-medium">Recognized Items</h4>
              <p className="text-sm text-muted-foreground">
                Review and edit items before saving
              </p>
            </div>
            <RecognizedItemsList 
              items={recognizedItems}
              products={products}
              onUpdateItem={onUpdateItem}
              onRemoveItem={onRemoveItem}
            />
            <div className="mt-4 flex gap-2 justify-end">
              <Button onClick={onSaveInventoryCounts} variant="default">
                <Check className="mr-2 h-4 w-4" />
                Save Inventory Counts
              </Button>
              <Button onClick={onGoToAddProduct} variant="secondary">
                <Plus className="mr-2 h-4 w-4" />
                Add as Product
              </Button>
              <Button onClick={onResetCapture} variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                Scan Again
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AnalysisResults;
