/**
 * Controller de Tareas
 * 
 * Maneja la lógica relacionada con las tareas/servicios.
 */

// Código PostgreSQL comentado - ahora usamos JSON
// const { Op } = require('sequelize');
// const { sequelize } = require('../config/database');
const Tarea = require('../models/Tarea');
const UsuarioCliente = require('../models/UsuarioCliente');

/**
 * Crear nueva Tarea
 * POST /api/task/create
 * Solo clientes pueden crear tareas
 */
const createTask = async (req, res) => {
  try {
    const {
      tipo_servicio,
      descripcion,
      ubicacion,
      fecha_hora_requerida,
      requiere_licencia,
      monto_total_acordado
    } = req.body;

    // Verificar que el usuario sea un cliente
    if (req.user.tipo !== 'cliente') {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: 'Solo los clientes pueden crear tareas'
      });
    }

    // Validaciones básicas
    if (!tipo_servicio || !descripcion || !ubicacion || !fecha_hora_requerida || !monto_total_acordado) {
      return res.status(400).json({
        error: 'Campos requeridos faltantes',
        message: 'tipo_servicio, descripcion, ubicacion, fecha_hora_requerida y monto_total_acordado son obligatorios'
      });
    }

    // Validar tipo de servicio
    if (!['EXPRESS', 'ESPECIALISTA'].includes(tipo_servicio)) {
      return res.status(400).json({
        error: 'Tipo de servicio inválido',
        message: 'tipo_servicio debe ser EXPRESS o ESPECIALISTA'
      });
    }

    // Validar monto
    const monto = parseFloat(monto_total_acordado);
    if (isNaN(monto) || monto <= 0) {
      return res.status(400).json({
        error: 'Monto inválido',
        message: 'monto_total_acordado debe ser un número mayor a 0'
      });
    }

    // Validar fecha
    const fecha = new Date(fecha_hora_requerida);
    if (isNaN(fecha.getTime())) {
      return res.status(400).json({
        error: 'Fecha inválida',
        message: 'fecha_hora_requerida debe ser una fecha válida'
      });
    }

    // Verificar que la fecha no sea en el pasado
    if (fecha < new Date()) {
      return res.status(400).json({
        error: 'Fecha inválida',
        message: 'La fecha y hora requerida no puede ser en el pasado'
      });
    }

    // Verificar que el cliente existe
    const cliente = await UsuarioCliente.findByPk(req.user.id);
    if (!cliente) {
      return res.status(404).json({
        error: 'Cliente no encontrado',
        message: 'No se encontró el cliente autenticado'
      });
    }

    // Calcular comisión (5% según definición de negocio)
    // Nota: Esta comisión se calcula sobre el monto después de la comisión de Mercado Pago (5%)
    // Por ahora calculamos sobre el total, pero en producción se ajustará
    const comision_app = 0.05;
    const monto_tasker_neto = monto * (1 - comision_app);

    // Crear la tarea
    const nuevaTarea = await Tarea.create({
      cliente_id: req.user.id,
      tasker_id: null, // Aún no está asignada
      tipo_servicio,
      descripcion,
      ubicacion,
      fecha_hora_requerida: fecha,
      requiere_licencia: requiere_licencia === true || requiere_licencia === 'true',
      monto_total_acordado: monto,
      comision_app,
      estado: 'PENDIENTE'
    });

    // Retornar la tarea creada
    res.status(201).json({
      message: 'Tarea creada exitosamente',
      tarea: {
        id: nuevaTarea.id,
        cliente_id: nuevaTarea.cliente_id,
        tipo_servicio: nuevaTarea.tipo_servicio,
        descripcion: nuevaTarea.descripcion,
        ubicacion: nuevaTarea.ubicacion,
        fecha_hora_requerida: nuevaTarea.fecha_hora_requerida,
        requiere_licencia: nuevaTarea.requiere_licencia,
        monto_total_acordado: nuevaTarea.monto_total_acordado,
        comision_app: nuevaTarea.comision_app,
        monto_tasker_neto: monto_tasker_neto,
        estado: nuevaTarea.estado,
        createdAt: nuevaTarea.createdAt
      }
    });
  } catch (error) {
    console.error('Error al crear tarea:', error);
    res.status(500).json({
      error: 'Error al crear tarea',
      message: error.message
    });
  }
};

/**
 * Obtener tareas del usuario actual
 * GET /api/task/my-tasks
 * Solo el cliente puede ver sus propias tareas
 */
const getUserTasks = async (req, res) => {
  try {
    // Verificar que el usuario sea un cliente
    if (req.user.tipo !== 'cliente') {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: 'Solo los clientes pueden ver sus tareas'
      });
    }

    // Buscar todas las tareas del cliente
    const tareas = await Tarea.findAll({
      where: {
        cliente_id: req.user.id
      },
      order: [['createdAt', 'DESC']], // Más recientes primero
      attributes: [
        'id', 'tipo_servicio', 'descripcion', 'ubicacion',
        'fecha_hora_requerida', 'requiere_licencia', 'monto_total_acordado',
        'estado', 'createdAt'
      ]
    });

    res.json({
      message: 'Tareas obtenidas exitosamente',
      tareas: tareas
    });
  } catch (error) {
    console.error('Error al obtener tareas del usuario:', error);
    res.status(500).json({
      error: 'Error al obtener tareas',
      message: error.message
    });
  }
};

/**
 * Obtener tareas disponibles para taskers
 * GET /api/task/available
 * Solo taskers aprobados pueden ver tareas disponibles
 */
const getAvailableTasks = async (req, res) => {
  try {

    // Verificar que el usuario sea un tasker aprobado
    if (req.user.tipo !== 'tasker') {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: 'Solo los taskers pueden ver tareas disponibles'
      });
    }

    // Verificar que el tasker esté aprobado
    const Tasker = require('../models/Tasker');
    const tasker = await Tasker.findByPk(req.user.id);
    if (!tasker || !tasker.aprobado_admin) {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: 'Tu cuenta debe estar aprobada por un administrador'
      });
    }

    // Construir filtros dinámicos desde query parameters
    const filtros = {
      estado: 'PENDIENTE',
      tasker_id: null // No asignadas aún
    };

    // Filtro por tipo de servicio
    if (req.query.tipo_servicio) {
      filtros.tipo_servicio = req.query.tipo_servicio.toUpperCase();
    }

    // Filtro por precio mínimo
    if (req.query.precio_min) {
      filtros.monto_total_acordado = {
        gte: parseFloat(req.query.precio_min)
      };
    }

    // Filtro por precio máximo
    if (req.query.precio_max) {
      if (filtros.monto_total_acordado) {
        filtros.monto_total_acordado.lte = parseFloat(req.query.precio_max);
      } else {
        filtros.monto_total_acordado = {
          lte: parseFloat(req.query.precio_max)
        };
      }
    }

    // Filtro por requiere_licencia
    if (req.query.requiere_licencia !== undefined) {
      filtros.requiere_licencia = req.query.requiere_licencia === 'true';
    }

    // Filtro por fecha desde
    if (req.query.fecha_desde) {
      filtros.fecha_hora_requerida = {
        gte: new Date(req.query.fecha_desde)
      };
    }

    // Filtro por fecha hasta
    if (req.query.fecha_hasta) {
      if (filtros.fecha_hora_requerida) {
        filtros.fecha_hora_requerida.lte = new Date(req.query.fecha_hasta);
      } else {
        filtros.fecha_hora_requerida = {
          lte: new Date(req.query.fecha_hasta)
        };
      }
    }

    // Filtro por ciudad (se maneja en el modelo JSON)
    if (req.query.ciudad) {
      filtros.ciudad = req.query.ciudad;
    }

    // Paginación
    const pagina = parseInt(req.query.pagina) || 1;
    const limite = parseInt(req.query.limite) || 10;
    const offset = (pagina - 1) * limite;

    // Buscar tareas pendientes que no estén asignadas
    const { count, rows: tareasDisponibles } = await Tarea.findAndCountAll({
      where: filtros,
      include: [{
        model: UsuarioCliente,
        as: 'cliente',
        attributes: ['nombre', 'apellido']
      }],
      order: [['createdAt', 'DESC']], // Más recientes primero
      limit: limite,
      offset: offset,
      attributes: [
        'id', 'tipo_servicio', 'descripcion', 'ubicacion',
        'fecha_hora_requerida', 'requiere_licencia', 'monto_total_acordado',
        'estado', 'createdAt'
      ]
    });

    // Verificar si el tasker ya aplicó a cada tarea
    const SolicitudTarea = require('../models/SolicitudTarea');
    const tareasConAplicacion = await Promise.all(
      tareasDisponibles.map(async (tarea) => {
        const aplicacion = await SolicitudTarea.findOne({
          where: {
            tarea_id: tarea.id,
            tasker_id: req.user.id,
            tipo: 'APLICACION'
          }
        });
        
        // Convertir a objeto plano si es instancia de Tarea
        const tareaObj = tarea.id ? tarea : { ...tarea };
        tareaObj.ya_aplico = !!aplicacion;
        return tareaObj;
      })
    );

    // Información de paginación
    const totalPaginas = Math.ceil(count / limite);

    res.json({
      message: 'Tareas disponibles obtenidas exitosamente',
      tareas: tareasConAplicacion,
      paginacion: {
        paginaActual: pagina,
        totalPaginas: totalPaginas,
        totalTareas: count,
        tareasPorPagina: limite,
        tieneSiguiente: pagina < totalPaginas,
        tieneAnterior: pagina > 1
      },
      filtrosAplicados: {
        tipo_servicio: req.query.tipo_servicio || null,
        precio_min: req.query.precio_min || null,
        precio_max: req.query.precio_max || null,
        ciudad: req.query.ciudad || null,
        requiere_licencia: req.query.requiere_licencia || null,
        fecha_desde: req.query.fecha_desde || null,
        fecha_hasta: req.query.fecha_hasta || null
      }
    });
  } catch (error) {
    console.error('Error al obtener tareas disponibles:', error);
    res.status(500).json({
      error: 'Error al obtener tareas disponibles',
      message: error.message
    });
  }
};

/**
 * Tasker aplica a una tarea
 * POST /api/task/apply/:id
 * Solo taskers aprobados pueden aplicar
 */
const applyToTask = async (req, res) => {
  try {
    const tareaId = parseInt(req.params.id);
    
    // Verificar que el usuario sea un tasker
    if (req.user.tipo !== 'tasker') {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: 'Solo los taskers pueden aplicar a tareas'
      });
    }

    // Verificar que el tasker esté aprobado
    const Tasker = require('../models/Tasker');
    const tasker = await Tasker.findByPk(req.user.id);
    if (!tasker || !tasker.aprobado_admin) {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: 'Tu cuenta debe estar aprobada por un administrador'
      });
    }

    // Verificar que la tarea existe y está disponible
    const tarea = await Tarea.findByPk(tareaId);
    if (!tarea) {
      return res.status(404).json({
        error: 'Tarea no encontrada',
        message: 'La tarea especificada no existe'
      });
    }

    if (tarea.estado !== 'PENDIENTE') {
      return res.status(400).json({
        error: 'Tarea no disponible',
        message: 'Esta tarea ya no está disponible para aplicar'
      });
    }

    // Verificar que el tasker no haya aplicado ya
    const SolicitudTarea = require('../models/SolicitudTarea');
    const aplicacionExistente = await SolicitudTarea.findOne({
      where: {
        tarea_id: tareaId,
        tasker_id: req.user.id,
        tipo: 'APLICACION'
      }
    });

    if (aplicacionExistente) {
      return res.status(400).json({
        error: 'Ya aplicaste',
        message: 'Ya has aplicado a esta tarea'
      });
    }

    // Crear la aplicación
    const aplicacion = await SolicitudTarea.create({
      tarea_id: tareaId,
      tasker_id: req.user.id,
      cliente_id: tarea.cliente_id,
      tipo: 'APLICACION',
      estado: 'PENDIENTE'
    });

    res.status(201).json({
      message: 'Aplicación enviada exitosamente',
      aplicacion: {
        id: aplicacion.id,
        tarea_id: aplicacion.tarea_id,
        estado: aplicacion.estado,
        createdAt: aplicacion.createdAt
      }
    });
  } catch (error) {
    console.error('Error al aplicar a tarea:', error);
    res.status(500).json({
      error: 'Error al aplicar a tarea',
      message: error.message
    });
  }
};

/**
 * Obtener aplicaciones a las tareas del cliente
 * GET /api/task/applications/:tareaId
 * Solo el cliente dueño de la tarea puede ver las aplicaciones
 */
const getTaskApplications = async (req, res) => {
  try {
    const tareaId = parseInt(req.params.tareaId);

    // Verificar que el usuario sea un cliente
    if (req.user.tipo !== 'cliente') {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: 'Solo los clientes pueden ver aplicaciones a sus tareas'
      });
    }

    // Verificar que la tarea existe y pertenece al cliente
    const tarea = await Tarea.findByPk(tareaId);
    if (!tarea) {
      return res.status(404).json({
        error: 'Tarea no encontrada',
        message: 'La tarea especificada no existe'
      });
    }

    if (tarea.cliente_id !== req.user.id) {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: 'Solo puedes ver aplicaciones de tus propias tareas'
      });
    }

    // Obtener todas las aplicaciones a esta tarea
    const SolicitudTarea = require('../models/SolicitudTarea');
    const Tasker = require('../models/Tasker');
    
    const aplicaciones = await SolicitudTarea.findAll({
      where: {
        tarea_id: tareaId,
        tipo: 'APLICACION'
      },
      order: [['createdAt', 'DESC']]
    });

    // Incluir información del tasker para cada aplicación
    const aplicacionesConTasker = await Promise.all(
      aplicaciones.map(async (aplicacion) => {
        const tasker = await Tasker.findByPk(aplicacion.tasker_id);
        return {
          id: aplicacion.id,
          tasker: tasker ? {
            id: tasker.id,
            nombre: tasker.nombre,
            apellido: tasker.apellido,
            email: tasker.email,
            telefono: tasker.telefono
          } : null,
          estado: aplicacion.estado,
          createdAt: aplicacion.createdAt
        };
      })
    );

    res.json({
      message: 'Aplicaciones obtenidas exitosamente',
      tarea: {
        id: tarea.id,
        descripcion: tarea.descripcion,
        estado: tarea.estado
      },
      aplicaciones: aplicacionesConTasker,
      total: aplicacionesConTasker.length
    });
  } catch (error) {
    console.error('Error al obtener aplicaciones:', error);
    res.status(500).json({
      error: 'Error al obtener aplicaciones',
      message: error.message
    });
  }
};

module.exports = {
  createTask,
  getUserTasks,
  getAvailableTasks,
  applyToTask,
  getTaskApplications
};

