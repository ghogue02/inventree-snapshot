
import { useState } from "react";
import { toast } from "sonner";
import { InventoryRecognitionResult, Product } from "@/types/inventory";
import { analyzeImageWithOpenAI, processInventoryVideo, addInventoryCounts } from "@/services/apiService";
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
      
      const recognizedItems = mockRecognitionFromAnalysis(result, products);
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

  const mockRecognitionFromAnalysis = (analysisText: string, products: Product[]): InventoryRecognitionResult[] => {
    const items: InventoryRecognitionResult[] = [];
    const lines = analysisText.split("\n");
    
    for (const line of lines) {
      const cleanLine = line.replace(/^-\s*|\d+\.\s*/, "").toLowerCase();
      
      for (const product of products) {
        if (cleanLine.includes(product.name.toLowerCase())) {
          let count = 1;
          let size: string | undefined;
          
          const quantityMatch = cleanLine.match(/(\d+)\s+(?:boxes|packages|items|cans|bottles|jars)/i);
          if (quantityMatch) {
            count = parseInt(quantityMatch[1], 10);
          }
          
          const sizeMatch = cleanLine.match(/(\d+(?:\.\d+)?\s*(?:oz|ounce|fl\s*oz|pound|lb|g|gram|kg|ml|l|liter)s?)/i);
          if (sizeMatch) {
            size = sizeMatch[1];
          }
          
          items.push({
            productId: product.id,
            name: product.name,
            count,
            confidence: 0.85 + Math.random() * 0.1,
            size
          });
          
          break;
        }
      }
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
      
      const counts = recognizedItems.map(item => ({
        productId: item.productId,
        count: item.count,
        countedAt: new Date(),
        countMethod: "video" as const,
        notes: "Counted via camera scan"
      }));

      console.log("Attempting to save inventory counts:", counts);
      
      const result = await addInventoryCounts(counts);
      
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
    handleFileSelected
  };
};
