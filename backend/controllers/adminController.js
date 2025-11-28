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

module.exports = {
  listTaskers,
  verifyTasker
};



