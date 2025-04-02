import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// import "https://deno.land/x/xhr@0.1.0/mod.ts"; // Often not needed for basic fetch

const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Allow requests from any origin (adjust if needed for production)
  'Access-Control-Allow-Methods': 'POST, OPTIONS', // Explicitly allow POST and OPTIONS
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', // Headers your frontend sends
};

console.log("analyze-image function starting..."); // Log function start

serve(async (req) => {
  console.log(`Received request: ${req.method} ${req.url}`); // Log incoming request

  // --- CORS Preflight Handling ---
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS preflight request');
    // Respond successfully to the preflight request
    return new Response(null, {
      status: 200, // Explicitly return 200 OK status
      headers: corsHeaders
    });
  }

  // --- Handle Actual POST Request ---
  if (req.method === 'POST') {
    console.log('Handling POST request');
    try {
      const { imageBase64, prompt } = await req.json();
      console.log(`Prompt received: ${prompt ? prompt.substring(0, 50) : 'No prompt'}`);
      console.log(`Image data received (first 50 chars): ${imageBase64 ? imageBase64.substring(0, 50) : 'No image data'}`);

      if (!imageBase64) {
        throw new Error('Image data is required');
      }

      const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
      if (!openAIApiKey) {
        console.error('OPENAI_API_KEY secret not found!');
        throw new Error('OpenAI API key is not configured');
      }
      console.log('OpenAI API Key found.');

      const imageUrl = imageBase64.startsWith('data:')
        ? imageBase64
        : `data:image/jpeg;base64,${imageBase64}`;

      const requestBody = {
        model: 'gpt-4o', // Ensure this model is available to your key
        messages: [
          {
            role: 'system',
            content: 'You are an inventory management assistant that helps identify food items and their quantities. For each item you identify, provide (1) the exact product name, (2) size/volume information (e.g., 16 oz, 1 liter, 2 lb), (3) count as individual units (each box/bottle/package counts as 1 unit regardless of its size).'
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt || 'Please analyze this image and identify all food inventory items you see. For each item, provide an estimated quantity.' },
              { type: 'image_url', image_url: { url: imageUrl } }
            ]
          }
        ],
        max_tokens: 500,
      };

      console.log('Calling OpenAI Vision API...');
      // console.log('OpenAI Request Body:', JSON.stringify(requestBody)); // Uncomment for deep debugging

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log(`OpenAI response status: ${response.status}`);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('OpenAI API error response:', errorData);
        // Provide more specific error message if possible
        const message = errorData?.error?.message || `OpenAI API Error: ${response.status}`;
        throw new Error(message);
      }

      const data = await response.json();
      // console.log('OpenAI Success Response:', JSON.stringify(data)); // Uncomment for deep debugging
      const analysis = data.choices?.[0]?.message?.content;

      if (!analysis) {
        console.error('Could not extract analysis content from OpenAI response:', data);
        throw new Error('Failed to get analysis from OpenAI response.');
      }

      console.log('Successfully analyzed image with OpenAI.');

      // Return success response with CORS headers
      return new Response(
        JSON.stringify({ analysis }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (error) {
      console.error('Error processing POST request:', error);
      // Return error response with CORS headers
      return new Response(
        JSON.stringify({ error: error.message || 'Internal Server Error' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
  }

  // --- Handle other methods ---
  console.log(`Method ${req.method} not allowed.`);
  return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
    status: 405,
    headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Allow': 'POST, OPTIONS' } // Add Allow header
  });
});
