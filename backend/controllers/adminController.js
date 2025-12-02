/**
 * Controller de Administrador
 * 
 * Maneja la lógica relacionada con funciones administrativas.
 */

const Tasker = require('../models/Tasker');
const Categoria = require('../models/Categoria');

/**
 * Listar Taskers
 * GET /api/admin/taskers
 * Lista todos los taskers (o solo los pendientes si se especifica ?pendientes=true)
 */
const listTaskers = async (req, res) => {
  try {
    const { pendientes, rechazados } = req.query;
    
    let taskers;
    if (pendientes === 'true') {
      // Solo taskers pendientes de aprobación
      taskers = await Tasker.findAll({
        where: { aprobado_admin: false }
      });
    } else if (rechazados === 'true') {
      // Taskers rechazados (no aprobados)
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
      bloqueado: t.bloqueado !== undefined ? t.bloqueado : false,
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
      aprobado_admin: c.aprobado_admin !== undefined ? c.aprobado_admin : true,
      bloqueado: c.bloqueado !== undefined ? c.bloqueado : false,
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
        try {
          const cliente = await UsuarioCliente.findByPk(tarea.cliente_id);
          const tasker = tarea.tasker_id ? await Tasker.findByPk(tarea.tasker_id) : null;

          // Convertir la instancia de Tarea a objeto plano
          const tareaObj = {
            id: tarea.id,
            cliente_id: tarea.cliente_id,
            tasker_id: tarea.tasker_id,
            tipo_servicio: tarea.tipo_servicio,
            descripcion: tarea.descripcion,
            ubicacion: tarea.ubicacion,
            fecha_hora_requerida: tarea.fecha_hora_requerida,
            requiere_licencia: tarea.requiere_licencia,
            monto_total_acordado: tarea.monto_total_acordado,
            comision_app: tarea.comision_app,
            estado: tarea.estado,
            tiempo_respuesta_solicitud: tarea.tiempo_respuesta_solicitud,
            fecha_inicio_trabajo: tarea.fecha_inicio_trabajo,
            fecha_finalizacion_trabajo: tarea.fecha_finalizacion_trabajo,
            fecha_confirmacion_pago: tarea.fecha_confirmacion_pago,
            auto_confirmado: tarea.auto_confirmado,
            pago_recibido_tasker: tarea.pago_recibido_tasker,
            fecha_confirmacion_recepcion_pago: tarea.fecha_confirmacion_recepcion_pago,
            aprobado_admin: tarea.aprobado_admin !== undefined ? tarea.aprobado_admin : true,
            createdAt: tarea.createdAt,
            updatedAt: tarea.updatedAt,
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

          return tareaObj;
        } catch (error) {
          console.error(`Error procesando tarea ${tarea.id}:`, error);
          // Retornar tarea básica sin relaciones si hay error
          return {
            id: tarea.id,
            cliente_id: tarea.cliente_id,
            tasker_id: tarea.tasker_id,
            tipo_servicio: tarea.tipo_servicio,
            descripcion: tarea.descripcion,
            ubicacion: tarea.ubicacion,
            estado: tarea.estado,
            monto_total_acordado: tarea.monto_total_acordado,
            aprobado_admin: tarea.aprobado_admin !== undefined ? tarea.aprobado_admin : true,
            createdAt: tarea.createdAt,
            cliente: null,
            tasker: null
          };
        }
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

/**
 * Verificar/Aprobar Cliente
 * PUT /api/admin/cliente/verify/:id
 * Cambia aprobado_admin de FALSE a TRUE o viceversa
 */
const verifyCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const { aprobado, aprobado_admin } = req.body;

    const UsuarioCliente = require('../models/UsuarioCliente');
    const cliente = await UsuarioCliente.findByPk(id);
    
    if (!cliente) {
      return res.status(404).json({
        error: 'Cliente no encontrado',
        message: 'No existe un cliente con ese ID'
      });
    }

    // Aceptar tanto 'aprobado' como 'aprobado_admin' en el body
    const valorAprobado = aprobado !== undefined ? aprobado : aprobado_admin;
    const estaAprobado = valorAprobado === true || valorAprobado === 'true';

    // Actualizar el estado de aprobación
    await cliente.update({
      aprobado_admin: estaAprobado
    });

    // Retornar el cliente actualizado
    res.json({
      message: `Cliente ${cliente.aprobado_admin ? 'aprobado' : 'rechazado'} exitosamente`,
      cliente: {
        id: cliente.id,
        email: cliente.email,
        nombre: cliente.nombre,
        apellido: cliente.apellido,
        aprobado_admin: cliente.aprobado_admin
      }
    });
  } catch (error) {
    console.error('Error al verificar cliente:', error);
    res.status(500).json({
      error: 'Error al verificar cliente',
      message: error.message
    });
  }
};

/**
 * Verificar/Aprobar Tarea
 * PUT /api/admin/tarea/verify/:id
 * Cambia aprobado_admin de FALSE a TRUE o viceversa
 */
const verifyTarea = async (req, res) => {
  try {
    const { id } = req.params;
    const { aprobado, aprobado_admin } = req.body;

    const Tarea = require('../models/Tarea');
    const tarea = await Tarea.findByPk(id);
    
    if (!tarea) {
      return res.status(404).json({
        error: 'Tarea no encontrada',
        message: 'No existe una tarea con ese ID'
      });
    }

    // Aceptar tanto 'aprobado' como 'aprobado_admin' en el body
    const valorAprobado = aprobado !== undefined ? aprobado : aprobado_admin;
    const estaAprobado = valorAprobado === true || valorAprobado === 'true';

    // Actualizar el estado de aprobación
    await tarea.update({
      aprobado_admin: estaAprobado
    });

    // Retornar la tarea actualizada
    res.json({
      message: `Tarea ${tarea.aprobado_admin ? 'aprobada' : 'rechazada'} exitosamente`,
      tarea: {
        id: tarea.id,
        tipo_servicio: tarea.tipo_servicio,
        estado: tarea.estado,
        aprobado_admin: tarea.aprobado_admin
      }
    });
  } catch (error) {
    console.error('Error al verificar tarea:', error);
    res.status(500).json({
      error: 'Error al verificar tarea',
      message: error.message
    });
  }
};

/**
 * Obtener detalles completos de un usuario (tasker o cliente)
 * GET /api/admin/user/details/:id
 * Incluye: perfil completo, historial de tareas, calificaciones
 */
const getUserDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const { tipo } = req.query; // 'tasker' o 'cliente'

    if (!tipo || !['tasker', 'cliente'].includes(tipo)) {
      return res.status(400).json({
        error: 'Tipo inválido',
        message: 'El tipo debe ser "tasker" o "cliente"'
      });
    }

    let Usuario;
    if (tipo === 'tasker') {
      Usuario = require('../models/Tasker');
    } else {
      Usuario = require('../models/UsuarioCliente');
    }

    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).json({
        error: 'Usuario no encontrado',
        message: `No existe un ${tipo} con ese ID`
      });
    }

    // Obtener todas las tareas relacionadas
    const Tarea = require('../models/Tarea');
    let tareas = [];
    
    if (tipo === 'tasker') {
      tareas = await Tarea.findAll({
        where: { tasker_id: id }
      });
    } else {
      tareas = await Tarea.findAll({
        where: { cliente_id: id }
      });
    }

    // Incluir información del otro usuario en cada tarea
    const UsuarioCliente = require('../models/UsuarioCliente');
    const Tasker = require('../models/Tasker');
    
    const tareasConInfo = await Promise.all(
      tareas.map(async (tarea) => {
        const cliente = await UsuarioCliente.findByPk(tarea.cliente_id);
        const tasker = tarea.tasker_id ? await Tasker.findByPk(tarea.tasker_id) : null;

        const tareaObj = {
          id: tarea.id,
          tipo_servicio: tarea.tipo_servicio,
          descripcion: tarea.descripcion,
          ubicacion: tarea.ubicacion,
          fecha_hora_requerida: tarea.fecha_hora_requerida,
          estado: tarea.estado,
          monto_total_acordado: tarea.monto_total_acordado,
          fecha_inicio_trabajo: tarea.fecha_inicio_trabajo,
          fecha_finalizacion_trabajo: tarea.fecha_finalizacion_trabajo,
          createdAt: tarea.createdAt,
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
        return tareaObj;
      })
    );

    // Obtener calificaciones
    const Calificacion = require('../models/Calificacion');
    let calificaciones = [];
    
    if (tipo === 'tasker') {
      // Calificaciones donde este tasker fue calificado
      const todasCalificaciones = await Calificacion.findAll();
      calificaciones = todasCalificaciones.filter(c => {
        // Buscar en las tareas si el tasker fue calificado
        return tareasConInfo.some(t => t.id === c.tarea_id);
      });
    } else {
      // Calificaciones donde este cliente fue calificado
      const todasCalificaciones = await Calificacion.findAll();
      calificaciones = todasCalificaciones.filter(c => {
        return tareasConInfo.some(t => t.id === c.tarea_id);
      });
    }

    // Preparar datos del usuario (sin password_hash)
    const usuarioData = {
      id: usuario.id,
      email: usuario.email,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      telefono: usuario.telefono,
      aprobado_admin: usuario.aprobado_admin,
      bloqueado: usuario.bloqueado !== undefined ? usuario.bloqueado : false,
      createdAt: usuario.createdAt,
      updatedAt: usuario.updatedAt
    };

    // Agregar campos específicos según el tipo
    if (tipo === 'tasker') {
      usuarioData.cuit = usuario.cuit;
      usuarioData.monotributista_check = usuario.monotributista_check;
      usuarioData.disponible = usuario.disponible;
      usuarioData.skills = usuario.skills || [];
      usuarioData.licencias = usuario.licencias || [];
      usuarioData.categoria_principal = usuario.categoria_principal;
      usuarioData.especialidades = usuario.especialidades || [];
      usuarioData.descripcion_profesional = usuario.descripcion_profesional;
      usuarioData.cvu_cbu = usuario.cvu_cbu;
    } else {
      usuarioData.ubicacion_default = usuario.ubicacion_default;
    }

    res.json({
      message: 'Detalles del usuario obtenidos exitosamente',
      usuario: usuarioData,
      tareas: tareasConInfo,
      calificaciones: calificaciones,
      estadisticas: {
        totalTareas: tareasConInfo.length,
        tareasPorEstado: {
          PENDIENTE: tareasConInfo.filter(t => t.estado === 'PENDIENTE').length,
          ASIGNADA: tareasConInfo.filter(t => t.estado === 'ASIGNADA').length,
          EN_PROCESO: tareasConInfo.filter(t => t.estado === 'EN_PROCESO').length,
          PENDIENTE_PAGO: tareasConInfo.filter(t => t.estado === 'PENDIENTE_PAGO').length,
          FINALIZADA: tareasConInfo.filter(t => t.estado === 'FINALIZADA').length,
          CANCELADA: tareasConInfo.filter(t => t.estado === 'CANCELADA').length
        },
        totalCalificaciones: calificaciones.length,
        promedioCalificaciones: calificaciones.length > 0
          ? calificaciones.reduce((sum, c) => sum + (parseInt(c.estrellas) || 0), 0) / calificaciones.length
          : 0
      }
    });
  } catch (error) {
    console.error('Error al obtener detalles del usuario:', error);
    res.status(500).json({
      error: 'Error al obtener detalles del usuario',
      message: error.message
    });
  }
};

/**
 * ============================================================================
 * GESTIÓN DE CATEGORÍAS
 * ============================================================================
 */

/**
 * Obtener todas las categorías
 * GET /api/admin/categorias
 */
const getCategorias = async (req, res) => {
  try {
    const { incluir_inactivas } = req.query;
    
    let categorias;
    if (incluir_inactivas === 'true') {
      categorias = await Categoria.findAllIncludingInactive();
    } else {
      categorias = await Categoria.findAll();
    }

    res.json({
      success: true,
      categorias
    });
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: error.message
    });
  }
};

/**
 * Actualizar todas las categorías
 * PUT /api/admin/categorias
 */
const updateCategorias = async (req, res) => {
  try {
    const { categorias } = req.body;

    if (!Array.isArray(categorias)) {
      return res.status(400).json({
        error: 'Datos inválidos',
        message: 'categorias debe ser un array'
      });
    }

    const categoriasActualizadas = await Categoria.updateAll(categorias);

    res.json({
      success: true,
      message: 'Categorías actualizadas exitosamente',
      categorias: categoriasActualizadas.categorias
    });
  } catch (error) {
    console.error('Error al actualizar categorías:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: error.message
    });
  }
};

/**
 * Crear nueva categoría
 * POST /api/admin/categorias
 */
const createCategoria = async (req, res) => {
  try {
    const categoriaData = req.body;

    if (!categoriaData.nombre) {
      return res.status(400).json({
        error: 'Datos inválidos',
        message: 'El nombre de la categoría es obligatorio'
      });
    }

    const nuevaCategoria = await Categoria.create(categoriaData);

    res.status(201).json({
      success: true,
      message: 'Categoría creada exitosamente',
      categoria: nuevaCategoria
    });
  } catch (error) {
    console.error('Error al crear categoría:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: error.message
    });
  }
};

/**
 * Actualizar una categoría
 * PUT /api/admin/categorias/:id
 */
const updateCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const categoriaData = req.body;

    const categoriaActualizada = await Categoria.update(id, categoriaData);

    res.json({
      success: true,
      message: 'Categoría actualizada exitosamente',
      categoria: categoriaActualizada
    });
  } catch (error) {
    console.error('Error al actualizar categoría:', error);
    if (error.message === 'Categoría no encontrada') {
      return res.status(404).json({
        error: 'Categoría no encontrada',
        message: error.message
      });
    }
    res.status(500).json({
      error: 'Error interno del servidor',
      message: error.message
    });
  }
};

/**
 * Eliminar una categoría (marcar como inactiva)
 * DELETE /api/admin/categorias/:id
 */
const deleteCategoria = async (req, res) => {
  try {
    const { id } = req.params;

    const categoriaEliminada = await Categoria.delete(id);

    res.json({
      success: true,
      message: 'Categoría eliminada exitosamente',
      categoria: categoriaEliminada
    });
  } catch (error) {
    console.error('Error al eliminar categoría:', error);
    if (error.message === 'Categoría no encontrada') {
      return res.status(404).json({
        error: 'Categoría no encontrada',
        message: error.message
      });
    }
    res.status(500).json({
      error: 'Error interno del servidor',
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
  blockUser,
  verifyCliente,
  verifyTarea,
  getUserDetails,
  // Categorías
  getCategorias,
  updateCategorias,
  createCategoria,
  updateCategoria,
  deleteCategoria
};



