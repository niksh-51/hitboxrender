#!/bin/bash
# Deployment script for HitboxRender server to Render.com

echo "======================================"
echo "HitboxRender Server - Render Deploy"
echo "======================================"

# Navigate to server directory
cd "$(dirname "$0")"

# Install dependencies
echo "Installing dependencies..."
npm install

# Create production build if needed
if [ ! -d "dist" ]; then
    echo "Building production version..."
    npm run build 2>/dev/null || echo "No build script, using source directly"
fi

# Start the server in background (for local testing)
echo "Starting server for local testing..."
npm start &

echo ""
echo "======================================"
echo "Server is running. Get your URL:"
echo "   1. Open Render.com dashboard"
echo "   2. Create a new Web Service"
echo "   3. Connect your Git repository"
echo "   4. Set environment variables: PORT=3000, NODE_ENV=production"
echo "   5. Deploy - you'll get a HTTPS URL like:"
echo ""
echo "      https://your-app-name.onrender.com"
echo ""
echo "======================================"
echo ""
echo "After deployment, update HitboxRenderClient.SERVER_CONFIG_URL"
echo "or set server.url in gradle.properties to your new URL."