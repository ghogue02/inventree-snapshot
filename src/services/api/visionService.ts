import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { InventoryRecognitionResult } from "@/types/inventory";

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
      throw new Error('Analysis failed');
    }
    
    if (!response.data || !response.data.analysis) {
      throw new Error('Invalid response format');
    }
    
    return response.data.analysis;
  } catch (error) {
    toast.error("Failed to analyze image");
    throw new Error("Analysis failed");
  }
};

// Helper function to debug inventory counts before saving
export const debugInventoryCounts = (counts: any[]) => {
  console.log('Inventory counts to save:', JSON.stringify(counts, null, 2));
  return counts;
};

// Process product with OpenAI Vision API
export const analyzeProductWithOpenAI = async (imageBase64: string): Promise<any> => {
  try {    
    const response = await supabase.functions.invoke('analyze-product', {
      body: { 
        imageBase64
      }
    });
    
    if (response.error) {
      throw new Error('Analysis failed');
    }
    
    if (!response.data) {
      throw new Error('Invalid response format');
    }

    if (response.data.product && typeof response.data.product.currentStock !== 'undefined') {
      response.data.product.currentStock = 1;
    }
    
    return response.data;
  } catch (error) {
    toast.error("Failed to analyze product");
    throw new Error("Analysis failed");
  }
};

// New utility to export inventory data to CSV format
export const exportInventoryToCSV = (items: InventoryRecognitionResult[]): string => {
  const headers = ["Product Name", "Size", "Count", "Confidence"];
  const csvContent = [
    headers.join(","),
    ...items.map(item => [
      `"${item.name}"`, 
      `"${item.size || 'N/A'}"`,
      item.count,
      `${Math.round(item.confidence * 100)}%`
    ].join(","))
  ].join("\n");
  
  return csvContent;
};

// New utility to generate print-friendly HTML
export const generatePrintableHTML = (items: InventoryRecognitionResult[]): string => {
  const tableRows = items.map(item => `
    <tr>
      <td>${item.name}</td>
      <td>${item.size || 'N/A'}</td>
      <td>${item.count}</td>
      <td>${Math.round(item.confidence * 100)}%</td>
    </tr>
  `).join('');
  
  return `
    <html>
      <head>
        <title>Inventory Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #333; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { padding: 8px; border-bottom: 1px solid #ddd; text-align: left; }
          th { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        <h1>Inventory Scan Report - ${new Date().toLocaleDateString()}</h1>
        <table>
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Size/Volume</th>
              <th>Count</th>
              <th>Confidence</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
        <p>Generated on: ${new Date().toLocaleString()}</p>
      </body>
    </html>
  `;
};
