/**
 * Script para Sincronizar la Base de Datos
 * 
 * Este script crea todas las tablas en PostgreSQL según los modelos definidos.
 * Ejecuta: npm run sync-db
 */

require('dotenv').config();
const { sequelize } = require('../config/database');

// Importar todos los modelos para que Sequelize los registre
const UsuarioCliente = require('../models/UsuarioCliente');
const Tasker = require('../models/Tasker');
const Tarea = require('../models/Tarea');

const syncDatabase = async () => {
  try {
    console.log('🔄 Sincronizando base de datos...\n');

    // Sincronizar modelos con la base de datos
    // force: false = no elimina tablas existentes
    // alter: true = actualiza las tablas si hay cambios
    await sequelize.sync({ alter: true });

    console.log('✅ Base de datos sincronizada correctamente');
    console.log('✅ Tablas creadas/actualizadas:');
    console.log('   - UsuarioClientes');
    console.log('   - Taskers');
    console.log('   - Tareas');

    // Crear índices para optimizar filtros de búsqueda
    console.log('📊 Creando índices para optimizar búsquedas...');

    try {
      // Índice para filtrar por estado y tasker_id (tareas disponibles)
      await sequelize.query(`
        CREATE INDEX IF NOT EXISTS idx_tareas_estado_tasker
        ON "Tareas" (estado, tasker_id)
        WHERE estado = 'PENDIENTE' AND tasker_id IS NULL;
      `);

      // Índice para filtrar por tipo de servicio
      await sequelize.query(`
        CREATE INDEX IF NOT EXISTS idx_tareas_tipo_servicio
        ON "Tareas" (tipo_servicio)
        WHERE estado = 'PENDIENTE' AND tasker_id IS NULL;
      `);

      // Índice para filtrar por precio
      await sequelize.query(`
        CREATE INDEX IF NOT EXISTS idx_tareas_precio
        ON "Tareas" (monto_total_acordado)
        WHERE estado = 'PENDIENTE' AND tasker_id IS NULL;
      `);

      // Índice para filtrar por fecha
      await sequelize.query(`
        CREATE INDEX IF NOT EXISTS idx_tareas_fecha
        ON "Tareas" (fecha_hora_requerida)
        WHERE estado = 'PENDIENTE' AND tasker_id IS NULL;
      `);

      // Índice para filtrar por requiere_licencia
      await sequelize.query(`
        CREATE INDEX IF NOT EXISTS idx_tareas_licencia
        ON "Tareas" (requiere_licencia)
        WHERE estado = 'PENDIENTE' AND tasker_id IS NULL;
      `);

      // Índice compuesto para múltiples filtros
      await sequelize.query(`
        CREATE INDEX IF NOT EXISTS idx_tareas_filtros_compuestos
        ON "Tareas" (tipo_servicio, monto_total_acordado, fecha_hora_requerida, requiere_licencia)
        WHERE estado = 'PENDIENTE' AND tasker_id IS NULL;
      `);

      // Índice para búsqueda por ciudad en JSONB
      await sequelize.query(`
        CREATE INDEX IF NOT EXISTS idx_tareas_ciudad
        ON "Tareas" USING GIN ((ubicacion->'ciudad'))
        WHERE estado = 'PENDIENTE' AND tasker_id IS NULL;
      `);

      console.log('✅ Índices creados exitosamente');
    } catch (indexError) {
      console.warn('⚠️  Algunos índices ya existen o no se pudieron crear:', indexError.message);
    }

    console.log('\n🎉 Base de datos completamente optimizada para filtros de búsqueda!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error al sincronizar la base de datos:', error);
    process.exit(1);
  }
};

syncDatabase();

