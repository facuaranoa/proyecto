/**
 * Modelo SolicitudTarea - Versión JSON
 * 
 * Representa una solicitud/aplicación de un tasker a una tarea, o una solicitud enviada por un cliente a un tasker.
 * Usa archivos JSON en lugar de PostgreSQL.
 */

const { readFile, writeFile } = require('../config/database-json');

const FILE_KEY = 'solicitudesTareas';

class SolicitudTarea {
  constructor(data) {
    this.id = data.id;
    this.tarea_id = data.tarea_id;
    this.tasker_id = data.tasker_id;
    this.cliente_id = data.cliente_id;
    this.tipo = data.tipo; // 'APLICACION' (tasker aplica) o 'SOLICITUD' (cliente envía)
    this.estado = data.estado || 'PENDIENTE'; // PENDIENTE, ACEPTADA, RECHAZADA, EXPIRADA
    this.tiempo_respuesta = data.tiempo_respuesta || null; // Tiempo que el cliente eligió para esperar respuesta (en horas)
    this.fecha_limite_respuesta = data.fecha_limite_respuesta || null; // Fecha límite para que el tasker responda
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  // Método estático: encontrar todas las solicitudes
  static async findAll(options = {}) {
    let solicitudes = await readFile(FILE_KEY);
    
    // Aplicar filtros WHERE
    if (options.where) {
      solicitudes = solicitudes.filter(solicitud => {
        for (const [key, value] of Object.entries(options.where)) {
          if (solicitud[key] !== value) {
            return false;
          }
        }
        return true;
      });
    }
    
    // Aplicar ordenamiento
    if (options.order) {
      const [field, direction] = options.order[0];
      solicitudes.sort((a, b) => {
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
      solicitudes = solicitudes.slice(options.offset);
    }
    if (options.limit !== undefined) {
      solicitudes = solicitudes.slice(0, options.limit);
    }
    
    return solicitudes.map(s => new SolicitudTarea(s));
  }

  // Método estático: encontrar por ID
  static async findByPk(id) {
    const solicitudes = await readFile(FILE_KEY);
    const solicitud = solicitudes.find(s => s.id === parseInt(id));
    return solicitud ? new SolicitudTarea(solicitud) : null;
  }

  // Método estático: encontrar una solicitud
  static async findOne(options = {}) {
    const solicitudes = await this.findAll(options);
    return solicitudes.length > 0 ? solicitudes[0] : null;
  }

  // Método estático: crear nueva solicitud
  static async create(data) {
    const solicitudes = await readFile(FILE_KEY);
    
    // Generar ID
    const maxId = solicitudes.length > 0 
      ? Math.max(...solicitudes.map(s => s.id || 0))
      : 0;
    const newId = maxId + 1;
    
    const nuevaSolicitud = new SolicitudTarea({
      id: newId,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    solicitudes.push(nuevaSolicitud);
    await writeFile(FILE_KEY, solicitudes);
    
    return nuevaSolicitud;
  }

  // Método de instancia: actualizar
  async update(data) {
    const solicitudes = await readFile(FILE_KEY);
    const index = solicitudes.findIndex(s => s.id === this.id);
    
    if (index === -1) {
      throw new Error('Solicitud no encontrada');
    }
    
    solicitudes[index] = {
      ...solicitudes[index],
      ...data,
      updatedAt: new Date().toISOString()
    };
    
    await writeFile(FILE_KEY, solicitudes);
    
    // Actualizar instancia
    Object.assign(this, solicitudes[index]);
    return this;
  }

  // Método de instancia: eliminar
  async destroy() {
    const solicitudes = await readFile(FILE_KEY);
    const filtered = solicitudes.filter(s => s.id !== this.id);
    await writeFile(FILE_KEY, filtered);
  }
}

module.exports = SolicitudTarea;

