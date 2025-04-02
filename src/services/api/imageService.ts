import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

export const generateProductImage = async (productName: string, category: string): Promise<string | null> => {
  try {
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured');
    }

    const prompt = `A professional, clean product photo of ${productName} for a restaurant inventory system. The image should be on a white background, well-lit, and show the product clearly. Category: ${category}. Style: Minimalist commercial product photography.`;
    
    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
        response_format: "url"
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('OpenAI API Error:', errorData);
      throw new Error(`Failed to generate image: ${response.statusText}`);
    }

    const data = await response.json();
    const imageUrl = data.data[0].url;

    // Fetch the image from OpenAI
    const imageResponse = await fetch(imageUrl);
    const imageBlob = await imageResponse.blob();

    // Convert blob to base64
    const reader = new FileReader();
    const base64Promise = new Promise<string>((resolve) => {
      reader.onloadend = () => resolve(reader.result as string);
    });
    reader.readAsDataURL(imageBlob);
    const base64Data = await base64Promise;

    // Generate a unique filename
    const fileName = `${productName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.png`;

    // Upload using the edge function
    const uploadResponse = await fetch(`${supabase.getUrl()}/functions/v1/upload-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabase.getAuthToken()}`
      },
      body: JSON.stringify({
        imageData: base64Data,
        fileName
      })
    });

    if (!uploadResponse.ok) {
      throw new Error('Failed to upload image');
    }

    const { url } = await uploadResponse.json();
    return url;
  } catch (error) {
    console.error('Error in generateProductImage:', error);
    toast.error("Failed to generate product image");
    return null;
  }
};

export const generateAllProductImages = async (products: { name: string; category: string; }[]): Promise<void> => {
  try {
    toast.loading("Generating product images...");
    
    for (const product of products) {
      const imageUrl = await generateProductImage(product.name, product.category);
      if (imageUrl) {
        await supabase
          .from('products')
          .update({ image: imageUrl })
          .eq('name', product.name);
      }
    }

    toast.success("Product images generated successfully");
  } catch (error) {
    console.error('Error generating all product images:', error);
    toast.error("Failed to generate some product images");
  }
}; 