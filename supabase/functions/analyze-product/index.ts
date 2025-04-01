
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      throw new Error('Image data is required');
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key is not configured');
    }

    console.log('Calling OpenAI Vision API for product analysis');

    // Ensure the image is properly formatted for OpenAI
    const imageUrl = imageBase64.startsWith('data:') 
      ? imageBase64 
      : `data:image/jpeg;base64,${imageBase64}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an expert at analyzing food products for inventory management. For the given product image, extract the following details: product name (include brand), category (e.g., Grains, Dairy, Vegetables, etc.), unit (e.g., oz, lb, each, etc.), cost (provide a reasonable estimate based on the product if not visible), size/volume (e.g., "16 oz", "1 liter", "2 lb" - be as specific as possible), current stock (always set this to 1 box/package/item regardless of weight/volume), and reorder point (suggest a reasonable value). Format the response as JSON with these exact properties: name, category, unit, cost, size, currentStock, reorderPoint. The "size" field should contain the specific size/volume information.'
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Analyze this food product and extract inventory details.' },
              { type: 'image_url', image_url: { url: imageUrl } }
            ]
          }
        ],
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    const analysisText = data.choices[0].message.content;

    console.log('Successfully analyzed product with OpenAI');

    // Try to parse JSON from the response
    let productData;
    try {
      // Looking for JSON in the response text
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        productData = JSON.parse(jsonMatch[0]);
        
        // Always ensure currentStock is set to 1 (one item/package)
        productData.currentStock = 1;
        
        // If unit doesn't include the size and size is available, append it
        if (productData.size && !productData.name.includes(productData.size)) {
          productData.name = `${productData.name} (${productData.size})`;
        }
      } else {
        throw new Error("No JSON found in the response");
      }
    } catch (error) {
      console.error('Error parsing product data:', error);
      console.log('Raw analysis:', analysisText);
      
      // Create a sensible default from the text
      productData = {
        name: "Unknown Product",
        category: "Other",
        unit: "each",
        cost: 0,
        size: "",
        currentStock: 1,
        reorderPoint: 5,
        rawAnalysis: analysisText
      };
    }

    return new Response(
      JSON.stringify({ product: productData, rawAnalysis: analysisText }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in analyze-product function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
