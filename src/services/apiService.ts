
import { toast } from "sonner";
import { v4 as uuidv4 } from 'uuid';
import { products, invoices, inventoryCounts } from "./mockData";
import { Product, Invoice, InventoryCount, InvoiceRecognitionResult, InventoryRecognitionResult } from "@/types/inventory";

// These API functions simulate backend calls
// In a real implementation, these would make actual API requests

// Products API
export const getProducts = async (): Promise<Product[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return [...products];
};

export const addProduct = async (product: Omit<Product, "id">): Promise<Product> => {
  const newProduct = {
    ...product,
    id: uuidv4()
  };
  
  products.push(newProduct);
  toast.success("Product added successfully");
  return newProduct;
};

export const updateProduct = async (product: Product): Promise<Product> => {
  const index = products.findIndex(p => p.id === product.id);
  
  if (index !== -1) {
    products[index] = product;
    toast.success("Product updated successfully");
    return product;
  }
  
  throw new Error("Product not found");
};

export const deleteProduct = async (id: string): Promise<void> => {
  const index = products.findIndex(p => p.id === id);
  
  if (index !== -1) {
    products.splice(index, 1);
    toast.success("Product deleted successfully");
    return;
  }
  
  throw new Error("Product not found");
};

// Invoices API
export const getInvoices = async (): Promise<Invoice[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return [...invoices];
};

export const addInvoice = async (invoice: Omit<Invoice, "id">): Promise<Invoice> => {
  const newInvoice = {
    ...invoice,
    id: uuidv4(),
    items: invoice.items.map(item => ({
      ...item,
      id: uuidv4(),
      invoiceId: ""
    }))
  };
  
  // Set the invoice ID for each item
  newInvoice.items.forEach(item => {
    item.invoiceId = newInvoice.id;
  });
  
  invoices.push(newInvoice);
  toast.success("Invoice added successfully");
  return newInvoice;
};

export const updateInvoice = async (invoice: Invoice): Promise<Invoice> => {
  const index = invoices.findIndex(inv => inv.id === invoice.id);
  
  if (index !== -1) {
    invoices[index] = invoice;
    toast.success("Invoice updated successfully");
    return invoice;
  }
  
  throw new Error("Invoice not found");
};

export const deleteInvoice = async (id: string): Promise<void> => {
  const index = invoices.findIndex(inv => inv.id === id);
  
  if (index !== -1) {
    invoices.splice(index, 1);
    toast.success("Invoice deleted successfully");
    return;
  }
  
  throw new Error("Invoice not found");
};

// Inventory Counts API
export const getInventoryCounts = async (): Promise<InventoryCount[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return [...inventoryCounts];
};

export const addInventoryCount = async (count: Omit<InventoryCount, "id">): Promise<InventoryCount> => {
  const newCount = {
    ...count,
    id: uuidv4()
  };
  
  inventoryCounts.push(newCount);
  
  // Update the product's current stock
  const product = products.find(p => p.id === newCount.productId);
  if (product) {
    product.currentStock = newCount.count;
  }
  
  toast.success("Inventory count added successfully");
  return newCount;
};

// Add bulk inventory counts
export const addInventoryCounts = async (counts: Omit<InventoryCount, "id">[]): Promise<InventoryCount[]> => {
  const newCounts = counts.map(count => ({
    ...count,
    id: uuidv4()
  }));
  
  newCounts.forEach(count => {
    inventoryCounts.push(count);
    
    // Update the product's current stock
    const product = products.find(p => p.id === count.productId);
    if (product) {
      product.currentStock = count.count;
    }
  });
  
  toast.success(`${newCounts.length} inventory counts added successfully`);
  return newCounts;
};

// AI Recognition Services
export const processInventoryVideo = async (videoFile: File): Promise<InventoryRecognitionResult[]> => {
  // Simulate video processing delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // This is a mock implementation - in a real app, this would call an actual AI service
  // For demo purposes, we'll return random results based on our product list
  const results = products
    .slice(0, Math.floor(Math.random() * products.length) + 1)
    .map(product => ({
      productId: product.id,
      name: product.name,
      count: Math.floor(Math.random() * 10) + 1,
      confidence: Math.random() * 0.3 + 0.7 // Random confidence between 0.7 and 1.0
    }));
  
  return results;
};

export const processInvoiceImage = async (imageFile: File): Promise<InvoiceRecognitionResult> => {
  // Simulate image processing delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // This is a mock implementation - in a real app, this would call an actual AI service
  // For demo purposes, we'll return random results based on our product list
  const randomProducts = products
    .sort(() => Math.random() - 0.5) // Shuffle
    .slice(0, Math.floor(Math.random() * 4) + 1); // Take 1-4 random products
  
  const result: InvoiceRecognitionResult = {
    supplierName: "Mock Supplier " + Math.floor(Math.random() * 100),
    invoiceNumber: "INV-" + Math.floor(Math.random() * 10000),
    date: new Date().toISOString().split('T')[0],
    total: 0,
    items: []
  };
  
  // Generate random items
  result.items = randomProducts.map(product => {
    const quantity = Math.floor(Math.random() * 5) + 1;
    const unitPrice = product.cost;
    const total = quantity * unitPrice;
    
    return {
      name: product.name,
      quantity,
      unitPrice,
      total
    };
  });
  
  // Calculate total
  result.total = result.items.reduce((sum, item) => sum + item.total, 0);
  
  return result;
};

// OpenAI Vision API Integration
export const analyzeImageWithOpenAI = async (imageBase64: string, prompt: string): Promise<string> => {
  const apiKey = "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";
  
  try {
    // In a real implementation, you would make an actual API call
    // For demo purposes, we'll simulate the response
    console.log("Would make an OpenAI API call with:", { prompt });
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // For demo purposes, generate a mock response based on the prompt
    let response;
    if (prompt.includes("inventory")) {
      response = `I can see the following inventory items:
- Tomatoes: approximately 5-7 kg
- Onions: approximately 3-4 kg
- Rice: approximately 10-12 kg
- Olive Oil: 2 bottles`;
    } else if (prompt.includes("invoice")) {
      response = `Invoice Details:
Supplier: Fresh Foods Inc.
Invoice #: INV-2023-098
Date: ${new Date().toLocaleDateString()}
Items:
1. Tomatoes - 8kg - $23.92
2. Chicken Breast - 5kg - $44.95
3. Rice - 10kg - $24.90
Total: $93.77`;
    } else {
      response = "I can see various food items in what appears to be a restaurant kitchen. To get more specific details, please ask about inventory items or invoice information specifically.";
    }
    
    return response;
  } catch (error) {
    console.error("Error analyzing image:", error);
    throw new Error("Failed to analyze image with OpenAI Vision API");
  }
};
