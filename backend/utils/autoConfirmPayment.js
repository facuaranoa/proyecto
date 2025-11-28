/**
 * Utilidad para auto-confirmar pagos después de 48 horas
 * 
 * Esta función verifica las tareas en estado PENDIENTE_PAGO
 * y las auto-confirma si han pasado más de 48 horas desde que el tasker finalizó.
 */

const Tarea = require('../models/Tarea');

/**
 * Auto-confirmar pagos pendientes que tengan más de 48 horas
 * Esta función debe ejecutarse periódicamente (ej: cada hora)
 */
async function autoConfirmPendingPayments() {
  try {
    console.log('🔄 Verificando pagos pendientes para auto-confirmación...');
    
    // Obtener todas las tareas en estado PENDIENTE_PAGO
    const tareasPendientes = await Tarea.findAll({
      where: {
        estado: 'PENDIENTE_PAGO'
      }
    });

    const ahora = new Date();
    const horas48 = 48 * 60 * 60 * 1000; // 48 horas en milisegundos
    let confirmadas = 0;

    for (const tarea of tareasPendientes) {
      if (tarea.fecha_finalizacion_trabajo) {
        const fechaFinalizacion = new Date(tarea.fecha_finalizacion_trabajo);
        const tiempoTranscurrido = ahora - fechaFinalizacion;

        // Si han pasado más de 48 horas, auto-confirmar
        if (tiempoTranscurrido >= horas48) {
          await tarea.update({
            estado: 'FINALIZADA',
            fecha_confirmacion_pago: ahora.toISOString(),
            auto_confirmado: true // Marcar como auto-confirmado
          });

          confirmadas++;
          console.log(`✅ Tarea ${tarea.id} auto-confirmada (pasaron ${Math.round(tiempoTranscurrido / (60 * 60 * 1000))} horas)`);
        }
      }
    }

    if (confirmadas > 0) {
      console.log(`✅ ${confirmadas} tarea(s) auto-confirmada(s)`);
    } else {
      console.log('ℹ️ No hay tareas pendientes de auto-confirmación');
    }

    return { confirmadas, total: tareasPendientes.length };
  } catch (error) {
    console.error('❌ Error en auto-confirmación de pagos:', error);
    throw error;
  }
}

/**
 * Verificar y auto-confirmar una tarea específica
 * Útil para verificar cuando se consulta una tarea
 */
async function checkAndAutoConfirmTask(tareaId) {
  try {
    const tarea = await Tarea.findByPk(tareaId);
    
    if (!tarea || tarea.estado !== 'PENDIENTE_PAGO') {
      return false;
    }

    if (tarea.fecha_finalizacion_trabajo) {
      const ahora = new Date();
      const fechaFinalizacion = new Date(tarea.fecha_finalizacion_trabajo);
      const tiempoTranscurrido = ahora - fechaFinalizacion;
      const horas48 = 48 * 60 * 60 * 1000;

      if (tiempoTranscurrido >= horas48) {
        await tarea.update({
          estado: 'FINALIZADA',
          fecha_confirmacion_pago: ahora.toISOString(),
          auto_confirmado: true
        });

        console.log(`✅ Tarea ${tareaId} auto-confirmada al consultarla`);
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error(`❌ Error al verificar auto-confirmación de tarea ${tareaId}:`, error);
    return false;
  }
}

module.exports = {
  autoConfirmPendingPayments,
  checkAndAutoConfirmTask
};


