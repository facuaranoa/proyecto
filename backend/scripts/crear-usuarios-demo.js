/**
 * Script para crear usuarios de demostración
 *
 * Este script crea automáticamente usuarios de prueba en la base de datos.
 * Ejecuta: node scripts/crear-usuarios-demo.js
 */

require('dotenv').config();
const UsuarioCliente = require('../models/UsuarioCliente');
const Tasker = require('../models/Tasker');

async function crearUsuariosDemo() {
    try {
        console.log('🎯 Creando usuarios de demostración...\n');

        // Crear clientes de prueba
        const clientesDemo = [
            {
                email: 'juan.perez@email.com',
                password_hash: '123456', // Se encriptará automáticamente
                nombre: 'Juan',
                apellido: 'Pérez',
                telefono: '+5491123456789',
                ubicacion_default: {
                    latitud: -34.6037,
                    longitud: -58.3816,
                    direccion: 'Av. Corrientes 1234',
                    ciudad: 'Buenos Aires'
                }
            },
            {
                email: 'ana.garcia@email.com',
                password_hash: '123456',
                nombre: 'Ana',
                apellido: 'García',
                telefono: '+5491123456790',
                ubicacion_default: {
                    latitud: -34.6099,
                    longitud: -58.3923,
                    direccion: 'Calle Florida 567',
                    ciudad: 'Buenos Aires'
                }
            },
            {
                email: 'carlos.lopez@email.com',
                password_hash: '123456',
                nombre: 'Carlos',
                apellido: 'López',
                telefono: '+5491123456791',
                ubicacion_default: {
                    latitud: -34.6177,
                    longitud: -58.3621,
                    direccion: 'Av. Santa Fe 890',
                    ciudad: 'Buenos Aires'
                }
            }
        ];

        // Crear taskers de prueba
        const taskersDemo = [
            {
                email: 'maria.gonzalez@email.com',
                password_hash: '123456',
                nombre: 'María',
                apellido: 'González',
                telefono: '+5491123456792',
                especialidad: 'plomero',
                descripcion: 'Especialista en plomería residencial con 5 años de experiencia. Reparo caños, grifería y desagues.',
                tarifa_hora: 25.00,
                cuit: '27-12345678-9',
                monotributista_check: true,
                terminos_aceptados: true,
                aprobado_admin: true,
                disponible: true
            },
            {
                email: 'pedro.martinez@email.com',
                password_hash: '123456',
                nombre: 'Pedro',
                apellido: 'Martínez',
                telefono: '+5491123456793',
                especialidad: 'electricista',
                descripcion: 'Instalaciones eléctricas, reparaciones y mantenimiento. Trabajo con instalaciones monofásicas y trifásicas.',
                tarifa_hora: 30.00,
                cuit: '27-23456789-0',
                monotributista_check: false,
                terminos_aceptados: true,
                aprobado_admin: true,
                disponible: true
            },
            {
                email: 'laura.rodriguez@email.com',
                password_hash: '123456',
                nombre: 'Laura',
                apellido: 'Rodríguez',
                telefono: '+5491123456794',
                especialidad: 'jardinero',
                descripcion: 'Servicio completo de jardinería: poda, mantenimiento de césped, instalación de riego automático.',
                tarifa_hora: 20.00,
                cuit: '27-34567890-1',
                monotributista_check: true,
                terminos_aceptados: true,
                aprobado_admin: false, // Pendiente de aprobación
                disponible: true
            },
            {
                email: 'javier.sanchez@email.com',
                password_hash: '123456',
                nombre: 'Javier',
                apellido: 'Sánchez',
                telefono: '+5491123456795',
                especialidad: 'carpintero',
                descripcion: 'Carpintería en general: muebles a medida, reparaciones, instalación de puertas y ventanas.',
                tarifa_hora: 28.00,
                cuit: '27-45678901-2',
                monotributista_check: true,
                terminos_aceptados: true,
                aprobado_admin: true,
                disponible: false // No disponible temporalmente
            }
        ];

        console.log('📝 Creando clientes de prueba...');
        for (const cliente of clientesDemo) {
            try {
                await UsuarioCliente.create(cliente);
                console.log(`✅ Cliente creado: ${cliente.nombre} ${cliente.apellido}`);
            } catch (error) {
                if (error.name === 'SequelizeUniqueConstraintError') {
                    console.log(`⚠️  Cliente ya existe: ${cliente.email}`);
                } else {
                    console.log(`❌ Error creando cliente ${cliente.email}:`, error.message);
                }
            }
        }

        console.log('\n👷 Creando taskers de prueba...');
        for (const tasker of taskersDemo) {
            try {
                await Tasker.create(tasker);
                console.log(`✅ Tasker creado: ${tasker.nombre} ${tasker.apellido} (${tasker.especialidad})`);
            } catch (error) {
                if (error.name === 'SequelizeUniqueConstraintError') {
                    console.log(`⚠️  Tasker ya existe: ${tasker.email}`);
                } else {
                    console.log(`❌ Error creando tasker ${tasker.email}:`, error.message);
                }
            }
        }

        console.log('\n🎉 Usuarios de demostración creados exitosamente!');
        console.log('\n📋 Credenciales de acceso:');
        console.log('Email: cualquiera de los creados arriba');
        console.log('Password: 123456');
        console.log('\n🔑 Taskers disponibles:');
        console.log('- maria.gonzalez@email.com (Plomero - Aprobado)');
        console.log('- pedro.martinez@email.com (Electricista - Aprobado)');
        console.log('- javier.sanchez@email.com (Carpintero - Aprobado)');
        console.log('- laura.rodriguez@email.com (Jardinero - Pendiente de aprobación)');

        process.exit(0);

    } catch (error) {
        console.error('❌ Error creando usuarios de demo:', error);
        process.exit(1);
    }
}

crearUsuariosDemo();
