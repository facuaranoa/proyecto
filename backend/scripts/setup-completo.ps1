# Script de Configuración Completa
# Este script ayuda a configurar todo el proyecto paso a paso

Write-Host "🚀 Configuración de Ayuda Al Toque" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Verificar Node.js
Write-Host "1️⃣ Verificando Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "   ✅ Node.js instalado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Node.js NO está instalado" -ForegroundColor Red
    Write-Host "   📥 Descarga Node.js desde: https://nodejs.org/" -ForegroundColor Yellow
    Write-Host "   💡 Instala la versión LTS y reinicia PowerShell" -ForegroundColor Yellow
    exit 1
}

# Verificar npm
Write-Host ""
Write-Host "2️⃣ Verificando npm..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "   ✅ npm instalado: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ npm NO está disponible" -ForegroundColor Red
    exit 1
}

# Verificar PostgreSQL
Write-Host ""
Write-Host "3️⃣ Verificando PostgreSQL..." -ForegroundColor Yellow
$postgresService = Get-Service -Name "*postgresql*" -ErrorAction SilentlyContinue
if ($postgresService) {
    Write-Host "   ✅ PostgreSQL está instalado y corriendo" -ForegroundColor Green
    Write-Host "   📦 Versión: $($postgresService.Name)" -ForegroundColor Gray
} else {
    Write-Host "   ❌ PostgreSQL NO está instalado o no está corriendo" -ForegroundColor Red
    Write-Host "   📥 Descarga PostgreSQL desde: https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
    exit 1
}

# Verificar si existe el archivo .env
Write-Host ""
Write-Host "4️⃣ Verificando configuración..." -ForegroundColor Yellow
$envPath = Join-Path $PSScriptRoot "..\.env"
if (Test-Path $envPath) {
    Write-Host "   ✅ Archivo .env encontrado" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Archivo .env NO encontrado" -ForegroundColor Yellow
    Write-Host "   📝 Creando archivo .env desde env.example..." -ForegroundColor Cyan
    
    $envExamplePath = Join-Path $PSScriptRoot "..\env.example"
    if (Test-Path $envExamplePath) {
        Copy-Item $envExamplePath $envPath
        Write-Host "   ✅ Archivo .env creado" -ForegroundColor Green
        Write-Host "   ⚠️  IMPORTANTE: Edita el archivo .env y completa:" -ForegroundColor Yellow
        Write-Host "      - DB_PASSWORD: Tu contraseña de PostgreSQL" -ForegroundColor Yellow
        Write-Host "      - JWT_SECRET: Cualquier texto largo y seguro" -ForegroundColor Yellow
        Write-Host ""
        $continuar = Read-Host "   ¿Ya editaste el archivo .env? (S/N)"
        if ($continuar -ne "S" -and $continuar -ne "s") {
            Write-Host "   ⏸️  Edita el archivo .env y vuelve a ejecutar este script" -ForegroundColor Yellow
            exit 0
        }
    } else {
        Write-Host "   ❌ No se encontró env.example" -ForegroundColor Red
        exit 1
    }
}

# Instalar dependencias
Write-Host ""
Write-Host "5️⃣ Instalando dependencias de Node.js..." -ForegroundColor Yellow
$backendPath = Join-Path $PSScriptRoot ".."
Set-Location $backendPath

if (-not (Test-Path "node_modules")) {
    Write-Host "   📦 Ejecutando npm install (esto puede tardar 1-2 minutos)..." -ForegroundColor Cyan
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "   ❌ Error al instalar dependencias" -ForegroundColor Red
        exit 1
    }
    Write-Host "   ✅ Dependencias instaladas" -ForegroundColor Green
} else {
    Write-Host "   ✅ Dependencias ya instaladas" -ForegroundColor Green
}

# Crear base de datos
Write-Host ""
Write-Host "6️⃣ Verificando base de datos..." -ForegroundColor Yellow
Write-Host "   💡 Si la base de datos no existe, ejecuta:" -ForegroundColor Cyan
Write-Host "      .\scripts\crear-base-datos.ps1" -ForegroundColor Cyan
Write-Host "   O créala manualmente en pgAdmin" -ForegroundColor Cyan

# Sincronizar base de datos
Write-Host ""
Write-Host "7️⃣ Sincronizando base de datos (creando tablas)..." -ForegroundColor Yellow
Write-Host "   📝 Ejecutando: npm run sync-db" -ForegroundColor Cyan
npm run sync-db
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Tablas creadas exitosamente" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Hubo un error al crear las tablas" -ForegroundColor Yellow
    Write-Host "   💡 Verifica que:" -ForegroundColor Yellow
    Write-Host "      - La base de datos 'ayuda_al_toque' exista" -ForegroundColor Yellow
    Write-Host "      - Las credenciales en .env sean correctas" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "✅ Configuración completada!" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Para iniciar el servidor, ejecuta:" -ForegroundColor Cyan
Write-Host "   npm start" -ForegroundColor Yellow
Write-Host ""
Write-Host "📖 Revisa el archivo README.md para más información" -ForegroundColor Cyan

