import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Mikrotik API word encoding
function encodeWord(word: string): Uint8Array {
  const encoder = new TextEncoder();
  const wordBytes = encoder.encode(word);
  const len = wordBytes.length;
  
  let lengthBytes: number[];
  if (len < 0x80) {
    lengthBytes = [len];
  } else if (len < 0x4000) {
    lengthBytes = [(len >> 8) | 0x80, len & 0xff];
  } else if (len < 0x200000) {
    lengthBytes = [(len >> 16) | 0xc0, (len >> 8) & 0xff, len & 0xff];
  } else if (len < 0x10000000) {
    lengthBytes = [(len >> 24) | 0xe0, (len >> 16) & 0xff, (len >> 8) & 0xff, len & 0xff];
  } else {
    lengthBytes = [0xf0, (len >> 24) & 0xff, (len >> 16) & 0xff, (len >> 8) & 0xff, len & 0xff];
  }
  
  const result = new Uint8Array(lengthBytes.length + wordBytes.length);
  result.set(lengthBytes, 0);
  result.set(wordBytes, lengthBytes.length);
  return result;
}

function encodeCommand(words: string[]): Uint8Array {
  const encodedWords = words.map(encodeWord);
  const emptyWord = new Uint8Array([0]);
  
  let totalLength = emptyWord.length;
  for (const word of encodedWords) {
    totalLength += word.length;
  }
  
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const word of encodedWords) {
    result.set(word, offset);
    offset += word.length;
  }
  result.set(emptyWord, offset);
  
  return result;
}

async function readWord(reader: ReadableStreamDefaultReader<Uint8Array>, buffer: Uint8Array[]): Promise<string | null> {
  let firstByte: number;
  
  if (buffer.length > 0 && buffer[0].length > 0) {
    firstByte = buffer[0][0];
    buffer[0] = buffer[0].slice(1);
    if (buffer[0].length === 0) buffer.shift();
  } else {
    const { value, done } = await reader.read();
    if (done || !value || value.length === 0) return null;
    firstByte = value[0];
    if (value.length > 1) {
      buffer.push(value.slice(1));
    }
  }
  
  if (firstByte === 0) return '';
  
  let len: number;
  let additionalBytes = 0;
  
  if ((firstByte & 0x80) === 0) {
    len = firstByte;
  } else if ((firstByte & 0xc0) === 0x80) {
    additionalBytes = 1;
    len = (firstByte & 0x3f) << 8;
  } else if ((firstByte & 0xe0) === 0xc0) {
    additionalBytes = 2;
    len = (firstByte & 0x1f) << 16;
  } else if ((firstByte & 0xf0) === 0xe0) {
    additionalBytes = 3;
    len = (firstByte & 0x0f) << 24;
  } else {
    additionalBytes = 4;
    len = 0;
  }
  
  for (let i = 0; i < additionalBytes; i++) {
    let byte: number;
    if (buffer.length > 0 && buffer[0].length > 0) {
      byte = buffer[0][0];
      buffer[0] = buffer[0].slice(1);
      if (buffer[0].length === 0) buffer.shift();
    } else {
      const { value, done } = await reader.read();
      if (done || !value || value.length === 0) return null;
      byte = value[0];
      if (value.length > 1) buffer.push(value.slice(1));
    }
    len = (len | (byte << (8 * (additionalBytes - i - 1))));
  }
  
  const wordBytes = new Uint8Array(len);
  let bytesRead = 0;
  
  while (bytesRead < len) {
    if (buffer.length > 0 && buffer[0].length > 0) {
      const available = Math.min(buffer[0].length, len - bytesRead);
      wordBytes.set(buffer[0].slice(0, available), bytesRead);
      bytesRead += available;
      buffer[0] = buffer[0].slice(available);
      if (buffer[0].length === 0) buffer.shift();
    } else {
      const { value, done } = await reader.read();
      if (done || !value) return null;
      const available = Math.min(value.length, len - bytesRead);
      wordBytes.set(value.slice(0, available), bytesRead);
      bytesRead += available;
      if (value.length > available) buffer.push(value.slice(available));
    }
  }
  
  return new TextDecoder().decode(wordBytes);
}

async function readSentence(reader: ReadableStreamDefaultReader<Uint8Array>, buffer: Uint8Array[]): Promise<string[]> {
  const words: string[] = [];
  
  while (true) {
    const word = await readWord(reader, buffer);
    if (word === null) break;
    if (word === '') break;
    words.push(word);
  }
  
  return words;
}

async function checkRouterHealth(config: {
  id: string;
  router_host: string;
  api_port: number;
  username: string;
  password: string;
}): Promise<{ success: boolean; apiVersion?: string; activeSessions?: number }> {
  console.log(`Checking health for router at ${config.router_host}:${config.api_port}`);

  let conn: Deno.TcpConn;
  try {
    conn = await Deno.connect({
      hostname: config.router_host,
      port: config.api_port,
      transport: "tcp",
    });
  } catch (error) {
    console.error(`Failed to connect to ${config.router_host}:`, error);
    return { success: false };
  }

  try {
    const reader = conn.readable.getReader();
    const writer = conn.writable.getWriter();
    const buffer: Uint8Array[] = [];

    // Login
    const loginCmd = encodeCommand(['/login', `=name=${config.username}`, `=password=${config.password}`]);
    await writer.write(loginCmd);

    const response = await Promise.race([
      readSentence(reader, buffer),
      new Promise<string[]>((_, reject) => setTimeout(() => reject(new Error('Timeout')), 8000))
    ]);

    const isSuccess = response.some(word => word === '!done');
    if (!isSuccess) {
      reader.releaseLock();
      writer.releaseLock();
      conn.close();
      return { success: false };
    }

    // Get system info
    const resourceCmd = encodeCommand(['/system/resource/print']);
    await writer.write(resourceCmd);

    const resourceResponse = await Promise.race([
      readSentence(reader, buffer),
      new Promise<string[]>((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
    ]);

    let apiVersion = 'RouterOS';
    for (const word of resourceResponse) {
      if (word.startsWith('=version=')) {
        apiVersion = `RouterOS ${word.replace('=version=', '')}`;
      }
    }

    // Get PPP sessions
    let activeSessions = 0;
    try {
      const pppCmd = encodeCommand(['/ppp/active/print', '=count-only=']);
      await writer.write(pppCmd);

      const pppResponse = await Promise.race([
        readSentence(reader, buffer),
        new Promise<string[]>((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
      ]);

      for (const word of pppResponse) {
        if (word.startsWith('=ret=')) {
          activeSessions = parseInt(word.replace('=ret=', ''), 10) || 0;
        }
      }
    } catch {
      // Not critical
    }

    reader.releaseLock();
    writer.releaseLock();
    conn.close();

    return { success: true, apiVersion, activeSessions };

  } catch (error) {
    console.error(`Health check error for ${config.router_host}:`, error);
    conn.close();
    return { success: false };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting router health check job...');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all network configurations that have been connected at least once
    const { data: configs, error } = await supabase
      .from('network_configurations')
      .select('id, router_host, api_port, username, password, is_connected')
      .not('router_host', 'is', null)
      .not('username', 'is', null)
      .not('password', 'is', null);

    if (error) {
      console.error('Failed to fetch configurations:', error);
      throw error;
    }

    console.log(`Found ${configs?.length || 0} configurations to check`);

    const results: { id: string; success: boolean }[] = [];

    for (const config of configs || []) {
      const healthResult = await checkRouterHealth({
        id: config.id,
        router_host: config.router_host!,
        api_port: config.api_port || 8728,
        username: config.username!,
        password: config.password!,
      });

      // Update the configuration status
      const updateData: Record<string, unknown> = {
        is_connected: healthResult.success,
        last_sync_at: new Date().toISOString(),
      };

      if (healthResult.success) {
        updateData.api_version = healthResult.apiVersion;
        updateData.active_sessions = healthResult.activeSessions;
      }

      const { error: updateError } = await supabase
        .from('network_configurations')
        .update(updateData)
        .eq('id', config.id);

      if (updateError) {
        console.error(`Failed to update config ${config.id}:`, updateError);
      }

      results.push({ id: config.id, success: healthResult.success });
      console.log(`Router ${config.router_host}: ${healthResult.success ? 'online' : 'offline'}`);
    }

    console.log('Health check job completed');

    return new Response(
      JSON.stringify({ success: true, checked: results.length, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in check-router-health:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
