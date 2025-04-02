import { useState } from "react";
import { toast } from "sonner";
import { InventoryRecognitionResult, Product } from "@/types/inventory";
import { analyzeImageWithOpenAI, analyzeShelfImage } from "@/services/apiService";
import { useOfflineStore } from "@/stores/offlineStore";
import { useConnectivity } from "@/hooks/use-connectivity";

export const useImageAnalysis = () => {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [recognizedItems, setRecognizedItems] = useState<InventoryRecognitionResult[]>([]);
  const [scanMode, setScanMode] = useState<'single' | 'shelf'>('single');
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  
  const { isOnline, checkConnection } = useConnectivity();
  const { addPendingImageRequest, cacheRecognizedItems } = useOfflineStore();

  const analyzeImage = async (imageData?: string, products?: Product[]) => {
    const imageToAnalyze = imageData || capturedImage;
    
    if (!imageToAnalyze) return;
    
    setIsAnalyzing(true);
    setAnalysisError(null);
    
    try {
      const isConnected = await checkConnection();
      
      if (!isConnected) {
        const requestId = addPendingImageRequest(imageToAnalyze, scanMode);
        
        toast.warning(
          scanMode === 'shelf'
            ? "You're offline. Your shelf scan will be processed when you reconnect."
            : "You're offline. Your image will be analyzed when you reconnect.", 
          { duration: 5000 }
        );
        
        setAnalysisResult(
          scanMode === 'shelf'
            ? "Shelf scan queued for analysis when online"
            : "Image queued for analysis when online"
        );
        
        setRecognizedItems([]);
        setIsAnalyzing(false);
        return;
      }
      
      toast.loading("Analyzing image...");
      
      if (scanMode === 'shelf') {
        const result = await analyzeShelfImage(imageToAnalyze);
        console.log("Shelf Analysis Raw Result:", result);
        
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
          console.log("Shelf Analysis State Set:", { analysisResult: "Shelf analysis complete...", recognizedItems: enhancedItems });
        } else {
          setRecognizedItems([]);
          setAnalysisResult("Shelf analysis returned no items.");
          console.log("Shelf Analysis State Set (No Items):", { analysisResult: "Shelf analysis returned no items.", recognizedItems: [] });
        }
      } else {
        try {
          const resultText = await analyzeImageWithOpenAI(
            imageToAnalyze,
            "Please analyze this image and identify all food inventory items you see. For each item, include the specific product name, size/volume information, and quantity as individual units."
          );
          console.log("Single Item Analysis Raw Text:", resultText);
          
          setAnalysisResult(resultText);
          
          if (products && resultText) {
            const extractedItems = extractItemsFromAnalysis(resultText, products);
            setRecognizedItems(extractedItems);
            console.log("Single Item State Set:", { analysisResult: resultText, recognizedItems: extractedItems });
          } else {
            setRecognizedItems([]);
            console.log("Single Item State Set (No Items/Products):", { analysisResult: resultText, recognizedItems: [] });
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          
          if (errorMessage.includes('timeout') || errorMessage.includes('network')) {
            setAnalysisError("Network timeout. Please check your connection and try again.");
          } else if (errorMessage.includes('rate') || errorMessage.includes('limit')) {
            setAnalysisError("Rate limit exceeded. Please wait a moment and try again.");
          } else {
            setAnalysisError("Failed to analyze the image. The image may be too blurry or dark.");
          }
          
          throw error;
        }
      }
      
      toast.dismiss();
      toast.success("Analysis complete");
      
    } catch (error) {
      console.error("Error analyzing image:", error);
      toast.dismiss();
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (errorMessage.includes('timeout') || errorMessage.includes('network')) {
        toast.error("Network error. Check your connection and try again.");
      } else if (errorMessage.includes('rate') || errorMessage.includes('limit')) {
        toast.error("Analysis temporarily unavailable. Please try again shortly.");
      } else {
        toast.error("Failed to analyze image. Try capturing a clearer photo.", {
          action: {
            label: "Try Again",
            onClick: () => resetCapture()
          }
        });
      }
      
      setAnalysisResult(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const extractItemsFromAnalysis = (analysisText: string, products: Product[]): InventoryRecognitionResult[] => {
    console.log('Extracting items from analysisText:', analysisText);
    const items: InventoryRecognitionResult[] = [];
    const lines = analysisText.split("\n");
    
    let currentProductName = "";
    let currentSize = "";
    let currentQuantity = 1;
    
    for (const line of lines) {
      const nameLine = line.match(/product name:?\s*(.+)/i);
      if (nameLine && nameLine[1].trim()) {
        currentProductName = nameLine[1].trim();
        console.log(`Found name: ${currentProductName}`);
        continue;
      }
      
      const sizeLine = line.match(/size\s*\/?\s*volume:?\s*(.+)/i);
      if (sizeLine && sizeLine[1].trim()) {
        currentSize = sizeLine[1].trim();
        console.log(`Found size: ${currentSize}`);
      }
      
      const quantityLine = line.match(/quantity:?\s*(\d+(\.\d+)?)/i);
      if (quantityLine && quantityLine[1]) {
        currentQuantity = parseFloat(quantityLine[1]);
        console.log(`Found quantity: ${currentQuantity}`);
      }
      
      if (currentProductName && (sizeLine || quantityLine || line.trim().length === 0 || line.match(/item\s*\d+:/i))) {
        const matchedProduct = checkIfItemExists(currentProductName, products);
        console.log(`Attempting to add item: ${currentProductName}, Size: ${currentSize}, Qty: ${currentQuantity}, Match: ${matchedProduct?.id}`);
        items.push({
          productId: matchedProduct?.id || "",
          name: currentProductName,
          count: currentQuantity || 1,
          confidence: 0.9,
          size: currentSize || undefined
        });
        
        currentProductName = "";
        currentSize = "";
        currentQuantity = 1;
      }
    }
    
    if (currentProductName) {
      const matchedProduct = checkIfItemExists(currentProductName, products);
      console.log(`Adding final item: ${currentProductName}, Size: ${currentSize}, Qty: ${currentQuantity}, Match: ${matchedProduct?.id}`);
      items.push({
        productId: matchedProduct?.id || "",
        name: currentProductName,
        count: currentQuantity || 1,
        confidence: 0.9,
        size: currentSize || undefined
      });
    }
    
    console.log('Extracted items result:', items);
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
    setAnalysisError(null);
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
    analysisError,
    analyzeImage,
    resetCapture,
    checkIfItemExists
  };
};
