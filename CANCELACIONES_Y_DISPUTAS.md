# 🚫 CANCELACIONES Y RESOLUCIÓN DE CONFLICTOS - Documentación Completa

**Fecha:** Enero 2025  
**Estado:** Cancelaciones ✅ DEFINIDO | Disputas ⏳ PENDIENTE

---

## 📋 ÍNDICE

1. [Cancelaciones](#cancelaciones)
   - [Cancelación por Cliente](#cancelación-por-cliente)
   - [Cancelación por Tasker](#cancelación-por-tasker)
   - [Calificaciones en Cancelaciones](#calificaciones-en-cancelaciones)
2. [Disputas y Resolución de Conflictos](#disputas-y-resolución-de-conflictos)
   - [Estado Actual](#estado-actual)
   - [Pendiente Definir](#pendiente-definir)
3. [Implementación Técnica](#implementación-técnica)
4. [Casos de Uso](#casos-de-uso)

---

## 🚫 CANCELACIONES

### Regla General ✅ DEFINIDO

- ✅ **Cliente** solo puede cancelar **antes de que el tasker empiece el trabajo**
- ✅ **Tasker** solo puede cancelar **después de aceptar pero antes de empezar**

---

### 1. Cancelación por CLIENTE

#### Escenarios y Reembolsos

**A. Cliente cancela ANTES de asignar:**
- ✅ **Reembolso:** 100%
- ✅ **Penalización:** Ninguna
- ✅ **Estado de tarea:** CANCELADA
- ✅ **Tasker:** No afectado (no había asignación)

**B. Cliente cancela DESPUÉS de asignar pero ANTES de empezar:**

**Sistema Dinámico de Reembolsos:**

| Tiempo antes de la fecha | Reembolso | Multa | Notas |
|-------------------------|-----------|-------|-------|
| **+12 horas antes** | 100% | 0% | Sin penalización |
| **6-12 horas antes** | 95% | 5% | Penalización leve |
| **2-6 horas antes** | 90% | 10% | Penalización media |
| **1-2 horas antes** | 80% | 20% | Penalización alta |
| **<1 hora antes** | 70% | 30% | Penalización muy alta |

**Factor Adicional: Anticipación de Creación**
- ✅ Se calcula: `Porcentaje de tiempo usado = (Tiempo desde creación hasta cancelación) / (Tiempo total hasta la fecha)`
- ✅ Si usó **>50% del tiempo** → multa más alta
- ✅ Si usó **<50% del tiempo** → multa más baja

**Ejemplos:**
- Si creó hace 1 semana y cancela con 2 horas → multa más alta
- Si creó hace 1 hora y cancela con 2 horas → multa más baja

**Consecuencias:**
- ✅ Tasker: **NO puede calificar/comentar al cliente** (porque no empezó la tarea)
- ✅ Tasker: **NO recibe compensación**
- ✅ Estado de tarea: CANCELADA

**C. Cliente cancela DESPUÉS de que el tasker empezó:**
- ✅ **Reembolso:** 0% (tasker cobra todo)
- ✅ **Excepción:** Si hay disputa/problema → se revisa caso por caso (ver sección Disputas)
- ✅ Estado de tarea: FINALIZADA o CANCELADA (según caso)

---

### 2. Cancelación por TASKER

**Restricción:** Solo puede cancelar después de aceptar, pero antes de empezar

#### Sistema de Penalizaciones en Ranking:

| Tiempo antes de la fecha | Penalización en ranking | Notas |
|-------------------------|-------------------------|-------|
| **+24 horas antes** | -5 puntos | Penalización leve |
| **12-24 horas antes** | -10 puntos | Penalización media |
| **6-12 horas antes** | -20 puntos | Penalización alta |
| **<6 horas antes** | -30 puntos | Penalización muy alta |
| **Cancelaciones recurrentes** | Suspensión temporal | Si cancela **3+ veces en 30 días** |

#### Opciones para el Cliente:

1. ✅ **Reembolso total automático** (opción por defecto)
   - El dinero se devuelve automáticamente a la cuenta del cliente
   - Procesado por Mercado Pago

2. ✅ **Buscar otro tasker** (la tarea queda disponible nuevamente)
   - La tarea vuelve a estado PENDIENTE
   - Cliente puede asignar a otro tasker
   - El pago se mantiene en retención

3. ❌ Cliente **NO puede calificar al tasker** (porque no empezó la tarea)

#### Consecuencias para el Tasker:

- ✅ Afecta su ranking (penalización en el sistema de puntaje)
- ✅ Si cancela 3+ veces en 30 días → Suspensión temporal
- ✅ La cancelación queda registrada en su historial
- ✅ Puede afectar su visibilidad en futuras búsquedas

---

### 3. Calificaciones en Cancelaciones

#### Reglas Generales:

- ❌ **Ninguno puede calificar/comentar al otro si NO han empezado la tarea**
- ✅ Cliente puede calificar al tasker **solo si la tarea empezó** (incluso si luego se canceló)
- ✅ Tasker puede calificar al cliente **solo si la tarea empezó** (incluso si luego se canceló)
- ✅ Ambas calificaciones afectan el ranking

#### Escenarios:

| Escenario | Cliente califica Tasker | Tasker califica Cliente |
|-----------|------------------------|------------------------|
| Cancelación antes de asignar | ❌ No | ❌ No |
| Cliente cancela después de asignar, antes de empezar | ❌ No | ❌ No |
| Tasker cancela después de aceptar, antes de empezar | ❌ No | ❌ No |
| Cancelación después de que empezó | ✅ Sí | ✅ Sí |
| Tarea finalizada normalmente | ✅ Sí | ✅ Sí |

---

## ⚖️ DISPUTAS Y RESOLUCIÓN DE CONFLICTOS

### Estado Actual ⏳ PENDIENTE DEFINIR

**Lo que SÍ está definido:**
- ✅ Existe el estado CANCELADA para tareas
- ✅ Existe mención de "disputa/problema" en cancelaciones después de que empezó
- ✅ Existe sistema de reportes/denuncias mencionado en funcionalidades pendientes
- ✅ Existe bloqueo de usuarios problemáticos mencionado

**Lo que FALTA definir:**

### 1. ¿Qué es una Disputa?

**Pendiente definir:**
- [ ] ¿Qué situaciones constituyen una disputa?
  - ¿Trabajo no realizado?
  - ¿Trabajo mal realizado?
  - ¿Pago no recibido?
  - ¿Comportamiento inapropiado?
  - ¿Incumplimiento de términos acordados?
  - ¿Problemas de comunicación?
  - ¿Daños a propiedad?

### 2. ¿Cómo se Inicia una Disputa?

**Pendiente definir:**
- [ ] ¿Quién puede iniciar una disputa?
  - ¿Solo el cliente?
  - ¿Solo el tasker?
  - ¿Ambos?
- [ ] ¿Cuándo se puede iniciar?
  - ¿Solo durante la tarea?
  - ¿Después de finalizada?
  - ¿Hay límite de tiempo?
- [ ] ¿Cómo se inicia?
  - ¿Botón en la app?
  - ¿Formulario de contacto?
  - ¿Chat con soporte?
- [ ] ¿Qué información se requiere?
  - ¿Descripción del problema?
  - ¿Evidencia (fotos, videos)?
  - ¿Testigos?
  - ¿Comunicación previa?

### 3. ¿Cómo se Resuelven las Disputas?

**Pendiente definir:**
- [ ] ¿Quién decide?
  - ¿Administradores de la plataforma?
  - ¿Sistema automatizado?
  - ¿Panel de revisión?
  - ¿Arbitraje externo?
- [ ] ¿Cuánto tiempo toma la resolución?
  - ¿24 horas?
  - ¿48 horas?
  - ¿1 semana?
- [ ] ¿Qué criterios se usan?
  - ¿Evidencia proporcionada?
  - ¿Historial de usuarios?
  - ¿Políticas de la plataforma?
  - ¿Términos y condiciones?

### 4. ¿Qué Pasa Durante una Disputa?

**Pendiente definir:**
- [ ] ¿Se retiene el pago?
  - ¿Sí, automáticamente?
  - ¿Solo si la disputa es válida?
- [ ] ¿Se bloquea al usuario?
  - ¿Temporalmente?
  - ¿Permanente?
  - ¿Solo para nuevas tareas?
- [ ] ¿Se puede continuar trabajando?
  - ¿La tarea se pausa?
  - ¿Se puede completar mientras se resuelve?
- [ ] ¿Se notifica a ambas partes?
  - ¿Cómo?
  - ¿Cuándo?

### 5. Resultados Posibles de una Disputa

**Pendiente definir:**
- [ ] ¿Qué decisiones puede tomar el administrador?
  - ¿A favor del cliente?
  - ¿A favor del tasker?
  - ¿División del pago?
  - ¿Reembolso total?
  - ¿Reembolso parcial?
  - ¿Sin acción?
- [ ] ¿Qué consecuencias hay?
  - ¿Penalizaciones en ranking?
  - ¿Suspensión de cuenta?
  - ¿Bloqueo permanente?
  - ¿Advertencia?
- [ ] ¿Se puede apelar?
  - ¿Cómo?
  - ¿Cuántas veces?

### 6. Sistema de Reportes/Denuncias

**Pendiente definir:**
- [ ] ¿Qué se puede reportar?
  - ¿Comportamiento inapropiado?
  - ¿Incumplimiento?
  - ¿Fraude?
  - ¿Acoso?
- [ ] ¿Cómo se reporta?
  - ¿Botón en perfil?
  - ¿Formulario?
  - ¿Chat con soporte?
- [ ] ¿Qué pasa después de reportar?
  - ¿Revisión automática?
  - ¿Revisión manual?
  - ¿Notificación al reportado?

---

## 💻 IMPLEMENTACIÓN TÉCNICA

### Estados de Tarea Actuales

```javascript
// Estados definidos en el modelo Tarea
'PENDIENTE'        // Tarea creada, esperando asignación
'ASIGNADA'         // Tasker asignado, aún no empezó
'EN_PROCESO'       // Tasker empezó el trabajo
'PENDIENTE_PAGO'   // Trabajo terminado, esperando confirmación de pago
'FINALIZADA'       // Pago confirmado, tarea completada
'CANCELADA'        // Tarea cancelada
```

### Funcionalidades Implementadas

✅ **Backend:**
- Estado CANCELADA existe en el modelo
- Filtros para tareas canceladas en admin
- Visualización de tareas canceladas en estadísticas

✅ **Frontend:**
- Visualización de estado CANCELADA
- Filtros para tareas canceladas
- Badges de estado con color rojo para canceladas

### Funcionalidades Faltantes

❌ **Backend:**
- Endpoint para cancelar tarea (cliente o tasker)
- Cálculo automático de reembolsos según tiempo
- Sistema de penalizaciones en ranking
- Sistema de disputas
- Endpoint para reportar problemas
- Historial de cancelaciones por usuario

❌ **Frontend:**
- Botón/formulario para cancelar tarea
- Confirmación de cancelación con cálculo de reembolso
- Formulario de disputa
- Formulario de reporte
- Visualización de penalizaciones
- Notificaciones de cancelación

---

## 📝 CASOS DE USO

### Caso 1: Cliente cancela con 24 horas de anticipación
**Situación:** Cliente crea tarea para mañana, cancela ahora (24h antes)  
**Resultado:** 
- Reembolso: 100%
- Multa: 0%
- Tarea: CANCELADA
- Tasker (si estaba asignado): No recibe compensación, no puede calificar

### Caso 2: Cliente cancela con 1 hora de anticipación
**Situación:** Cliente cancela 1 hora antes de la fecha programada  
**Resultado:**
- Reembolso: 70%
- Multa: 30%
- Tarea: CANCELADA
- Tasker (si estaba asignado): No recibe compensación

### Caso 3: Tasker cancela con 6 horas de anticipación
**Situación:** Tasker acepta tarea, luego cancela 6 horas antes  
**Resultado:**
- Cliente: Reembolso total automático O buscar otro tasker
- Tasker: Penalización de -20 puntos en ranking
- Tarea: Vuelve a PENDIENTE (si cliente elige buscar otro) o CANCELADA
- Cliente: No puede calificar al tasker

### Caso 4: Cliente cancela después de que tasker empezó
**Situación:** Tasker ya empezó el trabajo, cliente quiere cancelar  
**Resultado:**
- Reembolso: 0% (tasker cobra todo)
- Tarea: FINALIZADA o CANCELADA (según caso)
- **Si hay disputa:** Se revisa caso por caso (proceso pendiente de definir)

### Caso 5: Disputa por trabajo mal realizado
**Situación:** Cliente dice que el trabajo está mal hecho  
**Estado:** ⏳ PENDIENTE - Proceso de disputa no definido  
**Necesita:**
- Formulario para iniciar disputa
- Proceso de revisión
- Criterios de decisión
- Sistema de resolución

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### Cancelaciones

- [ ] Endpoint `POST /api/task/cancel/:id` (cliente)
- [ ] Endpoint `POST /api/task/cancel/:id` (tasker)
- [ ] Validación: Solo antes de empezar (cliente)
- [ ] Validación: Solo después de aceptar, antes de empezar (tasker)
- [ ] Cálculo automático de reembolso según tiempo
- [ ] Factor de anticipación de creación
- [ ] Integración con Mercado Pago para reembolsos
- [ ] Actualización de ranking (penalizaciones para tasker)
- [ ] Sistema de suspensión por cancelaciones recurrentes
- [ ] Notificaciones de cancelación
- [ ] Historial de cancelaciones

### Disputas

- [ ] Definir qué es una disputa
- [ ] Endpoint `POST /api/task/dispute/:id`
- [ ] Formulario de disputa (frontend)
- [ ] Sistema de evidencia (fotos, videos, documentos)
- [ ] Panel de admin para revisar disputas
- [ ] Proceso de resolución
- [ ] Notificaciones de disputa
- [ ] Retención de pago durante disputa
- [ ] Sistema de apelaciones

### Reportes

- [ ] Endpoint `POST /api/report`
- [ ] Formulario de reporte (frontend)
- [ ] Tipos de reporte (comportamiento, incumplimiento, fraude, etc.)
- [ ] Panel de admin para revisar reportes
- [ ] Sistema de seguimiento de reportes

---

## 📚 REFERENCIAS

- **Documento Principal:** `RESUMEN_PROYECTO_NEGOCIO.md`
- **Sección Cancelaciones:** Líneas 217-285
- **Sección Disputas:** Líneas 281-284, 690-718
- **Modelo de Tarea:** `backend/models/Tarea.json.js`
- **Estados de Tarea:** PENDIENTE, ASIGNADA, EN_PROCESO, PENDIENTE_PAGO, FINALIZADA, CANCELADA

---

**Última actualización:** Enero 2025  
**Próximos pasos:** Definir proceso completo de disputas y resolución de conflictos

