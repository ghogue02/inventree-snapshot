import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const getOpenAIKey = () => {
  const key = import.meta.env.VITE_OPENAI_API_KEY;
  if (!key) {
    console.error('OpenAI API key not configured');
    return null;
  }
  return key.trim();
};

const getCategorySpecificPrompt = (productName: string, category: string): string => {
  const basePrompt = "A professional, clean product photo";
  
  switch (category.toLowerCase()) {
    case 'grains':
      return `${basePrompt} of a box or package of ${productName}. Show the packaging clearly with the brand name visible. Style: Commercial product photography on white background.`;
    case 'meat':
      return `${basePrompt} of fresh, raw ${productName} on a clean white cutting board. Style: Food photography with soft lighting.`;
    case 'produce':
      return `${basePrompt} of fresh ${productName}, well-lit and arranged professionally. Style: Fresh produce photography on white background.`;
    case 'pantry':
      return `${basePrompt} of ${productName} in its retail packaging or container. Style: Commercial product photography on white background.`;
    case 'beverages':
      return `${basePrompt} of a single ${productName} container or bottle, showing the label clearly. Style: Beverage photography on white background.`;
    default:
      return `${basePrompt} of ${productName} for restaurant inventory. The image should be on a white background, well-lit, and show the product clearly. Category: ${category}. Style: Minimalist commercial product photography.`;
  }
};

export const generateProductImage = async (productName: string, category: string): Promise<string | null> => {
  try {
    const apiKey = getOpenAIKey();
    if (!apiKey) {
      toast.error("API configuration error");
      return null;
    }

    const prompt = getCategorySpecificPrompt(productName, category);
    
    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
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
      throw new Error(`Image generation failed`);
    }

    const data = await response.json();
    const imageUrl = data.data[0].url;

    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch generated image`);
    }

    const imageBlob = await imageResponse.blob();
    const reader = new FileReader();
    const base64Promise = new Promise<string>((resolve) => {
      reader.onloadend = () => resolve(reader.result as string);
    });
    reader.readAsDataURL(imageBlob);
    const base64Data = await base64Promise;

    const fileName = `${productName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.png`;
    return base64Data;

  } catch (error) {
    toast.error("Failed to generate image");
    return null;
  }
};

export const generateAllProductImages = async (products: { id: string; name: string; category: string; image: string | null; }[]): Promise<void> => {
  try {
    const apiKey = getOpenAIKey();
    if (!apiKey) {
      toast.error("API configuration error");
      return;
    }

    const productsNeedingImages = products.filter(product => !product.image);
    
    if (productsNeedingImages.length === 0) {
      toast.success("All products already have images");
      return;
    }

    toast.loading(`Generating images for ${productsNeedingImages.length} products...`);
    let successCount = 0;
    let failureCount = 0;
    
    for (const product of productsNeedingImages) {
      try {
        const imageUrl = await generateProductImage(product.name, product.category);
        if (imageUrl) {
          const { error: updateError } = await supabase
            .from('products')
            .update({ image: imageUrl })
            .eq('id', product.id);

          if (updateError) {
            failureCount++;
          } else {
            successCount++;
          }
        } else {
          failureCount++;
        }
      } catch (error) {
        failureCount++;
      }
    }

    if (failureCount === 0) {
      toast.success(`Successfully generated ${successCount} product images`);
    } else {
      toast.warning(`Generated ${successCount} images, failed to generate ${failureCount} images`);
    }
  } catch (error) {
    toast.error("Failed to generate product images");
  }
}; 