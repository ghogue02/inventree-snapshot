import { toast } from "sonner";
import { Product } from "@/types/inventory";
import { supabase } from "@/integrations/supabase/client";
import { mockProducts } from "@/data/mockProducts";

// Helper function to map database fields to frontend model
const mapDatabaseToProduct = (item: any): Product => ({
  id: item.id,
  name: item.name,
  category: item.category,
  unit: item.unit,
  currentStock: item.current_stock || 0,
  reorderPoint: item.reorder_point || 0,
  cost: item.cost || 0,
  image: item.image || null
});

// Helper function to map frontend model to database fields
const mapProductToDatabase = (product: Partial<Product>) => ({
  name: product.name,
  category: product.category,
  unit: product.unit,
  current_stock: product.currentStock || 0,
  reorder_point: product.reorderPoint || 0,
  cost: product.cost || 0,
  image: product.image
});

export const getProducts = async (): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*');
      
    if (error) {
      console.error('Error fetching products:', error);
      toast.error("Failed to fetch products");
      throw error;
    }
    
    return data.map(mapDatabaseToProduct);
  } catch (error) {
    console.error('Error in getProducts:', error);
    throw error;
  }
};

export const addProduct = async (product: Omit<Product, "id">): Promise<Product> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .insert(mapProductToDatabase(product))
      .select()
      .single();
      
    if (error) {
      console.error('Error adding product:', error);
      toast.error("Failed to add product");
      throw error;
    }
    
    toast.success("Product added successfully");
    return mapDatabaseToProduct(data);
  } catch (error) {
    console.error('Error in addProduct:', error);
    throw error;
  }
};

export const updateProduct = async (product: Product): Promise<Product> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .update(mapProductToDatabase(product))
      .eq('id', product.id)
      .select()
      .single();
      
    if (error) {
      console.error('Error updating product:', error);
      toast.error("Failed to update product");
      throw error;
    }
    
    toast.success("Product updated successfully");
    return mapDatabaseToProduct(data);
  } catch (error) {
    console.error('Error in updateProduct:', error);
    throw error;
  }
};

export const deleteProduct = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error('Error deleting product:', error);
      toast.error("Failed to delete product");
      throw error;
    }
  } catch (error) {
    console.error('Error in deleteProduct:', error);
    throw error;
  }
};

export const loadMockProducts = async (): Promise<void> => {
  try {
    // Map the mock products to database format
    const productsToInsert = mockProducts.map(product => ({
      name: product.name,
      category: product.category,
      unit: product.unit,
      current_stock: product.currentStock,
      reorder_point: product.reorderPoint,
      cost: product.cost,
      image: product.image
    }));

    // Insert the products
    const { error } = await supabase
      .from('products')
      .insert(productsToInsert);
      
    if (error) {
      console.error('Error loading mock products:', error);
      toast.error("Failed to load mock products");
      throw error;
    }
    
    toast.success("Mock products loaded successfully");
  } catch (error) {
    console.error('Error in loadMockProducts:', error);
    throw error;
  }
};

export const updateProducts = async (products: Product[]): Promise<void> => {
  try {
    const updates = products.map(product => mapProductToDatabase(product));

    const { error } = await supabase
      .from('products')
      .upsert(updates);

    if (error) {
      console.error('Error updating products:', error);
      toast.error("Failed to update products");
      throw error;
    }

    toast.success("Products updated successfully");
  } catch (error) {
    console.error('Error in updateProducts:', error);
    throw error;
  }
};
