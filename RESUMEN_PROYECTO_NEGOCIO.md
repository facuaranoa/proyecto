# 📊 Resumen del Proyecto "Ayuda Al Toque" - Estado Actual y Definiciones de Negocio Pendientes

**Fecha:** Diciembre 2024  
**Propósito:** Documento para discutir con Gemini y definir aspectos de negocio faltantes

---

## 🎯 VISIÓN GENERAL DEL PROYECTO

**"Ayuda Al Toque"** es una plataforma de intermediación de servicios móviles (Gig Economy) que conecta:
- **Clientes** que necesitan servicios (express o especializados)
- **Taskers** (trabajadores) que ofrecen esos servicios
- La plataforma cobra una **comisión del 5%** por cada transacción (sobre el monto después de la comisión de Mercado Pago)

**Modelo de negocio similar a:** Uber, Rappi, pero para servicios generales (mudanzas, reparaciones, servicios especializados, etc.)

---

## ✅ DEFINICIONES DE NEGOCIO (Acordadas)

### 💰 **MODELO DE PAGOS - DEFINIDO**

#### **Método de Pago:**
- ✅ **Solo Mercado Pago** (por ahora, transferencias bancarias pendientes para futuro)

#### **Flujo de Pago Completo:**
1. ✅ Cliente crea tarea y **paga al momento de crear** (pago anticipado)
2. ✅ **Mercado Pago retiene el dinero** (más seguro para todos)
3. ✅ Tasker acepta y realiza el trabajo
4. ✅ Tasker marca "Terminé mi trabajo" → Tarea pasa a estado "PENDIENTE_PAGO"
5. ✅ Cliente recibe notificación para confirmar y pagar
6. ✅ Cliente confirma que está conforme:
   - Si confirma → Se libera el pago automáticamente
   - Si **no responde en 48 horas** → Auto-confirma y se libera el pago
7. ✅ Mercado Pago libera el dinero a la cuenta de la plataforma:
   - Mercado Pago cobra su comisión (5% - la paga el tasker)
   - Transfiere el resto a la cuenta de la plataforma
8. ✅ La plataforma:
   - Retiene el dinero por **3-5 días hábiles** (período de seguridad)
   - Cobra su comisión (5% sobre lo que queda después de MP)
   - Transfiere el resto al **CVU/CBU del tasker** (que el tasker pone en su perfil)

#### **Comisiones:**
- ✅ **Mercado Pago:** 5% del monto total (lo paga el tasker)
- ✅ **Plataforma:** 5% sobre el monto restante después de la comisión de MP (lo paga el tasker)
- ✅ **Tasker recibe:** ~90% del monto total

**Ejemplo de cálculo:**
```
Cliente paga: $10,000
Mercado Pago retiene: $10,000

Cuando se libera:
- Mercado Pago cobra: $500 (5%)
- Queda: $9,500
- Plataforma cobra: $475 (5% de $9,500)
- Tasker recibe: $9,025 (90.25% del total)
```

#### **Datos del Tasker:**
- ✅ Tasker debe proporcionar su **CVU o CBU** en su perfil para recibir pagos
- ✅ La plataforma transfiere directamente a esa cuenta bancaria

#### **Período Inicial:**
- ✅ Al principio **todo será gratis** (sin comisiones) para atraer usuarios
- ✅ La infraestructura de pagos debe estar lista desde el inicio
- ✅ Se activará el cobro de comisiones cuando se decida

---

---

## ✅ LO QUE TENEMOS IMPLEMENTADO (Funcionalidades Técnicas)

### 1. **Sistema de Autenticación y Usuarios**
- ✅ Registro de clientes (`POST /api/auth/register/cliente`)
- ✅ Registro de taskers (`POST /api/auth/register/tasker`)
  - Subida de documentos (DNI, matrícula profesional, licencia de conducir)
  - Validación de CUIT y monotributista
  - Aceptación de términos y condiciones
- ✅ Login unificado (`POST /api/auth/login`)
  - Genera JWT tokens con expiración de 7 días
  - Identifica tipo de usuario (cliente/tasker)

### 2. **Gestión de Taskers**
- ✅ Actualización de perfil de tasker (`PUT /api/tasker/profile/:id`)
  - Cambio de disponibilidad
- ✅ Sistema de aprobación por administrador (`PUT /api/admin/tasker/verify/:id`)
  - Los taskers deben ser aprobados antes de poder trabajar

### 3. **Gestión de Tareas**
- ✅ Creación de tareas por clientes (`POST /api/task/create`)
  - Tipos: EXPRESS o ESPECIALISTA
  - Ubicación (coordenadas, dirección, ciudad)
  - Fecha/hora requerida
  - Monto total acordado
  - Cálculo automático de comisión (20%) y monto neto para tasker (80%)
  - Estado inicial: PENDIENTE
- ✅ Ver mis tareas como cliente (`GET /api/task/my-tasks`)
- ✅ Ver tareas disponibles como tasker (`GET /api/task/available`)
  - Filtros: tipo, precio, ciudad, requiere_licencia, fecha

### 4. **Infraestructura Técnica**
- ✅ Backend Node.js + Express
- ✅ Sistema de almacenamiento JSON (fácil de migrar a PostgreSQL)
- ✅ Autenticación JWT
- ✅ Middleware de seguridad
- ✅ Encriptación de contraseñas (bcrypt)
- ✅ Frontend web básico para pruebas
- ✅ Documentación completa

---

## ❌ LO QUE FALTA IMPLEMENTAR (Funcionalidades Técnicas)

### 1. **Asignación de Tareas**
- ❌ Endpoint para que un tasker acepte/tome una tarea
- ❌ Lógica de asignación (¿primero en llegar? ¿mejor calificado? ¿más cercano?)
- ❌ Notificación al cliente cuando se asigna un tasker
- ❌ Cambio de estado de PENDIENTE → ASIGNADA

### 2. **Gestión del Ciclo de Vida de Tareas**
- ❌ Finalización de tareas (estado FINALIZADA)
  - ¿Quién marca como finalizada? ¿Cliente? ¿Tasker? ¿Ambos?
- ❌ Cancelación de tareas (estado CANCELADA)
  - ¿Quién puede cancelar?
  - ¿Qué pasa con el pago si se cancela?
  - ¿Política de cancelación? (multas, reembolsos, etc.)
- ❌ Historial de cambios de estado

### 3. **Sistema de Pagos**
- ❌ Integración con pasarela de pagos (Mercado Pago, Stripe, etc.)
- ❌ Proceso de pago del cliente
- ❌ Retención de comisión de la plataforma
- ❌ Pago al tasker (¿inmediato? ¿después de X días? ¿después de calificación?)
- ❌ Manejo de reembolsos
- ❌ Manejo de disputas
- ❌ Historial de transacciones

### 4. **Sistema de Calificaciones y Reseñas**
- ❌ Modelo de datos para calificaciones
- ❌ Cliente califica al tasker (después de finalizar)
- ❌ Tasker califica al cliente
- ❌ Promedio de calificaciones
- ❌ Mostrar calificaciones en perfiles
- ❌ Sistema de reputación

### 5. **Notificaciones**
- ❌ Notificaciones push (para app móvil)
- ❌ Notificaciones por email
- ❌ Notificaciones in-app
- ❌ Notificaciones cuando:
  - Se asigna un tasker a tu tarea
  - Un tasker acepta tu tarea
  - Una tarea es finalizada
  - Se recibe un pago
  - Se recibe una calificación

### 6. **Búsqueda y Matching**
- ❌ Algoritmo de matching (¿cómo se asigna la mejor tarea al mejor tasker?)
- ❌ Búsqueda de taskers por ubicación (radio de distancia)
- ❌ Búsqueda de taskers por especialidad
- ❌ Ranking de taskers (por calificación, cercanía, disponibilidad)

### 7. **Chat/Mensajería**
- ❌ Sistema de chat entre cliente y tasker **vinculado a cada tarea**
- ❌ Cada tarea tiene su propio hilo de conversación
- ❌ Solo el cliente y el tasker asignado pueden chatear sobre esa tarea
- ❌ Notificaciones de mensajes nuevos
- ❌ Historial de conversaciones por tarea

### 8. **App Móvil**
- ❌ Frontend React Native (mencionado en README como Fase 2)
- ❌ Diseño de UI/UX
- ❌ Integración con backend

### 9. **Panel de Administración**
- ❌ Dashboard para administradores
- ❌ Gestión de usuarios
- ❌ Gestión de tareas
- ❌ Reportes y estadísticas
- ❌ Gestión de disputas
- ❌ Configuración de comisiones

### 10. **Seguridad y Validaciones Adicionales**
- ❌ Validación de documentos subidos
- ❌ Verificación de identidad
- ❌ Sistema de reportes/denuncias
- ❌ Bloqueo de usuarios problemáticos

---

## 🤔 ASPECTOS DE NEGOCIO QUE NECESITAN DEFINIRSE

### 💰 **MODELO DE PAGOS Y FINANZAS**

#### 1. **Proceso de Pago** ✅ **DEFINIDO**
- [x] ¿Cuándo se cobra al cliente?
  - ✅ **Al crear la tarea (pago anticipado)** - Como Rappi/Uber
- [x] ¿Cuándo se paga al tasker?
  - ✅ **Después de 3-5 días hábiles** después de que se libera el pago
- [x] ¿Cómo se maneja el dinero?
  - ✅ **Mercado Pago retiene el dinero** hasta que se completa la tarea
  - ✅ La plataforma retiene 3-5 días hábiles después de la liberación (período de seguridad)

#### 2. **Comisiones** ✅ **DEFINIDO**
- [x] ¿La comisión es fija o variable?
  - ✅ **Comisión fija del 5%** (sobre el monto después de la comisión de MP)
  - ✅ Por ahora igual para EXPRESS y ESPECIALISTA
- [x] ¿Hay comisiones adicionales?
  - ⏳ Pendiente definir: Comisión por cancelación
  - ✅ Comisión de Mercado Pago (5%) - la paga el tasker
- [x] ¿Cómo se calcula la comisión?
  - ✅ Sobre el monto restante después de la comisión de Mercado Pago
  - ⏳ Pendiente: Descuentos o promociones

#### 3. **Reembolsos y Cancelaciones** ✅ **DEFINIDO**

**Regla General:**
- ✅ Cliente solo puede cancelar **antes de que el tasker empiece el trabajo**
- ✅ Tasker solo puede cancelar **después de aceptar pero antes de empezar**

**1. Cancelación por CLIENTE (solo antes de que el tasker empiece)**

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
- ✅ Ejemplo: Si creó hace 1 semana y cancela con 2 horas → multa más alta
- ✅ Ejemplo: Si creó hace 1 hora y cancela con 2 horas → multa más baja

**Escenarios Específicos:**

**Cliente cancela ANTES de asignar:**
- ✅ Reembolso: **100%**
- ✅ Penalización: **Ninguna**

**Cliente cancela DESPUÉS de asignar pero ANTES de empezar:**
- ✅ Reembolso: **Según tabla dinámica** (70-100% según tiempo restante y factor de anticipación)
- ✅ Tasker: **NO puede calificar/comentar al cliente** (porque no empezó la tarea)
- ✅ Tasker: **NO recibe compensación**

**Cliente cancela DESPUÉS de que el tasker empezó:**
- ✅ Reembolso: **0%** (tasker cobra todo)
- ✅ Excepción: Si hay disputa/problema → se revisa caso por caso

**2. Cancelación por TASKER (solo después de aceptar, antes de empezar)**

**Sistema de Penalizaciones en Ranking:**

| Tiempo antes de la fecha | Penalización en ranking | Notas |
|-------------------------|-------------------------|-------|
| **+24 horas antes** | -5 puntos | Penalización leve |
| **12-24 horas antes** | -10 puntos | Penalización media |
| **6-12 horas antes** | -20 puntos | Penalización alta |
| **<6 horas antes** | -30 puntos | Penalización muy alta |
| **Cancelaciones recurrentes** | Suspensión temporal | Si cancela **3+ veces en 30 días** |

**Opciones para el Cliente:**
- ✅ **Reembolso total automático** (opción por defecto)
- ✅ **Buscar otro tasker** (la tarea queda disponible nuevamente)
- ❌ Cliente **NO puede calificar al tasker** (porque no empezó la tarea)

**3. Calificaciones Mutuas**

- ❌ **Ninguno puede calificar/comentar al otro si NO han empezado la tarea**
- ✅ Cliente puede calificar al tasker **solo si la tarea empezó** (incluso si luego se canceló)
- ✅ Tasker puede calificar al cliente **solo si la tarea empezó** (incluso si luego se canceló)
- ✅ Ambas calificaciones afectan el ranking

**4. Disputas y Problemas**

- ⏳ Pendiente definir: Proceso de disputa detallado
- ⏳ Pendiente definir: ¿Quién decide en caso de disputa?

#### 4. **Métodos de Pago** ✅ **DEFINIDO (Parcialmente)**
- [x] ¿Qué métodos aceptamos?
  - ✅ **Mercado Pago** (único método por ahora)
  - ⏳ Pendiente: Transferencia bancaria (para futuro)
  - ❌ Efectivo (no por ahora)
  - ❌ Criptomonedas (no por ahora)
- [ ] ¿Hay límites de monto?
  - ⏳ Pendiente definir: ¿Monto mínimo por tarea?
  - ⏳ Pendiente definir: ¿Monto máximo por tarea?

---

### 🎯 **ASIGNACIÓN DE TAREAS Y MATCHING** ✅ **DEFINIDO**

#### 1. **Modelo de Asignación** ✅ **DEFINIDO**
- [x] ¿Modelo de asignación?
  - ✅ **Modelo Híbrido: Cliente elige + Taskers aplican**
  - ✅ Cliente puede ver lista completa de taskers ordenada por ranking
  - ✅ Taskers pueden aplicar a tareas (ilimitado)
  - ✅ Cliente puede elegir entre aplicantes O elegir cualquier otro de la lista
- [x] ¿El cliente puede elegir al tasker?
  - ✅ **Sí, siempre el cliente elige** (no es automático)
  - ✅ Puede ver perfiles completos antes de asignar
- [x] ¿Cuántos taskers pueden ver una tarea disponible?
  - ✅ Todos los taskers aprobados pueden ver y aplicar
  - ✅ Lista ordenada por sistema de ranking/puntaje

#### 2. **Sistema de Ranking/Puntaje** ✅ **DEFINIDO**

**Factores y Pesos:**
1. **Calificación/Rating (35%)** - Prioridad alta para incentivar buen servicio
   - 5 estrellas = 100 puntos
   - 4 estrellas = 80 puntos
   - 3 estrellas = 60 puntos
   - 2 estrellas = 40 puntos
   - 1 estrella = 20 puntos
   - Sin calificaciones = 50 puntos (neutral)

2. **Historial de trabajos similares (20%)** - Prioridad alta para incentivar uso
   - +10 trabajos similares = 100 puntos
   - 5-10 trabajos = 80 puntos
   - 1-5 trabajos = 60 puntos
   - 0 trabajos similares = 30 puntos

3. **Distancia (20%)**
   - 0-5 km = 100 puntos
   - 5-10 km = 80 puntos
   - 10-15 km = 60 puntos
   - 15-20 km = 40 puntos
   - +20 km = 20 puntos

4. **Disponibilidad (15%)**
   - Disponible ahora = 100 puntos
   - Disponible en las próximas horas = 80 puntos
   - Disponible mañana = 60 puntos
   - Disponible esta semana = 40 puntos
   - No disponible = 0 puntos

5. **Tiempo de respuesta (10%)**
   - Responde en <5 min = 100 puntos
   - Responde en <30 min = 80 puntos
   - Responde en <2 horas = 60 puntos
   - Responde en <24 horas = 40 puntos
   - Responde en +24 horas = 20 puntos

6. **Bonus: Taskers Favoritos (+20 puntos extra)**
   - Si el tasker está en la lista de favoritos del cliente, recibe +20 puntos

**Cálculo del Puntaje Total:**
```
Puntaje = (Calificación × 0.35) + (Historial × 0.20) + (Distancia × 0.20) + 
          (Disponibilidad × 0.15) + (Tiempo respuesta × 0.10) + Bonus Favoritos
```

**Visualización:**
- ✅ Top 10 taskers aparecen destacados arriba
- ✅ Lista completa ordenada por ranking (recomendados primero, luego el resto)
- ✅ Taskers favoritos aparecen destacados en la lista

#### 3. **Flujo de Asignación** ✅ **DEFINIDO**

**Escenario 1: Cliente crea tarea**
1. Cliente crea tarea y paga → Estado: "PENDIENTE"
2. Sistema calcula ranking de taskers disponibles
3. Cliente ve dos opciones:
   - Ver lista completa ordenada por ranking (Top 10 destacados arriba)
   - Esperar a que taskers apliquen

**Escenario 2: Tasker aplica**
1. Tasker ve la tarea disponible
2. Tasker presiona "Aplicar" o "Interesado"
3. Cliente recibe notificación: "X taskers aplicaron a tu tarea"
4. Cliente puede:
   - Ver lista de aplicantes (ordenados por ranking)
   - Ver lista completa de taskers (ordenados por ranking)
   - Elegir cualquier tasker (aplicante o no)

**Escenario 3: Cliente envía solicitud a tasker(s)**
1. Cliente selecciona tasker(s) y envía solicitud
2. **Límite: Máximo 2 solicitudes simultáneas** (para evitar conflictos)
3. **Al enviar la solicitud**, el sistema pregunta al cliente: **"¿Cuánto tiempo estás dispuesto a esperar la respuesta?"**
   - Opciones: 30 min, 1 hora, 2 horas, 6 horas, 12 horas, 24 horas
   - El tiempo se ajusta según cuánto falte para realizar la tarea (máximo 1 hora si es muy urgente)
4. Tasker(s) reciben notificación: "Fuiste seleccionado para la tarea X - Tienes [X tiempo] para responder"
5. Tasker puede:
   - **Aceptar** → Tarea pasa a "ASIGNADA" (si es el primero en aceptar)
   - **Rechazar** → Se libera esa solicitud, cliente puede enviar a otro inmediatamente
6. **Si ambos taskers aceptan:**
   - Cliente recibe notificación: "2 taskers aceptaron tu solicitud - Elige uno"
   - Cliente tiene **máximo 1 hora** (ajustado según cuánto falte para la tarea) para elegir uno
   - El tasker no elegido se libera automáticamente
   - **Si el cliente no elige en el tiempo → Se asigna automáticamente al primero que aceptó** (evita problemas y cancelaciones)

**Tiempos de respuesta del tasker:**
- ✅ **Cliente elige el tiempo cuando envía la solicitud** (no al crear la tarea)
- ✅ El tiempo máximo es 1 hora si la tarea es muy urgente (depende de cuánto falte para realizarla)
- ✅ Si el tasker no responde en el tiempo elegido → **Auto-rechaza**
- ✅ Cliente puede enviar solicitud a otro tasker **inmediatamente** si el primero rechaza o no responde
- ✅ Si ya tiene 2 solicitudes activas, debe esperar a que una se resuelva antes de enviar otra

**Penalizaciones:**
- ✅ Si el tasker **rechaza después de ser elegido**: 
  - Afecta su ranking (penalización en el sistema de puntaje)
  - Se le devuelve el dinero al cliente automáticamente

#### 4. **Funcionalidades Adicionales** ✅ **DEFINIDO**

**Búsqueda de Taskers:**
- ✅ Cliente puede buscar taskers por **nombre parcial** (ej: "Juan" encuentra "Juan Pérez")
- ✅ Búsqueda tipo "LIKE" (coincidencias parciales)

**Sistema de Favoritos:**
- ✅ Botón "⭐ Favorito" o "Guardar" en el perfil del tasker
- ✅ Lista separada: "Mis Taskers Favoritos"
- ✅ Taskers favoritos aparecen **destacados** en la lista completa
- ✅ Taskers favoritos reciben **+20 puntos bonus** en el ranking

---

### ⭐ **SISTEMA DE CALIFICACIONES** ✅ **DEFINIDO**

#### 1. **Quién Califica a Quién** ✅ **DEFINIDO**
- [x] ¿Cliente califica tasker?
  - ✅ **Sí, siempre** (si la tarea empezó)
- [x] ¿Tasker califica cliente?
  - ✅ **Sí, siempre** (si la tarea empezó)
- [x] ¿Calificación mutua obligatoria?
  - ✅ **Sí, obligatoria para finalizar la tarea**
  - ✅ No se puede marcar como "finalizada" sin calificar
- [x] ¿Qué pasa si alguien no califica?
  - ✅ **No puede finalizar la tarea sin calificar**
  - ✅ Puede calificar después de finalizar (hasta 7 días)
  - ✅ Si no califica en 7 días, no afecta el ranking (pero la tarea queda pendiente de calificación)

**Regla Importante:**
- ❌ **Ninguno puede calificar si NO han empezado la tarea**
- ✅ Solo se puede calificar si la tarea empezó (incluso si luego se canceló)

#### 2. **Qué se Califica** ✅ **DEFINIDO**

**Cliente califica al Tasker:**
- ✅ **Calificación general: 1-5 estrellas** (obligatoria)
- ✅ **Comentario/Reseña escrita** (opcional)

**Tasker califica al Cliente:**
- ✅ **Calificación general: 1-5 estrellas** (obligatoria)
- ✅ **Comentario/Reseña escrita** (opcional)

**Sistema Simple:**
- ✅ Una sola calificación general (no múltiples aspectos)
- ✅ Comentario opcional para dar más contexto

#### 3. **Cuándo se Califica** ✅ **DEFINIDO**
- [x] ¿Cuándo se puede calificar?
  - ✅ **Inmediatamente después de finalizar la tarea**
  - ✅ **Obligatoria para finalizar** (no se puede completar sin calificar)
- [x] ¿Hay plazo límite?
  - ✅ **7 días después de finalizar** para calificar
  - ✅ Después de 7 días, ya no se puede calificar
- [x] ¿Se puede editar una calificación?
  - ✅ **Sí, dentro de 7 días** después de calificar
  - ✅ Después de 7 días, no se puede editar
- [x] ¿Se puede responder a una calificación?
  - ⏳ Pendiente definir (por ahora no)

#### 4. **Cálculo del Ranking** ✅ **DEFINIDO**

**Uso en el Sistema de Ranking:**
- ✅ La calificación es **35% del puntaje total** del ranking
- ✅ Se usa la **calificación general (1-5 estrellas)**
- ✅ Se calcula el **promedio simple** de todas las calificaciones recibidas
- ✅ Ejemplo: Si tiene 10 calificaciones (5, 5, 4, 5, 4, 5, 5, 4, 5, 5) → Promedio = 4.7 estrellas

**Conversión a Puntos (para el ranking):**
- 5 estrellas = 100 puntos
- 4 estrellas = 80 puntos
- 3 estrellas = 60 puntos
- 2 estrellas = 40 puntos
- 1 estrella = 20 puntos
- Sin calificaciones = 50 puntos (neutral)

#### 5. **Visualización en Perfiles** ✅ **DEFINIDO**

**Qué se muestra:**
- ✅ **Calificación promedio** (ej: 4.5 ⭐)
- ✅ **Cantidad de calificaciones** (ej: "Calificado 23 veces")
- ✅ **Reseñas escritas** (últimas 5-10, si hay)
- ✅ **Todas las calificaciones se muestran** (positivas y negativas)

**Ejemplo de Perfil:**
```
⭐ 4.7 (23 calificaciones)
"Excelente trabajo, muy puntual" - Cliente A
"Muy profesional, lo recomiendo" - Cliente B
...
```

#### 6. **Impacto de las Calificaciones** ⏳ **PENDIENTE DEFINIR**

- [ ] ¿Qué pasa con taskers con baja calificación?
  - ⏳ Pendiente: ¿Se suspenden automáticamente?
  - ⏳ Pendiente: ¿Se les ocultan tareas?
  - ⏳ Pendiente: ¿Cuál es el mínimo de estrellas para seguir trabajando?
- [ ] ¿Qué pasa con clientes con baja calificación?
  - ⏳ Pendiente: ¿Se les limita el acceso?

---

### 📱 **ESTRUCTURA DE PERFILES** ✅ **DEFINIDO**

#### **1. PERFIL DE CLIENTE**

**Secciones del Perfil:**

**1. Información Personal**
- ✅ Nombre y apellido
- ✅ Email
- ✅ Teléfono
- ✅ Ubicación por defecto
- ⏳ Foto de perfil (opcional - pendiente definir)

**2. Mis Tareas**
- ✅ Tareas activas (pendientes, asignadas, en progreso)
- ✅ Historial de tareas (completadas, canceladas)
- ✅ Filtros: por estado, fecha, tipo de servicio

**3. Mis Taskers Favoritos**
- ✅ Lista de taskers guardados
- ✅ Acceso rápido para buscar tareas con ellos
- ✅ Botón "⭐ Favorito" para guardar taskers

**4. Calificaciones y Reseñas**
- ✅ Calificación promedio recibida
- ✅ Reseñas que recibió de taskers
- ✅ Reseñas que dio a taskers
- ✅ Historial completo de calificaciones

**5. Pagos y Facturación**
- ✅ Historial de pagos
- ✅ Métodos de pago guardados (Mercado Pago)
- ✅ Reembolsos recibidos
- ✅ Estado de pagos pendientes

**6. Chat/Mensajería**
- ✅ **Chat vinculado a cada tarea específica**
- ✅ Solo el cliente y el tasker asignado a esa tarea pueden chatear
- ✅ Cada tarea tiene su propio hilo de conversación
- ✅ Acceso desde cada tarea (botón "Chat" en la tarea)
- ✅ Lista de conversaciones activas (una por cada tarea)
- ✅ Notificaciones de mensajes nuevos
- ✅ Historial de conversaciones por tarea

**7. Soporte/Ayuda**
- ✅ Reportar problemas
- ✅ Contactar soporte
- ✅ Preguntas frecuentes
- ✅ Formulario de recomendaciones/sugerencias

**8. Configuración**
- ✅ Notificaciones (preferencias)
- ✅ Privacidad
- ✅ Términos y condiciones
- ✅ Cerrar sesión

#### **2. PERFIL DE TASKER**

**Secciones del Perfil:**

**1. Información Personal**
- ✅ Nombre y apellido
- ✅ Email
- ✅ Teléfono
- ✅ CUIT
- ✅ Monotributista (Sí/No)
- ⏳ Foto de perfil (opcional - pendiente definir)
- ✅ **CVU/CBU** (para recibir pagos) - OBLIGATORIO

**2. Credenciales y Documentos**
- ✅ DNI (subido)
- ✅ Matrícula profesional (si aplica)
- ✅ Licencia de conducir (si aplica)
- ✅ Estado de verificación (aprobado/pendiente/rechazado)
- ✅ Fecha de aprobación

**3. Especialidades/Categorías**
- ✅ Servicios en los que se especializa
- ✅ Ejemplos: Plomería, Electricidad, Mudanzas, Limpieza, Delivery, etc.
- ✅ Puede tener múltiples especialidades
- ✅ Se muestran en el perfil y en búsquedas

**4. Mis Tareas**
- ✅ Tareas disponibles (para aplicar)
- ✅ Tareas asignadas (en progreso)
- ✅ Historial de tareas (completadas, canceladas)
- ✅ Filtros: por estado, fecha, tipo, especialidad

**5. Calificaciones y Reseñas**
- ✅ Calificación promedio
- ✅ Cantidad de calificaciones recibidas
- ✅ Reseñas recibidas de clientes
- ✅ Reseñas dadas a clientes
- ✅ Historial completo de calificaciones

**6. Ingresos y Pagos**
- ✅ Ingresos totales (acumulado)
- ✅ Ingresos pendientes (por liberar)
- ✅ Historial de pagos recibidos
- ✅ Próximos pagos (cuándo recibirá dinero)
- ✅ Detalle de comisiones pagadas

**7. Estadísticas**
- ✅ Tareas completadas (total)
- ✅ Tasa de aceptación (% de tareas aceptadas vs aplicadas)
- ✅ Tiempo promedio de respuesta
- ✅ Calificación promedio
- ✅ Ranking actual (puntaje)

**8. Disponibilidad**
- ✅ Estado: Disponible/No disponible
- ✅ Toggle para cambiar disponibilidad
- ⏳ Horarios de disponibilidad (opcional - pendiente definir)

**9. Chat/Mensajería**
- ✅ **Chat vinculado a cada tarea específica**
- ✅ Solo el cliente y el tasker asignado a esa tarea pueden chatear
- ✅ Cada tarea tiene su propio hilo de conversación
- ✅ Acceso desde cada tarea (botón "Chat" en la tarea)
- ✅ Lista de conversaciones activas (una por cada tarea)
- ✅ Notificaciones de mensajes nuevos
- ✅ Historial de conversaciones por tarea

**10. Soporte/Ayuda**
- ✅ Reportar problemas
- ✅ Contactar soporte
- ✅ Preguntas frecuentes
- ✅ Formulario de recomendaciones/sugerencias

**11. Configuración**
- ✅ Notificaciones (preferencias)
- ✅ Privacidad
- ✅ Términos y condiciones
- ✅ Cerrar sesión

#### **3. Formulario de Recomendaciones**

**Disponible para:**
- ✅ Clientes
- ✅ Taskers

**Campos del Formulario:**
- ✅ Tipo de recomendación (mejora, bug, nueva funcionalidad, etc.)
- ✅ Categoría (pagos, tareas, perfil, chat, etc.)
- ✅ Descripción detallada
- ✅ Prioridad (opcional)
- ✅ Capturas de pantalla (opcional)

**Ubicación:**
- ✅ Sección "Soporte/Ayuda" en ambos perfiles
- ✅ Acceso directo desde el menú principal

---

### 📱 **NOTIFICACIONES Y COMUNICACIÓN**

#### 1. **Tipos de Notificaciones**
- [ ] ¿Qué eventos generan notificaciones?
  - Tarea creada (para taskers)
  - Tarea asignada (para cliente)
  - Tarea aceptada (para cliente)
  - Tarea finalizada (para ambos)
  - Pago recibido (para tasker)
  - Calificación recibida (para ambos)
  - Mensaje nuevo (para ambos)
  - Recordatorio de tarea próxima

#### 2. **Canales de Notificación**
- [ ] ¿Push notifications? (app móvil)
- [ ] ¿Email?
- [ ] ¿SMS?
- [ ] ¿In-app notifications?
- [ ] ¿Preferencias del usuario? (¿puede elegir qué notificaciones recibir?)

---

### 🚫 **CANCELACIONES Y DISPUTAS**

#### 1. **Política de Cancelaciones**
- [ ] ¿Quién puede cancelar?
  - Cliente (¿siempre? ¿con restricciones?)
  - Tasker (¿siempre? ¿con penalización?)
- [ ] ¿Cuándo se puede cancelar sin penalización?
  - ¿X horas antes de la fecha programada?
- [ ] ¿Qué pasa si se cancela muy cerca de la fecha?
  - ¿Multa al que cancela?
  - ¿Reembolso parcial?

#### 2. **Disputas**
- [ ] ¿Qué es una disputa?
  - Trabajo no realizado
  - Trabajo mal realizado
  - Pago no recibido
  - Comportamiento inapropiado
- [ ] ¿Cómo se resuelven?
  - ¿Soporte manual?
  - ¿Sistema automatizado?
  - ¿Panel de revisión?
- [ ] ¿Quién decide?
  - ¿Administradores?
  - ¿Sistema de votación?
- [ ] ¿Qué pasa durante una disputa?
  - ¿Se retiene el pago?
  - ¿Se bloquea al usuario?

---

### 👥 **GESTIÓN DE USUARIOS**

#### 1. **Verificación de Taskers**
- [ ] ¿Qué documentos son obligatorios?
  - DNI ✅ (ya implementado)
  - Matrícula profesional (¿solo para ESPECIALISTA?)
  - Licencia de conducir (¿solo si requiere?)
- [ ] ¿Cómo se verifica?
  - ¿Automático?
  - ¿Manual por admin?
- [ ] ¿Cuánto tarda la aprobación?
- [ ] ¿Qué pasa si se rechaza?
  - ¿Puede volver a aplicar?
  - ¿Razón del rechazo?

#### 2. **Suspensión y Bloqueo**
- [ ] ¿Cuándo se suspende un tasker?
  - Calificación muy baja
  - Muchas cancelaciones
  - Reportes de usuarios
  - Comportamiento inapropiado
- [ ] ¿Cuándo se bloquea un cliente?
  - Calificaciones muy bajas
  - No pago
  - Comportamiento inapropiado
- [ ] ¿Proceso de apelación?

---

### 📊 **REPORTES Y MÉTRICAS**

#### 1. **Métricas para la Plataforma**
- [ ] ¿Qué métricas queremos trackear?
  - Tareas creadas/completadas/canceladas
  - Ingresos por comisiones
  - Usuarios activos
  - Tiempo promedio de asignación
  - Tasa de cancelación
  - Calificación promedio
  - Tareas por tasker
  - Tareas por cliente

#### 2. **Reportes para Usuarios**
- [ ] ¿Qué reportes pueden ver los taskers?
  - Ingresos
  - Tareas completadas
  - Calificaciones recibidas
  - Historial de pagos
- [ ] ¿Qué reportes pueden ver los clientes?
  - Tareas creadas
  - Dinero gastado
  - Calificaciones dadas/recibidas

---

### 🎨 **EXPERIENCIA DE USUARIO (UX)**

#### 1. **Flujo del Cliente**
- [ ] ¿Cómo crea una tarea?
  - ¿Paso a paso?
  - ¿Formulario simple?
- [ ] ¿Puede editar una tarea después de crearla?
  - ¿Hasta cuándo?
- [ ] ¿Puede ver el perfil del tasker antes de que acepte?
- [ ] ¿Cómo sigue el progreso de su tarea?

#### 2. **Flujo del Tasker**
- [ ] ¿Cómo ve las tareas disponibles?
  - ¿Lista?
  - ¿Mapa?
  - ¿Filtros?
- [ ] ¿Cuánta información ve antes de aceptar?
  - ¿Solo descripción básica?
  - ¿Puede ver perfil del cliente?
- [ ] ¿Cómo marca una tarea como completada?
  - ¿Sube fotos?
  - ¿Requiere confirmación del cliente?

---

### 🔒 **SEGURIDAD Y LEGAL**

#### 1. **Términos y Condiciones**
- [ ] ¿Qué términos necesita la plataforma?
  - Términos de uso
  - Política de privacidad
  - Política de cancelación
  - Política de reembolsos
  - Política de disputas
- [ ] ¿Dónde se almacenan?
- [ ] ¿Cómo se aceptan? (ya implementado para taskers)

#### 2. **Responsabilidades**
- [ ] ¿La plataforma es responsable si algo sale mal?
- [ ] ¿Los taskers son independientes o empleados?
- [ ] ¿Necesitamos seguro?
- [ ] ¿Qué pasa si hay un accidente durante el trabajo?

#### 3. **Datos Personales**
- [ ] ¿Cumplimos con LGPD/GDPR?
- [ ] ¿Cómo manejamos datos sensibles?
- [ ] ¿Política de retención de datos?

---

### 💼 **MODELO DE NEGOCIO ADICIONAL**

#### 1. **Monetización**
- [ ] ¿Solo comisiones o hay otros ingresos?
  - Suscripciones premium
  - Publicidad
  - Featured listings (taskers destacados)
- [ ] ¿Hay planes diferentes?
  - Plan básico vs premium para taskers
  - Plan básico vs premium para clientes

#### 2. **Expansión**
- [ ] ¿En qué ciudades empezamos?
- [ ] ¿Cómo escalamos?
- [ ] ¿Hay categorías de servicios?
  - ¿Mudanzas?
  - ¿Reparaciones?
  - ¿Limpieza?
  - ¿Delivery?
  - ¿Otros?

---

## 📋 CHECKLIST DE DEFINICIONES NECESARIAS

### Prioridad ALTA (Crítico para MVP)
- [x] ✅ **Proceso de pago (cuándo se cobra y cuándo se paga)** - DEFINIDO
- [x] ✅ **Modelo de asignación de tareas (cómo se asignan)** - DEFINIDO
- [x] ✅ **Política de cancelaciones** - DEFINIDO
- [x] ✅ **Sistema de calificaciones (qué, quién, cuándo)** - DEFINIDO
- [x] ✅ **Flujo de finalización de tareas** - DEFINIDO (Tasker marca "Terminé" → Cliente confirma o auto-confirma en 48h)

### Prioridad MEDIA (Importante pero no bloqueante)
- [ ] Sistema de notificaciones
- [ ] Chat/mensajería
- [ ] Proceso de disputas
- [ ] Métricas y reportes
- [ ] Términos y condiciones completos

### Prioridad BAJA (Nice to have)
- [ ] Suscripciones premium
- [ ] Múltiples métodos de pago
- [ ] Sistema de referidos
- [ ] Programa de lealtad

---

## 🎯 PREGUNTAS CLAVE PARA DISCUTIR CON GEMINI

1. ~~**¿Cuál es el modelo de asignación de tareas que queremos?**~~ ✅ **DEFINIDO:** Modelo híbrido - Cliente elige + Taskers aplican, con sistema de ranking por puntaje (calificación 35%, historial 20%, distancia 20%, disponibilidad 15%, tiempo respuesta 10%)

2. ~~**¿Cuándo se cobra y cuándo se paga?**~~ ✅ **DEFINIDO:** Pago anticipado al crear tarea, pago al tasker después de 3-5 días hábiles

3. ~~**¿Qué pasa con las cancelaciones?**~~ ✅ **DEFINIDO:** Sistema dinámico de reembolsos según tiempo restante y factor de anticipación. Penalizaciones en ranking para taskers. 3 cancelaciones en 30 días = suspensión.

4. ~~**¿Cómo funciona el sistema de calificaciones?**~~ ✅ **DEFINIDO:** Sistema simple - 1-5 estrellas + comentario opcional, obligatorio para finalizar, plazo de 7 días, promedio simple para ranking (35% del puntaje total)

5. **¿Qué tipo de servicios ofrecemos?** (Categorías, especialidades)

6. **¿Cuál es el diferencial competitivo?** (¿Por qué elegirnos sobre otros?)

7. **¿Cuál es el mercado objetivo?** (¿B2C? ¿B2B? ¿Ambos?)

8. **¿Cómo validamos la calidad del trabajo?** (¿Solo calificaciones? ¿Inspecciones?)

---

## 📝 NOTAS ADICIONALES

- El proyecto actualmente usa **archivos JSON** para almacenamiento (fácil de migrar a PostgreSQL)
- Hay un **frontend web básico** para pruebas, pero la app móvil está pendiente
- ⚠️ La **comisión del 20%** está hardcodeada en el código - **NECESITA ACTUALIZARSE A 5%**
- El sistema de **aprobación de taskers** está implementado pero necesita definir el proceso de verificación de documentos
- ✅ **Modelo de pagos definido** - Ver sección "DEFINICIONES DE NEGOCIO" arriba
- ⚠️ **Integración con Mercado Pago pendiente** - Necesita implementarse
- ⚠️ **Sistema de CVU/CBU en perfil de tasker** - Necesita implementarse

---

## 🚀 PRÓXIMOS PASOS SUGERIDOS

1. **Definir con Gemini** todos los aspectos de negocio marcados arriba
2. **Priorizar funcionalidades** para el MVP
3. **Crear user stories** detalladas para cada funcionalidad
4. **Diseñar los flujos** de usuario (cliente y tasker)
5. **Implementar las funcionalidades** faltantes según prioridad
6. **Desarrollar la app móvil** (React Native)

---

**Documento creado para facilitar la discusión con Gemini y definir todos los aspectos de negocio pendientes.**

