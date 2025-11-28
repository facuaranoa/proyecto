/**
 * Controller de Cliente
 * 
 * Maneja la lógica relacionada con los clientes.
 */

const UsuarioCliente = require('../models/UsuarioCliente');

/**
 * Actualizar perfil del Cliente
 * PUT /api/cliente/profile/:id
 * Permite actualizar todos los campos del perfil
 */
const updateProfile = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que el usuario autenticado sea el mismo cliente
    if (req.user.id !== parseInt(id)) {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: 'Solo puedes actualizar tu propio perfil'
      });
    }

    // Verificar que el usuario sea un cliente
    if (req.user.tipo !== 'cliente') {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: 'Este endpoint es solo para clientes'
      });
    }

    // Buscar el cliente
    const cliente = await UsuarioCliente.findByPk(id);
    if (!cliente) {
      return res.status(404).json({
        error: 'Cliente no encontrado',
        message: 'No existe un cliente con ese ID'
      });
    }

    // Campos permitidos para actualizar (excluir password_hash, id)
    const camposPermitidos = [
      'nombre', 'apellido', 'telefono', 'ubicacion_default'
    ];
    
    const camposActualizados = {};

    camposPermitidos.forEach(campo => {
      if (req.body[campo] !== undefined) {
        camposActualizados[campo] = req.body[campo];
      }
    });

    // Actualizar el cliente
    await cliente.update(camposActualizados);

    // Retornar el cliente actualizado (sin password_hash)
    const clienteResponse = {
      id: cliente.id,
      email: cliente.email,
      nombre: cliente.nombre,
      apellido: cliente.apellido,
      telefono: cliente.telefono,
      ubicacion_default: cliente.ubicacion_default,
      createdAt: cliente.createdAt,
      updatedAt: cliente.updatedAt
    };

    res.json({
      message: 'Perfil actualizado exitosamente',
      cliente: clienteResponse
    });
  } catch (error) {
    console.error('Error al actualizar perfil de cliente:', error);
    res.status(500).json({
      error: 'Error al actualizar perfil',
      message: error.message
    });
  }
};

/**
 * Buscar y listar clientes (para taskers)
 * GET /api/cliente/search
 * Permite buscar clientes por nombre, etc.
 */
const searchClientes = async (req, res) => {
  try {
    const { nombre } = req.query;

    // Obtener todos los clientes
    const clientes = await UsuarioCliente.findAll();

    // Aplicar filtros
    let clientesFiltrados = clientes;

    if (nombre) {
      const nombreLower = nombre.toLowerCase();
      clientesFiltrados = clientesFiltrados.filter(c => 
        `${c.nombre} ${c.apellido}`.toLowerCase().includes(nombreLower)
      );
    }

    // Retornar clientes sin información sensible
    const clientesResponse = clientesFiltrados.map(c => ({
      id: c.id,
      nombre: c.nombre,
      apellido: c.apellido,
      telefono: c.telefono,
      ubicacion_default: c.ubicacion_default,
      createdAt: c.createdAt
    }));

    res.json({
      message: 'Clientes obtenidos exitosamente',
      clientes: clientesResponse,
      total: clientesResponse.length
    });
  } catch (error) {
    console.error('Error al buscar clientes:', error);
    res.status(500).json({
      error: 'Error al buscar clientes',
      message: error.message
    });
  }
};

/**
 * Ver perfil de un cliente específico
 * GET /api/cliente/profile/:id
 * Permite ver el perfil público de un cliente
 */
const getClienteProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const cliente = await UsuarioCliente.findByPk(id);
    if (!cliente) {
      return res.status(404).json({
        error: 'Cliente no encontrado',
        message: 'No existe un cliente con ese ID'
      });
    }

    // Retornar perfil público (sin información sensible)
    const clienteResponse = {
      id: cliente.id,
      nombre: cliente.nombre,
      apellido: cliente.apellido,
      telefono: cliente.telefono,
      ubicacion_default: cliente.ubicacion_default,
      createdAt: cliente.createdAt
    };

    res.json({
      message: 'Perfil de cliente obtenido exitosamente',
      cliente: clienteResponse
    });
  } catch (error) {
    console.error('Error al obtener perfil de cliente:', error);
    res.status(500).json({
      error: 'Error al obtener perfil',
      message: error.message
    });
  }
};

module.exports = {
  updateProfile,
  searchClientes,
  getClienteProfile
};


