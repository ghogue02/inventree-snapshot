import { toast } from "sonner";
import { Product } from "@/types/inventory";
import { supabase } from "@/integrations/supabase/client";
import { mockProducts } from "@/data/mockProducts";

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

export const updateProducts = async (products: Product[]): Promise<void> => {
  try {
    const updates = products.map(product => ({
      id: product.id,
      name: product.name,
      category: product.category,
      unit: product.unit,
      current_stock: product.currentStock,
      reorder_point: product.reorderPoint,
      cost: product.cost,
      image: product.image
    }));

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

export const loadMockProducts = async () => {
  try {
    toast.loading("Checking inventory data...");

    // First, check if we already have products
    const { data: existingProducts, error: checkError } = await supabase
      .from('products')
      .select('id')
      .limit(1);

    if (checkError) {
      console.error('Error checking existing products:', checkError);
      toast.error("Failed to check existing data");
      throw checkError;
    }

    // If we already have products, don't reload mock data
    if (existingProducts && existingProducts.length > 0) {
      toast.success("Inventory data already loaded");
      return;
    }

    toast.loading("Loading sample data...");

    // First, delete all invoice items to handle foreign key constraints
    const { error: deleteInvoiceItemsError } = await supabase
      .from('invoice_items')
      .delete()
      .not('id', 'is', null);

    if (deleteInvoiceItemsError) {
      console.error('Error deleting invoice items:', deleteInvoiceItemsError);
      toast.error("Failed to clear existing data");
      throw deleteInvoiceItemsError;
    }

    // Then delete all invoices
    const { error: deleteInvoicesError } = await supabase
      .from('invoices')
      .delete()
      .not('id', 'is', null);

    if (deleteInvoicesError) {
      console.error('Error deleting invoices:', deleteInvoicesError);
      toast.error("Failed to clear existing data");
      throw deleteInvoicesError;
    }

    // Finally, delete all products
    const { error: deleteProductsError } = await supabase
      .from('products')
      .delete()
      .not('id', 'is', null);

    if (deleteProductsError) {
      console.error('Error deleting products:', deleteProductsError);
      toast.error("Failed to clear existing data");
      throw deleteProductsError;
    }

    // Insert mock products
    const { error: insertError } = await supabase
      .from('products')
      .insert(mockProducts.map(product => ({
        name: product.name,
        category: product.category,
        unit: product.unit,
        current_stock: product.current_stock,
        reorder_point: product.reorder_point,
        cost: product.cost,
        image: null
      })));

    if (insertError) {
      console.error('Error inserting mock products:', insertError);
      toast.error("Failed to load sample data");
      throw insertError;
    }

    toast.success("Sample data loaded successfully");
  } catch (error) {
    console.error('Error in loadMockProducts:', error);
    toast.error("Failed to load sample data");
    throw error;
  }
};
