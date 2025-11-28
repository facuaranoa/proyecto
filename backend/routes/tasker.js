/**
 * Rutas de Tasker
 * 
 * Define todas las rutas relacionadas con los taskers.
 */

const express = require('express');
const router = express.Router();
const { updateProfile, searchTaskers, getTaskerProfile } = require('../controllers/taskerController');
const { authenticateToken } = require('../middleware/auth');

/**
 * PUT /api/tasker/profile/:id
 * Actualizar perfil del tasker (requiere autenticación)
 * Permite actualizar todos los campos del perfil
 */
router.put('/profile/:id', authenticateToken, updateProfile);

/**
 * GET /api/tasker/search
 * Buscar taskers (requiere autenticación)
 * Permite buscar por nombre, categoría, especialidad, skills
 */
router.get('/search', authenticateToken, searchTaskers);

/**
 * GET /api/tasker/profile/:id
 * Ver perfil público de un tasker (requiere autenticación)
 */
router.get('/profile/:id', authenticateToken, getTaskerProfile);

module.exports = router;



