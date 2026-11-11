# HitboxRender Backend Server

Express.js + WebSocket backend server for Render.com deployment.

## Quick Deploy to Render.com

### Option 1: Push to GitHub (Recommended)

```bash
cd server
git init
git add .
git commit -m "Initial commit"
# Add your remote and push
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

Then in Render.com:
1. Create new Web Service
2. Connect your GitHub repo
3. Set environment variables:
   ```
   NODE_ENV=production
   PORT=3000
   ```
4. Deploy automatically!

### Option 2: Direct Upload

Go to [Render.com](https://render.com) → New + → Web Service → Import existing source, then upload the entire `server/` folder.

## API Endpoints

- `GET /api/hitboxrender/state` - Get current state
- `POST /api/hitboxrender/toggle` - Toggle client state
- `POST /api/hitboxrender/register-hitsbox` - Register hitsbox event

## Environment Variables (Render.com)

| Variable | Value | Required |
|----------|-------|----------|
| `NODE_ENV` | `production` | Yes |
| `PORT` | `3000` | Yes |

## Development

```bash
npm install
npm start
# or for dev with hot reload:
npm run dev
```

## Build Commands

```bash
# Install dependencies
npm install

# Start server
npm start

# For local testing with nodemon (uncomment in package.json)
# npm run dev
```