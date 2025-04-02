
import { useState } from "react";
import { InventoryRecognitionResult, Product } from "@/types/inventory";
import useImageAnalysis from "./useImageAnalysis";
import useInventorySaving from "./useInventorySaving";
import { useNavigate } from "react-router-dom";
import { addProduct } from "@/services/apiService";
import { toast } from "sonner";

export const useScanFunctionality = (products: Product[]) => {
  const navigate = useNavigate();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [recognizedItems, setRecognizedItems] = useState<InventoryRecognitionResult[]>([]);
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);
  
  const imageAnalysis = useImageAnalysis();
  const inventorySaving = useInventorySaving();

  // Reset capture state
  const resetCapture = () => {
    setCapturedImage(null);
    imageAnalysis.resetAnalysis();
    setRecognizedItems([]);
    setSelectedItemIndex(null);
  };

  // Analyze image from camera
  const analyzeImage = async (imageData: string) => {
    setCapturedImage(imageData);
    const result = await imageAnalysis.analyzeSingleItemImage(imageData);
    
    if (result) {
      const matchedItems = imageAnalysis.matchItemsWithProducts(
        imageAnalysis.recognizedItems,
        products
      );
      setRecognizedItems(matchedItems);
    }
    
    return result;
  };
  
  // Check if item name matches any product
  const checkIfItemExists = (name: string): Product | undefined => {
    if (!name) return undefined;
    
    const normalizedName = name.toLowerCase().trim();
    return products.find(
      product => product.name.toLowerCase().trim().includes(normalizedName) || 
                normalizedName.includes(product.name.toLowerCase().trim())
    );
  };
  
  // Add new product to inventory
  const addToInventory = async (item: InventoryRecognitionResult) => {
    try {
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
      const updatedItems = recognizedItems.map(existingItem => {
        if (existingItem.name === item.name) {
          return { ...existingItem, productId: newProduct.id };
        }
        return existingItem;
      });
      
      setRecognizedItems(updatedItems);
      
      toast.dismiss();
      toast.success(`"${item.name}" added to inventory`);
      
      return newProduct;
    } catch (error) {
      console.error("Error adding item to inventory:", error);
      toast.dismiss();
      toast.error("Failed to add item to inventory");
      return null;
    }
  };
  
  // Update recognized item
  const updateRecognizedItem = (index: number, updatedItem: InventoryRecognitionResult) => {
    const updatedItems = [...recognizedItems];
    updatedItems[index] = updatedItem;
    setRecognizedItems(updatedItems);
  };

  // Remove recognized item
  const removeRecognizedItem = (index: number) => {
    const updatedItems = recognizedItems.filter((_, i) => i !== index);
    setRecognizedItems(updatedItems);
    toast.success("Item removed from list");
  };
  
  // Go to add product page
  const goToAddProduct = () => {
    if (capturedImage) {
      sessionStorage.setItem('capturedProductImage', capturedImage);
      navigate("/add-product?mode=camera");
    } else {
      navigate("/add-product");
    }
  };
  
  // Process video for inventory
  const processVideo = async (file: File) => {
    await imageAnalysis.processVideo(file);
    
    if (imageAnalysis.recognizedItems.length > 0) {
      const matchedItems = imageAnalysis.matchItemsWithProducts(
        imageAnalysis.recognizedItems,
        products
      );
      setRecognizedItems(matchedItems);
    }
  };
  
  // Save inventory counts and redirect
  const saveInventoryCounts = async () => {
    await inventorySaving.saveInventoryCounts(recognizedItems, capturedImage);
  };

  return {
    capturedImage,
    setCapturedImage,
    recognizedItems,
    setRecognizedItems,
    selectedItemIndex,
    setSelectedItemIndex,
    isAnalyzing: imageAnalysis.isAnalyzing,
    isUploading: imageAnalysis.isUploading,
    analysisResult: imageAnalysis.analysisResult,
    resetCapture,
    analyzeImage,
    processVideo,
    saveInventoryCounts,
    updateRecognizedItem,
    removeRecognizedItem,
    goToAddProduct,
    checkIfItemExists,
    addToInventory
  };
};

export default useScanFunctionality;
