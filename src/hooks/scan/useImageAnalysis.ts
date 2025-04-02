
import { useState } from "react";
import { toast } from "sonner";
import { InventoryRecognitionResult, Product } from "@/types/inventory";
import { analyzeImageWithOpenAI } from "@/services/apiService";

export const useImageAnalysis = () => {
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [recognizedItems, setRecognizedItems] = useState<InventoryRecognitionResult[]>([]);

  // Function to analyze a single item image
  const analyzeSingleItemImage = async (imageData: string): Promise<void> => {
    setIsAnalyzing(true);
    
    try {
      // Progress notification
      toast.loading("Analyzing image...");
      
      // Analyze the image with AI
      const result = await analyzeImageWithOpenAI(
        imageData,
        "Please analyze this image and identify all food inventory items you see. For each item, include the specific product name, size/volume information, and quantity as individual units."
      );
      
      setAnalysisResult(result);
      
      // Extract recognized items from analysis text
      const items = extractItemsFromAnalysis(result);
      setRecognizedItems(items);
      
      // Clear toast and show success
      toast.dismiss();
      toast.success("Analysis complete");
      
    } catch (error) {
      console.error("Error analyzing image:", error);
      toast.dismiss();
      toast.error("Failed to analyze image. Please try again or upload a clearer photo.");
      setAnalysisResult(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Parse AI analysis text to extract item information
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
      
      // If we have a product name, and we're at a logical "break" in the data
      if (currentProductName && 
         (nameLine || sizeLine || quantityLine || line.trim().length === 0 || 
          line.includes("No other") || line.includes("visible"))) {
        
        if (currentProductName) {
          items.push({
            productId: "", // This will be matched later
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

  // Match recognized items against existing products
  const matchItemsWithProducts = (items: InventoryRecognitionResult[], products: Product[]): InventoryRecognitionResult[] => {
    return items.map(item => {
      // Try to find matching product by name
      const matchedProduct = products.find(product => 
        product.name.toLowerCase().includes(item.name.toLowerCase()) || 
        item.name.toLowerCase().includes(product.name.toLowerCase())
      );
      
      if (matchedProduct) {
        return {
          ...item,
          productId: matchedProduct.id
        };
      }
      
      return item;
    });
  };

  // Reset analysis results
  const resetAnalysis = () => {
    setAnalysisResult(null);
    setRecognizedItems([]);
  };

  return {
    isAnalyzing,
    analysisResult,
    recognizedItems,
    setRecognizedItems,
    analyzeSingleItemImage,
    matchItemsWithProducts,
    resetAnalysis
  };
};

export default useImageAnalysis;
