# 📤 Instrucciones para Subir a GitHub

## Paso 1: Crear el Repositorio en GitHub

1. Ve a https://github.com y inicia sesión con `facuaranoa1@gmail.com`
2. Haz click en el botón **"+"** (arriba a la derecha) → **"New repository"**
3. Configura:
   - **Repository name:** `proyecto`
   - **Description:** "Plataforma de intermediación de servicios móviles - MVP"
   - **Visibility:** Private o Public (tú decides)
   - **NO marques** "Initialize with README" (ya tenemos uno)
   - **NO marques** "Add .gitignore" (ya tenemos uno)
   - **NO marques** "Choose a license"
4. Haz click en **"Create repository"**

## Paso 2: Conectar y Subir

Una vez creado el repositorio, ejecuta estos comandos en la terminal (desde la carpeta del proyecto):

```bash
# Conectar el repositorio local con GitHub
git remote add origin https://github.com/faranoa/proyecto.git

# Cambiar la rama principal a 'main' (si es necesario)
git branch -M main

# Subir todo el código
git push -u origin main
```

**Nota:** Si tu usuario de GitHub es diferente a "faranoa", reemplaza "faranoa" en la URL con tu usuario.

## Paso 3: Verificar

Ve a tu repositorio en GitHub y deberías ver todos los archivos subidos.

## Comandos Útiles para el Futuro

```bash
# Ver el estado de los archivos
git status

# Agregar cambios
git add .

# Hacer commit
git commit -m "Descripción de los cambios"

# Subir cambios
git push

# Ver commits
git log

# Ver repositorios remotos
git remote -v
```

## ⚠️ Importante

El `.gitignore` está configurado para **NO subir**:
- ✅ `node_modules/` (dependencias)
- ✅ `backend/data/*.json` (datos de desarrollo)
- ✅ `.env` (variables de entorno con información sensible)
- ✅ `backend/uploads/*` (archivos subidos)

Esto es correcto y seguro. Los datos de desarrollo se recrean automáticamente.






