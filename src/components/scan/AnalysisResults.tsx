import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ItemSuggestionList from "./item-suggestion/ItemSuggestionList";
import { InventoryRecognitionResult, Product } from "@/types/inventory";

interface AnalysisResultsProps {
  analysisResult: string;
  recognizedItems: InventoryRecognitionResult[];
  products: Product[];
  onSaveInventoryCounts: () => void;
  onGoToAddProduct: () => void;
  onResetCapture: () => void;
  onUpdateItem: (index: number, item: InventoryRecognitionResult) => void;
  onRemoveItem: (index: number) => void;
  onAddToInventory?: (item: InventoryRecognitionResult) => Promise<Product | null>;
  checkIfItemExists: (name: string) => Product | undefined;
}

const AnalysisResults = ({
  analysisResult,
  recognizedItems,
  products,
  onSaveInventoryCounts,
  onGoToAddProduct,
  onResetCapture,
  onUpdateItem,
  onRemoveItem,
  onAddToInventory,
  checkIfItemExists
}: AnalysisResultsProps) => {
  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Analysis Result</h3>
          <p className="text-sm text-muted-foreground">{analysisResult}</p>
        </div>

        <ItemSuggestionList
          items={recognizedItems}
          products={products}
          onUpdateItem={onUpdateItem}
          onRemoveItem={onRemoveItem}
          onAddToInventory={onAddToInventory}
          selectedItemIndex={null}
          onSelectItem={() => {}}
        />

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onResetCapture}>
            Reset
          </Button>
          <Button onClick={onGoToAddProduct}>Add Product</Button>
          <Button onClick={onSaveInventoryCounts}>Save Counts</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnalysisResults;
