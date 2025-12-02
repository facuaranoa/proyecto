# Script para iniciar Backend y Frontend de manera confiable
Write-Host "🚀 Iniciando servidores..." -ForegroundColor Green

# Ruta de Node.js portable
$nodePath = "C:\Users\faranoa\node-v20.11.0-win-x64\node.exe"

# Verificar que Node.js existe
if (-not (Test-Path $nodePath)) {
    Write-Host "❌ Error: Node.js no encontrado en $nodePath" -ForegroundColor Red
    Write-Host "💡 Solución: Verifica la ruta de Node.js o instálalo desde https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Función para verificar si un puerto está en uso
function Test-Port {
    param([int]$Port)
    try {
        $connection = Test-NetConnection -ComputerName localhost -Port $Port -InformationLevel Quiet -WarningAction SilentlyContinue
        return $connection
    } catch {
        return $false
    }
}

# Función para esperar a que un puerto esté disponible
function Wait-ForPort {
    param([int]$Port, [int]$MaxWaitSeconds = 30)
    $elapsed = 0
    while ($elapsed -lt $MaxWaitSeconds) {
        if (Test-Port -Port $Port) {
            return $true
        }
        Start-Sleep -Seconds 1
        $elapsed++
        Write-Host "." -NoNewline -ForegroundColor Gray
    }
    Write-Host ""
    return $false
}

# Detener servidores existentes si están corriendo
Write-Host "`n🔍 Verificando servidores existentes..." -ForegroundColor Cyan

if (Test-Port -Port 3000) {
    Write-Host "⚠️  Backend ya está corriendo en puerto 3000" -ForegroundColor Yellow
    $stopBackend = Read-Host "¿Deseas detenerlo y reiniciarlo? (S/N)"
    if ($stopBackend -eq "S" -or $stopBackend -eq "s") {
        Write-Host "🛑 Deteniendo procesos de Node.js en puerto 3000..." -ForegroundColor Yellow
        Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | 
            ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
        Start-Sleep -Seconds 2
    }
}

if (Test-Port -Port 8080) {
    Write-Host "⚠️  Frontend ya está corriendo en puerto 8080" -ForegroundColor Yellow
    $stopFrontend = Read-Host "¿Deseas detenerlo y reiniciarlo? (S/N)"
    if ($stopFrontend -eq "S" -or $stopFrontend -eq "s") {
        Write-Host "🛑 Deteniendo procesos de Node.js en puerto 8080..." -ForegroundColor Yellow
        Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue | 
            ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
        Start-Sleep -Seconds 2
    }
}

# Verificar que los puertos estén libres
if (Test-Port -Port 3000) {
    Write-Host "❌ Error: El puerto 3000 aún está en uso. Cierra la aplicación que lo está usando." -ForegroundColor Red
    exit 1
}

if (Test-Port -Port 8080) {
    Write-Host "❌ Error: El puerto 8080 aún está en uso. Cierra la aplicación que lo está usando." -ForegroundColor Red
    exit 1
}

# Verificar que existe el archivo .env
$envPath = Join-Path $PSScriptRoot "backend\.env"
if (-not (Test-Path $envPath)) {
    Write-Host "⚠️  Archivo .env no encontrado en backend. Creando desde env.example..." -ForegroundColor Yellow
    $envExample = Join-Path $PSScriptRoot "backend\env.example"
    if (Test-Path $envExample) {
        Copy-Item $envExample $envPath
        Write-Host "✅ Archivo .env creado" -ForegroundColor Green
    } else {
        Write-Host "❌ Error: No se encontró env.example" -ForegroundColor Red
        exit 1
    }
}

# Iniciar Backend
Write-Host "`n🔧 Iniciando Backend (puerto 3000)..." -ForegroundColor Yellow
$backendPath = Join-Path $PSScriptRoot "backend"
if (-not (Test-Path (Join-Path $backendPath "server.js"))) {
    Write-Host "❌ Error: No se encontró server.js en $backendPath" -ForegroundColor Red
    exit 1
}

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; Write-Host '🔧 Backend iniciando en http://localhost:3000...' -ForegroundColor Green; & '$nodePath' server.js"

# Esperar a que el backend esté listo
Write-Host "⏳ Esperando a que el Backend esté listo..." -ForegroundColor Cyan
if (-not (Wait-ForPort -Port 3000 -MaxWaitSeconds 30)) {
    Write-Host "`n❌ Error: El Backend no respondió en 30 segundos" -ForegroundColor Red
    exit 1
}
Write-Host "`n✅ Backend listo en http://localhost:3000" -ForegroundColor Green

# Esperar 2 segundos adicionales para estabilización
Start-Sleep -Seconds 2

# Iniciar Frontend
Write-Host "`n🌐 Iniciando Frontend (puerto 8080)..." -ForegroundColor Yellow
$frontendPath = Join-Path $PSScriptRoot "frontend"
if (-not (Test-Path (Join-Path $frontendPath "server.js"))) {
    Write-Host "❌ Error: No se encontró server.js en $frontendPath" -ForegroundColor Red
    exit 1
}

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; Write-Host '🌐 Frontend iniciando en http://localhost:8080...' -ForegroundColor Green; & '$nodePath' server.js"

# Esperar a que el frontend esté listo
Write-Host "⏳ Esperando a que el Frontend esté listo..." -ForegroundColor Cyan
if (-not (Wait-ForPort -Port 8080 -MaxWaitSeconds 30)) {
    Write-Host "`n❌ Error: El Frontend no respondió en 30 segundos" -ForegroundColor Red
    exit 1
}
Write-Host "`n✅ Frontend listo en http://localhost:8080" -ForegroundColor Green

# Esperar 2 segundos adicionales para estabilización
Start-Sleep -Seconds 2

# Verificar que ambos servidores estén corriendo
Write-Host "`n🔍 Verificando estado final de los servidores..." -ForegroundColor Cyan
$backendOk = Test-Port -Port 3000
$frontendOk = Test-Port -Port 8080

if ($backendOk -and $frontendOk) {
    Write-Host "`n✅ ¡Servidores iniciados correctamente!" -ForegroundColor Green
    Write-Host "   Backend:  http://localhost:3000" -ForegroundColor Cyan
    Write-Host "   Frontend: http://localhost:8080" -ForegroundColor Cyan
    
    # Abrir navegador
    Write-Host "`n🌍 Abriendo navegador..." -ForegroundColor Cyan
    Start-Sleep -Seconds 1
    Start-Process "http://localhost:8080"
    
    Write-Host "`n💡 Tip: Mantén las ventanas de PowerShell abiertas mientras uses la aplicación" -ForegroundColor Yellow
    Write-Host "   Para detener los servidores, cierra las ventanas de PowerShell o presiona Ctrl+C" -ForegroundColor Yellow
} else {
    Write-Host "`n⚠️  Advertencia: Algunos servidores no están respondiendo:" -ForegroundColor Yellow
    if (-not $backendOk) {
        Write-Host "   ❌ Backend (puerto 3000) no responde" -ForegroundColor Red
    }
    if (-not $frontendOk) {
        Write-Host "   ❌ Frontend (puerto 8080) no responde" -ForegroundColor Red
    }
    Write-Host "`n💡 Revisa las ventanas de PowerShell para ver los errores" -ForegroundColor Yellow
}
