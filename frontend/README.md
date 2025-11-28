# 🌐 Frontend Web - Ayuda Al Toque

Este es un frontend web básico creado para demostrar y probar la funcionalidad de la API de Ayuda Al Toque.

## 🚀 Iniciar el Frontend

1. Asegúrate de que el backend esté corriendo:
   ```bash
   cd backend
   npm start
   ```

2. Inicia el frontend:
   ```bash
   cd frontend
   npm start
   ```

3. Abre tu navegador en: `http://localhost:8080`

## 📱 Funcionalidades Disponibles

### 🔐 Registro de Usuarios
- **Registro de Clientes**: Nombre, apellido, email, teléfono y ubicación
- **Registro de Taskers**: Información profesional + especialidad y tarifa

### 🔑 Inicio de Sesión
- Login para clientes y taskers registrados
- Gestión automática de tokens JWT

### 📋 Gestión de Tareas
- Crear nuevas tareas con detalles completos
- Especificar ubicación, presupuesto y fecha
- Requiere autenticación previa

### 👨‍💼 Panel de Administración
- (Próximamente) Gestión de taskers pendientes de aprobación

## 🛠️ Tecnologías Utilizadas

- **HTML5**: Estructura de la aplicación
- **CSS3**: Estilos modernos con gradientes y animaciones
- **JavaScript (Vanilla)**: Lógica de interacción con la API
- **Express.js**: Servidor para servir archivos estáticos

## 🔗 Conexión con la API

El frontend se conecta automáticamente con la API del backend en `http://localhost:3000`. Todas las peticiones incluyen los headers necesarios para autenticación.

## 📝 Próximos Pasos

Este frontend es una versión básica para pruebas. Para producción, se recomienda:

- **React/Vue.js**: Framework moderno para mejor UX
- **React Native**: App móvil nativa
- **Autenticación avanzada**: Manejo de sesiones persistentes
- **UI/UX mejorada**: Diseño profesional con componentes reutilizables

## 🎯 Cómo Probar

1. Registra un cliente y un tasker
2. Inicia sesión con el cliente
3. Crea una tarea
4. Verifica en pgAdmin que los datos se guardaron correctamente

¡Disfruta probando tu plataforma de servicios! 🚀
