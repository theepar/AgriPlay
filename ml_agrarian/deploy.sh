#!/bin/bash

# 🚀 Agrarian ML API - Quick Deployment Script
# Script ini membantu deploy ke Hugging Face Spaces

echo "🌾 Agrarian ML API - Deployment Helper"
echo "======================================="
echo ""

# Check if HF_USERNAME is set
if [ -z "$HF_USERNAME" ]; then
    echo "❌ Error: HF_USERNAME tidak ditemukan!"
    echo "Jalankan: export HF_USERNAME=your_huggingface_username"
    echo ""
    echo "Contoh:"
    echo "  export HF_USERNAME=johndoe"
    echo "  ./deploy.sh"
    exit 1
fi

SPACE_NAME="agrarian-ml-api"
SPACE_URL="https://huggingface.co/spaces/$HF_USERNAME/$SPACE_NAME"

echo "📦 Target Deployment:"
echo "  Space: $SPACE_NAME"
echo "  URL: $SPACE_URL"
echo ""

# Check if space directory exists
if [ -d "$SPACE_NAME" ]; then
    echo "📁 Space directory sudah ada. Updating..."
    cd $SPACE_NAME
    git pull
    cd ..
else
    echo "📥 Cloning Hugging Face Space..."
    git clone https://huggingface.co/spaces/$HF_USERNAME/$SPACE_NAME
    
    if [ $? -ne 0 ]; then
        echo "❌ Error: Gagal clone space. Pastikan:"
        echo "  1. Space sudah dibuat di Hugging Face"
        echo "  2. HF_USERNAME sudah benar"
        echo "  3. Sudah login dengan: huggingface-cli login"
        exit 1
    fi
fi

echo ""
echo "📋 Copying files..."

# Copy necessary files
cp -r app $SPACE_NAME/
cp -r saved_models $SPACE_NAME/
cp requirements.txt $SPACE_NAME/
cp Dockerfile $SPACE_NAME/
cp .dockerignore $SPACE_NAME/

# Create README for Hugging Face Space
cat > $SPACE_NAME/README.md << 'EOF'
---
title: Agrarian ML API
emoji: 🌾
colorFrom: green
colorTo: blue
sdk: docker
pinned: false
---

# 🌾 Agrarian ML API

Machine Learning API untuk rekomendasi tanaman dan prediksi hasil panen.

## API Endpoints

### 🌱 Crop Recommendation
```
POST /crop_recommendation_fastapi
```

### 📊 Yield Prediction
```
POST /yield_prediction_fastapi
```

Dokumentasi lengkap ada di repository utama.
EOF

echo "✅ Files copied"
echo ""

# Git operations
cd $SPACE_NAME

echo "📤 Committing and pushing..."
git add .
git commit -m "Deploy Agrarian ML API - $(date +'%Y-%m-%d %H:%M:%S')"
git push

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deployment berhasil!"
    echo ""
    echo "🎉 API akan tersedia di:"
    echo "  $SPACE_URL"
    echo ""
    echo "📡 Base URL untuk React Native:"
    echo "  https://$HF_USERNAME-$SPACE_NAME.hf.space"
    echo ""
    echo "⏳ Build process akan dimulai otomatis."
    echo "   Cek status di: $SPACE_URL"
else
    echo ""
    echo "❌ Push gagal. Cek error di atas."
    exit 1
fi
