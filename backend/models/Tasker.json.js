/**
 * Modelo Tasker - Versión JSON
 * 
 * Representa a los trabajadores que ofrecen servicios en la plataforma.
 * Usa archivos JSON en lugar de PostgreSQL.
 */

const { readFile, writeFile } = require('../config/database-json');
const bcrypt = require('bcryptjs');

const FILE_KEY = 'taskers';

class Tasker {
  constructor(data) {
    this.id = data.id;
    this.email = data.email;
    this.password_hash = data.password_hash;
    this.nombre = data.nombre;
    this.apellido = data.apellido;
    this.telefono = data.telefono;
    this.cuit = data.cuit || null;
    this.monotributista_check = data.monotributista_check || false;
    this.terminos_aceptados = data.terminos_aceptados || false;
    this.dni_url = data.dni_url || null;
    this.matricula_url = data.matricula_url || null;
    this.licencia_conducir_url = data.licencia_conducir_url || null;
    this.aprobado_admin = data.aprobado_admin || false;
    this.disponible = data.disponible !== undefined ? data.disponible : true;
    // Nuevos campos: skills, licencias y categorías
    this.skills = data.skills || []; // Array de habilidades (ej: ["Plomería", "Electricidad"])
    this.licencias = data.licencias || []; // Array de licencias (ej: ["Licencia de conducir", "Matrícula de gasista"])
    this.categoria_principal = data.categoria_principal || null; // EXPRESS, OFICIOS, etc.
    this.especialidades = data.especialidades || []; // Array de especialidades dentro de OFICIOS (ej: ["Plomería", "Albañilería", "Electricista", "Gasista"])
    this.descripcion_profesional = data.descripcion_profesional || null; // Descripción del trabajo/profesión
    this.cvu_cbu = data.cvu_cbu || null; // CVU/CBU para recibir pagos
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  // Método para comparar contraseñas
  async comparePassword(password) {
    return await bcrypt.compare(password, this.password_hash);
  }

  // Método estático: encontrar todos los taskers (con filtros opcionales)
  static async findAll(options = {}) {
    const taskers = await readFile(FILE_KEY);
    let filtered = taskers.map(t => new Tasker(t));

    // Aplicar filtros si existen
    if (options.where) {
      if (options.where.aprobado_admin !== undefined) {
        filtered = filtered.filter(t => t.aprobado_admin === options.where.aprobado_admin);
      }
    }

    return filtered;
  }

  // Método estático: encontrar por email
  static async findOne({ where }) {
    const taskers = await readFile(FILE_KEY);
    const tasker = taskers.find(t => {
      if (where.email) return t.email === where.email;
      return false;
    });
    return tasker ? new Tasker(tasker) : null;
  }

  // Método estático: encontrar por ID
  static async findByPk(id) {
    const taskers = await readFile(FILE_KEY);
    const tasker = taskers.find(t => t.id === parseInt(id));
    return tasker ? new Tasker(tasker) : null;
  }

  // Método estático: crear nuevo tasker
  static async create(data) {
    const taskers = await readFile(FILE_KEY);
    
    // Encriptar contraseña
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(data.password_hash, salt);
    
    // Generar nuevo ID
    const maxId = taskers.length > 0 ? Math.max(...taskers.map(t => t.id || 0)) : 0;
    const nuevoId = maxId + 1;
    
    const nuevoTasker = {
      id: nuevoId,
      email: data.email,
      password_hash: password_hash,
      nombre: data.nombre,
      apellido: data.apellido,
      telefono: data.telefono,
      cuit: data.cuit || null,
      monotributista_check: data.monotributista_check || false,
      terminos_aceptados: data.terminos_aceptados || false,
      dni_url: data.dni_url || null,
      matricula_url: data.matricula_url || null,
      licencia_conducir_url: data.licencia_conducir_url || null,
      aprobado_admin: data.aprobado_admin || false,
      disponible: data.disponible !== undefined ? data.disponible : true,
      skills: data.skills || [],
      licencias: data.licencias || [],
      categoria_principal: data.categoria_principal || null,
      especialidades: data.especialidades || [],
      descripcion_profesional: data.descripcion_profesional || null,
      cvu_cbu: data.cvu_cbu || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    taskers.push(nuevoTasker);
    await writeFile(FILE_KEY, taskers);
    
    return new Tasker(nuevoTasker);
  }

  // Método de instancia: actualizar
  async update(data) {
    const taskers = await readFile(FILE_KEY);
    const index = taskers.findIndex(t => t.id === this.id);
    
    if (index === -1) {
      throw new Error('Tasker no encontrado');
    }
    
    // Si se actualiza la contraseña, encriptarla
    if (data.password_hash && data.password_hash !== this.password_hash) {
      const salt = await bcrypt.genSalt(10);
      data.password_hash = await bcrypt.hash(data.password_hash, salt);
    }
    
    taskers[index] = {
      ...taskers[index],
      ...data,
      id: this.id, // No permitir cambiar el ID
      updatedAt: new Date().toISOString()
    };
    
    await writeFile(FILE_KEY, taskers);
    
    // Actualizar instancia actual
    Object.assign(this, taskers[index]);
    
    return this;
  }
}

module.exports = Tasker;

