#!/bin/bash
# Fast build script optimized for Render.io free tier

set -e

echo "🚀 Starting optimized build..."

# Set production mode
export NODE_ENV=production
export NODE_OPTIONS="--max-old-space-size=2048"

# Frontend build
echo "📦 Frontend: Installing dependencies..."
cd frontend
npm ci --no-optional --prefer-offline --omit=dev

echo "🔨 Frontend: Building..."
npm run build

echo "✅ Frontend build complete!"

# Echo build stats
echo ""
echo "📊 Build Summary:"
du -sh build/ || true

cd ..
echo ""
echo "🎉 Deployment ready!"
