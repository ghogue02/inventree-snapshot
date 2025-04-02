
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, RefreshCw, Plus, Save } from "lucide-react";
import { InventoryRecognitionResult, Product } from "@/types/inventory";
import ItemSuggestionList from "./ItemSuggestionList";
import { useIsMobile } from "@/hooks/use-mobile";

interface BatchScanResultsProps {
  analysisResult: string | null;
  recognizedItems: InventoryRecognitionResult[];
  products: Product[];
  onSaveInventoryCounts: () => void;
  onGoToAddProduct: () => void;
  onResetCapture: () => void;
  onUpdateItem: (index: number, item: InventoryRecognitionResult) => void;
  onRemoveItem: (index: number) => void;
  onAddToInventory?: (item: InventoryRecognitionResult) => Promise<Product | null>;
  checkIfItemExists?: (name: string) => Product | undefined;
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
  checkIfItemExists
}: BatchScanResultsProps) => {
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);
  const isMobile = useIsMobile();

  return (
    <Card className={`mt-6 ${isMobile ? 'shadow-sm' : ''}`}>
      <CardContent className={isMobile ? "p-3" : "p-6"}>
        <h3 className="text-lg font-semibold mb-4">AI Shelf Analysis</h3>
        
        {recognizedItems.length > 0 ? (
          <div className="space-y-6">
            <ItemSuggestionList 
              items={recognizedItems}
              products={products}
              onUpdateItem={onUpdateItem}
              onRemoveItem={onRemoveItem}
              onAddToInventory={onAddToInventory}
              selectedItemIndex={selectedItemIndex}
              onSelectItem={setSelectedItemIndex}
            />
            
            {isMobile ? (
              <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t shadow-lg z-10 flex gap-2">
                <Button 
                  onClick={onSaveInventoryCounts} 
                  variant="default" 
                  className="flex-1"
                  size="lg"
                >
                  <Save className="mr-2 h-5 w-5" />
                  Save Counts
                </Button>
                <Button 
                  onClick={onResetCapture} 
                  variant="outline" 
                  size="lg"
                >
                  <RefreshCw className="h-5 w-5" />
                </Button>
              </div>
            ) : (
              <div className="flex flex-wrap gap-3 justify-end">
                <Button onClick={onSaveInventoryCounts} variant="default">
                  <Check className="mr-2 h-4 w-4" />
                  Save Inventory Counts
                </Button>
                <Button onClick={onGoToAddProduct} variant="secondary">
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Product
                </Button>
                <Button onClick={onResetCapture} variant="outline">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Scan Again
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center p-6">
            <p className="text-muted-foreground">No items detected</p>
            <Button onClick={onResetCapture} variant="outline" className="mt-4">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </div>
        )}
        
        {/* Add padding at the bottom for mobile devices to account for the fixed buttons */}
        {isMobile && recognizedItems.length > 0 && <div className="h-20"></div>}
      </CardContent>
    </Card>
  );
};

export default BatchScanResults;
