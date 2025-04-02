import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Download, Plus, RefreshCw, Printer, BarChart2 } from "lucide-react";
import { InventoryRecognitionResult, Product } from "@/types/inventory";
import RecognizedItemsList from "./RecognizedItemsList";
import { useState } from "react";
import { toast } from "sonner";
import { addProduct } from "@/services/api/productService";

interface AnalysisResultsProps {
  analysisResult: string;
  recognizedItems: InventoryRecognitionResult[];
  products: Product[];
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
  onRemoveItem,
}: AnalysisResultsProps) => {
  const [isAddingToInventory, setIsAddingToInventory] = useState(false);

  const checkIfItemExists = (name: string): Product | undefined => {
    return products.find(p => 
      p.name.toLowerCase() === name.toLowerCase() ||
      p.name.toLowerCase().includes(name.toLowerCase()) ||
      name.toLowerCase().includes(p.name.toLowerCase())
    );
  };

  const addToInventory = async (item: InventoryRecognitionResult) => {
    try {
      setIsAddingToInventory(true);
      toast.loading(`Adding "${item.name}" to inventory...`);
      
      // Create a new product
      const newProduct = await addProduct({
        name: item.name,
        category: "Other", // Default category
        unit: "each", // Default unit
        currentStock: item.count,
        reorderPoint: 5, // Default reorder point
        cost: 0, // Default cost
        size: item.size
      });

      // Update the recognized item with the new product ID
      const updatedItem = { ...item, productId: newProduct.id };
      const itemIndex = recognizedItems.findIndex(i => i.name === item.name);
      if (itemIndex !== -1) {
        onUpdateItem(itemIndex, updatedItem);
      }
      
      toast.dismiss();
      toast.success(`"${item.name}" added to inventory`);
      
      return newProduct;
    } catch (error) {
      console.error("Error adding item to inventory:", error);
      toast.dismiss();
      toast.error("Failed to add item to inventory");
      return null;
    } finally {
      setIsAddingToInventory(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={onSaveInventoryCounts}
            >
              <Check className="h-4 w-4 mr-1" />
              Save Counts
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={onResetCapture}
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Reset
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={onGoToAddProduct}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Product
            </Button>
          </div>
        </CardContent>
      </Card>

      <RecognizedItemsList
        items={recognizedItems}
        products={products}
        onUpdateItem={onUpdateItem}
        onRemoveItem={onRemoveItem}
        onAddToInventory={addToInventory}
        checkIfItemExists={checkIfItemExists}
      />

      {analysisResult && (
        <Card>
          <CardContent className="p-4">
            <pre className="text-xs whitespace-pre-wrap">{analysisResult}</pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AnalysisResults;
