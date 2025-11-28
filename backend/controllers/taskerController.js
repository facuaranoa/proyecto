/**
 * Controller de Tasker
 * 
 * Maneja la lógica relacionada con los taskers.
 */

const Tasker = require('../models/Tasker');

/**
 * Actualizar perfil del Tasker
 * PUT /api/tasker/profile/:id
 * Permite actualizar disponibilidad y otros campos del perfil
 */
const updateProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { disponible } = req.body;

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

    // Actualizar campos permitidos
    const camposPermitidos = ['disponible'];
    const camposActualizados = {};

    camposPermitidos.forEach(campo => {
      if (req.body[campo] !== undefined) {
        camposActualizados[campo] = req.body[campo];
      }
    });

    // Actualizar el tasker
    await tasker.update(camposActualizados);

    // Retornar el tasker actualizado
    res.json({
      message: 'Perfil actualizado exitosamente',
      tasker: {
        id: tasker.id,
        email: tasker.email,
        nombre: tasker.nombre,
        apellido: tasker.apellido,
        disponible: tasker.disponible,
        aprobado_admin: tasker.aprobado_admin
      }
    });
  } catch (error) {
    console.error('Error al actualizar perfil de tasker:', error);
    res.status(500).json({
      error: 'Error al actualizar perfil',
      message: error.message
    });
  }
};

module.exports = {
  updateProfile
};



