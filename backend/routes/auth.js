/**
 * Rutas de Autenticación
 * 
 * Define todas las rutas relacionadas con registro y login.
 */

const express = require('express');
const router = express.Router();
const { registerCliente, registerTasker, registerClienteAsTasker, login, forgotPassword, resetPassword } = require('../controllers/authController');
const { upload } = require('../utils/upload');

/**
 * POST /api/auth/register/cliente
 * Registro de nuevo cliente
 */
router.post('/register/cliente', registerCliente);

/**
 * POST /api/auth/register/tasker
 * Registro de nuevo tasker
 * Acepta archivos multipart/form-data para credenciales:
 * - dni: archivo del DNI
 * - matricula: archivo de matrícula (opcional)
 * - licencia: archivo de licencia de conducir (opcional)
 */
router.post('/register/tasker',
  upload.fields([
    { name: 'dni', maxCount: 1 },
    { name: 'matricula', maxCount: 1 },
    { name: 'licencia', maxCount: 1 }
  ]),
  registerTasker
);

/**
 * POST /api/auth/login
 * Login para cliente o tasker
 */
router.post('/login', login);

/**
 * POST /api/auth/forgot-password
 * Solicitar recuperación de contraseña
 */
router.post('/forgot-password', forgotPassword);

/**
 * POST /api/auth/reset-password
 * Resetear contraseña con token
 */
router.post('/reset-password', resetPassword);

/**
 * POST /api/auth/register/cliente-as-tasker
 * Registrar cliente existente como tasker (usuario dual)
 * Requiere autenticación (JWT)
 * Acepta archivos multipart/form-data para credenciales
 */
const { authenticateToken } = require('../middleware/auth');
router.post('/register/cliente-as-tasker', authenticateToken, upload.fields([
  { name: 'dni', maxCount: 1 },
  { name: 'matricula', maxCount: 1 },
  { name: 'licencia', maxCount: 1 }
]), registerClienteAsTasker);

module.exports = router;



