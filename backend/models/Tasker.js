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

const Tasker = sequelize.define('Tasker', {
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
  // Verificación Legal
  cuit: {
    type: DataTypes.STRING(20),
    allowNull: true,
    unique: true
  },
  monotributista_check: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  terminos_aceptados: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  // Credenciales (URLs/paths de los archivos subidos)
  dni_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'Path o URL del documento DNI subido'
  },
  matricula_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'Path o URL de la matrícula profesional (si es especialista)'
  },
  licencia_conducir_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'Path o URL de la licencia de conducir (si requiere)'
  },
  // Estatus
  aprobado_admin: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Debe ser TRUE para que el tasker pueda trabajar'
  },
  disponible: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Si está disponible para tomar nuevas tareas'
  }
}, {
  tableName: 'Taskers',
  timestamps: true,
  hooks: {
    // Encripta la contraseña antes de crear
    beforeCreate: async (tasker) => {
      if (tasker.password_hash) {
        const salt = await bcrypt.genSalt(10);
        tasker.password_hash = await bcrypt.hash(tasker.password_hash, salt);
      }
    },
    // Encripta la contraseña antes de actualizar (si cambió)
    beforeUpdate: async (tasker) => {
      if (tasker.changed('password_hash')) {
        const salt = await bcrypt.genSalt(10);
        tasker.password_hash = await bcrypt.hash(tasker.password_hash, salt);
      }
    }
  }
});

// Método para comparar contraseñas (usado en login)
Tasker.prototype.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password_hash);
};

module.exports = Tasker;
*/

/**
 * ============================================================================
 * MODELO ACTUAL: ARCHIVOS JSON
 * ============================================================================
 */
module.exports = require('./Tasker.json');



