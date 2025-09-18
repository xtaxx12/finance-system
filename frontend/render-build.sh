#!/usr/bin/env bash
# exit on error
set -o errexit

echo "🚀 Building React frontend for Render..."

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Build the app
echo "🔨 Building React app..."
npm run build

echo "✅ Frontend build completed!"