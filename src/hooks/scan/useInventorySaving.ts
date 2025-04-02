
import { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { InventoryRecognitionResult } from "@/types/inventory";
import { addInventoryCounts } from "@/services/apiService";

export const useInventorySaving = () => {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);

  const saveInventoryCounts = async (recognizedItems: InventoryRecognitionResult[]) => {
    if (recognizedItems.length === 0) {
      toast.error("No items to save");
      return;
    }

    setIsSaving(true);
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
        setIsSaving(false);
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
