# Deploying HitboxRender to Render.com

## Quick Start Guide

### 1. Deploy the Backend Server

```bash
cd server
npm install
npm start
```

Visit http://localhost:3000 to verify it's running, or use `ngrok` to get a public URL for testing:

```bash
ngrok http 3000
# Use the ngrok URL as your temporary Render.com endpoint
```

### 2. Set Up Render.com Web Service

1. Go to [https://render.com](https://render.com) and sign in
2. Click **"New +"** → **"Web Service"**
3. **Connect Git Repository**:
   - Use GitHub/GitLab/Bitbucket, OR
   - Upload your code directly using the "Import existing source" option
4. **Set Environment Variables**:
   ```
   NODE_ENV=production
   PORT=3000
   ```
5. Click **"Create Web Service"**
6. After deployment, you'll get a URL like: `https://your-app-name.onrender.com`

### 3. Configure the Minecraft Client

In your mod's `HitboxRenderClient.java`, update:

```java
public static String SERVER_CONFIG_URL = "https://your-render-url.onrender.com/api/hitboxrender/state";
```

Or set in `gradle.properties`:

```properties
server.url=https://your-render-url.onrender.com/api/hitboxrender/state
```

Rebuild and run:

```bash
gradlew clean build
```

### 4. Test the Deployment

Open your Minecraft instance with the mod loaded, then visit your Render URL to see the dashboard.

---

## Production Deployment (Best Practice)

### Option A: Separate Services (Recommended)

**Service 1: Backend Web Service**
- Runtime environment
- Exposes REST API
- WebSocket connections

**Service 2: Frontend Static Site**
- Build frontend: `cd frontend && npm run build`
- Deploy `frontend/dist/` to Render Static Site
- Points to same backend API

**Why separate?** Better scaling, easier deployment, lower cost.

### Option B: Single Container (Simpler)

Use a Dockerfile that combines Express.js backend with Nginx frontend:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY server/package*.json ./server/
COPY frontend/package*.json ./frontend/
RUN npm install && cd frontend && npm run build
COPY server/index.js ./
CMD ["npm", "start"]
```

Then deploy as a single Web Service.

---

## Render.com Pricing

- **Free Tier**: Hobby projects (limited bandwidth)
- **Starter ($7/mo)**: 750 hours/month, good for personal use
- **Standard ($24/mo)**: Recommended for production apps
- **Pro ($69+/mo)**: High traffic needs

---

## Troubleshooting

### Port Not Opening

```bash
# In Render Dashboard → Variables
PORT=3000
NODE_ENV=production
```

### CORS Errors (if frontend and backend separate)

Add CORS middleware to `server/index.js`:

```javascript
const cors = require('cors');
app.use(cors());
```

### Database Persistence

For tracking state across deployments, consider:

1. **Render Managed PostgreSQL** (free tier available)
2. **Redis** for session storage
3. **File-based storage** in `/app/data/` (simplest for MVP)

Update `server/index.js` to persist `clients` and `hitboxData` to files or database.

---

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment mode | `production` |
| `SECRET_KEY` | Optional API key validation | `hitboxrender-secret-key` |

---

## Monitoring on Render.com

1. Check **Logs** tab in Render dashboard
2. Set up alerts for:
   - High memory usage
   - Slow response times
   - Connection errors

---

## Cost Estimation

For a typical HitboxRender dashboard:

- **Starter Plan**: ~$7/month
- **Bandwidth**: Minimal (text + simple UI)
- **CPU**: Low (WebSocket connections, no heavy computation)

Total estimated: **$7-15/month** on free/starter tier for personal use.

---

## Support

For deployment issues, check:
1. Render.com documentation
2. This README and project README.md
3. Open an issue in the repository