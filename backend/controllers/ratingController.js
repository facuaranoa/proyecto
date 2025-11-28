/**
 * Controller de Calificaciones
 * 
 * Maneja la lógica relacionada con las calificaciones mutuas entre clientes y taskers.
 */

const Calificacion = require('../models/Calificacion');
const Tarea = require('../models/Tarea');
const UsuarioCliente = require('../models/UsuarioCliente');
const Tasker = require('../models/Tasker');

/**
 * Crear una calificación
 * POST /api/rating/create
 * Cliente o tasker califica al otro después de finalizar una tarea
 */
const createRating = async (req, res) => {
  try {
    const { tarea_id, estrellas, puntualidad, calidad_trabajo, comunicacion, profesionalismo, comentario } = req.body;

    // Validaciones
    if (!tarea_id || !estrellas) {
      return res.status(400).json({
        error: 'Datos incompletos',
        message: 'tarea_id y estrellas son obligatorios'
      });
    }

    // Validar que todas las calificaciones estén entre 1 y 5
    const validarCalificacion = (valor, nombre) => {
      if (valor !== null && valor !== undefined) {
        if (valor < 1 || valor > 5) {
          return `${nombre} debe estar entre 1 y 5`;
        }
      }
      return null;
    };

    const errores = [
      validarCalificacion(estrellas, 'Calificación general'),
      validarCalificacion(puntualidad, 'Puntualidad'),
      validarCalificacion(calidad_trabajo, 'Calidad del trabajo'),
      validarCalificacion(comunicacion, 'Comunicación'),
      validarCalificacion(profesionalismo, 'Profesionalismo')
    ].filter(e => e !== null);

    if (errores.length > 0) {
      return res.status(400).json({
        error: 'Calificación inválida',
        message: errores.join(', ')
      });
    }

    // Verificar que la tarea existe
    const tarea = await Tarea.findByPk(tarea_id);
    if (!tarea) {
      return res.status(404).json({
        error: 'Tarea no encontrada',
        message: 'La tarea especificada no existe'
      });
    }

    // Verificar que la tarea está finalizada
    if (tarea.estado !== 'FINALIZADA') {
      return res.status(400).json({
        error: 'Tarea no finalizada',
        message: 'Solo puedes calificar tareas que estén finalizadas'
      });
    }

    // Verificar que la tarea haya empezado (debe tener fecha de inicio o estar en proceso/finalizada)
    if (!tarea.fecha_inicio_trabajo && tarea.estado !== 'EN_PROCESO' && tarea.estado !== 'FINALIZADA') {
      return res.status(400).json({
        error: 'Tarea no iniciada',
        message: 'Solo puedes calificar tareas que hayan empezado'
      });
    }

    // Verificar plazo de 7 días desde la finalización
    if (tarea.fecha_finalizacion_trabajo) {
      const fechaFinalizacion = new Date(tarea.fecha_finalizacion_trabajo);
      const fechaLimite = new Date(fechaFinalizacion);
      fechaLimite.setDate(fechaLimite.getDate() + 7);
      const ahora = new Date();

      if (ahora > fechaLimite) {
        return res.status(400).json({
          error: 'Plazo vencido',
          message: 'El plazo para calificar esta tarea ha vencido (7 días desde la finalización)'
        });
      }
    }

    // Verificar que el usuario está involucrado en la tarea
    const esCliente = req.user.tipo === 'cliente' && tarea.cliente_id === req.user.id;
    const esTasker = req.user.tipo === 'tasker' && tarea.tasker_id === req.user.id;

    if (!esCliente && !esTasker) {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: 'Solo puedes calificar tareas en las que estés involucrado'
      });
    }

    // Determinar quién califica y quién es calificado
    let calificador_tipo, calificado_id, calificado_tipo;

    if (req.user.tipo === 'cliente') {
      calificador_tipo = 'cliente';
      calificado_id = tarea.tasker_id;
      calificado_tipo = 'tasker';
    } else {
      calificador_tipo = 'tasker';
      calificado_id = tarea.cliente_id;
      calificado_tipo = 'cliente';
    }

    // Verificar que no haya calificado ya esta tarea
    const calificacionExistente = await Calificacion.findOne({
      where: {
        tarea_id: tarea_id,
        calificador_id: req.user.id,
        calificador_tipo: calificador_tipo
      }
    });

    if (calificacionExistente) {
      // Verificar que no hayan pasado más de 7 días desde la creación de la calificación
      const fechaCalificacion = new Date(calificacionExistente.createdAt);
      const fechaLimiteEdicion = new Date(fechaCalificacion);
      fechaLimiteEdicion.setDate(fechaLimiteEdicion.getDate() + 7);
      const ahora = new Date();

      if (ahora > fechaLimiteEdicion) {
        return res.status(400).json({
          error: 'Plazo vencido',
          message: 'No puedes editar una calificación después de 7 días'
        });
      }

      // Si ya existe y está dentro del plazo, actualizar
      await calificacionExistente.update({
        estrellas,
        puntualidad: puntualidad || null,
        calidad_trabajo: calidad_trabajo || null,
        comunicacion: comunicacion || null,
        profesionalismo: profesionalismo || null,
        comentario: comentario || null
      });

      return res.json({
        message: 'Calificación actualizada exitosamente',
        calificacion: calificacionExistente
      });
    }

    // Crear nueva calificación
    const calificacion = new Calificacion({
      tarea_id,
      calificador_id: req.user.id,
      calificador_tipo,
      calificado_id,
      calificado_tipo,
      estrellas,
      puntualidad: puntualidad || null,
      calidad_trabajo: calidad_trabajo || null,
      comunicacion: comunicacion || null,
      profesionalismo: profesionalismo || null,
      comentario: comentario || null
    });

    await calificacion.save();

    res.status(201).json({
      message: 'Calificación creada exitosamente',
      calificacion: {
        id: calificacion.id,
        tarea_id: calificacion.tarea_id,
        estrellas: calificacion.estrellas,
        comentario: calificacion.comentario,
        createdAt: calificacion.createdAt
      }
    });
  } catch (error) {
    console.error('Error al crear calificación:', error);
    res.status(500).json({
      error: 'Error al crear calificación',
      message: error.message
    });
  }
};

/**
 * Obtener calificaciones de un usuario
 * GET /api/rating/user/:userId
 * Obtiene todas las calificaciones recibidas por un usuario
 */
const getUserRatings = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const { tipo } = req.query; // 'cliente' o 'tasker'

    if (!tipo || !['cliente', 'tasker'].includes(tipo)) {
      return res.status(400).json({
        error: 'Tipo inválido',
        message: 'Debes especificar el tipo de usuario (cliente o tasker)'
      });
    }

    const calificaciones = await Calificacion.findAll({
      where: {
        calificado_id: userId,
        calificado_tipo: tipo
      },
      order: [['createdAt', 'DESC']]
    });

    // Calcular promedio
    const promedio = await Calificacion.getAverageRating(userId, tipo);

    res.json({
      message: 'Calificaciones obtenidas exitosamente',
      calificaciones: calificaciones.map(c => ({
        id: c.id,
        estrellas: c.estrellas,
        puntualidad: c.puntualidad,
        calidad_trabajo: c.calidad_trabajo,
        comunicacion: c.comunicacion,
        profesionalismo: c.profesionalismo,
        comentario: c.comentario,
        createdAt: c.createdAt,
        tarea_id: c.tarea_id
      })),
      promedio: promedio.promedio,
      cantidad: promedio.cantidad
    });
  } catch (error) {
    console.error('Error al obtener calificaciones:', error);
    res.status(500).json({
      error: 'Error al obtener calificaciones',
      message: error.message
    });
  }
};

/**
 * Obtener calificación de una tarea específica
 * GET /api/rating/task/:tareaId
 * Obtiene las calificaciones de una tarea (cliente y tasker)
 */
const getTaskRatings = async (req, res) => {
  try {
    const tareaId = parseInt(req.params.tareaId);

    const calificaciones = await Calificacion.findAll({
      where: {
        tarea_id: tareaId
      }
    });

    res.json({
      message: 'Calificaciones de la tarea obtenidas exitosamente',
      calificaciones: calificaciones.map(c => ({
        id: c.id,
        calificador_tipo: c.calificador_tipo,
        estrellas: c.estrellas,
        puntualidad: c.puntualidad,
        calidad_trabajo: c.calidad_trabajo,
        comunicacion: c.comunicacion,
        profesionalismo: c.profesionalismo,
        comentario: c.comentario,
        createdAt: c.createdAt
      }))
    });
  } catch (error) {
    console.error('Error al obtener calificaciones de la tarea:', error);
    res.status(500).json({
      error: 'Error al obtener calificaciones de la tarea',
      message: error.message
    });
  }
};

module.exports = {
  createRating,
  getUserRatings,
  getTaskRatings
};




