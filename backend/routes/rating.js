/**
 * Rutas de Calificaciones
 * 
 * Define todas las rutas relacionadas con las calificaciones.
 */

const express = require('express');
const router = express.Router();
const { createRating, getUserRatings, getTaskRatings } = require('../controllers/ratingController');
const { authenticateToken } = require('../middleware/auth');

/**
 * POST /api/rating/create
 * Crear una calificación (requiere autenticación)
 */
router.post('/create', authenticateToken, createRating);

/**
 * GET /api/rating/user/:userId?tipo=cliente|tasker
 * Obtener calificaciones de un usuario (público)
 */
router.get('/user/:userId', getUserRatings);

/**
 * GET /api/rating/task/:tareaId
 * Obtener calificaciones de una tarea específica (requiere autenticación)
 */
router.get('/task/:tareaId', authenticateToken, getTaskRatings);

module.exports = router;





