/**
 * Modelo Mensaje - Versión JSON
 * 
 * Representa un mensaje en el sistema de chat entre cliente y tasker.
 * Cada mensaje está vinculado a una tarea específica.
 * Usa archivos JSON en lugar de PostgreSQL.
 */

const { readFile, writeFile } = require('../config/database-json');

const FILE_KEY = 'mensajes';

class Mensaje {
  constructor(data) {
    this.id = data.id || null;
    this.tarea_id = data.tarea_id;
    this.remitente_id = data.remitente_id;
    this.remitente_tipo = data.remitente_tipo; // 'cliente' o 'tasker'
    this.remitente_nombre = data.remitente_nombre || null; // Nombre para mostrar
    this.mensaje = data.mensaje;
    this.leido = data.leido !== undefined ? data.leido : false;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  // Método estático: encontrar todos los mensajes con filtros
  static async findAll(options = {}) {
    let mensajes = await readFile(FILE_KEY);
    
    // Aplicar filtros WHERE
    if (options.where) {
      mensajes = mensajes.filter(mensaje => {
        for (const [key, value] of Object.entries(options.where)) {
          if (mensaje[key] !== value) {
            return false;
          }
        }
        return true;
      });
    }
    
    // Aplicar ordenamiento
    if (options.order) {
      const [field, direction] = options.order[0];
      mensajes.sort((a, b) => {
        const aVal = a[field];
        const bVal = b[field];
        if (direction === 'DESC') {
          return bVal > aVal ? 1 : bVal < aVal ? -1 : 0;
        } else {
          return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
        }
      });
    }
    
    return mensajes;
  }

  // Método estático: encontrar un mensaje por ID
  static async findByPk(id) {
    const mensajes = await readFile(FILE_KEY);
    const mensaje = mensajes.find(m => m.id === id);
    if (!mensaje) return null;
    return new Mensaje(mensaje);
  }

  // Método estático: encontrar un mensaje con condiciones
  static async findOne(options = {}) {
    const mensajes = await this.findAll(options);
    return mensajes.length > 0 ? new Mensaje(mensajes[0]) : null;
  }

  // Método estático: crear un nuevo mensaje
  static async create(data) {
    let mensajes = await readFile(FILE_KEY);
    
    const maxId = mensajes.length > 0 
      ? Math.max(...mensajes.map(m => m.id || 0))
      : 0;
    
    const nuevoMensaje = new Mensaje({
      ...data,
      id: maxId + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    mensajes.push(nuevoMensaje);
    await writeFile(FILE_KEY, mensajes);
    
    return nuevoMensaje;
  }

  // Método de instancia: actualizar mensaje
  async update(data) {
    let mensajes = await readFile(FILE_KEY);
    const index = mensajes.findIndex(m => m.id === this.id);
    
    if (index === -1) {
      throw new Error('Mensaje no encontrado');
    }
    
    Object.assign(this, data, {
      updatedAt: new Date().toISOString()
    });
    
    mensajes[index] = this;
    await writeFile(FILE_KEY, mensajes);
    
    return this;
  }

  // Método estático: contar mensajes
  static async count(options = {}) {
    const mensajes = await this.findAll(options);
    return mensajes.length;
  }
}

module.exports = Mensaje;
