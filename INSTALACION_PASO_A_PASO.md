# 🚀 Instalación Paso a Paso - Windows

## 📋 Paso 1: Instalar Node.js

### ¿Qué es Node.js?
Es el "motor" que necesitamos para que nuestro servidor funcione. Es como instalar un programa normal.

### Cómo instalarlo:

1. **Abre tu navegador** y ve a: https://nodejs.org/
2. **Descarga la versión LTS** (Long Term Support - la más estable)
   - Busca el botón verde que dice "LTS" o "Recommended"
   - Debería ser algo como "v20.x.x LTS"
3. **Ejecuta el instalador** que descargaste
4. **Sigue el asistente de instalación:**
   - Click en "Next" varias veces
   - **IMPORTANTE**: Asegúrate de que esté marcada la opción "Add to PATH" (agregar al PATH)
   - Click en "Install"
   - Espera a que termine
5. **Reinicia tu terminal/PowerShell** (ciérrala y ábrela de nuevo)

### Verificar que se instaló:

Abre PowerShell (o CMD) y escribe:
```bash
node --version
```

Deberías ver algo como: `v20.11.0` (el número puede variar)

Si ves un número de versión, ¡perfecto! ✅
Si dice "no se reconoce como comando", vuelve a instalar y asegúrate de marcar "Add to PATH"

---

## 📋 Paso 2: Instalar PostgreSQL

### ¿Qué es PostgreSQL?
Es la base de datos donde guardaremos toda la información (clientes, trabajadores, tareas).

### Cómo instalarlo:

1. **Abre tu navegador** y ve a: https://www.postgresql.org/download/windows/
2. **Click en "Download the installer"**
3. **Selecciona la versión más reciente** (ej: PostgreSQL 16)
4. **Ejecuta el instalador** que descargaste
5. **Sigue el asistente:**
   - Click en "Next"
   - **IMPORTANTE**: Anota la contraseña que pongas para el usuario `postgres`
     - Esta contraseña la necesitarás después
     - Ejemplo: `postgres123` (pero usa una que recuerdes)
   - El puerto por defecto es `5432` - déjalo así
   - Sigue haciendo "Next" hasta que termine la instalación
6. **Al final**, desmarca "Launch Stack Builder" (no lo necesitamos)
7. **Click en "Finish"**

### Verificar que se instaló:

Abre PowerShell y escribe:
```bash
psql --version
```

Deberías ver algo como: `psql (PostgreSQL) 16.x`

Si ves una versión, ¡perfecto! ✅

---

## 📋 Paso 3: Crear la Base de Datos

### Opción A: Usando pgAdmin (Más fácil - Recomendado)

1. **Abre pgAdmin** (debería estar en el menú de inicio de Windows)
2. **Te pedirá una contraseña** - es la que configuraste al instalar PostgreSQL
3. **En el panel izquierdo:**
   - Expande "Servers"
   - Expande "PostgreSQL 16" (o la versión que instalaste)
   - Click derecho en "Databases"
   - Selecciona "Create" → "Database..."
4. **En la ventana que se abre:**
   - En "Database": escribe `ayuda_al_toque`
   - Click en "Save"
5. **¡Listo!** Ya tienes la base de datos creada ✅

### Opción B: Usando la Terminal (Más avanzado)

Abre PowerShell y escribe:
```bash
psql -U postgres
```

Te pedirá la contraseña (la que configuraste al instalar).

Luego escribe:
```sql
CREATE DATABASE ayuda_al_toque;
```

Y presiona Enter. Luego escribe `\q` para salir.

---

## 📋 Paso 4: Instalar las Dependencias del Proyecto

1. **Abre PowerShell** en la carpeta del proyecto
   - Puedes hacer click derecho en la carpeta `backend` → "Abrir en terminal" o "Open in Terminal"
   - O navega manualmente: `cd backend`

2. **Instala las dependencias:**
```bash
npm install
```

Esto puede tardar 1-2 minutos. Verás muchos mensajes, es normal.

**¿Qué hace esto?**
Descarga todas las "herramientas" (librerías) que necesita el proyecto para funcionar.

---

## 📋 Paso 5: Configurar Variables de Entorno

1. **En la carpeta `backend`**, busca el archivo `env.example`
2. **Cópialo y renómbralo a `.env`**
   - Click derecho en `env.example` → "Copiar"
   - Click derecho → "Pegar"
   - Renombra el archivo copiado a `.env` (sin el "example")
   - **Nota**: Si no ves la extensión `.env`, está bien, Windows puede ocultarla

3. **Abre el archivo `.env` con el Bloc de Notas** (click derecho → "Abrir con" → "Bloc de notas")

4. **Edita estos valores:**

```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ayuda_al_toque
DB_USER=postgres
DB_PASSWORD=TU_CONTRASEÑA_DE_POSTGRES_AQUI    ← Cambia esto
PORT=3000
JWT_SECRET=cualquier_texto_largo_y_seguro_123456    ← Cambia esto
UPLOAD_DIR=./uploads
ADMIN_TOKEN=admin_secret_token_123    ← Opcional, puedes cambiarlo
```

**Ejemplo de cómo quedaría:**
```
DB_PASSWORD=postgres123
JWT_SECRET=mi_clave_secreta_super_segura_2024
```

5. **Guarda el archivo** (Ctrl + S)

---

## 📋 Paso 6: Crear las Tablas en la Base de Datos

En PowerShell, dentro de la carpeta `backend`, ejecuta:

```bash
npm run sync-db
```

**¿Qué hace esto?**
Crea las tablas en PostgreSQL según los modelos que definimos (UsuarioClientes, Taskers, Tareas).

Deberías ver mensajes como:
```
✅ Base de datos sincronizada correctamente
✅ Tablas creadas/actualizadas:
   - UsuarioClientes
   - Taskers
   - Tareas
```

---

## 📋 Paso 7: Iniciar el Servidor

En PowerShell, dentro de la carpeta `backend`, ejecuta:

```bash
npm start
```

**¿Qué deberías ver?**
```
✅ Base de datos conectada correctamente
✅ Servidor corriendo en http://localhost:3000
```

**¡Felicidades! 🎉 Tu servidor está funcionando.**

---

## 🧪 Probar que Funciona

### Opción 1: Desde el Navegador

Abre tu navegador y ve a:
```
http://localhost:3000
```

Deberías ver un mensaje JSON con información de la API.

### Opción 2: Usando Postman o Thunder Client

**Postman:**
1. Descarga Postman desde: https://www.postman.com/downloads/
2. Instálalo
3. Crea una nueva petición:
   - Método: `GET`
   - URL: `http://localhost:3000`
   - Click en "Send"

**Thunder Client (Extensión de VS Code):**
1. Si usas VS Code, instala la extensión "Thunder Client"
2. Abre Thunder Client
3. Crea una nueva petición GET a `http://localhost:3000`

---

## 🐛 Problemas Comunes y Soluciones

### ❌ "node: no se reconoce como comando"
**Solución:**
- Reinstala Node.js
- Asegúrate de marcar "Add to PATH" durante la instalación
- Reinicia tu terminal después de instalar

### ❌ "psql: no se reconoce como comando"
**Solución:**
- PostgreSQL no está en el PATH
- Usa pgAdmin en su lugar (más fácil)
- O agrega PostgreSQL al PATH manualmente

### ❌ "Error: Connection refused" o "no se puede conectar"
**Solución:**
1. Verifica que PostgreSQL esté corriendo:
   - Abre "Servicios" de Windows (Win + R → `services.msc`)
   - Busca "postgresql" y verifica que esté "En ejecución"
2. Verifica la contraseña en el archivo `.env`
3. Verifica que la base de datos `ayuda_al_toque` exista

### ❌ "Cannot find module"
**Solución:**
- Ejecuta `npm install` de nuevo en la carpeta `backend`

### ❌ "Table doesn't exist"
**Solución:**
- Ejecuta `npm run sync-db` de nuevo

### ❌ El servidor no inicia
**Solución:**
1. Verifica que el puerto 3000 no esté en uso:
   - Cierra otras aplicaciones que puedan estar usando el puerto
2. Verifica que el archivo `.env` esté bien configurado
3. Revisa los mensajes de error en la consola

---

## ✅ Checklist Final

Antes de continuar, verifica que tengas:

- [ ] Node.js instalado (`node --version` funciona)
- [ ] PostgreSQL instalado
- [ ] Base de datos `ayuda_al_toque` creada
- [ ] Dependencias instaladas (`npm install` completado)
- [ ] Archivo `.env` configurado con tu contraseña de PostgreSQL
- [ ] Tablas creadas (`npm run sync-db` completado)
- [ ] Servidor corriendo (`npm start` muestra mensaje de éxito)

---

## 🎯 Siguiente Paso

Una vez que todo esté funcionando, puedes probar los endpoints. Revisa el archivo `GUIA_RAPIDA.md` para ejemplos de cómo probar el registro y login.

---

¿Necesitas ayuda con algún paso? ¡Pregunta sin miedo! 😊



