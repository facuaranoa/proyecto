// Configuración de la API
const API_BASE = 'http://localhost:3000/api';

// Variables globales
let currentUser = null;
let currentToken = null;

// CAPTURAR ERRORES GLOBALES - MUESTRA ALERTS CUANDO CONSOLA ESTÁ CERRADA
window.addEventListener('error', function(e) {
    const errorMsg = `🚨 ERROR JAVASCRIPT:\n${e.message}\nArchivo: ${e.filename}\nLínea: ${e.lineno}`;
    console.error(errorMsg, e.error);

    // Si no hay consola disponible, mostrar alert
    try {
        console.log('test');
    } catch {
        alert(errorMsg);
    }
});

window.addEventListener('unhandledrejection', function(e) {
    const errorMsg = `🚨 ERROR PROMESA:\n${e.reason}`;
    console.error(errorMsg);

    try {
        console.log('test');
    } catch {
        alert(errorMsg);
    }
});

// Función de diagnóstico que se ejecuta automáticamente
function runDiagnostics() {
    try {
        // Verificar elementos críticos
        const criticalElements = [
            'login', 'register', 'tasks', 'dashboard'
        ];

        let missingElements = [];
        criticalElements.forEach(id => {
            if (!document.getElementById(id)) {
                missingElements.push(id);
            }
        });

        if (missingElements.length > 0) {
            alert('⚠️ ELEMENTOS FALTANTES: ' + missingElements.join(', '));
            return false;
        }

        // Verificar funciones críticas
        const criticalFunctions = [
            'showTab', 'showTabWithContent', 'initializeWizard', 'selectServiceType'
        ];

        let missingFunctions = [];
        criticalFunctions.forEach(funcName => {
            if (typeof window[funcName] !== 'function') {
                missingFunctions.push(funcName);
            }
        });

        if (missingFunctions.length > 0) {
            alert('⚠️ FUNCIONES FALTANTES: ' + missingFunctions.join(', '));
            return false;
        }

        // Si todo está bien, mostrar mensaje de éxito
        const successMsg = '✅ DIAGNÓSTICO EXITOSO: Todos los elementos y funciones están presentes';
        console.log(successMsg);

        // Intentar mostrar alert solo si hay problemas
        return true;

    } catch (error) {
        alert('❌ ERROR EN DIAGNÓSTICO: ' + error.message);
        return false;
    }
}

// Ejecutar diagnóstico inmediatamente
setTimeout(runDiagnostics, 100);

console.log('🚀 FRONTEND CARGADO - Errores serán mostrados en alert si consola está cerrada');

// Funciones de navegación de pestañas
function showTab(tabName) {
    try {
    // Ocultar todas las pestañas
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });

    // Desactivar todos los botones
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Mostrar la pestaña seleccionada
    const tabElement = document.getElementById(tabName);
    if (tabElement) {
        tabElement.classList.add('active');
        
        // Si es el panel admin, cargar taskers automáticamente
        if (tabName === 'admin' && currentUser && currentUser.tipo === 'admin') {
            setTimeout(() => {
                listarTaskers();
            }, 100);
        }
    } else {
        // Si no encuentra el elemento, intentar con showTabWithContent
        if (tabName === 'tasks') {
            showTabWithContent('tasks');
            return;
        }
    }

    // Activar el botón correspondiente
    document.querySelectorAll('.tab-btn').forEach(btn => {
        const onclick = btn.getAttribute('onclick');
        if (onclick && (onclick.includes(`showTab('${tabName}')`) || onclick.includes(`showTabWithContent('${tabName}')`))) {
            btn.classList.add('active');
        }
    });

    } catch (error) {
        console.error('❌ Error en showTab:', error);
        alert('Error al cambiar de pestaña: ' + error.message);
    }
}

// Función para mostrar mensajes
function showMessage(message, type = 'info') {
    const messagesDiv = document.getElementById('messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;

    messagesDiv.appendChild(messageDiv);

    // Auto-remover después de 5 segundos
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
}

// Función para alternar entre formularios de cliente y tasker
function toggleUserForm() {
    const userType = document.getElementById('userType').value;
    const clienteForm = document.getElementById('clienteForm');
    const taskerForm = document.getElementById('taskerForm');

    if (userType === 'cliente') {
        clienteForm.style.display = 'block';
        taskerForm.style.display = 'none';
    } else {
        clienteForm.style.display = 'none';
        taskerForm.style.display = 'block';
    }
}

// Función para mostrar pestañas con contenido dinámico
function showTabWithContent(tabName) {
    // Primero mostrar la pestaña normalmente
    showTab(tabName);

    // Si es la pestaña de tasks y estamos logueados, cargar contenido dinámico
    if (tabName === 'tasks' && currentUser) {
        showTasksContent();
    }
}

// Funciones para modales
function showTermsModal(event) {
    if (event) event.preventDefault();
    document.getElementById('termsModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function showPrivacyModal(event) {
    if (event) event.preventDefault();
    document.getElementById('privacyModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Cerrar modal al hacer click fuera
window.onclick = function(event) {
    const termsModal = document.getElementById('termsModal');
    const privacyModal = document.getElementById('privacyModal');

    if (event.target === termsModal) {
        closeModal('termsModal');
    }
    if (event.target === privacyModal) {
        closeModal('privacyModal');
    }
}

// Función para registrar cliente
async function registerCliente(event) {
    if (!event) {
        console.error('registerCliente called without event parameter');
        return;
    }
    event.preventDefault();

    // Validar campos requeridos
    const missingFields = validateRequiredFields('cliente');
    if (missingFields.length > 0) {
        showMessage(`❌ Faltan completar: ${missingFields.join(', ')}`, 'error');
        return;
    }

    // Verificar que los términos estén aceptados
    const termsAccepted = document.getElementById('clienteTerms').checked;
    if (!termsAccepted) {
        showMessage('❌ Debes aceptar los Términos y Condiciones para continuar', 'error');
        highlightTerms('clienteTerms');
        document.getElementById('clienteTerms').focus();
        return;
    }

    const submitBtn = event.target.querySelector('button[type="submit"]');
    setLoading(submitBtn, true);

    const formData = {
        email: document.getElementById('clienteEmail').value,
        password: document.getElementById('clientePassword').value,
        nombre: document.getElementById('clienteNombre').value,
        apellido: document.getElementById('clienteApellido').value,
        telefono: document.getElementById('clienteTelefono').value,
        ubicacion_default: {
            latitud: parseFloat(document.getElementById('clienteLatitud').value),
            longitud: parseFloat(document.getElementById('clienteLongitud').value),
            direccion: document.getElementById('clienteDireccion').value,
            ciudad: document.getElementById('clienteCiudad').value
        }
    };

    try {
        const response = await fetch(`${API_BASE}/auth/register/cliente`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (response.ok) {
            showMessage('✅ Cliente registrado exitosamente', 'success');
            document.getElementById('clienteForm').reset();
            document.getElementById('clienteTerms').checked = false;
        } else {
            showMessage(`❌ Error: ${data.message || 'Error desconocido'}`, 'error');
        }
    } catch (error) {
        showMessage(`❌ Error de conexión: ${error.message}`, 'error');
    } finally {
        setLoading(submitBtn, false);
    }
}

// Función para registrar tasker
async function registerTasker(event) {
    if (!event) {
        console.error('registerTasker called without event parameter');
        return;
    }
    event.preventDefault();


    // Verificar que los términos estén aceptados
    const termsAccepted = document.getElementById('taskerTerms').checked;
    if (!termsAccepted) {
        showMessage('❌ Debes aceptar los Términos y Condiciones para continuar', 'error');
        highlightTerms('taskerTerms');
        document.getElementById('taskerTerms').focus();
        return;
    }

    // Verificar que estamos en el formulario correcto
    const userType = document.getElementById('userType').value;
    if (userType !== 'tasker') {
        showMessage('❌ Error: Selecciona "Tasker" en el dropdown antes de registrar', 'error');
        document.getElementById('userType').focus();
        return;
    }

    // Validar campos requeridos
    const missingFields = validateRequiredFields('tasker');
    if (missingFields.length > 0) {
        showMessage(`❌ Faltan completar: ${missingFields.join(', ')}`, 'error');
        return;
    }

    const submitBtn = event.target.querySelector('button[type="submit"]');
    setLoading(submitBtn, true);

    const formData = {
        email: document.getElementById('taskerEmail').value,
        password: document.getElementById('taskerPassword').value,
        nombre: document.getElementById('taskerNombre').value,
        apellido: document.getElementById('taskerApellido').value,
        telefono: document.getElementById('taskerTelefono').value,
        cuit: document.getElementById('taskerCuit').value || null,
        monotributista_check: document.getElementById('taskerMonotributista').checked,
        terminos_aceptados: document.getElementById('taskerTerms').checked
    };


    try {
        const response = await fetch(`${API_BASE}/auth/register/tasker`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (response.ok) {
            showMessage('✅ Tasker registrado exitosamente. Espera la aprobación del administrador.', 'success');
            // Resetear el formulario solo cuando el registro es exitoso
            document.getElementById('taskerForm').reset();
            // El checkbox se resetea automáticamente con reset(), no necesitamos hacerlo manualmente
        } else {
            showMessage(`❌ Error: ${data.message || 'Error desconocido'}`, 'error');
        }
    } catch (error) {
        showMessage(`❌ Error de conexión: ${error.message}`, 'error');
    } finally {
        setLoading(submitBtn, false);
    }
}

// Función para login
async function login(event) {
    if (!event) {
        console.error('login called without event parameter');
        return;
    }
    event.preventDefault();

    const submitBtn = event.target.querySelector('button[type="submit"]');
    setLoading(submitBtn, true);

    const formData = {
        email: document.getElementById('loginEmail').value,
        password: document.getElementById('loginPassword').value
    };

    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (response.ok) {
            currentToken = data.token;
            currentUser = data.usuario;

            // Cambiar a modo logueado
            switchToLoggedInMode();

            // Mostrar la pestaña correspondiente según el tipo de usuario
            if (currentUser.tipo === 'admin') {
                showTab('admin'); // Panel de administración
            } else if (currentUser.tipo === 'cliente') {
                showTabWithContent('tasks'); // Crear/ver tareas
            } else {
                showTabWithContent('tasks'); // Ver tareas disponibles (para taskers)
            }

            document.getElementById('loginForm').reset();
        } else {
            showMessage(`❌ Error: ${data.message || 'Credenciales inválidas'}`, 'error');
        }
    } catch (error) {
        showMessage(`❌ Error de conexión: ${error.message}`, 'error');
    } finally {
        setLoading(submitBtn, false);
    }
}

// Función para crear tarea
async function createTask(event) {
    if (!event) {
        console.error('createTask called without event parameter');
        return;
    }
    event.preventDefault();

    if (!currentToken) {
        showMessage('❌ Debes iniciar sesión primero', 'error');
        return;
    }

    const submitBtn = event.target.querySelector('button[type="submit"]');
    setLoading(submitBtn, true);

    // Los datos ahora vienen del wizard (tipo_servicio directo)
    const categoria = document.getElementById('taskCategoria').value;
    const tipoServicio = selectedServiceType || document.getElementById('taskTipoServicio').value;

    const formData = {
        tipo_servicio: tipoServicio,
        descripcion: document.getElementById('taskTitulo').value + ': ' + document.getElementById('taskDescripcion').value,
        ubicacion: {
            latitud: parseFloat(document.getElementById('taskLatitud').value),
            longitud: parseFloat(document.getElementById('taskLongitud').value),
            direccion: document.getElementById('taskDireccion').value,
            ciudad: document.getElementById('taskCiudad').value
        },
        fecha_hora_requerida: document.getElementById('taskFecha').value,
        requiere_licencia: false, // Por defecto false, se puede agregar un checkbox después
        monto_total_acordado: parseFloat(document.getElementById('taskPresupuesto').value) || 100
    };

    console.log('Enviando tarea con datos:', formData);

    try {
        const response = await fetch(`${API_BASE}/task/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentToken}`
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (response.ok) {
            showMessage('✅ Tarea creada exitosamente', 'success');
            document.getElementById('taskForm').reset();

            // Reiniciar el wizard
            resetWizard();

            // Recargar las listas de tareas del usuario
            loadClientPendingTasks(); // Recargar tareas pendientes de asignar
            loadClientAssignedTasks(); // Recargar tareas asignadas
        } else {
            showMessage(`❌ Error: ${data.message || 'Error desconocido'}`, 'error');
        }
    } catch (error) {
        showMessage(`❌ Error de conexión: ${error.message}`, 'error');
    } finally {
        setLoading(submitBtn, false);
    }
}

// Función para listar taskers pendientes (solo admin)
async function listarTaskers() {
    try {
        if (!currentToken) {
            showMessage('❌ Debes iniciar sesión primero', 'error');
            return;
        }

        const adminResult = document.getElementById('adminResult');
        adminResult.innerHTML = '<p>Cargando taskers...</p>';

        // Obtener solo taskers pendientes
        const response = await fetch(`${API_BASE}/admin/taskers?pendientes=true`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${currentToken}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            showMessage(`❌ Error: ${data.message || 'Error al cargar taskers'}`, 'error');
            adminResult.innerHTML = `<p class="error">Error: ${data.message}</p>`;
            return;
        }

        const taskers = data.taskers || [];

        if (taskers.length === 0) {
            adminResult.innerHTML = `
                <div class="no-taskers-message">
                    <p>✅ No hay taskers pendientes de aprobación.</p>
                    <p>Todos los taskers han sido aprobados.</p>
                </div>
            `;
            return;
        }

        let html = '<div class="tasker-list">';
        html += `<h3>Taskers Pendientes (${taskers.length})</h3>`;

        taskers.forEach(tasker => {
            const estadoBadge = tasker.aprobado_admin 
                ? '<span class="badge approved">✅ Aprobado</span>' 
                : '<span class="badge pending">⏳ Pendiente</span>';

            html += `
                <div class="tasker-item">
                    <div class="tasker-header">
                        <h4>${tasker.nombre} ${tasker.apellido}</h4>
                        ${estadoBadge}
                    </div>
                    <p><strong>Email:</strong> ${tasker.email}</p>
                    <p><strong>Teléfono:</strong> ${tasker.telefono || 'No especificado'}</p>
                    ${tasker.cuit ? `<p><strong>CUIT:</strong> ${tasker.cuit}</p>` : ''}
                    <p><strong>Monotributista:</strong> ${tasker.monotributista_check ? 'Sí' : 'No'}</p>
                    <p><strong>Disponible:</strong> ${tasker.disponible ? 'Sí' : 'No'}</p>
                    <p><strong>Fecha de registro:</strong> ${new Date(tasker.createdAt).toLocaleDateString('es-ES')}</p>
                    <div class="tasker-actions">
                        ${!tasker.aprobado_admin ? `
                            <button class="verify-btn" onclick="aprobarTasker(${tasker.id})">✅ Aprobar Tasker</button>
                        ` : `
                            <button class="reject-btn" onclick="rechazarTasker(${tasker.id})">❌ Rechazar Tasker</button>
                        `}
                    </div>
                </div>
            `;
        });

        html += '</div>';
        adminResult.innerHTML = html;

        showMessage(`✅ ${taskers.length} tasker(s) cargado(s) correctamente`, 'success');
    } catch (error) {
        console.error('Error al listar taskers:', error);
        showMessage(`❌ Error: ${error.message}`, 'error');
        document.getElementById('adminResult').innerHTML = `<p class="error">Error: ${error.message}</p>`;
    }
}

// Función para aprobar tasker
async function aprobarTasker(taskerId) {
    if (!confirm('¿Estás seguro de que quieres aprobar a este tasker?')) {
        return;
    }

    try {
        if (!currentToken) {
            showMessage('❌ Debes iniciar sesión primero', 'error');
            return;
        }

        const response = await fetch(`${API_BASE}/admin/tasker/verify/${taskerId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentToken}`
            },
            body: JSON.stringify({ aprobado_admin: true })
        });

        const data = await response.json();

        if (response.ok) {
            showMessage(`✅ ${data.message}`, 'success');
            // Recargar la lista de taskers
            setTimeout(() => {
                listarTaskers();
            }, 1000);
        } else {
            showMessage(`❌ Error: ${data.message || 'Error al aprobar tasker'}`, 'error');
        }
    } catch (error) {
        console.error('Error aprobando tasker:', error);
        showMessage('❌ Error de conexión al aprobar tasker', 'error');
    }
}

// Función para rechazar tasker
async function rechazarTasker(taskerId) {
    if (!confirm('¿Estás seguro de que quieres rechazar a este tasker?')) {
        return;
    }

    try {
        if (!currentToken) {
            showMessage('❌ Debes iniciar sesión primero', 'error');
            return;
        }

        const response = await fetch(`${API_BASE}/admin/tasker/verify/${taskerId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentToken}`
            },
            body: JSON.stringify({ aprobado_admin: false })
        });

        const data = await response.json();

        if (response.ok) {
            showMessage(`✅ ${data.message}`, 'success');
            // Recargar la lista de taskers
            setTimeout(() => {
                listarTaskers();
            }, 1000);
        } else {
            showMessage(`❌ Error: ${data.message || 'Error al rechazar tasker'}`, 'error');
        }
    } catch (error) {
        console.error('Error rechazando tasker:', error);
        showMessage('❌ Error de conexión al rechazar tasker', 'error');
    }
}

// Función para que un tasker acepte una tarea
// Función para aplicar a una tarea (tasker)
async function applyToTask(taskId) {
    if (!currentToken) {
        showMessage('❌ Debes iniciar sesión primero', 'error');
        return;
    }

    if (!confirm('¿Estás seguro de que quieres aplicar a esta tarea?')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/task/apply/${taskId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentToken}`
            }
        });

        const data = await response.json();

        if (response.ok) {
            showMessage('✅ ¡Aplicación enviada exitosamente! El cliente revisará tu solicitud.', 'success');

            // Recargar las tareas disponibles para actualizar el estado
            setTimeout(() => {
                // Obtener los filtros actuales si existen
                const filtros = getFilterValues();
                loadAvailableTasks(filtros);
            }, 500);
        } else {
            showMessage(`❌ Error: ${data.message || 'Error al aplicar a la tarea'}`, 'error');
        }
    } catch (error) {
        console.error('Error aplicando a tarea:', error);
        showMessage('❌ Error de conexión al aplicar a la tarea', 'error');
    }
}

// Función legacy (mantener por compatibilidad, pero redirigir a applyToTask)
async function acceptTask(taskId) {
    await applyToTask(taskId);
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Formularios
    document.getElementById('clienteForm').addEventListener('submit', registerCliente);
    document.getElementById('taskerForm').addEventListener('submit', registerTasker);
    document.getElementById('loginForm').addEventListener('submit', login);
    // Nota: taskForm se crea dinámicamente, su event listener se agrega en renderClientDashboard

    // Event listeners para checkboxes de términos
    document.getElementById('clienteTerms').addEventListener('change', function() {
        if (this.checked) {
            highlightTerms('clienteTerms');
        }
    });

    document.getElementById('taskerTerms').addEventListener('change', function() {
        if (this.checked) {
            highlightTerms('taskerTerms');
        }
    });
});

// Función para mostrar/ocultar loading en botones
function setLoading(button, loading) {
    if (loading) {
        button.disabled = true;
        button.dataset.originalText = button.textContent;
        button.textContent = '⏳ Procesando...';
        button.style.opacity = '0.7';
    } else {
        button.disabled = false;
        button.textContent = button.dataset.originalText;
        button.style.opacity = '1';
    }
}

// Función para resaltar términos no aceptados
function highlightTerms(checkboxId) {
    const checkbox = document.getElementById(checkboxId);
    const container = checkbox.closest('.terms-container');

    if (!checkbox.checked) {
        container.style.borderColor = '#ef4444';
        container.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
        container.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
            container.style.animation = '';
        }, 500);
    } else {
        container.style.borderColor = '#10b981';
        container.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
        setTimeout(() => {
            container.style.borderColor = '#e2e8f0';
            container.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
        }, 1000);
    }
}

// Función para validar campos requeridos
function validateRequiredFields(formType) {
    const fields = formType === 'cliente' ? [
        { id: 'clienteEmail', name: 'Email' },
        { id: 'clientePassword', name: 'Contraseña' },
        { id: 'clienteNombre', name: 'Nombre' },
        { id: 'clienteApellido', name: 'Apellido' },
        { id: 'clienteTelefono', name: 'Teléfono' }
    ] : [
        { id: 'taskerEmail', name: 'Email' },
        { id: 'taskerPassword', name: 'Contraseña' },
        { id: 'taskerNombre', name: 'Nombre' },
        { id: 'taskerApellido', name: 'Apellido' },
        { id: 'taskerTelefono', name: 'Teléfono' },
        { id: 'taskerEspecialidad', name: 'Especialidad' }
    ];

    const missingFields = [];

    for (const field of fields) {
        const element = document.getElementById(field.id);
        const value = element.value.trim();

        if (!value) {
            missingFields.push(field.name);
            element.style.borderColor = '#ef4444';
            element.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
        } else {
            element.style.borderColor = '#e2e8f0';
            element.style.boxShadow = 'none';
        }
    }

    return missingFields;
}

// Función para cargar datos de demostración
function loadDemoData() {
    const demoUsers = {
        cliente: {
            email: 'juan.perez@email.com',
            password: '123456',
            nombre: 'Juan',
            apellido: 'Pérez',
            telefono: '+5491123456789'
        },
        tasker: {
            email: 'maria.gonzalez@email.com',
            password: '123456',
            nombre: 'María',
            apellido: 'González',
            telefono: '+5491123456790',
            especialidad: 'plomero',
            descripcion: 'Especialista en plomería residencial con 5 años de experiencia',
            tarifa: '25',
            cuit: '27-12345678-9'
        }
    };

    // Mostrar selector de tipo de usuario demo
    const userType = prompt('¿Qué tipo de usuario quieres crear?\n\n1. Cliente (Juan Pérez)\n2. Tasker (María González)\n\nEscribe "cliente" o "tasker":');

    if (!userType || !['cliente', 'tasker'].includes(userType.toLowerCase())) {
        showMessage('❌ Opción inválida. Escribe "cliente" o "tasker"', 'error');
        return;
    }

    const type = userType.toLowerCase();
    const user = demoUsers[type];

    // Cambiar al formulario correspondiente
    document.getElementById('userType').value = type;
    toggleUserForm();

    // Llenar los campos
    if (type === 'cliente') {
        document.getElementById('clienteEmail').value = user.email;
        document.getElementById('clientePassword').value = user.password;
        document.getElementById('clienteNombre').value = user.nombre;
        document.getElementById('clienteApellido').value = user.apellido;
        document.getElementById('clienteTelefono').value = user.telefono;
        document.getElementById('clienteTerms').checked = true;
    } else {
        document.getElementById('taskerEmail').value = user.email;
        document.getElementById('taskerPassword').value = user.password;
        document.getElementById('taskerNombre').value = user.nombre;
        document.getElementById('taskerApellido').value = user.apellido;
        document.getElementById('taskerTelefono').value = user.telefono;
        document.getElementById('taskerEspecialidad').value = user.especialidad;
        document.getElementById('taskerDescripcion').value = user.descripcion;
        document.getElementById('taskerTarifa').value = user.tarifa;
        document.getElementById('taskerCuit').value = user.cuit;
        document.getElementById('taskerTerms').checked = true;
    }

    showMessage(`✅ Datos de ${user.nombre} ${user.apellido} cargados. Haz click en "Registrar ${type === 'cliente' ? 'Cliente' : 'Tasker'}"`, 'success');
}

// Función para probar la conexión con la API
async function testConnection() {
    try {
        const response = await fetch('http://localhost:3000');
        if (response.ok) {
            showMessage('✅ API conectada correctamente', 'success');
        } else {
            showMessage('❌ API no responde', 'error');
        }
    } catch (error) {
        showMessage('❌ No se puede conectar con la API. ¿Está el servidor corriendo?', 'error');
    }
}


// Función para cambiar a modo logueado
function switchToLoggedInMode() {
    // Ocultar todas las pestañas
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.style.display = 'none';
    });

    // Encontrar y mostrar las pestañas necesarias
    const tabBtns = document.querySelectorAll('.tab-btn');
    let logoutBtn = null;
    let tasksBtn = null;
    let adminBtn = null;

    tabBtns.forEach(btn => {
        if (btn.onclick && btn.onclick.toString().includes('logout')) {
            logoutBtn = btn;
        }
        if (btn.onclick && btn.onclick.toString().includes('showTabWithContent(\'tasks\')')) {
            tasksBtn = btn;
        }
        if (btn.onclick && btn.onclick.toString().includes('admin')) {
            adminBtn = btn;
        }
    });

    if (logoutBtn) {
        logoutBtn.style.display = 'inline-block';
    }

    // Mostrar pestaña admin solo si el usuario es admin
    if (currentUser.tipo === 'admin' && adminBtn) {
        adminBtn.style.display = 'inline-block';
        adminBtn.classList.add('active');
    }

    if (tasksBtn) {
        tasksBtn.style.display = 'inline-block';

        // Configurar el texto de la pestaña según el tipo de usuario
        if (currentUser.tipo === 'cliente') {
            tasksBtn.textContent = 'Mis Tareas';
            if (currentUser.tipo !== 'admin') {
                tasksBtn.classList.add('active');
            }
        } else if (currentUser.tipo === 'tasker') {
            tasksBtn.textContent = 'Tareas Disponibles';
            if (currentUser.tipo !== 'admin') {
                tasksBtn.classList.add('active');
            }
        }
    }
}

// Función para mostrar el contenido de tareas según el tipo de usuario
function showTasksContent() {
    try {
        console.log('🔄 showTasksContent ejecutándose...');

        const tasksContent = document.getElementById('tasksContent');
        if (!tasksContent) {
            console.error('❌ Elemento tasksContent no encontrado');
            alert('Error: Contenedor de tareas no encontrado');
            return;
        }

        const userType = currentUser.tipo;
        console.log('👤 Usuario tipo:', userType);

    let tasksHTML = `
        <div class="tasks-container">
            <div class="user-header">
                <h2>${userType === 'cliente' ? '📋 Mis Tareas' : '📋 Tareas Disponibles'}</h2>
                <p>Bienvenido, ${currentUser.nombre} ${currentUser.apellido}</p>
            </div>
    `;

    if (userType === 'cliente') {
        console.log('👤 RENDERIZANDO DASHBOARD CLIENTE');
        // Para clientes: pestañas para organizar tareas
        tasksHTML += `
            <div class="tasks-section">
                <!-- PESTAÑAS PARA CLIENTE -->
                <div class="client-tabs">
                    <button class="client-tab-btn active" onclick="showClientTab('create')" id="tab-create">➕ Crear Tarea</button>
                    <button class="client-tab-btn" onclick="showClientTab('pending')" id="tab-pending">⏳ Pendientes de Asignar</button>
                    <button class="client-tab-btn" onclick="showClientTab('assigned')" id="tab-assigned">📋 Tareas Asignadas</button>
                    <button class="client-tab-btn" onclick="showClientTab('history')" id="tab-history">📜 Historial</button>
                </div>

                <!-- CONTENIDO: CREAR TAREA -->
                <div id="client-tab-create" class="client-tab-content active">
                    <div class="create-task-section">
                        <h3>➕ Crear Nueva Tarea</h3>

                    <!-- WIZARD FORM -->
                    <div id="taskWizard" class="task-wizard">
                        <!-- HEADER CON PROGRESS -->
                        <div class="wizard-header">
                            <h4 id="wizardTitle">Paso 1: ¿Qué tipo de servicio necesitas?</h4>
                            <div class="progress-bar">
                                <div class="progress-step active" data-step="1">1</div>
                                <div class="progress-step" data-step="2">2</div>
                                <div class="progress-step" data-step="3">3</div>
                                <div class="progress-step" data-step="4">4</div>
                            </div>
                        </div>

                        <!-- PASO 1: TIPO DE SERVICIO -->
                        <div class="wizard-step active" data-step="1">
                            <div class="service-selection">
                        <div class="service-card" data-service="EXPRESS">
                            <div class="service-icon">⚡</div>
                            <h4>Express</h4>
                            <p>Soluciones rápidas en 2-4 horas</p>
                            <ul class="service-features">
                                <li>🔧 Plomería</li>
                                <li>⚡ Electricidad</li>
                                <li>🌱 Jardinería</li>
                                <li>🔧 Reparaciones menores</li>
                            </ul>
                            <button class="select-service-btn" data-service="EXPRESS">
                                Seleccionar Servicio
                            </button>
                        </div>
                        <div class="service-card" data-service="ESPECIALISTA">
                            <div class="service-icon">🎯</div>
                            <h4>Especialista</h4>
                            <p>Trabajos especializados en 1-7 días</p>
                            <ul class="service-features">
                                <li>🔨 Carpintería</li>
                                <li>🏠 Reformas</li>
                                <li>🛠️ Instalaciones</li>
                                <li>🎨 Pintura y decoración</li>
                            </ul>
                            <button class="select-service-btn" data-service="ESPECIALISTA">
                                Seleccionar Servicio
                            </button>
                        </div>
                            </div>
                        </div>

                        <!-- PASO 2: DESCRIPCIÓN -->
                        <div class="wizard-step" data-step="2">
                            <form class="wizard-form">
                                <div class="form-group">
                                    <label for="taskTitulo">Título de la tarea *</label>
                                    <input type="text" id="taskTitulo" placeholder="Ej: Reparar grifo de cocina" maxlength="80" required>
                                    <small class="field-hint">Sé específico pero conciso</small>
                                </div>
                                <div class="form-group">
                                    <label for="taskDescripcion">Descripción detallada *</label>
                                    <textarea id="taskDescripcion" placeholder="Describe exactamente qué necesitas..." rows="4" maxlength="500" required></textarea>
                                    <small class="field-hint">Incluye detalles como marca, modelo, síntomas del problema, etc.</small>
                                </div>
                                <div class="form-group">
                                    <label for="taskCategoria">Categoría específica *</label>
                                    <select id="taskCategoria" required>
                                        <option value="">Selecciona una categoría</option>
                                        <!-- Se llenará dinámicamente según el tipo de servicio -->
                                    </select>
                                </div>
                            </form>
                        </div>

                        <!-- PASO 3: UBICACIÓN Y FECHA -->
                        <div class="wizard-step" data-step="3">
                            <form class="wizard-form">
                                <div class="form-group">
                                    <label for="taskDireccion">Dirección completa *</label>
                                    <input type="text" id="taskDireccion" placeholder="Calle, número, barrio, ciudad" value="Av. Corrientes 1234" required>
                                    <small class="field-hint">Dirección exacta donde se realizará el trabajo</small>
                                </div>
                                <div class="form-row">
                                    <div class="form-group half">
                                        <label for="taskFecha">Fecha y hora deseada *</label>
                                        <input type="datetime-local" id="taskFecha" required>
                                        <small class="field-hint">¿Cuándo necesitas el servicio?</small>
                                    </div>
                                </div>
                                <input type="hidden" id="taskLatitud" value="-34.6037">
                                <input type="hidden" id="taskLongitud" value="-58.3816">
                                <input type="hidden" id="taskCiudad" value="Buenos Aires">
                            </form>
                        </div>

                        <!-- PASO 4: VISTA PREVIA Y CONFIRMACIÓN -->
                        <div class="wizard-step" data-step="4">
                            <div class="task-preview-section">
                                <h4>📋 Vista Previa de tu Tarea</h4>
                                <p class="preview-subtitle">Así se verá tu tarea para los taskers:</p>

                                <div class="task-preview-card">
                                    <div class="preview-header">
                                        <div class="preview-service-type">
                                            <span id="previewServiceIcon">⚡</span>
                                            <span id="previewServiceType">Express</span>
                                        </div>
                                        <div class="preview-budget">
                                            <span id="previewBudget">$100</span>
                                        </div>
                                    </div>

                                    <div class="preview-content">
                                        <h3 id="previewTitle">Título de la tarea</h3>
                                        <p id="previewDescription">Descripción detallada de la tarea...</p>

                                        <div class="preview-details">
                                            <div class="preview-detail">
                                                <span class="detail-icon">📍</span>
                                                <span id="previewLocation">Dirección</span>
                                            </div>
                                            <div class="preview-detail">
                                                <span class="detail-icon">📅</span>
                                                <span id="previewDate">Fecha y hora</span>
                                            </div>
                                            <div class="preview-detail">
                                                <span class="detail-icon">🔧</span>
                                                <span id="previewCategory">Categoría</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="preview-actions">
                                        <button class="preview-btn accept-btn" disabled>
                                            💬 Contactar Cliente
                                        </button>
                                        <div class="preview-stats">
                                            <small>👁️ ~50 taskers verán tu tarea</small><br>
                                            <small>⏱️ Respuesta estimada: 15-30 min</small>
                                        </div>
                                    </div>
                                </div>

                                <div class="budget-summary">
                                    <div class="summary-item">
                                        <span>Tu presupuesto:</span>
                                        <span id="budgetAmount">$100</span>
                                    </div>
                                    <div class="summary-item fee">
                                        <span>Comisión AyudaAlToque (20%):</span>
                                        <span id="platformFee">-$20</span>
                                    </div>
                                    <div class="summary-item net">
                                        <span>Tasker recibe:</span>
                                        <span id="taskerAmount">$80</span>
                                    </div>
                                </div>

                                <!-- Formulario oculto para el presupuesto -->
                                <form class="wizard-form" style="display: none;">
                                    <div class="form-group">
                                        <label for="taskPresupuesto">Presupuesto máximo ($)</label>
                                        <input type="number" id="taskPresupuesto" placeholder="100" min="1" step="1" value="100" required>
                                        <small class="field-hint">Monto máximo que estás dispuesto a pagar</small>
                                    </div>
                                </form>
                            </div>
                        </div>

                        <!-- NAVEGACIÓN DEL WIZARD -->
                        <div class="wizard-navigation">
                            <button type="button" id="prevStep" class="btn-secondary" style="display: none;">
                                ← Anterior
                            </button>
                            <div class="step-indicator">
                                <span id="currentStepText">Paso 1 de 4</span>
                            </div>
                            <button type="button" id="nextStep" class="btn-primary">
                                Siguiente →
                            </button>
                        </div>
                    </div>

                    <!-- FORMULARIO ORIGINAL (OCULTO) -->
                    <form id="taskForm" class="task-form" style="display: none;">
                        <input type="hidden" id="taskTipoServicio">
                        <button type="submit" class="create-btn" style="display: none;">Crear Tarea</button>
                    </form>
                </div>

                    </div>
                </div>

                <!-- CONTENIDO: TAREAS PENDIENTES DE ASIGNAR -->
                <div id="client-tab-pending" class="client-tab-content">
                    <h3>⏳ Tareas Pendientes de Asignar</h3>
                    <div id="pendingTasksList" class="tasks-list">
                        <p class="no-tasks">Cargando tareas pendientes...</p>
                    </div>
                </div>

                <!-- CONTENIDO: TAREAS ASIGNADAS/EN PROCESO -->
                <div id="client-tab-assigned" class="client-tab-content">
                    <h3>📋 Tareas Asignadas y en Proceso</h3>
                    <div id="assignedTasksList" class="tasks-list">
                        <p class="no-tasks">Cargando tareas asignadas...</p>
                    </div>
                </div>

                <!-- CONTENIDO: HISTORIAL -->
                <div id="client-tab-history" class="client-tab-content">
                    <h3>📜 Historial de Tareas</h3>
                    <div id="historyTasksList" class="tasks-list">
                        <p class="no-tasks">Cargando historial...</p>
                    </div>
                </div>
            </div>
        `;
    } else if (userType === 'admin') {
        // Para admin: mostrar mensaje de que debe usar el panel admin
        tasksHTML += `
            <div class="admin-info">
                <h3>👨‍💼 Panel de Administración</h3>
                <p>Bienvenido, ${currentUser.nombre} ${currentUser.apellido}</p>
                <p>Para gestionar taskers y aprobaciones, ve a la pestaña <strong>"ADMIN"</strong>.</p>
                <p>Desde allí podrás:</p>
                <ul>
                    <li>✅ Aprobar o rechazar taskers</li>
                    <li>📋 Ver lista de taskers pendientes</li>
                    <li>👥 Gestionar usuarios de la plataforma</li>
                </ul>
            </div>
        `;
    } else {
        // Para taskers: lista de tareas disponibles
        const aprobado = currentUser.aprobado_admin;

        if (!aprobado) {
            tasksHTML += `
                <div class="pending-approval">
                    <h3>⏳ Esperando Aprobación</h3>
                    <p>Tu cuenta está pendiente de aprobación por el administrador.</p>
                    <p>Contacta al soporte para acelerar el proceso.</p>
                </div>
            `;
        } else {
            tasksHTML += `
                <!-- PESTAÑAS PARA TASKER -->
                <div class="tasker-tabs">
                    <button class="tasker-tab-btn active" onclick="showTaskerTab('available')" id="tab-available">🔍 Búsqueda</button>
                    <button class="tasker-tab-btn" onclick="showTaskerTab('assigned')" id="tab-assigned-tasker">📋 Asignadas</button>
                    <button class="tasker-tab-btn" onclick="showTaskerTab('pending-payment')" id="tab-pending-payment">💳 Pendientes de Pago</button>
                    <button class="tasker-tab-btn" onclick="showTaskerTab('history')" id="tab-history-tasker">📜 Historial</button>
                </div>

                <!-- CONTENIDO: TAREAS DISPONIBLES -->
                <div id="tasker-tab-available" class="tasker-tab-content active">
                    <div class="available-tasks-section">
                        <h3>📋 Tareas Disponibles</h3>

                    <!-- FILTROS DE BÚSQUEDA -->
                    <div class="filters-section">
                        <h4>🔍 Filtrar Tareas</h4>
                        <div class="filters-grid">
                            <div class="filter-group">
                                <label for="filterTipoServicio">Tipo de Servicio:</label>
                                <select id="filterTipoServicio">
                                    <option value="">Todos</option>
                                    <option value="EXPRESS">⚡ Express</option>
                                    <option value="ESPECIALISTA">🎯 Especialista</option>
                                </select>
                            </div>

                            <div class="filter-group">
                                <label for="filterPrecioMin">Precio Mínimo:</label>
                                <input type="number" id="filterPrecioMin" placeholder="0" min="0">
                            </div>

                            <div class="filter-group">
                                <label for="filterPrecioMax">Precio Máximo:</label>
                                <input type="number" id="filterPrecioMax" placeholder="Sin límite" min="0">
                            </div>

                            <div class="filter-group">
                                <label for="filterCiudad">Ciudad:</label>
                                <input type="text" id="filterCiudad" placeholder="Ej: Buenos Aires">
                            </div>

                            <div class="filter-group">
                                <label for="filterLicencia">Requiere Licencia:</label>
                                <select id="filterLicencia">
                                    <option value="">Todos</option>
                                    <option value="true">Sí</option>
                                    <option value="false">No</option>
                                </select>
                            </div>

                            <div class="filter-group">
                                <label for="filterFechaDesde">Fecha Desde:</label>
                                <input type="date" id="filterFechaDesde">
                            </div>

                            <div class="filter-group">
                                <label for="filterFechaHasta">Fecha Hasta:</label>
                                <input type="date" id="filterFechaHasta">
                            </div>
                        </div>

                        <div class="filter-actions">
                            <button id="applyFilters" class="btn-primary">🔍 Aplicar Filtros</button>
                            <button id="clearFilters" class="btn-secondary">🗑️ Limpiar</button>
                            <span id="resultsCount" class="results-count"></span>
                        </div>
                    </div>

                    <div id="availableTasksList" class="tasks-list">
                        <p class="no-tasks">Cargando tareas disponibles...</p>
                    </div>
                    </div>
                </div>

                <!-- CONTENIDO: TAREAS ASIGNADAS DEL TASKER -->
                <div id="tasker-tab-assigned" class="tasker-tab-content">
                    <h3>📋 Mis Tareas Asignadas</h3>
                    <div id="taskerAssignedTasksList" class="tasks-list">
                        <p class="no-tasks">Cargando tareas asignadas...</p>
                    </div>
                </div>

                <!-- CONTENIDO: TAREAS PENDIENTES DE PAGO -->
                <div id="tasker-tab-pending-payment" class="tasker-tab-content">
                    <h3>💳 Tareas Pendientes de Pago</h3>
                    <div id="taskerPendingPaymentList" class="tasks-list">
                        <p class="no-tasks">Cargando tareas pendientes de pago...</p>
                    </div>
                </div>

                <!-- CONTENIDO: HISTORIAL DEL TASKER -->
                <div id="tasker-tab-history" class="tasker-tab-content">
                    <h3>📜 Historial de Tareas</h3>
                    <div id="taskerHistoryList" class="tasks-list">
                        <p class="no-tasks">Cargando historial...</p>
                    </div>
                </div>
            `;
        }
    }

    tasksHTML += `</div>`;
    tasksContent.innerHTML = tasksHTML;
    console.log('📄 HTML INSERTADO EN DOM');

    // Si es cliente, agregar el event listener para el formulario
    if (userType === 'cliente') {
        document.getElementById('taskForm').addEventListener('submit', createTask);
        loadClientPendingTasks(); // Cargar tareas pendientes de asignar
        loadClientAssignedTasks(); // Cargar tareas asignadas/en proceso
        loadClientHistoryTasks(); // Cargar historial
        
        // Inicializar el wizard después de que el DOM esté listo
        setTimeout(() => {
            console.log('🎯 Inicializando wizard después de renderizar...');
            initializeWizard();
        }, 100);
    } else if (userType === 'admin') {
        // Admin no necesita cargar tareas aquí, tiene su propio panel
        console.log('👨‍💼 Admin en panel de tareas - usar panel ADMIN para gestionar');
    } else if (currentUser.aprobado_admin) {
        loadAvailableTasks(); // Cargar tareas disponibles para taskers aprobados
        loadTaskerAssignedTasks(); // Cargar tareas asignadas del tasker
        loadTaskerPendingPaymentTasks(); // Cargar tareas pendientes de pago
        loadTaskerHistoryTasks(); // Cargar historial del tasker
        // Inicializar filtros después de un breve delay para asegurar que el DOM esté listo
        setTimeout(initializeFilters, 100);
    }

    } catch (error) {
        console.error('❌ Error en showTasksContent:', error);
        alert('Error al mostrar el contenido de tareas: ' + error.message);
    }
}

// Función para hacer logout
function logout() {
    currentUser = null;
    currentToken = null;

    // Restaurar pestañas originales
    document.querySelectorAll('.tab-btn').forEach(btn => {
        if (btn.onclick.toString().includes('register')) {
            btn.style.display = 'inline-block';
            btn.classList.add('active');
        } else if (btn.onclick.toString().includes('login')) {
            btn.style.display = 'inline-block';
            btn.classList.remove('active');
        } else if (btn.onclick.toString().includes('dashboard') ||
                   btn.onclick.toString().includes('tasks') ||
                   btn.onclick.toString().includes('admin') ||
                   btn.onclick.toString().includes('logout')) {
            btn.style.display = 'none';
            if (btn.onclick.toString().includes('tasks')) {
                btn.textContent = 'Tareas';
            }
        }
    });

    // Limpiar dashboard
    document.getElementById('dashboardContent').innerHTML = '';

    // Volver a la pestaña de registro
    showTab('register');

    showMessage('👋 Sesión cerrada exitosamente', 'info');
}

// Función para cargar las tareas del usuario actual (clientes)
async function loadUserTasks() {
    try {
        const response = await fetch(`${API_BASE}/task/my-tasks`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${currentToken}`
            }
        });

        const data = await response.json();

        const myTasksList = document.getElementById('myTasksList');

        if (response.ok) {
            const tareas = data.tareas;

            if (tareas && tareas.length > 0) {
                let tasksHTML = '';

                tareas.forEach(tarea => {
                    const fecha = new Date(tarea.fecha_hora_requerida).toLocaleString('es-ES');
                    const estadoColor = {
                        'PENDIENTE': '#f59e0b',
                        'ASIGNADA': '#3b82f6',
                        'FINALIZADA': '#10b981',
                        'CANCELADA': '#ef4444'
                    }[tarea.estado] || '#6b7280';

                    const tareaJson = JSON.stringify(tarea).replace(/"/g, '&quot;');
                    tasksHTML += `
                        <div class="task-item" data-tarea='${tareaJson}' onclick="openTaskModalFromData(this)" style="cursor: pointer;">
                            <div class="task-header">
                                <h4>${tarea.descripcion.split(':')[0]}</h4>
                                <span class="task-status" style="background: ${estadoColor}">${tarea.estado}</span>
                            </div>
                            <div class="task-details">
                                <p><strong>Tipo:</strong> ${tarea.tipo_servicio}</p>
                                <p><strong>Dirección:</strong> ${tarea.ubicacion.direccion}</p>
                                <p><strong>Fecha:</strong> ${fecha}</p>
                                <p><strong>Monto:</strong> $${tarea.monto_total_acordado}</p>
                            </div>
                            ${tarea.estado === 'PENDIENTE' ? `
                                <div class="task-actions" onclick="event.stopPropagation();">
                                    <button class="view-applications-btn" onclick="loadTaskApplications(${tarea.id})">👥 Ver Aplicaciones</button>
                                </div>
                                <div id="applications-${tarea.id}" class="applications-container" style="display: none;"></div>
                            ` : ''}
                        </div>
                    `;
                });

                myTasksList.innerHTML = tasksHTML;
            } else {
                myTasksList.innerHTML = `
                    <div class="no-tasks-message">
                        <p>📝 Aún no has creado ninguna tarea.</p>
                        <p>¡Crea tu primera tarea arriba!</p>
                    </div>
                `;
            }
        } else {
            myTasksList.innerHTML = `<p class="error">Error al cargar tus tareas: ${data.message}</p>`;
        }
    } catch (error) {
        console.error('Error cargando tareas del usuario:', error);
        document.getElementById('myTasksList').innerHTML = '<p class="error">Error al cargar tus tareas</p>';
    }
}

// Función para cargar aplicaciones de una tarea (cliente)
async function loadTaskApplications(tareaId) {
    try {
        if (!currentToken) {
            showMessage('❌ Debes iniciar sesión primero', 'error');
            return;
        }

        const applicationsContainer = document.getElementById(`applications-${tareaId}`);
        
        // Si ya está visible, ocultarlo
        if (applicationsContainer && applicationsContainer.style.display !== 'none') {
            applicationsContainer.style.display = 'none';
            return;
        }

        // Mostrar loading
        if (applicationsContainer) {
            applicationsContainer.innerHTML = '<p>Cargando aplicaciones...</p>';
            applicationsContainer.style.display = 'block';
        }

        const response = await fetch(`${API_BASE}/task/applications/${tareaId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${currentToken}`
            }
        });

        const data = await response.json();

        if (response.ok && applicationsContainer) {
            const aplicaciones = data.aplicaciones || [];

            if (aplicaciones.length === 0) {
                applicationsContainer.innerHTML = `
                    <div class="no-applications">
                        <p>📋 Aún no hay aplicaciones para esta tarea.</p>
                        <p>Los taskers aparecerán aquí cuando apliquen.</p>
                    </div>
                `;
            } else {
                let applicationsHTML = `
                    <div class="applications-list">
                        <h4>👥 Aplicaciones (${aplicaciones.length})</h4>
                `;

                aplicaciones.forEach(aplicacion => {
                    const fecha = new Date(aplicacion.createdAt).toLocaleString('es-ES');
                    const tasker = aplicacion.tasker;
                    
                    if (tasker) {
                        applicationsHTML += `
                            <div class="application-item">
                                <div class="application-header">
                                    <h5>${tasker.nombre} ${tasker.apellido}</h5>
                                    <span class="application-status">${aplicacion.estado}</span>
                                </div>
                                <div class="application-details">
                                    <p><strong>Email:</strong> ${tasker.email}</p>
                                    <p><strong>Teléfono:</strong> ${tasker.telefono || 'No especificado'}</p>
                                    <p><strong>Fecha de aplicación:</strong> ${fecha}</p>
                                </div>
                                <div class="application-actions">
                                    <button class="accept-application-btn" onclick="acceptApplication(${aplicacion.id}, ${tareaId})">✅ Aceptar</button>
                                    <button class="reject-application-btn" onclick="rejectApplication(${aplicacion.id})">❌ Rechazar</button>
                                </div>
                            </div>
                        `;
                    }
                });

                applicationsHTML += '</div>';
                applicationsContainer.innerHTML = applicationsHTML;
            }
        } else if (applicationsContainer) {
            applicationsContainer.innerHTML = `<p class="error">Error: ${data.message || 'Error al cargar aplicaciones'}</p>`;
        }
    } catch (error) {
        console.error('Error cargando aplicaciones:', error);
        const applicationsContainer = document.getElementById(`applications-${tareaId}`);
        if (applicationsContainer) {
            applicationsContainer.innerHTML = '<p class="error">Error al cargar aplicaciones</p>';
        }
    }
}

// Función para aceptar una aplicación
async function acceptApplication(applicationId, tareaId) {
    if (!confirm('¿Estás seguro de que quieres aceptar a este tasker? La tarea será asignada y las otras aplicaciones serán rechazadas.')) {
        return;
    }

    try {
        if (!currentToken) {
            showMessage('❌ Debes iniciar sesión primero', 'error');
            return;
        }

        const response = await fetch(`${API_BASE}/task/accept-application/${applicationId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentToken}`
            }
        });

        const data = await response.json();

        if (response.ok) {
            showMessage('✅ ¡Tasker aceptado! La tarea ha sido asignada exitosamente.', 'success');
            
            // Recargar las aplicaciones y las tareas
            setTimeout(() => {
                loadTaskApplications(tareaId);
                loadClientPendingTasks(); // Recargar tareas pendientes
                loadClientAssignedTasks(); // Recargar tareas asignadas del cliente
            }, 1000);
        } else {
            showMessage(`❌ Error: ${data.message || 'Error al aceptar aplicación'}`, 'error');
        }
    } catch (error) {
        console.error('Error aceptando aplicación:', error);
        showMessage('❌ Error de conexión al aceptar aplicación', 'error');
    }
}

// Función para rechazar una aplicación (pendiente de implementar)
async function rejectApplication(applicationId) {
    showMessage('⚠️ Funcionalidad en desarrollo: Rechazar aplicación', 'info');
    // TODO: Implementar lógica para rechazar aplicación
}

// ========== FUNCIONES PARA PESTAÑAS DE CLIENTE ==========

// Función para cambiar entre pestañas del cliente
function showClientTab(tabName) {
    // Ocultar todas las pestañas
    document.querySelectorAll('.client-tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Desactivar todos los botones
    document.querySelectorAll('.client-tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Mostrar la pestaña seleccionada
    const tabContent = document.getElementById(`client-tab-${tabName}`);
    const tabBtn = document.getElementById(`tab-${tabName}`);
    
    if (tabContent) {
        tabContent.classList.add('active');
    }
    if (tabBtn) {
        tabBtn.classList.add('active');
    }
    
    // Cargar datos según la pestaña
    if (tabName === 'assigned') {
        loadClientAssignedTasks();
    } else if (tabName === 'history') {
        loadClientHistoryTasks();
    } else if (tabName === 'pending') {
        loadClientPendingTasks();
    }
}

// Función para cargar tareas pendientes de asignar del cliente
async function loadClientPendingTasks() {
    try {
        const response = await fetch(`${API_BASE}/task/my-tasks`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${currentToken}`
            }
        });

        const data = await response.json();
        const pendingTasksList = document.getElementById('pendingTasksList');

        if (response.ok && pendingTasksList) {
            const todasLasTareas = data.tareas || [];
            // Filtrar solo las pendientes (sin asignar)
            const tareasPendientes = todasLasTareas.filter(t => t.estado === 'PENDIENTE');

            if (tareasPendientes.length > 0) {
                let tasksHTML = '';

                tareasPendientes.forEach(tarea => {
                    const fecha = new Date(tarea.fecha_hora_requerida).toLocaleString('es-ES');
                    const estadoColor = '#f59e0b';
                    
                    const tareaJson = JSON.stringify(tarea).replace(/"/g, '&quot;');
                    tasksHTML += `
                        <div class="task-item" data-tarea='${tareaJson}' onclick="openTaskModalFromData(this)" style="cursor: pointer;">
                            <div class="task-header">
                                <h4>${tarea.descripcion ? tarea.descripcion.split(':')[0] : 'Sin título'}</h4>
                                <span class="task-status" style="background: ${estadoColor}">Pendiente</span>
                            </div>
                            <div class="task-details">
                                <p><strong>Tipo:</strong> ${tarea.tipo_servicio}</p>
                                <p><strong>Dirección:</strong> ${tarea.ubicacion ? tarea.ubicacion.direccion : 'No especificada'}</p>
                                <p><strong>Fecha:</strong> ${fecha}</p>
                                <p><strong>Monto:</strong> $${tarea.monto_total_acordado || 0}</p>
                            </div>
                            <div class="task-actions" onclick="event.stopPropagation();">
                                <button class="view-applications-btn" onclick="loadTaskApplications(${tarea.id})">👥 Ver Aplicaciones</button>
                            </div>
                            <div id="applications-${tarea.id}" class="applications-container" style="display: none;"></div>
                        </div>
                    `;
                });

                pendingTasksList.innerHTML = tasksHTML;
            } else {
                pendingTasksList.innerHTML = `
                    <div class="no-tasks-message">
                        <p>⏳ No tienes tareas pendientes de asignar.</p>
                        <p>Todas tus tareas ya tienen un tasker asignado o están en proceso.</p>
                    </div>
                `;
            }
        } else if (pendingTasksList) {
            pendingTasksList.innerHTML = `<p class="error">Error: ${data.message || 'Error al cargar tareas'}</p>`;
        }
    } catch (error) {
        console.error('Error cargando tareas pendientes:', error);
        const pendingTasksList = document.getElementById('pendingTasksList');
        if (pendingTasksList) {
            pendingTasksList.innerHTML = '<p class="error">Error al cargar tareas pendientes</p>';
        }
    }
}

// Función para cargar tareas asignadas/en proceso del cliente
async function loadClientAssignedTasks() {
    try {
        const response = await fetch(`${API_BASE}/task/my-tasks`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${currentToken}`
            }
        });

        const data = await response.json();
        const assignedTasksList = document.getElementById('assignedTasksList');

        if (response.ok && assignedTasksList) {
            const todasLasTareas = data.tareas || [];
            // Filtrar solo las asignadas/en proceso
            const tareasAsignadas = todasLasTareas.filter(t => 
                ['ASIGNADA', 'EN_PROCESO', 'PENDIENTE_PAGO'].includes(t.estado)
            );

            if (tareasAsignadas.length > 0) {
                let tasksHTML = '';

                tareasAsignadas.forEach(tarea => {
                    const fecha = new Date(tarea.fecha_hora_requerida).toLocaleString('es-ES');
                    const estadoColor = {
                        'ASIGNADA': '#3b82f6',
                        'EN_PROCESO': '#8b5cf6',
                        'PENDIENTE_PAGO': '#f59e0b'
                    }[tarea.estado] || '#6b7280';
                    
                    const estadoTexto = {
                        'ASIGNADA': 'Tarea Asignada',
                        'EN_PROCESO': 'En Proceso',
                        'PENDIENTE_PAGO': 'Pendiente de Pago'
                    }[tarea.estado] || tarea.estado;

                    tasksHTML += `
                        <div class="task-item" onclick="openTaskModal(${JSON.stringify(tarea).replace(/"/g, '&quot;')})" style="cursor: pointer;">
                            <div class="task-header">
                                <h4>${tarea.descripcion ? tarea.descripcion.split(':')[0] : 'Sin título'}</h4>
                                <span class="task-status" style="background: ${estadoColor}">${estadoTexto}</span>
                            </div>
                            <div class="task-details">
                                <p><strong>Tipo:</strong> ${tarea.tipo_servicio}</p>
                                <p><strong>Dirección:</strong> ${tarea.ubicacion ? tarea.ubicacion.direccion : 'No especificada'}</p>
                                <p><strong>Fecha:</strong> ${fecha}</p>
                                <p><strong>Monto:</strong> $${tarea.monto_total_acordado || 0}</p>
                                ${tarea.tasker_id ? '<p><strong>Tasker asignado:</strong> ID ' + tarea.tasker_id + '</p>' : ''}
                            </div>
                            ${tarea.estado === 'PENDIENTE_PAGO' ? `
                                <div class="task-actions" onclick="event.stopPropagation();">
                                    <button class="confirm-payment-btn" onclick="event.stopPropagation(); confirmPayment(${tarea.id})">💳 Confirmar Pago</button>
                                </div>
                            ` : ''}
                            ${tarea.estado === 'FINALIZADA' ? `
                                <div class="task-actions" onclick="event.stopPropagation();">
                                    <button class="rate-task-btn" onclick="showRatingForm(${tarea.id})">⭐ Calificar</button>
                                </div>
                                <div id="rating-form-${tarea.id}" class="rating-form-container" style="display: none;"></div>
                            ` : ''}
                        </div>
                    `;
                });

                assignedTasksList.innerHTML = tasksHTML;
            } else {
                assignedTasksList.innerHTML = `
                    <div class="no-tasks-message">
                        <p>📋 No tienes tareas asignadas o en proceso.</p>
                    </div>
                `;
            }
        } else if (assignedTasksList) {
            assignedTasksList.innerHTML = `<p class="error">Error: ${data.message || 'Error al cargar tareas'}</p>`;
        }
    } catch (error) {
        console.error('Error cargando tareas asignadas:', error);
        const assignedTasksList = document.getElementById('assignedTasksList');
        if (assignedTasksList) {
            assignedTasksList.innerHTML = '<p class="error">Error al cargar tareas asignadas</p>';
        }
    }
}

// Función para cargar historial de tareas del cliente
async function loadClientHistoryTasks() {
    try {
        const response = await fetch(`${API_BASE}/task/my-tasks`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${currentToken}`
            }
        });

        const data = await response.json();
        const historyTasksList = document.getElementById('historyTasksList');

        if (response.ok && historyTasksList) {
            const todasLasTareas = data.tareas || [];
            // Mostrar TODAS las tareas (excepto las pendientes de asignar que están en otra pestaña)
            // Ordenar por fecha de creación (más recientes primero)
            const tareasHistorial = todasLasTareas
                .filter(t => t.estado !== 'PENDIENTE') // Excluir pendientes (están en otra pestaña)
                .sort((a, b) => {
                    const fechaA = new Date(a.createdAt || 0);
                    const fechaB = new Date(b.createdAt || 0);
                    return fechaB - fechaA; // Más recientes primero
                });

            if (tareasHistorial.length > 0) {
                let tasksHTML = '';

                tareasHistorial.forEach(tarea => {
                    const fecha = new Date(tarea.fecha_hora_requerida).toLocaleString('es-ES');
                    const estadoColor = {
                        'ASIGNADA': '#3b82f6',
                        'EN_PROCESO': '#8b5cf6',
                        'PENDIENTE_PAGO': '#f59e0b',
                        'FINALIZADA': '#10b981',
                        'CANCELADA': '#ef4444'
                    }[tarea.estado] || '#6b7280';
                    
                    const estadoTexto = {
                        'ASIGNADA': 'Tarea Asignada',
                        'EN_PROCESO': 'En Proceso',
                        'PENDIENTE_PAGO': 'Pendiente de Pago',
                        'FINALIZADA': 'Finalizada',
                        'CANCELADA': 'Cancelada'
                    }[tarea.estado] || tarea.estado;

                    const tareaJson = JSON.stringify(tarea).replace(/"/g, '&quot;');
                    tasksHTML += `
                        <div class="task-item" data-tarea='${tareaJson}' onclick="openTaskModalFromData(this)" style="cursor: pointer;">
                            <div class="task-header">
                                <h4>${tarea.descripcion ? tarea.descripcion.split(':')[0] : 'Sin título'}</h4>
                                <span class="task-status" style="background: ${estadoColor}">${estadoTexto}</span>
                            </div>
                            <div class="task-details">
                                <p><strong>Tipo:</strong> ${tarea.tipo_servicio}</p>
                                <p><strong>Dirección:</strong> ${tarea.ubicacion ? tarea.ubicacion.direccion : 'No especificada'}</p>
                                <p><strong>Fecha:</strong> ${fecha}</p>
                                <p><strong>Monto:</strong> $${tarea.monto_total_acordado || 0}</p>
                                ${tarea.tasker_id ? '<p><strong>Tasker asignado:</strong> ID ' + tarea.tasker_id + '</p>' : ''}
                            </div>
                            ${tarea.estado === 'PENDIENTE_PAGO' ? `
                                <div class="task-actions" onclick="event.stopPropagation();">
                                    <button class="confirm-payment-btn" onclick="event.stopPropagation(); confirmPayment(${tarea.id})">💳 Confirmar Pago</button>
                                </div>
                            ` : ''}
                            ${tarea.estado === 'FINALIZADA' ? `
                                <div class="task-actions" onclick="event.stopPropagation();">
                                    <button class="rate-task-btn" onclick="showRatingForm(${tarea.id})">⭐ Calificar</button>
                                </div>
                                <div id="rating-form-${tarea.id}" class="rating-form-container" style="display: none;"></div>
                            ` : ''}
                        </div>
                    `;
                });

                historyTasksList.innerHTML = tasksHTML;
            } else {
                historyTasksList.innerHTML = `
                    <div class="no-tasks-message">
                        <p>📜 Aún no tienes tareas en tu historial.</p>
                    </div>
                `;
            }
        } else if (historyTasksList) {
            historyTasksList.innerHTML = `<p class="error">Error: ${data.message || 'Error al cargar historial'}</p>`;
        }
    } catch (error) {
        console.error('Error cargando historial:', error);
        const historyTasksList = document.getElementById('historyTasksList');
        if (historyTasksList) {
            historyTasksList.innerHTML = '<p class="error">Error al cargar historial</p>';
        }
    }
}

// ========== FUNCIONES PARA PESTAÑAS DE TASKER ==========

// Función para cambiar entre pestañas del tasker
function showTaskerTab(tabName) {
    // Ocultar todas las pestañas
    document.querySelectorAll('.tasker-tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Desactivar todos los botones
    document.querySelectorAll('.tasker-tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Mostrar la pestaña seleccionada
    const tabContent = document.getElementById(`tasker-tab-${tabName}`);
    let tabBtnId = `tab-${tabName}`;
    if (tabName === 'assigned') {
        tabBtnId = 'tab-assigned-tasker';
    } else if (tabName === 'pending-payment') {
        tabBtnId = 'tab-pending-payment';
    } else if (tabName === 'history') {
        tabBtnId = 'tab-history-tasker';
    }
    const tabBtn = document.getElementById(tabBtnId);
    
    if (tabContent) {
        tabContent.classList.add('active');
    }
    if (tabBtn) {
        tabBtn.classList.add('active');
    }
    
    // Cargar datos según la pestaña
    if (tabName === 'assigned') {
        loadTaskerAssignedTasks();
    } else if (tabName === 'available') {
        loadAvailableTasks();
    } else if (tabName === 'pending-payment') {
        loadTaskerPendingPaymentTasks();
    } else if (tabName === 'history') {
        loadTaskerHistoryTasks();
    }
}

// Función para cargar tareas asignadas del tasker
async function loadTaskerAssignedTasks() {
    try {
        if (!currentToken) {
            showMessage('❌ Debes iniciar sesión primero', 'error');
            return;
        }

        const response = await fetch(`${API_BASE}/task/my-assigned-tasks`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${currentToken}`
            }
        });

        const data = await response.json();
        const taskerAssignedTasksList = document.getElementById('taskerAssignedTasksList');

        if (response.ok && taskerAssignedTasksList) {
            const tareas = data.tareas || [];

            if (tareas.length > 0) {
                let tasksHTML = '';

                tareas.forEach(tarea => {
                    const fecha = new Date(tarea.fecha_hora_requerida).toLocaleString('es-ES');
                    const estadoColor = {
                        'ASIGNADA': '#3b82f6',
                        'EN_PROCESO': '#8b5cf6',
                        'PENDIENTE_PAGO': '#f59e0b'
                    }[tarea.estado] || '#6b7280';
                    
                    const estadoTexto = {
                        'ASIGNADA': 'Tarea Asignada',
                        'EN_PROCESO': 'En Proceso',
                        'PENDIENTE_PAGO': 'Pendiente de Pago'
                    }[tarea.estado] || tarea.estado;

                    const nombreCliente = tarea.cliente && tarea.cliente.nombre ? 
                        `${tarea.cliente.nombre} ${tarea.cliente.apellido || ''}` : 'Cliente';

                    tasksHTML += `
                        <div class="task-item" onclick="openTaskModal(${JSON.stringify(tarea).replace(/"/g, '&quot;')})" style="cursor: pointer;">
                            <div class="task-header">
                                <h4>${tarea.descripcion ? tarea.descripcion.split(':')[0] : 'Sin título'}</h4>
                                <span class="task-status" style="background: ${estadoColor}">${estadoTexto}</span>
                            </div>
                            <div class="task-details">
                                <p><strong>Cliente:</strong> ${nombreCliente}</p>
                                <p><strong>Tipo:</strong> ${tarea.tipo_servicio}</p>
                                <p><strong>Dirección:</strong> ${tarea.ubicacion ? tarea.ubicacion.direccion : 'No especificada'}</p>
                                <p><strong>Fecha:</strong> ${fecha}</p>
                                <p><strong>Monto:</strong> $${tarea.monto_total_acordado || 0}</p>
                            </div>
                            ${tarea.estado === 'ASIGNADA' ? `
                                <div class="task-actions" onclick="event.stopPropagation();">
                                    <button class="start-task-btn" onclick="startTask(${tarea.id})">▶️ Empezar Tarea</button>
                                </div>
                            ` : ''}
                            ${tarea.estado === 'EN_PROCESO' ? `
                                <div class="task-actions" onclick="event.stopPropagation();">
                                    <button class="complete-task-btn" onclick="event.stopPropagation(); completeTask(${tarea.id})">✅ Finalizar Tarea</button>
                                </div>
                            ` : ''}
                        </div>
                    `;
                });

                taskerAssignedTasksList.innerHTML = tasksHTML;
            } else {
                taskerAssignedTasksList.innerHTML = `
                    <div class="no-tasks-message">
                        <p>📋 No tienes tareas asignadas.</p>
                        <p>Ve a "Tareas Disponibles" para aplicar a nuevas tareas.</p>
                    </div>
                `;
            }
        } else if (taskerAssignedTasksList) {
            taskerAssignedTasksList.innerHTML = `<p class="error">Error: ${data.message || 'Error al cargar tareas asignadas'}</p>`;
        }
    } catch (error) {
        console.error('Error cargando tareas asignadas del tasker:', error);
        const taskerAssignedTasksList = document.getElementById('taskerAssignedTasksList');
        if (taskerAssignedTasksList) {
            taskerAssignedTasksList.innerHTML = '<p class="error">Error al cargar tareas asignadas</p>';
        }
    }
}

// Función para que tasker marque tarea como "en proceso"
async function startTask(taskId) {
    if (!confirm('¿Estás seguro de que quieres empezar esta tarea? La tarea pasará a estado "En Proceso".')) {
        return;
    }

    try {
        if (!currentToken) {
            showMessage('❌ Debes iniciar sesión primero', 'error');
            return;
        }

        const response = await fetch(`${API_BASE}/task/start/${taskId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentToken}`
            }
        });

        const data = await response.json();

        if (response.ok) {
            showMessage('✅ ¡Tarea marcada como en proceso!', 'success');
            
            // Recargar las tareas asignadas
            setTimeout(() => {
                loadTaskerAssignedTasks();
            }, 1000);
        } else {
            showMessage(`❌ Error: ${data.message || 'Error al empezar tarea'}`, 'error');
        }
    } catch (error) {
        console.error('Error empezando tarea:', error);
        showMessage('❌ Error de conexión al empezar tarea', 'error');
    }
}

// Función para que tasker finalice la tarea
async function completeTask(taskId) {
    if (!confirm('¿Estás seguro de que terminaste el trabajo? La tarea pasará a estado "Pendiente de Pago" y esperará la confirmación del cliente.')) {
        return;
    }

    try {
        if (!currentToken) {
            showMessage('❌ Debes iniciar sesión primero', 'error');
            return;
        }

        const response = await fetch(`${API_BASE}/task/complete/${taskId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentToken}`
            }
        });

        const data = await response.json();

        if (response.ok) {
            showMessage('✅ ¡Tarea finalizada! Esperando confirmación del cliente.', 'success');
            
            // Recargar las tareas asignadas
            setTimeout(() => {
                loadTaskerAssignedTasks();
            }, 1000);
        } else {
            showMessage(`❌ Error: ${data.message || 'Error al finalizar tarea'}`, 'error');
        }
    } catch (error) {
        console.error('Error finalizando tarea:', error);
        showMessage('❌ Error de conexión al finalizar tarea', 'error');
    }
}

// Función para que cliente confirme el pago
async function confirmPayment(taskId) {
    if (!confirm('¿Estás conforme con el trabajo realizado? Al confirmar, el pago se liberará y la tarea se finalizará.')) {
        return;
    }

    try {
        if (!currentToken) {
            showMessage('❌ Debes iniciar sesión primero', 'error');
            return;
        }

        const response = await fetch(`${API_BASE}/task/confirm-payment/${taskId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentToken}`
            }
        });

        const data = await response.json();

        if (response.ok) {
            showMessage('✅ ¡Pago confirmado! La tarea ha sido finalizada. Ahora puedes calificar al tasker.', 'success');
            
            // Recargar las tareas
            setTimeout(() => {
                loadClientAssignedTasks();
                loadClientHistoryTasks();
            }, 1000);
        } else {
            showMessage(`❌ Error: ${data.message || 'Error al confirmar pago'}`, 'error');
        }
    } catch (error) {
        console.error('Error confirmando pago:', error);
        showMessage('❌ Error de conexión al confirmar pago', 'error');
    }
}

// Función para que tasker confirme que recibió el pago
async function confirmPaymentReceived(taskId) {
    if (!confirm('¿Confirmas que recibiste el pago por esta tarea?')) {
        return;
    }

    try {
        if (!currentToken) {
            showMessage('❌ Debes iniciar sesión primero', 'error');
            return;
        }

        const response = await fetch(`${API_BASE}/task/confirm-payment-received/${taskId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentToken}`
            }
        });

        const data = await response.json();

        if (response.ok) {
            showMessage('✅ ¡Recepción de pago confirmada!', 'success');
            
            // Recargar las tareas
            setTimeout(() => {
                loadTaskerHistoryTasks();
                loadTaskerPendingPaymentTasks();
            }, 1000);
        } else {
            showMessage(`❌ Error: ${data.message || 'Error al confirmar recepción de pago'}`, 'error');
        }
    } catch (error) {
        console.error('Error confirmando recepción de pago:', error);
        showMessage('❌ Error de conexión al confirmar recepción de pago', 'error');
    }
}

// ========== FUNCIONES PARA MODAL DE TAREA ==========

// Función auxiliar para escapar HTML de forma segura
function escapeHtml(text) {
    if (!text) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Función para cargar tareas pendientes de pago del tasker
async function loadTaskerPendingPaymentTasks() {
    try {
        if (!currentToken) {
            showMessage('❌ Debes iniciar sesión primero', 'error');
            return;
        }

        const response = await fetch(`${API_BASE}/task/my-assigned-tasks`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${currentToken}`
            }
        });

        const data = await response.json();
        const taskerPendingPaymentList = document.getElementById('taskerPendingPaymentList');

        if (response.ok && taskerPendingPaymentList) {
            const todasLasTareas = data.tareas || [];
            // Filtrar solo las pendientes de pago
            const tareasPendientes = todasLasTareas.filter(t => t.estado === 'PENDIENTE_PAGO');

            if (tareasPendientes.length > 0) {
                let tasksHTML = '';

                tareasPendientes.forEach(tarea => {
                    const fecha = new Date(tarea.fecha_hora_requerida).toLocaleString('es-ES');
                    const fechaFinalizacion = tarea.fecha_finalizacion_trabajo ? 
                        new Date(tarea.fecha_finalizacion_trabajo).toLocaleString('es-ES') : 'N/A';
                    
                    const nombreCliente = tarea.cliente && tarea.cliente.nombre ? 
                        `${tarea.cliente.nombre} ${tarea.cliente.apellido || ''}` : 'Cliente';

                    // Calcular tiempo transcurrido desde la finalización
                    let tiempoEspera = '';
                    if (tarea.fecha_finalizacion_trabajo) {
                        const ahora = new Date();
                        const fechaFin = new Date(tarea.fecha_finalizacion_trabajo);
                        const horasTranscurridas = Math.round((ahora - fechaFin) / (60 * 60 * 1000));
                        tiempoEspera = horasTranscurridas < 48 ? 
                            `<p><strong>⏰ Tiempo de espera:</strong> ${horasTranscurridas} horas (auto-confirmación en ${48 - horasTranscurridas} horas)</p>` :
                            '<p><strong>⏰ Estado:</strong> Lista para auto-confirmación</p>';
                    }

                    const tareaJson = JSON.stringify(tarea).replace(/"/g, '&quot;');
                    tasksHTML += `
                        <div class="task-item" data-tarea='${tareaJson}' onclick="openTaskModalFromData(this)" style="cursor: pointer;">
                            <div class="task-header">
                                <h4>${tarea.descripcion ? tarea.descripcion.split(':')[0] : 'Sin título'}</h4>
                                <span class="task-status" style="background: #f59e0b">Pendiente de Pago</span>
                            </div>
                            <div class="task-details">
                                <p><strong>Cliente:</strong> ${nombreCliente}</p>
                                <p><strong>Tipo:</strong> ${tarea.tipo_servicio}</p>
                                <p><strong>Dirección:</strong> ${tarea.ubicacion ? tarea.ubicacion.direccion : 'No especificada'}</p>
                                <p><strong>Fecha:</strong> ${fecha}</p>
                                <p><strong>Monto:</strong> $${tarea.monto_total_acordado || 0}</p>
                                <p><strong>Finalizada el:</strong> ${fechaFinalizacion}</p>
                                ${tiempoEspera}
                            </div>
                            <div class="task-actions" onclick="event.stopPropagation();">
                                <p class="payment-info">💳 Esperando confirmación del cliente. El pago se liberará automáticamente después de 48 horas si el cliente no responde.</p>
                            </div>
                        </div>
                    `;
                });

                taskerPendingPaymentList.innerHTML = tasksHTML;
            } else {
                taskerPendingPaymentList.innerHTML = `
                    <div class="no-tasks-message">
                        <p>💳 No tienes tareas pendientes de pago.</p>
                    </div>
                `;
            }
        } else if (taskerPendingPaymentList) {
            taskerPendingPaymentList.innerHTML = `<p class="error">Error: ${data.message || 'Error al cargar tareas pendientes de pago'}</p>`;
        }
    } catch (error) {
        console.error('Error cargando tareas pendientes de pago del tasker:', error);
        const taskerPendingPaymentList = document.getElementById('taskerPendingPaymentList');
        if (taskerPendingPaymentList) {
            taskerPendingPaymentList.innerHTML = '<p class="error">Error al cargar tareas pendientes de pago</p>';
        }
    }
}

// Función para cargar historial del tasker
async function loadTaskerHistoryTasks() {
    try {
        if (!currentToken) {
            showMessage('❌ Debes iniciar sesión primero', 'error');
            return;
        }

        const response = await fetch(`${API_BASE}/task/my-assigned-tasks`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${currentToken}`
            }
        });

        const data = await response.json();
        const taskerHistoryList = document.getElementById('taskerHistoryList');

        if (response.ok && taskerHistoryList) {
            const todasLasTareas = data.tareas || [];
            // Mostrar TODAS las tareas del tasker (ordenadas por fecha, más recientes primero)
            const tareasHistorial = todasLasTareas.sort((a, b) => {
                const fechaA = new Date(a.createdAt || 0);
                const fechaB = new Date(b.createdAt || 0);
                return fechaB - fechaA; // Más recientes primero
            });

            if (tareasHistorial.length > 0) {
                let tasksHTML = '';

                tareasHistorial.forEach(tarea => {
                    const fecha = new Date(tarea.fecha_hora_requerida).toLocaleString('es-ES');
                    const fechaFinalizacion = tarea.fecha_confirmacion_pago ? 
                        new Date(tarea.fecha_confirmacion_pago).toLocaleString('es-ES') : 'N/A';
                    
                    const nombreCliente = tarea.cliente && tarea.cliente.nombre ? 
                        `${tarea.cliente.nombre} ${tarea.cliente.apellido || ''}` : 'Cliente';

                    const estadoColor = {
                        'ASIGNADA': '#3b82f6',
                        'EN_PROCESO': '#8b5cf6',
                        'PENDIENTE_PAGO': '#f59e0b',
                        'FINALIZADA': '#10b981',
                        'CANCELADA': '#ef4444'
                    }[tarea.estado] || '#6b7280';
                    
                    const estadoTexto = {
                        'ASIGNADA': 'Tarea Asignada',
                        'EN_PROCESO': 'En Proceso',
                        'PENDIENTE_PAGO': 'Pendiente de Pago',
                        'FINALIZADA': 'Finalizada',
                        'CANCELADA': 'Cancelada'
                    }[tarea.estado] || tarea.estado;

                    const tareaJson = JSON.stringify(tarea).replace(/"/g, '&quot;');
                    tasksHTML += `
                        <div class="task-item" data-tarea='${tareaJson}' onclick="openTaskModalFromData(this)" style="cursor: pointer;">
                            <div class="task-header">
                                <h4>${tarea.descripcion ? tarea.descripcion.split(':')[0] : 'Sin título'}</h4>
                                <span class="task-status" style="background: ${estadoColor}">${estadoTexto}</span>
                            </div>
                            <div class="task-details">
                                <p><strong>Cliente:</strong> ${nombreCliente}</p>
                                <p><strong>Tipo:</strong> ${tarea.tipo_servicio}</p>
                                <p><strong>Dirección:</strong> ${tarea.ubicacion ? tarea.ubicacion.direccion : 'No especificada'}</p>
                                <p><strong>Fecha:</strong> ${fecha}</p>
                                <p><strong>Monto:</strong> $${tarea.monto_total_acordado || 0}</p>
                                ${tarea.estado === 'FINALIZADA' ? `<p><strong>Finalizada el:</strong> ${fechaFinalizacion}</p>` : ''}
                                ${tarea.auto_confirmado ? '<p><strong>ℹ️ Auto-confirmada</strong> (pasaron más de 48 horas)</p>' : ''}
                                ${tarea.pago_recibido_tasker ? '<p><strong>✅ Pago recibido y confirmado</strong></p>' : ''}
                            </div>
                            ${tarea.estado === 'FINALIZADA' && !tarea.pago_recibido_tasker ? `
                                <div class="task-actions" onclick="event.stopPropagation();">
                                    <button class="confirm-payment-received-btn" onclick="event.stopPropagation(); confirmPaymentReceived(${tarea.id})">✅ Confirmar Recepción de Pago</button>
                                </div>
                            ` : ''}
                            ${tarea.estado === 'FINALIZADA' ? `
                                <div class="task-actions" onclick="event.stopPropagation();">
                                    <button class="rate-task-btn" onclick="showRatingForm(${tarea.id})">⭐ Calificar</button>
                                </div>
                                <div id="rating-form-${tarea.id}" class="rating-form-container" style="display: none;"></div>
                            ` : ''}
                        </div>
                    `;
                });

                taskerHistoryList.innerHTML = tasksHTML;
            } else {
                taskerHistoryList.innerHTML = `
                    <div class="no-tasks-message">
                        <p>📜 Aún no tienes tareas en tu historial.</p>
                        <p>Las tareas aparecerán aquí una vez que sean asignadas.</p>
                    </div>
                `;
            }
        } else if (taskerHistoryList) {
            taskerHistoryList.innerHTML = `<p class="error">Error: ${data.message || 'Error al cargar historial'}</p>`;
        }
    } catch (error) {
        console.error('Error cargando historial del tasker:', error);
        const taskerHistoryList = document.getElementById('taskerHistoryList');
        if (taskerHistoryList) {
            taskerHistoryList.innerHTML = '<p class="error">Error al cargar historial</p>';
        }
    }
}

// Función auxiliar para abrir modal desde atributo data (usado en onclick)
function openTaskModalFromData(element) {
    try {
        const tareaJson = element.getAttribute('data-tarea');
        if (!tareaJson) {
            console.error('No se encontró data-tarea en el elemento');
            return;
        }
        // Reemplazar &quot; de vuelta a comillas
        const tareaJsonFixed = tareaJson.replace(/&quot;/g, '"');
        const tarea = JSON.parse(tareaJsonFixed);
        openTaskModal(tarea);
    } catch (e) {
        console.error('Error parseando tarea desde data:', e);
        showMessage('❌ Error al cargar detalles de la tarea', 'error');
    }
}

// Función para abrir el modal con los detalles de la tarea
function openTaskModal(tarea) {
    const modal = document.getElementById('taskModal');
    const modalContent = document.getElementById('taskModalContent');
    
    if (!modal || !modalContent) {
        console.error('Modal no encontrado');
        return;
    }

    const fecha = new Date(tarea.fecha_hora_requerida).toLocaleString('es-ES');
    const estadoColor = {
        'PENDIENTE': '#f59e0b',
        'ASIGNADA': '#3b82f6',
        'EN_PROCESO': '#8b5cf6',
        'PENDIENTE_PAGO': '#f59e0b',
        'FINALIZADA': '#10b981',
        'CANCELADA': '#ef4444'
    }[tarea.estado] || '#6b7280';
    
    const estadoTexto = {
        'PENDIENTE': 'Pendiente',
        'ASIGNADA': 'Tarea Asignada',
        'EN_PROCESO': 'En Proceso',
        'PENDIENTE_PAGO': 'Pendiente de Pago',
        'FINALIZADA': 'Finalizada',
        'CANCELADA': 'Cancelada'
    }[tarea.estado] || tarea.estado;

    // Construir el HTML del modal (escapar HTML para seguridad)
    const titulo = escapeHtml(tarea.descripcion ? tarea.descripcion.split(':')[0] : 'Detalles de la Tarea');
    const descripcion = escapeHtml(tarea.descripcion || 'Sin descripción disponible');
    
    let modalHTML = `
        <div class="task-modal-header">
            <h2>${titulo}</h2>
            <span class="task-modal-status" style="background: ${estadoColor}">${estadoTexto}</span>
        </div>

        <div class="task-modal-section">
            <h3>📝 Descripción Completa</h3>
            <div class="task-modal-description">${descripcion}</div>
        </div>

        <div class="task-modal-section">
            <h3>ℹ️ Información General</h3>
            <p><strong>Tipo de Servicio:</strong> ${escapeHtml(tarea.tipo_servicio || 'No especificado')}</p>
            <p><strong>Fecha y Hora Requerida:</strong> ${fecha}</p>
            <p><strong>Monto Total:</strong> $${tarea.monto_total_acordado || 0}</p>
            ${tarea.requiere_licencia !== undefined ? `<p><strong>Requiere Licencia:</strong> ${tarea.requiere_licencia ? 'Sí' : 'No'}</p>` : ''}
        </div>

        <div class="task-modal-section">
            <h3>📍 Ubicación</h3>
            ${tarea.ubicacion ? `
                <p><strong>Dirección:</strong> ${escapeHtml(tarea.ubicacion.direccion || 'No especificada')}</p>
                ${tarea.ubicacion.ciudad ? `<p><strong>Ciudad:</strong> ${escapeHtml(tarea.ubicacion.ciudad)}</p>` : ''}
                ${tarea.ubicacion.provincia ? `<p><strong>Provincia:</strong> ${escapeHtml(tarea.ubicacion.provincia)}</p>` : ''}
                ${tarea.ubicacion.codigo_postal ? `<p><strong>Código Postal:</strong> ${escapeHtml(tarea.ubicacion.codigo_postal)}</p>` : ''}
            ` : '<p>No se especificó ubicación</p>'}
        </div>
    `;

    // Agregar información adicional según el contexto
    if (tarea.cliente) {
        const nombreCliente = escapeHtml((tarea.cliente.nombre || '') + ' ' + (tarea.cliente.apellido || ''));
        const telefonoCliente = tarea.cliente.telefono ? escapeHtml(tarea.cliente.telefono) : '';
        modalHTML += `
            <div class="task-modal-section">
                <h3>👤 Cliente</h3>
                <p><strong>Nombre:</strong> ${nombreCliente}</p>
                ${telefonoCliente ? `<p><strong>Teléfono:</strong> ${telefonoCliente}</p>` : ''}
            </div>
        `;
    }

    if (tarea.tasker_id) {
        modalHTML += `
            <div class="task-modal-section">
                <h3>🔧 Tasker Asignado</h3>
                <p><strong>ID:</strong> ${tarea.tasker_id}</p>
            </div>
        `;
    }

    if (tarea.fecha_inicio_trabajo) {
        const fechaInicio = new Date(tarea.fecha_inicio_trabajo).toLocaleString('es-ES');
        modalHTML += `
            <div class="task-modal-section">
                <h3>⏰ Fechas Importantes</h3>
                <p><strong>Fecha de Inicio:</strong> ${fechaInicio}</p>
            </div>
        `;
    }

    if (tarea.createdAt) {
        const fechaCreacion = new Date(tarea.createdAt).toLocaleString('es-ES');
        modalHTML += `
            <div class="task-modal-section">
                <p><strong>Fecha de Creación:</strong> ${fechaCreacion}</p>
            </div>
        `;
    }

    modalContent.innerHTML = modalHTML;
    modal.style.display = 'block';
    
    // Prevenir scroll del body cuando el modal está abierto
    document.body.style.overflow = 'hidden';
}

// Función para cerrar el modal
function closeTaskModal() {
    const modal = document.getElementById('taskModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Cerrar modal al hacer clic fuera de él
window.onclick = function(event) {
    const modal = document.getElementById('taskModal');
    if (event.target === modal) {
        closeTaskModal();
    }
}

// Función para cargar tareas disponibles (taskers)
async function loadAvailableTasks(filtros = {}) {
    try {
        if (!currentToken) {
            showMessage('❌ Debes iniciar sesión primero', 'error');
            return;
        }

        // Construir query string con filtros
        const queryParams = new URLSearchParams();

        if (filtros.tipo_servicio) queryParams.append('tipo_servicio', filtros.tipo_servicio);
        if (filtros.precio_min) queryParams.append('precio_min', filtros.precio_min);
        if (filtros.precio_max) queryParams.append('precio_max', filtros.precio_max);
        if (filtros.ciudad) queryParams.append('ciudad', filtros.ciudad);
        if (filtros.requiere_licencia !== undefined) queryParams.append('requiere_licencia', filtros.requiere_licencia);
        if (filtros.fecha_desde) queryParams.append('fecha_desde', filtros.fecha_desde);
        if (filtros.fecha_hasta) queryParams.append('fecha_hasta', filtros.fecha_hasta);
        if (filtros.pagina) queryParams.append('pagina', filtros.pagina);
        if (filtros.limite) queryParams.append('limite', filtros.limite);

        const url = `${API_BASE}/task/available${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${currentToken}`
            }
        });

        const data = await response.json();

        const availableTasksList = document.getElementById('availableTasksList');
        const resultsCount = document.getElementById('resultsCount');

        if (response.ok) {
            const tareas = data.tareas;
            const paginacion = data.paginacion;
            const filtrosAplicados = data.filtrosAplicados;

            // Actualizar contador de resultados
            if (resultsCount) {
                resultsCount.textContent = `${paginacion.totalTareas} tareas encontradas`;
            }

            if (tareas && tareas.length > 0) {
                let tasksHTML = '';

                tareas.forEach(tarea => {
                    const fecha = new Date(tarea.fecha_hora_requerida).toLocaleString('es-ES');
                    const tipoServicio = tarea.tipo_servicio === 'EXPRESS' ? '⚡ Express' : '🎯 Especialista';
                    
                    // Verificar que el cliente existe antes de acceder a sus propiedades
                    const nombreCliente = tarea.cliente && tarea.cliente.nombre ? tarea.cliente.nombre : 'N/A';
                    const apellidoCliente = tarea.cliente && tarea.cliente.apellido ? tarea.cliente.apellido : '';
                    const direccion = tarea.ubicacion && tarea.ubicacion.direccion ? tarea.ubicacion.direccion : 'No especificada';

                    const tareaJson = JSON.stringify(tarea).replace(/"/g, '&quot;');
                    tasksHTML += `
                        <div class="task-item" data-tarea='${tareaJson}' onclick="openTaskModalFromData(this)" style="cursor: pointer;">
                            <div class="task-header">
                                <h4>${tarea.descripcion ? tarea.descripcion.split(':')[0] : 'Sin título'}</h4>
                                <span class="task-type">${tipoServicio}</span>
                            </div>
                            <div class="task-details">
                                <p><strong>Cliente:</strong> ${nombreCliente} ${apellidoCliente}</p>
                                <p><strong>Dirección:</strong> ${direccion}</p>
                                <p><strong>Fecha:</strong> ${fecha}</p>
                                <p><strong>Monto:</strong> $${tarea.monto_total_acordado || 0}</p>
                                ${tarea.requiere_licencia ? '<p><strong>⚠️ Requiere licencia de conducir</strong></p>' : ''}
                            </div>
                            <div class="task-actions" onclick="event.stopPropagation();">
                                ${tarea.ya_aplico ? 
                                    '<span class="already-applied">✅ Ya aplicaste a esta tarea</span>' : 
                                    `<button class="accept-btn" onclick="applyToTask(${tarea.id})">📝 Aplicar a Tarea</button>`
                                }
                            </div>
                        </div>
                    `;
                });

                availableTasksList.innerHTML = tasksHTML;
            } else {
                availableTasksList.innerHTML = `
                    <div class="no-tasks-message">
                        <p>📋 No hay tareas disponibles en este momento.</p>
                        <p>¡Vuelve más tarde para ver nuevas oportunidades!</p>
                    </div>
                `;
            }
        } else {
            availableTasksList.innerHTML = `<p class="error">Error al cargar tareas disponibles: ${data.message}</p>`;
        }
    } catch (error) {
        console.error('Error cargando tareas disponibles:', error);
        document.getElementById('availableTasksList').innerHTML = `<p class="error">Error al cargar tareas disponibles: ${error.message}</p>`;
    }
}

// FUNCIONES PARA FILTROS DE BÚSQUEDA

// Función para obtener los valores de los filtros
function getFilterValues() {
    return {
        tipo_servicio: document.getElementById('filterTipoServicio')?.value || '',
        precio_min: document.getElementById('filterPrecioMin')?.value || '',
        precio_max: document.getElementById('filterPrecioMax')?.value || '',
        ciudad: document.getElementById('filterCiudad')?.value || '',
        requiere_licencia: document.getElementById('filterLicencia')?.value || '',
        fecha_desde: document.getElementById('filterFechaDesde')?.value || '',
        fecha_hasta: document.getElementById('filterFechaHasta')?.value || '',
        pagina: 1, // Reset a página 1 cuando se aplican filtros
        limite: 10
    };
}

// Función para aplicar filtros
function applyFilters() {
    const filtros = getFilterValues();
    loadAvailableTasks(filtros);
}

// Función para limpiar filtros
function clearFilters() {
    // Limpiar todos los campos de filtro
    document.getElementById('filterTipoServicio').value = '';
    document.getElementById('filterPrecioMin').value = '';
    document.getElementById('filterPrecioMax').value = '';
    document.getElementById('filterCiudad').value = '';
    document.getElementById('filterLicencia').value = '';
    document.getElementById('filterFechaDesde').value = '';
    document.getElementById('filterFechaHasta').value = '';

    // Recargar tareas sin filtros
    loadAvailableTasks();
}

// Función para inicializar event listeners de filtros
function initializeFilters() {
    const applyBtn = document.getElementById('applyFilters');
    const clearBtn = document.getElementById('clearFilters');

    if (applyBtn) {
        applyBtn.addEventListener('click', applyFilters);
    }

    if (clearBtn) {
        clearBtn.addEventListener('click', clearFilters);
    }

    // Agregar funcionalidad de Enter en inputs para aplicar filtros
    const filterInputs = [
        'filterPrecioMin', 'filterPrecioMax', 'filterCiudad',
        'filterFechaDesde', 'filterFechaHasta'
    ];

    filterInputs.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    applyFilters();
                }
            });
        }
    });
}

// ==================== FUNCIONALIDAD DEL TASK WIZARD ====================

let currentWizardStep = 1;
let selectedServiceType = null;

// Función para inicializar el wizard
function initializeWizard() {
    console.log('🎯 INICIANDO initializeWizard...');

    // Verificar que las cards existen
    const serviceCards = document.querySelectorAll('.service-card');
    console.log('📋 Cards encontradas:', serviceCards.length);

    if (serviceCards.length === 0) {
        console.log('❌ No hay cards aún, reintentando en 500ms...');
        setTimeout(initializeWizard, 500);
        return;
    }

    // Event listeners para las cards de servicio
    serviceCards.forEach((card, index) => {
        console.log(`🎴 Configurando event listener para card ${index + 1}: ${card.dataset.service}`);

        // Remover event listeners existentes para evitar duplicados
        if (card._clickHandler) {
            card.removeEventListener('click', card._clickHandler);
        }

        // Crear nuevo handler para la card completa
        card._clickHandler = function(e) {
            // Si el click fue en el botón, no hacer nada (el botón tiene su propio handler)
            if (e.target.closest('.select-service-btn')) {
                return;
            }
            console.log('🖱️ Click en card:', this.dataset.service);
            const serviceType = this.dataset.service;
            if (serviceType) {
                selectServiceType(serviceType);
            }
        };

        // Agregar event listener a la card
        card.addEventListener('click', card._clickHandler);
    });

    // Event listeners para los botones específicos
    const selectButtons = document.querySelectorAll('.select-service-btn');
    console.log('🔘 Botones de selección encontrados:', selectButtons.length);

    selectButtons.forEach((button, index) => {
        console.log(`🎮 Configurando botón ${index + 1}: ${button.dataset.service}`);

        if (button._clickHandler) {
            button.removeEventListener('click', button._clickHandler);
        }

        button._clickHandler = function(e) {
            console.log('🖱️ CLICK DETECTADO en botón:', this.dataset.service);
            e.preventDefault();
            e.stopPropagation();
            const serviceType = this.dataset.service || this.closest('.service-card')?.dataset.service;
            console.log('🎯 ServiceType a seleccionar:', serviceType);
            if (serviceType) {
                selectServiceType(serviceType);
            }
        };

        button.addEventListener('click', button._clickHandler);
    });

    // Event listeners para navegación
    const nextBtn = document.getElementById('nextStep');
    const prevBtn = document.getElementById('prevStep');

    console.log('🎮 Configurando botones de navegación...');
    console.log('  - Next button existe:', !!nextBtn);
    console.log('  - Prev button existe:', !!prevBtn);

    if (nextBtn && !nextBtn._clickHandler) {
        nextBtn._clickHandler = function() {
            console.log('▶️ Click en SIGUIENTE');
            nextWizardStep();
        };
        nextBtn.addEventListener('click', nextBtn._clickHandler);
        console.log('  ✅ Next button configurado');
    }

    if (prevBtn && !prevBtn._clickHandler) {
        prevBtn._clickHandler = function() {
            console.log('◀️ Click en ANTERIOR');
            prevWizardStep();
        };
        prevBtn.addEventListener('click', prevBtn._clickHandler);
        console.log('  ✅ Prev button configurado');
    }

    console.log('🎉 WIZARD INICIALIZADO COMPLETAMENTE');
    console.log('✅ Listo para usar - prueba hacer click en las cards o botones');

    console.log('🎉 WIZARD INICIALIZADO COMPLETAMENTE');

    // Event listeners para navegación
    document.getElementById('nextStep').addEventListener('click', nextWizardStep);
    document.getElementById('prevStep').addEventListener('click', prevWizardStep);

    // Event listener para el cálculo de presupuesto
    const presupuestoInput = document.getElementById('taskPresupuesto');
    if (presupuestoInput) {
        // Remover listener anterior si existe
        if (presupuestoInput._inputHandler) {
            presupuestoInput.removeEventListener('input', presupuestoInput._inputHandler);
        }
        presupuestoInput._inputHandler = updateBudgetCalculation;
        presupuestoInput.addEventListener('input', presupuestoInput._inputHandler);
        updateBudgetCalculation(); // Calcular inicialmente
    }

    // Inicializar validación en tiempo real
    initializeRealTimeValidation();

    // Event listener para categorías dinámicas
    if (selectedServiceType) {
        updateServiceCategories(selectedServiceType);
    }
    
    // Agregar listeners para actualizar vista previa cuando cambian los campos
    const camposPreview = ['taskTitulo', 'taskDescripcion', 'taskDireccion', 'taskFecha', 'taskCategoria', 'taskPresupuesto'];
    camposPreview.forEach(campoId => {
        const campo = document.getElementById(campoId);
        if (campo) {
            // Remover listener anterior si existe
            if (campo._previewHandler) {
                campo.removeEventListener('input', campo._previewHandler);
                campo.removeEventListener('change', campo._previewHandler);
            }
            campo._previewHandler = () => {
                if (currentWizardStep === 4) {
                    updateTaskPreview();
                }
            };
            campo.addEventListener('input', campo._previewHandler);
            campo.addEventListener('change', campo._previewHandler);
        }
    });
}

// Función para seleccionar tipo de servicio
function selectServiceType(serviceType) {
    console.log('🎯 selectServiceType llamado con:', serviceType);
    console.log('📋 selectedServiceType antes:', selectedServiceType);

    // Permitir cambiar la selección incluso si ya había una
    selectedServiceType = serviceType;

    console.log('✅ selectedServiceType después:', selectedServiceType);

    // Actualizar UI de selección
    console.log('🎨 Actualizando UI para serviceType:', serviceType);

    // Limpiar todas las selecciones
    document.querySelectorAll('.service-card').forEach(card => {
        card.classList.remove('selected');
    });

    // Seleccionar la card correspondiente
    const selectedCard = document.querySelector(`[data-service="${serviceType}"]`);
    console.log('🎯 Card encontrada para selección:', !!selectedCard);

    if (selectedCard) {
        selectedCard.classList.add('selected');
        console.log('✅ Clase "selected" agregada a card:', serviceType);
    } else {
        console.log('❌ ¡No se encontró la card para serviceType:', serviceType, '!');
    }

    // Actualizar categorías disponibles (solo si estamos en el paso 2 o avanzamos)
    if (currentWizardStep >= 2) {
        updateServiceCategories(serviceType);
    }

    // Mostrar feedback visual
    showMessage(`✅ ¡Servicio ${serviceType === 'EXPRESS' ? 'Express' : 'Especialista'} seleccionado!`, 'success');

    // Actualizar el título del wizard para mostrar selección
    updateWizardUI();

    // Guardar en formulario oculto
    const tipoServicioInput = document.getElementById('taskTipoServicio');
    if (tipoServicioInput) {
        tipoServicioInput.value = serviceType;
    }
}

// Función para actualizar categorías según el tipo de servicio
function updateServiceCategories(serviceType) {
    const categoriaSelect = document.getElementById('taskCategoria');

    // Limpiar opciones existentes excepto la primera
    while (categoriaSelect.options.length > 1) {
        categoriaSelect.remove(1);
    }

    // Agregar categorías según el tipo
    const categorias = serviceType === 'EXPRESS' ? {
        'plomeria': '🔧 Plomería',
        'electricidad': '⚡ Electricidad',
        'jardineria': '🌱 Jardinería',
        'otros': '🔧 Reparaciones menores'
    } : {
        'carpinteria': '🔨 Carpintería',
        'pintura': '🎨 Pintura y decoración',
        'reformas': '🏠 Reformas',
        'instalaciones': '🛠️ Instalaciones'
    };

    Object.entries(categorias).forEach(([value, text]) => {
        const option = new Option(text, value);
        categoriaSelect.add(option);
    });
}

// Función para ir al siguiente paso
function nextWizardStep() {
    console.log('🖱️ CLICK EN SIGUIENTE - Paso actual:', currentWizardStep);
    console.log('📋 selectedServiceType:', selectedServiceType);
    console.log('🔍 Estado actual del DOM:');
    console.log('  - Cards con selected:', document.querySelectorAll('.service-card.selected').length);
    document.querySelectorAll('.service-card.selected').forEach(card => {
        console.log('    * Card selected:', card.dataset.service);
    });

    if (validateCurrentStep()) {
        console.log('✅ Validación pasó - Avanzando...');
        if (currentWizardStep < 4) {
            currentWizardStep++;
            console.log('➡️ Avanzando a paso:', currentWizardStep);
            updateWizardUI();
        } else {
            // Último paso - crear la tarea
            submitWizardForm();
        }
    }
}

// Función para ir al paso anterior
function prevWizardStep() {
    if (currentWizardStep > 1) {
        currentWizardStep--;
        updateWizardUI();
        
        // Si volvemos al paso 1, reinicializar los event listeners y mostrar selección actual
        if (currentWizardStep === 1) {
            // Reinicializar event listeners para las cards
            setTimeout(() => {
                initializeWizard();
                // Si hay una selección previa, mostrarla visualmente
                if (selectedServiceType) {
                    const selectedCard = document.querySelector(`[data-service="${selectedServiceType}"]`);
                    if (selectedCard) {
                        selectedCard.classList.add('selected');
                    }
                }
            }, 50);
        }
    }
}

// Función para validar el paso actual
function validateCurrentStep() {
    switch (currentWizardStep) {
        case 1:
            console.log('🔍 Validando paso 1 - selectedServiceType:', selectedServiceType);
            if (!selectedServiceType) {
                console.log('❌ Validación FALLÓ: No hay tipo de servicio seleccionado');
                showMessage('❌ Por favor selecciona un tipo de servicio', 'error');
                return false;
            }
            console.log('✅ Validación PASÓ: Tipo de servicio seleccionado');
            return true;

        case 2:
            const titulo = document.getElementById('taskTitulo').value.trim();
            const descripcion = document.getElementById('taskDescripcion').value.trim();
            const categoria = document.getElementById('taskCategoria').value;

            if (!titulo || !descripcion || !categoria) {
                showMessage('❌ Completa todos los campos obligatorios', 'error');
                return false;
            }
            return true;

        case 3:
            const direccion = document.getElementById('taskDireccion').value.trim();
            const fecha = document.getElementById('taskFecha').value;

            if (!direccion || !fecha) {
                showMessage('❌ Completa la dirección y fecha', 'error');
                return false;
            }
            return true;

        case 4:
            const presupuesto = document.getElementById('taskPresupuesto').value;
            if (!presupuesto || presupuesto < 1) {
                showMessage('❌ Ingresa un presupuesto válido', 'error');
                return false;
            }
            return true;
    }
    return true;
}

// Función para actualizar la UI del wizard
function updateWizardUI() {
    // Actualizar pasos visibles
    document.querySelectorAll('.wizard-step').forEach(step => {
        step.classList.remove('active');
    });
    const currentStepElement = document.querySelector(`.wizard-step[data-step="${currentWizardStep}"]`);
    if (currentStepElement) {
        currentStepElement.classList.add('active');
    }

    // Actualizar barra de progreso
    document.querySelectorAll('.progress-step').forEach(step => {
        step.classList.remove('active');
    });
    const currentProgressStep = document.querySelector(`.progress-step[data-step="${currentWizardStep}"]`);
    if (currentProgressStep) {
        currentProgressStep.classList.add('active');
    }

    // Actualizar título
    const titles = {
        1: selectedServiceType
            ? `Paso 1: Servicio ${selectedServiceType === 'EXPRESS' ? 'Express' : 'Especialista'} seleccionado ✓`
            : 'Paso 1: ¿Qué tipo de servicio necesitas?',
        2: 'Paso 2: Describe tu tarea',
        3: 'Paso 3: ¿Dónde y cuándo?',
        4: 'Paso 4: Presupuesto y confirmación'
    };
    const wizardTitle = document.getElementById('wizardTitle');
    if (wizardTitle) {
        wizardTitle.textContent = titles[currentWizardStep];
    }

    // Actualizar indicador de paso
    const currentStepText = document.getElementById('currentStepText');
    if (currentStepText) {
        currentStepText.textContent = `Paso ${currentWizardStep} de 4`;
    }

    // Actualizar botones de navegación
    const prevBtn = document.getElementById('prevStep');
    const nextBtn = document.getElementById('nextStep');

    if (prevBtn) {
        prevBtn.style.display = currentWizardStep > 1 ? 'inline-flex' : 'none';
    }

    if (nextBtn) {
        if (currentWizardStep === 4) {
            nextBtn.innerHTML = '🚀 Publicar Tarea';
        } else {
            nextBtn.innerHTML = 'Siguiente →';
        }
    }
    
    // Si estamos en el paso 1, asegurar que las cards muestren la selección actual
    if (currentWizardStep === 1) {
        document.querySelectorAll('.service-card').forEach(card => {
            card.classList.remove('selected');
        });
        if (selectedServiceType) {
            const selectedCard = document.querySelector(`[data-service="${selectedServiceType}"]`);
            if (selectedCard) {
                selectedCard.classList.add('selected');
            }
        }
    }
    
    // Si estamos en el paso 4, actualizar la vista previa
    if (currentWizardStep === 4) {
        updateTaskPreview();
    }
}

// Función para actualizar el cálculo del presupuesto
function updateBudgetCalculation() {
    const presupuestoInput = document.getElementById('taskPresupuesto');
    if (!presupuestoInput) return;
    
    const presupuesto = parseFloat(presupuestoInput.value) || 0;
    const comision = presupuesto * 0.20;
    const taskerRecibe = presupuesto - comision;

    const budgetAmount = document.getElementById('budgetAmount');
    const platformFee = document.getElementById('platformFee');
    const taskerAmount = document.getElementById('taskerAmount');
    
    if (budgetAmount) budgetAmount.textContent = `$${presupuesto.toFixed(0)}`;
    if (platformFee) platformFee.textContent = `-$${comision.toFixed(0)}`;
    if (taskerAmount) taskerAmount.textContent = `$${taskerRecibe.toFixed(0)}`;
}

// Función para actualizar la vista previa de la tarea
function updateTaskPreview() {
    if (currentWizardStep !== 4) return;
    
    const titulo = document.getElementById('taskTitulo')?.value || 'Título de la tarea';
    const descripcion = document.getElementById('taskDescripcion')?.value || 'Descripción detallada de la tarea...';
    const direccion = document.getElementById('taskDireccion')?.value || 'Dirección';
    const fecha = document.getElementById('taskFecha')?.value || 'Fecha y hora';
    const categoria = document.getElementById('taskCategoria')?.selectedOptions[0]?.text || 'Categoría';
    const presupuesto = parseFloat(document.getElementById('taskPresupuesto')?.value) || 100;
    
    const previewTitle = document.getElementById('previewTitle');
    const previewDescription = document.getElementById('previewDescription');
    const previewLocation = document.getElementById('previewLocation');
    const previewDate = document.getElementById('previewDate');
    const previewCategory = document.getElementById('previewCategory');
    const previewServiceIcon = document.getElementById('previewServiceIcon');
    const previewServiceType = document.getElementById('previewServiceType');
    const previewBudget = document.getElementById('previewBudget');
    
    if (previewTitle) previewTitle.textContent = titulo;
    if (previewDescription) previewDescription.textContent = descripcion;
    if (previewLocation) previewLocation.textContent = direccion;
    if (previewDate) {
        const fechaObj = new Date(fecha);
        previewDate.textContent = fechaObj.toLocaleString('es-ES');
    }
    if (previewCategory) previewCategory.textContent = categoria;
    if (previewServiceIcon) {
        previewServiceIcon.textContent = selectedServiceType === 'EXPRESS' ? '⚡' : '🎯';
    }
    if (previewServiceType) {
        previewServiceType.textContent = selectedServiceType === 'EXPRESS' ? 'Express' : 'Especialista';
    }
    if (previewBudget) previewBudget.textContent = `$${presupuesto.toFixed(0)}`;
    
    // Actualizar cálculo de presupuesto
    updateBudgetCalculation();
}

// Función para enviar el formulario del wizard
function submitWizardForm() {
    // Copiar datos del wizard al formulario oculto
    document.getElementById('taskTipoServicio').value = selectedServiceType;

    // El formulario original se encargará del envío
    document.getElementById('taskForm').dispatchEvent(new Event('submit'));
}

// Función para reiniciar el wizard
function resetWizard() {
    currentWizardStep = 1;
    selectedServiceType = null;

    // Limpiar selecciones
    document.querySelectorAll('.service-card').forEach(card => {
        card.classList.remove('selected');
    });

    // Limpiar formularios
    document.getElementById('taskForm').reset();
    document.getElementById('taskTipoServicio').value = '';

    // Limpiar validaciones
    clearAllValidations();

    // Reiniciar UI
    updateWizardUI();
}

// ==================== VALIDACIÓN EN TIEMPO REAL ====================

// Función para validar un campo individual
function validateField(field, rules = {}) {
    const value = field.value.trim();
    const fieldGroup = field.closest('.form-group');
    let isValid = true;
    let errorMessage = '';

    // Limpiar estados anteriores
    fieldGroup.classList.remove('success', 'error');
    const existingIcon = fieldGroup.querySelector('.validation-icon');
    if (existingIcon) {
        existingIcon.remove();
    }

    // Validaciones básicas
    if (rules.required && !value) {
        isValid = false;
        errorMessage = 'Este campo es obligatorio';
    } else if (rules.minLength && value.length < rules.minLength) {
        isValid = false;
        errorMessage = `Mínimo ${rules.minLength} caracteres`;
    } else if (rules.maxLength && value.length > rules.maxLength) {
        isValid = false;
        errorMessage = `Máximo ${rules.maxLength} caracteres`;
    } else if (rules.pattern && !rules.pattern.test(value)) {
        isValid = false;
        errorMessage = rules.errorMessage || 'Formato inválido';
    } else if (rules.custom && !rules.custom(value)) {
        isValid = false;
        errorMessage = rules.errorMessage || 'Valor inválido';
    }

    // Actualizar UI
    if (value && isValid) {
        fieldGroup.classList.add('success');
        addValidationIcon(fieldGroup, 'success', '✓');
        if (rules.successMessage) {
            updateFieldHint(fieldGroup, rules.successMessage, 'success');
        }
    } else if (value && !isValid) {
        fieldGroup.classList.add('error');
        addValidationIcon(fieldGroup, 'error', '✕');
        updateFieldHint(fieldGroup, errorMessage, 'error');
    } else {
        // Campo vacío, restaurar estado neutral
        updateFieldHint(fieldGroup, rules.hint || '', 'hint');
    }

    return isValid;
}

// Función para agregar ícono de validación
function addValidationIcon(fieldGroup, type, symbol) {
    const icon = document.createElement('span');
    icon.className = `validation-icon ${type}`;
    icon.textContent = symbol;
    fieldGroup.appendChild(icon);
}

// Función para actualizar el hint del campo
function updateFieldHint(fieldGroup, message, type = 'hint') {
    const hintElement = fieldGroup.querySelector('.field-hint');
    if (hintElement) {
        hintElement.textContent = message;
        hintElement.className = `field-hint ${type}`;
    }
}

// Función para configurar validación en tiempo real para un campo
function setupRealTimeValidation(fieldId, rules = {}) {
    const field = document.getElementById(fieldId);
    if (!field) return;

    // Validar al perder foco
    field.addEventListener('blur', () => {
        if (field.value.trim()) {
            validateField(field, rules);
        }
    });

    // Validar mientras escribe (con debounce)
    let timeout;
    field.addEventListener('input', () => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            validateField(field, rules);
        }, 500);
    });
}

// Función para inicializar validación en tiempo real para todos los campos
function initializeRealTimeValidation() {
    // Configurar validación para cada campo
    setupRealTimeValidation('taskTitulo', {
        required: true,
        minLength: 10,
        maxLength: 80,
        hint: 'Ej: Reparar grifo de cocina',
        successMessage: '¡Título perfecto!'
    });

    setupRealTimeValidation('taskDescripcion', {
        required: true,
        minLength: 30,
        maxLength: 500,
        hint: 'Describe exactamente qué necesitas...',
        successMessage: '¡Descripción muy clara!'
    });

    setupRealTimeValidation('taskCategoria', {
        required: true,
        hint: 'Selecciona la categoría más apropiada'
    });

    setupRealTimeValidation('taskDireccion', {
        required: true,
        minLength: 10,
        hint: 'Dirección exacta donde se realizará el trabajo',
        successMessage: '¡Dirección clara!'
    });

    setupRealTimeValidation('taskPresupuesto', {
        required: true,
        custom: (value) => {
            const num = parseFloat(value);
            return num >= 10 && num <= 10000;
        },
        errorMessage: 'El presupuesto debe estar entre $10 y $10,000',
        hint: 'Monto máximo que estás dispuesto a pagar'
    });

    // Validación especial para fecha (no puede ser en el pasado)
    const fechaField = document.getElementById('taskFecha');
    if (fechaField) {
        fechaField.addEventListener('change', () => {
            const selectedDate = new Date(fechaField.value);
            const now = new Date();

            if (selectedDate < now) {
                validateField(fechaField, {
                    custom: () => false,
                    errorMessage: 'La fecha no puede ser en el pasado'
                });
            } else {
                validateField(fechaField, {
                    required: true,
                    hint: '¿Cuándo necesitas el servicio?'
                });
            }
        });
    }
}

// Función para limpiar todas las validaciones
function clearAllValidations() {
    document.querySelectorAll('.form-group').forEach(group => {
        group.classList.remove('success', 'error');
        const icon = group.querySelector('.validation-icon');
        if (icon) icon.remove();
    });
}

// Modificar el event listener existente para incluir la inicialización del wizard
// Buscar donde se inicializa el dashboard del cliente
document.addEventListener('DOMContentLoaded', function() {
    // ... código existente ...

    // Agregar inicialización del wizard cuando se renderiza el dashboard del cliente
    if (userType === 'cliente') {
        console.log('👤 Dashboard cliente renderizado - inicializando wizard...');

        try {
            // Intentar inicializar inmediatamente
            console.log('⚡ Intentando inicialización inmediata...');
            initializeWizard();
        } catch (error) {
            console.error('❌ Error en inicialización inmediata del wizard:', error);
            alert('Error al inicializar wizard (inmediato): ' + error.message);
        }

        // También programar con delay por si acaso
        setTimeout(() => {
            try {
                console.log('⏰ SETTIMEOUT EJECUTADO - Reintentando inicialización...');
                initializeWizard();
            } catch (error) {
                console.error('❌ Error en inicialización con delay del wizard:', error);
                alert('Error al inicializar wizard (delay): ' + error.message);
            }
        }, 1000);
    }
});




// Función para inicializar manualmente el wizard (para debugging)
window.manualInitWizard = function() {
    console.log('🔧 INICIALIZACIÓN MANUAL DEL WIZARD...');
    initializeWizard();
};

// Función de diagnóstico para el wizard
window.debugWizardStatus = function() {
    console.log('🐛 DIAGNÓSTICO DEL WIZARD:');
    console.log('  📊 Paso actual:', currentWizardStep);
    console.log('  🎯 Servicio seleccionado:', selectedServiceType || 'NINGUNO');
    console.log('  🎴 Cards en DOM:', document.querySelectorAll('.service-card').length);
    console.log('  ✅ Cards seleccionadas:', document.querySelectorAll('.service-card.selected').length);

    document.querySelectorAll('.service-card').forEach((card, i) => {
        const isSelected = card.classList.contains('selected');
        console.log(`    ${i+1}. ${card.dataset.service}: ${isSelected ? '✅ SELECCIONADA' : '❌ no seleccionada'}`);
    });

    // Verificar botones
    const nextBtn = document.getElementById('nextStep');
    console.log('  🎮 Botón Siguiente existe:', !!nextBtn);
    if (nextBtn) {
        console.log('  🎮 Botón Siguiente visible:', nextBtn.style.display !== 'none');
        console.log('  🎮 Texto del botón:', nextBtn.textContent.trim());
    }

    return {
        paso: currentWizardStep,
        servicio: selectedServiceType,
        cards: document.querySelectorAll('.service-card').length,
        seleccionadas: document.querySelectorAll('.service-card.selected').length
    };
};

// Probar conexión al cargar la página
testConnection();
