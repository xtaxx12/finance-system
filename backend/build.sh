#!/usr/bin/env bash
# exit on error
set -o errexit

echo "🚀 Starting build process..."

# Check Python version
echo "🐍 Python version:"
python --version

# Upgrade pip
echo "⬆️ Upgrading pip..."
pip install --upgrade pip

# Install dependencies
echo "📦 Installing dependencies..."
pip install -r requirements.txt

# Collect static files
echo "📁 Collecting static files..."
python manage.py collectstatic --no-input

# Run migrations
echo "🗄️ Running migrations..."
python manage.py migrate

# Create default categories
echo "📂 Creating default categories..."
python manage.py create_categories || {
    echo "⚠️ Management command failed, trying alternative method..."
    python create_categories_simple.py || echo "⚠️ Alternative method also failed, continuing..."
}

echo "✅ Build completed successfully!"