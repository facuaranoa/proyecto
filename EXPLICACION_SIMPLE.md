# 📚 Explicación Simple del Proyecto "Ayuda Al Toque"

## 🎯 ¿Qué es este proyecto?

Imagina una aplicación como **Uber** o **Rappi**, pero para servicios generales:
- Un **cliente** necesita que alguien le haga algo (ej: arreglar algo, hacer una mudanza, etc.)
- Un **tasker** (trabajador) ofrece hacer ese trabajo
- La **aplicación** los conecta y cobra una comisión

Por ahora solo tenemos el **backend** (la parte que funciona "detrás de escena"). La app móvil la haremos después.

---

## 🏗️ ¿Qué partes tiene el proyecto?

### 1. **Base de Datos (PostgreSQL)**
Es como un **Excel gigante** donde guardamos toda la información:
- Lista de clientes
- Lista de trabajadores (taskers)
- Lista de tareas/servicios

**Archivos importantes:**
- `backend/models/UsuarioCliente.js` → Define cómo es un cliente
- `backend/models/Tasker.js` → Define cómo es un trabajador
- `backend/models/Tarea.js` → Define cómo es una tarea/servicio

### 2. **Servidor (Node.js + Express)**
Es como un **mesero en un restaurante**:
- Recibe pedidos (peticiones HTTP)
- Va a la base de datos a buscar información
- Devuelve respuestas

**Archivo principal:**
- `backend/server.js` → Inicia el servidor y conecta todo

### 3. **Rutas (Endpoints)**
Son como las **páginas de un sitio web**, pero para aplicaciones:
- Cada ruta tiene una dirección (URL) y hace algo específico

**Ejemplos:**
- `POST /api/auth/register/cliente` → "Registrar un nuevo cliente"
- `POST /api/auth/login` → "Iniciar sesión"
- `POST /api/task/create` → "Crear una nueva tarea"

**Archivos:**
- `backend/routes/auth.js` → Rutas de registro y login
- `backend/routes/tasker.js` → Rutas para trabajadores
- `backend/routes/admin.js` → Rutas para administradores
- `backend/routes/task.js` → Rutas para tareas

### 4. **Controladores (Controllers)**
Son como los **chefs en la cocina**:
- Reciben el pedido de la ruta
- Hacen el trabajo (buscan en la base de datos, validan datos, etc.)
- Preparan la respuesta

**Archivos:**
- `backend/controllers/authController.js` → Lógica de registro/login
- `backend/controllers/taskerController.js` → Lógica de trabajadores
- `backend/controllers/adminController.js` → Lógica de administradores
- `backend/controllers/taskController.js` → Lógica de tareas

### 5. **Middleware (Autenticación)**
Es como un **guarda de seguridad**:
- Verifica que tengas permiso para entrar
- Si no tienes permiso, te bloquea

**Archivo:**
- `backend/middleware/auth.js` → Verifica tokens JWT (como un pase de entrada)

---

## 🔄 ¿Cómo funciona el flujo?

### Ejemplo: Registrar un Cliente

1. **Cliente** envía datos desde su app: nombre, email, contraseña, etc.
2. **Ruta** (`/api/auth/register/cliente`) recibe la petición
3. **Controller** (`authController.js`) valida los datos:
   - ¿El email ya existe?
   - ¿La contraseña es segura?
   - ¿Todos los campos están completos?
4. Si todo está bien:
   - Encripta la contraseña (por seguridad)
   - Guarda el cliente en la **base de datos**
   - Genera un **token JWT** (como un pase de entrada)
   - Devuelve respuesta exitosa
5. Si hay error:
   - Devuelve mensaje de error

### Ejemplo: Crear una Tarea

1. **Cliente** quiere crear una tarea (ej: "Necesito que me arreglen el aire acondicionado")
2. **Ruta** (`/api/task/create`) recibe la petición
3. **Middleware** verifica que tenga un token válido (que esté logueado)
4. **Controller** (`taskController.js`):
   - Verifica que sea un cliente (no un tasker)
   - Valida los datos (descripción, ubicación, monto, etc.)
   - Calcula la comisión (20%)
   - Guarda la tarea en la **base de datos** con estado "PENDIENTE"
5. Devuelve la tarea creada

---

## 📊 ¿Qué información guardamos?

### Cliente (UsuarioCliente)
```
- Email y contraseña (encriptada)
- Nombre y apellido
- Teléfono
- Ubicación por defecto (dirección, coordenadas)
```

### Tasker (Trabajador)
```
- Email y contraseña (encriptada)
- Nombre y apellido
- Teléfono
- CUIT (número de identificación fiscal)
- ¿Es monotributista? (Sí/No)
- ¿Aceptó términos? (Sí/No)
- Archivos: DNI, matrícula (si es especialista), licencia de conducir
- ¿Está aprobado por admin? (empieza en "No")
- ¿Está disponible? (Sí/No)
```

### Tarea
```
- ¿Quién la pidió? (cliente_id)
- ¿Quién la va a hacer? (tasker_id - puede estar vacío si no está asignada)
- Tipo: EXPRESS o ESPECIALISTA
- Descripción
- Ubicación (dirección, coordenadas)
- Fecha y hora requerida
- ¿Requiere licencia de conducir?
- Monto total acordado
- Comisión de la app (20%)
- Monto que recibe el tasker (80%)
- Estado: PENDIENTE, ASIGNADA, FINALIZADA, CANCELADA
```

---

## 🔐 Seguridad

### Contraseñas
- **NUNCA** guardamos la contraseña tal cual
- La encriptamos con **bcrypt** (es como ponerla en una caja fuerte)
- Cuando alguien hace login, comparamos la contraseña encriptada

### Tokens JWT
- Cuando alguien hace login, le damos un **token** (como un pase de entrada)
- Este token tiene información: quién es, qué tipo de usuario (cliente/tasker)
- Para acceder a rutas protegidas, debe enviar este token
- El token expira después de 7 días (debe volver a hacer login)

---

## 🛠️ Herramientas que usamos

### Node.js
- Es el "motor" que hace funcionar JavaScript fuera del navegador
- Permite crear servidores

### Express.js
- Es un "framework" (plantilla) para crear servidores web más fácilmente
- Nos da herramientas para crear rutas, manejar peticiones, etc.

### PostgreSQL
- Es una base de datos profesional (como MySQL, pero diferente)
- Guarda la información de forma organizada y segura

### Sequelize
- Es un "traductor" entre JavaScript y PostgreSQL
- Nos permite trabajar con la base de datos usando código JavaScript
- En lugar de escribir SQL complicado, escribimos código más simple

### JWT (JSON Web Tokens)
- Es un sistema para crear "pases de entrada" seguros
- Permite verificar que alguien está autenticado sin guardar sesiones

### bcrypt
- Es una herramienta para encriptar contraseñas
- Es muy segura y difícil de descifrar

---

## 📁 Estructura de Carpetas (Explicación Simple)

```
backend/
├── config/
│   └── database.js          → "Cómo conectarse a la base de datos"
│
├── models/
│   ├── UsuarioCliente.js    → "Cómo es un cliente (qué datos tiene)"
│   ├── Tasker.js            → "Cómo es un trabajador (qué datos tiene)"
│   └── Tarea.js             → "Cómo es una tarea (qué datos tiene)"
│
├── routes/
│   ├── auth.js              → "Rutas de registro y login"
│   ├── tasker.js            → "Rutas para trabajadores"
│   ├── admin.js             → "Rutas para administradores"
│   └── task.js              → "Rutas para tareas"
│
├── controllers/
│   ├── authController.js    → "Lógica de registro y login"
│   ├── taskerController.js  → "Lógica de trabajadores"
│   ├── adminController.js   → "Lógica de administradores"
│   └── taskController.js    → "Lógica de tareas"
│
├── middleware/
│   └── auth.js              → "Verificador de permisos (guarda de seguridad)"
│
├── utils/
│   └── upload.js            → "Herramientas para subir archivos"
│
├── scripts/
│   └── sync-database.js     → "Script para crear las tablas en la base de datos"
│
└── server.js                → "El archivo principal que inicia todo"
```

---

## 🎯 ¿Qué podemos hacer AHORA con lo que tenemos?

### ✅ Funciona:
1. **Registrar clientes** → Un cliente puede crear su cuenta
2. **Registrar taskers** → Un trabajador puede registrarse (sube documentos)
3. **Login** → Ambos pueden iniciar sesión y obtener un token
4. **Actualizar perfil de tasker** → Un tasker puede cambiar su disponibilidad
5. **Aprobar taskers** → Un admin puede aprobar/rechazar taskers
6. **Crear tareas** → Un cliente puede crear una tarea/servicio

### ❌ Aún NO funciona:
- Asignar una tarea a un tasker (solo se crea, pero no se asigna)
- Buscar taskers disponibles
- Notificaciones
- Pagos
- Calificaciones
- La app móvil (solo tenemos el backend)

---

## 💡 Conceptos Clave (Glosario)

- **Backend**: La parte que funciona en el servidor (lo que tenemos ahora)
- **Frontend**: La parte que ve el usuario (la app móvil - aún no la tenemos)
- **API**: Conjunto de rutas/endpoints que permiten comunicarse con el backend
- **Endpoint**: Una dirección URL específica que hace algo (ej: `/api/auth/login`)
- **JWT Token**: Un "pase de entrada" que permite acceder a rutas protegidas
- **Middleware**: Código que se ejecuta antes de llegar al controller (como un filtro)
- **ORM (Sequelize)**: Herramienta que traduce código JavaScript a SQL (lenguaje de bases de datos)
- **Hash/Encriptar**: Convertir texto en algo ilegible por seguridad (ej: "password123" → "aB3$kL9...")

---


