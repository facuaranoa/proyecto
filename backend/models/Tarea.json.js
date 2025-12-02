/**
 * Modelo Tarea - Versión JSON
 * 
 * Representa una tarea/servicio solicitado por un cliente y potencialmente asignado a un tasker.
 * Usa archivos JSON en lugar de PostgreSQL.
 */

const { readFile, writeFile } = require('../config/database-json');
const UsuarioCliente = require('./UsuarioCliente.json');
const Tasker = require('./Tasker.json');

const FILE_KEY = 'tareas';

class Tarea {
  constructor(data) {
    this.id = data.id;
    this.cliente_id = data.cliente_id;
    this.tasker_id = data.tasker_id || null;
    this.tipo_servicio = data.tipo_servicio;
    this.descripcion = data.descripcion;
    this.ubicacion = data.ubicacion;
    this.fecha_hora_requerida = data.fecha_hora_requerida;
    this.requiere_licencia = data.requiere_licencia || false;
    this.monto_total_acordado = data.monto_total_acordado;
    this.comision_app = data.comision_app || 0.05; // 5% según definición de negocio
    this.estado = data.estado || 'PENDIENTE';
    // Estados posibles: PENDIENTE, ASIGNADA, EN_PROCESO, PENDIENTE_PAGO, FINALIZADA, CANCELADA
    this.tiempo_respuesta_solicitud = data.tiempo_respuesta_solicitud || null; // Tiempo que el cliente eligió para esperar respuesta
    this.fecha_inicio_trabajo = data.fecha_inicio_trabajo || null; // Cuándo el tasker empezó el trabajo
    this.fecha_finalizacion_trabajo = data.fecha_finalizacion_trabajo || null; // Cuándo el tasker terminó el trabajo
    this.fecha_confirmacion_pago = data.fecha_confirmacion_pago || null; // Cuándo el cliente confirmó el pago
    this.auto_confirmado = data.auto_confirmado || false; // Si fue auto-confirmado después de 48h
    this.pago_recibido_tasker = data.pago_recibido_tasker || false; // Si el tasker confirmó que recibió el pago
    this.fecha_confirmacion_recepcion_pago = data.fecha_confirmacion_recepcion_pago || null; // Cuándo el tasker confirmó que recibió el pago
    this.aprobado_admin = data.aprobado_admin !== undefined ? data.aprobado_admin : true; // Por defecto aprobado
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
    
    // Campo virtual calculado
    // Nota: La comisión se calcula sobre el monto después de la comisión de Mercado Pago (5%)
    // Por simplicidad aquí calculamos sobre el total, pero en producción se ajustará
    this.monto_tasker_neto = parseFloat(this.monto_total_acordado) * (1 - parseFloat(this.comision_app));
  }

  // Método estático: encontrar todas las tareas con filtros
  static async findAll(options = {}) {
    let tareas = await readFile(FILE_KEY);
    
    // Aplicar filtros WHERE
    if (options.where) {
      tareas = tareas.filter(tarea => {
        for (const [key, value] of Object.entries(options.where)) {
          if (tarea[key] !== value) {
            return false;
          }
        }
        return true;
      });
    }
    
    // Aplicar ordenamiento
    if (options.order) {
      const [field, direction] = options.order[0];
      tareas.sort((a, b) => {
        const aVal = a[field];
        const bVal = b[field];
        if (direction === 'DESC') {
          return bVal > aVal ? 1 : bVal < aVal ? -1 : 0;
        }
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      });
    }
    
    // Incluir relaciones si se especifica (antes de filtrar atributos)
    if (options.include) {
      for (const include of options.include) {
        if (include.model && include.as === 'cliente') {
          for (const tarea of tareas) {
            if (tarea.cliente_id) {
              // Buscar primero en UsuarioCliente, luego en Tasker
              let cliente = await UsuarioCliente.findByPk(tarea.cliente_id);
              if (!cliente) {
                cliente = await Tasker.findByPk(tarea.cliente_id);
              }
              if (cliente) {
                const clienteData = {};
                include.attributes.forEach(attr => {
                  clienteData[attr] = cliente[attr];
                });
                tarea.cliente = clienteData;
              }
            }
          }
        }
      }
    }
    
    // Aplicar límite y offset (paginación)
    if (options.offset !== undefined) {
      tareas = tareas.slice(options.offset);
    }
    if (options.limit !== undefined) {
      tareas = tareas.slice(0, options.limit);
    }
    
    // Aplicar filtros de atributos (select) - después de includes
    if (options.attributes) {
      tareas = tareas.map(tarea => {
        const filtered = {};
        options.attributes.forEach(attr => {
          if (tarea[attr] !== undefined) {
            filtered[attr] = tarea[attr];
          }
        });
        // Mantener relaciones incluidas
        if (tarea.cliente) {
          filtered.cliente = tarea.cliente;
        }
        return filtered;
      });
    }
    
    return tareas.map(t => {
      // Si se filtraron atributos, retornar objeto plano, sino instancia de Tarea
      if (options.attributes && Object.keys(t).length < 10) {
        return t;
      }
      return new Tarea(t);
    });
  }

  // Método estático: encontrar por ID
  static async findByPk(id) {
    const tareas = await readFile(FILE_KEY);
    const tarea = tareas.find(t => t.id === parseInt(id));
    return tarea ? new Tarea(tarea) : null;
  }

  // Método estático: encontrar y contar
  static async findAndCountAll(options = {}) {
    let tareas = await readFile(FILE_KEY);
    
    // Filtrar por ciudad primero si se especifica
    if (options.where && options.where.ciudad) {
      const ciudad = options.where.ciudad.toLowerCase();
      tareas = tareas.filter(tarea => {
        if (tarea.ubicacion && typeof tarea.ubicacion === 'object') {
          const tareaCiudad = (tarea.ubicacion.ciudad || '').toLowerCase();
          return tareaCiudad.includes(ciudad);
        }
        return false;
      });
      // Remover ciudad de filtros para que no interfiera
      const ciudadFilter = options.where.ciudad;
      delete options.where.ciudad;
    }
    
    // Aplicar filtros WHERE
    if (options.where) {
      tareas = tareas.filter(tarea => {
        for (const [key, value] of Object.entries(options.where)) {
          if (key === 'monto_total_acordado' && typeof value === 'object') {
            // Manejar operadores como gte, lte
            if (value.gte !== undefined && parseFloat(tarea[key]) < parseFloat(value.gte)) {
              return false;
            }
            if (value.lte !== undefined && parseFloat(tarea[key]) > parseFloat(value.lte)) {
              return false;
            }
            continue;
          }
          if (key === 'fecha_hora_requerida' && typeof value === 'object') {
            // Manejar operadores de fecha
            if (value.gte !== undefined && new Date(tarea[key]) < new Date(value.gte)) {
              return false;
            }
            if (value.lte !== undefined && new Date(tarea[key]) > new Date(value.lte)) {
              return false;
            }
            continue;
          }
          if (tarea[key] !== value && value !== null) {
            return false;
          }
        }
        return true;
      });
    }
    
    const count = tareas.length;
    
    // Aplicar ordenamiento
    if (options.order) {
      const [field, direction] = options.order[0];
      tareas.sort((a, b) => {
        const aVal = a[field];
        const bVal = b[field];
        if (direction === 'DESC') {
          return bVal > aVal ? 1 : bVal < aVal ? -1 : 0;
        }
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      });
    }
    
    // Aplicar límite y offset (paginación) - ANTES de includes para mejor performance
    let tareasPaginadas = tareas;
    if (options.offset !== undefined) {
      tareasPaginadas = tareasPaginadas.slice(options.offset);
    }
    if (options.limit !== undefined) {
      tareasPaginadas = tareasPaginadas.slice(0, options.limit);
    }
    
    // Incluir relaciones si se especifica (después de paginación)
    if (options.include) {
      for (const include of options.include) {
        if (include.as === 'cliente') {
          for (const tarea of tareasPaginadas) {
            if (tarea.cliente_id) {
              try {
                // Buscar primero en UsuarioCliente, luego en Tasker
                let cliente = await UsuarioCliente.findByPk(tarea.cliente_id);
                if (!cliente) {
                  cliente = await Tasker.findByPk(tarea.cliente_id);
                }
                if (cliente) {
                  const clienteData = {};
                  if (include.attributes && Array.isArray(include.attributes)) {
                    include.attributes.forEach(attr => {
                      if (cliente[attr] !== undefined) {
                        clienteData[attr] = cliente[attr];
                      }
                    });
                  } else {
                    // Si no se especifican atributos, incluir nombre y apellido por defecto
                    clienteData.nombre = cliente.nombre;
                    clienteData.apellido = cliente.apellido;
                  }
                  tarea.cliente = clienteData;
                } else {
                  // Si no se encuentra el cliente, crear objeto vacío para evitar errores
                  tarea.cliente = { nombre: 'N/A', apellido: '' };
                }
              } catch (error) {
                console.error(`Error al cargar cliente para tarea ${tarea.id}:`, error);
                tarea.cliente = { nombre: 'N/A', apellido: '' };
              }
            } else {
              // Si no hay cliente_id, crear objeto vacío
              tarea.cliente = { nombre: 'N/A', apellido: '' };
            }
          }
        }
      }
    }
    
    // Aplicar filtros de atributos (select) - después de includes
    if (options.attributes) {
      tareasPaginadas = tareasPaginadas.map(tarea => {
        const filtered = {};
        options.attributes.forEach(attr => {
          if (tarea[attr] !== undefined) {
            filtered[attr] = tarea[attr];
          }
        });
        // Mantener relaciones incluidas (cliente)
        if (tarea.cliente) {
          filtered.cliente = tarea.cliente;
        }
        // Mantener ubicación si existe
        if (tarea.ubicacion) {
          filtered.ubicacion = tarea.ubicacion;
        }
        return filtered;
      });
    }
    
    return {
      count,
      rows: tareasPaginadas.map(t => {
        // Si se filtraron atributos, retornar objeto plano (ya tiene cliente incluido)
        if (options.attributes && Object.keys(t).length < 10) {
          return t;
        }
        // Si no se filtraron atributos, crear instancia de Tarea pero preservar cliente si existe
        const tareaInstance = new Tarea(t);
        if (t.cliente) {
          tareaInstance.cliente = t.cliente;
        }
        return tareaInstance;
      })
    };
  }

  // Método estático: crear nueva tarea
  static async create(data) {
    const tareas = await readFile(FILE_KEY);
    
    // Generar nuevo ID
    const maxId = tareas.length > 0 ? Math.max(...tareas.map(t => t.id || 0)) : 0;
    const nuevoId = maxId + 1;
    
    const nuevaTarea = {
      id: nuevoId,
      cliente_id: data.cliente_id,
      tasker_id: data.tasker_id || null,
      tipo_servicio: data.tipo_servicio,
      descripcion: data.descripcion,
      ubicacion: data.ubicacion,
      fecha_hora_requerida: data.fecha_hora_requerida,
      requiere_licencia: data.requiere_licencia || false,
      monto_total_acordado: data.monto_total_acordado,
      comision_app: data.comision_app || 0.20,
      estado: data.estado || 'PENDIENTE',
      tiempo_respuesta_solicitud: data.tiempo_respuesta_solicitud || null,
      fecha_inicio_trabajo: data.fecha_inicio_trabajo || null,
      fecha_finalizacion_trabajo: data.fecha_finalizacion_trabajo || null,
      fecha_confirmacion_pago: data.fecha_confirmacion_pago || null,
      auto_confirmado: data.auto_confirmado || false,
      pago_recibido_tasker: data.pago_recibido_tasker || false,
      fecha_confirmacion_recepcion_pago: data.fecha_confirmacion_recepcion_pago || null,
      aprobado_admin: data.aprobado_admin !== undefined ? data.aprobado_admin : true, // Por defecto aprobado
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    tareas.push(nuevaTarea);
    await writeFile(FILE_KEY, tareas);
    
    return new Tarea(nuevaTarea);
  }

  // Método de instancia: actualizar
  async update(data) {
    const tareas = await readFile(FILE_KEY);
    const index = tareas.findIndex(t => t.id === this.id);
    
    if (index === -1) {
      throw new Error('Tarea no encontrada');
    }
    
    tareas[index] = {
      ...tareas[index],
      ...data,
      id: this.id, // No permitir cambiar el ID
      updatedAt: new Date().toISOString()
    };
    
    await writeFile(FILE_KEY, tareas);
    
    // Actualizar instancia actual
    Object.assign(this, tareas[index]);
    
    return this;
  }
}

module.exports = Tarea;

