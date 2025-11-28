/**
 * Script para crear una tarea de demostración
 * Ejecuta: node scripts/crear-tarea-demo.js
 */

require('dotenv').config();
const Tarea = require('../models/Tarea');

async function crearTareaDemo() {
    try {
        console.log('🎯 Creando tarea de demostración...\n');

        const nuevaTarea = await Tarea.create({
            cliente_id: 1, // ID del cliente demo
            tasker_id: null,
            tipo_servicio: 'EXPRESS',
            descripcion: 'Reparar grifo de cocina: pierde agua constantemente',
            ubicacion: {
                latitud: -34.6037,
                longitud: -58.3816,
                direccion: 'Av. Corrientes 1234',
                ciudad: 'Buenos Aires'
            },
            fecha_hora_requerida: new Date(Date.now() + 24 * 60 * 60 * 1000), // Mañana
            requiere_licencia: false,
            monto_total_acordado: 150.00,
            comision_app: 0.20,
            estado: 'PENDIENTE'
        });

        console.log('✅ Tarea creada exitosamente!');
        console.log('ID:', nuevaTarea.id);
        console.log('Descripción:', nuevaTarea.descripcion);
        console.log('Monto:', nuevaTarea.monto_total_acordado);
        console.log('Estado:', nuevaTarea.estado);

        process.exit(0);

    } catch (error) {
        console.error('❌ Error creando tarea:', error);
        console.error('Detalle:', error.message);
        process.exit(1);
    }
}

crearTareaDemo();
