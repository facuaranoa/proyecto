/**
 * Servidor Principal - Ayuda Al Toque
 * 
 * Este es el archivo principal que inicia el servidor Express.
 * Configura todas las rutas, middlewares y la conexión a la base de datos.
 */

const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Importar configuración de base de datos
const { testConnection } = require('./config/database');

// Importar modelos (ahora usan JSON en lugar de Sequelize)
// Estos imports inicializan los archivos JSON si no existen
const UsuarioCliente = require('./models/UsuarioCliente');
const Tasker = require('./models/Tasker');
const Tarea = require('./models/Tarea');
const Admin = require('./models/Admin'); // Inicializar modelo Admin

// Importar rutas
const authRoutes = require('./routes/auth');
const taskerRoutes = require('./routes/tasker');
const clienteRoutes = require('./routes/cliente');
const adminRoutes = require('./routes/admin');
const taskRoutes = require('./routes/task');
const ratingRoutes = require('./routes/rating');

// Crear aplicación Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globales
app.use(cors()); // Permitir peticiones desde cualquier origen (en producción, configurar origen específico)
app.use(express.json()); // Parsear JSON en el body de las peticiones
app.use(express.urlencoded({ extended: true })); // Parsear form-data

// Servir archivos estáticos (para los uploads)
app.use('/uploads', express.static('uploads'));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/tasker', taskerRoutes);
app.use('/api/cliente', clienteRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/task', taskRoutes);
app.use('/api/rating', ratingRoutes);

// Ruta de prueba/health check
app.get('/', (req, res) => {
  res.json({
    message: '🚀 API de Ayuda Al Toque funcionando correctamente',
    version: '1.0.0',
    endpoints: {
      auth: {
        'POST /api/auth/register/cliente': 'Registro de cliente',
        'POST /api/auth/register/tasker': 'Registro de tasker',
        'POST /api/auth/login': 'Login (cliente o tasker)'
      },
      tasker: {
        'PUT /api/tasker/profile/:id': 'Actualizar perfil de tasker (requiere JWT)'
      },
      admin: {
        'PUT /api/admin/tasker/verify/:id': 'Verificar/aprobar tasker (requiere admin)'
      },
      task: {
        'POST /api/task/create': 'Crear nueva tarea (requiere JWT de cliente)',
        'GET /api/task/my-tasks': 'Obtener tareas del cliente (requiere JWT)',
        'GET /api/task/available': 'Obtener tareas disponibles para taskers (requiere JWT)'
      }
    }
  });
});

// Manejo de errores 404 (ruta no encontrada)
app.use((req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    message: `La ruta ${req.method} ${req.path} no existe`
  });
});

// Manejo de errores generales
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err);
  res.status(500).json({
    error: 'Error interno del servidor',
    message: err.message
  });
});

// Configurar job periódico para auto-confirmar pagos
const { autoConfirmPendingPayments } = require('./utils/autoConfirmPayment');

// Ejecutar auto-confirmación cada hora (3600000 ms)
setInterval(async () => {
  try {
    await autoConfirmPendingPayments();
  } catch (error) {
    console.error('Error en job de auto-confirmación:', error);
  }
}, 60 * 60 * 1000); // Cada hora

// Iniciar servidor
const startServer = async () => {
  try {
    // Probar conexión a la base de datos
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      console.error('❌ No se pudo conectar a la base de datos. Verifica tu configuración en .env');
      process.exit(1);
    }

    // Iniciar servidor HTTP
    app.listen(PORT, () => {
      console.log(`\n✅ Servidor corriendo en http://localhost:${PORT}`);
      console.log(`✅ Base de datos conectada correctamente`);
      console.log(`⏰ Job de auto-confirmación de pagos activo (cada 1 hora)\n`);
      
      // Ejecutar auto-confirmación una vez al iniciar
      autoConfirmPendingPayments().catch(err => {
        console.error('Error en auto-confirmación inicial:', err);
      });
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

// Iniciar la aplicación
startServer();

module.exports = app;

