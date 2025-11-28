/**
 * Controller de Tasker
 * 
 * Maneja la lógica relacionada con los taskers.
 */

const Tasker = require('../models/Tasker');

/**
 * Actualizar perfil del Tasker
 * PUT /api/tasker/profile/:id
 * Permite actualizar todos los campos del perfil
 */
const updateProfile = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que el usuario autenticado sea el mismo tasker
    if (req.user.id !== parseInt(id)) {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: 'Solo puedes actualizar tu propio perfil'
      });
    }

    // Verificar que el usuario sea un tasker
    if (req.user.tipo !== 'tasker') {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: 'Este endpoint es solo para taskers'
      });
    }

    // Buscar el tasker
    const tasker = await Tasker.findByPk(id);
    if (!tasker) {
      return res.status(404).json({
        error: 'Tasker no encontrado',
        message: 'No existe un tasker con ese ID'
      });
    }

    // Campos permitidos para actualizar (excluir password_hash, id, aprobado_admin)
    const camposPermitidos = [
      'nombre', 'apellido', 'telefono', 'cuit', 'monotributista_check',
      'dni_url', 'matricula_url', 'licencia_conducir_url',
      'disponible', 'skills', 'licencias', 'categoria_principal',
      'especialidades', 'descripcion_profesional', 'cvu_cbu'
    ];
    
    const camposActualizados = {};

    camposPermitidos.forEach(campo => {
      if (req.body[campo] !== undefined) {
        camposActualizados[campo] = req.body[campo];
      }
    });

    // Actualizar el tasker
    await tasker.update(camposActualizados);

    // Retornar el tasker actualizado (sin password_hash)
    const taskerResponse = {
      id: tasker.id,
      email: tasker.email,
      nombre: tasker.nombre,
      apellido: tasker.apellido,
      telefono: tasker.telefono,
      cuit: tasker.cuit,
      monotributista_check: tasker.monotributista_check,
      dni_url: tasker.dni_url,
      matricula_url: tasker.matricula_url,
      licencia_conducir_url: tasker.licencia_conducir_url,
      disponible: tasker.disponible,
      aprobado_admin: tasker.aprobado_admin,
      skills: tasker.skills || [],
      licencias: tasker.licencias || [],
      categoria_principal: tasker.categoria_principal,
      especialidades: tasker.especialidades || [],
      descripcion_profesional: tasker.descripcion_profesional,
      cvu_cbu: tasker.cvu_cbu,
      createdAt: tasker.createdAt,
      updatedAt: tasker.updatedAt
    };

    res.json({
      message: 'Perfil actualizado exitosamente',
      tasker: taskerResponse
    });
  } catch (error) {
    console.error('Error al actualizar perfil de tasker:', error);
    res.status(500).json({
      error: 'Error al actualizar perfil',
      message: error.message
    });
  }
};

/**
 * Buscar y listar taskers (para clientes)
 * GET /api/tasker/search
 * Permite buscar taskers por nombre, skills, categoría, especialidades, etc.
 */
const searchTaskers = async (req, res) => {
  try {
    const { 
      nombre, 
      categoria_principal, 
      especialidad, 
      skill, 
      aprobado = 'true' 
    } = req.query;

    // Obtener todos los taskers aprobados
    const taskers = await Tasker.findAll({
      where: {
        aprobado_admin: aprobado === 'true'
      }
    });

    // Aplicar filtros
    let taskersFiltrados = taskers;

    if (nombre) {
      const nombreLower = nombre.toLowerCase();
      taskersFiltrados = taskersFiltrados.filter(t => 
        `${t.nombre} ${t.apellido}`.toLowerCase().includes(nombreLower)
      );
    }

    if (categoria_principal) {
      taskersFiltrados = taskersFiltrados.filter(t => 
        t.categoria_principal === categoria_principal.toUpperCase()
      );
    }

    if (especialidad) {
      taskersFiltrados = taskersFiltrados.filter(t => 
        t.especialidades && t.especialidades.some(e => 
          e.toLowerCase().includes(especialidad.toLowerCase())
        )
      );
    }

    if (skill) {
      taskersFiltrados = taskersFiltrados.filter(t => 
        t.skills && t.skills.some(s => 
          s.toLowerCase().includes(skill.toLowerCase())
        )
      );
    }

    // Retornar taskers sin información sensible
    const taskersResponse = taskersFiltrados.map(t => ({
      id: t.id,
      nombre: t.nombre,
      apellido: t.apellido,
      telefono: t.telefono,
      disponible: t.disponible,
      skills: t.skills || [],
      licencias: t.licencias || [],
      categoria_principal: t.categoria_principal,
      especialidades: t.especialidades || [],
      descripcion_profesional: t.descripcion_profesional,
      aprobado_admin: t.aprobado_admin,
      createdAt: t.createdAt
    }));

    res.json({
      message: 'Taskers obtenidos exitosamente',
      taskers: taskersResponse,
      total: taskersResponse.length
    });
  } catch (error) {
    console.error('Error al buscar taskers:', error);
    res.status(500).json({
      error: 'Error al buscar taskers',
      message: error.message
    });
  }
};

/**
 * Ver perfil de un tasker específico
 * GET /api/tasker/profile/:id
 * Permite ver el perfil público de un tasker
 */
const getTaskerProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const tasker = await Tasker.findByPk(id);
    if (!tasker) {
      return res.status(404).json({
        error: 'Tasker no encontrado',
        message: 'No existe un tasker con ese ID'
      });
    }

    // Retornar perfil público (sin información sensible)
    const taskerResponse = {
      id: tasker.id,
      nombre: tasker.nombre,
      apellido: tasker.apellido,
      telefono: tasker.telefono,
      disponible: tasker.disponible,
      skills: tasker.skills || [],
      licencias: tasker.licencias || [],
      categoria_principal: tasker.categoria_principal,
      especialidades: tasker.especialidades || [],
      descripcion_profesional: tasker.descripcion_profesional,
      aprobado_admin: tasker.aprobado_admin,
      createdAt: tasker.createdAt
    };

    res.json({
      message: 'Perfil de tasker obtenido exitosamente',
      tasker: taskerResponse
    });
  } catch (error) {
    console.error('Error al obtener perfil de tasker:', error);
    res.status(500).json({
      error: 'Error al obtener perfil',
      message: error.message
    });
  }
};

module.exports = {
  updateProfile,
  searchTaskers,
  getTaskerProfile
};



