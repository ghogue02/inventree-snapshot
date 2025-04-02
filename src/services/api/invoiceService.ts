import { toast } from "sonner";
import { Invoice, InvoiceItem, InvoiceRecognitionResult } from "@/types/inventory";
import { supabase } from "@/integrations/supabase/client";
import { mapProductFromDatabase } from "./utils";

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
            product: item.product ? mapProductFromDatabase(item.product) : undefined,
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
        date: invoice.date.toISOString(),
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
        date: invoice.date.toISOString(),
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

export const loadMockInvoices = async (): Promise<void> => {
  try {
    // Import mock invoices
    const { mockInvoices } = await import('@/data/mockInvoices');
    
    // First, get all existing products
    const { data: existingProducts, error: productsError } = await supabase
      .from('products')
      .select('id, name');
      
    if (productsError) {
      console.error('Error fetching products:', productsError);
      toast.error("Failed to fetch products");
      throw productsError;
    }
    
    // Create a map of product names to IDs
    const productMap = new Map(existingProducts.map(p => [p.name, p.id]));
    
    // Process each invoice
    for (const mockInvoice of mockInvoices) {
      try {
        // Validate that we have product IDs for all items
        const validItems = mockInvoice.items.filter(item => {
          const productId = productMap.get(item.name);
          if (!productId) {
            console.warn(`Skipping item ${item.name} - no product ID found`);
          }
          return !!productId;
        });
        
        if (validItems.length === 0) {
          console.error('No valid items found for invoice:', mockInvoice.invoiceNumber);
          continue;
        }
        
        // Calculate total from valid items only
        const total = validItems.reduce((sum, item) => sum + item.total, 0);
        
        // Create the invoice
        const { data: invoiceData, error: invoiceError } = await supabase
          .from('invoices')
          .insert({
            supplier_name: mockInvoice.supplier,
            invoice_number: mockInvoice.invoiceNumber,
            date: mockInvoice.date,
            total: total,
            paid_status: 'paid',
            image_url: null
          })
          .select()
          .single();
          
        if (invoiceError) {
          console.error('Error creating mock invoice:', invoiceError);
          toast.error(`Failed to create invoice ${mockInvoice.invoiceNumber}`);
          continue;
        }
        
        const invoiceId = invoiceData.id;
        
        // Create invoice items only for products that exist
        const itemsToInsert = validItems.map(item => ({
          invoice_id: invoiceId,
          product_id: productMap.get(item.name)!,
          quantity: item.quantity,
          unit_price: item.pricePerUnit,
          total: item.total
        }));
        
        const { error: itemsError } = await supabase
          .from('invoice_items')
          .insert(itemsToInsert);
          
        if (itemsError) {
          console.error('Error adding mock invoice items:', itemsError);
          // Clean up the invoice if items failed
          await supabase.from('invoices').delete().eq('id', invoiceId);
          toast.error(`Failed to add items for invoice ${mockInvoice.invoiceNumber}`);
          continue;
        }
        
        // Update product stock levels based on invoice items
        for (const item of validItems) {
          const productId = productMap.get(item.name);
          if (productId) {
            const { error: updateError } = await supabase
              .from('products')
              .update({
                current_stock: supabase.raw(`current_stock + ${item.quantity}`)
              })
              .eq('id', productId);
              
            if (updateError) {
              console.error(`Error updating stock for ${item.name}:`, updateError);
              toast.error(`Failed to update stock for ${item.name}`);
            }
          }
        }
        
        toast.success(`Invoice ${mockInvoice.invoiceNumber} created successfully`);
      } catch (error) {
        console.error(`Error processing invoice ${mockInvoice.invoiceNumber}:`, error);
        toast.error(`Failed to process invoice ${mockInvoice.invoiceNumber}`);
      }
    }
    
    toast.success("Mock invoices loaded successfully");
  } catch (error) {
    console.error('Error in loadMockInvoices:', error);
    toast.error("Failed to load mock invoices");
    throw error;
  }
};
