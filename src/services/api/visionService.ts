
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// OpenAI Vision API Integration
export const analyzeImageWithOpenAI = async (imageBase64: string, prompt: string): Promise<string> => {
  try {
    console.log('Sending image for analysis...');
    
    const response = await supabase.functions.invoke('analyze-image', {
      body: { 
        imageBase64, 
        prompt 
      }
    });
    
    // Handle different response scenarios
    if (response.error) {
      console.error('Error analyzing image with OpenAI:', response.error);
      throw new Error(response.error.message || 'Failed to analyze image');
    }
    
    if (!response.data || !response.data.analysis) {
      console.error('Invalid response format:', response.data);
      throw new Error('Invalid response from analysis service');
    }
    
    console.log('Image analysis successful');
    return response.data.analysis;
  } catch (error) {
    console.error("Error analyzing image:", error);
    toast.error("Failed to analyze image. Please try again.");
    throw new Error("Failed to analyze image with OpenAI Vision API");
  }
};

// Helper function to debug inventory counts before saving
export const debugInventoryCounts = (counts: any[]) => {
  console.log('Inventory counts to save:', JSON.stringify(counts, null, 2));
  return counts;
};

// New function to analyze product with OpenAI Vision API
export const analyzeProductWithOpenAI = async (imageBase64: string): Promise<any> => {
  try {
    console.log('Sending image for product analysis...');
    
    const response = await supabase.functions.invoke('analyze-product', {
      body: { 
        imageBase64
      }
    });
    
    // Handle different response scenarios
    if (response.error) {
      console.error('Error analyzing product with OpenAI:', response.error);
      throw new Error(response.error.message || 'Failed to analyze product');
    }
    
    if (!response.data) {
      console.error('Invalid response format:', response.data);
      throw new Error('Invalid response from product analysis service');
    }
    
    console.log('Product analysis successful', response.data);
    return response.data;
  } catch (error) {
    console.error("Error analyzing product:", error);
    toast.error("Failed to analyze product. Please try again.");
    throw new Error("Failed to analyze product with OpenAI Vision API");
  }
};
