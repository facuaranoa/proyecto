# Sistema de Almacenamiento con Archivos JSON

## 📋 Descripción

Este proyecto ahora usa **archivos JSON** en lugar de PostgreSQL para almacenar los datos. Esto es ideal para desarrollo local y no requiere instalar ni configurar una base de datos.

## 📁 Estructura de Archivos

Los datos se guardan en la carpeta `backend/data/` con los siguientes archivos:

- `usuariosClientes.json` - Datos de los clientes
- `taskers.json` - Datos de los taskers (trabajadores)
- `tareas.json` - Datos de las tareas/servicios

## ✅ Ventajas

- ✅ **No requiere instalación** de PostgreSQL
- ✅ **Fácil de ver y editar** - puedes abrir los archivos JSON directamente
- ✅ **Perfecto para desarrollo local**
- ✅ **Sin configuración** - funciona inmediatamente
- ✅ **Datos portables** - puedes copiar/pegar los archivos fácilmente

## ⚠️ Limitaciones

- ⚠️ **No recomendado para producción** con muchos usuarios simultáneos
- ⚠️ **Rendimiento** puede ser más lento con muchos datos (miles de registros)
- ⚠️ **Sin transacciones** - no hay rollback automático en caso de error

## 🔄 Volver a PostgreSQL

Si quieres volver a usar PostgreSQL:

1. Descomenta el código en `backend/config/database.js`
2. Descomenta los modelos en `backend/models/*.js`
3. Comenta las líneas que exportan los modelos JSON
4. Asegúrate de tener PostgreSQL instalado y configurado

## 📝 Formato de Datos

### usuariosClientes.json
```json
[
  {
    "id": 1,
    "email": "cliente@example.com",
    "password_hash": "$2a$10$...",
    "nombre": "Juan",
    "apellido": "Pérez",
    "telefono": "1234567890",
    "ubicacion_default": {
      "latitud": -34.6037,
      "longitud": -58.3816,
      "direccion": "Av. Corrientes 1234",
      "ciudad": "Buenos Aires"
    },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### taskers.json
```json
[
  {
    "id": 1,
    "email": "tasker@example.com",
    "password_hash": "$2a$10$...",
    "nombre": "María",
    "apellido": "González",
    "telefono": "0987654321",
    "cuit": "20-12345678-9",
    "monotributista_check": true,
    "terminos_aceptados": true,
    "dni_url": "/uploads/dni_123.pdf",
    "aprobado_admin": false,
    "disponible": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### tareas.json
```json
[
  {
    "id": 1,
    "cliente_id": 1,
    "tasker_id": null,
    "tipo_servicio": "EXPRESS",
    "descripcion": "Necesito ayuda para mudanza",
    "ubicacion": {
      "latitud": -34.6037,
      "longitud": -58.3816,
      "direccion": "Av. Corrientes 1234",
      "ciudad": "Buenos Aires"
    },
    "fecha_hora_requerida": "2024-01-15T10:00:00.000Z",
    "requiere_licencia": false,
    "monto_total_acordado": 5000,
    "comision_app": 0.20,
    "estado": "PENDIENTE",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

## 🚀 Uso

El sistema funciona automáticamente. Los archivos se crean automáticamente cuando inicias el servidor por primera vez.

No necesitas hacer nada especial - simplemente usa la API como siempre y los datos se guardarán en los archivos JSON.






