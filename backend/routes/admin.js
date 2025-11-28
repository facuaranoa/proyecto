/**
 * Rutas de Administrador
 * 
 * Define todas las rutas relacionadas con funciones administrativas.
 */

const express = require('express');
const router = express.Router();
const { listTaskers, verifyTasker } = require('../controllers/adminController');
const { authenticateToken, authenticateAdmin } = require('../middleware/auth');

/**
 * GET /api/admin/taskers
 * Listar todos los taskers (o solo pendientes si ?pendientes=true)
 * Requiere autenticación de administrador
 */
router.get('/taskers', authenticateToken, authenticateAdmin, listTaskers);

/**
 * PUT /api/admin/tasker/verify/:id
 * Verificar/aprobar tasker (requiere autenticación de administrador)
 * Body: { aprobado_admin: true/false }
 */
router.put('/tasker/verify/:id', authenticateToken, authenticateAdmin, verifyTasker);

module.exports = router;



