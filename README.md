# HitboxRender Server for Render.com

This is the backend server for the HitboxRender mod that tracks connected clients and their mod state.

## Deployment to Render.com

### Option 1: Deploy as Static + Runtime Service

1. **Frontend (Static)**
   - Build the React frontend: `npm run build`
   - Deploy to Render Static Site
   
2. **Backend (Runtime)**
   - Use a separate Render Web Service for Express.js backend
   - Or deploy both together using Render's multi-service support

### Option 2: Single Container Deployment

Use Docker or create a deployment script that bundles everything.

## API Endpoints

- `GET /api/hitboxrender/state` - Get current state and connected clients
- `POST /api/hitboxrender/toggle` - Toggle a client's mod state
- `POST /api/hitboxrender/register-hitsbox` - Register a hitsbox event from client
- `GET /api/hitboxrender/data` - Get hitsbox data

## Environment Variables

Set these in your Render dashboard:

```
PORT=3000
NODE_ENV=production
```

## Building for Production

```bash
npm install
npm run build
# or just start directly from source files
npm start
```

## Render.com Setup

1. **Create a new Web Service** in your Render account
2. **Set environment variables:**
   - `NODE_ENV=production`
   - `PORT=3000`
3. **Deploy:** Push to your Git repo and Render will auto-deploy
4. **Get the URL:** This is your `SERVER_CONFIG_URL` for clients

## Client Integration

Update `HitboxRenderClient.SERVER_CONFIG_URL` in your mod with your server URL:

```java
public static String SERVER_CONFIG_URL = "https://your-render-url.com/api/hitboxrender/state";
```

The client will:
1. Fetch state on startup
2. Poll for updates every 2 seconds
3. Report hitsbox events to the server via WebSocket