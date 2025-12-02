/**
 * Controller de Chat
 * 
 * Maneja la lógica relacionada con el sistema de mensajería/chat.
 */

const Mensaje = require('../models/Mensaje.json');
const Tarea = require('../models/Tarea.json');
const SolicitudTarea = require('../models/SolicitudTarea.json');
const UsuarioCliente = require('../models/UsuarioCliente.json');
const Tasker = require('../models/Tasker.json');

/**
 * Obtener mensajes de una tarea
 * GET /api/chat/tarea/:id
 * Solo el cliente y el tasker asignado (o que aplicó) pueden ver los mensajes
 */
const getMessages = async (req, res) => {
  try {
    const tareaId = parseInt(req.params.id);
    
    // Verificar que la tarea existe
    const tarea = await Tarea.findByPk(tareaId);
    if (!tarea) {
      return res.status(404).json({
        error: 'Tarea no encontrada',
        message: 'La tarea especificada no existe'
      });
    }

    // Obtener IDs correctos según tipo de usuario
    let clienteId, taskerId;
    if (req.user.tipo === 'cliente') {
      clienteId = req.user.esUsuarioDual ? req.user.cliente_id : req.user.id;
      taskerId = req.user.esUsuarioDual ? req.user.tasker_id : null;
    } else if (req.user.tipo === 'tasker') {
      taskerId = req.user.esUsuarioDual ? req.user.tasker_id : req.user.id;
      clienteId = req.user.esUsuarioDual ? req.user.cliente_id : null;
    } else {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: 'Solo clientes y taskers pueden ver mensajes'
      });
    }

    // Verificar permisos: el usuario debe ser el cliente o el tasker asignado/aplicante
    const esCliente = clienteId && tarea.cliente_id === clienteId;
    const esTaskerAsignado = taskerId && tarea.tasker_id === taskerId;
    
    // Verificar si el tasker aplicó a la tarea (antes de asignación)
    let esTaskerAplicante = false;
    if (taskerId && !esTaskerAsignado && tarea.estado === 'PENDIENTE') {
      const aplicacion = await SolicitudTarea.findOne({
        where: {
          tarea_id: tareaId,
          tasker_id: taskerId,
          tipo: 'APLICACION'
        }
      });
      esTaskerAplicante = !!aplicacion;
    }

    if (!esCliente && !esTaskerAsignado && !esTaskerAplicante) {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: 'No tienes permiso para ver los mensajes de esta tarea'
      });
    }

    // Obtener mensajes de la tarea
    const mensajes = await Mensaje.findAll({
      where: { tarea_id: tareaId },
      order: [['createdAt', 'ASC']]
    });

    res.json({
      mensajes: mensajes,
      tarea: {
        id: tarea.id,
        estado: tarea.estado,
        cliente_id: tarea.cliente_id,
        tasker_id: tarea.tasker_id
      }
    });
  } catch (error) {
    console.error('Error al obtener mensajes:', error);
    res.status(500).json({
      error: 'Error al obtener mensajes',
      message: error.message
    });
  }
};

/**
 * Enviar un mensaje
 * POST /api/chat/tarea/:id
 * Solo el cliente y el tasker asignado/aplicante pueden enviar mensajes
 */
const sendMessage = async (req, res) => {
  try {
    const tareaId = parseInt(req.params.id);
    const { mensaje } = req.body;

    if (!mensaje || mensaje.trim().length === 0) {
      return res.status(400).json({
        error: 'Mensaje vacío',
        message: 'El mensaje no puede estar vacío'
      });
    }

    if (mensaje.length > 1000) {
      return res.status(400).json({
        error: 'Mensaje muy largo',
        message: 'El mensaje no puede tener más de 1000 caracteres'
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

    // Obtener IDs correctos según tipo de usuario
    let remitenteId, remitenteTipo, remitenteNombre;
    if (req.user.tipo === 'cliente') {
      const clienteId = req.user.esUsuarioDual ? req.user.cliente_id : req.user.id;
      if (tarea.cliente_id !== clienteId) {
        return res.status(403).json({
          error: 'Acceso denegado',
          message: 'Solo el cliente de la tarea puede enviar mensajes'
        });
      }
      remitenteId = clienteId;
      remitenteTipo = 'cliente';
      const cliente = await UsuarioCliente.findByPk(clienteId);
      remitenteNombre = cliente ? `${cliente.nombre} ${cliente.apellido}` : 'Cliente';
    } else if (req.user.tipo === 'tasker') {
      const taskerId = req.user.esUsuarioDual ? req.user.tasker_id : req.user.id;
      
      // Verificar que el tasker está asignado o aplicó
      const esTaskerAsignado = tarea.tasker_id === taskerId;
      let esTaskerAplicante = false;
      
      // Los taskers que aplicaron pueden enviar mensajes (no solo los asignados)
      if (!esTaskerAsignado) {
        const aplicacion = await SolicitudTarea.findOne({
          where: {
            tarea_id: tareaId,
            tasker_id: taskerId,
            tipo: 'APLICACION'
          }
        });
        esTaskerAplicante = !!aplicacion;
      }

      if (!esTaskerAsignado && !esTaskerAplicante) {
        return res.status(403).json({
          error: 'Acceso denegado',
          message: 'Solo el tasker asignado o que aplicó puede enviar mensajes'
        });
      }

      remitenteId = taskerId;
      remitenteTipo = 'tasker';
      const tasker = await Tasker.findByPk(taskerId);
      remitenteNombre = tasker ? `${tasker.nombre} ${tasker.apellido}` : 'Tasker';
    } else {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: 'Solo clientes y taskers pueden enviar mensajes'
      });
    }

    // Crear el mensaje
    const nuevoMensaje = await Mensaje.create({
      tarea_id: tareaId,
      remitente_id: remitenteId,
      remitente_tipo: remitenteTipo,
      remitente_nombre: remitenteNombre,
      mensaje: mensaje.trim(),
      leido: false
    });

    res.status(201).json({
      message: 'Mensaje enviado exitosamente',
      mensaje: nuevoMensaje
    });
  } catch (error) {
    console.error('Error al enviar mensaje:', error);
    res.status(500).json({
      error: 'Error al enviar mensaje',
      message: error.message
    });
  }
};

/**
 * Marcar mensaje como leído
 * PUT /api/chat/mensaje/:id/leido
 */
const markAsRead = async (req, res) => {
  try {
    const mensajeId = parseInt(req.params.id);
    
    const mensaje = await Mensaje.findByPk(mensajeId);
    if (!mensaje) {
      return res.status(404).json({
        error: 'Mensaje no encontrado',
        message: 'El mensaje especificada no existe'
      });
    }

    // Verificar que el usuario no es el remitente (no puede marcar sus propios mensajes como leídos)
    let usuarioId;
    if (req.user.tipo === 'cliente') {
      usuarioId = req.user.esUsuarioDual ? req.user.cliente_id : req.user.id;
    } else if (req.user.tipo === 'tasker') {
      usuarioId = req.user.esUsuarioDual ? req.user.tasker_id : req.user.id;
    } else {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: 'Solo clientes y taskers pueden marcar mensajes como leídos'
      });
    }

    // Solo se puede marcar como leído si no es el remitente
    if (mensaje.remitente_id === usuarioId) {
      return res.status(400).json({
        error: 'Operación inválida',
        message: 'No puedes marcar tus propios mensajes como leídos'
      });
    }

    // Verificar que el usuario tiene acceso a la tarea
    const tarea = await Tarea.findByPk(mensaje.tarea_id);
    if (!tarea) {
      return res.status(404).json({
        error: 'Tarea no encontrada',
        message: 'La tarea asociada al mensaje no existe'
      });
    }

    const esCliente = req.user.tipo === 'cliente' && tarea.cliente_id === usuarioId;
    const esTasker = req.user.tipo === 'tasker' && tarea.tasker_id === usuarioId;

    if (!esCliente && !esTasker) {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: 'No tienes permiso para marcar este mensaje como leído'
      });
    }

    // Marcar como leído
    await mensaje.update({ leido: true });

    res.json({
      message: 'Mensaje marcado como leído',
      mensaje: mensaje
    });
  } catch (error) {
    console.error('Error al marcar mensaje como leído:', error);
    res.status(500).json({
      error: 'Error al marcar mensaje como leído',
      message: error.message
    });
  }
};

/**
 * Obtener tareas con mensajes no leídos
 * GET /api/chat/tareas-con-mensajes
 * Retorna las tareas del usuario que tienen mensajes no leídos
 */
const getTasksWithUnreadMessages = async (req, res) => {
  try {
    let usuarioId, usuarioTipo;
    if (req.user.tipo === 'cliente') {
      usuarioId = req.user.esUsuarioDual ? req.user.cliente_id : req.user.id;
      usuarioTipo = 'cliente';
    } else if (req.user.tipo === 'tasker') {
      usuarioId = req.user.esUsuarioDual ? req.user.tasker_id : req.user.id;
      usuarioTipo = 'tasker';
    } else {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: 'Solo clientes y taskers pueden ver tareas con mensajes'
      });
    }

    // Obtener todas las tareas del usuario
    let tareas;
    if (usuarioTipo === 'cliente') {
      tareas = await Tarea.findAll({
        where: { cliente_id: usuarioId }
      });
    } else {
      // Para taskers: tareas asignadas o donde aplicó
      const tareasAsignadas = await Tarea.findAll({
        where: { tasker_id: usuarioId }
      });
      const aplicaciones = await SolicitudTarea.findAll({
        where: {
          tasker_id: usuarioId,
          tipo: 'APLICACION'
        }
      });
      const tareasIdsAplicadas = aplicaciones.map(a => a.tarea_id);
      const tareasAplicadas = await Promise.all(
        tareasIdsAplicadas.map(id => Tarea.findByPk(id))
      );
      tareas = [...tareasAsignadas, ...tareasAplicadas.filter(t => t)].filter((t, i, arr) => 
        arr.findIndex(ta => ta.id === t.id) === i
      );
    }

    // Para cada tarea, contar mensajes no leídos
    const tareasConMensajes = await Promise.all(
      tareas.map(async (tarea) => {
        const mensajesNoLeidos = await Mensaje.findAll({
          where: {
            tarea_id: tarea.id,
            leido: false
          }
        });

        // Filtrar solo los mensajes que NO son del usuario actual
        const mensajesParaUsuario = mensajesNoLeidos.filter(m => {
          if (usuarioTipo === 'cliente') {
            return m.remitente_tipo === 'tasker';
          } else {
            return m.remitente_tipo === 'cliente';
          }
        });

        return {
          tarea_id: tarea.id,
          estado: tarea.estado,
          mensajes_no_leidos: mensajesParaUsuario.length
        };
      })
    );

    // Filtrar solo las que tienen mensajes no leídos
    const tareasConMensajesNoLeidos = tareasConMensajes.filter(t => t.mensajes_no_leidos > 0);

    res.json({
      tareas: tareasConMensajesNoLeidos
    });
  } catch (error) {
    console.error('Error al obtener tareas con mensajes:', error);
    res.status(500).json({
      error: 'Error al obtener tareas con mensajes',
      message: error.message
    });
  }
};

module.exports = {
  getMessages,
  sendMessage,
  markAsRead,
  getTasksWithUnreadMessages
};
