
import { toast } from "sonner";
import { InventoryCount, InventoryRecognitionResult } from "@/types/inventory";
import { supabase } from "@/integrations/supabase/client";
import { mapProductFromDatabase } from "./utils";

export const getInventoryCounts = async (): Promise<InventoryCount[]> => {
  try {
    const { data, error } = await supabase
      .from('inventory_counts')
      .select(`
        *,
        product:products(*)
      `)
      .order('counted_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching inventory counts:', error);
      toast.error("Failed to fetch inventory counts");
      throw error;
    }
    
    return data.map(count => ({
      id: count.id,
      productId: count.product_id,
      product: count.product ? mapProductFromDatabase(count.product) : undefined,
      count: count.count,
      countedAt: new Date(count.counted_at),
      countMethod: count.count_method as 'manual' | 'video' | 'invoice',
      notes: count.notes || undefined
    })) as InventoryCount[];
  } catch (error) {
    console.error('Error in getInventoryCounts:', error);
    throw error;
  }
};

export const addInventoryCount = async (count: Omit<InventoryCount, "id">): Promise<InventoryCount> => {
  try {
    const { data, error } = await supabase
      .from('inventory_counts')
      .insert({
        product_id: count.productId,
        count: count.count,
        counted_at: count.countedAt.toISOString(),
        count_method: count.countMethod,
        notes: count.notes
      })
      .select(`
        *,
        product:products(*)
      `)
      .single();
      
    if (error) {
      console.error('Error adding inventory count:', error);
      toast.error("Failed to add inventory count");
      throw error;
    }
    
    toast.success("Inventory count added successfully");
    
    return {
      id: data.id,
      productId: data.product_id,
      product: data.product ? mapProductFromDatabase(data.product) : undefined,
      count: data.count,
      countedAt: new Date(data.counted_at),
      countMethod: data.count_method as 'manual' | 'video' | 'invoice',
      notes: data.notes || undefined
    } as InventoryCount;
  } catch (error) {
    console.error('Error in addInventoryCount:', error);
    throw error;
  }
};

// Add bulk inventory counts
export const addInventoryCounts = async (counts: Omit<InventoryCount, "id">[]): Promise<InventoryCount[]> => {
  try {
    const countRecords = counts.map(count => ({
      product_id: count.productId,
      count: count.count,
      counted_at: count.countedAt.toISOString(),
      count_method: count.countMethod,
      notes: count.notes
    }));
    
    const { data, error } = await supabase
      .from('inventory_counts')
      .insert(countRecords)
      .select(`
        *,
        product:products(*)
      `);
      
    if (error) {
      console.error('Error adding bulk inventory counts:', error);
      toast.error("Failed to add inventory counts");
      throw error;
    }
    
    toast.success(`${data.length} inventory counts added successfully`);
    
    return data.map(item => ({
      id: item.id,
      productId: item.product_id,
      product: item.product ? mapProductFromDatabase(item.product) : undefined,
      count: item.count,
      countedAt: new Date(item.counted_at),
      countMethod: item.count_method as 'manual' | 'video' | 'invoice',
      notes: item.notes || undefined
    })) as InventoryCount[];
  } catch (error) {
    console.error('Error in addInventoryCounts:', error);
    throw error;
  }
};

export const processInventoryVideo = async (videoFile: File): Promise<InventoryRecognitionResult[]> => {
  try {
    const formData = new FormData();
    formData.append('file', videoFile);

    const { data, error } = await supabase.functions.invoke('process-inventory', {
      body: formData,
    });

    if (error) {
      console.error('Error processing inventory video:', error);
      throw new Error(error.message);
    }

    // Get products for matching
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*');
    
    if (productsError) {
      console.error('Error fetching products for matching:', productsError);
      throw productsError;
    }
    
    // Map the response to our expected format
    const results: InventoryRecognitionResult[] = data.items.map((item: any) => {
      const matchedProduct = products?.find(p => 
        p.name.toLowerCase().includes(item.name.toLowerCase()) || 
        item.name.toLowerCase().includes(p.name.toLowerCase())
      );

      return {
        productId: matchedProduct?.id || '',
        name: item.name,
        count: item.count,
        confidence: 0.8 + Math.random() * 0.2 // Simulate confidence between 0.8 and 1.0
      };
    });

    // Filter out items without matching products
    return results.filter(item => item.productId !== '');
  } catch (error) {
    console.error('Error in processInventoryVideo:', error);
    throw error;
  }
};
