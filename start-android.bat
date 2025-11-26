@echo off
echo ========================================
echo 🚀 AgriPlay - Android Auto Launcher
echo ========================================
echo.

REM Check if emulator is running
"C:\Users\Deva\AppData\Local\Android\Sdk\platform-tools\adb.exe" devices | findstr "emulator" >nul

if %errorlevel% equ 0 (
    echo ✅ Emulator already running!
    goto run_expo
) else (
    echo 📱 Starting emulator: Medium_Phone_API_36.0
    echo.
    start "" "C:\Users\Deva\AppData\Local\Android\Sdk\emulator\emulator.exe" -avd Medium_Phone_API_36.0
    
    echo ⏳ Waiting for emulator to boot (40 seconds)...
    timeout /t 40 /nobreak >nul
    
    echo.
    echo ✅ Emulator should be ready now!
)

:run_expo
echo.
echo 📱 Starting Expo on Android...
echo ========================================
echo.

call npm run android

pause
