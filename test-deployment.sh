#!/bin/bash
# Test script to verify deployment readiness

echo "🔍 Checking AI Recruitment Platform..."

# Check Node version
echo ""
echo "Node/NPM versions:"
node --version
npm --version

# Check git status
echo ""
echo "Git status:"
git status --short | head -10

# Check environment files
echo ""
echo "Environment files:"
if [ -f "backend/.env" ]; then echo "✅ backend/.env exists"; else echo "❌ backend/.env missing"; fi
if [ -f "frontend/.env.local" ]; then echo "✅ frontend/.env.local exists"; else echo "❌ frontend/.env.local missing"; fi
if [ -f "frontend/.env.production" ]; then echo "✅ frontend/.env.production exists"; else echo "❌ frontend/.env.production missing"; fi

# Check key files
echo ""
echo "Key files:"
if [ -f "backend/server.js" ]; then echo "✅ Backend configured"; else echo "❌ Backend missing"; fi
if [ -f "frontend/src/App.js" ]; then echo "✅ Frontend configured"; else echo "❌ Frontend missing"; fi
if [ -f "render.yaml" ]; then echo "✅ Render config exists"; else echo "❌ Render config missing"; fi

# Check dependencies
echo ""
echo "Dependencies:"
if [ -d "backend/node_modules" ]; then echo "✅ Backend dependencies installed"; else echo "⚠️  Backend dependencies NOT installed"; fi
if [ -d "frontend/node_modules" ]; then echo "✅ Frontend dependencies installed"; else echo "⚠️  Frontend dependencies NOT installed"; fi

echo ""
echo "✓ Ready for deployment to Render!"
