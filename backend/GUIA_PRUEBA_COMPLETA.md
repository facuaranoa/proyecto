# 🧪 Guía Completa de Prueba - Paso a Paso

## 📋 Paso 1: Iniciar el Servidor

Abre una terminal en la carpeta `backend` y ejecuta:

```bash
npm start
```

O si usas Node.js portable:
```bash
C:\Users\faranoa\node-v20.11.0-win-x64\node.exe server.js
```

Deberías ver:
```
✅ Sistema de archivos JSON inicializado correctamente
✅ Servidor corriendo en http://localhost:3000
✅ Base de datos conectada correctamente
```

**⚠️ Deja esta terminal abierta mientras pruebas**

---

## 📋 Paso 2: Probar con Postman o Thunder Client

### **Herramientas Recomendadas:**
- **Postman**: https://www.postman.com/downloads/
- **Thunder Client** (VS Code): Extensión gratuita

---

## 📋 Paso 3: Flujo Completo de Prueba

### **3.1: Login del Admin (Ya Creado)**

**Método:** `POST`  
**URL:** `http://localhost:3000/api/auth/login`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "email": "admin@ayudaaltoque.com",
  "password": "admin123"
}
```

**Respuesta esperada:**
```json
{
  "message": "Login exitoso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": 1,
    "email": "admin@ayudaaltoque.com",
    "nombre": "Admin",
    "apellido": "Sistema",
    "tipo": "admin"
  }
}
```

**✅ Copia el `token` - lo necesitarás después**

---

### **3.2: Registrar un Tasker**

**Método:** `POST`  
**URL:** `http://localhost:3000/api/auth/register/tasker`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "email": "tasker@test.com",
  "password": "password123",
  "nombre": "María",
  "apellido": "González",
  "telefono": "+5491123456789",
  "cuit": "20-12345678-9",
  "monotributista_check": true,
  "terminos_aceptados": true
}
```

**Respuesta esperada:**
```json
{
  "message": "Tasker registrado exitosamente",
  "usuario": {
    "id": 1,
    "email": "tasker@test.com",
    "nombre": "María",
    "apellido": "González",
    "aprobado_admin": false
  }
}
```

**✅ Anota el `id` del tasker (ej: 1)**

---

### **3.3: Aprobar el Tasker (Como Admin)**

**Método:** `PUT`  
**URL:** `http://localhost:3000/api/admin/tasker/verify/1`  
*(Reemplaza `1` con el ID del tasker)*

**Headers:**
```
Content-Type: application/json
Authorization: Bearer TU_TOKEN_DE_ADMIN_AQUI
```

**Body (JSON):**
```json
{
  "aprobado": true
}
```

**Respuesta esperada:**
```json
{
  "message": "Tasker aprobado exitosamente",
  "tasker": {
    "id": 1,
    "email": "tasker@test.com",
    "nombre": "María",
    "apellido": "González",
    "aprobado_admin": true
  }
}
```

**✅ Tasker aprobado!**

---

### **3.4: Login del Tasker**

**Método:** `POST`  
**URL:** `http://localhost:3000/api/auth/login`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "email": "tasker@test.com",
  "password": "password123"
}
```

**Respuesta esperada:**
```json
{
  "message": "Login exitoso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": 1,
    "email": "tasker@test.com",
    "tipo": "tasker",
    "aprobado_admin": true
  }
}
```

**✅ Copia el `token` del tasker**

---

### **3.5: Login del Cliente (o Crear uno Nuevo)**

**Opción A: Usar Cliente Existente**

**Método:** `POST`  
**URL:** `http://localhost:3000/api/auth/login`

**Body (JSON):**
```json
{
  "email": "facuaranoa1@gmail.com",
  "password": "TU_CONTRASEÑA_AQUI"
}
```

**Opción B: Crear Nuevo Cliente**

**Método:** `POST`  
**URL:** `http://localhost:3000/api/auth/register/cliente`

**Body (JSON):**
```json
{
  "email": "cliente@test.com",
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

Luego haz login con ese cliente.

**✅ Copia el `token` del cliente**

---

### **3.6: Crear una Tarea (Como Cliente)**

**Método:** `POST`  
**URL:** `http://localhost:3000/api/task/create`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer TU_TOKEN_DE_CLIENTE_AQUI
```

**Body (JSON):**
```json
{
  "tipo_servicio": "EXPRESS",
  "descripcion": "Necesito ayuda para mudanza",
  "ubicacion": {
    "latitud": -34.6037,
    "longitud": -58.3816,
    "direccion": "Av. Corrientes 1234",
    "ciudad": "Buenos Aires"
  },
  "fecha_hora_requerida": "2024-12-25T10:00:00.000Z",
  "requiere_licencia": false,
  "monto_total_acordado": 5000
}
```

**Respuesta esperada:**
```json
{
  "message": "Tarea creada exitosamente",
  "tarea": {
    "id": 1,
    "cliente_id": 1,
    "tipo_servicio": "EXPRESS",
    "descripcion": "Necesito ayuda para mudanza",
    "estado": "PENDIENTE",
    "comision_app": 0.05,
    "monto_tasker_neto": 4750
  }
}
```

**✅ Anota el `id` de la tarea (ej: 1)**

---

### **3.7: Ver Tareas Disponibles (Como Tasker)**

**Método:** `GET`  
**URL:** `http://localhost:3000/api/task/available`

**Headers:**
```
Authorization: Bearer TU_TOKEN_DE_TASKER_AQUI
```

**Respuesta esperada:**
```json
{
  "message": "Tareas disponibles obtenidas exitosamente",
  "tareas": [
    {
      "id": 1,
      "tipo_servicio": "EXPRESS",
      "descripcion": "Necesito ayuda para mudanza",
      "monto_total_acordado": 5000,
      "estado": "PENDIENTE"
    }
  ]
}
```

---

### **3.8: Aplicar a la Tarea (NUEVO ENDPOINT) ⭐**

**Método:** `POST`  
**URL:** `http://localhost:3000/api/task/apply/1`  
*(Reemplaza `1` con el ID de la tarea)*

**Headers:**
```
Content-Type: application/json
Authorization: Bearer TU_TOKEN_DE_TASKER_AQUI
```

**Body:** (vacío, no necesita body)

**Respuesta esperada:**
```json
{
  "message": "Aplicación enviada exitosamente",
  "aplicacion": {
    "id": 1,
    "tarea_id": 1,
    "estado": "PENDIENTE",
    "createdAt": "2024-12-20T10:00:00.000Z"
  }
}
```

**✅ ¡Éxito! La aplicación se creó correctamente.**

---

## 🔍 Verificar que Funcionó

Abre el archivo:
```
backend/data/solicitudesTareas.json
```

Deberías ver algo como:
```json
[
  {
    "id": 1,
    "tarea_id": 1,
    "tasker_id": 1,
    "cliente_id": 1,
    "tipo": "APLICACION",
    "estado": "PENDIENTE",
    "createdAt": "2024-12-20T10:00:00.000Z"
  }
]
```

---

## ❌ Errores Comunes y Soluciones

### **Error 403: "Solo los taskers pueden aplicar a tareas"**
- ✅ Verifica que estés usando el token del **tasker**, no del cliente

### **Error 403: "Tu cuenta debe estar aprobada por un administrador"**
- ✅ Asegúrate de haber aprobado el tasker en el paso 3.3

### **Error 401: "Token de autenticación requerido"**
- ✅ Verifica que el header `Authorization` tenga el formato: `Bearer TU_TOKEN_AQUI`
- ✅ Asegúrate de que el token no haya expirado (7 días)

### **Error 400: "Ya has aplicado a esta tarea"**
- ✅ El tasker ya aplicó antes. Prueba con otra tarea o con otro tasker.

### **Error 404: "Tarea no encontrada"**
- ✅ Verifica que el ID de la tarea sea correcto
- ✅ Asegúrate de haber creado la tarea primero

### **Error 400: "Esta tarea ya no está disponible"**
- ✅ La tarea ya no está en estado PENDIENTE (probablemente ya está ASIGNADA)

---

## 📝 Resumen de Endpoints Probados

✅ **POST** `/api/auth/login` - Login (admin, cliente, tasker)  
✅ **POST** `/api/auth/register/tasker` - Registrar tasker  
✅ **PUT** `/api/admin/tasker/verify/:id` - Aprobar tasker (admin)  
✅ **POST** `/api/task/create` - Crear tarea (cliente)  
✅ **GET** `/api/task/available` - Ver tareas disponibles (tasker)  
✅ **POST** `/api/task/apply/:id` - Aplicar a tarea (tasker) ⭐ **NUEVO**

---

## 🎯 Próximos Pasos

Después de probar esto, podemos implementar:
- Endpoint para que cliente envíe solicitud a tasker(s)
- Endpoint para que tasker acepte/rechace solicitud
- Endpoint para marcar tarea como finalizada
- Sistema de calificaciones

---

**¡Listo para probar! 🚀**

