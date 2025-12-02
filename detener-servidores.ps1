# Script para detener los servidores Backend y Frontend
Write-Host "🛑 Deteniendo servidores..." -ForegroundColor Yellow
Write-Host ""

# Función para detener procesos en un puerto
function Stop-PortProcess {
    param([int]$Port, [string]$Name)
    try {
        $connections = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
        if ($connections) {
            $pids = $connections | Select-Object -ExpandProperty OwningProcess -Unique
            foreach ($pid in $pids) {
                try {
                    $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
                    if ($process) {
                        Write-Host "   Deteniendo proceso $pid ($($process.ProcessName))..." -ForegroundColor Gray
                        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
                    }
                } catch {
                    # Ignorar errores si el proceso ya no existe
                }
            }
            Write-Host "✅ $Name detenido" -ForegroundColor Green
            return $true
        } else {
            Write-Host "ℹ️  $Name no estaba corriendo" -ForegroundColor Gray
            return $false
        }
    } catch {
        Write-Host "⚠️  Error al detener $Name" -ForegroundColor Yellow
        return $false
    }
}

# Detener Backend
Write-Host "🔧 Deteniendo Backend (puerto 3000)..." -ForegroundColor Cyan
Stop-PortProcess -Port 3000 -Name "Backend"

# Esperar un momento
Start-Sleep -Seconds 1

# Detener Frontend
Write-Host "🌐 Deteniendo Frontend (puerto 8080)..." -ForegroundColor Cyan
Stop-PortProcess -Port 8080 -Name "Frontend"

# Detener cualquier otro proceso de Node.js relacionado
Write-Host ""
Write-Host "🔍 Buscando otros procesos de Node.js..." -ForegroundColor Cyan
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Write-Host "   Encontrados $($nodeProcesses.Count) proceso(s) adicional(es)" -ForegroundColor Yellow
    $nodeProcesses | ForEach-Object {
        Write-Host "   - Deteniendo PID: $($_.Id)..." -ForegroundColor Gray
        Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
    }
    Write-Host "✅ Todos los procesos de Node.js detenidos" -ForegroundColor Green
} else {
    Write-Host "   No se encontraron procesos adicionales" -ForegroundColor Gray
}

Write-Host ""
Write-Host "✅ Proceso completado" -ForegroundColor Green

