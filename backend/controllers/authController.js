/**
 * Controller de Autenticación
 * 
 * Maneja la lógica de registro y login para clientes y taskers.
 */

const jwt = require('jsonwebtoken');
const UsuarioCliente = require('../models/UsuarioCliente');
const Tasker = require('../models/Tasker');
const Admin = require('../models/Admin');
const { getFileUrl } = require('../utils/upload');

/**
 * Genera un token JWT para un usuario
 */
const generateToken = (user, tipo) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      tipo: tipo // 'cliente' o 'tasker'
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '7d' // El token expira en 7 días
    }
  );
};

/**
 * Registro de nuevo Cliente
 * POST /api/auth/register/cliente
 */
const registerCliente = async (req, res) => {
  try {
    const { email, password, nombre, apellido, telefono, ubicacion_default } = req.body;

    // Validaciones básicas
    if (!email || !password || !nombre || !apellido || !telefono) {
      return res.status(400).json({
        error: 'Campos requeridos faltantes',
        message: 'Email, password, nombre, apellido y teléfono son obligatorios'
      });
    }

    // Verificar si el email ya existe
    const clienteExistente = await UsuarioCliente.findOne({ where: { email } });
    if (clienteExistente) {
      return res.status(400).json({
        error: 'Email ya registrado',
        message: 'Ya existe un cliente con este email'
      });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Email inválido',
        message: 'El formato del email no es válido'
      });
    }

    // Validar longitud de password
    if (password.length < 6) {
      return res.status(400).json({
        error: 'Password muy corto',
        message: 'La contraseña debe tener al menos 6 caracteres'
      });
    }

    // Crear nuevo cliente
    // Nota: password_hash se encripta automáticamente en el hook beforeCreate del modelo
    const nuevoCliente = await UsuarioCliente.create({
      email,
      password_hash: password, // Se encripta automáticamente
      nombre,
      apellido,
      telefono,
      ubicacion_default: ubicacion_default || null
    });

    // Generar token JWT
    const token = generateToken(nuevoCliente, 'cliente');

    // Retornar respuesta (sin incluir password_hash)
    res.status(201).json({
      message: 'Cliente registrado exitosamente',
      token: token,
      usuario: {
        id: nuevoCliente.id,
        email: nuevoCliente.email,
        nombre: nuevoCliente.nombre,
        apellido: nuevoCliente.apellido,
        telefono: nuevoCliente.telefono,
        ubicacion_default: nuevoCliente.ubicacion_default
      }
    });
  } catch (error) {
    console.error('Error en registro de cliente:', error);
    res.status(500).json({
      error: 'Error al registrar cliente',
      message: error.message
    });
  }
};

/**
 * Registro de nuevo Tasker
 * POST /api/auth/register/tasker
 * Acepta archivos para credenciales (DNI, matrícula, licencia)
 */
const registerTasker = async (req, res) => {
  try {
    const {
      email,
      password,
      nombre,
      apellido,
      telefono,
      cuit,
      monotributista_check,
      terminos_aceptados
    } = req.body;

    // Validaciones básicas
    if (!email || !password || !nombre || !apellido || !telefono) {
      return res.status(400).json({
        error: 'Campos requeridos faltantes',
        message: 'Email, password, nombre, apellido y teléfono son obligatorios'
      });
    }

    // Verificar que aceptó términos
    if (!terminos_aceptados) {
      return res.status(400).json({
        error: 'Términos no aceptados',
        message: 'Debes aceptar los términos y condiciones para registrarte'
      });
    }

    // Verificar si el email ya existe
    const taskerExistente = await Tasker.findOne({ where: { email } });
    if (taskerExistente) {
      return res.status(400).json({
        error: 'Email ya registrado',
        message: 'Ya existe un tasker con este email'
      });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Email inválido',
        message: 'El formato del email no es válido'
      });
    }

    // Validar longitud de password
    if (password.length < 6) {
      return res.status(400).json({
        error: 'Password muy corto',
        message: 'La contraseña debe tener al menos 6 caracteres'
      });
    }

    // Obtener paths de archivos subidos (si existen)
    const dni_url = req.files?.dni ? getFileUrl(req.files.dni[0].filename) : null;
    const matricula_url = req.files?.matricula ? getFileUrl(req.files.matricula[0].filename) : null;
    const licencia_conducir_url = req.files?.licencia ? getFileUrl(req.files.licencia[0].filename) : null;

    // Crear nuevo tasker
    const nuevoTasker = await Tasker.create({
      email,
      password_hash: password, // Se encripta automáticamente
      nombre,
      apellido,
      telefono,
      cuit: cuit || null,
      monotributista_check: monotributista_check === 'true' || monotributista_check === true,
      terminos_aceptados: true, // Ya validamos que es true
      dni_url,
      matricula_url,
      licencia_conducir_url,
      aprobado_admin: false, // Por defecto no está aprobado
      disponible: true
    });

    // Generar token JWT
    const token = generateToken(nuevoTasker, 'tasker');

    // Retornar respuesta (sin incluir password_hash)
    res.status(201).json({
      message: 'Tasker registrado exitosamente. Pendiente de aprobación por administrador.',
      token: token,
      usuario: {
        id: nuevoTasker.id,
        email: nuevoTasker.email,
        nombre: nuevoTasker.nombre,
        apellido: nuevoTasker.apellido,
        telefono: nuevoTasker.telefono,
        aprobado_admin: nuevoTasker.aprobado_admin,
        disponible: nuevoTasker.disponible
      }
    });
  } catch (error) {
    console.error('Error en registro de tasker:', error);
    res.status(500).json({
      error: 'Error al registrar tasker',
      message: error.message
    });
  }
};

/**
 * Login (para Cliente o Tasker)
 * POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validaciones básicas
    if (!email || !password) {
      return res.status(400).json({
        error: 'Campos requeridos faltantes',
        message: 'Email y password son obligatorios'
      });
    }

    // Buscar usuario (primero como admin, luego cliente, luego tasker)
    let usuario = await Admin.findOne({ where: { email } });
    let tipo = 'admin';

    if (!usuario) {
      usuario = await UsuarioCliente.findOne({ where: { email } });
      tipo = 'cliente';
    }

    if (!usuario) {
      usuario = await Tasker.findOne({ where: { email } });
      tipo = 'tasker';
    }

    if (!usuario) {
      return res.status(401).json({
        error: 'Credenciales inválidas',
        message: 'Email o contraseña incorrectos'
      });
    }

    // Verificar contraseña
    const passwordMatch = await usuario.comparePassword(password);
    if (!passwordMatch) {
      return res.status(401).json({
        error: 'Credenciales inválidas',
        message: 'Email o contraseña incorrectos'
      });
    }

    // Generar token JWT
    const token = generateToken(usuario, tipo);

    // Preparar respuesta según el tipo de usuario
    const usuarioResponse = {
      id: usuario.id,
      email: usuario.email,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      tipo: tipo
    };

    // Agregar campos específicos según el tipo
    if (tipo === 'admin') {
      // Admin no tiene campos adicionales por ahora
    } else if (tipo === 'tasker') {
      usuarioResponse.aprobado_admin = usuario.aprobado_admin;
      usuarioResponse.disponible = usuario.disponible;
    } else {
      usuarioResponse.ubicacion_default = usuario.ubicacion_default;
    }

    res.json({
      message: 'Login exitoso',
      token: token,
      usuario: usuarioResponse
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      error: 'Error al iniciar sesión',
      message: error.message
    });
  }
};

module.exports = {
  registerCliente,
  registerTasker,
  login
};



