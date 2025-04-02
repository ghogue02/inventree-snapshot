
import { useState } from "react";
import { toast } from "sonner";
import { InventoryRecognitionResult, Product } from "@/types/inventory";
import { analyzeImageWithOpenAI, analyzeShelfImage } from "@/services/apiService";

export const useImageAnalysis = () => {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [recognizedItems, setRecognizedItems] = useState<InventoryRecognitionResult[]>([]);
  const [scanMode, setScanMode] = useState<'single' | 'shelf'>('single');

  const analyzeImage = async (imageData?: string, products?: Product[]) => {
    const imageToAnalyze = imageData || capturedImage;
    
    if (!imageToAnalyze) return;
    
    setIsAnalyzing(true);
    
    try {
      toast.loading("Analyzing image...");
      
      if (scanMode === 'shelf') {
        const result = await analyzeShelfImage(imageToAnalyze);
        
        if (result && result.items) {
          const enhancedItems = result.items.map(item => {
            const matchedProduct = products 
              ? checkIfItemExists(item.name, products)
              : undefined;
              
            return {
              ...item,
              productId: matchedProduct?.id || "",
              confidence: item.confidence || 0.9,
              count: item.count || 1
            };
          });
          
          setRecognizedItems(enhancedItems);
          setAnalysisResult("Shelf analysis complete. Here are the detected items:");
        }
      } else {
        const result = await analyzeImageWithOpenAI(
          imageToAnalyze,
          "Please analyze this image and identify all food inventory items you see. For each item, include the specific product name, size/volume information, and quantity as individual units."
        );
        
        setAnalysisResult(result);
        
        if (products) {
          const extractedItems = extractItemsFromAnalysis(result, products);
          setRecognizedItems(extractedItems);
        }
      }
      
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

  const extractItemsFromAnalysis = (analysisText: string, products: Product[]): InventoryRecognitionResult[] => {
    const items: InventoryRecognitionResult[] = [];
    const lines = analysisText.split("\n");
    
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
      
      if (currentProductName && 
         (nameLine || sizeLine || quantityLine || line.trim().length === 0 || 
          line.includes("No other") || line.includes("visible"))) {
        
        const matchedProduct = checkIfItemExists(currentProductName, products);
        
        if (currentProductName) {
          items.push({
            productId: matchedProduct?.id || "",
            name: currentProductName,
            count: currentQuantity || 1,
            confidence: 0.9,
            size: currentSize
          });
          
          currentProductName = "";
          currentSize = "";
          currentQuantity = 1;
        }
      }
    }
    
    if (currentProductName) {
      const matchedProduct = checkIfItemExists(currentProductName, products);
      
      items.push({
        productId: matchedProduct?.id || "",
        name: currentProductName,
        count: currentQuantity,
        confidence: 0.9,
        size: currentSize
      });
    }
    
    return items;
  };

  const checkIfItemExists = (name: string, products: Product[]): Product | undefined => {
    if (!name) return undefined;
    
    const normalizedName = name.toLowerCase().trim();
    return products.find(
      product => product.name.toLowerCase().trim().includes(normalizedName) || 
                normalizedName.includes(product.name.toLowerCase().trim())
    );
  };

  const resetCapture = () => {
    setCapturedImage(null);
    setAnalysisResult(null);
    setRecognizedItems([]);
  };

  return {
    capturedImage,
    setCapturedImage,
    isAnalyzing,
    analysisResult,
    recognizedItems,
    setRecognizedItems,
    scanMode,
    setScanMode,
    analyzeImage,
    resetCapture,
    checkIfItemExists
  };
};
