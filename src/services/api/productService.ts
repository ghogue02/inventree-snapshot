
import { toast } from "sonner";
import { Product } from "@/types/inventory";
import { supabase } from "@/integrations/supabase/client";

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
    
    return data.map(item => ({
      id: item.id,
      name: item.name,
      category: item.category,
      unit: item.unit,
      currentStock: item.current_stock,
      reorderPoint: item.reorder_point,
      cost: item.cost,
      image: item.image
    })) as Product[];
  } catch (error) {
    console.error('Error in getProducts:', error);
    throw error;
  }
};

export const addProduct = async (product: Omit<Product, "id">): Promise<Product> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .insert({
        name: product.name,
        category: product.category,
        unit: product.unit,
        current_stock: product.currentStock,
        reorder_point: product.reorderPoint,
        cost: product.cost,
        image: product.image
      })
      .select()
      .single();
      
    if (error) {
      console.error('Error adding product:', error);
      toast.error("Failed to add product");
      throw error;
    }
    
    toast.success("Product added successfully");
    return {
      id: data.id,
      name: data.name,
      category: data.category,
      unit: data.unit,
      currentStock: data.current_stock,
      reorderPoint: data.reorder_point,
      cost: data.cost,
      image: data.image
    } as Product;
  } catch (error) {
    console.error('Error in addProduct:', error);
    throw error;
  }
};

export const updateProduct = async (product: Product): Promise<Product> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .update({
        name: product.name,
        category: product.category,
        unit: product.unit,
        current_stock: product.currentStock,
        reorder_point: product.reorderPoint,
        cost: product.cost,
        image: product.image
      })
      .eq('id', product.id)
      .select()
      .single();
      
    if (error) {
      console.error('Error updating product:', error);
      toast.error("Failed to update product");
      throw error;
    }
    
    toast.success("Product updated successfully");
    return {
      id: data.id,
      name: data.name,
      category: data.category,
      unit: data.unit,
      currentStock: data.current_stock,
      reorderPoint: data.reorder_point,
      cost: data.cost,
      image: data.image
    } as Product;
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
    
    toast.success("Product deleted successfully");
  } catch (error) {
    console.error('Error in deleteProduct:', error);
    throw error;
  }
};
