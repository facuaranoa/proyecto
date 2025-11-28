# 🚀 Ayuda Al Toque - MVP Plataforma de Intermediación de Servicios Móviles

## 📋 Descripción del Proyecto

Plataforma de intermediación de servicios móviles (Gig Economy) que conecta clientes con trabajadores (taskers) para servicios express y especializados.

## 🛠️ Stack Tecnológico

- **Backend:** Node.js + Express.js
- **Base de Datos:** JSON (sistema de archivos) - fácil migración a PostgreSQL
- **Autenticación:** JWT (JSON Web Tokens)
- **Frontend:** HTML/CSS/JS (interfaz web completa para pruebas)
- **Futuro:** React Native para app móvil

## 📦 Requisitos Previos
Antes de comenzar, necesitas tener instalado:

1. **Node.js** (versión 16 o superior)
   - Descarga desde: https://nodejs.org/
   - Verifica instalación: `node --version`
   - **Nota:** El proyecto actualmente usa JSON como base de datos, no requiere PostgreSQL

2. **Git** (opcional, para control de versiones)
   - Descarga desde: https://git-scm.com/

## 🚀 Instalación y Configuración (Paso a Paso)
### Paso 1: Instalar Dependencias del Backend

Abre una terminal en la carpeta del proyecto y ejecuta:

```bash
cd backend
npm install
```

Esto instalará todas las dependencias necesarias (Express, JWT, bcrypt, etc.)

### Paso 2: Configurar Variables de Entorno

1. En la carpeta `backend`, copia el archivo `env.example` y renómbralo a `.env`:
   ```bash
   copy env.example .env
   ```
   (En Linux/Mac sería: `cp env.example .env`)

2. Abre el archivo `.env` y completa los valores:
   ```
   JWT_SECRET=tu_clave_secreta_super_segura_aqui
   PORT=3000
   ```

   **Importante:**
   - Reemplaza `tu_clave_secreta_super_segura_aqui` con una cadena aleatoria segura (puede ser cualquier texto largo)
   - El sistema usa JSON como base de datos, no requiere configuración de PostgreSQL

### Paso 3: Instalar Dependencias del Frontend

```bash
cd frontend
npm install
```

### Paso 4: Iniciar el Servidor Backend

```bash
cd backend
npm start
```

Si todo está bien configurado, verás un mensaje como:
```
✅ Servidor corriendo en http://localhost:3000
✅ Base de datos conectada correctamente
```

### Paso 5: Iniciar el Frontend Web

En otra terminal, inicia el servidor frontend:

```bash
cd frontend
npm start
```

Luego abre: `http://localhost:8080`

**Nota:** Si `node` no está en tu PATH, usa la ruta completa:
```powershell
# Windows PowerShell
& "C:\Users\faranoa\node-v20.11.0-win-x64\node.exe" server.js
```

Este frontend permite:
- Registrar usuarios (clientes y taskers)
- Iniciar sesión
- Crear y gestionar tareas
- Aplicar a tareas (taskers)
- Aceptar aplicaciones (clientes)
- Gestionar el ciclo de vida completo de las tareas
- Calificar servicios

## 📡 Endpoints Disponibles

### Autenticación

- **POST** `/api/auth/register/cliente` - Registro de nuevo cliente
- **POST** `/api/auth/register/tasker` - Registro de nuevo tasker
- **POST** `/api/auth/login` - Login (cliente o tasker)

### Tasker

- **PUT** `/api/tasker/profile/:id` - Actualizar perfil del tasker (requiere JWT)

### Admin

- **GET** `/api/admin/taskers` - Listar todos los taskers (requiere autenticación admin)
- **PUT** `/api/admin/tasker/verify/:id` - Verificar/aprobar tasker (requiere autenticación admin)

### Tareas

- **POST** `/api/task/create` - Crear nueva tarea (requiere JWT de cliente)
- **GET** `/api/task/my-tasks` - Obtener tareas del cliente actual (requiere JWT de cliente)
- **GET** `/api/task/available` - Obtener tareas disponibles para taskers (requiere JWT de tasker aprobado)
- **POST** `/api/task/apply/:id` - Tasker aplica a una tarea (requiere JWT de tasker aprobado)
- **GET** `/api/task/applications/:tareaId` - Cliente ve las aplicaciones a su tarea (requiere JWT de cliente)
- **POST** `/api/task/accept-application/:applicationId` - Cliente acepta una aplicación (requiere JWT de cliente)
- **GET** `/api/task/my-assigned-tasks` - Tasker ve sus tareas asignadas (requiere JWT de tasker)
- **POST** `/api/task/start/:id` - Tasker marca tarea como "en proceso" (requiere JWT de tasker)
- **POST** `/api/task/complete/:id` - Tasker marca tarea como finalizada (requiere JWT de tasker)
- **POST** `/api/task/confirm-payment/:id` - Cliente confirma pago (requiere JWT de cliente)
- **POST** `/api/task/confirm-payment-received/:id` - Tasker confirma recepción de pago (requiere JWT de tasker)

### Calificaciones

- **POST** `/api/rating/create` - Crear una calificación (requiere JWT)
- **GET** `/api/rating/user/:userId?tipo=cliente|tasker` - Obtener calificaciones de un usuario
- **GET** `/api/rating/task/:tareaId` - Obtener calificaciones de una tarea específica (requiere JWT)

## 🔄 Ciclo de Vida de las Tareas

Las tareas pasan por los siguientes estados:

1. **PENDIENTE** - Tarea creada, esperando aplicaciones de taskers
2. **ASIGNADA** - Cliente aceptó la aplicación de un tasker
3. **EN_PROCESO** - Tasker inició el trabajo
4. **PENDIENTE_PAGO** - Tasker completó el trabajo, esperando confirmación de pago del cliente
5. **FINALIZADA** - Cliente confirmó el pago
6. **CANCELADA** - Tarea cancelada (por cliente o tasker)

**Auto-confirmación:** Si el cliente no confirma el pago en 48 horas, la tarea se marca automáticamente como `FINALIZADA` con `auto_confirmado: true`.

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
│   │   ├── database.js          # Configuración (legacy PostgreSQL)
│   │   └── database-json.js     # Sistema de almacenamiento JSON
│   ├── models/
│   │   ├── UsuarioCliente.json.js    # Modelo de Cliente (JSON)
│   │   ├── Tasker.json.js            # Modelo de Tasker (JSON)
│   │   ├── Tarea.json.js             # Modelo de Tarea (JSON)
│   │   ├── Admin.json.js             # Modelo de Admin (JSON)
│   │   ├── Calificacion.json.js      # Modelo de Calificación (JSON)
│   │   └── SolicitudTarea.json.js    # Modelo de Solicitud/Aplicación (JSON)
│   ├── routes/
│   │   ├── auth.js              # Rutas de autenticación
│   │   ├── tasker.js            # Rutas de tasker
│   │   ├── admin.js             # Rutas de admin
│   │   ├── task.js              # Rutas de tareas
│   │   └── rating.js            # Rutas de calificaciones
│   ├── middleware/
│   │   └── auth.js              # Middleware de autenticación JWT
│   ├── controllers/
│   │   ├── authController.js    # Lógica de autenticación
│   │   ├── taskerController.js  # Lógica de tasker
│   │   ├── adminController.js   # Lógica de admin
│   │   ├── taskController.js    # Lógica de tareas
│   │   └── ratingController.js  # Lógica de calificaciones
│   ├── utils/
│   │   ├── upload.js            # Utilidades para manejo de archivos
│   │   └── autoConfirmPayment.js # Auto-confirmación de pagos
│   ├── data/                    # Archivos JSON (base de datos)
│   │   ├── usuarios_clientes.json
│   │   ├── taskers.json
│   │   ├── tareas.json
│   │   ├── admins.json
│   │   ├── calificaciones.json
│   │   └── solicitudes_tareas.json
│   ├── .env.example             # Plantilla de variables de entorno
│   ├── .env                     # Variables de entorno (NO subir a Git)
│   ├── server.js                # Archivo principal del servidor
│   └── package.json             # Dependencias del proyecto
├── frontend/                    # Frontend web completo para pruebas
│   ├── index.html               # Página principal
│   ├── styles.css               # Estilos CSS
│   ├── script.js                # Lógica JavaScript completa
│   ├── server.js                # Servidor del frontend
│   ├── package.json             # Dependencias del frontend
│   └── README.md                # Documentación del frontend
└── README.md                    # Este archivo
```

## ✨ Funcionalidades Implementadas

### Para Clientes
- ✅ Registro e inicio de sesión
- ✅ Crear tareas (EXPRESS o ESPECIALISTA)
- ✅ Ver aplicaciones de taskers a sus tareas
- ✅ Aceptar aplicaciones de taskers
- ✅ Ver tareas pendientes, asignadas, en proceso e historial
- ✅ Confirmar pago después de completar el trabajo
- ✅ Calificar taskers después de finalizar la tarea
- ✅ Ver detalles completos de tareas en modal

### Para Taskers
- ✅ Registro e inicio de sesión
- ✅ Actualizar perfil y disponibilidad
- ✅ Ver tareas disponibles y aplicar a ellas
- ✅ Ver tareas asignadas y en proceso
- ✅ Marcar tarea como "en proceso" al iniciar
- ✅ Marcar tarea como "completada" al terminar
- ✅ Confirmar recepción de pago
- ✅ Ver historial de todas sus tareas
- ✅ Calificar clientes después de finalizar la tarea

### Para Administradores
- ✅ Ver lista de taskers pendientes de aprobación
- ✅ Aprobar/rechazar taskers
- ✅ Ver todos los taskers del sistema

### Sistema Automático
- ✅ Auto-confirmación de pagos después de 48 horas
- ✅ Cálculo automático de comisiones (5% por defecto)
- ✅ Gestión completa del ciclo de vida de tareas

## 🔒 Seguridad

- Las contraseñas se almacenan con hash (bcrypt)
- Los endpoints protegidos requieren JWT válido
- El archivo `.env` NO debe subirse a Git (está en .gitignore)
- Los archivos de datos JSON están en `.gitignore`
- Validación de permisos por rol (cliente/tasker/admin)

## 🐛 Solución de Problemas

### Error: "Cannot find module"
- Ejecuta `npm install` en las carpetas `backend` y `frontend`

### Error: "node no se reconoce como comando"
- Usa la ruta completa a Node.js: `C:\Users\faranoa\node-v20.11.0-win-x64\node.exe`
- O agrega Node.js a tu PATH del sistema

### Error: "Connection refused" (localhost)
- Verifica que ambos servidores estén corriendo:
  - Backend en puerto 3000
  - Frontend en puerto 8080
- Revisa las ventanas de PowerShell para ver errores

### Error: "La ruta X no existe"
- Reinicia el servidor backend después de agregar nuevas rutas
- Verifica que la ruta esté correctamente definida en `backend/routes/`

## 📝 Próximos Pasos (Fase 2)

- [ ] Frontend React Native para app móvil
- [ ] Sistema de notificaciones push
- [ ] Integración de pagos reales (Mercado Pago, Stripe)
- [ ] Sistema de chat/mensajería entre cliente y tasker
- [ ] Sistema de cancelaciones con reembolsos
- [ ] Migración a PostgreSQL para producción
- [ ] Sistema de geolocalización en tiempo real
- [ ] PWA (Progressive Web App) para instalación en móviles

## 📞 Soporte

Si tienes problemas, revisa:
1. Que todas las dependencias estén instaladas (`npm install` en backend y frontend)
2. Que ambos servidores estén corriendo (backend:3000, frontend:8080)
3. Que el archivo `.env` esté configurado correctamente
4. Que los archivos JSON en `backend/data/` existan (se crean automáticamente)

## 📄 Licencia

Este proyecto es un MVP en desarrollo.

