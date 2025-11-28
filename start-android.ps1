# Script untuk otomatis menjalankan Android Emulator
# Author: AgriPlay Team
# Description: Automatically starts Android emulator and runs the app

# KONFIGURASI
# Set ke $true jika ingin SELALU menggunakan emulator, bahkan jika ada device fisik tersambung
$FORCE_EMULATOR = $true

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  AgriPlay - Android Emulator Launcher" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Fungsi untuk mengecek apakah adb ada di PATH
function Test-AdbAvailable {
    try {
        $null = adb version 2>&1
        return $true
    }
    catch {
        return $false
    }
}

# Fungsi untuk mengecek apakah emulator command tersedia
function Test-EmulatorAvailable {
    try {
        $null = emulator -version 2>&1
        return $true
    }
    catch {
        return $false
    }
}

# Fungsi untuk mendapatkan daftar emulator yang tersedia
function Get-AvailableEmulators {
    try {
        $emulatorOutput = emulator -list-avds 2>&1
        if ($LASTEXITCODE -eq 0) {
            return $emulatorOutput | Where-Object { $_ -match '\S' }
        }
        return @()
    }
    catch {
        Write-Host "Error: Tidak dapat mengakses emulator command" -ForegroundColor Red
        return @()
    }
}

# Fungsi untuk mengecek emulator yang sedang berjalan
function Get-RunningEmulators {
    try {
        $devices = adb devices | Select-Object -Skip 1 | Where-Object { $_ -match '\S' }
        $runningEmulators = @()
        foreach ($device in $devices) {
            # Emulator biasanya memiliki nama device yang dimulai dengan "emulator-"
            if ($device -match '^\s*(emulator-\d+)\s+device\s*$') {
                $runningEmulators += $matches[1]
            }
        }
        return $runningEmulators
    }
    catch {
        return @()
    }
}

# Fungsi untuk mengecek device fisik yang tersambung
function Get-PhysicalDevices {    try {
        $devices = adb devices | Select-Object -Skip 1 | Where-Object { $_ -match '\S' }
        $physicalDevices = @()
        foreach ($device in $devices) {
            # Device fisik biasanya tidak dimulai dengan "emulator-"
            if ($device -match '^\s*(.+?)\s+device\s*$' -and $matches[1] -notmatch '^emulator-') {
                $physicalDevices += $matches[1]
            }
        }
        return $physicalDevices
    }
    catch {
        return @()
    }
}

# Fungsi untuk menjalankan emulator
function Start-AndroidEmulator {
    param (
        [string]$EmulatorName
    )
    
    Write-Host "Meluncurkan emulator: $EmulatorName..." -ForegroundColor Yellow
    
    # Jalankan emulator di background
    Start-Process "emulator" -ArgumentList "-avd", $EmulatorName -WindowStyle Minimized
    
    Write-Host "Menunggu emulator untuk boot..." -ForegroundColor Yellow
    
    # Tunggu hingga emulator benar-benar tersedia (maksimal 120 detik)
    $maxWaitTime = 120
    $waitedTime = 0
    $bootComplete = $false
    
    while ($waitedTime -lt $maxWaitTime -and -not $bootComplete) {
        Start-Sleep -Seconds 2
        $waitedTime += 2
        
        # Cek apakah emulator sudah boot
        $bootStatus = adb shell getprop sys.boot_completed 2>&1
        if ($bootStatus -match "1") {
            $bootComplete = $true
            Write-Host "Emulator berhasil diluncurkan!" -ForegroundColor Green
        }
        else {
            Write-Host "." -NoNewline -ForegroundColor Yellow
        }
    }
    
    if (-not $bootComplete) {
        Write-Host "`nPeringatan: Emulator memerlukan waktu lebih lama untuk boot" -ForegroundColor Yellow
        Write-Host "Melanjutkan ke langkah berikutnya..." -ForegroundColor Yellow
    }
    
    Write-Host ""
}

# Main script
Write-Host "Mengecek konfigurasi Android..." -ForegroundColor Cyan
Write-Host ""

# Cek apakah adb tersedia
if (-not (Test-AdbAvailable)) {
    Write-Host "Error: ADB tidak ditemukan!" -ForegroundColor Red
    Write-Host "Pastikan Android SDK sudah terinstal dan ditambahkan ke PATH" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Untuk menambahkan ke PATH, tambahkan:" -ForegroundColor Yellow
    Write-Host "  - %LOCALAPPDATA%\Android\Sdk\platform-tools" -ForegroundColor White
    Write-Host "  - %LOCALAPPDATA%\Android\Sdk\emulator" -ForegroundColor White
    Write-Host ""
    exit 1
}

# Cek emulator yang sedang berjalan dan device fisik
Write-Host "Mengecek device dan emulator..." -ForegroundColor Cyan
$runningEmulators = Get-RunningEmulators
$physicalDevices = Get-PhysicalDevices

if ($physicalDevices.Count -gt 0) {
    Write-Host "Device fisik ditemukan:" -ForegroundColor Yellow
    foreach ($device in $physicalDevices) {
        Write-Host "  - $device" -ForegroundColor White
    }
    if ($FORCE_EMULATOR) {
        Write-Host ""
        Write-Host "FORCE_EMULATOR aktif - akan menggunakan emulator" -ForegroundColor Cyan
    }
    Write-Host ""
}

if ($runningEmulators.Count -gt 0) {
    Write-Host "Emulator sudah berjalan:" -ForegroundColor Green
    foreach ($emulator in $runningEmulators) {
        Write-Host "  - $emulator" -ForegroundColor White
    }
    Write-Host ""
    Write-Host "Akan menggunakan emulator yang sudah berjalan" -ForegroundColor Cyan
    Write-Host ""
}
else {
    Write-Host "Tidak ada emulator yang berjalan" -ForegroundColor Yellow
    Write-Host ""
    
    # Dapatkan daftar emulator yang tersedia
    Write-Host "Mencari emulator yang tersedia..." -ForegroundColor Cyan
    $availableEmulators = Get-AvailableEmulators
    
    if ($availableEmulators.Count -eq 0) {
        Write-Host "Error: Tidak ada emulator yang tersedia!" -ForegroundColor Red
        Write-Host ""
        Write-Host "Untuk membuat emulator, jalankan:" -ForegroundColor Yellow
        Write-Host "  1. Buka Android Studio" -ForegroundColor White
        Write-Host "  2. Tools > Device Manager" -ForegroundColor White
        Write-Host "  3. Create Virtual Device" -ForegroundColor White
        Write-Host ""
        Write-Host "Atau gunakan command line:" -ForegroundColor Yellow
        Write-Host "  avdmanager create avd -n MyEmulator -k `"system-images;android-34;google_apis;x86_64`"" -ForegroundColor White
        Write-Host ""
        exit 1
    }
    
    Write-Host "Emulator yang tersedia:" -ForegroundColor Green
    for ($i = 0; $i -lt $availableEmulators.Count; $i++) {
        Write-Host "  [$($i + 1)] $($availableEmulators[$i])" -ForegroundColor White
    }
    Write-Host ""
    
    # Pilih emulator pertama secara default
    $selectedEmulator = $availableEmulators[0]
    
    if ($availableEmulators.Count -gt 1) {
        Write-Host "Menggunakan emulator default: $selectedEmulator" -ForegroundColor Cyan
        Write-Host "(Untuk mengubah, edit file start-android.ps1)" -ForegroundColor Gray
        Write-Host ""
    }
    else {
        Write-Host "Menggunakan emulator: $selectedEmulator" -ForegroundColor Cyan
        Write-Host ""
    }
    
    # Jalankan emulator
    Start-AndroidEmulator -EmulatorName $selectedEmulator
}

# Jalankan aplikasi Expo/React Native di emulator
Write-Host "Meluncurkan aplikasi AgriPlay di emulator Android..." -ForegroundColor Cyan
Write-Host ""

try {
    # Jalankan expo start dengan flag --android
    # Expo akan otomatis detect emulator yang sedang berjalan
    npx expo start --android
}
catch {
    Write-Host "Error saat menjalankan aplikasi: $_" -ForegroundColor Red
    exit 1
}

