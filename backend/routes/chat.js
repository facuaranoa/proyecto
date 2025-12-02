/**
 * Rutas de Chat
 * 
 * Define los endpoints relacionados con el sistema de mensajería/chat.
 */

const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
  getMessages,
  sendMessage,
  markAsRead,
  getTasksWithUnreadMessages
} = require('../controllers/chatController');

/**
 * GET /api/chat/tarea/:id
 * Obtener mensajes de una tarea
 * Requiere autenticación
 */
router.get('/tarea/:id', authenticateToken, getMessages);

/**
 * POST /api/chat/tarea/:id
 * Enviar un mensaje en una tarea
 * Requiere autenticación
 */
router.post('/tarea/:id', authenticateToken, sendMessage);

/**
 * PUT /api/chat/mensaje/:id/leido
 * Marcar un mensaje como leído
 * Requiere autenticación
 */
router.put('/mensaje/:id/leido', authenticateToken, markAsRead);

/**
 * GET /api/chat/tareas-con-mensajes
 * Obtener tareas con mensajes no leídos
 * Requiere autenticación
 */
router.get('/tareas-con-mensajes', authenticateToken, getTasksWithUnreadMessages);

module.exports = router;
