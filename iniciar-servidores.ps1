# Script para iniciar Backend y Frontend
Write-Host "🚀 Iniciando servidores..." -ForegroundColor Green

# Ruta de Node.js portable
$nodePath = "C:\Users\faranoa\node-v20.11.0-win-x64\node.exe"

# Verificar que Node.js existe
if (-not (Test-Path $nodePath)) {
    Write-Host "❌ Error: Node.js no encontrado en $nodePath" -ForegroundColor Red
    exit 1
}

# Iniciar Backend en una nueva ventana
Write-Host "Iniciando Backend (puerto 3000)..." -ForegroundColor Yellow
$backendPath = Join-Path $PSScriptRoot "backend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; Write-Host 'Backend iniciando...' -ForegroundColor Green; & '$nodePath' server.js"

# Esperar 2 segundos
Start-Sleep -Seconds 2

# Iniciar Frontend en una nueva ventana
Write-Host "Iniciando Frontend (puerto 8080)..." -ForegroundColor Yellow
$frontendPath = Join-Path $PSScriptRoot "frontend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; Write-Host 'Frontend iniciando...' -ForegroundColor Green; & '$nodePath' server.js"

# Esperar 3 segundos para que los servidores inicien
Start-Sleep -Seconds 3

# Abrir navegador
Write-Host "🌍 Abriendo navegador..." -ForegroundColor Cyan
Start-Process "http://localhost:8080"

Write-Host "✅ Servidores iniciados!" -ForegroundColor Green
Write-Host "Backend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:8080" -ForegroundColor Cyan

