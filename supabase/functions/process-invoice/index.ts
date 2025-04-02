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

    console.log(`Processing invoice: ${file.name}, size: ${file.size} bytes, type: ${file.type}`);

    // Read the file as an array buffer
    const arrayBuffer = await file.arrayBuffer();
    const base64Data = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    
    // Process with OpenAI Vision API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an expert at extracting data from restaurant invoices. Extract the following information from the invoice image: supplier name, invoice number, date, total amount, and line items (with name, quantity, unit price, and total for each item). Format your response as JSON with these fields. Include only the JSON in your response, nothing else.'
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Extract all data from this restaurant invoice:' },
              { type: 'image_url', image_url: { url: `data:${file.type};base64,${base64Data}` } }
            ]
          }
        ],
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      throw new Error('Analysis failed');
    }

    const result = await response.json();
    console.log('Successfully processed invoice image');
    
    // Parse the content from the assistant's message to get the structured invoice data
    const invoiceData = JSON.parse(result.choices[0].message.content);
    
    return new Response(
      JSON.stringify(invoiceData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in process-invoice function:', error);
    return new Response(
      JSON.stringify({ error: 'Analysis failed' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
