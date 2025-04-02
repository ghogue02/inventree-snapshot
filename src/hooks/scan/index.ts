
// Export all scan hooks from this index file
export * from './useImageAnalysis';
export * from './useVideoProcessing';
export * from './useItemActions';
export * from './useInventorySaving';
export * from './useProductDialog';

// Main hook that combines all the others
import { useState, useEffect } from 'react';
import { InventoryRecognitionResult, Product } from "@/types/inventory";
import { useImageAnalysis } from './useImageAnalysis';
import { useVideoProcessing } from './useVideoProcessing';
import { useItemActions } from './useItemActions';
import { useInventorySaving } from './useInventorySaving';
import { useProductDialog } from './useProductDialog';

export const useScanAnalysis = (products: Product[]) => {
  const imageAnalysis = useImageAnalysis();
  const videoProcessing = useVideoProcessing();
  const itemActions = useItemActions();
  const inventorySaving = useInventorySaving();
  
  const productDialog = useProductDialog(
    itemActions.recognizedItems, 
    itemActions.setRecognizedItems
  );

  // Sync recognizedItems between hooks
  useEffect(() => {
    if (imageAnalysis.recognizedItems.length > 0 && itemActions.recognizedItems.length === 0) {
      itemActions.setRecognizedItems(imageAnalysis.recognizedItems);
    }
  }, [imageAnalysis.recognizedItems]);

  // Set up process video handler that updates items state
  const processVideo = async () => {
    const results = await videoProcessing.processVideo();
    if (results) {
      const enhancedItems = results.map(item => {
        const matchedProduct = imageAnalysis.checkIfItemExists(item.name, products);
        return {
          ...item,
          productId: matchedProduct?.id || "",
        };
      });
      
      itemActions.setRecognizedItems(enhancedItems);
      return enhancedItems;
    }
    return null;
  };

  // Enhanced analyzeImage that uses products
  const analyzeImage = async (imageData?: string) => {
    await imageAnalysis.analyzeImage(imageData, products);
  };
  
  // Save inventory counts using the current recognized items
  const saveInventoryCounts = async () => {
    await inventorySaving.saveInventoryCounts(itemActions.recognizedItems);
  };

  // Need to implement a check for existing products that uses the current products prop
  const checkIfItemExists = (name: string): Product | undefined => {
    return imageAnalysis.checkIfItemExists(name, products);
  };

  return {
    // From imageAnalysis
    capturedImage: imageAnalysis.capturedImage,
    setCapturedImage: imageAnalysis.setCapturedImage,
    isAnalyzing: imageAnalysis.isAnalyzing,
    analysisResult: imageAnalysis.analysisResult,
    scanMode: imageAnalysis.scanMode,
    setScanMode: imageAnalysis.setScanMode,
    resetCapture: () => {
      imageAnalysis.resetCapture();
      itemActions.setRecognizedItems([]);
      itemActions.setSelectedItemIndex(null);
    },
    analyzeImage,
    
    // From itemActions
    recognizedItems: itemActions.recognizedItems,
    selectedItemIndex: itemActions.selectedItemIndex,
    selectItem: itemActions.selectItem,
    updateRecognizedItem: itemActions.updateRecognizedItem,
    removeRecognizedItem: itemActions.removeRecognizedItem,
    undoLastAction: itemActions.undoLastAction,
    autoAdvance: itemActions.autoAdvance,
    setAutoAdvance: itemActions.setAutoAdvance,
    
    // From videoProcessing
    isUploading: videoProcessing.isUploading,
    processVideo,
    handleFileSelected: videoProcessing.handleFileSelected,
    
    // From inventorySaving
    saveInventoryCounts,
    goToAddProduct: () => inventorySaving.goToAddProduct(imageAnalysis.capturedImage),
    
    // From productDialog
    productFormOpen: productDialog.productFormOpen,
    setProductFormOpen: productDialog.setProductFormOpen,
    currentItemToAdd: productDialog.currentItemToAdd,
    handleProductAdded: productDialog.handleProductAdded,
    addToInventory: productDialog.addToInventory,
    
    // Additional utilities
    checkIfItemExists
  };
};
