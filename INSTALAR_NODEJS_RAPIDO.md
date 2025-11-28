# 🚀 Instalar Node.js - Guía Rápida

## ⚡ Pasos Rápidos:

1. **El navegador se abrió automáticamente** en https://nodejs.org/
   - Si no se abrió, ve manualmente a: https://nodejs.org/

2. **Descarga la versión LTS** (botón verde grande)
   - Dice algo como "v20.x.x LTS" o "Recommended"

3. **Ejecuta el instalador** (.msi)
   - Click derecho → "Ejecutar como administrador" (si es necesario)

4. **Durante la instalación:**
   - ✅ **IMPORTANTE**: Marca la casilla **"Add to PATH"** o **"Add to environment variables"**
   - Click en "Next" hasta "Install"
   - Espera a que termine

5. **Cierra TODAS las ventanas de PowerShell** y ábrelas de nuevo

6. **Verifica la instalación:**
   ```powershell
   node --version
   ```
   Deberías ver: `v20.x.x` o similar

7. **Vuelve aquí y ejecuta:**
   ```powershell
   .\iniciar-servidores.ps1
   ```

---

## ✅ ¿Ya instalaste Node.js?

Si ya lo instalaste y cerraste/abriste PowerShell, ejecuta:

```powershell
node --version
```

Si ves un número (ej: v20.11.0), entonces ejecuta:

```powershell
.\iniciar-servidores.ps1
```

---

## 🆘 Si sigue sin funcionar:

1. Reinicia tu computadora
2. O busca manualmente dónde se instaló Node.js y agrega la ruta al PATH




