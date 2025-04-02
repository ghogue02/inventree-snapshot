
import { useState } from "react";
import { toast } from "sonner";
import { InventoryRecognitionResult, Product } from "@/types/inventory";

export const useProductDialog = (recognizedItems: InventoryRecognitionResult[], 
                               setRecognizedItems: (items: InventoryRecognitionResult[]) => void) => {
  const [productFormOpen, setProductFormOpen] = useState(false);
  const [currentItemToAdd, setCurrentItemToAdd] = useState<InventoryRecognitionResult | null>(null);

  const openAddProductDialog = (item: InventoryRecognitionResult) => {
    setCurrentItemToAdd(item);
    setProductFormOpen(true);
  };

  const handleProductAdded = (newProduct: Product) => {
    if (currentItemToAdd) {
      const updatedItems = recognizedItems.map(item => {
        if (item.name.toLowerCase().trim() === currentItemToAdd.name.toLowerCase().trim()) {
          return { ...item, productId: newProduct.id };
        }
        return item;
      });
      
      setRecognizedItems(updatedItems);
    }
    
    setProductFormOpen(false);
    setCurrentItemToAdd(null);
    
    toast.success(`"${newProduct.name}" added to inventory`);
  };

  const addToInventory = async (item: InventoryRecognitionResult) => {
    openAddProductDialog(item);
    return null;
  };

  return {
    productFormOpen,
    setProductFormOpen,
    currentItemToAdd,
    openAddProductDialog,
    handleProductAdded,
    addToInventory
  };
};
