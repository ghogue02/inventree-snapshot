
import { useState } from "react";
import { InventoryRecognitionResult, Product } from "@/types/inventory";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import ItemCard from "./ItemCard";

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
  const isMobile = useIsMobile();
  
  const handleAddToInventory = async (item: InventoryRecognitionResult, index: number) => {
    if (!onAddToInventory) return;
    
    setAddingItemIndex(index);
    try {
      await onAddToInventory(item);
      // Add haptic feedback if available
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    } finally {
      setAddingItemIndex(null);
    }
  };
  
  const handleSaveEdit = (index: number) => {
    setEditingItemIndex(null);
    toast.success("Item updated");
  };
  
  const handleSelectItem = (index: number) => {
    onSelectItem(index);
    
    // Add haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(40);
    }
  };

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-medium">Suggested Items</h3>
      <p className="text-sm text-muted-foreground mb-4">
        {isMobile ? "Tap an item to update its quantity" : "Select an item to update its quantity"}
      </p>
      
      <div className="grid gap-2">
        {items.map((item, index) => (
          <ItemCard
            key={index}
            item={item}
            index={index}
            isSelected={selectedItemIndex === index}
            isEditing={editingItemIndex === index}
            isAdding={addingItemIndex === index}
            onSelect={handleSelectItem}
            onUpdateItem={onUpdateItem}
            onRemoveItem={onRemoveItem}
            onAddToInventory={handleAddToInventory}
            onStartEdit={(index) => setEditingItemIndex(index)}
            onCancelEdit={() => setEditingItemIndex(null)}
            onSaveEdit={handleSaveEdit}
          />
        ))}
        
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
