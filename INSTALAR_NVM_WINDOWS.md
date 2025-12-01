# 📦 Instalar Node.js con nvm-windows (Sin permisos de admin)

## ✅ Ventaja
nvm-windows puede instalarse en tu carpeta de usuario sin necesidad de permisos de administrador.

## 📥 Pasos:

### 1. Descargar nvm-windows
Ve a: https://github.com/coreybutler/nvm-windows/releases

Descarga: `nvm-setup.exe` (la última versión)

### 2. Instalar
- Ejecuta `nvm-setup.exe`
- Se instalará en: `C:\Users\faranoa\AppData\Roaming\nvm`
- NO requiere permisos de administrador

### 3. Verificar instalación
Abre una NUEVA ventana de PowerShell y ejecuta:
```powershell
nvm version
```

### 4. Instalar Node.js LTS
```powershell
nvm install lts
nvm use lts
```

### 5. Verificar Node.js
```powershell
node --version
npm --version
```

### 6. Iniciar servidores
```powershell
cd C:\Users\faranoa\Desktop\proyecto
.\iniciar-servidores.ps1
```

---

## 🎯 ¿Por qué funciona?
- Se instala en tu carpeta de usuario
- No modifica archivos del sistema
- No requiere permisos de administrador

---

## 🔗 Enlaces:
- nvm-windows: https://github.com/coreybutler/nvm-windows/releases
- Documentación: https://github.com/coreybutler/nvm-windows






