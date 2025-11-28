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
const UsuarioCliente = require('./UsuarioCliente');
const Tasker = require('./Tasker');

const Tarea = sequelize.define('Tarea', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  cliente_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: UsuarioCliente,
      key: 'id'
    },
    comment: 'ID del cliente que solicita la tarea'
  },
  tasker_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: Tasker,
      key: 'id'
    },
    comment: 'ID del tasker asignado (NULL si aún no está asignada)'
  },
  tipo_servicio: {
    type: DataTypes.ENUM('EXPRESS', 'ESPECIALISTA'),
    allowNull: false,
    comment: 'Tipo de servicio: EXPRESS (rápido) o ESPECIALISTA (requiere credenciales)'
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'Descripción detallada de la tarea'
  },
  ubicacion: {
    type: DataTypes.JSONB,
    allowNull: false,
    comment: 'Ubicación donde se realizará la tarea (JSON con latitud, longitud, dirección, ciudad)'
  },
  fecha_hora_requerida: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: 'Fecha y hora en que se requiere realizar la tarea'
  },
  requiere_licencia: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Si la tarea requiere licencia de conducir'
  },
  // Finanzas
  monto_total_acordado: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Monto total acordado entre cliente y tasker'
  },
  comision_app: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0.20,
    comment: 'Comisión de la app (20% = 0.20)'
  },
  monto_tasker_neto: {
    type: DataTypes.VIRTUAL, // Campo virtual (calculado, no se guarda en DB)
    get() {
      const total = parseFloat(this.monto_total_acordado) || 0;
      const comision = parseFloat(this.comision_app) || 0.20;
      return total * (1 - comision);
    },
    comment: 'Monto que recibe el tasker después de la comisión (calculado)'
  },
  estado: {
    type: DataTypes.ENUM('PENDIENTE', 'ASIGNADA', 'FINALIZADA', 'CANCELADA'),
    allowNull: false,
    defaultValue: 'PENDIENTE',
    comment: 'Estado actual de la tarea'
  }
}, {
  tableName: 'Tareas',
  timestamps: true
});

// Definir relaciones entre modelos
Tarea.belongsTo(UsuarioCliente, {
  foreignKey: 'cliente_id',
  as: 'cliente'
});

Tarea.belongsTo(Tasker, {
  foreignKey: 'tasker_id',
  as: 'tasker'
});

UsuarioCliente.hasMany(Tarea, {
  foreignKey: 'cliente_id',
  as: 'tareas'
});

Tasker.hasMany(Tarea, {
  foreignKey: 'tasker_id',
  as: 'tareas'
});

module.exports = Tarea;
*/

/**
 * ============================================================================
 * MODELO ACTUAL: ARCHIVOS JSON
 * ============================================================================
 */
module.exports = require('./Tarea.json');



