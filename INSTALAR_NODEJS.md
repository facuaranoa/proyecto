# 📥 Instalar Node.js - Guía Rápida

## ✅ PostgreSQL ya está instalado
¡Bien! Ya tienes PostgreSQL instalado y funcionando.

## ❌ Falta instalar Node.js

### Pasos para instalar Node.js:

1. **Abre tu navegador** y ve a:
   ```
   https://nodejs.org/
   ```

2. **Descarga la versión LTS** (Long Term Support)
   - Busca el botón grande verde que dice **"LTS"** o **"Recommended"**
   - Debería decir algo como "v20.x.x LTS"
   - Click en "Download Node.js (LTS)"

3. **Ejecuta el instalador** que descargaste
   - Debería ser un archivo `.msi` (ej: `node-v20.11.0-x64.msi`)

4. **Sigue el asistente de instalación:**
   - Click en **"Next"** varias veces
   - **⚠️ IMPORTANTE**: En la pantalla que dice "Custom Setup", asegúrate de que esté marcada la opción:
     - ✅ **"Add to PATH"** o **"Add to environment variables"**
   - Click en **"Next"** hasta llegar a "Install"
   - Click en **"Install"**
   - Espera a que termine (puede tardar 1-2 minutos)

5. **Reinicia PowerShell** (ciérrala completamente y ábrela de nuevo)

6. **Verifica que se instaló:**
   Abre PowerShell y escribe:
   ```powershell
   node --version
   ```
   
   Deberías ver algo como: `v20.11.0`
   
   Si ves un número, ¡perfecto! ✅
   
   Si dice "no se reconoce como comando", vuelve a instalar y asegúrate de marcar "Add to PATH"

---

## 🎯 Después de instalar Node.js

Una vez que Node.js esté instalado, vuelve aquí y ejecuta:

```powershell
cd backend
.\scripts\setup-completo.ps1
```

Este script te ayudará a configurar todo automáticamente.

---

## 🆘 ¿Problemas?

### "node: no se reconoce como comando"
**Solución:**
1. Reinstala Node.js
2. Asegúrate de marcar "Add to PATH" durante la instalación
3. **Reinicia PowerShell** (ciérrala y ábrela de nuevo)
4. Si sigue sin funcionar, reinicia tu computadora

### "El instalador no se ejecuta"
**Solución:**
- Click derecho en el archivo `.msi` → "Ejecutar como administrador"

---

¿Ya instalaste Node.js? ¡Avísame y continuamos! 😊



