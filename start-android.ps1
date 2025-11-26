# 🚀 Auto Start Android Emulator + Expo
Write-Host "🚀 Starting Android Emulator..." -ForegroundColor Cyan
Write-Host ""

# Path to Android SDK
$emulatorPath = "C:\Users\Deva\AppData\Local\Android\Sdk\emulator\emulator.exe"
$adbPath = "C:\Users\Deva\AppData\Local\Android\Sdk\platform-tools\adb.exe"
$avdName = "Medium_Phone_API_36.0"

# Check if emulator is already running
$emulatorRunning = & $adbPath devices | Select-String "emulator"

if (-not $emulatorRunning) {
    Write-Host "📱 Launching emulator: $avdName" -ForegroundColor Yellow
    Start-Process -FilePath $emulatorPath -ArgumentList "-avd $avdName" -WindowStyle Normal
    
    Write-Host "⏳ Waiting for emulator to boot..." -ForegroundColor Yellow
    
    # Wait for device to be online
    $maxWait = 60
    $waited = 0
    do {
        Start-Sleep -Seconds 2
        $waited += 2
        $devices = & $adbPath devices | Select-String "device" | Measure-Object
        Write-Host "." -NoNewline -ForegroundColor Gray
        
        if ($waited -ge $maxWait) {
            Write-Host "`n⚠️  Emulator taking longer than expected. Continuing anyway..." -ForegroundColor Yellow
            break
        }
    } while ($devices.Count -lt 2)
    
    Write-Host "`n✅ Emulator is ready!" -ForegroundColor Green
} else {
    Write-Host "✅ Emulator already running!" -ForegroundColor Green
}

Write-Host ""
Write-Host "📱 Starting Expo on Android..." -ForegroundColor Cyan
Write-Host ""

# Run expo
npm run android
