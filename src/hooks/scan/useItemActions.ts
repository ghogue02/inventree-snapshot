
import { useState } from "react";
import { toast } from "sonner";
import { InventoryRecognitionResult, Product } from "@/types/inventory";

interface Action {
  type: 'update' | 'remove' | 'select';
  item: InventoryRecognitionResult;
  index: number;
  previousValue?: InventoryRecognitionResult;
}

export const useItemActions = (initialItems: InventoryRecognitionResult[] = []) => {
  const [recognizedItems, setRecognizedItems] = useState<InventoryRecognitionResult[]>(initialItems);
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);
  const [actionHistory, setActionHistory] = useState<Action[]>([]);
  const [autoAdvance, setAutoAdvance] = useState(true);
  
  const updateRecognizedItem = (index: number, updatedItem: InventoryRecognitionResult) => {
    const updatedItems = [...recognizedItems];
    
    const previousValue = updatedItems[index];
    
    updatedItems[index] = updatedItem;
    setRecognizedItems(updatedItems);
    
    setActionHistory(prev => [
      ...prev, 
      { type: 'update', item: updatedItem, index, previousValue }
    ]);
    
    if (autoAdvance && index < recognizedItems.length - 1) {
      setTimeout(() => {
        setSelectedItemIndex(index + 1);
      }, 300);
    }
  };

  const removeRecognizedItem = (index: number) => {
    const itemToRemove = recognizedItems[index];
    
    const updatedItems = recognizedItems.filter((_, i) => i !== index);
    setRecognizedItems(updatedItems);
    
    if (selectedItemIndex === index) {
      setSelectedItemIndex(null);
    } else if (selectedItemIndex !== null && selectedItemIndex > index) {
      setSelectedItemIndex(selectedItemIndex - 1);
    }
    
    setActionHistory(prev => [
      ...prev, 
      { type: 'remove', item: itemToRemove, index }
    ]);
    
    toast.success("Item removed from list", {
      action: {
        label: "Undo",
        onClick: () => undoLastAction()
      }
    });
  };
  
  const undoLastAction = () => {
    const lastAction = actionHistory[actionHistory.length - 1];
    
    if (!lastAction) return;
    
    switch (lastAction.type) {
      case 'update':
        if (lastAction.previousValue) {
          const updatedItems = [...recognizedItems];
          updatedItems[lastAction.index] = lastAction.previousValue;
          setRecognizedItems(updatedItems);
        }
        break;
        
      case 'remove':
        const newItems = [...recognizedItems];
        newItems.splice(lastAction.index, 0, lastAction.item);
        setRecognizedItems(newItems);
        break;
        
      case 'select':
        setSelectedItemIndex(lastAction.index);
        break;
    }
    
    setActionHistory(prev => prev.slice(0, -1));
    toast.success("Action undone");
  };

  const selectItem = (index: number) => {
    const previousIndex = selectedItemIndex;
    if (previousIndex !== null) {
      setActionHistory(prev => [
        ...prev, 
        { 
          type: 'select', 
          index: previousIndex,
          item: recognizedItems[previousIndex]
        }
      ]);
    }
    
    setSelectedItemIndex(index);
  };

  return {
    recognizedItems,
    setRecognizedItems,
    selectedItemIndex,
    setSelectedItemIndex,
    actionHistory,
    autoAdvance,
    setAutoAdvance,
    updateRecognizedItem,
    removeRecognizedItem,
    undoLastAction,
    selectItem
  };
};
