import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FetchONTsRequest {
  api_url: string;
  api_key: string;
  olt_device_id?: string;
  page?: number;
  limit?: number;
}

interface ONTDevice {
  serial: string;
  name: string;
  status: string;
  signal: string;
  uptime: string;
  olt_id: string;
  pon_port: string;
  description: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { api_url, api_key, olt_device_id, page = 1, limit = 50 } = await req.json() as FetchONTsRequest;

    console.log('Fetching ONTs from SmartOLT:', { api_url, olt_device_id, page, limit });

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
    
    // SmartOLT API endpoint for listing ONTs
    // The endpoint varies based on whether we want all ONTs or from specific OLT
    const endpoint = olt_device_id 
      ? `${baseUrl}/api/onu/get_onus_list_by_olt/${olt_device_id}`
      : `${baseUrl}/api/onu/get_onus_list`;

    console.log('Making request to:', endpoint);

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'X-Token': api_key,
        'Content-Type': 'application/json',
      },
    });

    const responseText = await response.text();
    console.log('SmartOLT API response status:', response.status);

    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      console.error('Failed to parse SmartOLT response as JSON');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid response from SmartOLT API',
          onts: []
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check for API error
    if (data.status === false || data.error) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: data.message || data.error || 'SmartOLT API returned an error',
          onts: []
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Parse ONT data from SmartOLT response
    // SmartOLT typically returns data in response.data or response array
    const rawONTs = data.response || data.data || [];
    
    // Transform to our standard format
    const onts: ONTDevice[] = rawONTs.map((ont: any) => ({
      serial: ont.sn || ont.serial_number || ont.onu_sn || 'Unknown',
      name: ont.name || ont.description || ont.onu_name || '',
      status: normalizeStatus(ont.status || ont.onu_status || ont.phase_state),
      signal: formatSignal(ont.rx_power || ont.onu_rx_power || ont.optical_rx_power),
      uptime: formatUptime(ont.uptime || ont.onu_uptime || 0),
      olt_id: ont.olt_id || ont.olt || olt_device_id || '',
      pon_port: ont.pon_port || ont.board_port || '',
      description: ont.description || ont.name || '',
    }));

    console.log(`Fetched ${onts.length} ONTs from SmartOLT`);

    return new Response(
      JSON.stringify({
        success: true,
        onts,
        total: onts.length,
        page,
        limit,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error fetching ONTs from SmartOLT:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: `Failed to fetch ONTs: ${errorMessage}`,
        onts: []
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

// Helper functions
function normalizeStatus(status: string | number | undefined): string {
  if (!status) return 'Unknown';
  
  const statusStr = String(status).toLowerCase();
  
  if (statusStr === 'online' || statusStr === 'working' || statusStr === '1' || statusStr === 'active') {
    return 'Online';
  }
  if (statusStr === 'los' || statusStr === 'loss_of_signal' || statusStr === 'los_lof') {
    return 'LOS';
  }
  if (statusStr === 'offline' || statusStr === '0' || statusStr === 'inactive' || statusStr === 'dying_gasp') {
    return 'Offline';
  }
  if (statusStr === 'power_off' || statusStr === 'poweroff') {
    return 'Power Off';
  }
  
  return status.toString();
}

function formatSignal(signal: string | number | undefined): string {
  if (!signal || signal === '' || signal === '-' || signal === 'N/A') {
    return '-';
  }
  
  const numSignal = typeof signal === 'string' ? parseFloat(signal) : signal;
  
  if (isNaN(numSignal)) {
    return '-';
  }
  
  return numSignal.toFixed(1);
}

function formatUptime(uptime: number | string | undefined): string {
  if (!uptime || uptime === 0 || uptime === '0') {
    return '-';
  }
  
  // If already formatted string
  if (typeof uptime === 'string' && uptime.includes('d')) {
    return uptime;
  }
  
  // Assume uptime is in seconds
  const seconds = typeof uptime === 'string' ? parseInt(uptime, 10) : uptime;
  
  if (isNaN(seconds) || seconds <= 0) {
    return '-';
  }
  
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  return `${days}d ${hours}h ${minutes}m`;
}
