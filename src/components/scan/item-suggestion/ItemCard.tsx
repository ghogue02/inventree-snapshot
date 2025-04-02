
import React, { useRef, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { InventoryRecognitionResult } from "@/types/inventory";
import ItemQuantityControl from "./ItemQuantityControl";
import ItemEditForm from "./ItemEditForm";
import ItemActionButtons from "./ItemActionButtons";
import { HelpCircle } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const cardRef = useRef<HTMLDivElement>(null);
  const itemExists = !!item.productId;
  const isMobile = useIsMobile();
  
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
  
  // Scroll into view when selected
  useEffect(() => {
    if (isSelected && cardRef.current) {
      // Use a small timeout to ensure DOM updates have completed
      setTimeout(() => {
        cardRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'nearest',
        });
      }, 100);
    }
  }, [isSelected]);

  return (
    <div 
      ref={cardRef}
      className={cn(
        "border rounded-md transition-all",
        isMobile ? "p-4" : "p-3",
        isSelected ? "border-primary bg-primary/5 shadow-sm" : 
                    "hover:bg-gray-50 border-gray-200",
        isEditing ? "border-blue-500 bg-blue-50" : "",
        item.confidence < 0.7 && !isSelected ? "bg-gray-50/70" : "",
        "cursor-pointer"
      )}
      onClick={() => onSelect(index)}
      role="button"
      aria-pressed={isSelected}
      tabIndex={0}
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
            <div className="font-medium flex items-center gap-2 flex-wrap">
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
              {item.confidence < 0.7 && (
                <Badge variant="outline" className="bg-gray-50 text-gray-500 border-gray-200 flex items-center gap-1">
                  <HelpCircle className="h-3 w-3" />
                  Low confidence
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
