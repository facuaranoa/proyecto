/**
 * Controller de Administrador
 * 
 * Maneja la lógica relacionada con funciones administrativas.
 */

const Tasker = require('../models/Tasker');

/**
 * Listar Taskers
 * GET /api/admin/taskers
 * Lista todos los taskers (o solo los pendientes si se especifica ?pendientes=true)
 */
const listTaskers = async (req, res) => {
  try {
    const { pendientes } = req.query;
    
    let taskers;
    if (pendientes === 'true') {
      // Solo taskers pendientes de aprobación
      taskers = await Tasker.findAll({
        where: { aprobado_admin: false }
      });
    } else {
      // Todos los taskers
      taskers = await Tasker.findAll();
    }

    // Retornar solo información relevante (sin password_hash)
    const taskersData = taskers.map(t => ({
      id: t.id,
      email: t.email,
      nombre: t.nombre,
      apellido: t.apellido,
      telefono: t.telefono,
      cuit: t.cuit,
      monotributista_check: t.monotributista_check,
      aprobado_admin: t.aprobado_admin,
      disponible: t.disponible,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt
    }));

    res.json({
      message: 'Taskers obtenidos exitosamente',
      taskers: taskersData,
      total: taskersData.length
    });
  } catch (error) {
    console.error('Error al listar taskers:', error);
    res.status(500).json({
      error: 'Error al listar taskers',
      message: error.message
    });
  }
};

/**
 * Verificar/Aprobar Tasker
 * PUT /api/admin/tasker/verify/:id
 * Cambia aprobado_admin de FALSE a TRUE
 */
const verifyTasker = async (req, res) => {
  try {
    const { id } = req.params;
    const { aprobado, aprobado_admin } = req.body;

    // Buscar el tasker
    const tasker = await Tasker.findByPk(id);
    if (!tasker) {
      return res.status(404).json({
        error: 'Tasker no encontrado',
        message: 'No existe un tasker con ese ID'
      });
    }

    // Aceptar tanto 'aprobado' como 'aprobado_admin' en el body
    const valorAprobado = aprobado !== undefined ? aprobado : aprobado_admin;
    const estaAprobado = valorAprobado === true || valorAprobado === 'true';

    // Actualizar el estado de aprobación
    await tasker.update({
      aprobado_admin: estaAprobado
    });

    // Retornar el tasker actualizado
    res.json({
      message: `Tasker ${tasker.aprobado_admin ? 'aprobado' : 'rechazado'} exitosamente`,
      tasker: {
        id: tasker.id,
        email: tasker.email,
        nombre: tasker.nombre,
        apellido: tasker.apellido,
        aprobado_admin: tasker.aprobado_admin
      }
    });
  } catch (error) {
    console.error('Error al verificar tasker:', error);
    res.status(500).json({
      error: 'Error al verificar tasker',
      message: error.message
    });
  }
};

/**
 * Obtener estadísticas generales del sistema
 * GET /api/admin/stats
 */
const getStats = async (req, res) => {
  try {
    const Tarea = require('../models/Tarea');
    const UsuarioCliente = require('../models/UsuarioCliente');
    const Tasker = require('../models/Tasker');
    const Calificacion = require('../models/Calificacion');

    // Contar usuarios
    const totalClientes = await UsuarioCliente.findAll();
    const totalTaskers = await Tasker.findAll();
    const taskersAprobados = totalTaskers.filter(t => t.aprobado_admin);
    const taskersPendientes = totalTaskers.filter(t => !t.aprobado_admin);

    // Contar tareas por estado
    const todasLasTareas = await Tarea.findAll();
    const tareasPorEstado = {
      PENDIENTE: todasLasTareas.filter(t => t.estado === 'PENDIENTE').length,
      ASIGNADA: todasLasTareas.filter(t => t.estado === 'ASIGNADA').length,
      EN_PROCESO: todasLasTareas.filter(t => t.estado === 'EN_PROCESO').length,
      PENDIENTE_PAGO: todasLasTareas.filter(t => t.estado === 'PENDIENTE_PAGO').length,
      FINALIZADA: todasLasTareas.filter(t => t.estado === 'FINALIZADA').length,
      CANCELADA: todasLasTareas.filter(t => t.estado === 'CANCELADA').length
    };

    // Calcular ingresos (suma de montos de tareas finalizadas)
    const tareasFinalizadas = todasLasTareas.filter(t => t.estado === 'FINALIZADA');
    const ingresosTotales = tareasFinalizadas.reduce((sum, t) => sum + (parseFloat(t.monto_total_acordado) || 0), 0);
    const comisionesTotales = ingresosTotales * 0.05; // 5% de comisión

    // Calificaciones
    const todasLasCalificaciones = await Calificacion.findAll();
    const promedioCalificaciones = todasLasCalificaciones.length > 0
      ? todasLasCalificaciones.reduce((sum, c) => sum + (parseInt(c.estrellas) || 0), 0) / todasLasCalificaciones.length
      : 0;

    res.json({
      message: 'Estadísticas obtenidas exitosamente',
      stats: {
        usuarios: {
          totalClientes: totalClientes.length,
          totalTaskers: totalTaskers.length,
          taskersAprobados: taskersAprobados.length,
          taskersPendientes: taskersPendientes.length,
          totalUsuarios: totalClientes.length + totalTaskers.length
        },
        tareas: {
          total: todasLasTareas.length,
          porEstado: tareasPorEstado
        },
        finanzas: {
          ingresosTotales: ingresosTotales,
          comisionesTotales: comisionesTotales,
          tareasFinalizadas: tareasFinalizadas.length
        },
        calificaciones: {
          total: todasLasCalificaciones.length,
          promedio: parseFloat(promedioCalificaciones.toFixed(2))
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      error: 'Error al obtener estadísticas',
      message: error.message
    });
  }
};

/**
 * Listar todos los clientes
 * GET /api/admin/clientes
 */
const listClientes = async (req, res) => {
  try {
    const UsuarioCliente = require('../models/UsuarioCliente');
    const clientes = await UsuarioCliente.findAll();

    const clientesData = clientes.map(c => ({
      id: c.id,
      email: c.email,
      nombre: c.nombre,
      apellido: c.apellido,
      telefono: c.telefono,
      ubicacion_default: c.ubicacion_default,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt
    }));

    res.json({
      message: 'Clientes obtenidos exitosamente',
      clientes: clientesData,
      total: clientesData.length
    });
  } catch (error) {
    console.error('Error al listar clientes:', error);
    res.status(500).json({
      error: 'Error al listar clientes',
      message: error.message
    });
  }
};

/**
 * Listar todas las tareas
 * GET /api/admin/tareas
 */
const listTareas = async (req, res) => {
  try {
    const Tarea = require('../models/Tarea');
    const UsuarioCliente = require('../models/UsuarioCliente');
    const Tasker = require('../models/Tasker');

    const todasLasTareas = await Tarea.findAll();

    // Incluir información del cliente y tasker
    const tareasConInfo = await Promise.all(
      todasLasTareas.map(async (tarea) => {
        const cliente = await UsuarioCliente.findByPk(tarea.cliente_id);
        const tasker = tarea.tasker_id ? await Tasker.findByPk(tarea.tasker_id) : null;

        return {
          ...tarea,
          cliente: cliente ? {
            id: cliente.id,
            nombre: cliente.nombre,
            apellido: cliente.apellido,
            email: cliente.email
          } : null,
          tasker: tasker ? {
            id: tasker.id,
            nombre: tasker.nombre,
            apellido: tasker.apellido,
            email: tasker.email
          } : null
        };
      })
    );

    res.json({
      message: 'Tareas obtenidas exitosamente',
      tareas: tareasConInfo,
      total: tareasConInfo.length
    });
  } catch (error) {
    console.error('Error al listar tareas:', error);
    res.status(500).json({
      error: 'Error al listar tareas',
      message: error.message
    });
  }
};

/**
 * Bloquear/Desbloquear usuario
 * PUT /api/admin/user/block/:id
 */
const blockUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { bloqueado, tipo } = req.body; // tipo: 'cliente' o 'tasker'

    if (!tipo || !['cliente', 'tasker'].includes(tipo)) {
      return res.status(400).json({
        error: 'Tipo inválido',
        message: 'El tipo debe ser "cliente" o "tasker"'
      });
    }

    let Usuario;
    if (tipo === 'cliente') {
      Usuario = require('../models/UsuarioCliente');
    } else {
      Usuario = require('../models/Tasker');
    }

    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).json({
        error: 'Usuario no encontrado',
        message: `No existe un ${tipo} con ese ID`
      });
    }

    // Actualizar estado de bloqueo (asumiendo que existe el campo bloqueado)
    await usuario.update({
      bloqueado: bloqueado === true || bloqueado === 'true'
    });

    res.json({
      message: `Usuario ${usuario.bloqueado ? 'bloqueado' : 'desbloqueado'} exitosamente`,
      usuario: {
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        bloqueado: usuario.bloqueado
      }
    });
  } catch (error) {
    console.error('Error al bloquear usuario:', error);
    res.status(500).json({
      error: 'Error al bloquear usuario',
      message: error.message
    });
  }
};

module.exports = {
  listTaskers,
  verifyTasker,
  getStats,
  listClientes,
  listTareas,
  blockUser
};



