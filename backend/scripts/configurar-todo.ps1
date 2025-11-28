# Script para configurar todo el proyecto
# Pide la contraseña de PostgreSQL y configura todo automáticamente

Write-Host "=== Configuracion de Ayuda Al Toque ===" -ForegroundColor Cyan
Write-Host ""

# Verificar que existe el archivo .env
$envPath = Join-Path $PSScriptRoot "..\.env"
if (-not (Test-Path $envPath)) {
    Write-Host "[!] No se encontro el archivo .env" -ForegroundColor Red
    Write-Host "    Creando desde env.example..." -ForegroundColor Yellow
    $envExamplePath = Join-Path $PSScriptRoot "..\env.example"
    Copy-Item $envExamplePath $envPath
}

Write-Host "[?] Necesito tu contraseña de PostgreSQL" -ForegroundColor Yellow
Write-Host "    (Es la contraseña que configuraste al instalar PostgreSQL)" -ForegroundColor Gray
Write-Host ""

# Solicitar contraseña
$password = Read-Host "Ingresa la contraseña del usuario 'postgres'" -AsSecureString
$passwordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($password))

Write-Host ""
Write-Host "[*] Configurando archivo .env..." -ForegroundColor Cyan

# Leer el archivo .env
$envContent = Get-Content $envPath -Raw

# Reemplazar la contraseña
$envContent = $envContent -replace "DB_PASSWORD=.*", "DB_PASSWORD=$passwordPlain"

# Generar JWT_SECRET si no está configurado
if ($envContent -match "JWT_SECRET=tu_clave_secreta") {
    $jwtSecret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
    $envContent = $envContent -replace "JWT_SECRET=.*", "JWT_SECRET=$jwtSecret"
    Write-Host "[+] JWT_SECRET generado automaticamente" -ForegroundColor Green
}

# Guardar el archivo .env
Set-Content -Path $envPath -Value $envContent -NoNewline

Write-Host "[+] Archivo .env configurado" -ForegroundColor Green

# Crear base de datos
Write-Host ""
Write-Host "[*] Creando base de datos 'ayuda_al_toque'..." -ForegroundColor Cyan

$psqlPath = "C:\Program Files\PostgreSQL\15\bin\psql.exe"
if (-not (Test-Path $psqlPath)) {
    $psqlPath = Get-ChildItem "C:\Program Files\PostgreSQL" -Recurse -Filter "psql.exe" -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty FullName
}

if ($psqlPath) {
    $env:PGPASSWORD = $passwordPlain
    $createDbCommand = "CREATE DATABASE ayuda_al_toque;"
    $result = & $psqlPath -U postgres -c $createDbCommand 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[+] Base de datos creada exitosamente" -ForegroundColor Green
    } elseif ($result -match "already exists") {
        Write-Host "[i] La base de datos ya existe" -ForegroundColor Yellow
    } else {
        Write-Host "[!] Error al crear la base de datos:" -ForegroundColor Yellow
        Write-Host "    $result" -ForegroundColor Gray
        Write-Host "[?] Puedes crearla manualmente en pgAdmin" -ForegroundColor Yellow
    }
    $env:PGPASSWORD = ""
} else {
    Write-Host "[!] No se encontro psql.exe" -ForegroundColor Yellow
    Write-Host "[?] Crea la base de datos manualmente en pgAdmin:" -ForegroundColor Yellow
    Write-Host "    Nombre: ayuda_al_toque" -ForegroundColor Gray
}

# Sincronizar base de datos
Write-Host ""
Write-Host "[*] Creando tablas en la base de datos..." -ForegroundColor Cyan

$backendPath = Join-Path $PSScriptRoot ".."
Set-Location $backendPath

npm run sync-db

if ($LASTEXITCODE -eq 0) {
    Write-Host "[+] Tablas creadas exitosamente" -ForegroundColor Green
} else {
    Write-Host "[!] Hubo un error al crear las tablas" -ForegroundColor Yellow
    Write-Host "[?] Verifica que la base de datos exista y las credenciales sean correctas" -ForegroundColor Yellow
}

# Limpiar contraseña de memoria
$passwordPlain = ""

Write-Host ""
Write-Host "=== Configuracion completada! ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Para iniciar el servidor, ejecuta:" -ForegroundColor Cyan
Write-Host "  npm start" -ForegroundColor Yellow
Write-Host ""
