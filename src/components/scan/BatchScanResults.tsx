
import React from "react";
import { InventoryRecognitionResult, Product } from "@/types/inventory";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import ItemSuggestionList from "./item-suggestion/ItemSuggestionList";
import { Undo } from "lucide-react";

interface BatchScanResultsProps {
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
  selectedItemIndex: number | null;
  onSelectItem: (index: number) => void;
  onUndoLastAction?: () => void;
}

const BatchScanResults = ({
  analysisResult,
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
  onUndoLastAction
}: BatchScanResultsProps) => {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-bold">Analysis Result</h4>
        <p className="text-muted-foreground text-sm">{analysisResult}</p>
      </div>

      <ItemSuggestionList
        items={recognizedItems}
        products={products}
        onUpdateItem={onUpdateItem}
        onRemoveItem={onRemoveItem}
        onAddToInventory={onAddToInventory}
        selectedItemIndex={selectedItemIndex}
        onSelectItem={onSelectItem}
      />

      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button variant="outline" onClick={onResetCapture}>
            Reset
          </Button>
          {onUndoLastAction && (
            <Button variant="outline" onClick={onUndoLastAction} className="flex items-center gap-1">
              <Undo className="h-4 w-4" />
              Undo
            </Button>
          )}
        </div>
        <div>
          <Button variant="secondary" onClick={onGoToAddProduct}>
            Add Product
          </Button>
          <Button className={cn("ml-2")} onClick={onSaveInventoryCounts}>
            Save Counts
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BatchScanResults;
