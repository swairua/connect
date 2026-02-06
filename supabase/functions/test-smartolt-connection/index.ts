import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SmartOLTTestRequest {
  api_url: string;
  api_key: string;
  olt_device_id?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { api_url, api_key, olt_device_id } = await req.json() as SmartOLTTestRequest;

    console.log('Testing SmartOLT connection:', { api_url, olt_device_id });

    if (!api_url || !api_key) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'API URL and API Key are required' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Normalize API URL
    const baseUrl = api_url.replace(/\/+$/, '');
    
    // Test connection by fetching OLT list or device info
    const testEndpoint = olt_device_id 
      ? `${baseUrl}/api/olt/get_olt_info/${olt_device_id}`
      : `${baseUrl}/api/olt/get_olts`;

    console.log('Making request to:', testEndpoint);

    const response = await fetch(testEndpoint, {
      method: 'GET',
      headers: {
        'X-Token': api_key,
        'Content-Type': 'application/json',
      },
    });

    const responseText = await response.text();
    console.log('SmartOLT API response status:', response.status);
    console.log('SmartOLT API response:', responseText);

    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      console.error('Failed to parse SmartOLT response as JSON');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid response from SmartOLT API',
          details: responseText.substring(0, 200)
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // SmartOLT API typically returns status field
    if (data.status === false || data.error) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: data.message || data.error || 'SmartOLT API returned an error',
          details: data
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Connection successful
    const result = {
      success: true,
      message: 'Successfully connected to SmartOLT API',
      data: {
        olt_count: Array.isArray(data.response) ? data.response.length : 1,
        olt_info: olt_device_id ? data.response : undefined,
        timestamp: new Date().toISOString()
      }
    };

    console.log('Connection test successful:', result);

    return new Response(
      JSON.stringify(result),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error testing SmartOLT connection:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: `Connection failed: ${errorMessage}`,
        details: 'Make sure the API URL is correct and accessible'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
