
import { useState } from "react";
import { InventoryRecognitionResult, Product } from "@/types/inventory";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Check, Edit, Trash } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ItemSuggestionListProps {
  items: InventoryRecognitionResult[];
  products: Product[];
  onUpdateItem: (index: number, item: InventoryRecognitionResult) => void;
  onRemoveItem: (index: number) => void;
  onAddToInventory?: (item: InventoryRecognitionResult) => Promise<Product | null>;
  selectedItemIndex: number | null;
  onSelectItem: (index: number) => void;
}

const ItemSuggestionList = ({
  items,
  products,
  onUpdateItem,
  onRemoveItem,
  onAddToInventory,
  selectedItemIndex,
  onSelectItem
}: ItemSuggestionListProps) => {
  const [addingItemIndex, setAddingItemIndex] = useState<number | null>(null);
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
  
  const handleAddToInventory = async (item: InventoryRecognitionResult, index: number) => {
    if (!onAddToInventory) return;
    
    setAddingItemIndex(index);
    try {
      await onAddToInventory(item);
    } finally {
      setAddingItemIndex(null);
    }
  };
  
  const handleQuantityChange = (index: number, newValue: number) => {
    const item = items[index];
    if (item) {
      onUpdateItem(index, {
        ...item,
        count: newValue
      });
    }
  };
  
  const handleSaveEdit = (index: number) => {
    setEditingItemIndex(null);
    toast.success("Item updated");
  };

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-medium">Suggested Items</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Select an item to update its quantity
      </p>
      
      <div className="grid gap-2">
        {items.map((item, index) => {
          const isSelected = selectedItemIndex === index;
          const itemExists = !!item.productId;
          
          return (
            <div 
              key={index} 
              className={cn(
                "border rounded-md p-3 transition-all",
                isSelected ? "border-primary bg-primary/5" : "hover:bg-gray-50",
                editingItemIndex === index ? "border-blue-500 bg-blue-50" : ""
              )}
              onClick={() => onSelectItem(index)}
            >
              {editingItemIndex === index ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-500">Product Name</label>
                    <Input 
                      value={item.name}
                      onChange={(e) => onUpdateItem(index, { ...item, name: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-gray-500">Size/Volume</label>
                      <Input 
                        value={item.size || ''}
                        onChange={(e) => onUpdateItem(index, { ...item, size: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Quantity</label>
                      <Input 
                        type="number"
                        value={item.count}
                        onChange={(e) => onUpdateItem(index, { ...item, count: parseFloat(e.target.value) })}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="outline" onClick={() => setEditingItemIndex(null)}>
                      Cancel
                    </Button>
                    <Button size="sm" onClick={() => handleSaveEdit(index)}>
                      <Check className="mr-1 h-4 w-4" />
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium flex items-center gap-2">
                      {item.name}
                      {!itemExists && (
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                          Not in inventory
                        </Badge>
                      )}
                      {item.confidence >= 0.9 && (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          High confidence
                        </Badge>
                      )}
                    </div>
                    {item.size && (
                      <div className="text-xs text-muted-foreground">
                        Size: {item.size}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {isSelected && (
                      <div className="flex items-center border rounded-md overflow-hidden">
                        <button 
                          className="px-2 py-1 bg-gray-100 hover:bg-gray-200"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (item.count > 0.5) handleQuantityChange(index, item.count - 0.5);
                          }}
                        >
                          -
                        </button>
                        <span className="px-3 py-1 font-medium">{item.count}</span>
                        <button 
                          className="px-2 py-1 bg-gray-100 hover:bg-gray-200"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleQuantityChange(index, item.count + 0.5);
                          }}
                        >
                          +
                        </button>
                      </div>
                    )}
                    
                    {!isSelected && (
                      <span className="font-medium">{item.count}</span>
                    )}
                    
                    <div className="flex gap-1">
                      {!itemExists && onAddToInventory && (
                        <Button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToInventory(item, index);
                          }} 
                          size="sm" 
                          variant="outline"
                          className={cn("text-green-600 border-green-600", 
                            "hover:bg-green-50 hover:text-green-700")}
                          disabled={addingItemIndex === index}
                        >
                          {addingItemIndex === index ? (
                            <span className="flex items-center">
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Adding...
                            </span>
                          ) : (
                            <>
                              <Plus className="h-4 w-4 mr-1" />
                              Add
                            </>
                          )}
                        </Button>
                      )}
                      
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingItemIndex(index);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveItem(index);
                        }}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        
        {items.length === 0 && (
          <div className="text-center p-6 border rounded-md bg-gray-50">
            <p className="text-muted-foreground">No items detected. Try scanning again.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ItemSuggestionList;
