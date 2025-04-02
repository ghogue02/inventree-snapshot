import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the service role key
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the image data from the request
    const { imageData, fileName } = await req.json()

    if (!imageData || !fileName) {
      throw new Error('Missing required fields')
    }

    // Convert base64 to blob
    const base64Data = imageData.split(',')[1]
    const binaryData = atob(base64Data)
    const bytes = new Uint8Array(binaryData.length)
    for (let i = 0; i < binaryData.length; i++) {
      bytes[i] = binaryData.charCodeAt(i)
    }
    const blob = new Blob([bytes], { type: 'image/png' })

    // Upload to Supabase storage
    const { data, error } = await supabaseClient.storage
      .from('product-images')
      .upload(fileName, blob, {
        contentType: 'image/png',
        upsert: true
      })

    if (error) {
      throw error
    }

    // Get the public URL
    const { data: publicUrlData } = supabaseClient.storage
      .from('product-images')
      .getPublicUrl(fileName)

    return new Response(
      JSON.stringify({ url: publicUrlData.publicUrl }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
}) 