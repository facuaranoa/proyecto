# 🔐 Cómo Crear un Usuario Admin

## 📋 Opción 1: Usar el Script (Recomendado)

Ejecuta el script desde la carpeta `backend`:

```bash
node scripts/crear-admin.js
```

Esto creará un admin con:
- **Email:** `admin@ayudaaltoque.com`
- **Password:** `admin123`
- **Nombre:** Admin Sistema

**⚠️ Recuerda cambiar la contraseña después del primer login!**

---

## 📋 Opción 2: Crear Manualmente

Si quieres crear un admin con datos diferentes, edita el archivo `backend/scripts/crear-admin.js` y cambia:

```javascript
const adminData = {
  email: 'tu-email@ejemplo.com',
  password: 'tu-contraseña-segura',
  nombre: 'Tu Nombre',
  apellido: 'Tu Apellido',
  telefono: '+5491123456789'
};
```

Luego ejecuta:
```bash
node scripts/crear-admin.js
```

---

## 🔑 Cómo Hacer Login como Admin

**URL:** `POST http://localhost:3000/api/auth/login`

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

**Guarda el `token` para usar en endpoints de admin**

---

## ✅ Usar el Token de Admin

Para aprobar un tasker, usa el token en el header:

**URL:** `PUT http://localhost:3000/api/admin/tasker/verify/1`

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

---

## 📝 Notas

- El admin se guarda en `backend/data/admins.json`
- El admin puede hacer login igual que clientes y taskers
- El token JWT incluye `tipo: "admin"` para identificar permisos
- El middleware `authenticateAdmin` verifica que el usuario sea admin

---

**¡Listo! 🚀**

