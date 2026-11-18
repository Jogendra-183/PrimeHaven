# PrimeHaven - Start All Services
$ErrorActionPreference = "Continue"

$java = "C:\Program Files\Java\jdk-17\bin\java.exe"
$baseDir = "D:\SQL all exp\project"
$logsDir = "$baseDir\logs"

if (-not (Test-Path $logsDir)) {
    New-Item -ItemType Directory -Path $logsDir -Force | Out-Null
}

function Wait-For-Port($port, $timeoutSeconds = 40) {
    $sw = [System.Diagnostics.Stopwatch]::StartNew()
    while ($sw.Elapsed.TotalSeconds -lt $timeoutSeconds) {
        try {
            $tcp = [System.Net.Sockets.TcpClient]::new()
            $ar = $tcp.BeginConnect("127.0.0.1", $port, $null, $null)
            if ($ar.AsyncWaitHandle.WaitOne(800)) {
                $tcp.EndConnect($ar)
                $tcp.Close()
                return $true
            }
            $tcp.Close()
        } catch {}
        Start-Sleep -Seconds 1
    }
    return $false
}

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   Starting PrimeHaven Cloud Ecosystem    " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# 0. PostgreSQL Database (5432)
Write-Host "[0/7] Checking PostgreSQL Database (port 5432)..." -ForegroundColor Yellow
if (-not (Wait-For-Port 5432 2)) {
    Write-Host "Starting PostgreSQL on 127.0.0.1..." -ForegroundColor Yellow
    $pgExe = "C:\Program Files\PostgreSQL\18\bin\postgres.exe"
    $pgData = "C:\Program Files\PostgreSQL\18\data"
    Start-Process -FilePath $pgExe -ArgumentList "-D `"$pgData`" -h 127.0.0.1" -RedirectStandardOutput "$logsDir\pg.log" -RedirectStandardError "$logsDir\pg-err.log" -WindowStyle Hidden
    if (Wait-For-Port 5432 15) {
        Write-Host " -> PostgreSQL is UP on port 5432" -ForegroundColor Green
    } else {
        Write-Host " -> Warning: PostgreSQL taking longer to bind port 5432" -ForegroundColor Red
    }
} else {
    Write-Host " -> PostgreSQL is already UP on port 5432" -ForegroundColor Green
}

# 1. Eureka Server (8761)
Write-Host "[1/7] Starting Eureka Server (port 8761)..." -ForegroundColor Yellow
$eurekaJar = "$baseDir\project\EUREKA-SERVER\target\EUREKA-SERVER-0.0.1-SNAPSHOT.jar"
Start-Process -FilePath $java -ArgumentList "-Xms128m -Xmx256m -jar `"$eurekaJar`"" -RedirectStandardOutput "$logsDir\eureka.log" -RedirectStandardError "$logsDir\eureka-err.log" -WindowStyle Hidden

if (Wait-For-Port 8761 45) {
    Write-Host " -> Eureka Server is UP: http://localhost:8761" -ForegroundColor Green
} else {
    Write-Host " -> Warning: Eureka Server taking longer than usual to bind port 8761" -ForegroundColor Red
}

# 2. Auth Service (6002)
Write-Host "[2/7] Starting Auth Service (port 6002)..." -ForegroundColor Yellow
$authJar = "$baseDir\project\AUTH-SERVICE\target\auth-service-0.0.1-SNAPSHOT.jar"
Start-Process -FilePath $java -ArgumentList "-Xms128m -Xmx256m -jar `"$authJar`"" -RedirectStandardOutput "$logsDir\auth.log" -RedirectStandardError "$logsDir\auth-err.log" -WindowStyle Hidden

# 3. Property Service (6003)
Write-Host "[3/7] Starting Property Service (port 6003)..." -ForegroundColor Yellow
$propJar = "$baseDir\project\PROPERTY-SERVICE\target\PROPERTY-SERVICE-0.0.1-SNAPSHOT.jar"
Start-Process -FilePath $java -ArgumentList "-Xms128m -Xmx256m -jar `"$propJar`"" -RedirectStandardOutput "$logsDir\property.log" -RedirectStandardError "$logsDir\property-err.log" -WindowStyle Hidden

# 4. Visit Service (6004)
Write-Host "[4/7] Starting Visit Service (port 6004)..." -ForegroundColor Yellow
$visitJar = "$baseDir\project\VISIT-SERVICE\target\VISIT-SERVICE-0.0.1-SNAPSHOT.jar"
Start-Process -FilePath $java -ArgumentList "-Xms128m -Xmx256m -jar `"$visitJar`"" -RedirectStandardOutput "$logsDir\visit.log" -RedirectStandardError "$logsDir\visit-err.log" -WindowStyle Hidden

# 5. Inquiry Service (6005)
Write-Host "[5/7] Starting Inquiry Service (port 6005)..." -ForegroundColor Yellow
$inqJar = "$baseDir\project\INQUIRY-SERVICE\target\INQUIRY-SERVICE-0.0.1-SNAPSHOT.jar"
Start-Process -FilePath $java -ArgumentList "-Xms128m -Xmx256m -jar `"$inqJar`"" -RedirectStandardOutput "$logsDir\inquiry.log" -RedirectStandardError "$logsDir\inquiry-err.log" -WindowStyle Hidden

# Wait for core microservices
Write-Host "Waiting for microservices to bind ports..." -ForegroundColor Yellow
Wait-For-Port 6002 45 | Out-Null
Write-Host " -> Auth Service is UP: http://localhost:6002" -ForegroundColor Green
Wait-For-Port 6003 45 | Out-Null
Write-Host " -> Property Service is UP: http://localhost:6003" -ForegroundColor Green
Wait-For-Port 6004 45 | Out-Null
Write-Host " -> Visit Service is UP: http://localhost:6004" -ForegroundColor Green
Wait-For-Port 6005 45 | Out-Null
Write-Host " -> Inquiry Service is UP: http://localhost:6005" -ForegroundColor Green

# 6. API Gateway (6001)
Write-Host "[6/7] Starting API Gateway (port 6001)..." -ForegroundColor Yellow
$gatewayJar = "$baseDir\project\API-GATWAY\target\API-GATWAY-0.0.1-SNAPSHOT.jar"
Start-Process -FilePath $java -ArgumentList "-Xms128m -Xmx256m -jar `"$gatewayJar`"" -RedirectStandardOutput "$logsDir\gateway.log" -RedirectStandardError "$logsDir\gateway-err.log" -WindowStyle Hidden

if (Wait-For-Port 6001 45) {
    Write-Host " -> API Gateway is UP: http://localhost:6001" -ForegroundColor Green
} else {
    Write-Host " -> Warning: API Gateway taking longer than usual to bind port 6001" -ForegroundColor Red
}

# 7. Frontend Vite Dev Server (5173)
Write-Host "[7/7] Starting Frontend Server (port 5173)..." -ForegroundColor Yellow
$frontendDir = "$baseDir\primehaven-frontend"
Start-Process -FilePath "cmd.exe" -ArgumentList "/c npm run dev" -WorkingDirectory $frontendDir -RedirectStandardOutput "$logsDir\frontend.log" -RedirectStandardError "$logsDir\frontend-err.log" -WindowStyle Hidden

if (Wait-For-Port 5173 20) {
    Write-Host " -> Frontend is UP: http://localhost:5173" -ForegroundColor Green
} else {
    Write-Host " -> Warning: Frontend taking longer than usual to bind port 5173" -ForegroundColor Red
}

Write-Host "`n=================================================" -ForegroundColor Cyan
Write-Host "       All PrimeHaven Services Are Running!       " -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "Frontend App:          http://localhost:5173" -ForegroundColor White
Write-Host "Sign In / Login:       http://localhost:5173/signin" -ForegroundColor White
Write-Host "Sign Up / Register:    http://localhost:5173/signup" -ForegroundColor White
Write-Host "API Gateway:           http://localhost:6001" -ForegroundColor White
Write-Host "Eureka Dashboard:      http://localhost:8761" -ForegroundColor White
Write-Host "Auth Service:          http://localhost:6002" -ForegroundColor White
Write-Host "Property Service:      http://localhost:6003" -ForegroundColor White
Write-Host "Visit Service:         http://localhost:6004" -ForegroundColor White
Write-Host "Inquiry Service:       http://localhost:6005" -ForegroundColor White
Write-Host "=================================================" -ForegroundColor Cyan

while ($true) {
    Start-Sleep -Seconds 30
}
