
import { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { addInventoryCounts } from "@/services/apiService";
import { InventoryRecognitionResult } from "@/types/inventory";
import { debugInventoryCounts } from "@/services/api/visionService";
import { useOfflineStore } from "@/stores/offlineStore";
import { useConnectivity } from "@/hooks/use-connectivity";

export const useInventorySaving = () => {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const { addOfflineItem } = useOfflineStore();
  const { isOnline } = useConnectivity();

  // Save inventory counts to database or offline storage
  const saveInventoryCounts = async (
    recognizedItems: InventoryRecognitionResult[], 
    capturedImage?: string | null
  ) => {
    if (recognizedItems.length === 0) {
      toast.error("No items to save");
      return false;
    }

    setIsSaving(true);

    try {
      // Filter out items that don't have a product ID
      const validCounts = recognizedItems
        .filter(item => item.productId)
        .map(item => ({
          productId: item.productId,
          count: item.count,
          countedAt: new Date(),
          countMethod: "camera" as const,
          notes: "Counted via camera scan"
        }));

      if (validCounts.length === 0) {
        toast.dismiss();
        toast.warning("No valid inventory items to save. Please add products to inventory first.");
        setIsSaving(false);
        return false;
      }
      
      console.log("Attempting to save inventory counts:", debugInventoryCounts(validCounts));
      
      // If online, save directly to database
      if (isOnline) {
        await addInventoryCounts(validCounts);
        toast.success("Inventory counts saved successfully");
        navigate("/inventory");
      } 
      // If offline, store for later synchronization
      else {
        addOfflineItem({
          id: `inv-${Date.now()}`,
          type: "inventory_count",
          createdAt: new Date(),
          data: {
            items: recognizedItems,
            imageData: capturedImage,
            method: "camera",
            timestamp: new Date()
          }
        });
        toast.success("Inventory saved for later sync");
        navigate("/inventory");
      }
      
      return true;
    } catch (error) {
      console.error("Error saving inventory counts:", error);
      toast.error("Failed to save inventory counts: " + (error instanceof Error ? error.message : "Unknown error"));
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isSaving,
    saveInventoryCounts
  };
};

export default useInventorySaving;
