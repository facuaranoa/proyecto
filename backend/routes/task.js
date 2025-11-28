/**
 * Rutas de Tareas
 * 
 * Define todas las rutas relacionadas con las tareas/servicios.
 */

const express = require('express');
const router = express.Router();
const { createTask, getUserTasks, getAvailableTasks, applyToTask, getTaskApplications } = require('../controllers/taskController');
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

module.exports = router;

