/**
 * Controller de Autenticación
 * 
 * Maneja la lógica de registro y login para clientes y taskers.
 */

const jwt = require('jsonwebtoken');
const UsuarioCliente = require('../models/UsuarioCliente');
const Tasker = require('../models/Tasker');
const Admin = require('../models/Admin');
const PasswordResetToken = require('../models/PasswordResetToken.json');
const { getFileUrl } = require('../utils/upload');
const bcrypt = require('bcryptjs');

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
      terminos_aceptados,
      categoria_principal,
      especialidades
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
      disponible: true,
      categoria_principal: categoria_principal || null,
      especialidades: Array.isArray(especialidades) ? especialidades : (especialidades ? [especialidades] : [])
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
 * Registrar cliente como tasker (usuario dual)
 * POST /api/auth/register/cliente-as-tasker
 * Permite que un cliente existente se registre también como tasker
 */
const registerClienteAsTasker = async (req, res) => {
  try {
    const {
      email,
      password,
      categoria_principal,
      especialidades,
      cuit,
      monotributista_check
    } = req.body;

    // Validaciones básicas
    if (!email || !password) {
      return res.status(400).json({
        error: 'Campos requeridos faltantes',
        message: 'Email y password son obligatorios'
      });
    }

    // Verificar que el cliente existe
    const cliente = await UsuarioCliente.findOne({ where: { email } });
    if (!cliente) {
      return res.status(404).json({
        error: 'Cliente no encontrado',
        message: 'No existe un cliente con ese email'
      });
    }

    // Verificar contraseña del cliente
    const passwordMatch = await cliente.comparePassword(password);
    if (!passwordMatch) {
      return res.status(401).json({
        error: 'Contraseña incorrecta',
        message: 'La contraseña no coincide con la cuenta de cliente'
      });
    }

    // Verificar si ya es tasker
    const taskerExistente = await Tasker.findOne({ where: { email } });
    if (taskerExistente) {
      return res.status(400).json({
        error: 'Ya es tasker',
        message: 'Este email ya está registrado como tasker'
      });
    }

    // Obtener paths de archivos subidos (si existen)
    const dni_url = req.files?.dni ? getFileUrl(req.files.dni[0].filename) : null;
    const matricula_url = req.files?.matricula ? getFileUrl(req.files.matricula[0].filename) : null;
    const licencia_conducir_url = req.files?.licencia ? getFileUrl(req.files.licencia[0].filename) : null;

    // Crear tasker con los mismos datos del cliente
    const nuevoTasker = await Tasker.create({
      email: cliente.email,
      password_hash: cliente.password_hash, // Usar la misma contraseña (ya está encriptada)
      nombre: cliente.nombre,
      apellido: cliente.apellido,
      telefono: cliente.telefono,
      cuit: cuit || null,
      monotributista_check: monotributista_check === 'true' || monotributista_check === true,
      terminos_aceptados: true,
      dni_url,
      matricula_url,
      licencia_conducir_url,
      aprobado_admin: false,
      disponible: true,
      categoria_principal: categoria_principal || null,
      especialidades: Array.isArray(especialidades) ? especialidades : (especialidades ? [especialidades] : [])
    });

    res.status(201).json({
      message: 'Registrado como tasker exitosamente. Pendiente de aprobación por administrador.',
      tasker: {
        id: nuevoTasker.id,
        email: nuevoTasker.email,
        nombre: nuevoTasker.nombre,
        apellido: nuevoTasker.apellido,
        aprobado_admin: nuevoTasker.aprobado_admin,
        categoria_principal: nuevoTasker.categoria_principal
      }
    });
  } catch (error) {
    console.error('Error al registrar cliente como tasker:', error);
    res.status(500).json({
      error: 'Error al registrar como tasker',
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
    let esUsuarioDual = false;
    let usuarioCliente = null;
    let usuarioTasker = null;

    if (!usuario) {
      // Buscar como cliente
      usuarioCliente = await UsuarioCliente.findOne({ where: { email } });
      // Buscar como tasker
      usuarioTasker = await Tasker.findOne({ where: { email } });
      
      // Debug: mostrar qué se encontró
      console.log('🔍 Login - Buscando usuario:', email);
      console.log('🔍 Login - Cliente encontrado:', usuarioCliente ? `Sí (ID: ${usuarioCliente.id})` : 'No');
      console.log('🔍 Login - Tasker encontrado:', usuarioTasker ? `Sí (ID: ${usuarioTasker.id})` : 'No');
      
      // Si existe en ambos, es usuario dual
      if (usuarioCliente && usuarioTasker) {
        esUsuarioDual = true;
        console.log('✅ Usuario dual detectado:', {
          cliente_id: usuarioCliente.id,
          tasker_id: usuarioTasker.id,
          email: email
        });
        // Usar el cliente como usuario principal, pero incluir info del tasker
        usuario = usuarioCliente;
        tipo = 'cliente';
      } else if (usuarioCliente) {
        console.log('👤 Solo cliente encontrado');
        usuario = usuarioCliente;
        tipo = 'cliente';
      } else if (usuarioTasker) {
        console.log('🔧 Solo tasker encontrado');
        usuario = usuarioTasker;
        tipo = 'tasker';
      }
    }

    if (!usuario) {
      return res.status(401).json({
        error: 'Credenciales inválidas',
        message: 'Email o contraseña incorrectos'
      });
    }

    // Verificar contraseña (si es dual, verificar con el que se encontró primero)
    const passwordMatch = await usuario.comparePassword(password);
    if (!passwordMatch) {
      // Si es dual, intentar con el otro
      if (esUsuarioDual) {
        const otroUsuario = usuario === usuarioCliente ? usuarioTasker : usuarioCliente;
        const otroPasswordMatch = await otroUsuario.comparePassword(password);
        if (!otroPasswordMatch) {
          return res.status(401).json({
            error: 'Credenciales inválidas',
            message: 'Email o contraseña incorrectos'
          });
        }
        // Si la contraseña coincide con el otro, usar ese como principal
        usuario = otroUsuario;
        tipo = usuario === usuarioTasker ? 'tasker' : 'cliente';
      } else {
        return res.status(401).json({
          error: 'Credenciales inválidas',
          message: 'Email o contraseña incorrectos'
        });
      }
    }

    // Generar token JWT (usar el ID del usuario principal)
    const token = generateToken(usuario, tipo);

    // Preparar respuesta según el tipo de usuario
    const usuarioResponse = {
      id: usuario.id,
      email: usuario.email,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      telefono: usuario.telefono,
      tipo: tipo,
      esUsuarioDual: esUsuarioDual
    };
    
    // Debug: mostrar respuesta que se enviará
    console.log('📤 Login - Respuesta preparada:', {
      tipo: tipo,
      esUsuarioDual: esUsuarioDual,
      email: usuarioResponse.email
    });

    // Si es usuario dual, incluir información de ambos perfiles
    if (esUsuarioDual) {
      usuarioResponse.cliente_id = usuarioCliente.id;
      usuarioResponse.tasker_id = usuarioTasker.id;
      usuarioResponse.ubicacion_default = usuarioCliente.ubicacion_default;
      usuarioResponse.aprobado_admin_tasker = usuarioTasker.aprobado_admin;
      usuarioResponse.disponible_tasker = usuarioTasker.disponible;
      usuarioResponse.categoria_principal = usuarioTasker.categoria_principal;
      usuarioResponse.especialidades = usuarioTasker.especialidades;
    } else {
      // Agregar campos específicos según el tipo
      if (tipo === 'admin') {
        // Admin no tiene campos adicionales por ahora
      } else if (tipo === 'tasker') {
        usuarioResponse.aprobado_admin = usuario.aprobado_admin;
        usuarioResponse.disponible = usuario.disponible;
        usuarioResponse.categoria_principal = usuario.categoria_principal;
        usuarioResponse.especialidades = usuario.especialidades;
      } else {
        usuarioResponse.ubicacion_default = usuario.ubicacion_default;
      }
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

/**
 * Solicitar recuperación de contraseña
 * POST /api/auth/forgot-password
 */
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Validaciones básicas
    if (!email) {
      return res.status(400).json({
        error: 'Email requerido',
        message: 'Debes proporcionar un email'
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

    // Buscar usuario (cliente o tasker)
    let usuario = await UsuarioCliente.findOne({ where: { email } });
    let tipo = 'cliente';

    if (!usuario) {
      usuario = await Tasker.findOne({ where: { email } });
      tipo = 'tasker';
    }

    // Por seguridad, siempre retornamos éxito aunque el email no exista
    // Esto previene que atacantes descubran qué emails están registrados
    if (!usuario) {
      return res.json({
        message: 'Si el email existe, recibirás un enlace de recuperación'
      });
    }

    // Invalidar tokens anteriores para este email
    await PasswordResetToken.invalidateAllForEmail(email);

    // Generar nuevo token
    const token = PasswordResetToken.generateToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // Expira en 1 hora

    const resetToken = new PasswordResetToken({
      email: email,
      token: token,
      user_id: usuario.id,
      user_type: tipo,
      expires_at: expiresAt.toISOString(),
      used: false
    });

    await resetToken.save();

    // En producción, aquí enviarías un email con el link
    // Por ahora, retornamos el token en la respuesta (solo para desarrollo)
    // En producción, esto NO debe hacerse
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:8080'}/reset-password?token=${token}`;

    console.log(`🔐 Link de recuperación para ${email}: ${resetLink}`);

    // En producción, usarías un servicio de email como nodemailer
    // await sendPasswordResetEmail(email, resetLink);

    res.json({
      message: 'Si el email existe, recibirás un enlace de recuperación',
      // Solo en desarrollo - REMOVER en producción
      ...(process.env.NODE_ENV !== 'production' && {
        resetLink: resetLink,
        token: token
      })
    });
  } catch (error) {
    console.error('Error en forgot-password:', error);
    res.status(500).json({
      error: 'Error al procesar solicitud',
      message: error.message
    });
  }
};

/**
 * Resetear contraseña con token
 * POST /api/auth/reset-password
 */
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Validaciones básicas
    if (!token || !newPassword) {
      return res.status(400).json({
        error: 'Campos requeridos faltantes',
        message: 'Token y nueva contraseña son obligatorios'
      });
    }

    // Validar longitud de password
    if (newPassword.length < 6) {
      return res.status(400).json({
        error: 'Password muy corto',
        message: 'La contraseña debe tener al menos 6 caracteres'
      });
    }

    // Buscar token
    const resetToken = await PasswordResetToken.findByToken(token);
    if (!resetToken) {
      return res.status(400).json({
        error: 'Token inválido',
        message: 'El token de recuperación no es válido o ha expirado'
      });
    }

    // Verificar si el token es válido
    if (!resetToken.isValid()) {
      return res.status(400).json({
        error: 'Token inválido o expirado',
        message: 'El token de recuperación ha expirado o ya fue usado'
      });
    }

    // Buscar usuario según el tipo
    let usuario;
    if (resetToken.user_type === 'cliente') {
      usuario = await UsuarioCliente.findByPk(resetToken.user_id);
    } else if (resetToken.user_type === 'tasker') {
      usuario = await Tasker.findByPk(resetToken.user_id);
    } else {
      return res.status(400).json({
        error: 'Tipo de usuario inválido',
        message: 'El token no está asociado a un tipo de usuario válido'
      });
    }

    if (!usuario) {
      return res.status(404).json({
        error: 'Usuario no encontrado',
        message: 'El usuario asociado al token no existe'
      });
    }

    // Actualizar contraseña (el modelo la encripta automáticamente)
    await usuario.update({ password_hash: newPassword });

    // Marcar token como usado
    await resetToken.markAsUsed();

    res.json({
      message: 'Contraseña restablecida exitosamente',
      success: true
    });
  } catch (error) {
    console.error('Error en reset-password:', error);
    res.status(500).json({
      error: 'Error al restablecer contraseña',
      message: error.message
    });
  }
};

module.exports = {
  registerCliente,
  registerTasker,
  registerClienteAsTasker,
  login,
  forgotPassword,
  resetPassword
};



