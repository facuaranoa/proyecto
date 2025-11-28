# 🚀 Instalar Node.js con nvm-windows (SIN permisos de admin)

## ✅ Perfecto para computadora del trabajo
nvm-windows se instala en tu carpeta de usuario, NO requiere permisos de administrador.

---

## 📥 Pasos Rápidos:

### 1. Descargar
- El navegador se abrió en: https://github.com/coreybutler/nvm-windows/releases
- Descarga: **`nvm-setup.exe`** (última versión, ej: v1.1.12)

### 2. Instalar
- Ejecuta `nvm-setup.exe`
- Se instalará en: `C:\Users\faranoa\AppData\Roaming\nvm`
- ✅ NO pide permisos de administrador

### 3. Cerrar y abrir PowerShell
- Cierra TODAS las ventanas de PowerShell
- Abre una nueva

### 4. Verificar nvm
```powershell
nvm version
```
Deberías ver algo como: `1.1.12`

### 5. Instalar Node.js LTS
```powershell
nvm install lts
nvm use lts
```

### 6. Verificar Node.js
```powershell
node --version
npm --version
```

### 7. Iniciar tu proyecto
```powershell
cd C:\Users\faranoa\Desktop\proyecto
.\iniciar-servidores.ps1
```

---

## 🎯 ¿Por qué funciona?
- Se instala en tu carpeta personal
- No toca archivos del sistema
- No necesita permisos de administrador
- Perfecto para computadoras del trabajo

---

## 🔗 Enlace directo:
https://github.com/coreybutler/nvm-windows/releases





