/**
 * Modelo de Calificación
 * 
 * Almacena las calificaciones mutuas entre clientes y taskers.
 * Cada tarea finalizada debe tener 2 calificaciones: una del cliente al tasker y otra del tasker al cliente.
 */

const { readFile, writeFile } = require('../config/database-json');

const FILE_KEY = 'calificaciones';

class Calificacion {
  constructor(data = {}) {
    this.id = data.id || null;
    this.tarea_id = data.tarea_id || null; // ID de la tarea relacionada
    this.calificador_id = data.calificador_id || null; // ID del usuario que califica (cliente o tasker)
    this.calificador_tipo = data.calificador_tipo || null; // 'cliente' o 'tasker'
    this.calificado_id = data.calificado_id || null; // ID del usuario calificado
    this.calificado_tipo = data.calificado_tipo || null; // 'cliente' o 'tasker'
    this.estrellas = data.estrellas || null; // 1-5 estrellas (obligatorio)
    this.comentario = data.comentario || null; // Comentario opcional
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  // Guardar calificación
  async save() {
    let calificaciones = await readFile(FILE_KEY);
    
    if (this.id === null) {
      // Nueva calificación
      const maxId = calificaciones.length > 0 
        ? Math.max(...calificaciones.map(c => c.id || 0))
        : 0;
      this.id = maxId + 1;
      this.createdAt = new Date().toISOString();
      this.updatedAt = new Date().toISOString();
      calificaciones.push(this);
    } else {
      // Actualizar calificación existente
      const index = calificaciones.findIndex(c => c.id === this.id);
      if (index !== -1) {
        this.updatedAt = new Date().toISOString();
        calificaciones[index] = this;
      } else {
        throw new Error('Calificación no encontrada');
      }
    }
    
    await writeFile(FILE_KEY, calificaciones);
    return this;
  }

  // Actualizar calificación
  async update(data) {
    Object.assign(this, data);
    this.updatedAt = new Date().toISOString();
    return await this.save();
  }

  // Buscar por ID
  static async findByPk(id) {
    const calificaciones = await readFile(FILE_KEY);
    const calificacion = calificaciones.find(c => c.id === parseInt(id));
    return calificacion ? new Calificacion(calificacion) : null;
  }

  // Buscar todas las calificaciones con filtros
  static async findAll(options = {}) {
    let calificaciones = await readFile(FILE_KEY);

    // Aplicar filtros WHERE
    if (options.where) {
      calificaciones = calificaciones.filter(calif => {
        for (const [key, value] of Object.entries(options.where)) {
          if (calif[key] !== value) {
            return false;
          }
        }
        return true;
      });
    }

    // Aplicar ordenamiento
    if (options.order) {
      const [field, direction] = options.order[0];
      calificaciones.sort((a, b) => {
        const aVal = a[field];
        const bVal = b[field];
        if (direction === 'DESC') {
          return bVal > aVal ? 1 : bVal < aVal ? -1 : 0;
        }
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      });
    }

    return calificaciones.map(c => new Calificacion(c));
  }

  // Buscar una calificación específica
  static async findOne(options = {}) {
    const calificaciones = await this.findAll(options);
    return calificaciones.length > 0 ? calificaciones[0] : null;
  }

  // Calcular promedio de calificaciones para un usuario
  static async getAverageRating(usuarioId, tipoUsuario) {
    const calificaciones = await this.findAll({
      where: {
        calificado_id: usuarioId,
        calificado_tipo: tipoUsuario
      }
    });

    if (calificaciones.length === 0) {
      return {
        promedio: 0,
        cantidad: 0,
        puntos: 50 // Puntos neutrales si no hay calificaciones
      };
    }

    const suma = calificaciones.reduce((acc, calif) => acc + (calif.estrellas || 0), 0);
    const promedio = suma / calificaciones.length;

    // Conversión a puntos (para ranking)
    const puntos = promedio * 20; // 5 estrellas = 100 puntos, 4 = 80, etc.

    return {
      promedio: Math.round(promedio * 10) / 10, // Redondear a 1 decimal
      cantidad: calificaciones.length,
      puntos: Math.round(puntos)
    };
  }
}

module.exports = Calificacion;

