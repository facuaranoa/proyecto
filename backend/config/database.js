/**
 * ============================================================================
 * CÓDIGO ORIGINAL DE POSTGRESQL - COMENTADO
 * ============================================================================
 * Este código está comentado para usar archivos JSON en su lugar.
 * Para volver a PostgreSQL, descomenta este código y comenta el código JSON.
 * ============================================================================
 */

/*
const { Sequelize } = require('sequelize');
require('dotenv').config();

// Crear instancia de Sequelize con las variables de entorno
const sequelize = new Sequelize(
  process.env.DB_NAME,        // Nombre de la base de datos
  process.env.DB_USER,        // Usuario de PostgreSQL
  process.env.DB_PASSWORD,   // Contraseña de PostgreSQL
  {
    host: process.env.DB_HOST, // Host (localhost)
    port: process.env.DB_PORT, // Puerto (5432 por defecto)
    dialect: 'postgres',      // Tipo de base de datos
    logging: false,           // Desactivar logs de SQL en consola (cambiar a console.log para debug)
    pool: {
      max: 5,                 // Máximo de conexiones simultáneas
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Función para probar la conexión
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Base de datos conectada correctamente');
    return true;
  } catch (error) {
    console.error('❌ Error al conectar con la base de datos:', error.message);
    return false;
  }
};

module.exports = {
  sequelize,
  testConnection
};
*/

/**
 * ============================================================================
 * SISTEMA ACTUAL: ARCHIVOS JSON
 * ============================================================================
 */
const { testConnection: testConnectionJSON } = require('./database-json');

module.exports = {
  // sequelize, // Comentado - usar modelos JSON en su lugar
  testConnection: testConnectionJSON
};

