/**
 * ============================================================================
 * MODELO ORIGINAL DE POSTGRESQL - COMENTADO
 * ============================================================================
 * Este código está comentado para usar archivos JSON en su lugar.
 * Para volver a PostgreSQL, descomenta este código y comenta la línea de abajo.
 * ============================================================================
 */

/*
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const UsuarioCliente = sequelize.define('UsuarioCliente', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  apellido: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  telefono: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  ubicacion_default: {
    type: DataTypes.JSONB, // JSONB es más eficiente que JSON en PostgreSQL
    allowNull: true,
    // Estructura esperada:
    // {
    //   "latitud": -34.6037,
    //   "longitud": -58.3816,
    //   "direccion": "Av. Corrientes 1234",
    //   "ciudad": "Buenos Aires"
    // }
  }
}, {
  tableName: 'UsuarioClientes', // Nombre de la tabla en PostgreSQL
  timestamps: true, // Crea automáticamente createdAt y updatedAt
  hooks: {
    // Hook que se ejecuta antes de crear un usuario
    // Encripta la contraseña automáticamente
    beforeCreate: async (usuario) => {
      if (usuario.password_hash) {
        const salt = await bcrypt.genSalt(10);
        usuario.password_hash = await bcrypt.hash(usuario.password_hash, salt);
      }
    },
    // Hook que se ejecuta antes de actualizar un usuario
    // Encripta la contraseña si se está actualizando
    beforeUpdate: async (usuario) => {
      if (usuario.changed('password_hash')) {
        const salt = await bcrypt.genSalt(10);
        usuario.password_hash = await bcrypt.hash(usuario.password_hash, salt);
      }
    }
  }
});

// Método para comparar contraseñas (usado en login)
UsuarioCliente.prototype.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password_hash);
};

module.exports = UsuarioCliente;
*/

/**
 * ============================================================================
 * MODELO ACTUAL: ARCHIVOS JSON
 * ============================================================================
 */
module.exports = require('./UsuarioCliente.json');



