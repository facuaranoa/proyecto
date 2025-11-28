/**
 * Middleware de Autenticación JWT
 * 
 * Este middleware verifica que el usuario tenga un token JWT válido
 * antes de acceder a endpoints protegidos.
 * 
 * Uso:
 * router.get('/ruta-protegida', authenticateToken, controller.function);
 */

const jwt = require('jsonwebtoken');
const UsuarioCliente = require('../models/UsuarioCliente');
const Tasker = require('../models/Tasker');
const Admin = require('../models/Admin');

/**
 * Middleware para autenticar tokens JWT
 * Verifica que el token sea válido y que el usuario exista
 */
const authenticateToken = async (req, res, next) => {
  try {
    // Obtener el token del header Authorization
    // Formato esperado: "Bearer <token>"
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Extraer solo el token

    if (!token) {
      return res.status(401).json({
        error: 'Token de autenticación requerido',
        message: 'Debes incluir un token JWT en el header Authorization'
      });
    }

    // Verificar y decodificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Buscar el usuario (puede ser admin, cliente o tasker)
    let usuario = null;
    
    if (decoded.tipo === 'admin') {
      usuario = await Admin.findByPk(decoded.id);
    } else if (decoded.tipo === 'cliente') {
      usuario = await UsuarioCliente.findByPk(decoded.id);
    } else if (decoded.tipo === 'tasker') {
      usuario = await Tasker.findByPk(decoded.id);
    }

    if (!usuario) {
      return res.status(401).json({
        error: 'Usuario no encontrado',
        message: 'El token es válido pero el usuario no existe'
      });
    }

    // Agregar información del usuario al request para usarla en los controllers
    req.user = {
      id: usuario.id,
      email: usuario.email,
      tipo: decoded.tipo // 'cliente' o 'tasker'
    };

    // Continuar con el siguiente middleware o controller
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Token inválido',
        message: 'El token proporcionado no es válido'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expirado',
        message: 'El token ha expirado, por favor inicia sesión nuevamente'
      });
    }
    
    console.error('Error en autenticación:', error);
    return res.status(500).json({
      error: 'Error en autenticación',
      message: 'Ocurrió un error al verificar el token'
    });
  }
};

/**
 * Middleware para verificar que el usuario sea un administrador
 * Verifica que el usuario autenticado sea de tipo 'admin'
 */
const authenticateAdmin = async (req, res, next) => {
  try {
    // Primero verificar que esté autenticado
    if (!req.user) {
      return res.status(401).json({
        error: 'No autenticado',
        message: 'Debes estar autenticado para acceder a esta ruta'
      });
    }

    // Verificar que sea admin
    if (req.user.tipo !== 'admin') {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: 'Se requieren permisos de administrador'
      });
    }

    next();
  } catch (error) {
    console.error('Error en autenticación admin:', error);
    return res.status(500).json({
      error: 'Error en autenticación',
      message: 'Ocurrió un error al verificar permisos de administrador'
    });
  }
};

module.exports = {
  authenticateToken,
  authenticateAdmin
};



