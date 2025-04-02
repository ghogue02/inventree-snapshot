
import { useState } from "react";
import { toast } from "sonner";
import { InventoryRecognitionResult, Product } from "@/types/inventory";
import { analyzeImageWithOpenAI, processInventoryVideo } from "@/services/apiService";

export const useImageAnalysis = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string>("");
  const [recognizedItems, setRecognizedItems] = useState<InventoryRecognitionResult[]>([]);

  // Reset analysis state
  const resetAnalysis = () => {
    setAnalysisResult("");
    setRecognizedItems([]);
  };

  // Process image with single item analysis
  const analyzeSingleItemImage = async (imageData: string): Promise<boolean> => {
    setIsAnalyzing(true);
    
    try {
      toast.loading("Analyzing image...");
      
      // Process as single item analysis
      const result = await analyzeImageWithOpenAI(
        imageData,
        "Please analyze this image and identify all food inventory items you see. For each item, include the specific product name, size/volume information, and quantity as individual units."
      );
      
      setAnalysisResult(result);
      
      const extractedItems = extractItemsFromAnalysis(result);
      setRecognizedItems(extractedItems);
      
      toast.dismiss();
      toast.success("Analysis complete");
      
      return true;
    } catch (error) {
      console.error("Error analyzing image:", error);
      toast.dismiss();
      toast.error("Failed to analyze image. Please try again or upload a clearer photo.");
      return false;
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Extract items from analysis text
  const extractItemsFromAnalysis = (analysisText: string): InventoryRecognitionResult[] => {
    const items: InventoryRecognitionResult[] = [];
    const lines = analysisText.split("\n");
    
    // Extract product information from analysis text
    let currentProductName = "";
    let currentSize = "";
    let currentQuantity = 1;
    
    for (const line of lines) {
      const nameLine = line.match(/product name:?\s*(.+)/i);
      if (nameLine) {
        currentProductName = nameLine[1].trim();
      }
      
      const sizeLine = line.match(/size\s*\/?\s*volume:?\s*(.+)/i);
      if (sizeLine) {
        currentSize = sizeLine[1].trim();
      }
      
      const quantityLine = line.match(/quantity:?\s*(\d+)/i);
      if (quantityLine) {
        currentQuantity = parseInt(quantityLine[1], 10);
      }
      
      // If we have a product name, try to find it in existing products
      if (currentProductName && 
         (nameLine || sizeLine || quantityLine || line.trim().length === 0 || 
          line.includes("No other") || line.includes("visible"))) {
        
        if (currentProductName) {
          items.push({
            productId: "",
            name: currentProductName,
            count: currentQuantity || 1,
            confidence: 0.9,
            size: currentSize
          });
          
          // Reset for next product
          currentProductName = "";
          currentSize = "";
          currentQuantity = 1;
        }
      }
    }
    
    // If we have a product at the end of processing, add it
    if (currentProductName) {
      items.push({
        productId: "",
        name: currentProductName,
        count: currentQuantity,
        confidence: 0.9,
        size: currentSize
      });
    }
    
    return items;
  };

  // Process video for inventory
  const processVideo = async (file: File) => {
    setIsUploading(true);

    try {
      const results = await processInventoryVideo(file);
      setRecognizedItems(results);
      setAnalysisResult("Video processed successfully. Here are the detected items:");
      
    } catch (error) {
      console.error("Error processing video:", error);
      toast.error("Failed to process video");
    } finally {
      setIsUploading(false);
    }
  };

  // Match extracted items with existing products
  const matchItemsWithProducts = (
    items: InventoryRecognitionResult[], 
    products: Product[]
  ): InventoryRecognitionResult[] => {
    return items.map(item => {
      // Try to find matching product
      const matchingProduct = products.find(product => {
        const normalizedProductName = product.name.toLowerCase().trim();
        const normalizedItemName = item.name.toLowerCase().trim();
        
        return normalizedProductName.includes(normalizedItemName) || 
               normalizedItemName.includes(normalizedProductName);
      });
      
      if (matchingProduct) {
        return {
          ...item,
          productId: matchingProduct.id
        };
      }
      
      return item;
    });
  };

  return {
    isAnalyzing,
    isUploading,
    analysisResult,
    recognizedItems,
    setRecognizedItems,
    resetAnalysis,
    analyzeSingleItemImage,
    processVideo,
    matchItemsWithProducts
  };
};

export default useImageAnalysis;
