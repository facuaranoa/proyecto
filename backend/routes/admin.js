/**
 * Rutas de Administrador
 * 
 * Define todas las rutas relacionadas con funciones administrativas.
 */

const express = require('express');
const router = express.Router();
const { listTaskers, verifyTasker, getStats, listClientes, listTareas, blockUser, verifyCliente, verifyTarea, getUserDetails } = require('../controllers/adminController');
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

/**
 * GET /api/admin/stats
 * Obtener estadísticas generales del sistema
 */
router.get('/stats', authenticateToken, authenticateAdmin, getStats);

/**
 * GET /api/admin/clientes
 * Listar todos los clientes
 */
router.get('/clientes', authenticateToken, authenticateAdmin, listClientes);

/**
 * GET /api/admin/tareas
 * Listar todas las tareas
 */
router.get('/tareas', authenticateToken, authenticateAdmin, listTareas);

/**
 * GET /api/admin/user/details/:id?tipo=tasker|cliente
 * Obtener detalles completos de un usuario (perfil, tareas, calificaciones)
 * IMPORTANTE: Esta ruta debe ir ANTES de /user/block/:id para evitar conflictos
 */
router.get('/user/details/:id', authenticateToken, authenticateAdmin, getUserDetails);

/**
 * PUT /api/admin/user/block/:id
 * Bloquear/desbloquear usuario
 * Body: { bloqueado: true/false, tipo: 'cliente'|'tasker' }
 */
router.put('/user/block/:id', authenticateToken, authenticateAdmin, blockUser);

/**
 * PUT /api/admin/cliente/verify/:id
 * Verificar/aprobar cliente (requiere autenticación de administrador)
 * Body: { aprobado_admin: true/false }
 */
router.put('/cliente/verify/:id', authenticateToken, authenticateAdmin, verifyCliente);

/**
 * PUT /api/admin/tarea/verify/:id
 * Verificar/aprobar tarea (requiere autenticación de administrador)
 * Body: { aprobado_admin: true/false }
 */
router.put('/tarea/verify/:id', authenticateToken, authenticateAdmin, verifyTarea);

module.exports = router;



