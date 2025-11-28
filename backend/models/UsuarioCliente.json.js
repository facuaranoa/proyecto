/**
 * Modelo UsuarioCliente - Versión JSON
 * 
 * Representa a los clientes que solicitan servicios en la plataforma.
 * Usa archivos JSON en lugar de PostgreSQL.
 */

const { readFile, writeFile } = require('../config/database-json');
const bcrypt = require('bcryptjs');

const FILE_KEY = 'usuariosClientes';

class UsuarioCliente {
  constructor(data) {
    this.id = data.id;
    this.email = data.email;
    this.password_hash = data.password_hash;
    this.nombre = data.nombre;
    this.apellido = data.apellido;
    this.telefono = data.telefono;
    this.ubicacion_default = data.ubicacion_default || null;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  // Método para comparar contraseñas
  async comparePassword(password) {
    return await bcrypt.compare(password, this.password_hash);
  }

  // Método estático: encontrar por email
  static async findOne({ where }) {
    const usuarios = await readFile(FILE_KEY);
    const usuario = usuarios.find(u => {
      if (where.email) return u.email === where.email;
      return false;
    });
    return usuario ? new UsuarioCliente(usuario) : null;
  }

  // Método estático: encontrar por ID
  static async findByPk(id) {
    const usuarios = await readFile(FILE_KEY);
    const usuario = usuarios.find(u => u.id === parseInt(id));
    return usuario ? new UsuarioCliente(usuario) : null;
  }

  // Método estático: encontrar todos los clientes
  static async findAll(options = {}) {
    const usuarios = await readFile(FILE_KEY);
    return usuarios.map(u => new UsuarioCliente(u));
  }

  // Método estático: crear nuevo usuario
  static async create(data) {
    const usuarios = await readFile(FILE_KEY);
    
    // Encriptar contraseña
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(data.password_hash, salt);
    
    // Generar nuevo ID
    const maxId = usuarios.length > 0 ? Math.max(...usuarios.map(u => u.id || 0)) : 0;
    const nuevoId = maxId + 1;
    
    const nuevoUsuario = {
      id: nuevoId,
      email: data.email,
      password_hash: password_hash,
      nombre: data.nombre,
      apellido: data.apellido,
      telefono: data.telefono,
      ubicacion_default: data.ubicacion_default || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    usuarios.push(nuevoUsuario);
    await writeFile(FILE_KEY, usuarios);
    
    return new UsuarioCliente(nuevoUsuario);
  }

  // Método de instancia: actualizar
  async update(data) {
    const usuarios = await readFile(FILE_KEY);
    const index = usuarios.findIndex(u => u.id === this.id);
    
    if (index === -1) {
      throw new Error('Usuario no encontrado');
    }
    
    // Si se actualiza la contraseña, encriptarla
    if (data.password_hash && data.password_hash !== this.password_hash) {
      const salt = await bcrypt.genSalt(10);
      data.password_hash = await bcrypt.hash(data.password_hash, salt);
    }
    
    usuarios[index] = {
      ...usuarios[index],
      ...data,
      id: this.id, // No permitir cambiar el ID
      updatedAt: new Date().toISOString()
    };
    
    await writeFile(FILE_KEY, usuarios);
    
    // Actualizar instancia actual
    Object.assign(this, usuarios[index]);
    
    return this;
  }
}

module.exports = UsuarioCliente;




