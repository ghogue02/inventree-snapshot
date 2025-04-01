
import { Product } from "@/types/inventory";

// Helper function to map database product to our frontend model
export const mapProductFromDatabase = (product: any): Product => {
  return {
    id: product.id,
    name: product.name,
    category: product.category,
    unit: product.unit,
    currentStock: product.current_stock,
    reorderPoint: product.reorder_point,
    cost: product.cost,
    image: product.image
  };
};
