# 🔧 Alternativas para Instalar Node.js

## Opción 1: Usar Winget (Windows Package Manager)

Si tienes Windows 10/11 actualizado, puedes usar winget:

```powershell
winget install OpenJS.NodeJS.LTS
```

## Opción 2: Descargar desde GitHub

1. Ve a: https://github.com/nodejs/node/releases
2. Busca la última versión LTS (ej: v20.11.0)
3. Descarga el archivo `.msi` para Windows
4. Ejecuta el instalador

## Opción 3: Usar Chocolatey (si lo tienes instalado)

```powershell
choco install nodejs-lts
```

## Opción 4: Versión Portable (sin instalador)

1. Ve a: https://nodejs.org/dist/v20.11.0/
2. Descarga: `node-v20.11.0-win-x64.zip`
3. Extrae en: `C:\nodejs`
4. Agrega `C:\nodejs` al PATH manualmente

## Opción 5: Pedirle a alguien que te pase el instalador

Si alguien más tiene Node.js instalado, puede pasarte el instalador `.msi`

---

## 🆘 ¿Por qué no puedes descargar?

- ¿Problemas de internet?
- ¿Firewall bloqueando?
- ¿Restricciones de la computadora del trabajo?

Si es la computadora del trabajo, puede que necesites permisos de administrador o contactar a IT.





