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
const { checkAndAutoConfirmTask } = require('../utils/autoConfirmPayment');

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

/**
 * Cliente acepta una aplicación (elige un tasker)
 * POST /api/task/accept-application/:applicationId
 * Solo el cliente dueño de la tarea puede aceptar aplicaciones
 */
const acceptApplication = async (req, res) => {
  try {
    const applicationId = parseInt(req.params.applicationId);

    // Verificar que el usuario sea un cliente
    if (req.user.tipo !== 'cliente') {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: 'Solo los clientes pueden aceptar aplicaciones'
      });
    }

    // Obtener la aplicación
    const SolicitudTarea = require('../models/SolicitudTarea');
    const aplicacion = await SolicitudTarea.findByPk(applicationId);

    if (!aplicacion) {
      return res.status(404).json({
        error: 'Aplicación no encontrada',
        message: 'La aplicación especificada no existe'
      });
    }

    // Verificar que la aplicación es del tipo correcto
    if (aplicacion.tipo !== 'APLICACION') {
      return res.status(400).json({
        error: 'Tipo inválido',
        message: 'Esta no es una aplicación de tasker'
      });
    }

    // Verificar que el cliente es dueño de la tarea
    const tarea = await Tarea.findByPk(aplicacion.tarea_id);
    if (!tarea) {
      return res.status(404).json({
        error: 'Tarea no encontrada',
        message: 'La tarea asociada no existe'
      });
    }

    if (tarea.cliente_id !== req.user.id) {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: 'Solo puedes aceptar aplicaciones de tus propias tareas'
      });
    }

    // Verificar que la tarea esté en estado PENDIENTE
    if (tarea.estado !== 'PENDIENTE') {
      return res.status(400).json({
        error: 'Tarea no disponible',
        message: 'Esta tarea ya no está disponible para asignar'
      });
    }

    // Verificar que la aplicación esté pendiente
    if (aplicacion.estado !== 'PENDIENTE') {
      return res.status(400).json({
        error: 'Aplicación no disponible',
        message: 'Esta aplicación ya fue procesada'
      });
    }

    // Verificar que el tasker existe y está aprobado
    const Tasker = require('../models/Tasker');
    const tasker = await Tasker.findByPk(aplicacion.tasker_id);
    if (!tasker || !tasker.aprobado_admin) {
      return res.status(400).json({
        error: 'Tasker no válido',
        message: 'El tasker no existe o no está aprobado'
      });
    }

    // Actualizar la aplicación a ACEPTADA
    await aplicacion.update({
      estado: 'ACEPTADA'
    });

    // Actualizar la tarea: asignar tasker y cambiar estado
    await tarea.update({
      tasker_id: aplicacion.tasker_id,
      estado: 'ASIGNADA'
    });

    // Rechazar automáticamente las otras aplicaciones pendientes de esta tarea
    const todasLasAplicaciones = await SolicitudTarea.findAll({
      where: {
        tarea_id: tarea.id,
        tipo: 'APLICACION',
        estado: 'PENDIENTE'
      }
    });

    // Filtrar para excluir la aplicación aceptada
    const otrasAplicaciones = todasLasAplicaciones.filter(
      app => app.id !== applicationId
    );

    for (const otraAplicacion of otrasAplicaciones) {
      await otraAplicacion.update({
        estado: 'RECHAZADA'
      });
    }

    res.json({
      message: 'Aplicación aceptada exitosamente. Tarea asignada al tasker.',
      tarea: {
        id: tarea.id,
        estado: tarea.estado,
        tasker_id: tarea.tasker_id
      },
      aplicacion: {
        id: aplicacion.id,
        estado: aplicacion.estado,
        tasker: {
          id: tasker.id,
          nombre: tasker.nombre,
          apellido: tasker.apellido
        }
      }
    });
  } catch (error) {
    console.error('Error al aceptar aplicación:', error);
    res.status(500).json({
      error: 'Error al aceptar aplicación',
      message: error.message
    });
  }
};

/**
 * Obtener tareas asignadas al tasker
 * GET /api/task/my-assigned-tasks
 * Solo taskers pueden ver sus tareas asignadas
 */
const getMyAssignedTasks = async (req, res) => {
  try {
    // Verificar que el usuario sea un tasker
    if (req.user.tipo !== 'tasker') {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: 'Solo los taskers pueden ver sus tareas asignadas'
      });
    }

    // Buscar tareas asignadas a este tasker (TODAS, sin filtrar por estado)
    const todasLasTareas = await Tarea.findAll({
      where: {
        tasker_id: req.user.id
      },
      order: [['createdAt', 'DESC']]
    });

    // Devolver TODAS las tareas (el frontend filtrará según la pestaña)
    const tareas = todasLasTareas;

    // Incluir información del cliente para cada tarea
    const UsuarioCliente = require('../models/UsuarioCliente');
    const tareasConCliente = await Promise.all(
      tareas.map(async (tarea) => {
        const cliente = await UsuarioCliente.findByPk(tarea.cliente_id);
        const tareaObj = tarea.id ? tarea : { ...tarea };
        tareaObj.cliente = cliente ? {
          id: cliente.id,
          nombre: cliente.nombre,
          apellido: cliente.apellido,
          telefono: cliente.telefono
        } : null;
        return tareaObj;
      })
    );

    res.json({
      message: 'Tareas asignadas obtenidas exitosamente',
      tareas: tareasConCliente,
      total: tareasConCliente.length
    });
  } catch (error) {
    console.error('Error al obtener tareas asignadas:', error);
    res.status(500).json({
      error: 'Error al obtener tareas asignadas',
      message: error.message
    });
  }
};

/**
 * Tasker marca tarea como "en proceso" (empezó el trabajo)
 * POST /api/task/start/:id
 * Solo el tasker asignado puede marcar la tarea como en proceso
 */
const startTask = async (req, res) => {
  try {
    const tareaId = parseInt(req.params.id);

    // Verificar que el usuario sea un tasker
    if (req.user.tipo !== 'tasker') {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: 'Solo los taskers pueden marcar tareas como en proceso'
      });
    }

    // Verificar que la tarea existe
    const tarea = await Tarea.findByPk(tareaId);
    if (!tarea) {
      return res.status(404).json({
        error: 'Tarea no encontrada',
        message: 'La tarea especificada no existe'
      });
    }

    // Verificar que la tarea está asignada a este tasker
    if (tarea.tasker_id !== req.user.id) {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: 'Solo puedes marcar como en proceso las tareas asignadas a ti'
      });
    }

    // Verificar que la tarea está en estado ASIGNADA
    if (tarea.estado !== 'ASIGNADA') {
      return res.status(400).json({
        error: 'Estado inválido',
        message: `Solo puedes empezar tareas en estado ASIGNADA. Estado actual: ${tarea.estado}`
      });
    }

    // Actualizar la tarea: cambiar estado y registrar fecha de inicio
    await tarea.update({
      estado: 'EN_PROCESO',
      fecha_inicio_trabajo: new Date().toISOString()
    });

    res.json({
      message: 'Tarea marcada como en proceso exitosamente',
      tarea: {
        id: tarea.id,
        estado: tarea.estado,
        fecha_inicio_trabajo: tarea.fecha_inicio_trabajo
      }
    });
  } catch (error) {
    console.error('Error al marcar tarea como en proceso:', error);
    res.status(500).json({
      error: 'Error al marcar tarea como en proceso',
      message: error.message
    });
  }
};

/**
 * Tasker marca tarea como finalizada (terminó el trabajo)
 * POST /api/task/complete/:id
 * Solo el tasker asignado puede finalizar la tarea
 * Cambia estado: EN_PROCESO → PENDIENTE_PAGO
 */
const completeTask = async (req, res) => {
  try {
    const tareaId = parseInt(req.params.id);

    // Verificar que el usuario sea un tasker
    if (req.user.tipo !== 'tasker') {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: 'Solo los taskers pueden finalizar tareas'
      });
    }

    // Verificar que la tarea existe
    const tarea = await Tarea.findByPk(tareaId);
    if (!tarea) {
      return res.status(404).json({
        error: 'Tarea no encontrada',
        message: 'La tarea especificada no existe'
      });
    }

    // Verificar que la tarea está asignada a este tasker
    if (tarea.tasker_id !== req.user.id) {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: 'Solo puedes finalizar las tareas asignadas a ti'
      });
    }

    // Verificar que la tarea está en estado EN_PROCESO
    if (tarea.estado !== 'EN_PROCESO') {
      return res.status(400).json({
        error: 'Estado inválido',
        message: `Solo puedes finalizar tareas en estado EN_PROCESO. Estado actual: ${tarea.estado}`
      });
    }

    // Actualizar la tarea: cambiar estado y registrar fecha de finalización
    await tarea.update({
      estado: 'PENDIENTE_PAGO',
      fecha_finalizacion_trabajo: new Date().toISOString()
    });

    res.json({
      message: 'Tarea marcada como finalizada exitosamente. Esperando confirmación del cliente.',
      tarea: {
        id: tarea.id,
        estado: tarea.estado,
        fecha_finalizacion_trabajo: tarea.fecha_finalizacion_trabajo
      }
    });
  } catch (error) {
    console.error('Error al finalizar tarea:', error);
    res.status(500).json({
      error: 'Error al finalizar tarea',
      message: error.message
    });
  }
};

/**
 * Cliente confirma pago (está conforme con el trabajo)
 * POST /api/task/confirm-payment/:id
 * Solo el cliente dueño de la tarea puede confirmar el pago
 * Cambia estado: PENDIENTE_PAGO → FINALIZADA
 */
const confirmPayment = async (req, res) => {
  try {
    const tareaId = parseInt(req.params.id);

    // Verificar que el usuario sea un cliente
    if (req.user.tipo !== 'cliente') {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: 'Solo los clientes pueden confirmar el pago'
      });
    }

    // Verificar que la tarea existe
    const tarea = await Tarea.findByPk(tareaId);
    if (!tarea) {
      return res.status(404).json({
        error: 'Tarea no encontrada',
        message: 'La tarea especificada no existe'
      });
    }

    // Verificar que la tarea pertenece a este cliente
    if (tarea.cliente_id !== req.user.id) {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: 'Solo puedes confirmar el pago de tus propias tareas'
      });
    }

    // Verificar auto-confirmación antes de verificar estado
    await checkAndAutoConfirmTask(tareaId);
    
    // Recargar la tarea por si fue auto-confirmada
    const tareaActualizada = await Tarea.findByPk(tareaId);
    
    // Verificar que la tarea está en estado PENDIENTE_PAGO
    if (tareaActualizada.estado !== 'PENDIENTE_PAGO') {
      if (tareaActualizada.estado === 'FINALIZADA') {
        return res.json({
          message: 'La tarea ya está finalizada',
          tarea: {
            id: tareaActualizada.id,
            estado: tareaActualizada.estado,
            fecha_confirmacion_pago: tareaActualizada.fecha_confirmacion_pago,
            pago_recibido_tasker: tareaActualizada.pago_recibido_tasker
          }
        });
      }
      return res.status(400).json({
        error: 'Estado inválido',
        message: `Solo puedes confirmar el pago de tareas en estado PENDIENTE_PAGO. Estado actual: ${tareaActualizada.estado}`
      });
    }

    // Verificar si ya confirmó antes
    if (tareaActualizada.fecha_confirmacion_pago) {
      return res.json({
        message: 'Ya confirmaste el pago de esta tarea. Esperando confirmación del tasker.',
        tarea: {
          id: tareaActualizada.id,
          estado: tareaActualizada.estado,
          fecha_confirmacion_pago: tareaActualizada.fecha_confirmacion_pago,
          pago_recibido_tasker: tareaActualizada.pago_recibido_tasker
        }
      });
    }

    // Actualizar la tarea: marcar que el cliente confirmó el pago (pero NO cambiar estado todavía)
    const fechaConfirmacion = new Date().toISOString();
    await tareaActualizada.update({
      fecha_confirmacion_pago: fechaConfirmacion,
      auto_confirmado: false // Confirmado manualmente
    });

    // Recargar la tarea actualizada
    const tareaRecargada = await Tarea.findByPk(tareaId);
    
    // Si el tasker ya confirmó que recibió el pago, entonces finalizar la tarea
    if (tareaRecargada.pago_recibido_tasker) {
      await tareaRecargada.update({
        estado: 'FINALIZADA'
      });
      
      res.json({
        message: 'Pago confirmado exitosamente. Como el tasker ya confirmó la recepción, la tarea ha sido finalizada.',
        tarea: {
          id: tareaRecargada.id,
          estado: 'FINALIZADA',
          fecha_confirmacion_pago: fechaConfirmacion,
          pago_recibido_tasker: true
        }
      });
    } else {
      res.json({
        message: 'Pago confirmado exitosamente. Esperando confirmación del tasker para finalizar la tarea.',
        tarea: {
          id: tareaRecargada.id,
          estado: tareaRecargada.estado, // Sigue en PENDIENTE_PAGO
          fecha_confirmacion_pago: fechaConfirmacion,
          pago_recibido_tasker: false
        }
      });
    }
  } catch (error) {
    console.error('Error al confirmar pago:', error);
    res.status(500).json({
      error: 'Error al confirmar pago',
      message: error.message
    });
  }
};

/**
 * Tasker confirma que recibió el pago
 * POST /api/task/confirm-payment-received/:id
 * Solo el tasker asignado puede confirmar que recibió el pago
 * Solo disponible para tareas en estado FINALIZADA
 */
const confirmPaymentReceived = async (req, res) => {
  try {
    const tareaId = parseInt(req.params.id);

    // Verificar que el usuario sea un tasker
    if (req.user.tipo !== 'tasker') {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: 'Solo los taskers pueden confirmar recepción de pago'
      });
    }

    // Verificar que la tarea existe
    const tarea = await Tarea.findByPk(tareaId);
    if (!tarea) {
      return res.status(404).json({
        error: 'Tarea no encontrada',
        message: 'La tarea especificada no existe'
      });
    }

    // Verificar que la tarea está asignada a este tasker
    if (tarea.tasker_id !== req.user.id) {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: 'Solo puedes confirmar recepción de pago de tus propias tareas'
      });
    }

    // Verificar que la tarea está en estado PENDIENTE_PAGO o FINALIZADA
    if (tarea.estado !== 'PENDIENTE_PAGO' && tarea.estado !== 'FINALIZADA') {
      return res.status(400).json({
        error: 'Estado inválido',
        message: `Solo puedes confirmar recepción de pago de tareas en estado PENDIENTE_PAGO o FINALIZADA. Estado actual: ${tarea.estado}`
      });
    }

    // Verificar que no haya confirmado ya
    if (tarea.pago_recibido_tasker) {
      return res.json({
        message: 'Ya confirmaste la recepción del pago para esta tarea',
        tarea: {
          id: tarea.id,
          estado: tarea.estado,
          fecha_confirmacion_pago: tarea.fecha_confirmacion_pago,
          pago_recibido_tasker: true,
          fecha_confirmacion_recepcion_pago: tarea.fecha_confirmacion_recepcion_pago
        }
      });
    }

    // Actualizar la tarea: marcar que el tasker recibió el pago
    const fechaConfirmacionRecepcion = new Date().toISOString();
    await tarea.update({
      pago_recibido_tasker: true,
      fecha_confirmacion_recepcion_pago: fechaConfirmacionRecepcion
    });

    // Recargar la tarea actualizada
    const tareaRecargada = await Tarea.findByPk(tareaId);
    
    // Si el cliente ya confirmó el pago, entonces finalizar la tarea
    if (tareaRecargada.fecha_confirmacion_pago) {
      await tareaRecargada.update({
        estado: 'FINALIZADA'
      });
      
      res.json({
        message: 'Recepción de pago confirmada exitosamente. Como el cliente ya confirmó el pago, la tarea ha sido finalizada.',
        tarea: {
          id: tareaRecargada.id,
          estado: 'FINALIZADA',
          fecha_confirmacion_pago: tareaRecargada.fecha_confirmacion_pago,
          pago_recibido_tasker: true,
          fecha_confirmacion_recepcion_pago: fechaConfirmacionRecepcion
        }
      });
    } else {
      res.json({
        message: 'Recepción de pago confirmada exitosamente. Esperando confirmación del cliente para finalizar la tarea.',
        tarea: {
          id: tareaRecargada.id,
          estado: tareaRecargada.estado, // Sigue en PENDIENTE_PAGO
          fecha_confirmacion_pago: null,
          pago_recibido_tasker: true,
          fecha_confirmacion_recepcion_pago: fechaConfirmacionRecepcion
        }
      });
    }

    res.json({
      message: 'Recepción de pago confirmada exitosamente',
      tarea: {
        id: tarea.id,
        pago_recibido_tasker: tarea.pago_recibido_tasker,
        fecha_confirmacion_recepcion_pago: tarea.fecha_confirmacion_recepcion_pago
      }
    });
  } catch (error) {
    console.error('Error al confirmar recepción de pago:', error);
    res.status(500).json({
      error: 'Error al confirmar recepción de pago',
      message: error.message
    });
  }
};

module.exports = {
  createTask,
  getUserTasks,
  getAvailableTasks,
  applyToTask,
  getTaskApplications,
  acceptApplication,
  getMyAssignedTasks,
  startTask,
  completeTask,
  confirmPayment,
  confirmPaymentReceived
};

