
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
