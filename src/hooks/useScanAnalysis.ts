import { useState, useRef } from "react";
import { toast } from "sonner";
import { InventoryRecognitionResult, Product } from "@/types/inventory";
import { analyzeImageWithOpenAI, analyzeShelfImage, addInventoryCounts, addProduct, processInventoryVideo } from "@/services/apiService";
import { useNavigate } from "react-router-dom";

interface Action {
  type: 'update' | 'remove' | 'select';
  item: InventoryRecognitionResult;
  index: number;
  previousValue?: InventoryRecognitionResult;
}

export const useScanAnalysis = (products: Product[]) => {
  const navigate = useNavigate();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [recognizedItems, setRecognizedItems] = useState<InventoryRecognitionResult[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [scanMode, setScanMode] = useState<'single' | 'shelf'>('single');
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);
  const [productFormOpen, setProductFormOpen] = useState(false);
  const [currentItemToAdd, setCurrentItemToAdd] = useState<InventoryRecognitionResult | null>(null);
  const [actionHistory, setActionHistory] = useState<Action[]>([]);
  const [autoAdvance, setAutoAdvance] = useState(true);

  const analyzeImage = async (imageData?: string) => {
    const imageToAnalyze = imageData || capturedImage;
    
    if (!imageToAnalyze) return;
    
    setIsAnalyzing(true);
    
    try {
      toast.loading("Analyzing image...");
      
      if (scanMode === 'shelf') {
        const result = await analyzeShelfImage(imageToAnalyze);
        
        if (result && result.items) {
          const enhancedItems = result.items.map(item => {
            const matchedProduct = checkIfItemExists(item.name);
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
        
        const recognizedItems = extractItemsFromAnalysis(result, products);
        setRecognizedItems(recognizedItems);
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
        
        const matchedProduct = checkIfItemExists(currentProductName);
        
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
      const matchedProduct = checkIfItemExists(currentProductName);
      
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

  const resetCapture = () => {
    setCapturedImage(null);
    setAnalysisResult(null);
    setRecognizedItems([]);
    setSelectedItemIndex(null);
    setActionHistory([]);
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
    capturedImage,
    setCapturedImage,
    isAnalyzing,
    analysisResult,
    recognizedItems,
    isUploading,
    scanMode,
    setScanMode,
    selectedItemIndex,
    selectItem,
    resetCapture,
    analyzeImage,
    processVideo,
    saveInventoryCounts,
    updateRecognizedItem,
    removeRecognizedItem,
    goToAddProduct,
    handleFileSelected,
    checkIfItemExists,
    addToInventory,
    productFormOpen,
    setProductFormOpen,
    currentItemToAdd,
    handleProductAdded,
    undoLastAction,
    autoAdvance,
    setAutoAdvance
  };
};

export default useScanAnalysis;
