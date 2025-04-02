
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { analyzeImageWithOpenAI, analyzeProductWithOpenAI } from "./apiService";
import { addInventoryCounts } from "./api/inventoryService";

// Function to synchronize offline data with the server
export const synchronizeOfflineData = async (offlineData) => {
  try {
    if (!offlineData || !offlineData.pendingItems || offlineData.pendingItems.length === 0) {
      return { success: true, message: "No pending data to sync" };
    }

    // Process each pending inventory scan in sequence
    for (const scan of offlineData.pendingItems) {
      if (scan.type === "inventory_count") {
        await syncInventoryCounts(scan);
      } else if (scan.type === "product_add") {
        await syncProduct(scan);
      }
    }

    return { success: true, message: "Data synchronized successfully" };
  } catch (error) {
    console.error("Error synchronizing data:", error);
    throw new Error(`Sync failed: ${error.message || "Unknown error"}`);
  }
};

// Process and sync inventory counts
const syncInventoryCounts = async (scan) => {
  try {
    let items = scan.data.items;
    
    // If we have an image but no recognized items (offline scan), analyze the image
    if (scan.data.imageData && (!items || items.length === 0)) {
      const analysisResult = await analyzeImageWithOpenAI(
        scan.data.imageData,
        "Analyze this image and identify all inventory items with counts."
      );
      
      // Extract items from AI analysis result
      // This assumes your AI service returns recognized items in a format compatible with your app
      const recognizedItems = extractInventoryItemsFromAnalysis(analysisResult);
      items = recognizedItems;
    }
    
    // Convert to the format expected by the API
    const inventoryCounts = items
      .filter(item => item.productId) // Ensure item has a valid productId
      .map(item => ({
        productId: item.productId,
        count: item.count,
        countedAt: new Date(),
        countMethod: scan.data.method || "manual", // Ensure valid method
        notes: scan.data.notes || "Synchronized from offline data"
      }));
    
    if (inventoryCounts.length > 0) {
      await addInventoryCounts(inventoryCounts);
      toast.success(`Synced ${inventoryCounts.length} inventory items`);
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error syncing inventory counts:", error);
    toast.error(`Failed to sync inventory: ${error.message}`);
    throw error;
  }
};

// Process and sync new product from offline data
const syncProduct = async (scan) => {
  try {
    let productData = scan.data.productData;
    
    // If we have an image but no analyzed product data, analyze with AI
    if (scan.data.imageData && (!productData || Object.keys(productData).length === 0)) {
      const analysisResult = await analyzeProductWithOpenAI(scan.data.imageData);
      productData = {
        ...analysisResult.product,
        // Add any default values needed
        currentStock: 1,
        reorderPoint: 5,
        category: analysisResult.product?.category || "Other"
      };
    }
    
    // Add the product to database
    if (productData && productData.name) {
      // Use the existing product service function to add the product
      const { data, error } = await supabase.from("products").insert({
        name: productData.name,
        category: productData.category || "Other",
        unit: productData.unit || "each",
        current_stock: productData.currentStock || 0,
        reorder_point: productData.reorderPoint || 5,
        cost: productData.cost || 0,
        size: productData.size || null,
      }).select();
      
      if (error) throw error;
      toast.success(`Synced product: ${productData.name}`);
      return { success: true, product: data[0] };
    }
    
    return { success: false, message: "Invalid product data" };
  } catch (error) {
    console.error("Error syncing product:", error);
    toast.error(`Failed to sync product: ${error.message}`);
    throw error;
  }
};

// Helper function to extract inventory items from AI analysis
const extractInventoryItemsFromAnalysis = (analysisText) => {
  // Simplified extraction logic - this should match the format used in your app
  const items = [];
  const lines = analysisText.split("\n");
  
  let currentItem = null;
  
  for (const line of lines) {
    if (line.match(/item:/i) || line.match(/product:/i)) {
      // If we were building an item, save it
      if (currentItem && currentItem.name) {
        items.push(currentItem);
      }
      
      // Start a new item
      currentItem = {
        name: line.replace(/item:|product:/i, "").trim(),
        count: 1,
        confidence: 0.8,
        productId: "" // Will need to be matched later
      };
    } else if (currentItem && line.match(/quantity:|count:/i)) {
      const countMatch = line.match(/\d+/);
      if (countMatch) {
        currentItem.count = parseInt(countMatch[0], 10);
      }
    }
  }
  
  // Add the last item if we were building one
  if (currentItem && currentItem.name) {
    items.push(currentItem);
  }
  
  return items;
};
