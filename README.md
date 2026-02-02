# OpenClaw Family Chat 🌟

A family-friendly WebChat interface for OpenClaw with integrated music search!

**Port**: 3010 (see [PORTS.md](https://github.com/vkolyvas/openclaw-family-chat/blob/main/PORTS.md) for all used ports)

## Features

- 📱 **Mobile-friendly** - Works great on phones and tablets
- 🎵 **Music Search** - Search and play YouTube music
- 👨‍👩‍👧‍👦 **Multi-user** - Family members can all chat
- 🤖 **AI Powered** - Powered by OpenClaw with your configured agents
- 🎨 **Customizable** - Easy to theme and extend

## Quick Start

### 1. Install Dependencies

```bash
cd openclaw-family-chat
npm install
```

### 2. Configure Environment

Create a `.env` file:

```env
# OpenClaw Gateway (optional - chat works without it)
GATEWAY_WS_URL=ws://127.0.0.1:18789
GATEWAY_TOKEN=your-token-here

# YouTube API (optional - needed for music search)
YOUTUBE_API_KEY=your-youtube-api-key

# Server port
PORT=3010
```

### 3. Get YouTube API Key (for music search)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable "YouTube Data API v3"
4. Create credentials (API key)
5. Add to `.env` file

### 4. Start the Server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

### 5. Open in Browser

```
http://localhost:3010
```

## Usage

### For Your Wife & Family

1. Open the URL on their phone/tablet
2. Enter their name
3. Start chatting naturally!

**Example conversations:**
- "Play some jazz music"
- "What's the weather?"
- "Tell me a joke"
- "Set a reminder for tomorrow"

### Music Search

1. Click 🎵 in the header
2. Search for songs/artists
3. Click a result to open in YouTube

## Architecture

```
User's Browser
     │
     ▼ (WebSocket)
┌─────────────────┐
│  Family Chat    │◄── Express + WebSocket Server
│  Server :3010   │
└────────┬────────┘
         │
         │ WebSocket (optional)
         ▼
┌─────────────────┐
│ OpenClaw        │
│ Gateway :18789  │
└─────────────────┘
         │
         │ REST API
         ▼
┌─────────────────┐
│ YouTube Data    │
│ API             │
└─────────────────┘
```

## Customization

### Change Colors

Edit `public/style.css` and modify CSS variables:

```css
:root {
  --primary-color: #6c5ce7;  /* Main color */
  --secondary-color: #00b894; /* Accent color */
  --user-bg: #6c5ce7;        /* User message bg */
}
```

### Add Quick Actions

Edit `public/index.html` and add more quick reply buttons:

```html
<button class="quick-reply" data-message="Your command">Button Text</button>
```

## Available Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Chat interface |
| `/api/health` | GET | Server health check |
| `/api/music/search?q=` | GET | Search YouTube |

## Troubleshooting

### "Connection failed"
- Make sure the server is running: `npm start`
- Check the WebSocket URL in browser dev tools

### Music search not working
- Add `YOUTUBE_API_KEY` to `.env` file
- Restart the server

### Can't connect to Gateway
- The chat works without Gateway connection
- To enable routing, start OpenClaw Gateway and configure `GATEWAY_WS_URL`

## Tech Stack

- **Backend**: Express.js, WebSocket (ws)
- **Frontend**: Vanilla JS, CSS3 (no frameworks)
- **Integration**: OpenClaw Gateway, YouTube Data API

## License

MIT - Have fun! 🎉
