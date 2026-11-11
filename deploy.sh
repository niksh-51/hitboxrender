#!/bin/bash
# Quick deploy script for Render.com

cd "$(dirname "$0")"

echo "=========================================="
echo "HitboxRender - Server Deployment Ready"
echo "=========================================="

echo ""
echo "1. Git repository initialized in server/"
echo ""
echo "2. Environment variables for Render.com:"
echo "   NODE_ENV=production"
echo "   PORT=3000"
echo ""
echo "3. API Endpoints:"
echo "   GET  /api/hitboxrender/state - Get all connected clients"
echo "   POST /api/hitboxrender/toggle - Toggle client state"
echo "   POST /api/hitboxrender/register-hitsbox - Register hitsbox event"
echo ""
echo "=========================================="
echo ""

# Push to GitHub
git add . 2>/dev/null || true
git commit -m "Add Render.com toggle server" 2>/dev/null || true

echo "4. Ready to push to GitHub!"
echo ""
echo "   Run this to push:"
echo "     git push origin main"
echo ""
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Commit and push the server folder to GitHub"
echo "2. Go to Render.com -> New + -> Web Service"
echo "3. Connect your GitHub repo"
echo "4. Set env vars: NODE_ENV=production, PORT=3000"
echo "5. Deploy! Get your URL."