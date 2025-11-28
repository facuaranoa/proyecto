/**
 * Script de Prueba Completo - Ejecuta todo el flujo automáticamente
 * 
 * Uso: node test-completo.js
 */

// Usar fetch nativo (Node.js 18+) o axios si está disponible
let httpRequest;
try {
  httpRequest = require('axios');
  console.log('✅ Usando axios\n');
} catch (e) {
  // Si axios no está, usar fetch nativo
  httpRequest = {
    get: async (url, config) => {
      const response = await fetch(url, { headers: config?.headers || {} });
      const data = await response.json();
      return { status: response.status, data, statusText: response.statusText };
    },
    post: async (url, body, config) => {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(config?.headers || {})
        },
        body: JSON.stringify(body)
      });
      const data = await response.json();
      return { status: response.status, data, statusText: response.statusText };
    },
    put: async (url, body, config) => {
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(config?.headers || {})
        },
        body: JSON.stringify(body)
      });
      const data = await response.json();
      return { status: response.status, data, statusText: response.statusText };
    }
  };
  console.log('✅ Usando fetch nativo\n');
}

const BASE_URL = 'http://localhost:3000/api';

// Colores para la consola
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function error(message) {
  log(`❌ ${message}`, 'red');
}

function success(message) {
  log(`✅ ${message}`, 'green');
}

function info(message) {
  log(`ℹ️  ${message}`, 'cyan');
}

function step(message) {
  log(`\n📝 ${message}`, 'yellow');
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testCompleto() {
  let adminToken, taskerToken, clienteToken;
  let taskerId, tareaId;

  try {
    log('\n🧪 INICIANDO PRUEBAS COMPLETAS DEL SISTEMA\n', 'blue');
    log('='.repeat(60), 'blue');

    // ============================================
    // PASO 1: Login del Admin
    // ============================================
    step('Paso 1: Login del Admin');
    try {
      const adminLogin = await httpRequest.post(`${BASE_URL}/auth/login`, {
        email: 'admin@ayudaaltoque.com',
        password: 'admin123'
      });

      if (adminLogin.status === 200) {
        adminToken = adminLogin.data.token;
        success(`Admin logueado: ${adminLogin.data.usuario.email}`);
        info(`Token: ${adminToken.substring(0, 20)}...`);
      } else {
        error(`Error en login admin: ${adminLogin.data.message || adminLogin.statusText}`);
        return;
      }
    } catch (err) {
      error(`Error al conectar: ${err.message}`);
      error('⚠️  Asegúrate de que el servidor esté corriendo en http://localhost:3000');
      return;
    }

    await sleep(500);

    // ============================================
    // PASO 2: Registrar un Tasker
    // ============================================
    step('Paso 2: Registrar un Tasker');
    const taskerEmail = `tasker${Date.now()}@test.com`;
    const taskerData = {
      email: taskerEmail,
      password: 'password123',
      nombre: 'María',
      apellido: 'González',
      telefono: '+5491123456789',
      cuit: '20-12345678-9',
      monotributista_check: true,
      terminos_aceptados: true
    };

    try {
      const registerResponse = await httpRequest.post(`${BASE_URL}/auth/register/tasker`, taskerData);
      if (registerResponse.status === 201 || registerResponse.status === 200) {
        taskerId = registerResponse.data.usuario.id;
        success(`Tasker registrado: ID ${taskerId}, Email: ${taskerEmail}`);
      } else {
        error(`Error al registrar tasker: ${registerResponse.data.message || registerResponse.statusText}`);
        return;
      }
    } catch (err) {
      if (err.response) {
        error(`Error: ${err.response.data.message || err.message}`);
      } else {
        error(`Error: ${err.message}`);
      }
      return;
    }

    await sleep(500);

    // ============================================
    // PASO 3: Aprobar el Tasker
    // ============================================
    step('Paso 3: Aprobar el Tasker (como Admin)');
    try {
      const approveResponse = await httpRequest.put(
        `${BASE_URL}/admin/tasker/verify/${taskerId}`,
        { aprobado: true },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );

      if (approveResponse.status === 200) {
        success(`Tasker aprobado exitosamente`);
      } else {
        error(`Error al aprobar tasker: ${approveResponse.data.message || approveResponse.statusText}`);
        return;
      }
    } catch (err) {
      if (err.response) {
        error(`Error: ${err.response.data.message || err.message}`);
      } else {
        error(`Error: ${err.message}`);
      }
      return;
    }

    await sleep(500);

    // ============================================
    // PASO 4: Login del Tasker
    // ============================================
    step('Paso 4: Login del Tasker');
    try {
      const taskerLogin = await httpRequest.post(`${BASE_URL}/auth/login`, {
        email: taskerEmail,
        password: 'password123'
      });

      if (taskerLogin.status === 200) {
        taskerToken = taskerLogin.data.token;
        success(`Tasker logueado: ${taskerLogin.data.usuario.email}`);
        info(`Aprobado: ${taskerLogin.data.usuario.aprobado_admin ? 'Sí' : 'No'}`);
      } else {
        error(`Error en login tasker: ${taskerLogin.data.message || taskerLogin.statusText}`);
        return;
      }
    } catch (err) {
      error(`Error: ${err.message}`);
      return;
    }

    await sleep(500);

    // ============================================
    // PASO 5: Crear/Login Cliente
    // ============================================
    step('Paso 5: Crear y Login del Cliente');
    const clienteEmail = `cliente${Date.now()}@test.com`;
    
    try {
      // Crear cliente
      const clienteRegister = await httpRequest.post(`${BASE_URL}/auth/register/cliente`, {
        email: clienteEmail,
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

      if (clienteRegister.status === 201 || clienteRegister.status === 200) {
        success(`Cliente registrado: ${clienteEmail}`);
      }

      // Login del cliente
      const clienteLogin = await httpRequest.post(`${BASE_URL}/auth/login`, {
        email: clienteEmail,
        password: 'password123'
      });

      if (clienteLogin.status === 200) {
        clienteToken = clienteLogin.data.token;
        success(`Cliente logueado: ${clienteLogin.data.usuario.email}`);
      } else {
        error(`Error en login cliente: ${clienteLogin.data.message || clienteLogin.statusText}`);
        return;
      }
    } catch (err) {
      if (err.response) {
        error(`Error: ${err.response.data.message || err.message}`);
      } else {
        error(`Error: ${err.message}`);
      }
      return;
    }

    await sleep(500);

    // ============================================
    // PASO 6: Crear una Tarea
    // ============================================
    step('Paso 6: Crear una Tarea (como Cliente)');
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

    try {
      const tareaResponse = await httpRequest.post(
        `${BASE_URL}/task/create`,
        tareaData,
        { headers: { Authorization: `Bearer ${clienteToken}` } }
      );

      if (tareaResponse.status === 201) {
        tareaId = tareaResponse.data.tarea.id;
        success(`Tarea creada: ID ${tareaId}`);
        info(`Estado: ${tareaResponse.data.tarea.estado}`);
        info(`Comisión: ${(tareaResponse.data.tarea.comision_app * 100).toFixed(0)}%`);
        info(`Monto tasker: $${tareaResponse.data.tarea.monto_tasker_neto}`);
      } else {
        error(`Error al crear tarea: ${tareaResponse.data.message || tareaResponse.statusText}`);
        return;
      }
    } catch (err) {
      if (err.response) {
        error(`Error: ${err.response.data.message || err.message}`);
      } else {
        error(`Error: ${err.message}`);
      }
      return;
    }

    await sleep(500);

    // ============================================
    // PASO 7: Ver Tareas Disponibles
    // ============================================
    step('Paso 7: Ver Tareas Disponibles (como Tasker)');
    try {
      const availableResponse = await httpRequest.get(
        `${BASE_URL}/task/available`,
        { headers: { Authorization: `Bearer ${taskerToken}` } }
      );

      if (availableResponse.status === 200) {
        const tareas = availableResponse.data.tareas || [];
        success(`Tareas disponibles: ${tareas.length}`);
        if (tareas.length > 0) {
          info(`Primera tarea: ${tareas[0].descripcion.substring(0, 30)}...`);
        }
      } else {
        error(`Error: ${availableResponse.data.message || availableResponse.statusText}`);
      }
    } catch (err) {
      if (err.response) {
        error(`Error: ${err.response.data.message || err.message}`);
      } else {
        error(`Error: ${err.message}`);
      }
    }

    await sleep(500);

    // ============================================
    // PASO 8: Aplicar a la Tarea (NUEVO ENDPOINT)
    // ============================================
    step('Paso 8: Aplicar a la Tarea (NUEVO ENDPOINT) ⭐');
    try {
      const applyResponse = await httpRequest.post(
        `${BASE_URL}/task/apply/${tareaId}`,
        {},
        { headers: { Authorization: `Bearer ${taskerToken}` } }
      );

      if (applyResponse.status === 201) {
        success('¡Aplicación exitosa!');
        info(`ID de aplicación: ${applyResponse.data.aplicacion.id}`);
        info(`Estado: ${applyResponse.data.aplicacion.estado}`);
        info(`Tarea ID: ${applyResponse.data.aplicacion.tarea_id}`);
      } else {
        error(`Error: ${applyResponse.data.message || applyResponse.statusText}`);
        return;
      }
    } catch (err) {
      if (err.response) {
        error(`Error: ${err.response.data.message || err.message}`);
        if (err.response.status === 403) {
          info('⚠️  Verifica que el tasker esté aprobado');
        }
      } else {
        error(`Error: ${err.message}`);
      }
      return;
    }

    // ============================================
    // RESUMEN FINAL
    // ============================================
    log('\n' + '='.repeat(60), 'blue');
    log('✅ TODAS LAS PRUEBAS COMPLETADAS EXITOSAMENTE', 'green');
    log('='.repeat(60), 'blue');
    
    log('\n📊 Resumen:', 'cyan');
    info(`Admin: admin@ayudaaltoque.com (ID: 1)`);
    info(`Tasker: ${taskerEmail} (ID: ${taskerId})`);
    info(`Cliente: ${clienteEmail}`);
    info(`Tarea: ID ${tareaId}`);
    info(`Aplicación: Creada exitosamente`);

    log('\n🔍 Verificar archivos:', 'cyan');
    info(`- backend/data/solicitudesTareas.json`);
    info(`- backend/data/tareas.json`);
    info(`- backend/data/taskers.json`);

    log('\n✨ ¡Todo funcionando correctamente!', 'green');
    log('\n');

  } catch (error) {
    log('\n' + '='.repeat(60), 'red');
    log('❌ ERROR CRÍTICO EN LAS PRUEBAS', 'red');
    log('='.repeat(60), 'red');
    console.error(error);
    process.exit(1);
  }
}

// Verificar que el servidor esté corriendo antes de empezar
async function verificarServidor() {
  try {
    const response = await httpRequest.get(`${BASE_URL.replace('/api', '')}`);
    return true;
  } catch (err) {
    return false;
  }
}

// Ejecutar
(async () => {
  log('🔍 Verificando que el servidor esté corriendo...', 'yellow');
  const servidorActivo = await verificarServidor();
  
  if (!servidorActivo) {
    error('❌ El servidor no está corriendo en http://localhost:3000');
    error('⚠️  Por favor, inicia el servidor primero:');
    error('   npm start');
    error('   o');
    error('   C:\\Users\\faranoa\\node-v20.11.0-win-x64\\node.exe server.js');
    process.exit(1);
  }
  
  success('✅ Servidor activo\n');
  await testCompleto();
})();

