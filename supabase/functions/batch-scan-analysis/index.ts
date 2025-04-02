
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
      throw new Error('No image data provided');
    }
    
    console.log('Received image data for batch analysis');
    
    // Process with Google Gemini API
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY') || 'AIzaSyCZZMJ8vA1iizznjHH7jw3KRd4yvARay5s';
    
    console.log('Calling Gemini API for batch shelf analysis');
    
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/google/gemini-2.0-flash-001:generateContent?key=' + geminiApiKey, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: "You are an inventory analysis assistant. Please analyze this image and identify all distinct food or beverage items visible. For each item, provide: 1) Product name with brand, 2) Size/volume/weight information if visible, 3) Estimated quantity visible in the image. Format your response as a JSON array of items where each item has 'name', 'size', and 'count' properties."
              },
              {
                inline_data: {
                  mime_type: "image/jpeg",
                  data: imageBase64.split(',')[1]
                }
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 2048,
          responseStructure: {
            "type": "object",
            "properties": {
              "items": {
                "type": "array",
                "items": {
                  "type": "object", 
                  "properties": {
                    "name": {"type": "string"},
                    "size": {"type": "string"},
                    "count": {"type": "number"},
                    "confidence": {"type": "number"}
                  },
                  "required": ["name"]
                }
              }
            },
            "required": ["items"]
          }
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API error:', errorData);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const result = await response.json();
    console.log('Successfully processed shelf image with Gemini');
    
    let inventoryData;
    
    // Extract the inventory data from the Gemini response
    if (result.candidates && result.candidates[0] && result.candidates[0].content) {
      // Try to find JSON in the response
      const content = result.candidates[0].content;
      
      // Look for parts with text that contains JSON
      if (content.parts && content.parts.length > 0) {
        for (const part of content.parts) {
          if (part.text) {
            try {
              // Try to extract JSON from the text
              const jsonMatch = part.text.match(/\{[\s\S]*\}/);
              if (jsonMatch) {
                inventoryData = JSON.parse(jsonMatch[0]);
                break;
              }
            } catch (e) {
              console.error('Error parsing JSON from text response:', e);
            }
          }
        }
      }
      
      // If no JSON was found in the parts, check for structured format response
      if (!inventoryData && content.structuredFormat) {
        inventoryData = content.structuredFormat;
      }
    }
    
    // If we still couldn't parse inventory data, return an error
    if (!inventoryData || !inventoryData.items) {
      console.error('Failed to parse inventory data from Gemini response');
      console.log('Raw response:', JSON.stringify(result));
      inventoryData = { items: [] };
    }
    
    // Add confidence scores if not present
    inventoryData.items = inventoryData.items.map(item => ({
      ...item,
      confidence: item.confidence || 0.9,
      count: item.count || 1
    }));
    
    return new Response(
      JSON.stringify(inventoryData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in batch-scan-analysis function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
