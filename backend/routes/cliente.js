/**
 * Rutas de Cliente
 * 
 * Define todas las rutas relacionadas con los clientes.
 */

const express = require('express');
const router = express.Router();
const { updateProfile, searchClientes, getClienteProfile } = require('../controllers/clienteController');
const { authenticateToken } = require('../middleware/auth');

/**
 * PUT /api/cliente/profile/:id
 * Actualizar perfil del cliente (requiere autenticación)
 * Permite actualizar todos los campos del perfil
 */
router.put('/profile/:id', authenticateToken, updateProfile);

/**
 * GET /api/cliente/search
 * Buscar clientes (requiere autenticación)
 * Permite buscar por nombre
 */
router.get('/search', authenticateToken, searchClientes);

/**
 * GET /api/cliente/profile/:id
 * Ver perfil público de un cliente (requiere autenticación)
 */
router.get('/profile/:id', authenticateToken, getClienteProfile);

module.exports = router;


