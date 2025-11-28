/**
 * Modelo Admin - Versión JSON
 * 
 * Representa un administrador del sistema.
 * Usa archivos JSON en lugar de PostgreSQL.
 */

const { readFile, writeFile } = require('../config/database-json');
const bcrypt = require('bcryptjs');

const FILE_KEY = 'admins';

class Admin {
  constructor(data) {
    this.id = data.id;
    this.email = data.email;
    this.password_hash = data.password_hash;
    this.nombre = data.nombre;
    this.apellido = data.apellido;
    this.telefono = data.telefono || null;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  // Método para comparar contraseñas
  async comparePassword(password) {
    return await bcrypt.compare(password, this.password_hash);
  }

  // Método estático: encontrar todas los admins
  static async findAll(options = {}) {
    let admins = await readFile(FILE_KEY);
    
    // Aplicar filtros WHERE
    if (options.where) {
      admins = admins.filter(admin => {
        for (const [key, value] of Object.entries(options.where)) {
          if (admin[key] !== value) {
            return false;
          }
        }
        return true;
      });
    }
    
    // Aplicar ordenamiento
    if (options.order) {
      const [field, direction] = options.order[0];
      admins.sort((a, b) => {
        const aVal = a[field];
        const bVal = b[field];
        if (direction === 'DESC') {
          return bVal > aVal ? 1 : bVal < aVal ? -1 : 0;
        }
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      });
    }
    
    // Aplicar límite y offset
    if (options.offset !== undefined) {
      admins = admins.slice(options.offset);
    }
    if (options.limit !== undefined) {
      admins = admins.slice(0, options.limit);
    }
    
    return admins.map(a => new Admin(a));
  }

  // Método estático: encontrar por ID
  static async findByPk(id) {
    const admins = await readFile(FILE_KEY);
    const admin = admins.find(a => a.id === parseInt(id));
    return admin ? new Admin(admin) : null;
  }

  // Método estático: encontrar uno
  static async findOne(options = {}) {
    const admins = await this.findAll(options);
    return admins.length > 0 ? admins[0] : null;
  }

  // Método estático: crear nuevo admin
  static async create(data) {
    const admins = await readFile(FILE_KEY);
    
    // Verificar que el email no exista
    const existe = admins.find(a => a.email === data.email);
    if (existe) {
      throw new Error('Ya existe un admin con ese email');
    }
    
    // Generar ID
    const maxId = admins.length > 0 
      ? Math.max(...admins.map(a => a.id || 0))
      : 0;
    const newId = maxId + 1;
    
    // Encriptar contraseña
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(data.password, salt);
    
    const nuevoAdmin = new Admin({
      id: newId,
      email: data.email,
      password_hash: password_hash,
      nombre: data.nombre,
      apellido: data.apellido,
      telefono: data.telefono || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    admins.push(nuevoAdmin);
    await writeFile(FILE_KEY, admins);
    
    return nuevoAdmin;
  }

  // Método de instancia: actualizar
  async update(data) {
    const admins = await readFile(FILE_KEY);
    const index = admins.findIndex(a => a.id === this.id);
    
    if (index === -1) {
      throw new Error('Admin no encontrado');
    }
    
    // Si se actualiza la contraseña, encriptarla
    if (data.password) {
      const salt = await bcrypt.genSalt(10);
      data.password_hash = await bcrypt.hash(data.password, salt);
      delete data.password;
    }
    
    admins[index] = {
      ...admins[index],
      ...data,
      updatedAt: new Date().toISOString()
    };
    
    await writeFile(FILE_KEY, admins);
    
    // Actualizar instancia
    Object.assign(this, admins[index]);
    return this;
  }

  // Método de instancia: eliminar
  async destroy() {
    const admins = await readFile(FILE_KEY);
    const filtered = admins.filter(a => a.id !== this.id);
    await writeFile(FILE_KEY, filtered);
  }
}

module.exports = Admin;

