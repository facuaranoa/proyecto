# 🧪 Instrucciones para Probar el Frontend

## 📋 Requisitos Previos

1. **Backend debe estar corriendo** en `http://localhost:3000`
   ```bash
   cd backend
   node server.js
   ```

2. **Frontend debe estar corriendo** en `http://localhost:8080`
   ```bash
   cd frontend
   node server.js
   ```

3. **Admin debe estar creado** (si no existe, ejecutar):
   ```bash
   cd backend
   node scripts/crear-admin.js
   ```

## 🔑 Credenciales de Prueba

### Admin
- **Email:** `admin@ayudaaltoque.com`
- **Password:** `admin123`

## 🧪 Flujo de Prueba Completo

### 1. Login como Admin
1. Abrir `http://localhost:8080` en el navegador
2. Ir a la pestaña **"Login"**
3. Ingresar credenciales de admin
4. Deberías ver el **Panel de Administración** automáticamente
5. Los taskers pendientes se cargarán automáticamente

### 2. Aprobar un Tasker
1. En el panel admin, verás la lista de taskers pendientes
2. Click en **"✅ Aprobar Tasker"** en cualquier tasker
3. El tasker será aprobado y desaparecerá de la lista

### 3. Registrar un Cliente
1. Cerrar sesión (botón **"🚪 Salir"**)
2. Ir a la pestaña **"Registro"**
3. Seleccionar **"Cliente"** en el dropdown
4. Completar el formulario:
   - Email: `cliente@test.com`
   - Password: `password123`
   - Nombre, Apellido, Teléfono
   - Ubicación (puedes usar valores por defecto)
5. Aceptar términos y condiciones
6. Click en **"Registrar Cliente"**

### 4. Registrar un Tasker
1. En la pestaña **"Registro"**, cambiar a **"Tasker"** en el dropdown
2. Completar el formulario:
   - Email: `tasker@test.com`
   - Password: `password123`
   - Nombre, Apellido, Teléfono
   - Especialidad (ej: Plomero)
   - CUIT (opcional)
   - Marcar "Soy monotributista" si aplica
3. Aceptar términos y condiciones
4. Click en **"Registrar Tasker"**

### 5. Aprobar el Tasker (como Admin)
1. Login como admin nuevamente
2. Verás el tasker recién registrado en la lista de pendientes
3. Click en **"✅ Aprobar Tasker"**

### 6. Crear una Tarea (como Cliente)
1. Login como cliente (`cliente@test.com` / `password123`)
2. Deberías ver la sección **"➕ Crear Nueva Tarea"**
3. Seguir el wizard:
   - **Paso 1:** Seleccionar tipo de servicio (Express o Especialista)
   - **Paso 2:** Completar título y descripción
   - **Paso 3:** Seleccionar fecha y hora
   - **Paso 4:** Completar ubicación y presupuesto
4. Click en **"Crear Tarea"**
5. La tarea aparecerá en **"Mis Tareas"**

### 7. Aplicar a Tarea (como Tasker)
1. Login como tasker (`tasker@test.com` / `password123`)
2. Deberías ver la sección **"📋 Tareas Disponibles"**
3. Verás la tarea creada por el cliente
4. Click en **"📝 Aplicar a Tarea"**
5. Confirmar la aplicación
6. Verás un mensaje de éxito

## ✅ Funcionalidades Implementadas

- ✅ Login de Admin, Cliente y Tasker
- ✅ Panel de administración con lista de taskers pendientes
- ✅ Aprobar/Rechazar taskers desde el panel admin
- ✅ Registro de clientes y taskers
- ✅ Creación de tareas (wizard completo)
- ✅ Aplicación de taskers a tareas
- ✅ Visualización de tareas disponibles para taskers
- ✅ Visualización de mis tareas para clientes

## 🐛 Solución de Problemas

### El servidor no responde
- Verifica que ambos servidores estén corriendo
- Revisa la consola del backend por errores

### No puedo hacer login como admin
- Ejecuta `node backend/scripts/crear-admin.js` para crear el admin
- Verifica que el servidor backend se haya reiniciado después de crear el admin

### No veo taskers en el panel admin
- Asegúrate de haber registrado al menos un tasker
- Verifica que el tasker no haya sido aprobado ya

### No puedo aplicar a tareas
- Verifica que el tasker esté aprobado por el admin
- Verifica que la tarea esté en estado "PENDIENTE"

## 📝 Notas

- Los datos se guardan en archivos JSON en `backend/data/`
- Cada vez que reinicies el servidor, los datos persisten
- Para limpiar datos, puedes eliminar los archivos JSON (se recrearán vacíos)

