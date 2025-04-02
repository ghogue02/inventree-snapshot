import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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

const uploadImageToStorage = async (base64Data: string, fileName: string): Promise<string> => {
  try {
    // Convert base64 to blob
    const base64WithoutHeader = base64Data.replace(/^data:image\/\w+;base64,/, '');
    const byteString = atob(base64WithoutHeader);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const uint8Array = new Uint8Array(arrayBuffer);
    
    for (let i = 0; i < byteString.length; i++) {
      uint8Array[i] = byteString.charCodeAt(i);
    }
    
    const blob = new Blob([uint8Array], { type: 'image/png' });
    
    // Upload to Supabase storage
    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(`${fileName}.png`, blob, {
        contentType: 'image/png',
        upsert: true
      });
      
    if (error) throw error;
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(`${fileName}.png`);
      
    return publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

export const generateProductImage = async (productName: string, category: string): Promise<string | null> => {
  try {
    const prompt = getCategorySpecificPrompt(productName, category);
    
    // Call Supabase Edge Function to generate image
    const { data, error } = await supabase.functions.invoke('generate-image', {
      body: { prompt, productName, category }
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data?.imageUrl) {
      throw new Error('No image URL returned');
    }

    // Upload the base64 image to Supabase storage
    const fileName = `${category.toLowerCase()}-${productName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    const publicUrl = await uploadImageToStorage(data.imageUrl, fileName);
    
    return publicUrl;
  } catch (error) {
    console.error('Error generating image:', error);
    toast.error("Failed to generate image");
    return null;
  }
};

export const generateAllProductImages = async (products: { id: string; name: string; category: string; image: string | null; }[]): Promise<void> => {
  try {
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
            console.error('Error updating product with image:', updateError);
            failureCount++;
          } else {
            successCount++;
          }
        } else {
          failureCount++;
        }
      } catch (error) {
        console.error('Error processing product:', error);
        failureCount++;
      }
    }

    toast.dismiss();
    if (failureCount === 0) {
      toast.success(`Successfully generated ${successCount} product images`);
    } else {
      toast.warning(`Generated ${successCount} images, failed to generate ${failureCount} images`);
    }
  } catch (error) {
    console.error('Error generating all images:', error);
    toast.error("Failed to generate product images");
  }
}; 