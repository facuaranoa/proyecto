# Script para crear la base de datos en PostgreSQL
# Ejecuta este script desde PowerShell

Write-Host "🔍 Verificando PostgreSQL..." -ForegroundColor Cyan

$psqlPath = "C:\Program Files\PostgreSQL\15\bin\psql.exe"

if (-not (Test-Path $psqlPath)) {
    Write-Host "❌ No se encontró psql.exe en la ruta esperada" -ForegroundColor Red
    Write-Host "   Buscando en otras ubicaciones..." -ForegroundColor Yellow

    $psqlPath = Get-ChildItem "C:\Program Files\PostgreSQL" -Recurse -Filter "psql.exe" -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty FullName

    if (-not $psqlPath) {
        Write-Host "❌ No se encontró PostgreSQL instalado" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ PostgreSQL encontrado en: $psqlPath" -ForegroundColor Green
Write-Host ""

# Solicitar contraseña
$password = Read-Host "Ingresa la contraseña del usuario 'postgres'" -AsSecureString
$passwordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($password))

Write-Host ""
Write-Host "🔄 Creando base de datos 'ayuda_al_toque'..." -ForegroundColor Cyan

# Configurar variable de entorno para la contraseña
$env:PGPASSWORD = $passwordPlain

# Intentar crear la base de datos
$createDbCommand = "CREATE DATABASE ayuda_al_toque;"
$result = & $psqlPath -U postgres -c $createDbCommand 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Base de datos 'ayuda_al_toque' creada exitosamente!" -ForegroundColor Green
} else {
    if ($result -match "already exists") {
        Write-Host "ℹ️  La base de datos 'ayuda_al_toque' ya existe" -ForegroundColor Yellow
    } else {
        Write-Host "❌ Error al crear la base de datos:" -ForegroundColor Red
        Write-Host $result -ForegroundColor Red
        Write-Host ""
        Write-Host "💡 Intenta crear la base de datos manualmente usando pgAdmin:" -ForegroundColor Yellow
        Write-Host "   1. Abre pgAdmin" -ForegroundColor Yellow
        Write-Host "   2. Click derecho en 'Databases'" -ForegroundColor Yellow
        Write-Host "   3. Create > Database" -ForegroundColor Yellow
        Write-Host "   4. Nombre: ayuda_al_toque" -ForegroundColor Yellow
    }
}

# Limpiar la contraseña de la memoria
$env:PGPASSWORD = ""
$passwordPlain = ""

Write-Host ""
Write-Host "✅ Proceso completado!" -ForegroundColor Green

