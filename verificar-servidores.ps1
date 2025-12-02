# Script para verificar el estado de los servidores
Write-Host "🔍 Verificando estado de los servidores..." -ForegroundColor Cyan
Write-Host ""

# Función para verificar si un puerto está en uso
function Test-Port {
    param([int]$Port, [string]$Name)
    try {
        $connection = Test-NetConnection -ComputerName localhost -Port $Port -InformationLevel Quiet -WarningAction SilentlyContinue
        if ($connection) {
            Write-Host "✅ $Name (puerto $Port): CORRIENDO" -ForegroundColor Green
            return $true
        } else {
            Write-Host "❌ $Name (puerto $Port): NO CORRIENDO" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "❌ $Name (puerto $Port): ERROR AL VERIFICAR" -ForegroundColor Red
        return $false
    }
}

# Verificar procesos de Node.js
Write-Host "📊 Procesos de Node.js:" -ForegroundColor Cyan
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Write-Host "   Encontrados $($nodeProcesses.Count) proceso(s) de Node.js" -ForegroundColor Green
    $nodeProcesses | ForEach-Object {
        Write-Host "   - PID: $($_.Id) | Iniciado: $($_.StartTime)" -ForegroundColor Gray
    }
} else {
    Write-Host "   No se encontraron procesos de Node.js" -ForegroundColor Yellow
}

Write-Host ""

# Verificar Backend
$backendOk = Test-Port -Port 3000 -Name "Backend"

# Verificar Frontend
$frontendOk = Test-Port -Port 8080 -Name "Frontend"

Write-Host ""

# Resumen
if ($backendOk -and $frontendOk) {
    Write-Host "✅ Ambos servidores están corriendo correctamente" -ForegroundColor Green
    Write-Host ""
    Write-Host "🔗 URLs:" -ForegroundColor Cyan
    Write-Host "   Backend:  http://localhost:3000" -ForegroundColor White
    Write-Host "   Frontend: http://localhost:8080" -ForegroundColor White
} else {
    Write-Host "⚠️  Algunos servidores no están corriendo" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "💡 Para iniciar los servidores, ejecuta:" -ForegroundColor Cyan
    Write-Host "   .\iniciar-servidores.ps1" -ForegroundColor White
}

