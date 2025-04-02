
import { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { InventoryRecognitionResult } from "@/types/inventory";
import { addInventoryCounts } from "@/services/apiService";
import { useOfflineStore } from "@/stores/offlineStore";
import { useConnectivity } from "@/hooks/use-connectivity";

export const useInventorySaving = () => {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const { isOnline, checkConnection } = useConnectivity();
  const addInventoryCount = useOfflineStore(state => state.addInventoryCount);

  const saveInventoryCounts = async (recognizedItems: InventoryRecognitionResult[]) => {
    if (recognizedItems.length === 0) {
      toast.error("No items to save");
      return;
    }

    setIsSaving(true);
    
    const validCounts = recognizedItems
      .filter(item => item.productId)
      .map(item => ({
        productId: item.productId,
        count: item.count,
        countedAt: new Date().toISOString(),
        countMethod: "camera" as const,
        notes: "Counted via camera scan"
      }));

    if (validCounts.length === 0) {
      toast.warning("No valid inventory items to save. Please add products to inventory first.");
      setIsSaving(false);
      return;
    }
    
    // Check if we're online
    const online = await checkConnection();
    
    try {
      if (!online) {
        // Store counts offline
        toast.loading("Saving inventory counts offline...");
        
        // Add each count to the offline store
        validCounts.forEach(count => {
          addInventoryCount(count);
        });
        
        toast.dismiss();
        toast.success("Inventory counts saved offline. They will sync when you're online.", {
          duration: 5000
        });
        
        navigate("/inventory");
      } else {
        // Save directly
        toast.loading("Saving inventory counts...");
        
        console.log("Attempting to save inventory counts:", validCounts);
        
        const result = await addInventoryCounts(validCounts.map(c => ({
          ...c,
          countedAt: new Date(c.countedAt),
        })));
        
        toast.dismiss();
        toast.success("Inventory counts saved successfully");
        navigate("/inventory");
      }
    } catch (error) {
      console.error("Error saving inventory counts:", error);
      toast.dismiss();
      toast.error("Failed to save inventory counts: " + (error instanceof Error ? error.message : "Unknown error"), {
        duration: 8000,
        action: {
          label: "Save Offline",
          onClick: () => {
            // Save offline as fallback
            validCounts.forEach(count => {
              addInventoryCount(count);
            });
            toast.success("Saved offline. Will sync when connection is restored.");
            navigate("/inventory");
          }
        }
      });
    } finally {
      setIsSaving(false);
    }
  };

  const goToAddProduct = (capturedImage: string | null) => {
    if (capturedImage) {
      sessionStorage.setItem('capturedProductImage', capturedImage);
      navigate("/add-product?mode=camera");
    } else {
      navigate("/add-product");
    }
  };

  return {
    isSaving,
    saveInventoryCounts,
    goToAddProduct
  };
};
