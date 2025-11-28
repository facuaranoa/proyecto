# 🚀 Ayuda Al Toque - MVP Plataforma de Intermediación de Servicios Móviles

## 📋 Descripción del Proyecto

Plataforma de intermediación de servicios móviles (Gig Economy) que conecta clientes con trabajadores (taskers) para servicios express y especializados.

## 🛠️ Stack Tecnológico

- **Backend:** Node.js + Express.js
- **Base de Datos:** JSON (MVP) / PostgreSQL (futuro)
- **Autenticación:** JWT (JSON Web Tokens)
- **Frontend:** HTML/CSS/JS (básico para pruebas) + React Native (pendiente para Fase 2)

## 📦 Requisitos Previos
Antes de comenzar, necesitas tener instalado:

1. **Node.js** (versión 16 o superior)
   - Descarga desde: https://nodejs.org/
   - Verifica instalación: `node --version`

2. **PostgreSQL** (versión 12 o superior)
   - Descarga desde: https://www.postgresql.org/download/
   - Durante la instalación, anota la contraseña que configures para el usuario `postgres`

3. **Git** (opcional, para control de versiones)
   - Descarga desde: https://git-scm.com/

## 🚀 Instalación y Configuración (Paso a Paso)
### Paso 1: Instalar Dependencias del Backend

Abre una terminal en la carpeta del proyecto y ejecuta:

```bash
cd backend
npm install
```

Esto instalará todas las dependencias necesarias (Express, Sequelize, JWT, etc.)

### Paso 2: Configurar PostgreSQL

1. Abre **pgAdmin** (viene con PostgreSQL) o usa la línea de comandos
2. Crea      nueva base de datos llamada `ayuda_al_toque`:
   - En pgAdmin: Click derecho en "Databases" → Create → Database → Nombre: `ayuda_al_toque`
   - O desde terminal: `createdb ayuda_al_toque`

### Paso 3: Configurar Variables de Entorno

1. En la carpeta `backend`, copia el archivo `env.example` y renómbralo a `.env`:
   ```bash
   copy env.example .env
   ```
   (En Linux/Mac sería: `cp env.example .env`)

2. Abre el archivo `.env` y completa los valores:
   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=ayuda_al_toque
   DB_USER=postgres
   DB_PASSWORD=tu_contraseña_de_postgres
   JWT_SECRET=tu_clave_secreta_super_segura_aqui
   PORT=3000
   ```

   **Importante:**
   - Reemplaza `tu_contraseña_de_postgres` con la contraseña que configuraste al instalar PostgreSQL
   - Reemplaza `tu_clave_secreta_super_segura_aqui` con una cadena aleatoria segura (puede ser cualquier texto largo)

### Paso 4: Crear las Tablas en la Base de Datos

Ejecuta el siguiente comando para crear todas las tablas automáticamente:

```bash
cd backend
npm run sync-db
```

Este comando creará las tablas: `UsuarioClientes`, `Taskers`, y `Tareas` en tu base de datos.

### Paso 5: Iniciar el Servidor Backend

```bash
cd backend
npm start
```

Si todo está bien configurado, verás un mensaje como:
```
✅ Servidor corriendo en http://localhost:3000
✅ Base de datos conectada correctamente
```

### Paso 6: (Opcional) Iniciar el Frontend Web

Para probar la aplicación con una interfaz web básica:

```bash
cd frontend
npm start
```

Luego abre: `http://localhost:8080`

Este frontend permite registrar usuarios, iniciar sesión y crear tareas de forma visual.

## 📡 Endpoints Disponibles

### Autenticación

- **POST** `/api/auth/register/cliente` - Registro de nuevo cliente
- **POST** `/api/auth/register/tasker` - Registro de nuevo tasker
- **POST** `/api/auth/login` - Login (cliente o tasker)

### Tasker

- **PUT** `/api/tasker/profile/:id` - Actualizar perfil del tasker (requiere JWT)

### Admin

- **PUT** `/api/admin/tasker/verify/:id` - Verificar/aprobar tasker (requiere autenticación admin)

### Tareas

- **POST** `/api/task/create` - Crear nueva tarea (requiere JWT de cliente)

## 🧪 Probar los Endpoints

Puedes usar **Postman** o **Thunder Client** (extensión de VS Code) para probar los endpoints.

### Ejemplo: Registrar un Cliente

**URL:** `POST http://localhost:3000/api/auth/register/cliente`

**Body (JSON):**
```json
{
  "email": "cliente@ejemplo.com",
  "password": "password123",
  "nombre": "Juan",
  "apellido": "Pérez",
  "telefono": "+5491123456789",
  "ubicacion_default": {
    "latitud": -34.6037,
    "longitud": -58.3816,
    "direccion": "Av. Corrientes 1234",
    "ciudad": "Buenos Aires"
  }
}
```

### Ejemplo: Login

**URL:** `POST http://localhost:3000/api/auth/login`

**Body (JSON):**
```json
{
  "email": "cliente@ejemplo.com",
  "password": "password123"
}
```

**Respuesta:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": 1,
    "email": "cliente@ejemplo.com",
    "nombre": "Juan",
    "apellido": "Pérez"
  }
}
```

Usa este `token` en el header `Authorization: Bearer <token>` para acceder a endpoints protegidos.

## 📁 Estructura del Proyecto

```
proyecto/
├── backend/
│   ├── config/
│   │   └── database.js          # Configuración de Sequelize
│   ├── models/
│   │   ├── UsuarioCliente.js    # Modelo de Cliente
│   │   ├── Tasker.js            # Modelo de Tasker
│   │   └── Tarea.js             # Modelo de Tarea
│   ├── routes/
│   │   ├── auth.js              # Rutas de autenticación
│   │   ├── tasker.js            # Rutas de tasker
│   │   ├── admin.js             # Rutas de admin
│   │   └── task.js              # Rutas de tareas
│   ├── middleware/
│   │   └── auth.js              # Middleware de autenticación JWT
│   ├── controllers/
│   │   ├── authController.js    # Lógica de autenticación
│   │   ├── taskerController.js  # Lógica de tasker
│   │   ├── adminController.js   # Lógica de admin
│   │   └── taskController.js    # Lógica de tareas
│   ├── utils/
│   │   └── upload.js            # Utilidades para manejo de archivos
│   ├── .env.example             # Plantilla de variables de entorno
│   ├── .env                     # Variables de entorno (NO subir a Git)
│   ├── server.js                # Archivo principal del servidor
│   └── package.json             # Dependencias del proyecto
├── frontend/                    # Frontend web básico para pruebas
│   ├── index.html               # Página principal
│   ├── styles.css               # Estilos CSS
│   ├── script.js                # Lógica JavaScript
│   ├── server.js                # Servidor del frontend
│   ├── package.json             # Dependencias del frontend
│   └── README.md                # Documentación del frontend
└── README.md                    # Este archivo
```

## 🔒 Seguridad

- Las contraseñas se almacenan con hash (bcrypt)
- Los endpoints protegidos requieren JWT válido
- El archivo `.env` NO debe subirse a Git (está en .gitignore)

## 🐛 Solución de Problemas

### Error: "Cannot find module"
- Ejecuta `npm install` en la carpeta `backend`

### Error: "Connection refused" (PostgreSQL)
- Verifica que PostgreSQL esté corriendo
- Revisa que las credenciales en `.env` sean correctas

### Error: "Table doesn't exist"
- Ejecuta `npm run sync-db` para crear las tablas

## 📝 Próximos Pasos (Fase 2)

- Frontend React Native
- Sistema de notificaciones
- Integración de pagos
- Sistema de calificaciones

## 📞 Soporte

Si tienes problemas, revisa:
1. Que todas las dependencias estén instaladas
2. Que PostgreSQL esté corriendo
3. Que el archivo `.env` esté configurado correctamente
4. Que la base de datos `ayuda_al_toque` exista

