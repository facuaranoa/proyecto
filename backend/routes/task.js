/**
 * Rutas de Tareas
 * 
 * Define todas las rutas relacionadas con las tareas/servicios.
 */

const express = require('express');
const router = express.Router();
const { createTask, getUserTasks, getAvailableTasks, applyToTask, getTaskApplications, acceptApplication, getMyAssignedTasks, startTask, completeTask, confirmPayment, confirmPaymentReceived } = require('../controllers/taskController');
const { authenticateToken } = require('../middleware/auth');

/**
 * POST /api/task/create
 * Crear nueva tarea (requiere autenticación de cliente)
 */
router.post('/create', authenticateToken, createTask);

/**
 * GET /api/task/my-tasks
 * Obtener tareas del usuario actual (requiere autenticación de cliente)
 */
router.get('/my-tasks', authenticateToken, getUserTasks);

/**
 * GET /api/task/available
 * Obtener tareas disponibles para taskers (requiere autenticación de tasker aprobado)
 */
router.get('/available', authenticateToken, getAvailableTasks);

/**
 * POST /api/task/apply/:id
 * Tasker aplica a una tarea (requiere autenticación de tasker aprobado)
 */
router.post('/apply/:id', authenticateToken, applyToTask);

/**
 * GET /api/task/applications/:tareaId
 * Cliente ve las aplicaciones a su tarea (requiere autenticación de cliente)
 */
router.get('/applications/:tareaId', authenticateToken, getTaskApplications);

/**
 * POST /api/task/accept-application/:applicationId
 * Cliente acepta una aplicación (elige un tasker) - requiere autenticación de cliente
 */
router.post('/accept-application/:applicationId', authenticateToken, acceptApplication);

/**
 * GET /api/task/my-assigned-tasks
 * Tasker ve sus tareas asignadas/en proceso - requiere autenticación de tasker
 */
router.get('/my-assigned-tasks', authenticateToken, getMyAssignedTasks);

/**
 * POST /api/task/start/:id
 * Tasker marca tarea como "en proceso" (empezó el trabajo) - requiere autenticación de tasker
 */
router.post('/start/:id', authenticateToken, startTask);

/**
 * POST /api/task/complete/:id
 * Tasker marca tarea como finalizada (terminó el trabajo) - requiere autenticación de tasker
 * Cambia estado: EN_PROCESO → PENDIENTE_PAGO
 */
router.post('/complete/:id', authenticateToken, completeTask);

/**
 * POST /api/task/confirm-payment/:id
 * Cliente confirma pago (está conforme con el trabajo) - requiere autenticación de cliente
 * Cambia estado: PENDIENTE_PAGO → FINALIZADA
 */
router.post('/confirm-payment/:id', authenticateToken, confirmPayment);

/**
 * POST /api/task/confirm-payment-received/:id
 * Tasker confirma que recibió el pago - requiere autenticación de tasker
 * Solo disponible para tareas en estado FINALIZADA
 */
router.post('/confirm-payment-received/:id', authenticateToken, confirmPaymentReceived);

module.exports = router;

