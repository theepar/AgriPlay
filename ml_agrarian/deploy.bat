@echo off
REM 🚀 Agrarian ML API - Quick Deployment Script (Windows)
REM Script ini membantu deploy ke Hugging Face Spaces

echo 🌾 Agrarian ML API - Deployment Helper
echo =======================================
echo.

REM Check if HF_USERNAME is set
if "%HF_USERNAME%"=="" (
    echo ❌ Error: HF_USERNAME tidak ditemukan!
    echo Jalankan: set HF_USERNAME=your_huggingface_username
    echo.
    echo Contoh:
    echo   set HF_USERNAME=johndoe
    echo   deploy.bat
    exit /b 1
)

set SPACE_NAME=agrarian-ml-api
set SPACE_URL=https://huggingface.co/spaces/%HF_USERNAME%/%SPACE_NAME%

echo 📦 Target Deployment:
echo   Space: %SPACE_NAME%
echo   URL: %SPACE_URL%
echo.

REM Check if space directory exists
if exist %SPACE_NAME% (
    echo 📁 Space directory sudah ada. Updating...
    cd %SPACE_NAME%
    git pull
    cd ..
) else (
    echo 📥 Cloning Hugging Face Space...
    git clone https://huggingface.co/spaces/%HF_USERNAME%/%SPACE_NAME%
    
    if errorlevel 1 (
        echo ❌ Error: Gagal clone space. Pastikan:
        echo   1. Space sudah dibuat di Hugging Face
        echo   2. HF_USERNAME sudah benar
        echo   3. Sudah login dengan: huggingface-cli login
        exit /b 1
    )
)

echo.
echo 📋 Copying files...

REM Copy necessary files
xcopy /E /I /Y app %SPACE_NAME%\app
xcopy /E /I /Y saved_models %SPACE_NAME%\saved_models
copy /Y requirements.txt %SPACE_NAME%\
copy /Y Dockerfile %SPACE_NAME%\
copy /Y .dockerignore %SPACE_NAME%\

REM Create README for Hugging Face Space
(
echo ---
echo title: Agrarian ML API
echo emoji: 🌾
echo colorFrom: green
echo colorTo: blue
echo sdk: docker
echo pinned: false
echo ---
echo.
echo # 🌾 Agrarian ML API
echo.
echo Machine Learning API untuk rekomendasi tanaman dan prediksi hasil panen.
echo.
echo ## API Endpoints
echo.
echo ### 🌱 Crop Recommendation
echo ```
echo POST /crop_recommendation_fastapi
echo ```
echo.
echo ### 📊 Yield Prediction
echo ```
echo POST /yield_prediction_fastapi
echo ```
echo.
echo Dokumentasi lengkap ada di repository utama.
) > %SPACE_NAME%\README.md

echo ✅ Files copied
echo.

REM Git operations
cd %SPACE_NAME%

echo 📤 Committing and pushing...
git add .
git commit -m "Deploy Agrarian ML API - %date% %time%"
git push

if errorlevel 1 (
    echo.
    echo ❌ Push gagal. Cek error di atas.
    cd ..
    exit /b 1
)

echo.
echo ✅ Deployment berhasil!
echo.
echo 🎉 API akan tersedia di:
echo   %SPACE_URL%
echo.
echo 📡 Base URL untuk React Native:
echo   https://%HF_USERNAME%-%SPACE_NAME%.hf.space
echo.
echo ⏳ Build process akan dimulai otomatis.
echo    Cek status di: %SPACE_URL%

cd ..
