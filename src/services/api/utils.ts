import { Product } from "@/types/inventory";

// Helper function to map database product to our frontend model
export const mapProductFromDatabase = (product: any): Product => {
  return {
    id: product.id,
    name: product.name,
    category: product.category,
    unit: product.unit,
    currentStock: product.current_stock || 0,
    reorderPoint: product.reorder_point || 0,
    cost: product.cost || 0,
    image: product.image || null
  };
};
