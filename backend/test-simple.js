/**
 * Script de Prueba Simple - Usa fetch nativo
 */

const BASE_URL = 'http://localhost:3000/api';

async function test() {
  console.log('🧪 Iniciando pruebas...\n');

  try {
    // 1. Login Admin
    console.log('1️⃣ Login Admin...');
    const adminRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@ayudaaltoque.com',
        password: 'admin123'
      })
    });
    const adminData = await adminRes.json();
    if (adminRes.ok) {
      console.log('✅ Admin logueado');
      const adminToken = adminData.token;
      
      // 2. Registrar Tasker
      console.log('\n2️⃣ Registrando Tasker...');
      const taskerEmail = `tasker${Date.now()}@test.com`;
      const taskerRes = await fetch(`${BASE_URL}/auth/register/tasker`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: taskerEmail,
          password: 'password123',
          nombre: 'María',
          apellido: 'González',
          telefono: '+5491123456789',
          cuit: '20-12345678-9',
          monotributista_check: true,
          terminos_aceptados: true
        })
      });
      const taskerData = await taskerRes.json();
      if (taskerRes.ok) {
        console.log('✅ Tasker registrado:', taskerData.usuario.id);
        const taskerId = taskerData.usuario.id;
        
          // 3. Aprobar Tasker
          console.log('\n3️⃣ Aprobando Tasker...');
          const approveRes = await fetch(`${BASE_URL}/admin/tasker/verify/${taskerId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${adminToken}`
            },
            body: JSON.stringify({ aprobado_admin: true })
          });
          const approveData = await approveRes.json();
          if (approveRes.ok) {
            console.log('✅ Tasker aprobado');
            console.log('   Verificando aprobación:', approveData.tasker.aprobado_admin);
            // Esperar un momento para que se guarde en disco
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // 4. Login Tasker
          console.log('\n4️⃣ Login Tasker...');
          const taskerLoginRes = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: taskerEmail,
              password: 'password123'
            })
          });
          const taskerLoginData = await taskerLoginRes.json();
          if (taskerLoginRes.ok) {
            console.log('✅ Tasker logueado');
            const taskerToken = taskerLoginData.token;
            
            // 5. Crear Cliente
            console.log('\n5️⃣ Creando Cliente...');
            const clienteEmail = `cliente${Date.now()}@test.com`;
            const clienteRes = await fetch(`${BASE_URL}/auth/register/cliente`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
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
              })
            });
            const clienteData = await clienteRes.json();
            if (clienteRes.ok) {
              console.log('✅ Cliente registrado');
              
              // 6. Login Cliente
              console.log('\n6️⃣ Login Cliente...');
              const clienteLoginRes = await fetch(`${BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  email: clienteEmail,
                  password: 'password123'
                })
              });
              const clienteLoginData = await clienteLoginRes.json();
              if (clienteLoginRes.ok) {
                console.log('✅ Cliente logueado');
                const clienteToken = clienteLoginData.token;
                
                // 7. Crear Tarea
                console.log('\n7️⃣ Creando Tarea...');
                const tareaRes = await fetch(`${BASE_URL}/task/create`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${clienteToken}`
                  },
                  body: JSON.stringify({
                    tipo_servicio: 'EXPRESS',
                    descripcion: 'Necesito ayuda para mudanza',
                    ubicacion: {
                      latitud: -34.6037,
                      longitud: -58.3816,
                      direccion: 'Av. Corrientes 1234',
                      ciudad: 'Buenos Aires'
                    },
                    fecha_hora_requerida: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                    requiere_licencia: false,
                    monto_total_acordado: 5000
                  })
                });
                const tareaData = await tareaRes.json();
                if (tareaRes.ok) {
                  console.log('✅ Tarea creada:', tareaData.tarea.id);
                  const tareaId = tareaData.tarea.id;
                  
                  // 8. Aplicar a Tarea
                  console.log('\n8️⃣ Aplicando a Tarea...');
                  const applyRes = await fetch(`${BASE_URL}/task/apply/${tareaId}`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${taskerToken}`
                    }
                  });
                  const applyData = await applyRes.json();
                  if (applyRes.ok) {
                    console.log('✅ ¡Aplicación exitosa!');
                    console.log('   ID:', applyData.aplicacion.id);
                    console.log('   Estado:', applyData.aplicacion.estado);
                    console.log('\n✨ ¡TODAS LAS PRUEBAS EXITOSAS!');
                  } else {
                    console.log('❌ Error al aplicar:', applyData.message || applyData.error);
                  }
                } else {
                  console.log('❌ Error al crear tarea:', tareaData.message || tareaData.error);
                }
              } else {
                console.log('❌ Error login cliente:', clienteLoginData.message || clienteLoginData.error);
              }
            } else {
              console.log('❌ Error al crear cliente:', clienteData.message || clienteData.error);
            }
          } else {
            console.log('❌ Error login tasker:', taskerLoginData.message || taskerLoginData.error);
          }
        } else {
          const approveData = await approveRes.json();
          console.log('❌ Error al aprobar:', approveData.message || approveData.error);
        }
      } else {
        console.log('❌ Error al registrar tasker:', taskerData.message || taskerData.error);
      }
    } else {
      console.log('❌ Error login admin:', adminData.message || adminData.error);
      console.log('\n⚠️  ⚠️  ⚠️  IMPORTANTE ⚠️  ⚠️  ⚠️');
      console.log('El servidor necesita REINICIARSE para cargar el modelo Admin.');
      console.log('\nPasos:');
      console.log('1. Detén el servidor (Ctrl + C en la terminal donde corre)');
      console.log('2. Inicia el servidor nuevamente: npm start');
      console.log('3. Ejecuta este script otra vez: node test-simple.js');
      console.log('\nO ejecuta: C:\\Users\\faranoa\\node-v20.11.0-win-x64\\node.exe test-simple.js');
      process.exit(1);
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
    console.log('⚠️  Asegúrate de que el servidor esté corriendo en http://localhost:3000');
  }
}

test();

