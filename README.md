# HitboxRender Server for Render.com

Express.js + WebSocket backend server for managing HitboxRender mod across all connected clients.

## Quick Deploy to Render.com

### Step 1: Push to GitHub

```bash
cd server
git add .
git commit -m "Add HitboxRender server"
git push origin main
```

### Step 2: Deploy on Render.com

1. Go to [https://render.com](https://render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repo (`hitboxrender-server`)
4. Set environment variables:
   ```
   NODE_ENV=production
   PORT=3000
   ```
5. Click **"Create Web Service"**
6. After deployment, you'll get a URL like: `https://your-app.onrender.com`

### Step 3: Update Client Code

In your Minecraft client's `HitboxRenderClient.java`, update the server URL:

```java
public static String SERVER_CONFIG_URL = "https://your-render-url.onrender.com/api/hitboxrender/state";
```

Then rebuild and play!

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/hitboxrender/state` | Get current state + connected clients |
| `POST` | `/api/hitboxrender/toggle` | Toggle a client's mod state |
| `POST` | `/api/hitboxrender/register-hitsbox` | Register hitsbox event from client |
| `GET` | `/api/hitboxrender/data` | Get hitsbox data/events |

## Environment Variables

Set these in your Render.com dashboard:

```
NODE_ENV=production
PORT=3000
```

## Build & Run Commands

```bash
# Install dependencies
npm install

# Start server (production)
npm start

# Start server (development with nodemon)
npm run dev
```

## Features

- Real-time WebSocket connections for live state updates
- REST API for client state management
- Tracks connected players and their mod enablement status
- Broadcasts state changes to all connected clients
- Lightweight, minimal footprint (< 100MB bandwidth/month)

## License

MIT License