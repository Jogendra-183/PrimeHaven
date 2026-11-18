# PrimeHaven - Stop All Services
Write-Host "Stopping all PrimeHaven services..." -ForegroundColor Yellow

$ports = @(8761, 6001, 6002, 6003, 6004, 6005, 5173)

foreach ($port in $ports) {
    $conns = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($conns) {
        $pids = $conns | Select-Object -ExpandProperty OwningProcess -Unique
        foreach ($p in $pids) {
            if ($p -gt 0) {
                Write-Host "Killing process $p on port $port" -ForegroundColor Cyan
                Stop-Process -Id $p -Force -ErrorAction SilentlyContinue
            }
        }
    }
}

Write-Host "All PrimeHaven services stopped." -ForegroundColor Green
