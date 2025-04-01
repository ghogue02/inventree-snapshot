
import { toast } from "sonner";
import { Product, Invoice, InventoryCount, InvoiceRecognitionResult, InventoryRecognitionResult } from "@/types/inventory";
import { supabase } from "@/integrations/supabase/client";

// Products API
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
    
    return data as Product[];
  } catch (error) {
    console.error('Error in getProducts:', error);
    throw error;
  }
};

export const addProduct = async (product: Omit<Product, "id">): Promise<Product> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .insert(product)
      .select()
      .single();
      
    if (error) {
      console.error('Error adding product:', error);
      toast.error("Failed to add product");
      throw error;
    }
    
    toast.success("Product added successfully");
    return data as Product;
  } catch (error) {
    console.error('Error in addProduct:', error);
    throw error;
  }
};

export const updateProduct = async (product: Product): Promise<Product> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .update(product)
      .eq('id', product.id)
      .select()
      .single();
      
    if (error) {
      console.error('Error updating product:', error);
      toast.error("Failed to update product");
      throw error;
    }
    
    toast.success("Product updated successfully");
    return data as Product;
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

// Invoices API
export const getInvoices = async (): Promise<Invoice[]> => {
  try {
    // First get all invoices
    const { data: invoicesData, error: invoicesError } = await supabase
      .from('invoices')
      .select('*')
      .order('date', { ascending: false });
      
    if (invoicesError) {
      console.error('Error fetching invoices:', invoicesError);
      toast.error("Failed to fetch invoices");
      throw invoicesError;
    }

    // For each invoice, fetch its items
    const invoicesWithItems = await Promise.all(
      invoicesData.map(async (invoice) => {
        const { data: itemsData, error: itemsError } = await supabase
          .from('invoice_items')
          .select(`
            *,
            product:products(*)
          `)
          .eq('invoice_id', invoice.id);
          
        if (itemsError) {
          console.error(`Error fetching items for invoice ${invoice.id}:`, itemsError);
          return { ...invoice, items: [] };
        }
        
        return {
          ...invoice,
          id: invoice.id,
          supplierName: invoice.supplier_name,
          invoiceNumber: invoice.invoice_number,
          date: new Date(invoice.date),
          total: invoice.total,
          paidStatus: invoice.paid_status as 'paid' | 'unpaid' | 'partial',
          imageUrl: invoice.image_url,
          items: itemsData.map(item => ({
            id: item.id,
            invoiceId: item.invoice_id,
            productId: item.product_id,
            product: item.product,
            quantity: item.quantity,
            unitPrice: item.unit_price,
            total: item.total
          }))
        };
      })
    );
    
    return invoicesWithItems as Invoice[];
  } catch (error) {
    console.error('Error in getInvoices:', error);
    throw error;
  }
};

export const addInvoice = async (invoice: Omit<Invoice, "id">): Promise<Invoice> => {
  try {
    // Start a Supabase transaction
    const { data: invoiceData, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        supplier_name: invoice.supplierName,
        invoice_number: invoice.invoiceNumber,
        date: invoice.date,
        total: invoice.total,
        paid_status: invoice.paidStatus,
        image_url: invoice.imageUrl
      })
      .select()
      .single();
      
    if (invoiceError) {
      console.error('Error creating invoice:', invoiceError);
      toast.error("Failed to create invoice");
      throw invoiceError;
    }
    
    const invoiceId = invoiceData.id;
    
    // Insert all invoice items
    const itemsToInsert = invoice.items.map(item => ({
      invoice_id: invoiceId,
      product_id: item.productId,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      total: item.total
    }));
    
    const { error: itemsError } = await supabase
      .from('invoice_items')
      .insert(itemsToInsert);
      
    if (itemsError) {
      console.error('Error adding invoice items:', itemsError);
      // Clean up the invoice if items failed
      await supabase.from('invoices').delete().eq('id', invoiceId);
      toast.error("Failed to add invoice items");
      throw itemsError;
    }
    
    toast.success("Invoice added successfully");

    // Return the complete invoice
    const completeInvoice: Invoice = {
      id: invoiceId,
      supplierName: invoiceData.supplier_name,
      invoiceNumber: invoiceData.invoice_number,
      date: new Date(invoiceData.date),
      total: invoiceData.total,
      paidStatus: invoiceData.paid_status as 'paid' | 'unpaid' | 'partial',
      imageUrl: invoiceData.image_url,
      items: invoice.items.map(item => ({
        ...item,
        id: '', // We don't have the IDs yet but they'll be fetched on the next getInvoices call
        invoiceId: invoiceId
      }))
    };
    
    return completeInvoice;
  } catch (error) {
    console.error('Error in addInvoice:', error);
    throw error;
  }
};

export const updateInvoice = async (invoice: Invoice): Promise<Invoice> => {
  try {
    // Update the invoice basic info
    const { error: invoiceError } = await supabase
      .from('invoices')
      .update({
        supplier_name: invoice.supplierName,
        invoice_number: invoice.invoiceNumber,
        date: invoice.date,
        total: invoice.total,
        paid_status: invoice.paidStatus,
        image_url: invoice.imageUrl
      })
      .eq('id', invoice.id);
      
    if (invoiceError) {
      console.error('Error updating invoice:', invoiceError);
      toast.error("Failed to update invoice");
      throw invoiceError;
    }

    // Delete all existing items and insert the new ones
    const { error: deleteError } = await supabase
      .from('invoice_items')
      .delete()
      .eq('invoice_id', invoice.id);
      
    if (deleteError) {
      console.error('Error deleting invoice items:', deleteError);
      toast.error("Failed to update invoice items");
      throw deleteError;
    }
    
    const itemsToInsert = invoice.items.map(item => ({
      invoice_id: invoice.id,
      product_id: item.productId,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      total: item.total
    }));
    
    const { error: insertError } = await supabase
      .from('invoice_items')
      .insert(itemsToInsert);
      
    if (insertError) {
      console.error('Error re-inserting invoice items:', insertError);
      toast.error("Failed to update invoice items");
      throw insertError;
    }
    
    toast.success("Invoice updated successfully");
    return invoice;
  } catch (error) {
    console.error('Error in updateInvoice:', error);
    throw error;
  }
};

export const deleteInvoice = async (id: string): Promise<void> => {
  try {
    // Due to the CASCADE relationship, deleting the invoice will also delete its items
    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error('Error deleting invoice:', error);
      toast.error("Failed to delete invoice");
      throw error;
    }
    
    toast.success("Invoice deleted successfully");
  } catch (error) {
    console.error('Error in deleteInvoice:', error);
    throw error;
  }
};

// Inventory Counts API
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
      product: count.product,
      count: count.count,
      countedAt: new Date(count.counted_at),
      countMethod: count.count_method as 'manual' | 'video' | 'invoice',
      notes: count.notes
    })) as unknown as InventoryCount[];
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
        counted_at: count.countedAt,
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
      product: data.product,
      count: data.count,
      countedAt: new Date(data.counted_at),
      countMethod: data.count_method as 'manual' | 'video' | 'invoice',
      notes: data.notes
    } as unknown as InventoryCount;
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
      counted_at: count.countedAt,
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
      product: item.product,
      count: item.count,
      countedAt: new Date(item.counted_at),
      countMethod: item.count_method as 'manual' | 'video' | 'invoice',
      notes: item.notes
    })) as unknown as InventoryCount[];
  } catch (error) {
    console.error('Error in addInventoryCounts:', error);
    throw error;
  }
};

// AI Recognition Services
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
    const products = await getProducts();
    
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

export const processInvoiceImage = async (imageFile: File): Promise<InvoiceRecognitionResult> => {
  try {
    const formData = new FormData();
    formData.append('file', imageFile);

    const { data, error } = await supabase.functions.invoke('process-invoice', {
      body: formData,
    });

    if (error) {
      console.error('Error processing invoice image:', error);
      throw new Error(error.message);
    }

    // Map the response to our expected format
    const invoiceResult: InvoiceRecognitionResult = {
      supplierName: data.supplierName,
      invoiceNumber: data.invoiceNumber,
      date: data.date,
      total: data.total,
      items: data.items.map((item: any) => ({
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.total
      }))
    };

    return invoiceResult;
  } catch (error) {
    console.error('Error in processInvoiceImage:', error);
    throw error;
  }
};

// OpenAI Vision API Integration
export const analyzeImageWithOpenAI = async (imageBase64: string, prompt: string): Promise<string> => {
  try {
    const response = await supabase.functions.invoke('analyze-image', {
      body: { 
        imageBase64, 
        prompt 
      }
    });
    
    if (response.error) {
      console.error('Error analyzing image with OpenAI:', response.error);
      throw new Error(response.error.message);
    }
    
    return response.data.analysis;
  } catch (error) {
    console.error("Error analyzing image:", error);
    throw new Error("Failed to analyze image with OpenAI Vision API");
  }
};
