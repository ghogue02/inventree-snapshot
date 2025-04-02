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
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      throw new Error('No file provided');
    }

    console.log('Processing inventory analysis request');
    console.log(`Processing file: ${file.name}, size: ${file.size} bytes, type: ${file.type}`);

    // Read the file as an array buffer
    const arrayBuffer = await file.arrayBuffer();
    const base64Data = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    
    // Process with Google Gemini API
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY') || 'AIzaSyCZZMJ8vA1iizznjHH7jw3KRd4yvARay5s';
    
    console.log('Calling Gemini API for video/image analysis');
    
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
                text: "You are an expert inventory counting assistant. Identify all food items visible in this image or video and provide detailed information. For each item include: (1) exact product name with brand, (2) size/volume information (e.g., 16 oz, 1 liter, 2 lb), and (3) count as individual items (each package/container counts as 1 unit regardless of size). Format your response as JSON with an array of items, each with 'name', 'size', and 'count' properties."
              },
              {
                inline_data: {
                  mime_type: file.type,
                  data: base64Data
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
                    "count": {"type": "number"}
                  },
                  "required": ["name", "count"]
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
    console.log('Successfully processed inventory image/video with Gemini');
    
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
    
    return new Response(
      JSON.stringify(inventoryData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in process-inventory function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
