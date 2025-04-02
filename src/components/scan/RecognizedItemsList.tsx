import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus } from "lucide-react";
import { InventoryRecognitionResult, Product } from "@/types/inventory";

interface RecognizedItemsListProps {
  items: InventoryRecognitionResult[];
  products: Product[];
  onUpdateItem: (index: number, item: InventoryRecognitionResult) => void;
  onRemoveItem: (index: number) => void;
  onAddToInventory: (item: InventoryRecognitionResult) => Promise<Product | null>;
  checkIfItemExists: (name: string) => Product | undefined;
}

const RecognizedItemsList = ({
  items,
  products,
  onUpdateItem,
  onRemoveItem,
  onAddToInventory,
  checkIfItemExists
}: RecognizedItemsListProps) => {
  if (!items.length) return null;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Recognized Items</h3>
          <div className="space-y-3">
            {items.map((item, index) => {
              const existingProduct = checkIfItemExists(item.name);
              const isInInventory = !!existingProduct || !!item.productId;

              return (
                <div key={index} className="flex flex-col gap-3 p-2 bg-gray-50 rounded-md">
                  <div className="w-full">
                    <Input
                      value={item.name}
                      onChange={(e) => onUpdateItem(index, { ...item, name: e.target.value })}
                      className="mb-1 w-full min-w-0 break-words"
                    />
                    <div className="text-sm text-gray-500">
                      Size: {item.size && item.size !== 'N/A' ? item.size : 'Not specified'} | Count: {item.count} | 
                      Confidence: {Math.round(item.confidence * 100)}%
                    </div>
                    {existingProduct && (
                      <div className="text-sm text-blue-600 mt-1">
                        Matches existing product: {existingProduct.name}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 justify-end">
                    {!isInInventory && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onAddToInventory(item)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add to Inventory
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveItem(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecognizedItemsList;
