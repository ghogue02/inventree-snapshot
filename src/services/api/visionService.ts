
import { supabase } from "@/integrations/supabase/client";

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
