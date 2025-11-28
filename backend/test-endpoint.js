/**
 * Script de Prueba para el Endpoint de Aplicar a Tareas
 * 
 * Este script prueba el flujo completo:
 * 1. Registra un tasker
 * 2. Aprueba el tasker (simulado)
 * 3. Crea una tarea
 * 4. Aplica a la tarea
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

// Colores para la consola
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testEndpoint() {
  try {
    log('\n🧪 Iniciando pruebas del endpoint de aplicar a tareas...\n', 'blue');

    // Paso 1: Registrar un tasker
    log('📝 Paso 1: Registrando un tasker...', 'yellow');
    const taskerData = {
      email: `tasker${Date.now()}@test.com`,
      password: 'password123',
      nombre: 'María',
      apellido: 'González',
      telefono: '+5491123456789',
      cuit: '20-12345678-9',
      monotributista_check: true,
      terminos_aceptados: true
    };

    const registerResponse = await axios.post(`${BASE_URL}/auth/register/tasker`, taskerData);
    log(`✅ Tasker registrado: ID ${registerResponse.data.usuario.id}`, 'green');
    const taskerId = registerResponse.data.usuario.id;

    // Paso 2: Login del tasker
    log('\n📝 Paso 2: Login del tasker...', 'yellow');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: taskerData.email,
      password: taskerData.password
    });
    const taskerToken = loginResponse.data.token;
    log('✅ Login exitoso', 'green');

    // Paso 3: Aprobar el tasker (necesitamos hacerlo manualmente o crear un admin)
    log('\n📝 Paso 3: Aprobando tasker...', 'yellow');
    log('⚠️  Nota: Necesitas aprobar el tasker manualmente usando el endpoint de admin', 'yellow');
    log(`   PUT ${BASE_URL}/admin/tasker/verify/${taskerId}`, 'yellow');
    log('   Body: { "aprobado": true }', 'yellow');
    log('   Header: Authorization: Bearer ADMIN_TOKEN', 'yellow');
    
    // Esperar confirmación del usuario
    log('\n⏸️  Presiona Enter después de aprobar el tasker...', 'yellow');
    // En Node.js no podemos hacer esto fácilmente, así que continuamos

    // Paso 4: Login del cliente existente
    log('\n📝 Paso 4: Login del cliente existente...', 'yellow');
    const clienteLogin = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'facuaranoa1@gmail.com',
      password: 'password123' // Necesitas saber la contraseña
    }).catch(() => {
      log('⚠️  No se pudo hacer login del cliente. Usa el cliente existente o crea uno nuevo.', 'yellow');
      return null;
    });

    let clienteToken;
    if (clienteLogin) {
      clienteToken = clienteLogin.data.token;
      log('✅ Login del cliente exitoso', 'green');
    } else {
      log('📝 Creando nuevo cliente...', 'yellow');
      const nuevoCliente = await axios.post(`${BASE_URL}/auth/register/cliente`, {
        email: `cliente${Date.now()}@test.com`,
        password: 'password123',
        nombre: 'Juan',
        apellido: 'Pérez',
        telefono: '+5491123456789',
        ubicacion_default: {
          latitud: -34.6037,
          longitud: -58.3816,
          direccion: 'Av. Corrientes 1234',
          ciudad: 'Buenos Aires'
        }
      });
      
      const clienteLogin2 = await axios.post(`${BASE_URL}/auth/login`, {
        email: nuevoCliente.data.usuario.email,
        password: 'password123'
      });
      clienteToken = clienteLogin2.data.token;
      log('✅ Cliente creado y logueado', 'green');
    }

    // Paso 5: Crear una tarea
    log('\n📝 Paso 5: Creando una tarea...', 'yellow');
    const tareaData = {
      tipo_servicio: 'EXPRESS',
      descripcion: 'Necesito ayuda para mudanza',
      ubicacion: {
        latitud: -34.6037,
        longitud: -58.3816,
        direccion: 'Av. Corrientes 1234',
        ciudad: 'Buenos Aires'
      },
      fecha_hora_requerida: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Mañana
      requiere_licencia: false,
      monto_total_acordado: 5000
    };

    const tareaResponse = await axios.post(`${BASE_URL}/task/create`, tareaData, {
      headers: { Authorization: `Bearer ${clienteToken}` }
    });
    const tareaId = tareaResponse.data.tarea.id;
    log(`✅ Tarea creada: ID ${tareaId}`, 'green');
    log(`   Estado: ${tareaResponse.data.tarea.estado}`, 'green');
    log(`   Comisión: ${tareaResponse.data.tarea.comision_app * 100}%`, 'green');

    // Paso 6: Aplicar a la tarea
    log('\n📝 Paso 6: Aplicando a la tarea...', 'yellow');
    try {
      const applyResponse = await axios.post(`${BASE_URL}/task/apply/${tareaId}`, {}, {
        headers: { Authorization: `Bearer ${taskerToken}` }
      });
      log('✅ ¡Aplicación exitosa!', 'green');
      log(`   ID de aplicación: ${applyResponse.data.aplicacion.id}`, 'green');
      log(`   Estado: ${applyResponse.data.aplicacion.estado}`, 'green');
      log(`   Tarea ID: ${applyResponse.data.aplicacion.tarea_id}`, 'green');
    } catch (error) {
      if (error.response) {
        log(`❌ Error: ${error.response.data.message || error.response.data.error}`, 'red');
        if (error.response.status === 403) {
          log('   ⚠️  Asegúrate de haber aprobado el tasker primero', 'yellow');
        }
      } else {
        log(`❌ Error: ${error.message}`, 'red');
      }
    }

    log('\n✅ Prueba completada!\n', 'green');

  } catch (error) {
    if (error.response) {
      log(`\n❌ Error HTTP: ${error.response.status}`, 'red');
      log(`   Mensaje: ${error.response.data.message || error.response.data.error}`, 'red');
      if (error.response.data) {
        console.log('   Detalles:', JSON.stringify(error.response.data, null, 2));
      }
    } else if (error.request) {
      log('\n❌ Error: No se pudo conectar al servidor', 'red');
      log('   Asegúrate de que el servidor esté corriendo en http://localhost:3000', 'yellow');
    } else {
      log(`\n❌ Error: ${error.message}`, 'red');
    }
    process.exit(1);
  }
}

// Verificar que axios esté instalado
try {
  require('axios');
} catch (e) {
  console.log('❌ axios no está instalado. Instalando...');
  console.log('   Ejecuta: npm install axios');
  process.exit(1);
}

// Ejecutar prueba
testEndpoint();

