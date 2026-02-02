/**
 * OpenClaw Family Chat Server
 * 
 * WebSocket bridge to OpenClaw Gateway with WebChat interface
 * and integrated music search via YouTube Data API
 */

import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

// Configuration
const PORT = process.env.PORT || 3010;
const GATEWAY_URL = process.env.GATEWAY_WS_URL || 'ws://127.0.0.1:18789';
const GATEWAY_TOKEN = process.env.GATEWAY_TOKEN || '';

// YouTube API
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || '';

// Serve static files
app.use(express.static(join(__dirname, 'public')));
app.use(express.json());

// Gateway connection state
let gatewaySocket = null;
let gatewayConnected = false;

// Connect to OpenClaw Gateway
async function connectGateway() {
  return new Promise((resolve, reject) => {
    console.log(`[Gateway] Connecting to ${GATEWAY_URL}...`);
    
    const ws = new WebSocket(GATEWAY_URL);
    
    ws.on('open', () => {
      console.log('[Gateway] Connected');
      
      const connectFrame = {
        type: 'req',
        id: 'connect-' + Date.now(),
        method: 'connect',
        params: {
          minProtocol: 1,
          maxProtocol: 2,
          client: {
            id: 'family-chat',
            displayName: 'Family Chat',
            version: '1.0.0',
            platform: 'web',
            mode: 'observer',
            instanceId: 'family-chat-' + Date.now()
          },
          caps: ['presence', 'health', 'sessions'],
          locale: 'en'
        }
      };
      
      if (GATEWAY_TOKEN) {
        connectFrame.params.auth = { token: GATEWAY_TOKEN };
      }
      
      ws.send(JSON.stringify(connectFrame));
    });
    
    ws.on('message', (data) => {
      try {
        const msg = JSON.parse(data.toString());
        handleGatewayMessage(msg);
      } catch (e) {
        console.error('[Gateway] Parse error:', e.message);
      }
    });
    
    ws.on('close', () => {
      console.log('[Gateway] Disconnected');
      gatewayConnected = false;
      setTimeout(connectGateway, 5000);
    });
    
    ws.on('error', (err) => {
      console.error('[Gateway] Error:', err.message);
      reject(err);
    });
    
    resolve(ws);
  });
}

// Handle Gateway messages
function handleGatewayMessage(msg) {
  if (msg.type === 'res' && msg.ok) {
    if (msg.payload?.type === 'hello-ok') {
      gatewayConnected = true;
      gatewaySocket = ws;
      console.log('[Gateway] Ready');
    }
    return;
  }
  
  // Handle events and broadcast to clients
  if (msg.type === 'event' || (msg.type === 'res' && msg.method)) {
    broadcastToClients({
      type: 'gateway',
      data: msg
    });
  }
}

// Broadcast to all WebChat clients
const clients = new Set();

function broadcastToClients(data) {
  const msg = JSON.stringify(data);
  clients.forEach(client => {
    if (client.readyState === 1) {
      client.send(msg);
    }
  });
}

// WebSocket connection handling
wss.on('connection', (ws) => {
  console.log('[Chat] New client connected');
  clients.add(ws);
  
  // Send initial state
  ws.send(JSON.stringify({
    type: 'init',
    data: {
      connected: gatewayConnected,
      server: 'Family Chat v1.0'
    }
  }));
  
  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data.toString());
      handleClientMessage(msg, ws);
    } catch (e) {
      console.error('[Chat] Parse error:', e.message);
    }
  });
  
  ws.on('close', () => {
    clients.delete(ws);
    console.log('[Chat] Client disconnected');
  });
});

// Handle messages from chat clients
function handleClientMessage(msg, ws) {
  switch (msg.type) {
    case 'chat':
      // Forward to Gateway
      if (gatewayConnected && gatewaySocket) {
        const req = {
          type: 'req',
          id: 'chat-' + Date.now(),
          method: 'message',
          params: {
            channel: 'webchat',
            message: msg.text
          }
        };
        gatewaySocket.send(JSON.stringify(req));
      }
      break;
      
    case 'music-search':
      // Search YouTube
      searchYouTube(msg.query).then(results => {
        ws.send(JSON.stringify({
          type: 'music-results',
          data: results
        }));
      });
      break;
  }
}

// YouTube search
async function searchYouTube(query) {
  if (!YOUTUBE_API_KEY) {
    // Return demo results if no API key
    return [
      { title: `${query} - YouTube Search`, videoId: 'dQw4w9WgXcQ', thumbnail: '' }
    ];
  }
  
  try {
    const url = `https://www.googleapis.com/youtube/v3/search`;
    const params = {
      part: 'snippet',
      q: query,
      type: 'video',
      maxResults: 10,
      key: YOUTUBE_API_KEY
    };
    
    const response = await fetch(`${url}?${new URLSearchParams(params)}`);
    const data = await response.json();
    
    if (data.items) {
      return data.items.map(item => ({
        title: item.snippet.title,
        videoId: item.id.videoId,
        thumbnail: item.snippet.thumbnails?.default?.url || '',
        channel: item.snippet.channelTitle
      }));
    }
    
    return [];
  } catch (error) {
    console.error('YouTube search error:', error);
    return [];
  }
}

// REST API endpoints
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    gatewayConnected,
    uptime: process.uptime()
  });
});

app.get('/api/music/search', async (req, res) => {
  const { q } = req.query;
  if (!q) {
    return res.status(400).json({ error: 'Query required' });
  }
  
  const results = await searchYouTube(q);
  res.json({ results });
});

// Start server
server.listen(PORT, async () => {
  console.log(`🎉 Family Chat Server running on http://localhost:${PORT}`);
  console.log(`📱 Mobile-friendly WebChat interface`);
  console.log(`🎵 Music search enabled (configure YOUTUBE_API_KEY)`);
  
  try {
    await connectGateway();
  } catch (err) {
    console.error('[Chat] Gateway connection failed:', err.message);
    console.log('[Chat] Chat will work but routing to Gateway is disabled');
  }
});
