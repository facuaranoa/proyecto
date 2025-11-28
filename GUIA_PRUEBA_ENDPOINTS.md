# 🧪 Guía para Probar los Endpoints

## 📋 Paso 1: Iniciar el Servidor

Abre una terminal en la carpeta `backend` y ejecuta:

```bash
cd backend
npm start
```

Deberías ver:
```
✅ Sistema de archivos JSON inicializado correctamente
✅ Servidor corriendo en http://localhost:3000
✅ Base de datos conectada correctamente
```

---

## 🧪 Paso 2: Probar el Nuevo Endpoint de Aplicar a Tareas

### **Requisitos Previos:**

Necesitas tener:
1. ✅ Un **cliente** registrado
2. ✅ Un **tasker** registrado y **aprobado por admin**
3. ✅ Una **tarea** creada por el cliente

---

### **Paso 2.1: Registrar un Cliente**

**URL:** `POST http://localhost:3000/api/auth/register/cliente`

**Headers:**
```
Content-Type: application/json
```

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

**Respuesta esperada:**
```json
{
  "message": "Cliente registrado exitosamente",
  "usuario": {
    "id": 1,
    "email": "cliente@test.com",
    "nombre": "Juan",
    "apellido": "Pérez"
  }
}
```

**Guarda el `id` del cliente (ej: 1)**

---

### **Paso 2.2: Registrar un Tasker**

**URL:** `POST http://localhost:3000/api/auth/register/tasker`

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

**Guarda el `id` del tasker (ej: 1)**

---

### **Paso 2.3: Aprobar el Tasker (como Admin)**

**URL:** `PUT http://localhost:3000/api/admin/tasker/verify/1`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer ADMIN_TOKEN
```

**Nota:** Necesitas un token de admin. Por ahora puedes modificar temporalmente el middleware de auth o crear un admin.

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
    "aprobado_admin": true
  }
}
```

---

### **Paso 2.4: Login del Cliente**

**URL:** `POST http://localhost:3000/api/auth/login`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "email": "cliente@test.com",
  "password": "password123"
}
```

**Respuesta esperada:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": 1,
    "email": "cliente@test.com",
    "tipo": "cliente"
  }
}
```

**Guarda el `token` del cliente**

---

### **Paso 2.5: Crear una Tarea (como Cliente)**

**URL:** `POST http://localhost:3000/api/task/create`

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

**Guarda el `id` de la tarea (ej: 1)**

---

### **Paso 2.6: Login del Tasker**

**URL:** `POST http://localhost:3000/api/auth/login`

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
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": 1,
    "email": "tasker@test.com",
    "tipo": "tasker"
  }
}
```

**Guarda el `token` del tasker**

---

### **Paso 2.7: Ver Tareas Disponibles (como Tasker)**

**URL:** `GET http://localhost:3000/api/task/available`

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

### **Paso 2.8: Aplicar a la Tarea (NUEVO ENDPOINT) ⭐**

**URL:** `POST http://localhost:3000/api/task/apply/1`

**Headers:**
```
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

### **Ver las Aplicaciones (Futuro endpoint)**

Por ahora puedes verificar en el archivo:
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

## ❌ Errores Comunes

### **Error 403: "Solo los taskers pueden aplicar a tareas"**
- ✅ Verifica que estés usando el token del **tasker**, no del cliente

### **Error 403: "Tu cuenta debe estar aprobada por un administrador"**
- ✅ Asegúrate de haber aprobado el tasker con el endpoint de admin

### **Error 400: "Ya has aplicado a esta tarea"**
- ✅ El tasker ya aplicó antes. Prueba con otra tarea o con otro tasker.

### **Error 404: "Tarea no encontrada"**
- ✅ Verifica que el ID de la tarea sea correcto
- ✅ Asegúrate de haber creado la tarea primero

### **Error 400: "Esta tarea ya no está disponible"**
- ✅ La tarea ya no está en estado PENDIENTE (probablemente ya está ASIGNADA)

---

## 🛠️ Herramientas para Probar

### **Opción 1: Postman**
1. Descarga: https://www.postman.com/downloads/
2. Crea una nueva petición
3. Configura método, URL, headers y body
4. Envía la petición

### **Opción 2: Thunder Client (VS Code)**
1. Instala la extensión "Thunder Client" en VS Code
2. Abre Thunder Client desde el panel lateral
3. Crea una nueva petición
4. Configura y envía

### **Opción 3: cURL (Terminal)**
```bash
curl -X POST http://localhost:3000/api/task/apply/1 \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -H "Content-Type: application/json"
```

---

## 📝 Notas

- El sistema usa **archivos JSON** (no PostgreSQL), así que los datos se guardan en `backend/data/`
- Los tokens JWT expiran después de 7 días
- La comisión ahora es **5%** (actualizada)
- Los estados de tarea son: PENDIENTE, ASIGNADA, PENDIENTE_PAGO, FINALIZADA, CANCELADA

---

**¡Listo para probar! 🚀**

