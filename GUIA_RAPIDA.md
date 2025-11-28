# 🚀 Guía Rápida de Inicio

## Pasos Rápidos para Empezar

### 1. Instalar Node.js y PostgreSQL
- **Node.js**: https://nodejs.org/ (descarga la versión LTS)
- **PostgreSQL**: https://www.postgresql.org/download/ (anota la contraseña que configures)

### 2. Crear la Base de Datos
Abre **pgAdmin** (viene con PostgreSQL) y crea una base de datos llamada `ayuda_al_toque`

O desde la terminal:
```bash
createdb ayuda_al_toque
```

### 3. Instalar Dependencias
```bash
cd backend
npm install
```

### 4. Configurar Variables de Entorno
1. Copia `env.example` a `.env`:
   ```bash
   copy env.example .env
   ```

2. Edita el archivo `.env` y completa:
   - `DB_PASSWORD`: Tu contraseña de PostgreSQL
   - `JWT_SECRET`: Cualquier texto largo y seguro (ej: "mi_clave_secreta_123456")

### 5. Crear las Tablas
```bash
npm run sync-db
```

### 6. Iniciar el Servidor
```bash
npm start
```

¡Listo! El servidor estará corriendo en `http://localhost:3000`

## Probar que Funciona

Abre tu navegador o Postman y visita:
```
http://localhost:3000
```

Deberías ver un mensaje JSON con información de la API.

## Registrar un Cliente de Prueba

**URL:** `POST http://localhost:3000/api/auth/register/cliente`

**Body (JSON):**
```json
{
  "email": "test@ejemplo.com",
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

## Problemas Comunes

### "Cannot find module"
→ Ejecuta `npm install` en la carpeta `backend`

### "Connection refused" (PostgreSQL)
→ Verifica que PostgreSQL esté corriendo
→ Revisa que la contraseña en `.env` sea correcta

### "Table doesn't exist"
→ Ejecuta `npm run sync-db`

