import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ConnectionRequest {
  host: string;
  port: number;
  username: string;
  password: string;
}

interface ConnectionResponse {
  success: boolean;
  message: string;
  apiVersion?: string;
  activeSessions?: number;
  error?: string;
}

// Mikrotik API uses a specific word encoding
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
  const emptyWord = new Uint8Array([0]); // End of sentence
  
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
  // Read length byte(s)
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
  
  if (firstByte === 0) return ''; // Empty word (end of sentence)
  
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
  
  // Read additional length bytes
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
  
  // Read word content
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
    if (word === '') break; // End of sentence
    words.push(word);
  }
  
  return words;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { host, port, username, password }: ConnectionRequest = await req.json();

    console.log(`Attempting to connect to Mikrotik at ${host}:${port}`);

    // Validate inputs
    if (!host || !port || !username || !password) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Missing required connection parameters',
          error: 'host, port, username, and password are required'
        } as ConnectionResponse),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Attempt TCP connection to Mikrotik API
    let conn: Deno.TcpConn;
    try {
      conn = await Deno.connect({
        hostname: host,
        port: port,
        transport: "tcp",
      });
      console.log('TCP connection established');
    } catch (connError) {
      console.error('TCP connection failed:', connError);
      return new Response(
        JSON.stringify({
          success: false,
          message: `Failed to connect to router at ${host}:${port}`,
          error: connError instanceof Error ? connError.message : 'Connection refused or host unreachable'
        } as ConnectionResponse),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    try {
      // Set a read timeout using AbortController
      const reader = conn.readable.getReader();
      const writer = conn.writable.getWriter();
      const buffer: Uint8Array[] = [];

      // Send login command (plain text login for RouterOS 6.43+)
      const loginCmd = encodeCommand(['/login', `=name=${username}`, `=password=${password}`]);
      console.log('Sending login command...');
      await writer.write(loginCmd);

      // Read login response with timeout
      const timeoutPromise = new Promise<string[]>((_, reject) => {
        setTimeout(() => reject(new Error('Connection timeout')), 10000);
      });

      const response = await Promise.race([
        readSentence(reader, buffer),
        timeoutPromise
      ]);

      console.log('Login response:', response);

      // Check if login was successful
      const isSuccess = response.some(word => word === '!done');
      const hasError = response.some(word => word.startsWith('!trap') || word.startsWith('=message='));
      
      if (!isSuccess || hasError) {
        const errorMessage = response.find(word => word.startsWith('=message='))?.replace('=message=', '') || 'Authentication failed';
        
        reader.releaseLock();
        writer.releaseLock();
        conn.close();
        
        return new Response(
          JSON.stringify({
            success: false,
            message: 'Authentication failed',
            error: errorMessage
          } as ConnectionResponse),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get system resource info (includes RouterOS version)
      const resourceCmd = encodeCommand(['/system/resource/print']);
      console.log('Fetching system resources...');
      await writer.write(resourceCmd);

      const resourceResponse = await Promise.race([
        readSentence(reader, buffer),
        new Promise<string[]>((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
      ]);

      console.log('Resource response:', resourceResponse);

      let apiVersion = 'RouterOS';
      let activeSessions = 0;

      // Parse version from response
      for (const word of resourceResponse) {
        if (word.startsWith('=version=')) {
          apiVersion = `RouterOS ${word.replace('=version=', '')}`;
        }
      }

      // Get active PPP sessions count
      try {
        const pppCmd = encodeCommand(['/ppp/active/print', '=count-only=']);
        await writer.write(pppCmd);

        const pppResponse = await Promise.race([
          readSentence(reader, buffer),
          new Promise<string[]>((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
        ]);

        console.log('PPP response:', pppResponse);

        for (const word of pppResponse) {
          if (word.startsWith('=ret=')) {
            activeSessions = parseInt(word.replace('=ret=', ''), 10) || 0;
          }
        }
      } catch (pppError) {
        console.log('Could not fetch PPP sessions (may not be configured):', pppError);
        // Not critical, continue
      }

      // Clean up
      reader.releaseLock();
      writer.releaseLock();
      conn.close();

      console.log('Connection test successful');

      return new Response(
        JSON.stringify({
          success: true,
          message: `Successfully connected to ${host}`,
          apiVersion,
          activeSessions
        } as ConnectionResponse),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (apiError) {
      console.error('API communication error:', apiError);
      conn.close();
      
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Failed to communicate with router API',
          error: apiError instanceof Error ? apiError.message : 'API protocol error'
        } as ConnectionResponse),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('Error in test-mikrotik-connection:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      } as ConnectionResponse),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
