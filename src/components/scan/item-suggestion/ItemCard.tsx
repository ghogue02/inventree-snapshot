
import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { InventoryRecognitionResult } from "@/types/inventory";
import ItemQuantityControl from "./ItemQuantityControl";
import ItemEditForm from "./ItemEditForm";
import ItemActionButtons from "./ItemActionButtons";

interface ItemCardProps {
  item: InventoryRecognitionResult;
  index: number;
  isSelected: boolean;
  isEditing: boolean;
  isAdding: boolean;
  onSelect: (index: number) => void;
  onUpdateItem: (index: number, item: InventoryRecognitionResult) => void;
  onRemoveItem: (index: number) => void;
  onAddToInventory?: (item: InventoryRecognitionResult, index: number) => Promise<void>;
  onStartEdit: (index: number) => void;
  onCancelEdit: () => void;
  onSaveEdit: (index: number) => void;
}

const ItemCard = ({ 
  item, 
  index, 
  isSelected, 
  isEditing, 
  isAdding,
  onSelect, 
  onUpdateItem, 
  onRemoveItem, 
  onAddToInventory,
  onStartEdit,
  onCancelEdit,
  onSaveEdit
}: ItemCardProps) => {
  const itemExists = !!item.productId;
  
  const handleQuantityChange = (newValue: number) => {
    onUpdateItem(index, {
      ...item,
      count: newValue
    });
  };
  
  const handleAddToInventory = async () => {
    if (onAddToInventory) {
      await onAddToInventory(item, index);
    }
  };

  return (
    <div 
      className={cn(
        "border rounded-md p-3 transition-all",
        isSelected ? "border-primary bg-primary/5" : "hover:bg-gray-50",
        isEditing ? "border-blue-500 bg-blue-50" : ""
      )}
      onClick={() => onSelect(index)}
    >
      {isEditing ? (
        <ItemEditForm
          item={item}
          onUpdate={(updatedItem) => onUpdateItem(index, updatedItem)}
          onCancel={onCancelEdit}
          onSave={() => onSaveEdit(index)}
        />
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
            {isSelected ? (
              <ItemQuantityControl 
                count={item.count}
                onQuantityChange={handleQuantityChange}
              />
            ) : (
              <span className="font-medium">{item.count}</span>
            )}
            
            <ItemActionButtons
              itemExists={itemExists}
              onAddToInventory={handleAddToInventory}
              onEdit={() => onStartEdit(index)}
              onRemove={() => onRemoveItem(index)}
              isAddingToInventory={isAdding}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemCard;
