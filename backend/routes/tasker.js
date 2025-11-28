/**
 * Rutas de Tasker
 * 
 * Define todas las rutas relacionadas con los taskers.
 */

const express = require('express');
const router = express.Router();
const { updateProfile } = require('../controllers/taskerController');
const { authenticateToken } = require('../middleware/auth');

/**
 * PUT /api/tasker/profile/:id
 * Actualizar perfil del tasker (requiere autenticación)
 * Permite actualizar disponibilidad y otros campos
 */
router.put('/profile/:id', authenticateToken, updateProfile);

module.exports = router;



