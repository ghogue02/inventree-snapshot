import { useState } from "react";
import { toast } from "sonner";
import { InventoryRecognitionResult, Product } from "@/types/inventory";
import { analyzeImageWithOpenAI, processInventoryVideo, addInventoryCounts, addProduct } from "@/services/apiService";
import { useNavigate } from "react-router-dom";

export const useScanAnalysis = (products: Product[]) => {
  const navigate = useNavigate();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [recognizedItems, setRecognizedItems] = useState<InventoryRecognitionResult[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const analyzeImage = async (imageData?: string) => {
    const imageToAnalyze = imageData || capturedImage;
    
    if (!imageToAnalyze) return;
    
    setIsAnalyzing(true);
    
    try {
      const base64Data = imageToAnalyze.split(",")[1];
      
      toast.loading("Analyzing image...");
      
      const result = await analyzeImageWithOpenAI(
        imageToAnalyze,
        "Please analyze this image and identify all food inventory items you see. For each item, include the specific product name, size/volume information, and quantity as individual units."
      );
      
      setAnalysisResult(result);
      toast.dismiss();
      toast.success("Analysis complete");
      
      const recognizedItems = extractItemsFromAnalysis(result, products);
      setRecognizedItems(recognizedItems);
      
    } catch (error) {
      console.error("Error analyzing image:", error);
      toast.dismiss();
      toast.error("Failed to analyze image. Please try again or upload a clearer photo.");
      setAnalysisResult(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const extractItemsFromAnalysis = (analysisText: string, products: Product[]): InventoryRecognitionResult[] => {
    const items: InventoryRecognitionResult[] = [];
    const lines = analysisText.split("\n");
    
    let currentProductName = "";
    let currentSize = "";
    let currentQuantity = 0;
    
    for (const line of lines) {
      // Extract size/volume information
      const sizeMatch = line.match(/size\s*\/?\s*volume:?\s*(.+)/i) || 
                       line.match(/([0-9.]+\s*(?:oz|g|ml|L|lb|kg)(?:\s*\(\s*[0-9.]+\s*[a-z]+\s*\))?)/i);
      
      if (sizeMatch) {
        currentSize = sizeMatch[1].trim();
      }
      
      // Extract product name
      const nameLine = line.match(/product name:?\s*(.+)/i) ||
                      line.match(/^[0-9]+\.\s*(.+)/);
      if (nameLine) {
        currentProductName = nameLine[1].trim();
        
        // Check for size in the product name if not found earlier
        if (!currentSize) {
          const sizeInName = currentProductName.match(/([0-9.]+\s*(?:oz|g|ml|L|lb|kg)(?:\s*\(\s*[0-9.]+\s*[a-z]+\s*\))?)/i);
          if (sizeInName) {
            currentSize = sizeInName[1].trim();
          }
        }
      }
      
      // Extract quantity - check multiple formats
      const quantityLine = line.match(/quantity:?\s*(\d+)/i) ||
                          line.match(/count:?\s*(\d+)/i) ||
                          line.match(/units?:?\s*(\d+)/i);
      if (quantityLine) {
        currentQuantity = parseInt(quantityLine[1], 10);
      }
      
      // If we have a complete item, add it to the list
      if (currentProductName && 
         (line.includes("Size/Volume:") || line.includes("Quantity:") || line.includes("Count:") ||
          line.trim().length === 0 || line.includes("No other") || line.includes("visible"))) {
        
        const matchedProduct = checkIfItemExists(currentProductName);
        
        // Only add if we have a valid quantity
        if (currentQuantity > 0) {
          items.push({
            productId: matchedProduct?.id || "",
            name: currentProductName,
            count: currentQuantity,
            confidence: 0.9,
            size: currentSize || ""
          });
        }
        
        // Reset for next item
        currentProductName = "";
        currentSize = "";
        currentQuantity = 0; // Reset to 0
      }
    }
    
    // Add the last item if there is one and has a valid quantity
    if (currentProductName && currentQuantity > 0) {
      const matchedProduct = checkIfItemExists(currentProductName);
      
      items.push({
        productId: matchedProduct?.id || "",
        name: currentProductName,
        count: currentQuantity,
        confidence: 0.9,
        size: currentSize || ""
      });
    }
    
    return items;
  };

  const processVideo = async () => {
    if (!selectedFile) {
      toast.error("Please select a file first");
      return;
    }

    setIsUploading(true);

    try {
      const results = await processInventoryVideo(selectedFile);
      setRecognizedItems(results);
      setAnalysisResult("Video processed successfully. Here are the detected items:");
      
    } catch (error) {
      console.error("Error processing video:", error);
      toast.error("Failed to process video");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelected = (file: File) => {
    setSelectedFile(file);
  };

  const saveInventoryCounts = async () => {
    if (recognizedItems.length === 0) {
      toast.error("No items to save");
      return;
    }

    try {
      toast.loading("Saving inventory counts...");
      
      // Filter out items that don't have a product ID
      const validCounts = recognizedItems
        .filter(item => item.productId)
        .map(item => ({
          productId: item.productId,
          count: item.count,
          countedAt: new Date(),
          countMethod: "video" as const,
          notes: "Counted via camera scan"
        }));

      if (validCounts.length === 0) {
        toast.dismiss();
        toast.warning("No valid inventory items to save. Please add products to inventory first.");
        return;
      }
      
      console.log("Attempting to save inventory counts:", validCounts);
      
      const result = await addInventoryCounts(validCounts);
      
      toast.dismiss();
      toast.success("Inventory counts saved successfully");
      navigate("/inventory");
      
    } catch (error) {
      console.error("Error saving inventory counts:", error);
      toast.dismiss();
      toast.error("Failed to save inventory counts: " + (error instanceof Error ? error.message : "Unknown error"));
    }
  };

  const updateRecognizedItem = (index: number, updatedItem: InventoryRecognitionResult) => {
    const updatedItems = [...recognizedItems];
    updatedItems[index] = updatedItem;
    setRecognizedItems(updatedItems);
  };

  const removeRecognizedItem = (index: number) => {
    const updatedItems = recognizedItems.filter((_, i) => i !== index);
    setRecognizedItems(updatedItems);
    toast.success("Item removed from list");
  };

  const resetCapture = () => {
    setCapturedImage(null);
    setAnalysisResult(null);
    setRecognizedItems([]);
  };

  const goToAddProduct = () => {
    if (capturedImage) {
      sessionStorage.setItem('capturedProductImage', capturedImage);
      navigate("/add-product?mode=camera");
    } else {
      navigate("/add-product");
    }
  };

  const checkIfItemExists = (name: string): Product | undefined => {
    if (!name) return undefined;
    
    const normalizedName = name.toLowerCase().trim();
    return products.find(
      product => product.name.toLowerCase().trim().includes(normalizedName) || 
                normalizedName.includes(product.name.toLowerCase().trim())
    );
  };

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

  return {
    capturedImage,
    setCapturedImage,
    isAnalyzing,
    analysisResult,
    recognizedItems,
    isUploading,
    resetCapture,
    analyzeImage,
    processVideo,
    saveInventoryCounts,
    updateRecognizedItem,
    removeRecognizedItem,
    goToAddProduct,
    handleFileSelected,
    checkIfItemExists,
    addToInventory
  };
};
