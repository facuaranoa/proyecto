// Configuración de la API
const API_BASE = 'http://localhost:3000/api';

// Variables globales
let currentUser = null;
let currentToken = null;
let taskerMode = 'tasker'; // 'tasker' o 'cliente' - controla el modo de visualización para taskers

// Función helper para obtener el tipo efectivo del usuario
// Los usuarios duales se comportan como taskers
function getUserType() {
    if (!currentUser) return null;
    // Si es usuario dual, tratarlo como tasker
    if (currentUser.esUsuarioDual) {
        return 'tasker';
    }
    return currentUser.tipo;
}

// Función helper para verificar si el usuario es tasker (incluyendo usuarios duales)
function isTasker() {
    const userType = getUserType();
    return userType === 'tasker';
}

// Función helper para verificar si el usuario es cliente (pero NO usuario dual)
function isCliente() {
    if (!currentUser) return false;
    // Si es usuario dual, NO es cliente puro
    if (currentUser.esUsuarioDual) return false;
    return currentUser.tipo === 'cliente';
}

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
    // Si se muestra la pestaña de registro, cargar categorías
    if (tabName === 'register') {
        setTimeout(loadCategoriasForRegistration, 100);
    }
    
    // Ocultar todas las pestañas
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
        // Si tiene display: none inline, mantenerlo, sino ocultar
        if (!tab.style.display || tab.style.display !== 'none') {
            tab.style.display = 'none';
        }
    });

    // Desactivar todos los botones
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Mostrar la pestaña seleccionada
    const tabElement = document.getElementById(tabName);
    if (tabElement) {
        tabElement.classList.add('active');
        tabElement.style.display = 'block';
        
        // Cargar contenido automáticamente según la pestaña
        if (tabName === 'admin' && currentUser && currentUser.tipo === 'admin') {
            setTimeout(() => {
                showAdminContent();
            }, 100);
        } else if (tabName === 'dashboard' && currentUser) {
            setTimeout(() => {
                showDashboardContent();
            }, 100);
        }
    } else {
        // Si no encuentra el elemento, intentar con showTabWithContent
        if (tabName === 'tasks') {
            showTabWithContent('tasks');
            return;
        }
    }

    // Activar el botón correspondiente en top nav (si existe)
    document.querySelectorAll('.tab-btn').forEach(btn => {
        const onclick = btn.getAttribute('onclick');
        if (onclick && (onclick.includes(`showTab('${tabName}')`) || onclick.includes(`showTabWithContent('${tabName}')`))) {
            btn.classList.add('active');
        }
    });

    // Actualizar bottom nav siempre cuando hay usuario logueado
    if (currentUser) {
        // Si es dashboard, no marcar ningún botón como activo (o marcar "Más")
        if (tabName === 'dashboard') {
            updateBottomNavActive('more');
        } else {
            updateBottomNavActive(tabName);
        }
    }

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
function showTabWithContent(tabName, subtab = null) {
    // Primero mostrar la pestaña normalmente
    showTab(tabName);

    // Actualizar bottom nav
    updateBottomNavActive(tabName);

    // Cargar contenido dinámico según la pestaña
    if (tabName === 'tasks' && currentUser) {
        showTasksContent(subtab);
    } else if (tabName === 'profile' && currentUser) {
        showProfileContent();
    } else if (tabName === 'search' && currentUser) {
        showSearchContent();
    } else if (tabName === 'chat' && currentUser) {
        showChatContent();
    }
}

// Función para mostrar "Mis Tareas" (navega a la pestaña correcta)
function showMyTasks() {
    if (!currentUser) return;
    
    const userType = getUserType(); // Usar función helper
    let subtab = null;
    
    // Determinar qué subtab mostrar
    if (isCliente() || (isTasker() && taskerMode === 'cliente')) {
        // Para clientes: mostrar "Pendientes de Asignar"
        subtab = 'pending';
    } else if (isTasker() && taskerMode === 'tasker') {
        // Para taskers: mostrar "Asignadas"
        subtab = 'assigned';
    }
    
    // Ir a la pestaña de tareas con el subtab especificado
    showTabWithContent('tasks', subtab);
}

// Función para mostrar "Crear Tarea"
function showCreateTaskTab() {
    if (!currentUser) return;
    
    const userType = getUserType(); // Usar función helper
    
    // Solo funciona para clientes o taskers en modo cliente
    if (isCliente() || (isTasker() && taskerMode === 'cliente')) {
        // Ir a la pestaña de tareas con subtab "create"
        showTabWithContent('tasks', 'create');
    }
}

// Función para mostrar "Buscar Tareas" (para taskers)
function showSearchTasks() {
    if (!currentUser) return;
    
    const userType = getUserType(); // Usar función helper
    
    // Solo funciona para taskers en modo tasker
    if (isTasker() && taskerMode === 'tasker') {
        // Ir a la pestaña de tareas con subtab "available"
        showTabWithContent('tasks', 'available');
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

    const categoriaPrincipal = document.getElementById('taskerCategoriaPrincipal').value;
    const especialidad = document.getElementById('taskerEspecialidad').value;
    
    // Obtener las especialidades de la categoría seleccionada
    const categoria = categoriasDisponibles.find(cat => cat.id === categoriaPrincipal);
    const especialidades = categoria && categoria.subcategorias 
        ? categoria.subcategorias.filter(sub => sub.id === especialidad).map(sub => sub.nombre)
        : [especialidad];

    const formData = {
        email: document.getElementById('taskerEmail').value,
        password: document.getElementById('taskerPassword').value,
        nombre: document.getElementById('taskerNombre').value,
        apellido: document.getElementById('taskerApellido').value,
        telefono: document.getElementById('taskerTelefono').value,
        cuit: document.getElementById('taskerCuit').value || null,
        monotributista_check: document.getElementById('taskerMonotributista').checked,
        terminos_aceptados: document.getElementById('taskerTerms').checked,
        categoria_principal: categoriaPrincipal,
        especialidades: especialidades
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
// Función para mostrar formulario de recuperación de contraseña
function showForgotPassword(event) {
    if (event) event.preventDefault();
    
    // Ocultar todas las pestañas
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
        tab.style.display = 'none';
    });
    
    // Mostrar la pestaña de recuperación de contraseña
    const forgotPasswordTab = document.getElementById('forgotPassword');
    if (forgotPasswordTab) {
        forgotPasswordTab.classList.add('active');
        forgotPasswordTab.style.display = 'block';
    }
    
    // Desactivar todos los botones de tab
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
}

// Función para volver al login
function showLogin(event) {
    if (event) event.preventDefault();
    
    // Ocultar todas las pestañas
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
        tab.style.display = 'none';
    });
    
    // Mostrar la pestaña de login
    const loginTab = document.getElementById('login');
    if (loginTab) {
        loginTab.classList.add('active');
        loginTab.style.display = 'block';
    }
    
    // Activar el botón de login
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        const onclick = btn.getAttribute('onclick');
        if (onclick && onclick.includes("showTab('login')")) {
            btn.classList.add('active');
        }
    });
}

// Función para solicitar recuperación de contraseña
async function forgotPassword(event) {
    if (!event) {
        console.error('forgotPassword called without event parameter');
        return;
    }
    event.preventDefault();

    const email = document.getElementById('forgotPasswordEmail').value;
    const resultDiv = document.getElementById('forgotPasswordResult');

    if (!email) {
        showMessage('❌ Por favor ingresa tu email', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/auth/forgot-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });

        const data = await response.json();

        if (response.ok) {
            // En desarrollo, mostrar el link directamente
            if (data.resetLink) {
                resultDiv.innerHTML = `
                    <div style="background: #d1fae5; padding: 15px; border-radius: 8px; margin-top: 15px;">
                        <p style="color: #065f46; margin-bottom: 10px;">✅ Enlace de recuperación generado:</p>
                        <p style="word-break: break-all; color: #047857; font-size: 12px;">${data.resetLink}</p>
                        <p style="color: #065f46; margin-top: 10px; font-size: 14px;">
                            <strong>Nota:</strong> En producción, este enlace se enviaría por email.
                        </p>
                    </div>
                `;
            } else {
                resultDiv.innerHTML = `
                    <div style="background: #d1fae5; padding: 15px; border-radius: 8px; margin-top: 15px;">
                        <p style="color: #065f46;">✅ Si el email existe, recibirás un enlace de recuperación.</p>
                    </div>
                `;
            }
            showMessage('✅ Solicitud procesada. Revisa tu email (o la consola en desarrollo).', 'success');
        } else {
            showMessage(`❌ Error: ${data.message || 'Error al procesar solicitud'}`, 'error');
            resultDiv.innerHTML = '';
        }
    } catch (error) {
        console.error('Error en forgot-password:', error);
        showMessage(`❌ Error de conexión: ${error.message}`, 'error');
        resultDiv.innerHTML = '';
    }
}

// Función para resetear contraseña con token
async function resetPassword(event) {
    if (!event) {
        console.error('resetPassword called without event parameter');
        return;
    }
    event.preventDefault();

    // Obtener token de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (!token) {
        showMessage('❌ Token no encontrado en la URL', 'error');
        return;
    }

    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const resultDiv = document.getElementById('resetPasswordResult');

    if (!newPassword || !confirmPassword) {
        showMessage('❌ Por favor completa todos los campos', 'error');
        return;
    }

    if (newPassword.length < 6) {
        showMessage('❌ La contraseña debe tener al menos 6 caracteres', 'error');
        return;
    }

    if (newPassword !== confirmPassword) {
        showMessage('❌ Las contraseñas no coinciden', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/auth/reset-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token, newPassword })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            resultDiv.innerHTML = `
                <div style="background: #d1fae5; padding: 15px; border-radius: 8px; margin-top: 15px;">
                    <p style="color: #065f46;">✅ Contraseña restablecida exitosamente.</p>
                    <p style="color: #047857; margin-top: 10px;">Redirigiendo al login...</p>
                </div>
            `;
            showMessage('✅ Contraseña restablecida exitosamente', 'success');
            
            // Limpiar URL y redirigir al login después de 2 segundos
            setTimeout(() => {
                window.history.replaceState({}, document.title, window.location.pathname);
                showTab('login');
                document.getElementById('resetPasswordForm').reset();
            }, 2000);
        } else {
            showMessage(`❌ Error: ${data.message || 'Error al restablecer contraseña'}`, 'error');
            resultDiv.innerHTML = '';
        }
    } catch (error) {
        console.error('Error en reset-password:', error);
        showMessage(`❌ Error de conexión: ${error.message}`, 'error');
        resultDiv.innerHTML = '';
    }
}

// Verificar si hay token en la URL al cargar la página
window.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    if (token) {
        showTab('resetPassword');
    }
});

async function login(event) {
    if (!event) {
        console.error('login called without event parameter');
        return;
    }
    event.preventDefault();

    const submitBtn = event.target.querySelector('button[type="submit"]');
    setLoading(submitBtn, true);

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    // Validación básica
    if (!email || !password) {
        showMessage('❌ Por favor completa todos los campos', 'error');
        setLoading(submitBtn, false);
        return;
    }

    const formData = {
        email: email,
        password: password
    };

    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        // Verificar si la respuesta es JSON
        let data;
        try {
            data = await response.json();
        } catch (jsonError) {
            throw new Error('El servidor no respondió correctamente. ¿Está el backend corriendo?');
        }

        if (response.ok) {
            currentToken = data.token;
            currentUser = data.usuario;
            
            // Debug: mostrar información del usuario recibido
            console.log('🔍 Login - Usuario recibido del backend:', currentUser);
            console.log('🔍 Login - esUsuarioDual:', currentUser.esUsuarioDual);
            console.log('🔍 Login - tipo:', currentUser.tipo);

            // Cambiar a modo logueado
            switchToLoggedInMode();

            // Actualizar botón de disponibilidad si es tasker (incluyendo usuarios duales)
            if (isTasker()) {
                updateAvailabilityButton();
            }
            
            // Si es usuario dual, mostrar información en consola
            if (currentUser.esUsuarioDual) {
                console.log('✅ Usuario dual detectado - Comportándose como tasker:', {
                    cliente_id: currentUser.cliente_id,
                    tasker_id: currentUser.tasker_id,
                    categoria_principal: currentUser.categoria_principal,
                    especialidades: currentUser.especialidades
                });
            } else {
                console.log('⚠️ Usuario NO detectado como dual. Tipo:', currentUser.tipo);
            }

            // Mostrar la pestaña correspondiente según el tipo de usuario
            const userType = getUserType();
            if (userType === 'admin') {
                showTab('admin'); // Panel de administración
            } else if (isTasker()) {
                // Taskers (incluyendo usuarios duales): mostrar tareas disponibles
                showTabWithContent('tasks');
            } else if (isCliente()) {
                showTabWithContent('tasks'); // Crear/ver tareas
            }

            document.getElementById('loginForm').reset();
            showMessage('✅ Login exitoso', 'success');
        } else {
            showMessage(`❌ Error: ${data.message || data.error || 'Credenciales inválidas'}`, 'error');
        }
    } catch (error) {
        console.error('Error en login:', error);
        if (error.message.includes('fetch')) {
            showMessage('❌ Error de conexión: No se pudo conectar al servidor. Verifica que el backend esté corriendo en http://localhost:3000', 'error');
        } else {
            showMessage(`❌ Error: ${error.message}`, 'error');
        }
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

// ========== FUNCIONES DE ADMINISTRACIÓN ==========

// Variables globales para almacenar datos actuales (para exportación)
let currentAdminTaskers = [];
let currentAdminClientes = [];
let currentAdminTareas = [];
let allAdminTaskers = []; // Datos completos sin filtrar
let allAdminClientes = []; // Datos completos sin filtrar
let allAdminTareas = []; // Datos completos sin filtrar
let currentAdminFilter = {
    taskers: 'pending',
    clientes: 'all',
    tareas: 'all'
};

// Funciones de exportación
function exportToCSV(data, filename) {
    if (!data || data.length === 0) {
        showMessage('❌ No hay datos para exportar', 'error');
        return;
    }

    // Obtener las claves del primer objeto
    const headers = Object.keys(data[0]);
    
    // Crear fila de encabezados
    const csvHeaders = headers.join(',');
    
    // Crear filas de datos
    const csvRows = data.map(row => {
        return headers.map(header => {
            const value = row[header];
            // Manejar valores que contienen comas, comillas o saltos de línea
            if (value === null || value === undefined) return '';
            const stringValue = String(value);
            if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
                return `"${stringValue.replace(/"/g, '""')}"`;
            }
            return stringValue;
        }).join(',');
    });
    
    // Combinar todo
    const csvContent = [csvHeaders, ...csvRows].join('\n');
    
    // Crear blob y descargar
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showMessage('✅ Archivo CSV descargado exitosamente', 'success');
}

function exportToJSON(data, filename) {
    if (!data || data.length === 0) {
        showMessage('❌ No hay datos para exportar', 'error');
        return;
    }

    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showMessage('✅ Archivo JSON descargado exitosamente', 'success');
}

// Función para mostrar el contenido del panel admin
function showAdminContent() {
    const adminContent = document.getElementById('adminContent');
    if (!adminContent) return;

    const adminHTML = `
        <div class="admin-panel">
            <!-- PESTAÑAS DEL ADMIN -->
            <div class="admin-tabs">
                <button class="admin-tab-btn active" onclick="showAdminTab('dashboard')" id="admin-tab-dashboard">
                    📊 Dashboard
                </button>
                <button class="admin-tab-btn" onclick="showAdminTab('taskers')" id="admin-tab-taskers">
                    👷 Taskers
                </button>
                <button class="admin-tab-btn" onclick="showAdminTab('clientes')" id="admin-tab-clientes">
                    👥 Clientes
                </button>
                <button class="admin-tab-btn" onclick="showAdminTab('tareas')" id="admin-tab-tareas">
                    📋 Tareas
                </button>
                <button class="admin-tab-btn" onclick="showAdminTab('categorias')" id="admin-tab-categorias">
                    🏷️ Categorías
                </button>
            </div>

            <!-- CONTENIDO: DASHBOARD -->
            <div id="admin-tab-content-dashboard" class="admin-tab-content active">
                <h3>📊 Estadísticas Generales</h3>
                <div id="adminStats" class="admin-stats-container">
                    <p>Cargando estadísticas...</p>
                </div>
            </div>

            <!-- CONTENIDO: TASKERS -->
            <div id="admin-tab-content-taskers" class="admin-tab-content">
                <div class="admin-section-header">
                    <h3>👷 Gestión de Taskers</h3>
                    <div class="admin-actions">
                        <div class="admin-search-box">
                            <input type="text" id="searchTaskers" class="search-input" placeholder="🔍 Buscar por nombre, email, teléfono..." onkeyup="filterTaskers()" oninput="filterTaskers()">
                            <select id="sortTaskers" class="sort-select" onchange="filterTaskers()">
                                <option value="name-asc">Ordenar: Nombre A-Z</option>
                                <option value="name-desc">Ordenar: Nombre Z-A</option>
                                <option value="date-asc">Ordenar: Más antiguos</option>
                                <option value="date-desc">Ordenar: Más recientes</option>
                            </select>
                        </div>
                        <div class="admin-filters">
                            <button class="btn-filter ${currentAdminFilter.taskers === 'all' ? 'active' : ''}" onclick="loadAdminTaskers('all')">Todos</button>
                            <button class="btn-filter ${currentAdminFilter.taskers === 'pending' ? 'active' : ''}" onclick="loadAdminTaskers('pending')">Pendientes</button>
                            <button class="btn-filter ${currentAdminFilter.taskers === 'rejected' ? 'active' : ''}" onclick="loadAdminTaskers('rejected')">Rechazados</button>
                            <button class="btn-filter ${currentAdminFilter.taskers === 'approved' ? 'active' : ''}" onclick="loadAdminTaskers('approved')">Aprobados</button>
                        </div>
                        <div class="admin-export-buttons">
                            <button class="btn-export" onclick="exportTaskers('csv')" title="Descargar CSV">📥 CSV</button>
                            <button class="btn-export" onclick="exportTaskers('json')" title="Descargar JSON">📥 JSON</button>
                        </div>
                    </div>
                </div>
                <div id="adminTaskersList" class="admin-list-container">
                    <p>Cargando taskers...</p>
                </div>
            </div>

            <!-- CONTENIDO: CLIENTES -->
            <div id="admin-tab-content-clientes" class="admin-tab-content">
                <div class="admin-section-header">
                    <h3>👥 Gestión de Clientes</h3>
                    <div class="admin-actions">
                        <div class="admin-search-box">
                            <input type="text" id="searchClientes" class="search-input" placeholder="🔍 Buscar por nombre, email, teléfono..." onkeyup="filterClientes()" oninput="filterClientes()">
                            <select id="sortClientes" class="sort-select" onchange="filterClientes()">
                                <option value="name-asc">Ordenar: Nombre A-Z</option>
                                <option value="name-desc">Ordenar: Nombre Z-A</option>
                                <option value="date-asc">Ordenar: Más antiguos</option>
                                <option value="date-desc">Ordenar: Más recientes</option>
                            </select>
                        </div>
                        <div class="admin-filters">
                            <button class="btn-filter ${currentAdminFilter.clientes === 'all' ? 'active' : ''}" onclick="loadAdminClientes('all')">Todos</button>
                            <button class="btn-filter ${currentAdminFilter.clientes === 'pending' ? 'active' : ''}" onclick="loadAdminClientes('pending')">Pendientes</button>
                            <button class="btn-filter ${currentAdminFilter.clientes === 'rejected' ? 'active' : ''}" onclick="loadAdminClientes('rejected')">Rechazados</button>
                            <button class="btn-filter ${currentAdminFilter.clientes === 'approved' ? 'active' : ''}" onclick="loadAdminClientes('approved')">Aprobados</button>
                        </div>
                        <div class="admin-export-buttons">
                            <button class="btn-export" onclick="exportClientes('csv')" title="Descargar CSV">📥 CSV</button>
                            <button class="btn-export" onclick="exportClientes('json')" title="Descargar JSON">📥 JSON</button>
                        </div>
                    </div>
                </div>
                <div id="adminClientesList" class="admin-list-container">
                    <p>Cargando clientes...</p>
                </div>
            </div>

            <!-- CONTENIDO: TAREAS -->
            <div id="admin-tab-content-tareas" class="admin-tab-content">
                <div class="admin-section-header">
                    <h3>📋 Gestión de Tareas</h3>
                    <div class="admin-actions">
                        <div class="admin-search-box">
                            <input type="text" id="searchTareas" class="search-input" placeholder="🔍 Buscar por tipo, descripción, cliente, tasker..." onkeyup="filterTareas()" oninput="filterTareas()">
                            <input type="date" id="filterFechaDesde" class="filter-date" placeholder="Desde" onchange="filterTareas()">
                            <input type="date" id="filterFechaHasta" class="filter-date" placeholder="Hasta" onchange="filterTareas()">
                            <input type="number" id="filterMontoMin" class="filter-number" placeholder="Monto min" onchange="filterTareas()" min="0" step="0.01">
                            <input type="number" id="filterMontoMax" class="filter-number" placeholder="Monto max" onchange="filterTareas()" min="0" step="0.01">
                            <select id="sortTareas" class="sort-select" onchange="filterTareas()">
                                <option value="date-desc">Ordenar: Más recientes</option>
                                <option value="date-asc">Ordenar: Más antiguos</option>
                                <option value="monto-desc">Ordenar: Mayor monto</option>
                                <option value="monto-asc">Ordenar: Menor monto</option>
                                <option value="estado-asc">Ordenar: Por estado</option>
                            </select>
                        </div>
                        <div class="admin-filters">
                            <select id="adminTareasFilter" onchange="filterTareas()" class="filter-select">
                                <option value="all">Todas</option>
                                <option value="PENDIENTE">Pendientes</option>
                                <option value="ASIGNADA">Asignadas</option>
                                <option value="EN_PROCESO">En Proceso</option>
                                <option value="PENDIENTE_PAGO">Pendiente Pago</option>
                                <option value="FINALIZADA">Finalizadas</option>
                                <option value="CANCELADA">Canceladas</option>
                            </select>
                        </div>
                        <div class="admin-export-buttons">
                            <button class="btn-export" onclick="exportTareas('csv')" title="Descargar CSV">📥 CSV</button>
                            <button class="btn-export" onclick="exportTareas('json')" title="Descargar JSON">📥 JSON</button>
                        </div>
                    </div>
                </div>
                <div id="adminTareasList" class="admin-list-container">
                    <p>Cargando tareas...</p>
                </div>
            </div>

            <!-- CONTENIDO: CATEGORÍAS -->
            <div id="admin-tab-content-categorias" class="admin-tab-content">
                <div class="admin-section-header">
                    <h3>🏷️ Gestión de Categorías</h3>
                    <div class="admin-actions">
                        <button class="btn-primary" onclick="showCreateCategoriaModal()">
                            ➕ Nueva Categoría
                        </button>
                    </div>
                </div>
                <div id="adminCategoriasList" class="admin-list-container">
                    <p>Cargando categorías...</p>
                </div>
            </div>
        </div>
    `;

    adminContent.innerHTML = adminHTML;

    // Cargar dashboard por defecto
    loadAdminStats();
    loadAdminTaskers('pending');
}

// Función para cambiar entre pestañas del admin
function showAdminTab(tabName) {
    // Ocultar todas las pestañas
    document.querySelectorAll('.admin-tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.admin-tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Mostrar la pestaña seleccionada
    const tabContent = document.getElementById(`admin-tab-content-${tabName}`);
    const tabBtn = document.getElementById(`admin-tab-${tabName}`);
    
    if (tabContent) tabContent.classList.add('active');
    if (tabBtn) tabBtn.classList.add('active');

    // Cargar contenido según la pestaña
    switch(tabName) {
        case 'dashboard':
            loadAdminStats();
            break;
        case 'taskers':
            loadAdminTaskers(currentAdminFilter.taskers || 'pending');
            break;
        case 'clientes':
            loadAdminClientes(currentAdminFilter.clientes || 'all');
            break;
        case 'tareas':
            loadAdminTareas();
            break;
        case 'categorias':
            loadAdminCategorias();
            break;
    }
}

// Función para cargar estadísticas del dashboard
async function loadAdminStats() {
    try {
        const statsContainer = document.getElementById('adminStats');
        if (!statsContainer) return;

        const response = await fetch(`${API_BASE}/admin/stats`, {
            headers: {
                'Authorization': `Bearer ${currentToken}`
            }
        });

        const data = await response.json();
        if (response.ok && data.stats) {
            const stats = data.stats;
            statsContainer.innerHTML = `
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon">👥</div>
                        <div class="stat-info">
                            <h4>Usuarios</h4>
                            <p class="stat-number">${stats.usuarios.totalUsuarios}</p>
                            <p class="stat-detail">${stats.usuarios.totalClientes} clientes • ${stats.usuarios.totalTaskers} taskers</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">👷</div>
                        <div class="stat-info">
                            <h4>Taskers</h4>
                            <p class="stat-number">${stats.usuarios.taskersAprobados}</p>
                            <p class="stat-detail">${stats.usuarios.taskersPendientes} pendientes</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">📋</div>
                        <div class="stat-info">
                            <h4>Tareas</h4>
                            <p class="stat-number">${stats.tareas.total}</p>
                            <p class="stat-detail">${stats.tareas.porEstado.FINALIZADA} finalizadas</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">💰</div>
                        <div class="stat-info">
                            <h4>Ingresos</h4>
                            <p class="stat-number">$${stats.finanzas.ingresosTotales.toLocaleString('es-AR')}</p>
                            <p class="stat-detail">Comisiones: $${stats.finanzas.comisionesTotales.toLocaleString('es-AR')}</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">⭐</div>
                        <div class="stat-info">
                            <h4>Calificaciones</h4>
                            <p class="stat-number">${stats.calificaciones.promedio.toFixed(1)}</p>
                            <p class="stat-detail">${stats.calificaciones.total} calificaciones</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">📊</div>
                        <div class="stat-info">
                            <h4>Estados de Tareas</h4>
                            <div class="stat-states">
                                <span>Pendiente: ${stats.tareas.porEstado.PENDIENTE}</span>
                                <span>Asignada: ${stats.tareas.porEstado.ASIGNADA}</span>
                                <span>En Proceso: ${stats.tareas.porEstado.EN_PROCESO}</span>
                                <span>Finalizada: ${stats.tareas.porEstado.FINALIZADA}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } else {
            statsContainer.innerHTML = `<p class="error">Error al cargar estadísticas</p>`;
        }
    } catch (error) {
        console.error('Error cargando estadísticas:', error);
        const statsContainer = document.getElementById('adminStats');
        if (statsContainer) {
            statsContainer.innerHTML = `<p class="error">Error de conexión</p>`;
        }
    }
}

// Función para cargar taskers (con filtro)
async function loadAdminTaskers(filter = 'pending') {
    try {
        const listContainer = document.getElementById('adminTaskersList');
        if (!listContainer) return;

        currentAdminFilter.taskers = filter;

        // Actualizar botones de filtro activos
        document.querySelectorAll('#admin-tab-content-taskers .btn-filter').forEach(btn => {
            btn.classList.remove('active');
        });
        const filterButtons = document.querySelectorAll('#admin-tab-content-taskers .btn-filter');
        if (filter === 'all' && filterButtons[0]) filterButtons[0].classList.add('active');
        if (filter === 'pending' && filterButtons[1]) filterButtons[1].classList.add('active');
        if (filter === 'rejected' && filterButtons[2]) filterButtons[2].classList.add('active');
        if (filter === 'approved' && filterButtons[3]) filterButtons[3].classList.add('active');

        let url = `${API_BASE}/admin/taskers`;
        if (filter === 'pending') {
            url += '?pendientes=true';
        } else if (filter === 'rejected') {
            url += '?rechazados=true';
        }

        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${currentToken}`
            }
        });

        const data = await response.json();
        if (response.ok && data.taskers) {
            let taskers = data.taskers;
            
            // Filtrar según el filtro seleccionado
            if (filter === 'approved') {
                taskers = taskers.filter(t => t.aprobado_admin === true);
            } else if (filter === 'pending') {
                taskers = taskers.filter(t => t.aprobado_admin === false);
            } else if (filter === 'rejected') {
                // Rechazados son los que no están aprobados (mismo que pendientes por ahora)
                taskers = taskers.filter(t => t.aprobado_admin === false);
            }
            // 'all' muestra todos sin filtrar

            // Guardar datos completos y filtrados
            allAdminTaskers = taskers;
            currentAdminTaskers = taskers;
            
            // Aplicar búsqueda y ordenamiento
            applyTaskersFilters();

            // Guardar datos completos y filtrados
            allAdminTaskers = taskers;
            currentAdminTaskers = taskers;
            
            // Aplicar búsqueda y ordenamiento
            applyTaskersFilters();
        } else {
            listContainer.innerHTML = `<p class="error">Error al cargar taskers</p>`;
        }
    } catch (error) {
        console.error('Error cargando taskers:', error);
        const listContainer = document.getElementById('adminTaskersList');
        if (listContainer) {
            listContainer.innerHTML = `<p class="error">Error de conexión</p>`;
        }
    }
}

// Función para cargar clientes
async function loadAdminClientes(filter = 'all') {
    try {
        const listContainer = document.getElementById('adminClientesList');
        if (!listContainer) return;

        currentAdminFilter.clientes = filter;

        // Actualizar botones de filtro activos
        document.querySelectorAll('#admin-tab-content-clientes .btn-filter').forEach(btn => {
            btn.classList.remove('active');
        });
        const filterButtons = document.querySelectorAll('#admin-tab-content-clientes .btn-filter');
        if (filter === 'all' && filterButtons[0]) filterButtons[0].classList.add('active');
        if (filter === 'pending' && filterButtons[1]) filterButtons[1].classList.add('active');
        if (filter === 'rejected' && filterButtons[2]) filterButtons[2].classList.add('active');
        if (filter === 'approved' && filterButtons[3]) filterButtons[3].classList.add('active');

        const response = await fetch(`${API_BASE}/admin/clientes`, {
            headers: {
                'Authorization': `Bearer ${currentToken}`
            }
        });

        const data = await response.json();
        if (response.ok && data.clientes) {
            let clientes = data.clientes;

            // Filtrar según el filtro seleccionado
            if (filter === 'approved') {
                clientes = clientes.filter(c => c.aprobado_admin === true);
            } else if (filter === 'pending') {
                clientes = clientes.filter(c => c.aprobado_admin === false);
            } else if (filter === 'rejected') {
                // Rechazados son los que no están aprobados (mismo que pendientes por ahora)
                clientes = clientes.filter(c => c.aprobado_admin === false);
            }
            // 'all' muestra todos sin filtrar

            // Guardar datos completos y filtrados
            allAdminClientes = clientes;
            currentAdminClientes = clientes;
            
            // Aplicar búsqueda y ordenamiento
            applyClientesFilters();

            // Guardar datos completos y filtrados
            allAdminClientes = clientes;
            currentAdminClientes = clientes;
            
            // Aplicar búsqueda y ordenamiento
            applyClientesFilters();
        } else {
            listContainer.innerHTML = `<p class="error">Error al cargar clientes</p>`;
        }
    } catch (error) {
        console.error('Error cargando clientes:', error);
        const listContainer = document.getElementById('adminClientesList');
        if (listContainer) {
            listContainer.innerHTML = `<p class="error">Error de conexión</p>`;
        }
    }
}

// Función para cargar tareas (con filtro)
async function loadAdminTareas() {
    try {
        const listContainer = document.getElementById('adminTareasList');
        if (!listContainer) return;

        const filterSelect = document.getElementById('adminTareasFilter');
        const filter = filterSelect ? filterSelect.value : 'all';
        currentAdminFilter.tareas = filter;

        const response = await fetch(`${API_BASE}/admin/tareas`, {
            headers: {
                'Authorization': `Bearer ${currentToken}`
            }
        });

        const data = await response.json();
        if (response.ok && data.tareas) {
            let tareas = data.tareas;
            
            // Filtrar por estado si es necesario
            if (filter !== 'all') {
                tareas = tareas.filter(t => t.estado === filter);
            }

            // Guardar datos completos y filtrados
            allAdminTareas = tareas;
            currentAdminTareas = tareas;
            
            // Aplicar búsqueda y filtros avanzados
            applyTareasFilters();
        } else {
            const errorMsg = data.message || data.error || 'Error desconocido';
            console.error('Error en respuesta:', data);
            listContainer.innerHTML = `<p class="error">Error al cargar tareas: ${errorMsg}</p>`;
        }
    } catch (error) {
        console.error('Error cargando tareas:', error);
        const listContainer = document.getElementById('adminTareasList');
        if (listContainer) {
            listContainer.innerHTML = `<p class="error">Error de conexión: ${error.message}</p>`;
        }
    }
}

// Funciones de exportación
function exportTaskers(format) {
    if (currentAdminTaskers.length === 0) {
        showMessage('❌ No hay taskers para exportar. Carga los datos primero.', 'error');
        return;
    }
    
    const filterText = currentAdminFilter.taskers === 'all' ? 'todos' : 
                       currentAdminFilter.taskers === 'pending' ? 'pendientes' :
                       currentAdminFilter.taskers === 'rejected' ? 'rechazados' :
                       'aprobados';
    
    if (format === 'csv') {
        exportToCSV(currentAdminTaskers, `taskers_${filterText}`);
    } else {
        exportToJSON(currentAdminTaskers, `taskers_${filterText}`);
    }
}

function exportClientes(format) {
    if (currentAdminClientes.length === 0) {
        showMessage('❌ No hay clientes para exportar. Carga los datos primero.', 'error');
        return;
    }
    
    if (format === 'csv') {
        exportToCSV(currentAdminClientes, 'clientes');
    } else {
        exportToJSON(currentAdminClientes, 'clientes');
    }
}

function exportTareas(format) {
    if (currentAdminTareas.length === 0) {
        showMessage('❌ No hay tareas para exportar. Carga los datos primero.', 'error');
        return;
    }
    
    // Preparar datos para exportación (simplificar objetos anidados)
    const tareasExport = currentAdminTareas.map(tarea => {
        const tareaExport = {
            id: tarea.id,
            tipo_servicio: tarea.tipo_servicio,
            descripcion: tarea.descripcion,
            estado: tarea.estado,
            monto_total_acordado: tarea.monto_total_acordado,
            comision_app: tarea.comision_app,
            cliente_id: tarea.cliente_id,
            cliente_nombre: tarea.cliente ? `${tarea.cliente.nombre} ${tarea.cliente.apellido}` : 'N/A',
            cliente_email: tarea.cliente ? tarea.cliente.email : 'N/A',
            tasker_id: tarea.tasker_id || 'N/A',
            tasker_nombre: tarea.tasker ? `${tarea.tasker.nombre} ${tarea.tasker.apellido}` : 'N/A',
            tasker_email: tarea.tasker ? tarea.tasker.email : 'N/A',
            ubicacion: typeof tarea.ubicacion === 'string' ? tarea.ubicacion : 
                      (tarea.ubicacion?.direccion || tarea.ubicacion?.ciudad || 'No especificada'),
            fecha_hora_requerida: tarea.fecha_hora_requerida ? new Date(tarea.fecha_hora_requerida).toISOString() : 'N/A',
            fecha_inicio_trabajo: tarea.fecha_inicio_trabajo ? new Date(tarea.fecha_inicio_trabajo).toISOString() : 'N/A',
            fecha_finalizacion_trabajo: tarea.fecha_finalizacion_trabajo ? new Date(tarea.fecha_finalizacion_trabajo).toISOString() : 'N/A',
            requiere_licencia: tarea.requiere_licencia ? 'Sí' : 'No',
            createdAt: tarea.createdAt ? new Date(tarea.createdAt).toISOString() : 'N/A',
            updatedAt: tarea.updatedAt ? new Date(tarea.updatedAt).toISOString() : 'N/A'
        };
        return tareaExport;
    });
    
    const filterText = currentAdminFilter.tareas === 'all' ? 'todas' : currentAdminFilter.tareas.toLowerCase();
    
    if (format === 'csv') {
        exportToCSV(tareasExport, `tareas_${filterText}`);
    } else {
        exportToJSON(tareasExport, `tareas_${filterText}`);
    }
}

// Función para listar taskers pendientes (solo admin) - MANTENER PARA COMPATIBILIDAD
async function listarTaskers() {
    loadAdminTaskers('pending');
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
            // Recargar la lista de taskers y estadísticas
            setTimeout(() => {
                loadAdminTaskers(currentAdminFilter.taskers || 'pending');
                loadAdminStats();
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
            // Recargar la lista de taskers y estadísticas
            setTimeout(() => {
                loadAdminTaskers(currentAdminFilter.taskers || 'pending');
                loadAdminStats();
            }, 1000);
        } else {
            showMessage(`❌ Error: ${data.message || 'Error al rechazar tasker'}`, 'error');
        }
    } catch (error) {
        console.error('Error rechazando tasker:', error);
        showMessage('❌ Error de conexión al rechazar tasker', 'error');
    }
}

// Función para aprobar cliente
async function aprobarCliente(clienteId) {
    if (!confirm('¿Estás seguro de que quieres aprobar a este cliente?')) {
        return;
    }

    try {
        if (!currentToken) {
            showMessage('❌ Debes iniciar sesión primero', 'error');
            return;
        }

        const response = await fetch(`${API_BASE}/admin/cliente/verify/${clienteId}`, {
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
            setTimeout(() => {
                loadAdminClientes(currentAdminFilter.clientes || 'all');
                loadAdminStats();
            }, 1000);
        } else {
            showMessage(`❌ Error: ${data.message || 'Error al aprobar cliente'}`, 'error');
        }
    } catch (error) {
        console.error('Error aprobando cliente:', error);
        showMessage('❌ Error de conexión al aprobar cliente', 'error');
    }
}

// Función para rechazar cliente
async function rechazarCliente(clienteId) {
    if (!confirm('¿Estás seguro de que quieres rechazar a este cliente?')) {
        return;
    }

    try {
        if (!currentToken) {
            showMessage('❌ Debes iniciar sesión primero', 'error');
            return;
        }

        const response = await fetch(`${API_BASE}/admin/cliente/verify/${clienteId}`, {
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
            setTimeout(() => {
                loadAdminClientes(currentAdminFilter.clientes || 'all');
                loadAdminStats();
            }, 1000);
        } else {
            showMessage(`❌ Error: ${data.message || 'Error al rechazar cliente'}`, 'error');
        }
    } catch (error) {
        console.error('Error rechazando cliente:', error);
        showMessage('❌ Error de conexión al rechazar cliente', 'error');
    }
}

// Función para aprobar tarea
async function aprobarTarea(tareaId) {
    if (!confirm('¿Estás seguro de que quieres aprobar esta tarea?')) {
        return;
    }

    try {
        if (!currentToken) {
            showMessage('❌ Debes iniciar sesión primero', 'error');
            return;
        }

        const response = await fetch(`${API_BASE}/admin/tarea/verify/${tareaId}`, {
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
            setTimeout(() => {
                loadAdminTareas();
                loadAdminStats();
            }, 1000);
        } else {
            showMessage(`❌ Error: ${data.message || 'Error al aprobar tarea'}`, 'error');
        }
    } catch (error) {
        console.error('Error aprobando tarea:', error);
        showMessage('❌ Error de conexión al aprobar tarea', 'error');
    }
}

// Función para rechazar tarea
async function rechazarTarea(tareaId) {
    if (!confirm('¿Estás seguro de que quieres rechazar esta tarea?')) {
        return;
    }

    try {
        if (!currentToken) {
            showMessage('❌ Debes iniciar sesión primero', 'error');
            return;
        }

        const response = await fetch(`${API_BASE}/admin/tarea/verify/${tareaId}`, {
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
            setTimeout(() => {
                loadAdminTareas();
                loadAdminStats();
            }, 1000);
        } else {
            showMessage(`❌ Error: ${data.message || 'Error al rechazar tarea'}`, 'error');
        }
    } catch (error) {
        console.error('Error rechazando tarea:', error);
        showMessage('❌ Error de conexión al rechazar tarea', 'error');
    }
}

// Función para bloquear usuario (tasker o cliente)
async function bloquearUsuario(usuarioId, tipo) {
    const tipoTexto = tipo === 'tasker' ? 'tasker' : 'cliente';
    if (!confirm(`¿Estás seguro de que quieres bloquear a este ${tipoTexto}?`)) {
        return;
    }

    try {
        if (!currentToken) {
            showMessage('❌ Debes iniciar sesión primero', 'error');
            return;
        }

        const response = await fetch(`${API_BASE}/admin/user/block/${usuarioId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentToken}`
            },
            body: JSON.stringify({ 
                bloqueado: true,
                tipo: tipo
            })
        });

        const data = await response.json();

        if (response.ok) {
            showMessage(`✅ ${data.message}`, 'success');
            setTimeout(() => {
                if (tipo === 'tasker') {
                    loadAdminTaskers(currentAdminFilter.taskers || 'pending');
                } else {
                    loadAdminClientes(currentAdminFilter.clientes || 'all');
                }
                loadAdminStats();
            }, 1000);
        } else {
            showMessage(`❌ Error: ${data.message || `Error al bloquear ${tipoTexto}`}`, 'error');
        }
    } catch (error) {
        console.error(`Error bloqueando ${tipoTexto}:`, error);
        showMessage(`❌ Error de conexión al bloquear ${tipoTexto}`, 'error');
    }
}

// Función para desbloquear usuario (tasker o cliente)
async function desbloquearUsuario(usuarioId, tipo) {
    const tipoTexto = tipo === 'tasker' ? 'tasker' : 'cliente';
    if (!confirm(`¿Estás seguro de que quieres desbloquear a este ${tipoTexto}?`)) {
        return;
    }

    try {
        if (!currentToken) {
            showMessage('❌ Debes iniciar sesión primero', 'error');
            return;
        }

        const response = await fetch(`${API_BASE}/admin/user/block/${usuarioId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentToken}`
            },
            body: JSON.stringify({ 
                bloqueado: false,
                tipo: tipo
            })
        });

        const data = await response.json();

        if (response.ok) {
            showMessage(`✅ ${data.message}`, 'success');
            setTimeout(() => {
                if (tipo === 'tasker') {
                    loadAdminTaskers(currentAdminFilter.taskers || 'pending');
                } else {
                    loadAdminClientes(currentAdminFilter.clientes || 'all');
                }
                loadAdminStats();
            }, 1000);
        } else {
            showMessage(`❌ Error: ${data.message || `Error al desbloquear ${tipoTexto}`}`, 'error');
        }
    } catch (error) {
        console.error(`Error desbloqueando ${tipoTexto}:`, error);
        showMessage(`❌ Error de conexión al desbloquear ${tipoTexto}`, 'error');
    }
}

// Función para que un tasker acepte una tarea
// Función helper para obtener headers con X-User-Mode si es necesario
function getAuthHeaders(additionalHeaders = {}, forceMode = null) {
    const headers = {
        'Authorization': `Bearer ${currentToken}`,
        ...additionalHeaders
    };
    
    // Para usuarios duales, enviar el header X-User-Mode para indicar el modo activo
    if (currentUser && currentUser.esUsuarioDual) {
        // Si se especifica un modo forzado, usarlo; si no, usar el modo actual
        headers['X-User-Mode'] = forceMode !== null ? forceMode : taskerMode;
    }
    
    return headers;
}

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
            headers: getAuthHeaders({
                'Content-Type': 'application/json'
            })
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
    // Cargar categorías para el formulario de registro
    loadCategoriasForRegistration();
    
    // Formularios
    document.getElementById('clienteForm').addEventListener('submit', registerCliente);
    document.getElementById('taskerForm').addEventListener('submit', registerTasker);
    document.getElementById('loginForm').addEventListener('submit', login);
    
    // Event listeners para recuperación de contraseña
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', forgotPassword);
    }
    
    const resetPasswordForm = document.getElementById('resetPasswordForm');
    if (resetPasswordForm) {
        resetPasswordForm.addEventListener('submit', resetPassword);
    }
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
    
    // Listener para resize (mostrar/ocultar bottom nav según tamaño)
    window.addEventListener('resize', function() {
        if (currentUser) {
            const bottomNav = document.getElementById('bottomNav');
            const menuToggle = document.getElementById('menuToggle');
            
            // Bottom nav siempre visible cuando hay usuario logueado
            if (bottomNav) bottomNav.style.display = 'flex';
            
            // Mostrar menú hamburguesa siempre cuando hay usuario logueado
            if (menuToggle) menuToggle.style.display = 'flex';
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
        { id: 'taskerCategoriaPrincipal', name: 'Categoría Principal' }
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
    // Agregar clase al container para ajustar padding
    const container = document.querySelector('.container');
    if (container) {
        container.classList.add('has-bottom-nav');
    }

    // Ocultar top nav (login/registro)
    const topNav = document.getElementById('topNav');
    if (topNav) {
        topNav.style.display = 'none';
    }

    // Mostrar bottom navigation siempre cuando hay usuario logueado
    const bottomNav = document.getElementById('bottomNav');
    if (bottomNav) {
        bottomNav.style.display = 'flex';
    }

    // Mostrar menú hamburguesa siempre cuando hay usuario logueado
    const menuToggle = document.getElementById('menuToggle');
    if (menuToggle) {
        menuToggle.style.display = 'flex';
    }

    // Mostrar botón de chat en header (solo en desktop, pero visible siempre)
    const headerChatBtn = document.getElementById('headerChatBtn');
    if (headerChatBtn && currentUser && (currentUser.tipo === 'cliente' || currentUser.tipo === 'tasker' || currentUser.esUsuarioDual)) {
        headerChatBtn.style.display = 'flex';
    }

    // Ocultar demo button en header (deshabilitado)
    const demoBtnHeader = document.querySelector('.demo-btn-header');
    if (demoBtnHeader) {
        demoBtnHeader.style.display = 'none';
    }

    // Configurar menú móvil según tipo de usuario
    setupMobileMenu();

    // Marcar la pestaña activa en bottom nav
    updateBottomNavActive('tasks');
}

// Función para configurar el menú móvil según el tipo de usuario
function setupMobileMenu() {
    const dashboardItem = document.querySelector('.mobile-menu-item[onclick*="dashboard"]');
    const adminItem = document.querySelector('.mobile-menu-item[onclick*="admin"]');
    const chatItem = document.getElementById('mobileChatBtn');
    const availabilityItem = document.getElementById('mobileAvailabilityBtn');
    const logoutItem = document.querySelector('.mobile-menu-item.logout-item');

    // Mostrar dashboard si existe
    if (dashboardItem) {
        dashboardItem.style.display = 'flex';
    }

    // Mostrar chat siempre cuando está logueado (clientes y taskers pueden chatear)
    if (currentUser && (currentUser.tipo === 'cliente' || currentUser.tipo === 'tasker' || currentUser.esUsuarioDual) && chatItem) {
        chatItem.style.display = 'flex';
    }

    // Mostrar admin solo si es admin
    if (currentUser && currentUser.tipo === 'admin' && adminItem) {
        adminItem.style.display = 'flex';
    }

    // Mostrar disponibilidad solo si es tasker (incluyendo usuarios duales)
    if (currentUser && isTasker() && availabilityItem) {
        availabilityItem.style.display = 'flex';
        updateMobileAvailabilityButton();
    }

    // Mostrar logout siempre cuando está logueado
    if (logoutItem) {
        logoutItem.style.display = 'flex';
    }
}

// Función para actualizar el botón de disponibilidad en el menú móvil
function updateMobileAvailabilityButton() {
    const availabilityItem = document.getElementById('mobileAvailabilityBtn');
    const availabilityText = document.getElementById('availabilityText');
    
    if (!availabilityItem || !currentUser || !isTasker()) return;

    // Para usuarios duales, usar disponible_tasker; para taskers puros, usar disponible
    let disponible = false;
    if (currentUser.esUsuarioDual) {
        disponible = currentUser.disponible_tasker !== undefined ? currentUser.disponible_tasker : true;
    } else {
        disponible = currentUser.disponible !== undefined ? currentUser.disponible : true;
    }

    if (disponible) {
        if (availabilityText) availabilityText.textContent = 'DISPONIBLE';
        availabilityItem.style.color = '#10b981';
        // Actualizar el ícono si existe
        const icon = availabilityItem.querySelector('.menu-icon');
        if (icon) icon.textContent = '✅';
    } else {
        if (availabilityText) availabilityText.textContent = 'NO DISPONIBLE';
        availabilityItem.style.color = '#ef4444';
        // Actualizar el ícono si existe
        const icon = availabilityItem.querySelector('.menu-icon');
        if (icon) icon.textContent = '❌';
    }
}

// Función para toggle del menú móvil
function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    const menuOverlay = document.getElementById('menuOverlay');
    const menuToggle = document.getElementById('menuToggle');

    if (!mobileMenu || !menuOverlay || !menuToggle) return;

    const isActive = mobileMenu.classList.contains('active');

    if (isActive) {
        mobileMenu.classList.remove('active');
        menuOverlay.classList.remove('active');
        menuToggle.classList.remove('active');
    } else {
        mobileMenu.classList.add('active');
        menuOverlay.classList.add('active');
        menuToggle.classList.add('active');
    }
}

// Función para actualizar el botón activo en bottom nav
function updateBottomNavActive(tabName) {
    const bottomNavBtns = document.querySelectorAll('.bottom-nav-btn');
    bottomNavBtns.forEach(btn => {
        btn.classList.remove('active');
        const dataTab = btn.getAttribute('data-tab');
        if (dataTab === tabName) {
            btn.classList.add('active');
        }
    });
}

// Función para mostrar crear tarea (desde bottom nav) - DEPRECADA, usar showCreateTaskTab()
function showCreateTask() {
    showCreateTaskTab();
}

// Función para actualizar el texto y estilo del botón de disponibilidad
function updateAvailabilityButton() {
    const availabilityBtn = document.getElementById('availabilityBtn');
    updateMobileAvailabilityButton(); // También actualizar en menú móvil
    if (!availabilityBtn || !currentUser) return;

    // Para usuarios duales, usar disponible_tasker; para taskers puros, usar disponible
    let disponible = false;
    if (currentUser.esUsuarioDual) {
        disponible = currentUser.disponible_tasker !== undefined ? currentUser.disponible_tasker : true;
    } else {
        disponible = currentUser.disponible !== undefined ? currentUser.disponible : true;
    }
    
    if (disponible) {
        availabilityBtn.textContent = '✅ Disponible';
        availabilityBtn.classList.remove('unavailable');
        availabilityBtn.classList.add('available');
    } else {
        availabilityBtn.textContent = '❌ No Disponible';
        availabilityBtn.classList.remove('available');
        availabilityBtn.classList.add('unavailable');
    }
}

// Función para cambiar la disponibilidad del tasker
async function toggleAvailability() {
    try {
        if (!currentToken || !isTasker()) {
            showMessage('❌ Solo los taskers pueden cambiar su disponibilidad', 'error');
            return;
        }

        // Obtener disponibilidad actual
        let disponibleActual = false;
        if (currentUser.esUsuarioDual) {
            disponibleActual = currentUser.disponible_tasker !== undefined ? currentUser.disponible_tasker : true;
        } else {
            disponibleActual = currentUser.disponible !== undefined ? currentUser.disponible : true;
        }
        const nuevaDisponibilidad = !disponibleActual;
        
        // Para usuarios duales, usar tasker_id; para taskers puros, usar id
        const taskerId = currentUser.esUsuarioDual ? currentUser.tasker_id : currentUser.id;
        
        const response = await fetch(`${API_BASE}/tasker/profile/${taskerId}`, {
            method: 'PUT',
            headers: getAuthHeaders({
                'Content-Type': 'application/json'
            }),
            body: JSON.stringify({
                disponible: nuevaDisponibilidad
            })
        });

        const data = await response.json();

        if (response.ok) {
            // Actualizar currentUser
            if (currentUser.esUsuarioDual) {
                currentUser.disponible_tasker = nuevaDisponibilidad;
            } else {
                currentUser.disponible = nuevaDisponibilidad;
            }
            if (data.tasker) {
                if (currentUser.esUsuarioDual) {
                    currentUser.disponible_tasker = data.tasker.disponible;
                } else {
                    currentUser.disponible = data.tasker.disponible;
                }
            }
            
            // Actualizar el botón
            updateAvailabilityButton();
            updateMobileAvailabilityButton(); // Actualizar también en menú móvil
            
            showMessage(
                nuevaDisponibilidad 
                    ? '✅ Ahora estás disponible para recibir tareas' 
                    : '❌ Ya no estás disponible para recibir tareas',
                'success'
            );
        } else {
            showMessage(`❌ Error: ${data.message || 'Error al actualizar disponibilidad'}`, 'error');
        }
    } catch (error) {
        console.error('Error cambiando disponibilidad:', error);
        showMessage('❌ Error de conexión al cambiar disponibilidad', 'error');
    }
}

// Función para mostrar el contenido de tareas según el tipo de usuario
function showTasksContent(subtab = null) {
    try {
        console.log('🔄 showTasksContent ejecutándose...');

        const tasksContent = document.getElementById('tasksContent');
        if (!tasksContent) {
            console.error('❌ Elemento tasksContent no encontrado');
            alert('Error: Contenedor de tareas no encontrado');
            return;
        }

        const userType = getUserType(); // Usar función helper para normalizar tipo
        console.log('👤 Usuario tipo:', userType, currentUser.esUsuarioDual ? '(usuario dual)' : '');

        let tasksHTML = `
            <div class="tasks-container">
                <div class="user-header">
                    <h2>${isCliente() ? '📋 Mis Tareas' : '📋 Tareas Disponibles'}</h2>
                    <p>Bienvenido, ${currentUser.nombre} ${currentUser.apellido}</p>
                </div>
        `;

        if (isCliente()) {
            console.log('👤 RENDERIZANDO DASHBOARD CLIENTE');
            // Para clientes: pestañas para organizar tareas
            tasksHTML += `
            <div class="tasks-section">
                <!-- PESTAÑAS PARA CLIENTE -->
                <div class="client-tabs">
                    <button class="client-tab-btn" onclick="showClientTab('create')" id="tab-create">➕ Crear Tarea</button>
                    <button class="client-tab-btn active" onclick="showClientTab('pending')" id="tab-pending">⏳ Pendientes de Asignar</button>
                    <button class="client-tab-btn" onclick="showClientTab('assigned')" id="tab-assigned">📋 Tareas Asignadas</button>
                    <button class="client-tab-btn" onclick="showClientTab('history')" id="tab-history">📜 Historial</button>
                </div>

                <!-- CONTENIDO: CREAR TAREA -->
                <div id="client-tab-create" class="client-tab-content">
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
                            <div class="service-selection" id="serviceSelectionContainer">
                                <!-- Las categorías se cargarán dinámicamente aquí -->
                                <p>Cargando categorías...</p>
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

                <!-- CONTENIDO: TAREAS PENDIENTES DE ASIGNAR -->
                <div id="client-tab-pending" class="client-tab-content active">
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
        } else if (isTasker()) {
            // Para taskers (incluyendo usuarios duales): permitir elegir entre modo tasker o modo cliente
            const aprobado = currentUser.esUsuarioDual ? (currentUser.aprobado_admin_tasker || false) : (currentUser.aprobado_admin || false);

            if (!aprobado) {
                tasksHTML += `
                    <div class="pending-approval">
                        <h3>⏳ Esperando Aprobación</h3>
                        <p>Tu cuenta está pendiente de aprobación por el administrador.</p>
                        <p>Contacta al soporte para acelerar el proceso.</p>
                    </div>
                `;
            } else {
                // Selector de modo compacto (toggle switch) para taskers
                const isTaskerMode = taskerMode === 'tasker';
                tasksHTML += `
                <div class="mode-selector-compact" style="margin-bottom: 20px;">
                    <label class="mode-toggle-label">
                        <span class="mode-label-text">🔧 Modo Tasker</span>
                        <div class="toggle-switch">
                            <input type="checkbox" id="modeToggle" ${isTaskerMode ? 'checked' : ''} onchange="setTaskerMode(this.checked ? 'tasker' : 'cliente');">
                            <span class="toggle-slider"></span>
                        </div>
                        <span class="mode-label-text">👤 Modo Cliente</span>
                    </label>
                    <p class="mode-hint">${isTaskerMode ? 'Buscar y aplicar a tareas' : 'Crear tareas y contratar'}</p>
                </div>
            `;
            
            // Mostrar contenido según el modo seleccionado
            if (taskerMode === 'cliente') {
                // Mostrar dashboard de cliente
                tasksHTML += `
                    <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); padding: 20px; border-radius: 16px; margin-bottom: 25px; border: 2px solid #3b82f6;">
                        <div style="display: flex; align-items: center; gap: 15px;">
                            <div style="font-size: 2em;">👤</div>
                            <div style="flex: 1;">
                                <h3 style="margin: 0 0 5px 0; color: #1e40af;">Modo Cliente Activado</h3>
                                <p style="margin: 0; color: #1e40af; opacity: 0.8; font-size: 0.9em;">
                                    Estás usando la plataforma como Cliente. Puedes crear tareas y contratar otros taskers.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div class="tasks-section">
                        <!-- PESTAÑAS PARA CLIENTE -->
                        <div class="client-tabs">
                            <button class="client-tab-btn" onclick="showClientTab('create')" id="tab-create">➕ Crear Tarea</button>
                            <button class="client-tab-btn active" onclick="showClientTab('pending')" id="tab-pending">⏳ Pendientes de Asignar</button>
                            <button class="client-tab-btn" onclick="showClientTab('assigned')" id="tab-assigned">📋 Tareas Asignadas</button>
                            <button class="client-tab-btn" onclick="showClientTab('history')" id="tab-history">📜 Historial</button>
                        </div>
                        
                        <!-- CONTENIDO: CREAR TAREA -->
                        <div id="client-tab-create" class="client-tab-content">
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
                                        <div class="service-selection" id="serviceSelectionContainerTasker">
                                            <!-- Las categorías se cargarán dinámicamente aquí -->
                                            <p>Cargando categorías...</p>
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
                                        <button type="button" id="prevStep" class="btn-secondary" style="display: none;">← Anterior</button>
                                        <div class="step-indicator">
                                            <span id="currentStepText">Paso 1 de 4</span>
                                        </div>
                                        <button type="button" id="nextStep" class="btn-primary">Siguiente →</button>
                                    </div>
                                </div>
                                
                                <!-- FORMULARIO ORIGINAL (OCULTO) -->
                                <form id="taskForm" class="task-form" style="display: none;">
                                    <input type="hidden" id="taskTipoServicio">
                                    <button type="submit" class="create-btn" style="display: none;">Crear Tarea</button>
                                </form>
                            </div>
                        </div>
                        
                        <!-- CONTENIDO: TAREAS PENDIENTES DE ASIGNAR -->
                        <div id="client-tab-pending" class="client-tab-content active">
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
            } else {
                // Mostrar dashboard de tasker
                tasksHTML += `
                <!-- PESTAÑAS PARA TASKER -->
                <div class="tasker-tabs">
                    <button class="tasker-tab-btn" onclick="showTaskerTab('available')" id="tab-available">🔍 Búsqueda</button>
                    <button class="tasker-tab-btn active" onclick="showTaskerTab('assigned')" id="tab-assigned-tasker">📋 Asignadas</button>
                    <button class="tasker-tab-btn" onclick="showTaskerTab('pending-payment')" id="tab-pending-payment">💳 Pendientes de Pago</button>
                    <button class="tasker-tab-btn" onclick="showTaskerTab('history')" id="tab-history-tasker">📜 Historial</button>
                </div>

                <!-- CONTENIDO: TAREAS DISPONIBLES -->
                <div id="tasker-tab-available" class="tasker-tab-content">
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
                                    <!-- Se llenará dinámicamente con las categorías -->
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
                <div id="tasker-tab-assigned" class="tasker-tab-content active">
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
        }

        tasksHTML += `</div>`;
        tasksContent.innerHTML = tasksHTML;
        console.log('📄 HTML INSERTADO EN DOM');

        // Si es cliente O tasker en modo cliente, agregar el event listener para el formulario
        if (userType === 'cliente' || (userType === 'tasker' && taskerMode === 'cliente')) {
            const taskForm = document.getElementById('taskForm');
            if (taskForm) {
                taskForm.addEventListener('submit', createTask);
            }
            
            // Si se especificó un subtab, cambiar la pestaña activa
            if (subtab) {
                setTimeout(() => {
                    showClientTab(subtab);
                }, 100);
            }
            
            // Cargar todas las tareas (se mostrarán según la pestaña activa)
            loadClientPendingTasks(); // Cargar tareas pendientes de asignar
            loadClientAssignedTasks(); // Cargar tareas asignadas/en proceso
            loadClientHistoryTasks(); // Cargar historial
            
            // Cargar categorías y luego inicializar el wizard
            loadCategorias().then(() => {
                // Renderizar las categorías en el wizard
                renderCategoriasInWizard();
                // Inicializar el wizard después de que el DOM esté listo
                setTimeout(() => {
                    console.log('🎯 Inicializando wizard después de renderizar...');
                    initializeWizard();
                }, 100);
            });
        } else if (userType === 'admin') {
            // Admin no necesita cargar tareas aquí, tiene su propio panel
            console.log('👨‍💼 Admin en panel de tareas - usar panel ADMIN para gestionar');
        } else if (isTasker() && taskerMode === 'tasker') {
            const aprobado = currentUser.esUsuarioDual ? (currentUser.aprobado_admin_tasker || false) : (currentUser.aprobado_admin || false);
            if (aprobado) {
                // Si se especificó un subtab, cambiar la pestaña activa
                if (subtab) {
                    setTimeout(() => {
                        showTaskerTab(subtab);
                    }, 100);
                }
                
                // Cargar todas las tareas (se mostrarán según la pestaña activa)
                loadTaskerAssignedTasks(); // Cargar tareas asignadas del tasker
                loadAvailableTasks(); // Cargar tareas disponibles para taskers aprobados
                loadTaskerPendingPaymentTasks(); // Cargar tareas pendientes de pago
                loadTaskerHistoryTasks(); // Cargar historial del tasker
                // Inicializar filtros después de un breve delay para asegurar que el DOM esté listo
                setTimeout(initializeFilters, 100);
            }
        }

    } catch (error) {
        console.error('❌ Error en showTasksContent:', error);
        alert('Error al mostrar el contenido de tareas: ' + error.message);
    }
}

// Función para mostrar el contenido del dashboard
function showDashboardContent() {
    try {
        console.log('🔄 showDashboardContent ejecutándose...');

        const dashboardContent = document.getElementById('dashboardContent');
        if (!dashboardContent) {
            console.error('❌ Elemento dashboardContent no encontrado');
            return;
        }

        const userType = getUserType(); // Usar función helper
        console.log('🔍 Dashboard - userType:', userType);
        console.log('🔍 Dashboard - esUsuarioDual:', currentUser.esUsuarioDual);
        console.log('🔍 Dashboard - isTasker():', isTasker());
        console.log('🔍 Dashboard - isCliente():', isCliente());
        
        let dashboardHTML = '';

        if (userType === 'admin') {
            // Para admin, redirigir al panel admin
            showTab('admin');
            return;
        } else if (isTasker()) {
            // Dashboard para tasker (incluyendo usuarios duales)
            const aprobado = currentUser.esUsuarioDual ? (currentUser.aprobado_admin_tasker || false) : (currentUser.aprobado_admin || false);
            
            if (!aprobado) {
                dashboardHTML = `
                    <div class="dashboard-container">
                        <div class="dashboard-header">
                            <h2>📊 Menú Principal</h2>
                            <p>Bienvenido, ${currentUser.nombre} ${currentUser.apellido}</p>
                        </div>
                        
                        <div class="pending-approval">
                            <h3>⏳ Esperando Aprobación</h3>
                            <p>Tu cuenta está pendiente de aprobación por el administrador.</p>
                            <p>Contacta al soporte para acelerar el proceso.</p>
                        </div>
                    </div>
                `;
            } else {
                // Selector de modo compacto (toggle switch)
                const isTaskerMode = taskerMode === 'tasker';
                dashboardHTML = `
                    <div class="dashboard-container">
                        <div class="dashboard-header">
                            <h2>📊 Menú Principal</h2>
                            <p>Bienvenido, ${currentUser.nombre} ${currentUser.apellido}</p>
                        </div>
                        
                        <div class="mode-selector-compact">
                            <label class="mode-toggle-label">
                                <span class="mode-label-text">🔧 Modo Tasker</span>
                                <div class="toggle-switch">
                                    <input type="checkbox" id="modeToggle" ${isTaskerMode ? 'checked' : ''} onchange="setTaskerMode(this.checked ? 'tasker' : 'cliente'); showTabWithContent('tasks');">
                                    <span class="toggle-slider"></span>
                                </div>
                                <span class="mode-label-text">👤 Modo Cliente</span>
                            </label>
                            <p class="mode-hint">${isTaskerMode ? 'Buscar y aplicar a tareas' : 'Crear tareas y contratar'}</p>
                        </div>
                        
                        <div class="dashboard-quick-actions">
                            <h3>⚡ Acciones Rápidas</h3>
                            <p style="color: #64748b; font-size: 0.9em; margin-bottom: 20px; text-align: center;">Accede a todas las funcionalidades de la plataforma</p>
                            <div class="quick-actions-grid">
                                ${isTaskerMode ? `
                                    <button class="quick-action-btn" onclick="showSearchTasks(); updateBottomNavActive('tasks');">
                                        <div class="quick-action-icon">🔍</div>
                                        <div class="quick-action-text">
                                            <strong>Buscar Tareas</strong>
                                            <small>Ver tareas disponibles</small>
                                        </div>
                                    </button>
                                    
                                    <button class="quick-action-btn" onclick="showMyTasks(); updateBottomNavActive('tasks');">
                                        <div class="quick-action-icon">📋</div>
                                        <div class="quick-action-text">
                                            <strong>Mis Tareas</strong>
                                            <small>Tareas asignadas</small>
                                        </div>
                                    </button>
                                ` : `
                                    <button class="quick-action-btn" onclick="showCreateTaskTab(); updateBottomNavActive('tasks');">
                                        <div class="quick-action-icon">➕</div>
                                        <div class="quick-action-text">
                                            <strong>Crear Tarea</strong>
                                            <small>Publicar un nuevo trabajo</small>
                                        </div>
                                    </button>
                                    
                                    <button class="quick-action-btn" onclick="showMyTasks(); updateBottomNavActive('tasks');">
                                        <div class="quick-action-icon">📋</div>
                                        <div class="quick-action-text">
                                            <strong>Mis Tareas</strong>
                                            <small>Ver todas mis tareas</small>
                                        </div>
                                    </button>
                                `}
                                
                                <button class="quick-action-btn" onclick="showTabWithContent('search'); updateBottomNavActive('search');">
                                    <div class="quick-action-icon">🔍</div>
                                    <div class="quick-action-text">
                                        <strong>Buscar</strong>
                                        <small>Buscar en la plataforma</small>
                                    </div>
                                </button>
                                
                                <button class="quick-action-btn" onclick="showTabWithContent('profile'); updateBottomNavActive('profile');">
                                    <div class="quick-action-icon">👤</div>
                                    <div class="quick-action-text">
                                        <strong>Mi Perfil</strong>
                                        <small>Ver y editar perfil</small>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            }
        } else if (isCliente()) {
            // Dashboard para cliente - Menú Principal
            dashboardHTML = `
                <div class="dashboard-container">
                    <div class="dashboard-header">
                        <h2>📊 Menú Principal</h2>
                        <p>Bienvenido, ${currentUser.nombre} ${currentUser.apellido}</p>
                    </div>
                    
                    <div class="dashboard-quick-actions">
                        <h3>⚡ Acciones Rápidas</h3>
                        <p style="color: #64748b; font-size: 0.9em; margin-bottom: 20px; text-align: center;">Accede a todas las funcionalidades de la plataforma</p>
                        <div class="quick-actions-grid">
                            <button class="quick-action-btn" onclick="showCreateTaskTab(); updateBottomNavActive('tasks');">
                                <div class="quick-action-icon">➕</div>
                                <div class="quick-action-text">
                                    <strong>Crear Tarea</strong>
                                    <small>Publicar un nuevo trabajo</small>
                                </div>
                            </button>
                            
                            <button class="quick-action-btn" onclick="showMyTasks(); updateBottomNavActive('tasks');">
                                <div class="quick-action-icon">📋</div>
                                <div class="quick-action-text">
                                    <strong>Mis Tareas</strong>
                                    <small>Ver todas mis tareas</small>
                                </div>
                            </button>
                            
                            <button class="quick-action-btn" onclick="showTabWithContent('search'); updateBottomNavActive('search');">
                                <div class="quick-action-icon">🔍</div>
                                <div class="quick-action-text">
                                    <strong>Buscar</strong>
                                    <small>Buscar taskers</small>
                                </div>
                            </button>
                            
                            <button class="quick-action-btn" onclick="showTabWithContent('profile'); updateBottomNavActive('profile');">
                                <div class="quick-action-icon">👤</div>
                                <div class="quick-action-text">
                                    <strong>Mi Perfil</strong>
                                    <small>Ver y editar perfil</small>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        } else if (isTasker()) {
            // Dashboard para tasker (incluyendo usuarios duales)
            // Para usuarios duales, verificar aprobación del tasker
            const aprobado = currentUser.esUsuarioDual ? (currentUser.aprobado_admin_tasker || false) : (currentUser.aprobado_admin || false);
            
            if (!aprobado) {
                dashboardHTML = `
                    <div class="dashboard-container">
                        <div class="dashboard-header">
                            <h2>📊 Menú Principal</h2>
                            <p>Bienvenido, ${currentUser.nombre} ${currentUser.apellido}</p>
                        </div>
                        
                        <div class="pending-approval">
                            <h3>⏳ Esperando Aprobación</h3>
                            <p>Tu cuenta está pendiente de aprobación por el administrador.</p>
                            <p>Contacta al soporte para acelerar el proceso.</p>
                        </div>
                    </div>
                `;
            } else {
                // Selector de modo compacto (toggle switch)
                const isTaskerMode = taskerMode === 'tasker';
                dashboardHTML = `
                    <div class="dashboard-container">
                        <div class="dashboard-header">
                            <h2>📊 Menú Principal</h2>
                            <p>Bienvenido, ${currentUser.nombre} ${currentUser.apellido}</p>
                        </div>
                        
                        <div class="mode-selector-compact">
                            <label class="mode-toggle-label">
                                <span class="mode-label-text">🔧 Modo Tasker</span>
                                <div class="toggle-switch">
                                    <input type="checkbox" id="modeToggle" ${isTaskerMode ? 'checked' : ''} onchange="setTaskerMode(this.checked ? 'tasker' : 'cliente'); showTabWithContent('tasks');">
                                    <span class="toggle-slider"></span>
                                </div>
                                <span class="mode-label-text">👤 Modo Cliente</span>
                            </label>
                            <p class="mode-hint">${isTaskerMode ? 'Buscar y aplicar a tareas' : 'Crear tareas y contratar'}</p>
                        </div>
                        
                        <div class="dashboard-quick-actions">
                            <h3>⚡ Acciones Rápidas</h3>
                            <p style="color: #64748b; font-size: 0.9em; margin-bottom: 20px; text-align: center;">Accede a todas las funcionalidades de la plataforma</p>
                            <div class="quick-actions-grid">
                                ${isTaskerMode ? `
                                    <button class="quick-action-btn" onclick="showSearchTasks(); updateBottomNavActive('tasks');">
                                        <div class="quick-action-icon">🔍</div>
                                        <div class="quick-action-text">
                                            <strong>Buscar Tareas</strong>
                                            <small>Ver tareas disponibles</small>
                                        </div>
                                    </button>
                                    
                                    <button class="quick-action-btn" onclick="showMyTasks(); updateBottomNavActive('tasks');">
                                        <div class="quick-action-icon">📋</div>
                                        <div class="quick-action-text">
                                            <strong>Mis Tareas</strong>
                                            <small>Tareas asignadas</small>
                                        </div>
                                    </button>
                                ` : `
                                    <button class="quick-action-btn" onclick="showCreateTaskTab(); updateBottomNavActive('tasks');">
                                        <div class="quick-action-icon">➕</div>
                                        <div class="quick-action-text">
                                            <strong>Crear Tarea</strong>
                                            <small>Publicar un nuevo trabajo</small>
                                        </div>
                                    </button>
                                    
                                    <button class="quick-action-btn" onclick="showMyTasks(); updateBottomNavActive('tasks');">
                                        <div class="quick-action-icon">📋</div>
                                        <div class="quick-action-text">
                                            <strong>Mis Tareas</strong>
                                            <small>Ver todas mis tareas</small>
                                        </div>
                                    </button>
                                `}
                                
                                <button class="quick-action-btn" onclick="showTabWithContent('search'); updateBottomNavActive('search');">
                                    <div class="quick-action-icon">🔍</div>
                                    <div class="quick-action-text">
                                        <strong>Buscar</strong>
                                        <small>Buscar en la plataforma</small>
                                    </div>
                                </button>
                                
                                <button class="quick-action-btn" onclick="showTabWithContent('profile'); updateBottomNavActive('profile');">
                                    <div class="quick-action-icon">👤</div>
                                    <div class="quick-action-text">
                                        <strong>Mi Perfil</strong>
                                        <small>Ver y editar perfil</small>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            }
        }

        dashboardContent.innerHTML = dashboardHTML;
        console.log('✅ Dashboard cargado correctamente');

    } catch (error) {
        console.error('❌ Error en showDashboardContent:', error);
        alert('Error al mostrar el dashboard: ' + error.message);
    }
}

// Función para hacer logout
function logout() {
    currentUser = null;
    currentToken = null;

    // Remover clase del container
    const container = document.querySelector('.container');
    if (container) {
        container.classList.remove('has-bottom-nav');
    }

    // Ocultar bottom navigation
    const bottomNav = document.getElementById('bottomNav');
    if (bottomNav) {
        bottomNav.style.display = 'none';
    }

    // Ocultar menú hamburguesa
    const menuToggle = document.getElementById('menuToggle');
    if (menuToggle) {
        menuToggle.style.display = 'none';
    }

    // Ocultar botón de chat en header
    const headerChatBtn = document.getElementById('headerChatBtn');
    if (headerChatBtn) {
        headerChatBtn.style.display = 'none';
    }

    // Cerrar menú móvil si está abierto
    const mobileMenu = document.getElementById('mobileMenu');
    const menuOverlay = document.getElementById('menuOverlay');
    if (mobileMenu && mobileMenu.classList.contains('active')) {
        toggleMobileMenu();
    }

    // Demo button ya está oculto permanentemente

    // Ocultar botón de disponibilidad directamente por ID
    const availabilityBtn = document.getElementById('availabilityBtn');
    if (availabilityBtn) {
        availabilityBtn.style.display = 'none';
    }

    // Ocultar items del menú móvil
    document.querySelectorAll('.mobile-menu-item').forEach(item => {
        if (!item.onclick || !item.onclick.toString().includes('Demo')) {
            item.style.display = 'none';
        }
    });

    // Mostrar top nav (login/registro)
    const topNav = document.getElementById('topNav');
    if (topNav) {
        topNav.style.display = 'flex';
    }

    // Restaurar pestañas originales
    document.querySelectorAll('.tab-btn').forEach(btn => {
        if (btn.onclick && btn.onclick.toString().includes('register')) {
            btn.style.display = 'inline-block';
            btn.classList.remove('active');
        } else if (btn.onclick && btn.onclick.toString().includes('login')) {
            btn.style.display = 'inline-block';
            btn.classList.add('active');
        } else if (btn.id === 'availabilityBtn') {
            // Ya lo ocultamos arriba, pero por si acaso
            btn.style.display = 'none';
        } else if (btn.onclick && (btn.onclick.toString().includes('dashboard') ||
                   btn.onclick.toString().includes('tasks') ||
                   btn.onclick.toString().includes('profile') ||
                   btn.onclick.toString().includes('search') ||
                   btn.onclick.toString().includes('toggleAvailability') ||
                   btn.onclick.toString().includes('admin') ||
                   btn.onclick.toString().includes('logout'))) {
            btn.style.display = 'none';
            if (btn.onclick.toString().includes('tasks')) {
                btn.textContent = 'Tareas';
            }
        }
    });

    // Limpiar dashboard
    const dashboardContent = document.getElementById('dashboardContent');
    if (dashboardContent) {
        dashboardContent.innerHTML = '';
    }

    // Volver a la pestaña de login
    showTab('login');

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
                            <div class="task-actions" onclick="event.stopPropagation();">
                                ${tarea.estado === 'PENDIENTE' ? `
                                    <button class="view-applications-btn" onclick="loadTaskApplications(${tarea.id})">👥 Ver Aplicaciones</button>
                                ` : ''}
                                ${(tarea.estado === 'PENDIENTE' && tarea.aplicaciones_count > 0) || (tarea.estado !== 'PENDIENTE' && tarea.tasker_id) ? `
                                    <button class="chat-btn" onclick="openChatModal(${tarea.id})" title="Abrir chat">
                                        💬 Chat
                                        <span id="chat-badge-${tarea.id}" class="chat-badge" style="display: none;">0</span>
                                    </button>
                                ` : ''}
                            </div>
                            ${tarea.estado === 'PENDIENTE' ? `
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
                                    <button class="chat-btn" onclick="openChatModal(${tareaId})" title="Abrir chat con ${tasker.nombre}">
                                        💬 Chat
                                        <span id="chat-badge-${tareaId}" class="chat-badge" style="display: none;">0</span>
                                    </button>
                                    <button class="accept-application-btn" onclick="acceptApplication(${aplicacion.id}, ${tareaId})">✅ Aceptar</button>
                                    <button class="reject-application-btn" onclick="rejectApplication(${aplicacion.id}, ${tareaId})">❌ Rechazar</button>
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

// Función para rechazar una aplicación
async function rejectApplication(applicationId, tareaId) {
    if (!confirm('¿Estás seguro de que quieres rechazar esta aplicación?')) {
        return;
    }

    try {
        if (!currentToken) {
            showMessage('❌ Debes iniciar sesión primero', 'error');
            return;
        }

        const response = await fetch(`${API_BASE}/task/reject-application/${applicationId}`, {
            method: 'POST',
            headers: getAuthHeaders()
        });

        const data = await response.json();

        if (response.ok) {
            showMessage(`✅ ${data.message}`, 'success');
            // Recargar las aplicaciones después de un breve delay
            if (tareaId) {
                setTimeout(() => {
                    loadTaskApplications(tareaId);
                }, 500);
            }
        } else {
            showMessage(`❌ Error: ${data.message || 'Error al rechazar aplicación'}`, 'error');
        }
    } catch (error) {
        console.error('Error rechazando aplicación:', error);
        showMessage('❌ Error de conexión al rechazar aplicación', 'error');
    }
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
                                ${tarea.aplicaciones_count > 0 ? `
                                    <button class="chat-btn" onclick="openChatModal(${tarea.id})" title="Abrir chat">
                                        💬 Chat
                                        <span id="chat-badge-${tarea.id}" class="chat-badge" style="display: none;">0</span>
                                    </button>
                                ` : ''}
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
            // Filtrar solo las asignadas/en proceso (excluir FINALIZADA y CANCELADA)
            const tareasAsignadas = todasLasTareas.filter(t => {
                const estado = (t.estado || '').toUpperCase().trim();
                const estadosPermitidos = ['ASIGNADA', 'EN_PROCESO', 'PENDIENTE_PAGO'];
                const permitida = estadosPermitidos.includes(estado);
                // Debug: mostrar si alguna tarea finalizada pasa el filtro
                if (estado === 'FINALIZADA' && permitida) {
                    console.error('⚠️ ERROR: Tarea FINALIZADA pasó el filtro:', t);
                }
                return permitida;
            });

            if (tareasAsignadas.length > 0) {
                let tasksHTML = '';

                tareasAsignadas.forEach(tarea => {
                    // Validación adicional: no mostrar si está finalizada
                    const estadoTarea = (tarea.estado || '').toUpperCase().trim();
                    if (estadoTarea === 'FINALIZADA' || estadoTarea === 'CANCELADA') {
                        console.warn('⚠️ Tarea finalizada/cancelada detectada en renderizado:', tarea);
                        return; // Saltar esta tarea
                    }

                    const fecha = new Date(tarea.fecha_hora_requerida).toLocaleString('es-ES');
                    const estadoColor = {
                        'ASIGNADA': '#3b82f6',
                        'EN_PROCESO': '#8b5cf6',
                        'PENDIENTE_PAGO': '#f59e0b'
                    }[estadoTarea] || '#6b7280';
                    
                    const estadoTexto = {
                        'ASIGNADA': 'Tarea Asignada',
                        'EN_PROCESO': 'En Proceso',
                        'PENDIENTE_PAGO': 'Pendiente de Pago'
                    }[estadoTarea] || estadoTarea;

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
                            <div class="task-actions" onclick="event.stopPropagation();">
                                ${tarea.tasker_id ? `
                                    <button class="chat-btn" onclick="openChatModal(${tarea.id})" title="Abrir chat">
                                        💬 Chat
                                        <span id="chat-badge-${tarea.id}" class="chat-badge" style="display: none;">0</span>
                                    </button>
                                ` : ''}
                            ${estadoTarea === 'PENDIENTE_PAGO' ? `
                                    <button class="confirm-payment-btn" onclick="event.stopPropagation(); confirmPayment(${tarea.id})">💳 Confirmar Pago</button>
                                </div>
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
                .filter(t => {
                    const estado = (t.estado || '').toUpperCase().trim();
                    return estado !== 'PENDIENTE'; // Excluir pendientes (están en otra pestaña)
                })
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
                                <div id="rating-form-${tarea.id}" class="rating-form-container" style="display: none;" onclick="event.stopPropagation()"></div>
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
            headers: getAuthHeaders()
        });

        const data = await response.json();
        const taskerAssignedTasksList = document.getElementById('taskerAssignedTasksList');

        if (response.ok && taskerAssignedTasksList) {
            const todasLasTareas = data.tareas || [];
            // Filtrar solo las asignadas/en proceso (excluir FINALIZADA, CANCELADA y PENDIENTE_PAGO)
            const tareasAsignadas = todasLasTareas.filter(t => {
                const estado = (t.estado || '').toUpperCase().trim();
                return ['ASIGNADA', 'EN_PROCESO'].includes(estado);
            });

            if (tareasAsignadas.length > 0) {
                let tasksHTML = '';

                tareasAsignadas.forEach(tarea => {
                    // Validación adicional: no mostrar si está finalizada o cancelada
                    const estadoTarea = (tarea.estado || '').toUpperCase().trim();
                    if (estadoTarea === 'FINALIZADA' || estadoTarea === 'CANCELADA' || estadoTarea === 'PENDIENTE_PAGO') {
                        return; // Saltar esta tarea
                    }

                    const fecha = new Date(tarea.fecha_hora_requerida).toLocaleString('es-ES');
                    const estadoColor = {
                        'ASIGNADA': '#3b82f6',
                        'EN_PROCESO': '#8b5cf6'
                    }[estadoTarea] || '#6b7280';
                    
                    const estadoTexto = {
                        'ASIGNADA': 'Tarea Asignada',
                        'EN_PROCESO': 'En Proceso'
                    }[estadoTarea] || estadoTarea;

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
                            <div class="task-actions" onclick="event.stopPropagation();">
                                ${tarea.cliente_id ? `
                                    <button class="chat-btn" onclick="openChatModal(${tarea.id})" title="Abrir chat">
                                        💬 Chat
                                        <span id="chat-badge-${tarea.id}" class="chat-badge" style="display: none;">0</span>
                                    </button>
                                ` : ''}
                                ${estadoTarea === 'ASIGNADA' ? `
                                    <button class="start-task-btn" onclick="startTask(${tarea.id})">▶️ Empezar Tarea</button>
                                ` : ''}
                                ${estadoTarea === 'EN_PROCESO' ? `
                                    <button class="complete-task-btn" onclick="event.stopPropagation(); completeTask(${tarea.id})">✅ Finalizar Tarea</button>
                                ` : ''}
                            </div>
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
            headers: getAuthHeaders({
                'Content-Type': 'application/json'
            })
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
            headers: getAuthHeaders({
                'Content-Type': 'application/json'
            })
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
    if (!confirm('¿Estás conforme con el trabajo realizado? Al confirmar, esperarás la confirmación del tasker para finalizar la tarea.')) {
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
            // Verificar si la tarea fue finalizada (ambas partes confirmaron)
            if (data.tarea && data.tarea.estado === 'FINALIZADA') {
                showMessage('✅ ¡Pago confirmado! Como el tasker ya confirmó la recepción, la tarea ha sido finalizada. Ahora puedes calificar al tasker.', 'success');
            } else {
                showMessage('✅ ¡Pago confirmado! Esperando confirmación del tasker para finalizar la tarea.', 'success');
            }
            
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
            headers: getAuthHeaders({
                'Content-Type': 'application/json'
            })
        });

        const data = await response.json();

        if (response.ok) {
            // Verificar si la tarea fue finalizada (ambas partes confirmaron)
            if (data.tarea && data.tarea.estado === 'FINALIZADA') {
                showMessage('✅ ¡Recepción de pago confirmada! Como el cliente ya confirmó el pago, la tarea ha sido finalizada.', 'success');
            } else {
                showMessage('✅ ¡Recepción de pago confirmada! Esperando confirmación del cliente para finalizar la tarea.', 'success');
            }
            
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
            headers: getAuthHeaders()
        });

        const data = await response.json();
        const taskerPendingPaymentList = document.getElementById('taskerPendingPaymentList');

        if (response.ok && taskerPendingPaymentList) {
            const todasLasTareas = data.tareas || [];
            // Filtrar las pendientes de pago: incluir PENDIENTE_PAGO y FINALIZADA sin ambas confirmaciones
            const tareasPendientes = todasLasTareas.filter(t => {
                const estado = (t.estado || '').toUpperCase().trim();
                const clienteConfirmo = !!t.fecha_confirmacion_pago;
                const taskerConfirmo = !!t.pago_recibido_tasker;
                const ambasConfirmaron = clienteConfirmo && taskerConfirmo;
                
                // Incluir si está en PENDIENTE_PAGO o si está FINALIZADA pero falta alguna confirmación
                return estado === 'PENDIENTE_PAGO' || (estado === 'FINALIZADA' && !ambasConfirmaron);
            });

            if (tareasPendientes.length > 0) {
                let tasksHTML = '';

                tareasPendientes.forEach(tarea => {
                    const fecha = new Date(tarea.fecha_hora_requerida).toLocaleString('es-ES');
                    const fechaFinalizacion = tarea.fecha_finalizacion_trabajo ? 
                        new Date(tarea.fecha_finalizacion_trabajo).toLocaleString('es-ES') : 'N/A';
                    
                    const nombreCliente = tarea.cliente && tarea.cliente.nombre ? 
                        `${tarea.cliente.nombre} ${tarea.cliente.apellido || ''}` : 'Cliente';

                    // Verificar quién ha confirmado
                    const clienteConfirmo = !!tarea.fecha_confirmacion_pago;
                    const taskerConfirmo = !!tarea.pago_recibido_tasker;
                    const ambasConfirmaron = clienteConfirmo && taskerConfirmo;

                    // Calcular tiempo transcurrido desde la finalización
                    let tiempoEspera = '';
                    if (tarea.fecha_finalizacion_trabajo) {
                        const ahora = new Date();
                        const fechaFin = new Date(tarea.fecha_finalizacion_trabajo);
                        const horasTranscurridas = Math.round((ahora - fechaFin) / (60 * 60 * 1000));
                        if (horasTranscurridas < 48) {
                            tiempoEspera = `<p><strong>⏰ Tiempo de espera:</strong> ${horasTranscurridas} horas (auto-confirmación en ${48 - horasTranscurridas} horas)</p>`;
                        } else if (!clienteConfirmo) {
                            tiempoEspera = '<p><strong>⏰ Estado:</strong> Lista para auto-confirmación del cliente</p>';
                        }
                    }

                    // Indicadores de confirmación
                    let indicadoresConfirmacion = '';
                    if (clienteConfirmo && taskerConfirmo) {
                        indicadoresConfirmacion = '<p style="color: #10b981; font-weight: bold;">✅ Ambas partes confirmaron - La tarea será finalizada</p>';
                    } else if (clienteConfirmo) {
                        indicadoresConfirmacion = '<p style="color: #3b82f6;">✅ Cliente confirmó el pago - Esperando tu confirmación</p>';
                    } else if (taskerConfirmo) {
                        indicadoresConfirmacion = '<p style="color: #8b5cf6;">✅ Tú confirmaste la recepción - Esperando confirmación del cliente</p>';
                    } else {
                        indicadoresConfirmacion = '<p style="color: #f59e0b;">⏳ Esperando confirmación de ambas partes</p>';
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
                                ${indicadoresConfirmacion}
                            </div>
                            <div class="task-actions" onclick="event.stopPropagation();">
                                ${!taskerConfirmo ? `
                                    <button class="confirm-payment-received-btn" onclick="event.stopPropagation(); confirmPaymentReceived(${tarea.id})">✅ Confirmar Recepción de Pago</button>
                                ` : `
                                    <p class="payment-info" style="color: #10b981;">✅ Ya confirmaste la recepción del pago</p>
                                `}
                                ${!clienteConfirmo && !tarea.auto_confirmado ? `
                                    <p class="payment-info">💳 Esperando confirmación del cliente. El pago se liberará automáticamente después de 48 horas si el cliente no responde.</p>
                                ` : ''}
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
            headers: getAuthHeaders()
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

                    // Verificar confirmaciones reales
                    const clienteConfirmo = !!tarea.fecha_confirmacion_pago;
                    const taskerConfirmo = !!tarea.pago_recibido_tasker;
                    const ambasConfirmaron = clienteConfirmo && taskerConfirmo;
                    
                    // Si la tarea está marcada como FINALIZADA pero falta alguna confirmación,
                    // tratarla como PENDIENTE_PAGO para mostrar el botón de confirmación
                    let estadoReal = tarea.estado;
                    if (tarea.estado === 'FINALIZADA' && !ambasConfirmaron) {
                        estadoReal = 'PENDIENTE_PAGO';
                    }

                    const estadoColor = {
                        'ASIGNADA': '#3b82f6',
                        'EN_PROCESO': '#8b5cf6',
                        'PENDIENTE_PAGO': '#f59e0b',
                        'FINALIZADA': '#10b981',
                        'CANCELADA': '#ef4444'
                    }[estadoReal] || '#6b7280';
                    
                    const estadoTexto = {
                        'ASIGNADA': 'Tarea Asignada',
                        'EN_PROCESO': 'En Proceso',
                        'PENDIENTE_PAGO': 'Pendiente de Pago',
                        'FINALIZADA': 'Finalizada',
                        'CANCELADA': 'Cancelada'
                    }[estadoReal] || estadoReal;

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
                                ${ambasConfirmaron ? `<p><strong>Finalizada el:</strong> ${fechaFinalizacion}</p>` : ''}
                                ${tarea.auto_confirmado ? '<p><strong>ℹ️ Auto-confirmada</strong> (pasaron más de 48 horas)</p>' : ''}
                                ${taskerConfirmo ? '<p><strong>✅ Pago recibido y confirmado</strong></p>' : ''}
                                ${clienteConfirmo && !taskerConfirmo ? '<p style="color: #3b82f6;"><strong>✅ Cliente confirmó el pago</strong> - Esperando tu confirmación</p>' : ''}
                                ${!clienteConfirmo && taskerConfirmo ? '<p style="color: #8b5cf6;"><strong>✅ Tú confirmaste la recepción</strong> - Esperando confirmación del cliente</p>' : ''}
                            </div>
                            ${!taskerConfirmo && (estadoReal === 'PENDIENTE_PAGO' || tarea.estado === 'FINALIZADA') ? `
                                <div class="task-actions" onclick="event.stopPropagation();">
                                    <button class="confirm-payment-received-btn" onclick="event.stopPropagation(); confirmPaymentReceived(${tarea.id})">✅ Confirmar Recepción de Pago</button>
                                </div>
                            ` : ''}
                            ${ambasConfirmaron ? `
                                <div class="task-actions" onclick="event.stopPropagation();">
                                    <button class="rate-task-btn" onclick="showRatingForm(${tarea.id})">⭐ Calificar</button>
                                </div>
                                <div id="rating-form-${tarea.id}" class="rating-form-container" style="display: none;" onclick="event.stopPropagation()"></div>
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
            headers: getAuthHeaders()
        });

        const data = await response.json();

        const availableTasksList = document.getElementById('availableTasksList');
        const resultsCount = document.getElementById('resultsCount');

        if (response.ok) {
            let tareas = data.tareas || [];
            
            // Filtrar tareas donde el usuario dual es el cliente (doble verificación en frontend)
            if (currentUser && currentUser.esUsuarioDual && currentUser.cliente_id) {
                tareas = tareas.filter(tarea => tarea.cliente_id !== currentUser.cliente_id);
            }
            
            const paginacion = data.paginacion;
            const filtrosAplicados = data.filtrosAplicados;

            // Actualizar contador de resultados (usar el número real de tareas después del filtro)
            if (resultsCount) {
                resultsCount.textContent = `${tareas.length} tareas encontradas`;
            }

            if (tareas && tareas.length > 0) {
                let tasksHTML = '';

                tareas.forEach(tarea => {
                    const fecha = new Date(tarea.fecha_hora_requerida).toLocaleString('es-ES');
                    const categoriaTarea = categoriasDisponibles.find(cat => cat.id === tarea.tipo_servicio);
                    const tipoServicio = categoriaTarea ? `${categoriaTarea.icono} ${categoriaTarea.nombre}` : tarea.tipo_servicio;
                    
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
                                    `<span class="already-applied">✅ Ya aplicaste a esta tarea</span>
                                     <button class="chat-btn" onclick="openChatModal(${tarea.id})" title="Abrir chat">
                                         💬 Chat
                                         <span id="chat-badge-${tarea.id}" class="chat-badge" style="display: none;">0</span>
                                     </button>` : 
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

    // Cargar categorías en el select de filtros
    loadCategorias().then(() => {
        const filterSelect = document.getElementById('filterTipoServicio');
        if (filterSelect) {
            // Limpiar opciones excepto "Todos"
            while (filterSelect.options.length > 1) {
                filterSelect.remove(1);
            }
            // Agregar categorías
            categoriasDisponibles.forEach(categoria => {
                if (categoria.activa) {
                    const option = new Option(`${categoria.icono} ${categoria.nombre}`, categoria.id);
                    filterSelect.add(option);
                }
            });
        }
    });

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

    // Actualizar categorías disponibles inmediatamente cuando se selecciona
    updateServiceCategories(serviceType);

    // Mostrar feedback visual
    const categoria = categoriasDisponibles.find(cat => cat.id === serviceType);
    const nombreCategoria = categoria ? categoria.nombre : serviceType;
    showMessage(`✅ ¡Servicio ${nombreCategoria} seleccionado!`, 'success');

    // Actualizar el título del wizard para mostrar selección
    updateWizardUI();

    // Guardar en formulario oculto
    const tipoServicioInput = document.getElementById('taskTipoServicio');
    if (tipoServicioInput) {
        tipoServicioInput.value = serviceType;
    }
}

// Variable global para almacenar categorías
let categoriasDisponibles = [];

// Función para actualizar especialidades según la categoría principal seleccionada
function updateTaskerEspecialidades() {
    const categoriaSelect = document.getElementById('taskerCategoriaPrincipal');
    const especialidadSelect = document.getElementById('taskerEspecialidad');
    
    if (!categoriaSelect || !especialidadSelect) return;
    
    const categoriaId = categoriaSelect.value;
    
    // Limpiar opciones existentes excepto la primera
    while (especialidadSelect.options.length > 1) {
        especialidadSelect.remove(1);
    }
    
    if (!categoriaId) {
        especialidadSelect.innerHTML = '<option value="" disabled selected>👷 Selecciona primero una categoría</option>';
        return;
    }
    
    // Buscar la categoría seleccionada
    const categoria = categoriasDisponibles.find(cat => cat.id === categoriaId);
    
    if (categoria && categoria.subcategorias && categoria.subcategorias.length > 0) {
        // Agregar subcategorías como especialidades
        categoria.subcategorias.forEach(subcat => {
            const option = new Option(subcat.nombre, subcat.id);
            especialidadSelect.add(option);
        });
    } else {
        // Si no hay subcategorías, agregar opción genérica
        const option = new Option('General', 'general');
        especialidadSelect.add(option);
    }
}

// Función para cargar categorías en el formulario de registro
async function loadCategoriasForRegistration() {
    try {
        const response = await fetch(`${API_BASE}/task/categorias`);
        
        if (response.ok) {
            const data = await response.json();
            categoriasDisponibles = data.categorias || [];
            
            // Llenar el select de categoría principal
            const categoriaSelect = document.getElementById('taskerCategoriaPrincipal');
            if (categoriaSelect) {
                // Limpiar opciones excepto la primera
                while (categoriaSelect.options.length > 1) {
                    categoriaSelect.remove(1);
                }
                
                // Agregar categorías activas
                categoriasDisponibles.forEach(categoria => {
                    if (categoria.activa) {
                        const option = new Option(`${categoria.icono} ${categoria.nombre}`, categoria.id);
                        categoriaSelect.add(option);
                    }
                });
            }
        }
    } catch (error) {
        console.error('Error al cargar categorías para registro:', error);
    }
}

// Función para cargar categorías desde el backend
async function loadCategorias() {
    try {
        // Intentar primero el endpoint público (no requiere autenticación)
        const response = await fetch(`${API_BASE}/task/categorias`);
        
        if (response.ok) {
            const data = await response.json();
            categoriasDisponibles = data.categorias || [];
            console.log('✅ Categorías cargadas:', categoriasDisponibles);
            return categoriasDisponibles;
        } else {
            // Si falla, usar categorías por defecto
            console.warn('⚠️ No se pudieron cargar categorías, usando valores por defecto');
            categoriasDisponibles = [
                { id: 'EXPRESS', nombre: 'Express', icono: '⚡', subcategorias: [] },
                { id: 'OFICIOS', nombre: 'Oficios', icono: '🔧', subcategorias: [] },
                { id: 'SERVICIOS_ESPECIALIZADOS', nombre: 'Servicios Especializados', icono: '🎯', subcategorias: [] },
                { id: 'PROFESIONALES', nombre: 'Profesionales', icono: '👔', subcategorias: [] }
            ];
            return categoriasDisponibles;
        }
    } catch (error) {
        console.error('❌ Error al cargar categorías:', error);
        // Usar categorías por defecto en caso de error
        categoriasDisponibles = [
            { id: 'EXPRESS', nombre: 'Express', icono: '⚡', subcategorias: [] },
            { id: 'OFICIOS', nombre: 'Oficios', icono: '🔧', subcategorias: [] },
            { id: 'SERVICIOS_ESPECIALIZADOS', nombre: 'Servicios Especializados', icono: '🎯', subcategorias: [] },
            { id: 'PROFESIONALES', nombre: 'Profesionales', icono: '👔', subcategorias: [] }
        ];
        return categoriasDisponibles;
    }
}

// Función para actualizar categorías según el tipo de servicio
function updateServiceCategories(serviceType) {
    const categoriaSelect = document.getElementById('taskCategoria');
    if (!categoriaSelect) return;

    // Limpiar opciones existentes excepto la primera
    while (categoriaSelect.options.length > 1) {
        categoriaSelect.remove(1);
    }

    // Buscar la categoría seleccionada en las categorías disponibles
    const categoria = categoriasDisponibles.find(cat => cat.id === serviceType);
    
    if (categoria && categoria.subcategorias && categoria.subcategorias.length > 0) {
        // Agregar subcategorías de la categoría seleccionada
        categoria.subcategorias.forEach(subcat => {
            const option = new Option(subcat.nombre, subcat.id);
            categoriaSelect.add(option);
        });
    } else {
        // Si no hay subcategorías, agregar opción genérica
        const option = new Option('General', 'general');
        categoriaSelect.add(option);
    }
}

// Función para renderizar las categorías en el wizard
function renderCategoriasInWizard() {
    // Buscar ambos contenedores (cliente y tasker en modo cliente)
    const container = document.getElementById('serviceSelectionContainer');
    const containerTasker = document.getElementById('serviceSelectionContainerTasker');
    
    const containers = [container, containerTasker].filter(c => c !== null);

    if (containers.length === 0) {
        console.warn('⚠️ No se encontraron contenedores para renderizar categorías');
        return;
    }

    if (categoriasDisponibles.length === 0) {
        containers.forEach(c => {
            c.innerHTML = '<p>No hay categorías disponibles. Cargando...</p>';
        });
        return;
    }

    let html = '';
    categoriasDisponibles.forEach(categoria => {
        if (!categoria.activa) return; // Saltar categorías inactivas
        
        // Crear lista de subcategorías para mostrar (máximo 3 en móvil, 4 en desktop)
        const maxSubcategorias = window.innerWidth <= 768 ? 3 : 4;
        const subcategoriasList = categoria.subcategorias && categoria.subcategorias.length > 0
            ? categoria.subcategorias.slice(0, maxSubcategorias).map(sub => `<li>${sub.nombre}</li>`).join('')
            : '';

        html += `
            <div class="service-card" data-service="${categoria.id}">
                <div class="service-icon">${categoria.icono || '🔧'}</div>
                <h4>${categoria.nombre}</h4>
                <p class="service-desc">${categoria.descripcion || categoria.tiempo_estimado || 'Servicios especializados'}</p>
                ${subcategoriasList ? `<ul class="service-features">${subcategoriasList}</ul>` : ''}
                <button class="select-service-btn" data-service="${categoria.id}">
                    Seleccionar
                </button>
            </div>
        `;
    });

    // Actualizar ambos contenedores
    containers.forEach(c => {
        c.innerHTML = html;
    });
    
    console.log('✅ Categorías renderizadas en el wizard');
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
            ? (() => {
                const categoria = categoriasDisponibles.find(cat => cat.id === selectedServiceType);
                const nombre = categoria ? categoria.nombre : selectedServiceType;
                return `Paso 1: Servicio ${nombre} seleccionado ✓`;
            })()
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
        const categoria = categoriasDisponibles.find(cat => cat.id === selectedServiceType);
        previewServiceIcon.textContent = categoria ? categoria.icono : '🔧';
    }
    if (previewServiceType) {
        const categoria = categoriasDisponibles.find(cat => cat.id === selectedServiceType);
        previewServiceType.textContent = categoria ? categoria.nombre : selectedServiceType;
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

// ========== FUNCIONES DE PERFIL ==========

// Función para generar avatar con iniciales
function getAvatarInitials(nombre, apellido) {
    const first = (nombre || '').charAt(0).toUpperCase();
    const last = (apellido || '').charAt(0).toUpperCase();
    return first + last || '👤';
}

// Función para mostrar el contenido del perfil
function showProfileContent() {
    const profileContent = document.getElementById('profileContent');
    if (!profileContent) return;

    const userType = currentUser.tipo;
    const esUsuarioDual = currentUser.esUsuarioDual || false;
    let profileHTML = '';

    // Si es usuario dual, mostrar perfil unificado
    if (esUsuarioDual) {
        const initials = getAvatarInitials(currentUser.nombre, currentUser.apellido);
        profileHTML = `
            <div class="profile-container">
                <!-- Header Visual con Avatar -->
                <div class="profile-header-modern">
                    <div class="profile-avatar-large">${initials}</div>
                    <div class="profile-header-info">
                        <h1 class="profile-name">${currentUser.nombre || ''} ${currentUser.apellido || ''}</h1>
                        <p class="profile-email">${currentUser.email || ''}</p>
                        <div class="profile-badges-modern">
                            <span class="badge-modern badge-cliente-modern">
                                <span class="badge-icon">👤</span>
                                <span>Cliente</span>
                            </span>
                            <span class="badge-modern badge-tasker-modern">
                                <span class="badge-icon">🔧</span>
                                <span>Tasker</span>
                            </span>
                        </div>
                    </div>
                </div>

                <!-- Tarjetas de Información Guardada -->
                <div id="profileInfoCards" class="profile-info-cards">
                    <!-- Se llenará dinámicamente después de cargar datos -->
                </div>

                <!-- Formulario de Edición -->
                <div class="profile-edit-section">
                    <button id="toggleEditBtn" class="btn-toggle-edit" onclick="toggleProfileEdit()">
                        <span class="edit-icon">✏️</span>
                        <span>Editar Perfil</span>
                    </button>
                    
                    <form id="profileForm" class="profile-form" style="display: none;">
                        <div class="form-section">
                            <div class="section-header">
                                <span class="section-icon">👤</span>
                                <h3>Información Personal</h3>
                            </div>
                            <div class="form-row">
                                <div class="form-group half">
                                    <label><span class="label-icon">📝</span> Nombre *</label>
                                    <input type="text" id="profileNombre" value="${currentUser.nombre || ''}" required>
                                </div>
                                <div class="form-group half">
                                    <label><span class="label-icon">📝</span> Apellido *</label>
                                    <input type="text" id="profileApellido" value="${currentUser.apellido || ''}" required>
                                </div>
                            </div>
                            <div class="form-group">
                                <label><span class="label-icon">📞</span> Teléfono *</label>
                                <input type="tel" id="profileTelefono" value="${currentUser.telefono || ''}" required>
                            </div>
                            <div class="form-group">
                                <label><span class="label-icon">📧</span> Email</label>
                                <input type="email" id="profileEmail" value="${currentUser.email || ''}" disabled>
                                <small>El email no se puede modificar</small>
                            </div>
                            <div class="form-group">
                                <label><span class="label-icon">📍</span> Ubicación por defecto</label>
                                <input type="text" id="profileUbicacion" value="${currentUser.ubicacion_default || ''}" placeholder="Ej: Av. Corrientes 1234, CABA">
                            </div>
                        </div>
                        
                        <div class="form-section">
                            <div class="section-header">
                                <span class="section-icon">🔧</span>
                                <h3>Información de Tasker</h3>
                            </div>
                            <div class="form-group">
                                <label><span class="label-icon">🏷️</span> Categoría Principal</label>
                                <select id="profileCategoriaPrincipal">
                                    <option value="">Seleccionar categoría</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label><span class="label-icon">⭐</span> Especialidades</label>
                                <select id="profileEspecialidades" multiple>
                                </select>
                                <small>Mantén presionado Ctrl (o Cmd en Mac) para seleccionar múltiples</small>
                            </div>
                            <div class="form-group">
                                <label><span class="label-icon">🆔</span> CUIT (opcional)</label>
                                <input type="text" id="profileCuit" placeholder="XX-XXXXXXXX-X">
                            </div>
                            <div class="form-group">
                                <label class="checkbox-label-modern">
                                    <input type="checkbox" id="profileMonotributista">
                                    <span class="checkmark"></span>
                                    <span>Soy monotributista</span>
                                </label>
                            </div>
                            <div class="form-group">
                                <label><span class="label-icon">📄</span> Descripción Profesional</label>
                                <textarea id="profileDescripcion" rows="4" placeholder="Cuéntanos sobre tu experiencia y especialidades..."></textarea>
                            </div>
                        </div>
                        
                        <div class="form-actions">
                            <button type="submit" class="btn-primary btn-save">
                                <span>💾</span>
                                <span>Guardar Cambios</span>
                            </button>
                            <button type="button" class="btn-secondary" onclick="toggleProfileEdit()">
                                <span>Cancelar</span>
                            </button>
                        </div>
                    </form>
                </div>
                
                <div class="my-ratings-section">
                    <div class="section-header">
                        <span class="section-icon">⭐</span>
                        <h3>Mis Calificaciones</h3>
                    </div>
                    <div id="myRatingsContainer"></div>
                </div>
            </div>
        `;
    } else if (userType === 'cliente') {
        const initials = getAvatarInitials(currentUser.nombre, currentUser.apellido);
        profileHTML = `
            <div class="profile-container">
                <!-- Header Visual con Avatar -->
                <div class="profile-header-modern">
                    <div class="profile-avatar-large">${initials}</div>
                    <div class="profile-header-info">
                        <h1 class="profile-name">${currentUser.nombre || ''} ${currentUser.apellido || ''}</h1>
                        <p class="profile-email">${currentUser.email || ''}</p>
                        <div class="profile-badges-modern">
                            <span class="badge-modern badge-cliente-modern">
                                <span class="badge-icon">👤</span>
                                <span>Cliente</span>
                            </span>
                        </div>
                    </div>
                </div>

                <!-- Formulario de Edición -->
                <div class="profile-edit-section">
                    <button id="toggleEditBtn" class="btn-toggle-edit" onclick="toggleProfileEdit()">
                        <span class="edit-icon">✏️</span>
                        <span>Editar Perfil</span>
                    </button>
                    
                    <form id="profileForm" class="profile-form" style="display: none;">
                        <div class="form-section">
                            <div class="section-header">
                                <span class="section-icon">👤</span>
                                <h3>Información Personal</h3>
                            </div>
                            <div class="form-row">
                                <div class="form-group half">
                                    <label><span class="label-icon">📝</span> Nombre *</label>
                                    <input type="text" id="profileNombre" value="${currentUser.nombre || ''}" required>
                                </div>
                                <div class="form-group half">
                                    <label><span class="label-icon">📝</span> Apellido *</label>
                                    <input type="text" id="profileApellido" value="${currentUser.apellido || ''}" required>
                                </div>
                            </div>
                            <div class="form-group">
                                <label><span class="label-icon">📞</span> Teléfono *</label>
                                <input type="tel" id="profileTelefono" value="${currentUser.telefono || ''}" required>
                            </div>
                            <div class="form-group">
                                <label><span class="label-icon">📧</span> Email</label>
                                <input type="email" id="profileEmail" value="${currentUser.email || ''}" disabled>
                                <small>El email no se puede modificar</small>
                            </div>
                            <div class="form-group">
                                <label><span class="label-icon">📍</span> Ubicación por defecto</label>
                                <input type="text" id="profileUbicacion" value="${currentUser.ubicacion_default || ''}" placeholder="Ej: Av. Corrientes 1234, CABA">
                            </div>
                        </div>
                        
                        <div class="form-actions">
                            <button type="submit" class="btn-primary btn-save">
                                <span>💾</span>
                                <span>Guardar Cambios</span>
                            </button>
                            <button type="button" class="btn-secondary" onclick="toggleProfileEdit()">
                                <span>Cancelar</span>
                            </button>
                        </div>
                    </form>
                </div>
                
                <!-- Sección para convertirse en Tasker -->
                <div class="become-tasker-section" style="margin-top: 40px; padding: 25px; background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); border-radius: 16px; border: 2px solid #e2e8f0;">
                    <h3 style="color: #6366f1; margin-bottom: 15px;">🔧 ¿Quieres trabajar como Tasker?</h3>
                    <p style="color: #64748b; margin-bottom: 20px;">
                        Regístrate como Tasker para ofrecer tus servicios y ganar dinero. Podrás trabajar como Tasker y seguir usando la plataforma como Cliente.
                    </p>
                    <div style="background: white; padding: 20px; border-radius: 12px; margin-bottom: 20px; border: 1px solid #e2e8f0;">
                        <h4 style="color: #1e293b; margin-bottom: 15px;">✨ Beneficios de ser Tasker:</h4>
                        <ul style="list-style: none; padding: 0; margin: 0;">
                            <li style="padding: 8px 0; color: #475569;">✅ Ofrece tus servicios y gana dinero</li>
                            <li style="padding: 8px 0; color: #475569;">✅ Construye tu reputación con calificaciones</li>
                            <li style="padding: 8px 0; color: #475569;">✅ Trabaja cuando quieras (disponibilidad flexible)</li>
                            <li style="padding: 8px 0; color: #475569;">✅ Puedes seguir usando la app como Cliente</li>
                        </ul>
                    </div>
                    <button onclick="showTab('register'); document.getElementById('userType').value = 'tasker'; toggleUserForm();" class="btn-primary" style="width: 100%;">
                        🚀 Registrarse como Tasker
                    </button>
                    <p style="text-align: center; margin-top: 15px; color: #94a3b8; font-size: 0.9em;">
                        Necesitarás completar tu perfil de Tasker con documentos y especialidades
                    </p>
                </div>
                
                <div class="my-ratings-section" style="margin-top: 40px;">
                    <h3>⭐ Mis Calificaciones</h3>
                    <div id="myRatingsContainer"></div>
                </div>
            </div>
        `;
    } else if (userType === 'tasker') {
        const initials = getAvatarInitials(currentUser.nombre, currentUser.apellido);
        profileHTML = `
            <div class="profile-container">
                <!-- Header Visual con Avatar -->
                <div class="profile-header-modern">
                    <div class="profile-avatar-large">${initials}</div>
                    <div class="profile-header-info">
                        <h1 class="profile-name">${currentUser.nombre || ''} ${currentUser.apellido || ''}</h1>
                        <p class="profile-email">${currentUser.email || ''}</p>
                        <div class="profile-badges-modern">
                            <span class="badge-modern badge-tasker-modern">
                                <span class="badge-icon">🔧</span>
                                <span>Tasker</span>
                            </span>
                            <span class="badge-modern badge-cliente-modern">
                                <span class="badge-icon">👤</span>
                                <span>También Cliente</span>
                            </span>
                        </div>
                    </div>
                </div>

                <!-- Tarjetas de Información Guardada -->
                <div id="profileInfoCards" class="profile-info-cards">
                    <!-- Se llenará dinámicamente después de cargar datos -->
                </div>

                <!-- Formulario de Edición -->
                <div class="profile-edit-section">
                    <button id="toggleEditBtn" class="btn-toggle-edit" onclick="toggleProfileEdit()">
                        <span class="edit-icon">✏️</span>
                        <span>Editar Perfil</span>
                    </button>
                    
                    <form id="profileForm" class="profile-form" style="display: none;">
                        <div class="form-section">
                            <div class="section-header">
                                <span class="section-icon">👤</span>
                                <h3>Información Personal</h3>
                            </div>
                            <div class="form-row">
                                <div class="form-group half">
                                    <label><span class="label-icon">📝</span> Nombre *</label>
                                    <input type="text" id="profileNombre" value="${currentUser.nombre || ''}" required>
                                </div>
                                <div class="form-group half">
                                    <label><span class="label-icon">📝</span> Apellido *</label>
                                    <input type="text" id="profileApellido" value="${currentUser.apellido || ''}" required>
                                </div>
                            </div>
                            <div class="form-group">
                                <label><span class="label-icon">📞</span> Teléfono *</label>
                                <input type="tel" id="profileTelefono" value="${currentUser.telefono || ''}" required>
                            </div>
                            <div class="form-group">
                                <label><span class="label-icon">📧</span> Email</label>
                                <input type="email" id="profileEmail" value="${currentUser.email || ''}" disabled>
                                <small>El email no se puede modificar</small>
                            </div>
                        </div>
                        
                        <div class="form-section">
                            <div class="section-header">
                                <span class="section-icon">🔧</span>
                                <h3>Información Profesional</h3>
                            </div>
                            <div class="form-group">
                                <label><span class="label-icon">🏷️</span> Categoría Principal *</label>
                                <select id="profileCategoria" required>
                                    <option value="">Selecciona una categoría</option>
                                    <option value="EXPRESS">⚡ Express</option>
                                    <option value="OFICIOS">🔧 Oficios</option>
                                </select>
                            </div>
                            <div class="form-group" id="especialidadesGroup" style="display: none;">
                                <label><span class="label-icon">⭐</span> Especialidades (si aplica)</label>
                                <div class="checkbox-group">
                                    <label><input type="checkbox" value="Plomería"> 🔧 Plomería</label>
                                    <label><input type="checkbox" value="Albañilería"> 🧱 Albañilería</label>
                                    <label><input type="checkbox" value="Electricista"> ⚡ Electricista</label>
                                    <label><input type="checkbox" value="Gasista"> 🔥 Gasista</label>
                                    <label><input type="checkbox" value="Carpintería"> 🔨 Carpintería</label>
                                    <label><input type="checkbox" value="Pintura"> 🎨 Pintura</label>
                                </div>
                            </div>
                            <div class="form-group">
                                <label><span class="label-icon">🎯</span> Skills / Habilidades (separadas por comas)</label>
                                <input type="text" id="profileSkills" placeholder="Ej: Reparación de grifos, Instalación eléctrica">
                                <small>Lista tus habilidades principales</small>
                            </div>
                            <div class="form-group">
                                <label><span class="label-icon">📜</span> Licencias (separadas por comas)</label>
                                <input type="text" id="profileLicencias" placeholder="Ej: Licencia de conducir, Matrícula de gasista">
                                <small>Lista tus licencias y certificaciones</small>
                            </div>
                            <div class="form-group">
                                <label><span class="label-icon">📄</span> Descripción Profesional</label>
                                <textarea id="profileDescripcion" rows="4" placeholder="Cuéntanos sobre tu experiencia y especialidades..."></textarea>
                            </div>
                        </div>
                        
                        <div class="form-section">
                            <div class="section-header">
                                <span class="section-icon">💳</span>
                                <h3>Información de Pago</h3>
                            </div>
                            <div class="form-group">
                                <label><span class="label-icon">🏦</span> CVU/CBU (para recibir pagos)</label>
                                <input type="text" id="profileCVUCBU" placeholder="0000003100000000000001">
                                <small>Tu CVU o CBU para recibir pagos</small>
                            </div>
                            <div class="form-group">
                                <label class="checkbox-label-modern">
                                    <input type="checkbox" id="profileDisponible" checked>
                                    <span class="checkmark"></span>
                                    <span>Estoy disponible para trabajar</span>
                                </label>
                            </div>
                        </div>
                        
                        <div class="form-actions">
                            <button type="submit" class="btn-primary btn-save">
                                <span>💾</span>
                                <span>Guardar Cambios</span>
                            </button>
                            <button type="button" class="btn-secondary" onclick="toggleProfileEdit()">
                                <span>Cancelar</span>
                            </button>
                        </div>
                    </form>
                </div>
                
                <!-- Sección de funcionalidades de Cliente para Taskers -->
                <div class="client-features-section" style="margin-top: 40px; padding: 25px; background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-radius: 16px; border: 2px solid #86efac;">
                    <h3 style="color: #166534; margin-bottom: 15px;">👤 Funcionalidades de Cliente</h3>
                    <p style="color: #166534; margin-bottom: 20px; opacity: 0.9;">
                        Como Tasker, también puedes usar la plataforma como Cliente. Crea tareas y contrata otros taskers cuando necesites servicios.
                    </p>
                    <div style="background: white; padding: 20px; border-radius: 12px; margin-bottom: 20px; border: 1px solid #86efac;">
                        <h4 style="color: #1e293b; margin-bottom: 15px;">✨ Puedes:</h4>
                        <ul style="list-style: none; padding: 0; margin: 0;">
                            <li style="padding: 8px 0; color: #475569;">✅ Crear tareas y contratar otros taskers</li>
                            <li style="padding: 8px 0; color: #475569;">✅ Ver y gestionar tus tareas como cliente</li>
                            <li style="padding: 8px 0; color: #475569;">✅ Calificar a otros taskers</li>
                            <li style="padding: 8px 0; color: #475569;">✅ Buscar y ver perfiles de taskers</li>
                        </ul>
                    </div>
                    <button onclick="showTabWithContent('tasks')" class="btn-primary" style="width: 100%; background: #10b981;">
                        📋 Ir a Mis Tareas (Modo Cliente)
                    </button>
                </div>
                
                <div class="my-ratings-section" style="margin-top: 40px;">
                    <h3>⭐ Mis Calificaciones</h3>
                    <div id="myRatingsContainer"></div>
                </div>
            </div>
        `;
        
        // Cargar datos completos del tasker después de renderizar
        setTimeout(() => {
            loadTaskerProfileForEdit();
        }, 100);
    }

    profileContent.innerHTML = profileHTML;

    // Cargar datos completos después de renderizar
    setTimeout(() => {
        if (esUsuarioDual) {
            // Cargar datos de ambos perfiles
            loadClienteProfileForEdit();
            loadTaskerProfileForEdit();
            // Cargar categorías para el select
            loadCategoriasForRegistration().then(() => {
                const categoriaSelect = document.getElementById('profileCategoriaPrincipal');
                if (categoriaSelect) {
                    categoriasDisponibles.forEach(categoria => {
                        if (categoria.activa) {
                            const option = new Option(`${categoria.icono} ${categoria.nombre}`, categoria.id);
                            if (currentUser.categoria_principal === categoria.id) {
                                option.selected = true;
                            }
                            categoriaSelect.add(option);
                        }
                    });
                    // Actualizar especialidades según categoría seleccionada
                    updateProfileEspecialidades();
                    
                    // Agregar event listener para cambios
                    categoriaSelect.addEventListener('change', updateProfileEspecialidades);
                }
            });
        } else if (isTasker()) {
            loadTaskerProfileForEdit();
        } else if (isCliente()) {
            loadClienteProfileForEdit();
        }
        
        // Cargar calificaciones del usuario
        loadUserRatings(currentUser.id, userType, 'myRatingsContainer');
    }, 100);

    // Agregar event listeners
    const form = document.getElementById('profileForm');
    if (form) {
        form.addEventListener('submit', handleProfileUpdate);
    }

    // Mostrar/ocultar especialidades según categoría
    const categoriaSelect = document.getElementById('profileCategoria');
    if (categoriaSelect) {
        categoriaSelect.addEventListener('change', function() {
            const especialidadesGroup = document.getElementById('especialidadesGroup');
            if (especialidadesGroup) {
                especialidadesGroup.style.display = this.value === 'OFICIOS' ? 'block' : 'none';
            }
        });
    }
}

// Función para cargar perfil completo del cliente para editar
async function loadClienteProfileForEdit() {
    try {
        // Para usuarios duales, usar cliente_id; para clientes puros, usar id
        const clienteId = currentUser.esUsuarioDual ? (currentUser.cliente_id || currentUser.id) : currentUser.id;
        const response = await fetch(`${API_BASE}/cliente/profile/${clienteId}`, {
            headers: getAuthHeaders()
        });

        if (response.ok) {
            const data = await response.json();
            const cliente = data.cliente;

            // Actualizar currentUser con los datos más recientes
            Object.assign(currentUser, {
                nombre: cliente.nombre,
                apellido: cliente.apellido,
                telefono: cliente.telefono,
                ubicacion_default: cliente.ubicacion_default
            });

            // Llenar campos del formulario
            if (document.getElementById('profileNombre')) {
                document.getElementById('profileNombre').value = cliente.nombre || '';
            }
            if (document.getElementById('profileApellido')) {
                document.getElementById('profileApellido').value = cliente.apellido || '';
            }
            if (document.getElementById('profileTelefono')) {
                document.getElementById('profileTelefono').value = cliente.telefono || '';
            }
            if (document.getElementById('profileUbicacion')) {
                document.getElementById('profileUbicacion').value = cliente.ubicacion_default || '';
            }
        }
    } catch (error) {
        console.error('Error cargando perfil del cliente:', error);
    }
}

// Función para cargar perfil completo del tasker para editar
async function loadTaskerProfileForEdit() {
    try {
        // Si es usuario dual, usar tasker_id; si no, usar el id normal
        const taskerId = currentUser.esUsuarioDual ? (currentUser.tasker_id || currentUser.id) : currentUser.id;
        const response = await fetch(`${API_BASE}/tasker/profile/${taskerId}`, {
            headers: getAuthHeaders({}, 'tasker') // Forzar modo tasker para cargar perfil de tasker
        });

        if (response.ok) {
            const data = await response.json();
            const tasker = data.tasker;

            // Actualizar currentUser con los datos más recientes del tasker
            Object.assign(currentUser, {
                categoria_principal: tasker.categoria_principal,
                especialidades: tasker.especialidades,
                cuit: tasker.cuit,
                monotributista_check: tasker.monotributista_check,
                descripcion_profesional: tasker.descripcion_profesional,
                disponible: tasker.disponible || currentUser.disponible_tasker
            });

            // Actualizar botón de disponibilidad
            if (isTasker()) {
                updateAvailabilityButton();
            }

            // Llenar campos básicos del formulario (solo si no es usuario dual, porque ya se llenaron con cliente)
            if (!currentUser.esUsuarioDual) {
                if (document.getElementById('profileNombre')) {
                    document.getElementById('profileNombre').value = tasker.nombre || '';
                }
                if (document.getElementById('profileApellido')) {
                    document.getElementById('profileApellido').value = tasker.apellido || '';
                }
                if (document.getElementById('profileTelefono')) {
                    document.getElementById('profileTelefono').value = tasker.telefono || '';
                }
            }

            // Llenar campos específicos del tasker (para perfil unificado y perfil de tasker)
            // Perfil unificado usa profileCategoriaPrincipal, perfil de tasker usa profileCategoria
            const categoriaSelect = document.getElementById('profileCategoriaPrincipal') || document.getElementById('profileCategoria');
            if (categoriaSelect) {
                categoriaSelect.value = tasker.categoria_principal || '';
                // Trigger change para actualizar especialidades
                categoriaSelect.dispatchEvent(new Event('change'));
            }
            
            // Llenar especialidades (para perfil unificado)
            const especialidadesSelect = document.getElementById('profileEspecialidades');
            if (especialidadesSelect && tasker.especialidades && tasker.especialidades.length > 0) {
                // Las especialidades ya se cargaron con updateProfileEspecialidades, solo marcar las seleccionadas
                Array.from(especialidadesSelect.options).forEach(option => {
                    if (tasker.especialidades.includes(option.text)) {
                        option.selected = true;
                    }
                });
            }
            
            // Llenar otros campos del tasker
            if (document.getElementById('profileCuit')) {
                document.getElementById('profileCuit').value = tasker.cuit || '';
            }
            if (document.getElementById('profileMonotributista')) {
                document.getElementById('profileMonotributista').checked = tasker.monotributista_check || false;
            }
            if (document.getElementById('profileDescripcion')) {
                document.getElementById('profileDescripcion').value = tasker.descripcion_profesional || '';
            }
            if (document.getElementById('profileSkills')) {
                document.getElementById('profileSkills').value = (tasker.skills || []).join(', ');
            }
            if (document.getElementById('profileLicencias')) {
                document.getElementById('profileLicencias').value = (tasker.licencias || []).join(', ');
            }
            if (document.getElementById('profileCVUCBU')) {
                document.getElementById('profileCVUCBU').value = tasker.cvu_cbu || '';
            }
            if (document.getElementById('profileDisponible')) {
                document.getElementById('profileDisponible').checked = tasker.disponible !== false;
            }

            // Marcar especialidades seleccionadas (para perfil de tasker con checkboxes)
            if (tasker.especialidades && tasker.especialidades.length > 0) {
                tasker.especialidades.forEach(esp => {
                    const checkbox = document.querySelector(`input[value="${esp}"]`);
                    if (checkbox) checkbox.checked = true;
                });
            }

            // Actualizar tarjetas de información guardada
            updateProfileInfoCards(tasker);
        }
    } catch (error) {
        console.error('Error cargando perfil del tasker:', error);
    }
}

// Función para actualizar las tarjetas de información guardada
function updateProfileInfoCards(tasker) {
    const cardsContainer = document.getElementById('profileInfoCards');
    if (!cardsContainer) return;

    let cardsHTML = '';

    // Tarjeta de Categoría y Especialidades
    if (tasker.categoria_principal || (tasker.especialidades && tasker.especialidades.length > 0)) {
        const categoriaNombre = categoriasDisponibles?.find(c => c.id === tasker.categoria_principal)?.nombre || tasker.categoria_principal;
        cardsHTML += `
            <div class="info-card info-card-primary">
                <div class="info-card-header">
                    <span class="info-card-icon">🏷️</span>
                    <h4>Categoría y Especialidades</h4>
                </div>
                <div class="info-card-content">
                    ${tasker.categoria_principal ? `
                        <div class="info-item">
                            <span class="info-label">Categoría Principal:</span>
                            <span class="info-value">${categoriaNombre}</span>
                        </div>
                    ` : ''}
                    ${tasker.especialidades && tasker.especialidades.length > 0 ? `
                        <div class="info-item">
                            <span class="info-label">Especialidades:</span>
                            <div class="info-tags">
                                ${tasker.especialidades.map(esp => `<span class="info-tag">${esp}</span>`).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    // Tarjeta de Descripción Profesional
    if (tasker.descripcion_profesional) {
        cardsHTML += `
            <div class="info-card info-card-secondary">
                <div class="info-card-header">
                    <span class="info-card-icon">📄</span>
                    <h4>Descripción Profesional</h4>
                </div>
                <div class="info-card-content">
                    <p class="info-description">${tasker.descripcion_profesional}</p>
                </div>
            </div>
        `;
    }

    // Tarjeta de Información Fiscal
    if (tasker.cuit || tasker.monotributista_check) {
        cardsHTML += `
            <div class="info-card info-card-tertiary">
                <div class="info-card-header">
                    <span class="info-card-icon">💼</span>
                    <h4>Información Fiscal</h4>
                </div>
                <div class="info-card-content">
                    ${tasker.cuit ? `
                        <div class="info-item">
                            <span class="info-label">CUIT:</span>
                            <span class="info-value">${tasker.cuit}</span>
                        </div>
                    ` : ''}
                    ${tasker.monotributista_check ? `
                        <div class="info-item">
                            <span class="info-badge-fiscal">✅ Monotributista</span>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    // Tarjeta de Skills y Licencias
    if ((tasker.skills && tasker.skills.length > 0) || (tasker.licencias && tasker.licencias.length > 0)) {
        cardsHTML += `
            <div class="info-card info-card-quaternary">
                <div class="info-card-header">
                    <span class="info-card-icon">🎯</span>
                    <h4>Habilidades y Certificaciones</h4>
                </div>
                <div class="info-card-content">
                    ${tasker.skills && tasker.skills.length > 0 ? `
                        <div class="info-item">
                            <span class="info-label">Skills:</span>
                            <div class="info-tags">
                                ${tasker.skills.map(skill => `<span class="info-tag info-tag-skill">${skill}</span>`).join('')}
                            </div>
                        </div>
                    ` : ''}
                    ${tasker.licencias && tasker.licencias.length > 0 ? `
                        <div class="info-item">
                            <span class="info-label">Licencias:</span>
                            <div class="info-tags">
                                ${tasker.licencias.map(lic => `<span class="info-tag info-tag-license">${lic}</span>`).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    // Si no hay información, mostrar mensaje
    if (!cardsHTML) {
        cardsHTML = `
            <div class="info-card info-card-empty">
                <div class="info-card-content">
                    <p style="text-align: center; color: #94a3b8; padding: 20px;">
                        📝 Completa tu perfil de Tasker para que aparezca aquí
                    </p>
                </div>
            </div>
        `;
    }

    cardsContainer.innerHTML = cardsHTML;
}

// Función para toggle del formulario de edición
function toggleProfileEdit() {
    const form = document.getElementById('profileForm');
    const toggleBtn = document.getElementById('toggleEditBtn');
    if (!form || !toggleBtn) return;

    const isVisible = form.style.display !== 'none';
    form.style.display = isVisible ? 'none' : 'block';
    toggleBtn.innerHTML = isVisible 
        ? '<span class="edit-icon">✏️</span><span>Editar Perfil</span>'
        : '<span class="edit-icon">👁️</span><span>Ver Perfil</span>';
}

// Función para manejar actualización de perfil
async function handleProfileUpdate(e) {
    e.preventDefault();

    try {
        const esUsuarioDual = currentUser.esUsuarioDual || false;
        let updateDataCliente = {};
        let updateDataTasker = {};
        let promises = [];

        // Datos comunes (nombre, apellido, telefono)
        const nombre = document.getElementById('profileNombre').value;
        const apellido = document.getElementById('profileApellido').value;
        const telefono = document.getElementById('profileTelefono').value;

        if (esUsuarioDual) {
            // Usuario dual: actualizar ambos perfiles
            // Datos del cliente
            updateDataCliente = {
                nombre: nombre,
                apellido: apellido,
                telefono: telefono,
                ubicacion_default: document.getElementById('profileUbicacion')?.value || null
            };

            // Datos del tasker
            const categoriaPrincipal = document.getElementById('profileCategoriaPrincipal')?.value || null;
            const especialidadesSelect = document.getElementById('profileEspecialidades');
            // Obtener los nombres de las especialidades (no los IDs)
            const especialidades = especialidadesSelect ? Array.from(especialidadesSelect.selectedOptions).map(opt => opt.text) : [];

            updateDataTasker = {
                nombre: nombre,
                apellido: apellido,
                telefono: telefono,
                categoria_principal: categoriaPrincipal,
                especialidades: especialidades,
                cuit: document.getElementById('profileCuit')?.value || null,
                monotributista_check: document.getElementById('profileMonotributista')?.checked || false,
                descripcion_profesional: document.getElementById('profileDescripcion')?.value || null
            };

            // Actualizar ambos perfiles en paralelo
            const clienteId = currentUser.cliente_id || currentUser.id;
            const taskerId = currentUser.tasker_id;

            promises.push(
                fetch(`${API_BASE}/cliente/profile/${clienteId}`, {
                    method: 'PUT',
                    headers: getAuthHeaders({
                        'Content-Type': 'application/json'
                    }, 'cliente'), // Forzar modo cliente para actualizar perfil de cliente
                    body: JSON.stringify(updateDataCliente)
                })
            );

            promises.push(
                fetch(`${API_BASE}/tasker/profile/${taskerId}`, {
                    method: 'PUT',
                    headers: getAuthHeaders({
                        'Content-Type': 'application/json'
                    }, 'tasker'), // Forzar modo tasker para actualizar perfil de tasker
                    body: JSON.stringify(updateDataTasker)
                })
            );

            const responses = await Promise.all(promises);
            const dataCliente = await responses[0].json();
            const dataTasker = await responses[1].json();

            if (responses[0].ok && responses[1].ok) {
                showMessage('✅ Perfil actualizado exitosamente', 'success');
                // Actualizar currentUser con los nuevos datos
                if (dataCliente.cliente) {
                    Object.assign(currentUser, {
                        nombre: dataCliente.cliente.nombre,
                        apellido: dataCliente.cliente.apellido,
                        telefono: dataCliente.cliente.telefono,
                        ubicacion_default: dataCliente.cliente.ubicacion_default
                    });
                }
                if (dataTasker.tasker) {
                    Object.assign(currentUser, {
                        categoria_principal: dataTasker.tasker.categoria_principal,
                        especialidades: dataTasker.tasker.especialidades,
                        cuit: dataTasker.tasker.cuit,
                        monotributista_check: dataTasker.tasker.monotributista_check,
                        descripcion_profesional: dataTasker.tasker.descripcion_profesional,
                        disponible_tasker: dataTasker.tasker.disponible
                    });
                    // Actualizar tarjetas de información después de guardar
                    updateProfileInfoCards(dataTasker.tasker);
                }
                updateAvailabilityButton();
            } else {
                const errorMsg = dataCliente.message || dataTasker.message || 'Error al actualizar perfil';
                showMessage(`❌ Error: ${errorMsg}`, 'error');
            }
        } else if (currentUser.tipo === 'cliente') {
            // Cliente puro
            updateDataCliente = {
                nombre: nombre,
                apellido: apellido,
                telefono: telefono,
                ubicacion_default: document.getElementById('profileUbicacion')?.value || null
            };

            const response = await fetch(`${API_BASE}/cliente/profile/${currentUser.id}`, {
                method: 'PUT',
                headers: getAuthHeaders({
                    'Content-Type': 'application/json'
                }, 'cliente'), // Forzar modo cliente
                body: JSON.stringify(updateDataCliente)
            });

            const data = await response.json();

            if (response.ok) {
                showMessage('✅ Perfil actualizado exitosamente', 'success');
                if (data.cliente) {
                    Object.assign(currentUser, data.cliente);
                }
            } else {
                showMessage(`❌ Error: ${data.message || 'Error al actualizar perfil'}`, 'error');
            }
        } else if (isTasker()) {
            // Tasker puro
            const especialidades = Array.from(document.querySelectorAll('#especialidadesGroup input[type="checkbox"]:checked'))
                .map(cb => cb.value);

            const skillsText = document.getElementById('profileSkills')?.value;
            const licenciasText = document.getElementById('profileLicencias')?.value;

            updateDataTasker = {
                nombre: nombre,
                apellido: apellido,
                telefono: telefono,
                categoria_principal: document.getElementById('profileCategoria')?.value || null,
                especialidades: especialidades,
                skills: skillsText ? skillsText.split(',').map(s => s.trim()).filter(s => s) : [],
                licencias: licenciasText ? licenciasText.split(',').map(l => l.trim()).filter(l => l) : [],
                descripcion_profesional: document.getElementById('profileDescripcion')?.value || null,
                cvu_cbu: document.getElementById('profileCVUCBU')?.value || null,
                disponible: document.getElementById('profileDisponible')?.checked || false
            };

            const response = await fetch(`${API_BASE}/tasker/profile/${currentUser.id}`, {
                method: 'PUT',
                headers: getAuthHeaders({
                    'Content-Type': 'application/json'
                }, 'tasker'), // Forzar modo tasker
                body: JSON.stringify(updateDataTasker)
            });

            const data = await response.json();

            if (response.ok) {
                showMessage('✅ Perfil actualizado exitosamente', 'success');
                if (data.tasker) {
                    Object.assign(currentUser, {
                        nombre: data.tasker.nombre,
                        apellido: data.tasker.apellido,
                        telefono: data.tasker.telefono,
                        categoria_principal: data.tasker.categoria_principal,
                        especialidades: data.tasker.especialidades,
                        skills: data.tasker.skills,
                        licencias: data.tasker.licencias,
                        descripcion_profesional: data.tasker.descripcion_profesional,
                        cvu_cbu: data.tasker.cvu_cbu,
                        disponible: data.tasker.disponible
                    });
                    // Actualizar tarjetas de información después de guardar
                    updateProfileInfoCards(data.tasker);
                }
                updateAvailabilityButton();
            } else {
                showMessage(`❌ Error: ${data.message || 'Error al actualizar perfil'}`, 'error');
            }
        }
    } catch (error) {
        console.error('Error actualizando perfil:', error);
        showMessage('❌ Error de conexión al actualizar perfil', 'error');
    }
}

// ========== FUNCIONES DE BÚSQUEDA ==========

// Función para mostrar el contenido de búsqueda
function showSearchContent() {
    const searchContent = document.getElementById('searchContent');
    if (!searchContent) return;

    // Para usuarios duales, usar el modo activo; para otros, usar el tipo
    const userType = getUserType();
    const isInClienteMode = isCliente() || (currentUser.esUsuarioDual && taskerMode === 'cliente');
    let searchHTML = '';

    if (isInClienteMode) {
        // Cliente (o usuario dual en modo cliente) busca taskers
        searchHTML = `
            <div class="search-container">
                <h2>🔍 Buscar Taskers</h2>
                <div class="search-filters-advanced">
                    <div class="search-row">
                        <input type="text" id="searchTaskerNombre" placeholder="🔍 Buscar por nombre, email, teléfono..." class="search-input-large" onkeyup="searchTaskers()" oninput="searchTaskers()">
                        <select id="sortTaskersSearch" class="sort-select" onchange="searchTaskers()">
                            <option value="name-asc">Ordenar: Nombre A-Z</option>
                            <option value="name-desc">Ordenar: Nombre Z-A</option>
                            <option value="rating-desc">Ordenar: Mejor calificado</option>
                            <option value="rating-asc">Ordenar: Menor calificado</option>
                        </select>
                    </div>
                    <div class="search-row">
                        <select id="searchTaskerCategoria" class="search-select" onchange="searchTaskers()">
                            <option value="">Todas las categorías</option>
                            <option value="EXPRESS">⚡ Express</option>
                            <option value="OFICIOS">🔧 Oficios</option>
                        </select>
                        <select id="searchTaskerEspecialidad" class="search-select" onchange="searchTaskers()">
                            <option value="">Todas las especialidades</option>
                            <option value="Plomería">🔧 Plomería</option>
                            <option value="Albañilería">🧱 Albañilería</option>
                            <option value="Electricista">⚡ Electricista</option>
                            <option value="Gasista">🔥 Gasista</option>
                            <option value="Carpintería">🔨 Carpintería</option>
                            <option value="Pintura">🎨 Pintura</option>
                        </select>
                        <select id="searchTaskerDisponibilidad" class="search-select" onchange="searchTaskers()">
                            <option value="">Todos</option>
                            <option value="disponible">✅ Solo disponibles</option>
                            <option value="no-disponible">❌ No disponibles</option>
                        </select>
                        <select id="searchTaskerCalificacion" class="search-select" onchange="searchTaskers()">
                            <option value="">Cualquier calificación</option>
                            <option value="5">⭐ 5 estrellas</option>
                            <option value="4">⭐ 4+ estrellas</option>
                            <option value="3">⭐ 3+ estrellas</option>
                            <option value="2">⭐ 2+ estrellas</option>
                            <option value="1">⭐ 1+ estrellas</option>
                        </select>
                    </div>
                    <div class="search-row">
                        <input type="text" id="searchTaskerSkill" placeholder="Buscar por skill específico..." class="search-input" onkeyup="searchTaskers()" oninput="searchTaskers()">
                        <button onclick="clearTaskerFilters()" class="btn-secondary">🗑️ Limpiar Filtros</button>
                    </div>
                </div>
                <div id="taskersResults" class="results-container">
                    <p class="no-results">Usa los filtros para buscar taskers</p>
                </div>
            </div>
        `;
    } else if (isTasker()) {
        // Tasker busca clientes
        searchHTML = `
            <div class="search-container">
                <h2>🔍 Buscar Clientes</h2>
                <div class="search-filters-advanced">
                    <div class="search-row">
                        <input type="text" id="searchClienteNombre" placeholder="🔍 Buscar por nombre, email, teléfono, ubicación..." class="search-input-large" onkeyup="searchClientes()" oninput="searchClientes()">
                        <select id="sortClientesSearch" class="sort-select" onchange="searchClientes()">
                            <option value="name-asc">Ordenar: Nombre A-Z</option>
                            <option value="name-desc">Ordenar: Nombre Z-A</option>
                            <option value="rating-desc">Ordenar: Mejor calificado</option>
                            <option value="rating-asc">Ordenar: Menor calificado</option>
                            <option value="date-desc">Ordenar: Más recientes</option>
                            <option value="date-asc">Ordenar: Más antiguos</option>
                        </select>
                    </div>
                    <div class="search-row">
                        <select id="searchClienteCalificacion" class="search-select" onchange="searchClientes()">
                            <option value="">Cualquier calificación</option>
                            <option value="5">⭐ 5 estrellas</option>
                            <option value="4">⭐ 4+ estrellas</option>
                            <option value="3">⭐ 3+ estrellas</option>
                            <option value="2">⭐ 2+ estrellas</option>
                            <option value="1">⭐ 1+ estrellas</option>
                        </select>
                        <input type="text" id="searchClienteUbicacion" placeholder="Buscar por ubicación..." class="search-input" onkeyup="searchClientes()" oninput="searchClientes()">
                        <button onclick="clearClienteFilters()" class="btn-secondary">🗑️ Limpiar Filtros</button>
                    </div>
                </div>
                <div id="clientesResults" class="results-container">
                    <p class="no-results">Usa los filtros para buscar clientes</p>
                </div>
            </div>
        `;
    }

    searchContent.innerHTML = searchHTML;
}

// Variables globales para búsqueda
let allSearchTaskers = [];
let allSearchClientes = [];

// Función para buscar taskers (mejorada con filtros avanzados)
async function searchTaskers() {
    try {
        const nombre = document.getElementById('searchTaskerNombre')?.value || '';
        const categoria = document.getElementById('searchTaskerCategoria')?.value || '';
        const especialidad = document.getElementById('searchTaskerEspecialidad')?.value || '';
        const skill = document.getElementById('searchTaskerSkill')?.value || '';
        const disponibilidad = document.getElementById('searchTaskerDisponibilidad')?.value || '';
        const calificacionMin = document.getElementById('searchTaskerCalificacion')?.value || '';
        const sortOption = document.getElementById('sortTaskersSearch')?.value || 'name-asc';

        const params = new URLSearchParams();
        if (nombre) params.append('nombre', nombre);
        if (categoria) params.append('categoria_principal', categoria);
        if (especialidad) params.append('especialidad', especialidad);
        if (skill) params.append('skill', skill);

        const response = await fetch(`${API_BASE}/tasker/search?${params.toString()}`, {
            headers: {
                'Authorization': `Bearer ${currentToken}`
            }
        });

        const data = await response.json();
        const resultsDiv = document.getElementById('taskersResults');

        if (response.ok && resultsDiv) {
            if (data.taskers && data.taskers.length > 0) {
                // Guardar todos los resultados
                allSearchTaskers = data.taskers;
                
                // Aplicar filtros adicionales en el frontend
                let filtered = data.taskers;
                
                // Filtro por disponibilidad
                if (disponibilidad === 'disponible') {
                    filtered = filtered.filter(t => t.disponible === true);
                } else if (disponibilidad === 'no-disponible') {
                    filtered = filtered.filter(t => t.disponible === false);
                }
                
                // Filtro por calificación mínima
                if (calificacionMin) {
                    const minRating = parseFloat(calificacionMin);
                    filtered = filtered.filter(t => (t.calificacion_promedio || 0) >= minRating);
                }
                
                // Ordenar
                filtered.sort((a, b) => {
                    switch(sortOption) {
                        case 'name-asc':
                            return `${a.nombre} ${a.apellido}`.localeCompare(`${b.nombre} ${b.apellido}`);
                        case 'name-desc':
                            return `${b.nombre} ${b.apellido}`.localeCompare(`${a.nombre} ${a.apellido}`);
                        case 'rating-desc':
                            return (b.calificacion_promedio || 0) - (a.calificacion_promedio || 0);
                        case 'rating-asc':
                            return (a.calificacion_promedio || 0) - (b.calificacion_promedio || 0);
                        default:
                            return 0;
                    }
                });
                
                // Renderizar resultados
                renderTaskersResults(filtered);
            } else {
                resultsDiv.innerHTML = '<p class="no-results">No se encontraron taskers con esos criterios</p>';
                allSearchTaskers = [];
            }
        }
    } catch (error) {
        console.error('Error buscando taskers:', error);
        showMessage('❌ Error de conexión al buscar taskers', 'error');
    }
}

// Función para renderizar resultados de taskers
function renderTaskersResults(taskers) {
    const resultsDiv = document.getElementById('taskersResults');
    if (!resultsDiv) return;

    if (taskers.length === 0) {
        resultsDiv.innerHTML = '<p class="no-results">No se encontraron taskers con esos criterios</p>';
        return;
    }

    let resultsHTML = `<h3>Resultados (${taskers.length})</h3>`;
    taskers.forEach(tasker => {
        const ratingStars = tasker.calificacion_promedio 
            ? `${'⭐'.repeat(Math.round(tasker.calificacion_promedio))}${'☆'.repeat(5 - Math.round(tasker.calificacion_promedio))} ${tasker.calificacion_promedio.toFixed(1)}`
            : 'Sin calificaciones';
        
        resultsHTML += `
            <div class="profile-card" onclick="viewTaskerProfile(${tasker.id})">
                <div class="profile-header">
                    <h3>${tasker.nombre} ${tasker.apellido}</h3>
                    <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
                        <span class="status-badge ${tasker.disponible ? 'available' : 'unavailable'}">
                            ${tasker.disponible ? '✅ Disponible' : '❌ No disponible'}
                        </span>
                        ${tasker.calificacion_promedio ? `
                            <span class="rating-badge">
                                ${ratingStars} (${tasker.total_calificaciones || 0})
                            </span>
                        ` : ''}
                    </div>
                </div>
                <div class="profile-details">
                    <p><strong>📞 Teléfono:</strong> ${tasker.telefono || 'No especificado'}</p>
                    ${tasker.categoria_principal ? `<p><strong>Categoría:</strong> ${tasker.categoria_principal}</p>` : ''}
                    ${tasker.especialidades && tasker.especialidades.length > 0 ? 
                        `<p><strong>Especialidades:</strong> ${tasker.especialidades.join(', ')}</p>` : ''}
                    ${tasker.skills && tasker.skills.length > 0 ? 
                        `<p><strong>Skills:</strong> ${tasker.skills.join(', ')}</p>` : ''}
                    ${tasker.descripcion_profesional ? 
                        `<p><strong>Descripción:</strong> ${tasker.descripcion_profesional}</p>` : ''}
                </div>
            </div>
        `;
    });
    resultsDiv.innerHTML = resultsHTML;
}

// Función para limpiar filtros de taskers
function clearTaskerFilters() {
    document.getElementById('searchTaskerNombre').value = '';
    document.getElementById('searchTaskerCategoria').value = '';
    document.getElementById('searchTaskerEspecialidad').value = '';
    document.getElementById('searchTaskerSkill').value = '';
    document.getElementById('searchTaskerDisponibilidad').value = '';
    document.getElementById('searchTaskerCalificacion').value = '';
    document.getElementById('sortTaskersSearch').value = 'name-asc';
    searchTaskers();
}

// Función para buscar clientes (mejorada con filtros avanzados)
async function searchClientes() {
    try {
        const nombre = document.getElementById('searchClienteNombre')?.value || '';
        const ubicacion = document.getElementById('searchClienteUbicacion')?.value || '';
        const calificacionMin = document.getElementById('searchClienteCalificacion')?.value || '';
        const sortOption = document.getElementById('sortClientesSearch')?.value || 'name-asc';

        const params = new URLSearchParams();
        if (nombre) params.append('nombre', nombre);

        const response = await fetch(`${API_BASE}/cliente/search?${params.toString()}`, {
            headers: {
                'Authorization': `Bearer ${currentToken}`
            }
        });

        const data = await response.json();
        const resultsDiv = document.getElementById('clientesResults');

        if (!response.ok) {
            const errorMsg = data.message || data.error || 'Error desconocido';
            console.error('Error en respuesta:', data);
            if (resultsDiv) {
                resultsDiv.innerHTML = `<p class="error">Error: ${errorMsg}</p>`;
            }
            showMessage(`❌ Error: ${errorMsg}`, 'error');
            return;
        }

        if (resultsDiv) {
            if (data.clientes && data.clientes.length > 0) {
                // Guardar todos los resultados
                allSearchClientes = data.clientes;
                
                // Aplicar filtros adicionales en el frontend
                let filtered = data.clientes;
                
                // Filtro por ubicación
                if (ubicacion) {
                    const ubicacionLower = ubicacion.toLowerCase();
                    filtered = filtered.filter(c => {
                        let ubicacionStr = '';
                        if (c.ubicacion_default) {
                            if (typeof c.ubicacion_default === 'string') {
                                ubicacionStr = c.ubicacion_default;
                            } else if (typeof c.ubicacion_default === 'object') {
                                // Si es un objeto, buscar en sus propiedades
                                ubicacionStr = [
                                    c.ubicacion_default.direccion,
                                    c.ubicacion_default.ciudad,
                                    c.ubicacion_default.ubicacion
                                ].filter(Boolean).join(' ');
                            }
                        }
                        return ubicacionStr.toLowerCase().includes(ubicacionLower);
                    });
                }
                
                // Filtro por calificación mínima
                if (calificacionMin) {
                    const minRating = parseFloat(calificacionMin);
                    filtered = filtered.filter(c => (c.calificacion_promedio || 0) >= minRating);
                }
                
                // Ordenar
                filtered.sort((a, b) => {
                    switch(sortOption) {
                        case 'name-asc':
                            return `${a.nombre} ${a.apellido}`.localeCompare(`${b.nombre} ${b.apellido}`);
                        case 'name-desc':
                            return `${b.nombre} ${b.apellido}`.localeCompare(`${a.nombre} ${a.apellido}`);
                        case 'rating-desc':
                            return (b.calificacion_promedio || 0) - (a.calificacion_promedio || 0);
                        case 'rating-asc':
                            return (a.calificacion_promedio || 0) - (b.calificacion_promedio || 0);
                        case 'date-desc':
                            return new Date(b.createdAt) - new Date(a.createdAt);
                        case 'date-asc':
                            return new Date(a.createdAt) - new Date(b.createdAt);
                        default:
                            return 0;
                    }
                });
                
                // Renderizar resultados
                renderClientesResults(filtered);
            } else {
                resultsDiv.innerHTML = '<p class="no-results">No se encontraron clientes con esos criterios</p>';
                allSearchClientes = [];
            }
        }
    } catch (error) {
        console.error('Error buscando clientes:', error);
        const resultsDiv = document.getElementById('clientesResults');
        if (resultsDiv) {
            resultsDiv.innerHTML = `<p class="error">Error de conexión: ${error.message}</p>`;
        }
        showMessage(`❌ Error de conexión al buscar clientes: ${error.message}`, 'error');
    }
}

// Función para renderizar resultados de clientes
function renderClientesResults(clientes) {
    const resultsDiv = document.getElementById('clientesResults');
    if (!resultsDiv) return;

    if (clientes.length === 0) {
        resultsDiv.innerHTML = '<p class="no-results">No se encontraron clientes con esos criterios</p>';
        return;
    }

    let resultsHTML = `<h3>Resultados (${clientes.length})</h3>`;
    clientes.forEach(cliente => {
        const ratingStars = cliente.calificacion_promedio 
            ? `${'⭐'.repeat(Math.round(cliente.calificacion_promedio))}${'☆'.repeat(5 - Math.round(cliente.calificacion_promedio))} ${cliente.calificacion_promedio.toFixed(1)}`
            : 'Sin calificaciones';
        
        resultsHTML += `
            <div class="profile-card" onclick="viewClienteProfile(${cliente.id})">
                <div class="profile-header">
                    <h3>${cliente.nombre} ${cliente.apellido}</h3>
                    ${cliente.calificacion_promedio ? `
                        <span class="rating-badge">
                            ${ratingStars} (${cliente.total_calificaciones || 0})
                        </span>
                    ` : ''}
                </div>
                <div class="profile-details">
                    <p><strong>📞 Teléfono:</strong> ${cliente.telefono || 'No especificado'}</p>
                    ${cliente.ubicacion_default ? 
                        `<p><strong>📍 Ubicación:</strong> ${cliente.ubicacion_default}</p>` : ''}
                </div>
            </div>
        `;
    });
    resultsDiv.innerHTML = resultsHTML;
}

// Función para limpiar filtros de clientes
function clearClienteFilters() {
    document.getElementById('searchClienteNombre').value = '';
    document.getElementById('searchClienteUbicacion').value = '';
    document.getElementById('searchClienteCalificacion').value = '';
    document.getElementById('sortClientesSearch').value = 'name-asc';
    searchClientes();
}

// Función para ver perfil completo de un tasker
async function viewTaskerProfile(taskerId) {
    try {
        const response = await fetch(`${API_BASE}/tasker/profile/${taskerId}`, {
            headers: getAuthHeaders()
        });

        const data = await response.json();
        if (response.ok && data.tasker) {
            const tasker = data.tasker;
            const esCliente = isCliente(); // Usar la función helper
            
            const modalHTML = `
                <div class="modal-overlay" onclick="closeProfileModal()">
                    <div class="modal-content profile-modal" onclick="event.stopPropagation()">
                        <button class="modal-close" onclick="event.stopPropagation(); closeProfileModal()" title="Cerrar">×</button>
                        <h2>👤 ${tasker.nombre} ${tasker.apellido}</h2>
                        <div class="profile-full-details">
                            <p><strong>📞 Teléfono:</strong> ${tasker.telefono || 'No especificado'}</p>
                            ${tasker.categoria_principal ? `<p><strong>Categoría:</strong> ${tasker.categoria_principal}</p>` : ''}
                            ${tasker.especialidades && tasker.especialidades.length > 0 ? 
                                `<p><strong>Especialidades:</strong> ${tasker.especialidades.join(', ')}</p>` : ''}
                            ${tasker.skills && tasker.skills.length > 0 ? 
                                `<p><strong>Skills:</strong> ${tasker.skills.join(', ')}</p>` : ''}
                            ${tasker.licencias && tasker.licencias.length > 0 ? 
                                `<p><strong>Licencias:</strong> ${tasker.licencias.join(', ')}</p>` : ''}
                            ${tasker.descripcion_profesional ? 
                                `<p><strong>Descripción:</strong> ${tasker.descripcion_profesional}</p>` : ''}
                            <p><strong>Estado:</strong> ${tasker.disponible ? '✅ Disponible' : '❌ No disponible'}</p>
                        </div>
                        ${esCliente ? `
                            <div id="taskerTasks-${taskerId}" class="tasks-to-rate-section">
                                <h3>📋 Tareas Completadas</h3>
                                <p>Cargando tareas...</p>
                            </div>
                        ` : ''}
                        <div id="taskerRatings-${taskerId}" class="ratings-section">
                            <p>Cargando calificaciones...</p>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            
            // Si es cliente, cargar tareas completadas con este tasker
            if (esCliente) {
                loadCompletedTasksWithUser(taskerId, 'tasker', `taskerTasks-${taskerId}`);
            }
            
            // Cargar calificaciones del tasker
            loadUserRatings(taskerId, 'tasker', `taskerRatings-${taskerId}`);
        }
    } catch (error) {
        console.error('Error cargando perfil de tasker:', error);
        showMessage('❌ Error al cargar perfil', 'error');
    }
}

// Función para ver perfil completo de un cliente
async function viewClienteProfile(clienteId) {
    try {
        const response = await fetch(`${API_BASE}/cliente/profile/${clienteId}`, {
            headers: getAuthHeaders()
        });

        const data = await response.json();
        if (response.ok && data.cliente) {
            const cliente = data.cliente;
            const esTaskerUser = isTasker();
            
            const modalHTML = `
                <div class="modal-overlay" onclick="closeProfileModal()">
                    <div class="modal-content profile-modal" onclick="event.stopPropagation()">
                        <button class="modal-close" onclick="event.stopPropagation(); closeProfileModal()" title="Cerrar">×</button>
                        <h2>👤 ${cliente.nombre} ${cliente.apellido}</h2>
                        <div class="profile-full-details">
                            <p><strong>📞 Teléfono:</strong> ${cliente.telefono || 'No especificado'}</p>
                            ${cliente.ubicacion_default ? 
                                `<p><strong>📍 Ubicación:</strong> ${cliente.ubicacion_default}</p>` : ''}
                        </div>
                        ${esTaskerUser ? `
                            <div id="clienteTasks-${clienteId}" class="tasks-to-rate-section">
                                <h3>📋 Tareas Completadas</h3>
                                <p>Cargando tareas...</p>
                            </div>
                        ` : ''}
                        <div id="clienteRatings-${clienteId}" class="ratings-section">
                            <p>Cargando calificaciones...</p>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            
            // Si es tasker, cargar tareas completadas con este cliente
            if (esTaskerUser) {
                loadCompletedTasksWithUser(clienteId, 'cliente', `clienteTasks-${clienteId}`);
            }
            
            // Cargar calificaciones del cliente
            loadUserRatings(clienteId, 'cliente', `clienteRatings-${clienteId}`);
        }
    } catch (error) {
        console.error('Error cargando perfil de cliente:', error);
        showMessage('❌ Error al cargar perfil', 'error');
    }
}

// Función para cerrar modal de perfil
function closeProfileModal() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) modal.remove();
}

// Función para cambiar el modo del tasker
function setTaskerMode(mode) {
    if (currentUser && isTasker()) {
        taskerMode = mode;
        showTasksContent(); // Recargar el contenido con el nuevo modo
        showMessage(`✅ Modo cambiado a: ${mode === 'tasker' ? 'Tasker' : 'Cliente'}`, 'success');
    }
}

// Función para cambiar a modo Tasker (desde modo Cliente) - alias
function switchToTaskerMode() {
    setTaskerMode('tasker');
}

// Función para ver detalles completos de un usuario desde el admin
async function viewAdminUserDetails(usuarioId, tipo) {
    try {
        const response = await fetch(`${API_BASE}/admin/user/details/${usuarioId}?tipo=${tipo}`, {
            headers: {
                'Authorization': `Bearer ${currentToken}`
            }
        });

        const data = await response.json();
        if (response.ok && data.usuario) {
            const { usuario, tareas, calificaciones, estadisticas } = data;

            // Crear HTML del modal
            let modalHTML = `
                <div class="modal-overlay" onclick="closeAdminDetailsModal()">
                    <div class="modal-content admin-details-modal" onclick="event.stopPropagation()">
                        <button class="modal-close" onclick="event.stopPropagation(); closeAdminDetailsModal()" title="Cerrar">×</button>
                        <div class="admin-details-header">
                            <h2>👤 ${usuario.nombre} ${usuario.apellido}</h2>
                            <div class="user-status-badges">
                                ${usuario.aprobado_admin !== false 
                                    ? '<span class="badge approved">✅ Aprobado</span>' 
                                    : '<span class="badge pending">⏳ Pendiente</span>'}
                                ${usuario.bloqueado 
                                    ? '<span class="badge blocked">🚫 Bloqueado</span>' 
                                    : '<span class="badge active">✓ Activo</span>'}
                            </div>
                        </div>

                        <div class="admin-details-content">
                            <!-- INFORMACIÓN PERSONAL -->
                            <div class="details-section">
                                <h3>📋 Información Personal</h3>
                                <div class="details-grid">
                                    <div><strong>Email:</strong> ${usuario.email}</div>
                                    <div><strong>Teléfono:</strong> ${usuario.telefono || 'No especificado'}</div>
                                    <div><strong>Registro:</strong> ${new Date(usuario.createdAt).toLocaleDateString('es-ES')}</div>
                                    ${tipo === 'tasker' ? `
                                        ${usuario.cuit ? `<div><strong>CUIT:</strong> ${usuario.cuit}</div>` : ''}
                                        <div><strong>Monotributista:</strong> ${usuario.monotributista_check ? 'Sí' : 'No'}</div>
                                        <div><strong>Disponible:</strong> ${usuario.disponible ? 'Sí' : 'No'}</div>
                                        ${usuario.categoria_principal ? `<div><strong>Categoría:</strong> ${usuario.categoria_principal}</div>` : ''}
                                        ${usuario.especialidades && usuario.especialidades.length > 0 ? 
                                            `<div><strong>Especialidades:</strong> ${usuario.especialidades.join(', ')}</div>` : ''}
                                        ${usuario.skills && usuario.skills.length > 0 ? 
                                            `<div><strong>Skills:</strong> ${usuario.skills.join(', ')}</div>` : ''}
                                        ${usuario.licencias && usuario.licencias.length > 0 ? 
                                            `<div><strong>Licencias:</strong> ${usuario.licencias.join(', ')}</div>` : ''}
                                        ${usuario.descripcion_profesional ? 
                                            `<div><strong>Descripción Profesional:</strong> ${usuario.descripcion_profesional}</div>` : ''}
                                    ` : `
                                        ${usuario.ubicacion_default ? `<div><strong>Ubicación:</strong> ${usuario.ubicacion_default}</div>` : ''}
                                    `}
                                </div>
                            </div>

                            <!-- ESTADÍSTICAS -->
                            <div class="details-section">
                                <h3>📊 Estadísticas</h3>
                                <div class="stats-grid-small">
                                    <div class="stat-item">
                                        <div class="stat-label">Total Tareas</div>
                                        <div class="stat-value">${estadisticas.totalTareas}</div>
                                    </div>
                                    <div class="stat-item">
                                        <div class="stat-label">Finalizadas</div>
                                        <div class="stat-value">${estadisticas.tareasPorEstado.FINALIZADA}</div>
                                    </div>
                                    <div class="stat-item">
                                        <div class="stat-label">Calificaciones</div>
                                        <div class="stat-value">${estadisticas.totalCalificaciones}</div>
                                    </div>
                                    <div class="stat-item">
                                        <div class="stat-label">Promedio</div>
                                        <div class="stat-value">${estadisticas.promedioCalificaciones.toFixed(1)} ⭐</div>
                                    </div>
                                </div>
                                <div class="tareas-por-estado">
                                    <strong>Por Estado:</strong>
                                    <span>Pendiente: ${estadisticas.tareasPorEstado.PENDIENTE}</span>
                                    <span>Asignada: ${estadisticas.tareasPorEstado.ASIGNADA}</span>
                                    <span>En Proceso: ${estadisticas.tareasPorEstado.EN_PROCESO}</span>
                                    <span>Finalizada: ${estadisticas.tareasPorEstado.FINALIZADA}</span>
                                    <span>Cancelada: ${estadisticas.tareasPorEstado.CANCELADA}</span>
                                </div>
                            </div>

                            <!-- HISTORIAL DE TAREAS -->
                            <div class="details-section">
                                <h3>📋 Historial de Tareas (${tareas.length})</h3>
                                ${tareas.length > 0 ? `
                                    <div class="tareas-list">
                                        ${tareas.map(tarea => {
                                            const estadoBadgeMap = {
                                                'PENDIENTE': '<span class="badge pending">⏳ Pendiente</span>',
                                                'ASIGNADA': '<span class="badge assigned">📋 Asignada</span>',
                                                'EN_PROCESO': '<span class="badge in-progress">🔧 En Proceso</span>',
                                                'PENDIENTE_PAGO': '<span class="badge payment">💳 Pendiente Pago</span>',
                                                'FINALIZADA': '<span class="badge completed">✅ Finalizada</span>',
                                                'CANCELADA': '<span class="badge cancelled">❌ Cancelada</span>'
                                            };
                                            const estadoBadge = estadoBadgeMap[tarea.estado] || '';

                                            const otroUsuario = tipo === 'tasker' 
                                                ? (tarea.cliente ? `${tarea.cliente.nombre} ${tarea.cliente.apellido}` : 'N/A')
                                                : (tarea.tasker ? `${tarea.tasker.nombre} ${tarea.tasker.apellido}` : 'No asignado');

                                            return `
                                                <div class="tarea-item">
                                                    <div class="tarea-header">
                                                        <strong>${tarea.tipo_servicio || 'Sin tipo'}</strong>
                                                        ${estadoBadge}
                                                    </div>
                                                    <div class="tarea-details">
                                                        <p><strong>${tipo === 'tasker' ? 'Cliente' : 'Tasker'}:</strong> ${otroUsuario}</p>
                                                        <p><strong>Monto:</strong> $${parseFloat(tarea.monto_total_acordado || 0).toLocaleString('es-AR')}</p>
                                                        <p><strong>Fecha:</strong> ${tarea.fecha_hora_requerida ? new Date(tarea.fecha_hora_requerida).toLocaleDateString('es-ES') : 'N/A'}</p>
                                                        <p><strong>Creada:</strong> ${new Date(tarea.createdAt).toLocaleDateString('es-ES')}</p>
                                                    </div>
                                                </div>
                                            `;
                                        }).join('')}
                                    </div>
                                ` : '<p class="no-data">No hay tareas registradas</p>'}
                            </div>

                            <!-- CALIFICACIONES -->
                            <div class="details-section">
                                <h3>⭐ Calificaciones (${calificaciones.length})</h3>
                                ${calificaciones.length > 0 ? `
                                    <div class="calificaciones-list">
                                        ${calificaciones.map(calif => {
                                            const fecha = new Date(calif.createdAt).toLocaleDateString('es-ES');
                                            return `
                                                <div class="calificacion-item">
                                                    <div class="calificacion-header">
                                                        <span class="rating-stars">${'⭐'.repeat(calif.estrellas)}${'☆'.repeat(5 - calif.estrellas)}</span>
                                                        <span class="calificacion-fecha">${fecha}</span>
                                                    </div>
                                                    ${calif.comentario ? `<p class="calificacion-comentario">"${escapeHtml(calif.comentario)}"</p>` : ''}
                                                </div>
                                            `;
                                        }).join('')}
                                    </div>
                                ` : '<p class="no-data">No hay calificaciones registradas</p>'}
                            </div>
                        </div>
                    </div>
                </div>
            `;

            document.body.insertAdjacentHTML('beforeend', modalHTML);
        } else {
            showMessage(`❌ Error: ${data.message || 'Error al cargar detalles'}`, 'error');
        }
    } catch (error) {
        console.error('Error cargando detalles del usuario:', error);
        showMessage('❌ Error de conexión al cargar detalles', 'error');
    }
}

// Función para cerrar modal de detalles admin
function closeAdminDetailsModal() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) modal.remove();
}

// ========== FUNCIONES DE BÚSQUEDA Y FILTRADO ==========

// Función para filtrar taskers
function filterTaskers() {
    applyTaskersFilters();
}

function applyTaskersFilters() {
    const listContainer = document.getElementById('adminTaskersList');
    if (!listContainer || allAdminTaskers.length === 0) return;

    const searchTerm = document.getElementById('searchTaskers')?.value.toLowerCase() || '';
    const sortOption = document.getElementById('sortTaskers')?.value || 'name-asc';

    // Filtrar por búsqueda
    let filtered = allAdminTaskers.filter(tasker => {
        const nombre = `${tasker.nombre} ${tasker.apellido}`.toLowerCase();
        const email = (tasker.email || '').toLowerCase();
        const telefono = (tasker.telefono || '').toLowerCase();
        return nombre.includes(searchTerm) || email.includes(searchTerm) || telefono.includes(searchTerm);
    });

    // Ordenar
    filtered.sort((a, b) => {
        switch(sortOption) {
            case 'name-asc':
                return `${a.nombre} ${a.apellido}`.localeCompare(`${b.nombre} ${b.apellido}`);
            case 'name-desc':
                return `${b.nombre} ${b.apellido}`.localeCompare(`${a.nombre} ${a.apellido}`);
            case 'date-asc':
                return new Date(a.createdAt) - new Date(b.createdAt);
            case 'date-desc':
                return new Date(b.createdAt) - new Date(a.createdAt);
            default:
                return 0;
        }
    });

    // Actualizar datos filtrados
    currentAdminTaskers = filtered;

    // Renderizar
    renderTaskers(filtered);
}

function renderTaskers(taskers) {
    const listContainer = document.getElementById('adminTaskersList');
    if (!listContainer) return;

    if (taskers.length === 0) {
        listContainer.innerHTML = `<p class="no-results">No se encontraron taskers que coincidan con la búsqueda</p>`;
        return;
    }

    let html = '<div class="admin-items-list">';
    html += `<p class="total-count">Total: ${taskers.length} taskers</p>`;
    taskers.forEach(tasker => {
        const estadoBadge = tasker.aprobado_admin 
            ? '<span class="badge approved">✅ Aprobado</span>' 
            : '<span class="badge pending">⏳ Pendiente/Rechazado</span>';
        
        const bloqueadoBadge = tasker.bloqueado 
            ? '<span class="badge blocked">🚫 Bloqueado</span>' 
            : '<span class="badge active">✓ Activo</span>';

        html += `
            <div class="admin-item-card ${tasker.bloqueado ? 'blocked-user' : ''}">
                <div class="item-header">
                    <h4>${tasker.nombre} ${tasker.apellido}</h4>
                    <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
                        ${estadoBadge}
                        ${bloqueadoBadge}
                    </div>
                </div>
                <div class="item-details">
                    <p><strong>Email:</strong> ${tasker.email}</p>
                    <p><strong>Teléfono:</strong> ${tasker.telefono || 'No especificado'}</p>
                    ${tasker.cuit ? `<p><strong>CUIT:</strong> ${tasker.cuit}</p>` : ''}
                    <p><strong>Monotributista:</strong> ${tasker.monotributista_check ? 'Sí' : 'No'}</p>
                    <p><strong>Disponible:</strong> ${tasker.disponible ? 'Sí' : 'No'}</p>
                    <p><strong>Registro:</strong> ${new Date(tasker.createdAt).toLocaleDateString('es-ES')}</p>
                </div>
                <div class="item-actions">
                    <button class="btn-info" onclick="viewAdminUserDetails(${tasker.id}, 'tasker')" title="Ver detalles completos" style="margin-right: 10px;">👁️ Ver Detalles</button>
                    ${!tasker.aprobado_admin ? `
                        <button class="btn-primary" onclick="aprobarTasker(${tasker.id})">✅ Aprobar</button>
                    ` : `
                        <button class="btn-secondary" onclick="rechazarTasker(${tasker.id})">❌ Rechazar</button>
                    `}
                    ${tasker.bloqueado ? `
                        <button class="btn-success" onclick="desbloquearUsuario(${tasker.id}, 'tasker')">🔓 Desbloquear</button>
                    ` : `
                        <button class="btn-danger" onclick="bloquearUsuario(${tasker.id}, 'tasker')">🚫 Bloquear</button>
                    `}
                </div>
            </div>
        `;
    });
    html += '</div>';
    listContainer.innerHTML = html;
}

// Función para filtrar clientes
function filterClientes() {
    applyClientesFilters();
}

function applyClientesFilters() {
    const listContainer = document.getElementById('adminClientesList');
    if (!listContainer || allAdminClientes.length === 0) return;

    const searchTerm = document.getElementById('searchClientes')?.value.toLowerCase() || '';
    const sortOption = document.getElementById('sortClientes')?.value || 'name-asc';

    // Filtrar por búsqueda
    let filtered = allAdminClientes.filter(cliente => {
        const nombre = `${cliente.nombre} ${cliente.apellido}`.toLowerCase();
        const email = (cliente.email || '').toLowerCase();
        const telefono = (cliente.telefono || '').toLowerCase();
        return nombre.includes(searchTerm) || email.includes(searchTerm) || telefono.includes(searchTerm);
    });

    // Ordenar
    filtered.sort((a, b) => {
        switch(sortOption) {
            case 'name-asc':
                return `${a.nombre} ${a.apellido}`.localeCompare(`${b.nombre} ${b.apellido}`);
            case 'name-desc':
                return `${b.nombre} ${b.apellido}`.localeCompare(`${a.nombre} ${a.apellido}`);
            case 'date-asc':
                return new Date(a.createdAt) - new Date(b.createdAt);
            case 'date-desc':
                return new Date(b.createdAt) - new Date(a.createdAt);
            default:
                return 0;
        }
    });

    // Actualizar datos filtrados
    currentAdminClientes = filtered;

    // Renderizar
    renderClientes(filtered);
}

function renderClientes(clientes) {
    const listContainer = document.getElementById('adminClientesList');
    if (!listContainer) return;

    if (clientes.length === 0) {
        listContainer.innerHTML = `<p class="no-results">No se encontraron clientes que coincidan con la búsqueda</p>`;
        return;
    }

    let html = '<div class="admin-items-list">';
    html += `<p class="total-count">Total: ${clientes.length} clientes</p>`;
    clientes.forEach(cliente => {
        const estadoBadge = cliente.aprobado_admin !== false 
            ? '<span class="badge approved">✅ Aprobado</span>' 
            : '<span class="badge pending">⏳ Pendiente/Rechazado</span>';
        
        const bloqueadoBadge = cliente.bloqueado 
            ? '<span class="badge blocked">🚫 Bloqueado</span>' 
            : '<span class="badge active">✓ Activo</span>';

        html += `
            <div class="admin-item-card ${cliente.bloqueado ? 'blocked-user' : ''}">
                <div class="item-header">
                    <h4>${cliente.nombre} ${cliente.apellido}</h4>
                    <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
                        ${estadoBadge}
                        ${bloqueadoBadge}
                    </div>
                </div>
                <div class="item-details">
                    <p><strong>Email:</strong> ${cliente.email}</p>
                    <p><strong>Teléfono:</strong> ${cliente.telefono || 'No especificado'}</p>
                    ${cliente.ubicacion_default ? `<p><strong>Ubicación:</strong> ${cliente.ubicacion_default}</p>` : ''}
                    <p><strong>Registro:</strong> ${new Date(cliente.createdAt).toLocaleDateString('es-ES')}</p>
                </div>
                <div class="item-actions">
                    <button class="btn-info" onclick="viewAdminUserDetails(${cliente.id}, 'cliente')" title="Ver detalles completos" style="margin-right: 10px;">👁️ Ver Detalles</button>
                    ${cliente.aprobado_admin !== false ? `
                        <button class="btn-secondary" onclick="rechazarCliente(${cliente.id})">❌ Rechazar</button>
                    ` : `
                        <button class="btn-primary" onclick="aprobarCliente(${cliente.id})">✅ Aprobar</button>
                    `}
                    ${cliente.bloqueado ? `
                        <button class="btn-success" onclick="desbloquearUsuario(${cliente.id}, 'cliente')">🔓 Desbloquear</button>
                    ` : `
                        <button class="btn-danger" onclick="bloquearUsuario(${cliente.id}, 'cliente')">🚫 Bloquear</button>
                    `}
                </div>
            </div>
        `;
    });
    html += '</div>';
    listContainer.innerHTML = html;
}

// Función para filtrar tareas
function filterTareas() {
    applyTareasFilters();
}

function applyTareasFilters() {
    const listContainer = document.getElementById('adminTareasList');
    if (!listContainer || allAdminTareas.length === 0) return;

    const searchTerm = document.getElementById('searchTareas')?.value.toLowerCase() || '';
    const estadoFilter = document.getElementById('adminTareasFilter')?.value || 'all';
    const fechaDesde = document.getElementById('filterFechaDesde')?.value || '';
    const fechaHasta = document.getElementById('filterFechaHasta')?.value || '';
    const montoMin = parseFloat(document.getElementById('filterMontoMin')?.value) || 0;
    const montoMax = parseFloat(document.getElementById('filterMontoMax')?.value) || Infinity;
    const sortOption = document.getElementById('sortTareas')?.value || 'date-desc';

    // Filtrar
    let filtered = allAdminTareas.filter(tarea => {
        // Filtro por estado
        if (estadoFilter !== 'all' && tarea.estado !== estadoFilter) return false;

        // Filtro por búsqueda
        if (searchTerm) {
            const tipoServicio = (tarea.tipo_servicio || '').toLowerCase();
            const descripcion = (tarea.descripcion || '').toLowerCase();
            const clienteNombre = tarea.cliente ? `${tarea.cliente.nombre} ${tarea.cliente.apellido}`.toLowerCase() : '';
            const taskerNombre = tarea.tasker ? `${tarea.tasker.nombre} ${tarea.tasker.apellido}`.toLowerCase() : '';
            if (!tipoServicio.includes(searchTerm) && 
                !descripcion.includes(searchTerm) && 
                !clienteNombre.includes(searchTerm) && 
                !taskerNombre.includes(searchTerm)) {
                return false;
            }
        }

        // Filtro por fecha
        if (fechaDesde) {
            const fechaTarea = tarea.fecha_hora_requerida ? new Date(tarea.fecha_hora_requerida) : new Date(tarea.createdAt);
            if (fechaTarea < new Date(fechaDesde)) return false;
        }
        if (fechaHasta) {
            const fechaTarea = tarea.fecha_hora_requerida ? new Date(tarea.fecha_hora_requerida) : new Date(tarea.createdAt);
            if (fechaTarea > new Date(fechaHasta + 'T23:59:59')) return false;
        }

        // Filtro por monto
        const monto = parseFloat(tarea.monto_total_acordado || 0);
        if (monto < montoMin || monto > montoMax) return false;

        return true;
    });

    // Ordenar
    filtered.sort((a, b) => {
        switch(sortOption) {
            case 'date-desc':
                return new Date(b.createdAt) - new Date(a.createdAt);
            case 'date-asc':
                return new Date(a.createdAt) - new Date(b.createdAt);
            case 'monto-desc':
                return parseFloat(b.monto_total_acordado || 0) - parseFloat(a.monto_total_acordado || 0);
            case 'monto-asc':
                return parseFloat(a.monto_total_acordado || 0) - parseFloat(b.monto_total_acordado || 0);
            case 'estado-asc':
                return (a.estado || '').localeCompare(b.estado || '');
            default:
                return 0;
        }
    });

    // Actualizar datos filtrados
    currentAdminTareas = filtered;

    // Renderizar
    renderTareas(filtered);
}

function renderTareas(tareas) {
    const listContainer = document.getElementById('adminTareasList');
    if (!listContainer) return;

    if (tareas.length === 0) {
        listContainer.innerHTML = `<p class="no-results">No se encontraron tareas que coincidan con los filtros</p>`;
        return;
    }

    let html = '<div class="admin-items-list">';
    html += `<p class="total-count">Total: ${tareas.length} tareas</p>`;
    tareas.forEach(tarea => {
        const estadoBadgeMap = {
            'PENDIENTE': '<span class="badge pending">⏳ Pendiente</span>',
            'ASIGNADA': '<span class="badge assigned">📋 Asignada</span>',
            'EN_PROCESO': '<span class="badge in-progress">🔧 En Proceso</span>',
            'PENDIENTE_PAGO': '<span class="badge payment">💳 Pendiente Pago</span>',
            'FINALIZADA': '<span class="badge completed">✅ Finalizada</span>',
            'CANCELADA': '<span class="badge cancelled">❌ Cancelada</span>'
        };
        const estadoBadge = estadoBadgeMap[tarea.estado] || '';

        const aprobacionBadge = tarea.aprobado_admin !== false 
            ? '<span class="badge approved">✅ Aprobada</span>' 
            : '<span class="badge pending">⏳ Pendiente/Rechazada</span>';

        // Manejar ubicación
        let ubicacionTexto = 'No especificada';
        if (tarea.ubicacion) {
            if (typeof tarea.ubicacion === 'string') {
                ubicacionTexto = tarea.ubicacion;
            } else if (tarea.ubicacion.direccion) {
                ubicacionTexto = tarea.ubicacion.direccion;
            } else if (tarea.ubicacion.ciudad) {
                ubicacionTexto = tarea.ubicacion.ciudad;
            }
        }

        html += `
            <div class="admin-item-card">
                <div class="item-header">
                    <h4>${tarea.tipo_servicio || 'Sin tipo'} - $${parseFloat(tarea.monto_total_acordado || 0).toLocaleString('es-AR')}</h4>
                    <div style="display: flex; gap: 10px; align-items: center;">
                        ${estadoBadge}
                        ${aprobacionBadge}
                    </div>
                </div>
                <div class="item-details">
                    <p><strong>Descripción:</strong> ${tarea.descripcion || 'Sin descripción'}</p>
                    <p><strong>Cliente:</strong> ${tarea.cliente ? `${tarea.cliente.nombre} ${tarea.cliente.apellido} (${tarea.cliente.email})` : 'N/A'}</p>
                    <p><strong>Tasker:</strong> ${tarea.tasker ? `${tarea.tasker.nombre} ${tarea.tasker.apellido} (${tarea.tasker.email})` : 'No asignado'}</p>
                    <p><strong>Ubicación:</strong> ${ubicacionTexto}</p>
                    <p><strong>Fecha requerida:</strong> ${tarea.fecha_hora_requerida ? new Date(tarea.fecha_hora_requerida).toLocaleString('es-ES') : 'No especificada'}</p>
                    <p><strong>Creación:</strong> ${tarea.createdAt ? new Date(tarea.createdAt).toLocaleDateString('es-ES') : 'N/A'}</p>
                </div>
                <div class="item-actions">
                    ${tarea.aprobado_admin !== false ? `
                        <button class="btn-secondary" onclick="rechazarTarea(${tarea.id})">❌ Rechazar</button>
                    ` : `
                        <button class="btn-primary" onclick="aprobarTarea(${tarea.id})">✅ Aprobar</button>
                    `}
                </div>
            </div>
        `;
    });
    html += '</div>';
    listContainer.innerHTML = html;
}

// ========== FUNCIONES DE CALIFICACIONES ==========

// Función para mostrar formulario de calificación
async function showRatingForm(tareaId) {
    try {
        const formContainer = document.getElementById(`rating-form-${tareaId}`);
        if (!formContainer) {
            showMessage('❌ Error: No se encontró el contenedor del formulario', 'error');
            return;
        }

        // Si ya está visible, ocultarlo
        if (formContainer.style.display !== 'none') {
            formContainer.style.display = 'none';
            return;
        }

        // Obtener información de la tarea para saber a quién calificar
        // Intentar primero desde my-tasks, si no funciona, buscar directamente la tarea
        let tarea = null;
        
        try {
            const response = await fetch(`${API_BASE}/task/my-tasks`, {
                headers: {
                    'Authorization': `Bearer ${currentToken}`
                }
            });
            const data = await response.json();
            tarea = data.tareas?.find(t => t.id === tareaId);
        } catch (error) {
            console.log('No se pudo obtener desde my-tasks, intentando obtener tarea directamente');
        }

        // Si no se encontró, intentar obtener todas las tareas asignadas (para taskers)
        if (!tarea && currentUser.tipo === 'tasker') {
            try {
                const response = await fetch(`${API_BASE}/task/my-assigned-tasks`, {
                    headers: {
                        'Authorization': `Bearer ${currentToken}`
                    }
                });
                const data = await response.json();
                tarea = data.tareas?.find(t => t.id === tareaId);
            } catch (error) {
                console.log('No se pudo obtener desde my-assigned');
            }
        }

        // Si aún no se encontró, intentar obtener todas las tareas del cliente
        if (!tarea && currentUser.tipo === 'cliente') {
            try {
                const response = await fetch(`${API_BASE}/task/my-tasks`, {
                    headers: {
                        'Authorization': `Bearer ${currentToken}`
                    }
                });
                const data = await response.json();
                tarea = data.tareas?.find(t => t.id === tareaId);
            } catch (error) {
                console.log('No se pudo obtener desde my-tasks del cliente');
            }
        }

        if (!tarea) {
            showMessage('❌ Error: No se encontró la tarea. Asegúrate de que la tarea esté finalizada y ambas partes hayan confirmado el pago.', 'error');
            return;
        }

        // Determinar a quién se está calificando
        const userType = currentUser.tipo;
        let calificadoNombre = '';
        const esClienteCalificando = userType === 'cliente';
        
        if (esClienteCalificando) {
            // Cliente califica al tasker
            calificadoNombre = tarea.tasker_id ? `Tasker ID ${tarea.tasker_id}` : 'Tasker';
        } else {
            // Tasker califica al cliente
            calificadoNombre = tarea.cliente ? `${tarea.cliente.nombre} ${tarea.cliente.apellido || ''}` : 'Cliente';
        }

        // Verificar si ya calificó
        const ratingResponse = await fetch(`${API_BASE}/rating/task/${tareaId}`, {
            headers: {
                'Authorization': `Bearer ${currentToken}`
            }
        });

        let calificacionExistente = null;
        if (ratingResponse.ok) {
            const ratingData = await ratingResponse.json();
            calificacionExistente = ratingData.calificaciones?.find(c => 
                c.calificador_tipo === userType
            );
        }

        // Si es cliente calificando al tasker, mostrar todos los criterios
        // Si es tasker calificando al cliente, solo mostrar calificación general
        const criteriosHTML = esClienteCalificando ? `
                    <div class="rating-criteria">
                        <div class="rating-criterion" onclick="event.stopPropagation()">
                            <label>⏰ Puntualidad</label>
                            <div class="stars-input small">
                                ${[1, 2, 3, 4, 5].map(star => `
                                    <button type="button" class="star-btn small" data-star="${star}" onclick="event.stopPropagation(); selectStar(${star}, ${tareaId}, 'puntualidad')">
                                        ${star <= (calificacionExistente?.puntualidad || 0) ? '⭐' : '☆'}
                                    </button>
                                `).join('')}
                            </div>
                            <input type="hidden" id="ratingPuntualidad-${tareaId}" value="${calificacionExistente?.puntualidad || 0}">
                        </div>
                        
                        <div class="rating-criterion" onclick="event.stopPropagation()">
                            <label>🔧 Calidad del Trabajo</label>
                            <div class="stars-input small">
                                ${[1, 2, 3, 4, 5].map(star => `
                                    <button type="button" class="star-btn small" data-star="${star}" onclick="event.stopPropagation(); selectStar(${star}, ${tareaId}, 'calidad')">
                                        ${star <= (calificacionExistente?.calidad_trabajo || 0) ? '⭐' : '☆'}
                                    </button>
                                `).join('')}
                            </div>
                            <input type="hidden" id="ratingCalidad-${tareaId}" value="${calificacionExistente?.calidad_trabajo || 0}">
                        </div>
                        
                        <div class="rating-criterion" onclick="event.stopPropagation()">
                            <label>💬 Comunicación</label>
                            <div class="stars-input small">
                                ${[1, 2, 3, 4, 5].map(star => `
                                    <button type="button" class="star-btn small" data-star="${star}" onclick="event.stopPropagation(); selectStar(${star}, ${tareaId}, 'comunicacion')">
                                        ${star <= (calificacionExistente?.comunicacion || 0) ? '⭐' : '☆'}
                                    </button>
                                `).join('')}
                            </div>
                            <input type="hidden" id="ratingComunicacion-${tareaId}" value="${calificacionExistente?.comunicacion || 0}">
                        </div>
                        
                        <div class="rating-criterion" onclick="event.stopPropagation()">
                            <label>👔 Profesionalismo</label>
                            <div class="stars-input small">
                                ${[1, 2, 3, 4, 5].map(star => `
                                    <button type="button" class="star-btn small" data-star="${star}" onclick="event.stopPropagation(); selectStar(${star}, ${tareaId}, 'profesionalismo')">
                                        ${star <= (calificacionExistente?.profesionalismo || 0) ? '⭐' : '☆'}
                                    </button>
                                `).join('')}
                            </div>
                            <input type="hidden" id="ratingProfesionalismo-${tareaId}" value="${calificacionExistente?.profesionalismo || 0}">
                        </div>
                    </div>
        ` : '';

        // Crear formulario HTML
        const formHTML = `
            <div class="rating-form" onclick="event.stopPropagation()">
                <h4>⭐ Calificar a ${calificadoNombre}</h4>
                <form id="ratingForm-${tareaId}" onsubmit="submitRating(event, ${tareaId})" onclick="event.stopPropagation()">
                    <div class="rating-stars" onclick="event.stopPropagation()">
                        <label>Calificación General (1-5 estrellas) *</label>
                        <div class="stars-input">
                            ${[1, 2, 3, 4, 5].map(star => `
                                <button type="button" class="star-btn" data-star="${star}" onclick="event.stopPropagation(); selectStar(${star}, ${tareaId}, 'general')">
                                    ${star <= (calificacionExistente?.estrellas || 0) ? '⭐' : '☆'}
                                </button>
                            `).join('')}
                        </div>
                        <input type="hidden" id="ratingStars-${tareaId}" value="${calificacionExistente?.estrellas || 0}" required>
                    </div>
                    
                    ${criteriosHTML}
                    
                    <div class="form-group" onclick="event.stopPropagation()">
                        <label for="ratingComment-${tareaId}">Comentario (opcional)</label>
                        <textarea id="ratingComment-${tareaId}" rows="3" placeholder="Escribe tu opinión sobre el trabajo realizado..." onclick="event.stopPropagation()" onfocus="event.stopPropagation()">${calificacionExistente?.comentario || ''}</textarea>
                    </div>
                    <div class="rating-form-actions" onclick="event.stopPropagation()">
                        <button type="submit" class="btn-primary" onclick="event.stopPropagation()">💾 ${calificacionExistente ? 'Actualizar' : 'Enviar'} Calificación</button>
                        <button type="button" class="btn-secondary" onclick="event.stopPropagation(); document.getElementById('rating-form-${tareaId}').style.display='none'">Cancelar</button>
                    </div>
                </form>
            </div>
        `;

        formContainer.innerHTML = formHTML;
        formContainer.style.display = 'block';

        // Si ya hay calificación, seleccionar las estrellas
        if (calificacionExistente) {
            selectStar(calificacionExistente.estrellas, tareaId, 'general');
            // Solo cargar criterios adicionales si es cliente calificando al tasker
            if (esClienteCalificando) {
                if (calificacionExistente.puntualidad) {
                    selectStar(calificacionExistente.puntualidad, tareaId, 'puntualidad');
                }
                if (calificacionExistente.calidad_trabajo) {
                    selectStar(calificacionExistente.calidad_trabajo, tareaId, 'calidad');
                }
                if (calificacionExistente.comunicacion) {
                    selectStar(calificacionExistente.comunicacion, tareaId, 'comunicacion');
                }
                if (calificacionExistente.profesionalismo) {
                    selectStar(calificacionExistente.profesionalismo, tareaId, 'profesionalismo');
                }
            }
        }
    } catch (error) {
        console.error('Error mostrando formulario de calificación:', error);
        showMessage('❌ Error al cargar formulario de calificación', 'error');
    }
}

// Función para seleccionar estrellas
function selectStar(starCount, tareaId, tipo = 'general') {
    let inputId, selector;
    
    switch(tipo) {
        case 'puntualidad':
            inputId = `ratingPuntualidad-${tareaId}`;
            selector = `#rating-form-${tareaId} .rating-criterion:first-of-type .star-btn`;
            break;
        case 'calidad':
            inputId = `ratingCalidad-${tareaId}`;
            selector = `#rating-form-${tareaId} .rating-criterion:nth-of-type(2) .star-btn`;
            break;
        case 'comunicacion':
            inputId = `ratingComunicacion-${tareaId}`;
            selector = `#rating-form-${tareaId} .rating-criterion:nth-of-type(3) .star-btn`;
            break;
        case 'profesionalismo':
            inputId = `ratingProfesionalismo-${tareaId}`;
            selector = `#rating-form-${tareaId} .rating-criterion:nth-of-type(4) .star-btn`;
            break;
        default: // general
            inputId = `ratingStars-${tareaId}`;
            selector = `#rating-form-${tareaId} .rating-stars:first-of-type .star-btn`;
    }
    
    const starsInput = document.getElementById(inputId);
    if (starsInput) {
        starsInput.value = starCount;
    }

    // Actualizar visualización de estrellas del criterio específico
    const starButtons = document.querySelectorAll(selector);
    starButtons.forEach((btn, index) => {
        const starNum = index + 1;
        btn.textContent = starNum <= starCount ? '⭐' : '☆';
        btn.style.opacity = starNum <= starCount ? '1' : '0.3';
    });
}

// Función para enviar calificación
async function submitRating(event, tareaId) {
    event.preventDefault();

    try {
        const estrellas = parseInt(document.getElementById(`ratingStars-${tareaId}`).value);
        const userType = currentUser.tipo;
        const esClienteCalificando = userType === 'cliente';
        
        // Solo incluir criterios adicionales si es cliente calificando al tasker
        const puntualidad = esClienteCalificando ? (parseInt(document.getElementById(`ratingPuntualidad-${tareaId}`)?.value || 0) || null) : null;
        const calidad_trabajo = esClienteCalificando ? (parseInt(document.getElementById(`ratingCalidad-${tareaId}`)?.value || 0) || null) : null;
        const comunicacion = esClienteCalificando ? (parseInt(document.getElementById(`ratingComunicacion-${tareaId}`)?.value || 0) || null) : null;
        const profesionalismo = esClienteCalificando ? (parseInt(document.getElementById(`ratingProfesionalismo-${tareaId}`)?.value || 0) || null) : null;
        const comentario = document.getElementById(`ratingComment-${tareaId}`).value.trim();

        if (!estrellas || estrellas < 1 || estrellas > 5) {
            showMessage('❌ Por favor selecciona una calificación general de 1 a 5 estrellas', 'error');
            return;
        }

        const response = await fetch(`${API_BASE}/rating/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentToken}`
            },
            body: JSON.stringify({
                tarea_id: tareaId,
                estrellas: estrellas,
                puntualidad: puntualidad,
                calidad_trabajo: calidad_trabajo,
                comunicacion: comunicacion,
                profesionalismo: profesionalismo,
                comentario: comentario || null
            })
        });

        const data = await response.json();

        if (response.ok) {
            showMessage('✅ Calificación enviada exitosamente', 'success');
            
            // Ocultar formulario
            const formContainer = document.getElementById(`rating-form-${tareaId}`);
            if (formContainer) {
                formContainer.style.display = 'none';
            }

            // Recargar las tareas para actualizar la vista
            if (currentUser.tipo === 'cliente') {
                loadClientHistoryTasks();
            } else {
                loadTaskerHistoryTasks();
            }
        } else {
            showMessage(`❌ Error: ${data.message || 'Error al enviar calificación'}`, 'error');
        }
    } catch (error) {
        console.error('Error enviando calificación:', error);
        showMessage('❌ Error de conexión al enviar calificación', 'error');
    }
}

// Función para cargar tareas completadas con un usuario específico (para calificar desde perfil)
async function loadCompletedTasksWithUser(userId, userType, containerId) {
    try {
        const container = document.getElementById(containerId);
        if (!container) return;

        // Si el usuario actual es tasker viendo perfil de cliente, obtener tareas del tasker
        if (isTasker() && userType === 'cliente') {
            const response = await fetch(`${API_BASE}/task/my-assigned-tasks`, {
                headers: getAuthHeaders()
            });

            const data = await response.json();
            if (response.ok && data.tareas) {
                // Filtrar tareas finalizadas con este cliente y ambas partes confirmaron pago
                const tareasCompletadas = data.tareas.filter(t => {
                    const estado = (t.estado || '').toUpperCase().trim();
                    const esConEsteCliente = t.cliente_id === parseInt(userId);
                    const ambasConfirmaron = t.pago_confirmado_cliente && t.pago_recibido_tasker;
                    return estado === 'FINALIZADA' && esConEsteCliente && ambasConfirmaron;
                });

                if (tareasCompletadas.length > 0) {
                    let tasksHTML = '<div class="completed-tasks-list">';
                    tareasCompletadas.forEach(tarea => {
                        const fecha = new Date(tarea.fecha_hora_requerida).toLocaleDateString('es-ES');
                        tasksHTML += `
                            <div class="completed-task-item">
                                <div class="task-info">
                                    <p><strong>${tarea.tipo_servicio}</strong> - ${fecha}</p>
                                    <p class="task-description">${tarea.descripcion || 'Sin descripción'}</p>
                                </div>
                                <div class="task-actions">
                                    <button class="rate-task-btn" onclick="showRatingForm(${tarea.id})">⭐ Calificar</button>
                                </div>
                                <div id="rating-form-${tarea.id}" class="rating-form-container" style="display: none;" onclick="event.stopPropagation()"></div>
                            </div>
                        `;
                    });
                    tasksHTML += '</div>';
                    container.innerHTML = tasksHTML;
                } else {
                    container.innerHTML = '<p class="no-tasks">No hay tareas completadas con este cliente para calificar.</p>';
                }
            } else {
                container.innerHTML = '<p class="error">Error al cargar tareas</p>';
            }
        } else {
            // Si es cliente viendo perfil de tasker, obtener tareas del cliente
            if (isCliente() && userType === 'tasker') {
                const response = await fetch(`${API_BASE}/task/my-tasks`, {
                    headers: getAuthHeaders()
                });

                const data = await response.json();
                if (response.ok && data.tareas) {
                    // Filtrar tareas finalizadas con este tasker y ambas partes confirmaron pago
                    const tareasCompletadas = data.tareas.filter(t => {
                        const estado = (t.estado || '').toUpperCase().trim();
                        const esConEsteTasker = t.tasker_id === parseInt(userId);
                        const ambasConfirmaron = t.pago_confirmado_cliente && t.pago_recibido_tasker;
                        return estado === 'FINALIZADA' && esConEsteTasker && ambasConfirmaron;
                    });

                    if (tareasCompletadas.length > 0) {
                        let tasksHTML = '<div class="completed-tasks-list">';
                        tareasCompletadas.forEach(tarea => {
                            const fecha = new Date(tarea.fecha_hora_requerida).toLocaleDateString('es-ES');
                            tasksHTML += `
                                <div class="completed-task-item">
                                    <div class="task-info">
                                        <p><strong>${tarea.tipo_servicio}</strong> - ${fecha}</p>
                                        <p class="task-description">${tarea.descripcion || 'Sin descripción'}</p>
                                    </div>
                                    <div class="task-actions">
                                        <button class="rate-task-btn" onclick="showRatingForm(${tarea.id})">⭐ Calificar</button>
                                    </div>
                                    <div id="rating-form-${tarea.id}" class="rating-form-container" style="display: none;" onclick="event.stopPropagation()"></div>
                                </div>
                            `;
                        });
                        tasksHTML += '</div>';
                        container.innerHTML = tasksHTML;
                    } else {
                        container.innerHTML = '<p class="no-tasks">No hay tareas completadas con este tasker para calificar.</p>';
                    }
                } else {
                    container.innerHTML = '<p class="error">Error al cargar tareas</p>';
                }
            } else {
                container.innerHTML = '<p class="no-tasks">No se pueden cargar tareas para este tipo de usuario.</p>';
            }
        }
    } catch (error) {
        console.error('Error cargando tareas completadas:', error);
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = '<p class="error">Error al cargar tareas completadas</p>';
        }
    }
}

// Función para cargar y mostrar calificaciones de un usuario
async function loadUserRatings(userId, userType, containerId) {
    try {
        // El endpoint de calificaciones es público, pero si hay token lo enviamos
        const response = await fetch(`${API_BASE}/rating/user/${userId}?tipo=${userType}`, {
            headers: getAuthHeaders()
        });

        const data = await response.json();
        const container = document.getElementById(containerId);

        if (response.ok && container) {
            const { calificaciones, promedio, cantidad } = data;

            let ratingsHTML = '';

            if (cantidad > 0) {
                // Resumen siempre visible
                ratingsHTML += `
                    <div class="ratings-summary">
                        <div class="rating-average">
                            <span class="average-stars">${'⭐'.repeat(Math.round(promedio))}${'☆'.repeat(5 - Math.round(promedio))}</span>
                            <span class="average-number">${promedio.toFixed(1)}</span>
                            <span class="rating-count">(${cantidad} ${cantidad === 1 ? 'calificación' : 'calificaciones'})</span>
                        </div>
                        <button class="btn-toggle-ratings" onclick="toggleRatingsDetails('${containerId}')">
                            <span id="ratings-toggle-text-${containerId}">📖 Ver Detalles</span>
                        </button>
                    </div>
                    <div id="ratings-details-${containerId}" class="ratings-list" style="display: none;">
                        <h4>Calificaciones recibidas:</h4>
                        ${calificaciones.map(calif => {
                            const fecha = new Date(calif.createdAt).toLocaleDateString('es-ES');
                            const criterios = [];
                            if (calif.puntualidad) criterios.push(`⏰ Puntualidad: ${'⭐'.repeat(calif.puntualidad)}${'☆'.repeat(5 - calif.puntualidad)}`);
                            if (calif.calidad_trabajo) criterios.push(`🔧 Calidad: ${'⭐'.repeat(calif.calidad_trabajo)}${'☆'.repeat(5 - calif.calidad_trabajo)}`);
                            if (calif.comunicacion) criterios.push(`💬 Comunicación: ${'⭐'.repeat(calif.comunicacion)}${'☆'.repeat(5 - calif.comunicacion)}`);
                            if (calif.profesionalismo) criterios.push(`👔 Profesionalismo: ${'⭐'.repeat(calif.profesionalismo)}${'☆'.repeat(5 - calif.profesionalismo)}`);
                            
                            return `
                                <div class="rating-item">
                                    <div class="rating-header">
                                        <div>
                                            <span class="rating-stars-display">${'⭐'.repeat(calif.estrellas)}${'☆'.repeat(5 - calif.estrellas)}</span>
                                            <span class="rating-general-label">Calificación General</span>
                                        </div>
                                        <span class="rating-date">${fecha}</span>
                                    </div>
                                    ${criterios.length > 0 ? `
                                        <div class="rating-criteria-display">
                                            ${criterios.map(c => `<span class="rating-criterion-item">${c}</span>`).join('')}
                                        </div>
                                    ` : ''}
                                    ${calif.comentario ? `<p class="rating-comment">"${escapeHtml(calif.comentario)}"</p>` : ''}
                                </div>
                            `;
                        }).join('')}
                    </div>
                `;
            } else {
                ratingsHTML = `
                    <div class="no-ratings">
                        <p>⭐ Aún no tiene calificaciones</p>
                    </div>
                `;
            }

            container.innerHTML = ratingsHTML;
        }
    } catch (error) {
        console.error('Error cargando calificaciones:', error);
    }
}

// Función para expandir/colapsar detalles de calificaciones
function toggleRatingsDetails(containerId) {
    const detailsDiv = document.getElementById(`ratings-details-${containerId}`);
    const toggleText = document.getElementById(`ratings-toggle-text-${containerId}`);
    
    if (detailsDiv && toggleText) {
        if (detailsDiv.style.display === 'none' || detailsDiv.style.display === '') {
            detailsDiv.style.display = 'block';
            toggleText.textContent = '📕 Ocultar Detalles';
        } else {
            detailsDiv.style.display = 'none';
            toggleText.textContent = '📖 Ver Detalles';
        }
    }
}

// ==================== GESTIÓN DE CATEGORÍAS (ADMIN) ====================

// Función para cargar categorías en el panel admin
async function loadAdminCategorias() {
    try {
        const response = await fetch(`${API_BASE}/admin/categorias?incluir_inactivas=true`, {
            headers: {
                'Authorization': `Bearer ${currentToken}`
            }
        });

        if (!response.ok) {
            throw new Error('Error al cargar categorías');
        }

        const data = await response.json();
        const categorias = data.categorias || [];

        const container = document.getElementById('adminCategoriasList');
        if (!container) return;

        if (categorias.length === 0) {
            container.innerHTML = '<p class="no-data">No hay categorías configuradas</p>';
            return;
        }

        let html = '<div class="categorias-grid">';
        categorias.forEach(categoria => {
            html += `
                <div class="categoria-card ${!categoria.activa ? 'inactiva' : ''}">
                    <div class="categoria-header">
                        <div class="categoria-icon">${categoria.icono || '🔧'}</div>
                        <div class="categoria-info">
                            <h4>${categoria.nombre}</h4>
                            <p>${categoria.descripcion || 'Sin descripción'}</p>
                        </div>
                        <div class="categoria-status">
                            <span class="status-badge ${categoria.activa ? 'activa' : 'inactiva'}">
                                ${categoria.activa ? '✓ Activa' : '✗ Inactiva'}
                            </span>
                        </div>
                    </div>
                    <div class="categoria-details">
                        <div class="detail-item">
                            <strong>ID:</strong> ${categoria.id}
                        </div>
                        <div class="detail-item">
                            <strong>Tiempo estimado:</strong> ${categoria.tiempo_estimado || 'N/A'}
                        </div>
                        <div class="detail-item">
                            <strong>Requiere matrícula:</strong> ${categoria.requiere_matricula ? 'Sí' : 'No'}
                        </div>
                        <div class="detail-item">
                            <strong>Requiere título:</strong> ${categoria.requiere_titulo ? 'Sí' : 'No'}
                        </div>
                        <div class="detail-item">
                            <strong>Orden:</strong> ${categoria.orden || 'N/A'}
                        </div>
                        <div class="detail-item">
                            <strong>Subcategorías:</strong> ${categoria.subcategorias ? categoria.subcategorias.length : 0}
                        </div>
                    </div>
                    ${categoria.subcategorias && categoria.subcategorias.length > 0 ? `
                        <div class="subcategorias-list">
                            <strong>Subcategorías:</strong>
                            <ul>
                                ${categoria.subcategorias.map(sub => `<li>${sub.nombre}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                    <div class="categoria-actions">
                        <button class="btn-edit" onclick="showEditCategoriaModal('${categoria.id}')">
                            ✏️ Editar
                        </button>
                        ${categoria.activa ? `
                            <button class="btn-delete" onclick="deleteCategoria('${categoria.id}')">
                                🗑️ Desactivar
                            </button>
                        ` : `
                            <button class="btn-restore" onclick="restoreCategoria('${categoria.id}')">
                                ♻️ Activar
                            </button>
                        `}
                    </div>
                </div>
            `;
        });
        html += '</div>';
        container.innerHTML = html;
    } catch (error) {
        console.error('Error al cargar categorías:', error);
        showMessage('❌ Error al cargar categorías: ' + error.message, 'error');
    }
}

// Función para mostrar modal de creación/edición de categoría
function showCreateCategoriaModal(categoriaId = null) {
    // Por ahora, mostrar un alert simple. Se puede mejorar con un modal más elaborado
    const accion = categoriaId ? 'editar' : 'crear';
    alert(`Funcionalidad de ${accion} categoría. Se implementará un modal completo próximamente.`);
    // TODO: Implementar modal completo con formulario
}

function showEditCategoriaModal(categoriaId) {
    showCreateCategoriaModal(categoriaId);
}

// Función para eliminar (desactivar) una categoría
async function deleteCategoria(categoriaId) {
    if (!confirm(`¿Estás seguro de que deseas desactivar la categoría "${categoriaId}"?`)) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/admin/categorias/${categoriaId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${currentToken}`
            }
        });

        if (response.ok) {
            showMessage('✅ Categoría desactivada exitosamente', 'success');
            loadAdminCategorias();
        } else {
            const data = await response.json();
            throw new Error(data.message || 'Error al desactivar categoría');
        }
    } catch (error) {
        console.error('Error al desactivar categoría:', error);
        showMessage('❌ Error al desactivar categoría: ' + error.message, 'error');
    }
}

// Función para restaurar (activar) una categoría
async function restoreCategoria(categoriaId) {
    try {
        const response = await fetch(`${API_BASE}/admin/categorias/${categoriaId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${currentToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ activa: true })
        });

        if (response.ok) {
            showMessage('✅ Categoría activada exitosamente', 'success');
            loadAdminCategorias();
        } else {
            const data = await response.json();
            throw new Error(data.message || 'Error al activar categoría');
        }
    } catch (error) {
        console.error('Error al activar categoría:', error);
        showMessage('❌ Error al activar categoría: ' + error.message, 'error');
    }
}

// Función para mostrar modal de registro como tasker (desde perfil de cliente)
function showBecomeTaskerModal() {
    const modalHTML = `
        <div class="modal-overlay" id="becomeTaskerModal" onclick="closeBecomeTaskerModal(event)">
            <div class="modal-content" onclick="event.stopPropagation()" style="max-width: 600px; max-height: 90vh; overflow-y: auto;">
                <button class="modal-close" onclick="closeBecomeTaskerModal(event)">×</button>
                <h2>🔧 Registrarse como Tasker</h2>
                <p style="color: #64748b; margin-bottom: 20px;">
                    Completa tu información como Tasker. Podrás seguir usando la app como Cliente.
                </p>
                
                <form id="becomeTaskerForm" onsubmit="registerAsTasker(event)">
                    <div class="form-group">
                        <label for="becomeTaskerPassword">Confirma tu contraseña *</label>
                        <input type="password" id="becomeTaskerPassword" placeholder="Ingresa tu contraseña actual" required>
                        <small>Necesitamos confirmar tu identidad</small>
                    </div>
                    
                    <div class="form-group">
                        <label for="becomeTaskerCategoria">Categoría Principal *</label>
                        <select id="becomeTaskerCategoria" required onchange="updateBecomeTaskerEspecialidades()">
                            <option value="" disabled selected>🏷️ Seleccionar categoría</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="becomeTaskerEspecialidad">Especialidad (opcional)</label>
                        <select id="becomeTaskerEspecialidad">
                            <option value="" selected>👷 Selecciona primero una categoría</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="becomeTaskerCuit">CUIT (opcional)</label>
                        <input type="text" id="becomeTaskerCuit" placeholder="XX-XXXXXXXX-X">
                    </div>
                    
                    <div class="form-group">
                        <label>
                            <input type="checkbox" id="becomeTaskerMonotributista"> Soy monotributista
                        </label>
                    </div>
                    
                    <div class="form-group">
                        <label>Subir documentos (opcional)</label>
                        <input type="file" id="becomeTaskerDni" accept="image/*,.pdf">
                        <small>DNI</small>
                    </div>
                    <div class="form-group">
                        <input type="file" id="becomeTaskerMatricula" accept="image/*,.pdf">
                        <small>Matrícula (si aplica)</small>
                    </div>
                    <div class="form-group">
                        <input type="file" id="becomeTaskerLicencia" accept="image/*,.pdf">
                        <small>Licencia de conducir (si aplica)</small>
                    </div>
                    
                    <div class="terms-container" style="margin: 20px 0;">
                        <label class="terms-label">
                            <input type="checkbox" id="becomeTaskerTerms" required>
                            <span class="checkmark"></span>
                            <span>Acepto los <a href="#" onclick="event.preventDefault(); showTermsModal(event)">Términos y Condiciones</a> como Tasker</span>
                        </label>
                    </div>
                    
                    <button type="submit" class="btn-primary" style="width: 100%;">
                        🚀 Registrarse como Tasker
                    </button>
                </form>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Cargar categorías
    loadCategoriasForRegistration().then(() => {
        const categoriaSelect = document.getElementById('becomeTaskerCategoria');
        if (categoriaSelect) {
            categoriasDisponibles.forEach(categoria => {
                if (categoria.activa) {
                    const option = new Option(`${categoria.icono} ${categoria.nombre}`, categoria.id);
                    categoriaSelect.add(option);
                }
            });
        }
    });
}

function closeBecomeTaskerModal(event) {
    if (event) event.stopPropagation();
    const modal = document.getElementById('becomeTaskerModal');
    if (modal) modal.remove();
}

function updateBecomeTaskerEspecialidades() {
    const categoriaSelect = document.getElementById('becomeTaskerCategoria');
    const especialidadSelect = document.getElementById('becomeTaskerEspecialidad');
    
    if (!categoriaSelect || !especialidadSelect) return;
    
    const categoriaId = categoriaSelect.value;
    
    // Limpiar opciones
    especialidadSelect.innerHTML = '<option value="" selected>👷 Selecciona primero una categoría</option>';
    
    if (!categoriaId) return;
    
    const categoria = categoriasDisponibles.find(cat => cat.id === categoriaId);
    
    if (categoria && categoria.subcategorias && categoria.subcategorias.length > 0) {
        categoria.subcategorias.forEach(subcat => {
            const option = new Option(subcat.nombre, subcat.id);
            especialidadSelect.add(option);
        });
    }
}

// Función para registrar como tasker desde el perfil de cliente
async function registerAsTasker(event) {
    if (event) event.preventDefault();
    
    const password = document.getElementById('becomeTaskerPassword').value;
    const categoriaPrincipal = document.getElementById('becomeTaskerCategoria').value;
    const especialidad = document.getElementById('becomeTaskerEspecialidad').value;
    const cuit = document.getElementById('becomeTaskerCuit').value;
    const monotributista = document.getElementById('becomeTaskerMonotributista').checked;
    const termsAccepted = document.getElementById('becomeTaskerTerms').checked;
    
    if (!termsAccepted) {
        showMessage('❌ Debes aceptar los Términos y Condiciones', 'error');
        return;
    }
    
    if (!password) {
        showMessage('❌ Debes ingresar tu contraseña', 'error');
        return;
    }
    
    if (!categoriaPrincipal) {
        showMessage('❌ Debes seleccionar una categoría principal', 'error');
        return;
    }
    
    const categoria = categoriasDisponibles.find(cat => cat.id === categoriaPrincipal);
    const especialidades = categoria && categoria.subcategorias && especialidad
        ? categoria.subcategorias.filter(sub => sub.id === especialidad).map(sub => sub.nombre)
        : [];
    
    const formData = new FormData();
    formData.append('email', currentUser.email);
    formData.append('password', password);
    formData.append('categoria_principal', categoriaPrincipal);
    if (especialidades.length > 0) {
        especialidades.forEach(esp => formData.append('especialidades[]', esp));
    }
    if (cuit) formData.append('cuit', cuit);
    formData.append('monotributista_check', monotributista);
    
    const dniFile = document.getElementById('becomeTaskerDni').files[0];
    const matriculaFile = document.getElementById('becomeTaskerMatricula').files[0];
    const licenciaFile = document.getElementById('becomeTaskerLicencia').files[0];
    
    if (dniFile) formData.append('dni', dniFile);
    if (matriculaFile) formData.append('matricula', matriculaFile);
    if (licenciaFile) formData.append('licencia', licenciaFile);
    
    try {
        const submitBtn = event.target.querySelector('button[type="submit"]');
        setLoading(submitBtn, true);
        
        const response = await fetch(`${API_BASE}/auth/register/cliente-as-tasker`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${currentToken}`
            },
            body: formData
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showMessage('✅ Registrado como Tasker exitosamente. Espera la aprobación del administrador.', 'success');
            closeBecomeTaskerModal();
            
            // Recargar el usuario para obtener la información actualizada
            setTimeout(async () => {
                try {
                    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            email: currentUser.email,
                            password: password
                        })
                    });
                    
                    const loginData = await loginResponse.json();
                    if (loginResponse.ok) {
                        currentToken = loginData.token;
                        currentUser = loginData.usuario;
                        showProfileContent(); // Recargar perfil
                    }
                } catch (error) {
                    console.error('Error al recargar usuario:', error);
                }
            }, 1000);
        } else {
            showMessage(`❌ Error: ${data.message || data.error || 'Error al registrarse como tasker'}`, 'error');
        }
    } catch (error) {
        console.error('Error al registrarse como tasker:', error);
        showMessage('❌ Error de conexión: ' + error.message, 'error');
    } finally {
        const submitBtn = event.target.querySelector('button[type="submit"]');
        if (submitBtn) setLoading(submitBtn, false);
    }
}

// Función para actualizar especialidades en el perfil unificado
function updateProfileEspecialidades() {
    const categoriaSelect = document.getElementById('profileCategoriaPrincipal');
    const especialidadesSelect = document.getElementById('profileEspecialidades');
    
    if (!categoriaSelect || !especialidadesSelect) return;
    
    const categoriaId = categoriaSelect.value;
    
    // Limpiar opciones
    especialidadesSelect.innerHTML = '';
    
    if (!categoriaId) return;
    
    const categoria = categoriasDisponibles.find(cat => cat.id === categoriaId);
    
    if (categoria && categoria.subcategorias && categoria.subcategorias.length > 0) {
        categoria.subcategorias.forEach(subcat => {
            const option = new Option(subcat.nombre, subcat.id);
            // Marcar como seleccionada si está en las especialidades del usuario
            if (currentUser.especialidades && currentUser.especialidades.includes(subcat.nombre)) {
                option.selected = true;
            }
            especialidadesSelect.add(option);
        });
    }
}

// ========== SISTEMA DE CHAT/MENSAJERÍA ==========

// Variables globales para el chat
let chatPollingInterval = null;
let currentChatTareaId = null;
let chatModalOpen = false;

/**
 * Abrir modal de chat para una tarea
 * @param {number} tareaId - ID de la tarea
 */
async function openChatModal(tareaId) {
    currentChatTareaId = tareaId;
    chatModalOpen = true;
    
    // Limpiar estado previo de mensajes para esta tarea (para detectar nuevos)
    const tareaKey = `tarea-${tareaId}`;
    lastMessagesState[tareaKey] = [];

    // Crear modal si no existe
    let chatModal = document.getElementById('chatModal');
    if (!chatModal) {
        chatModal = document.createElement('div');
        chatModal.id = 'chatModal';
        chatModal.className = 'modal-overlay';
        chatModal.innerHTML = `
            <div class="modal-content chat-modal-content" onclick="event.stopPropagation()">
                <div class="chat-header">
                    <h2>💬 Chat</h2>
                    <button class="modal-close" onclick="closeChatModal()" title="Cerrar">×</button>
                </div>
                <div class="chat-messages" id="chatMessages">
                    <div class="chat-loading">Cargando mensajes...</div>
                </div>
                <div class="chat-input-container">
                    <input type="text" id="chatInput" class="chat-input" placeholder="Escribe un mensaje..." maxlength="1000">
                    <button id="chatSendBtn" class="chat-send-btn" onclick="sendChatMessage()">📤</button>
                </div>
            </div>
        `;
        document.body.appendChild(chatModal);

        // Permitir enviar con Enter
        const chatInput = document.getElementById('chatInput');
        if (chatInput) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    sendChatMessage();
                }
            });
        }
    }

    // Mostrar modal
    chatModal.style.display = 'flex';

    // Cargar mensajes
    await loadChatMessages(tareaId);

    // Iniciar polling para nuevos mensajes
    startChatPolling(tareaId);
}

/**
 * Cerrar modal de chat
 */
async function closeChatModal() {
    const chatModal = document.getElementById('chatModal');
    if (chatModal) {
        chatModal.style.display = 'none';
    }
    chatModalOpen = false;
    currentChatTareaId = null;
    stopChatPolling();
    
    // Actualizar contadores inmediatamente
    await loadUnreadMessageCounts();
    
    // Si estamos en la sección de chat, recargar la lista de conversaciones
    const chatContent = document.getElementById('chatContent');
    if (chatContent && chatContent.style.display !== 'none') {
        loadChatConversations();
    }
}

/**
 * Cargar mensajes de una tarea
 * @param {number} tareaId - ID de la tarea
 */
async function loadChatMessages(tareaId) {
    try {
        const messagesContainer = document.getElementById('chatMessages');
        if (!messagesContainer) return;

        const response = await fetch(`${API_BASE}/chat/tarea/${tareaId}`, {
            headers: getAuthHeaders()
        });

        const data = await response.json();

        if (response.ok) {
            const mensajes = data.mensajes || [];
            
            // Detectar mensajes nuevos para notificaciones
            const tareaKey = `tarea-${tareaId}`;
            const previousMessages = lastMessagesState[tareaKey] || [];
            const newMessages = mensajes.filter(m => {
                const exists = previousMessages.find(pm => pm.id === m.id);
                return !exists;
            });

            // Guardar estado actual
            lastMessagesState[tareaKey] = mensajes;

            // Mostrar notificaciones para mensajes nuevos
            if (newMessages.length > 0 && Notification.permission === 'granted') {
                const usuarioId = currentUser.tipo === 'cliente' 
                    ? (currentUser.esUsuarioDual ? currentUser.cliente_id : currentUser.id)
                    : (currentUser.esUsuarioDual ? currentUser.tasker_id : currentUser.id);
                const usuarioTipo = currentUser.tipo;

                newMessages.forEach(mensaje => {
                    const esMio = mensaje.remitente_id === usuarioId && mensaje.remitente_tipo === usuarioTipo;
                    if (!esMio) {
                        showNewMessageNotification(tareaId, mensaje.mensaje, mensaje.remitente_nombre || 'Usuario');
                    }
                });
            }
            
            if (mensajes.length === 0) {
                messagesContainer.innerHTML = `
                    <div class="chat-empty">
                        <p>💬 No hay mensajes aún.</p>
                        <p>¡Sé el primero en escribir!</p>
                    </div>
`;
            } else {
                let messagesHTML = '';
                
                // Determinar el rol del usuario en esta tarea específica
                const tarea = data.tarea;
                let usuarioId, usuarioTipo;
                
                if (currentUser.esUsuarioDual) {
                    // Usuario dual: determinar rol según la tarea
                    const taskerId = currentUser.tasker_id;
                    const clienteId = currentUser.cliente_id;
                    
                    // Verificar si es el tasker asignado en esta tarea
                    if (tarea && tarea.tasker_id === taskerId) {
                        usuarioId = taskerId;
                        usuarioTipo = 'tasker';
                    }
                    // Verificar si es el cliente de esta tarea
                    else if (tarea && tarea.cliente_id === clienteId) {
                        usuarioId = clienteId;
                        usuarioTipo = 'cliente';
                    }
                    // Si no está asignado pero hay mensajes, determinar por los mensajes
                    else {
                        // Verificar qué tipo de mensajes tiene el usuario en esta tarea
                        const mensajesDelUsuario = data.mensajes.filter(m => 
                            (m.remitente_id === taskerId && m.remitente_tipo === 'tasker') ||
                            (m.remitente_id === clienteId && m.remitente_tipo === 'cliente')
                        );
                        
                        if (mensajesDelUsuario.length > 0) {
                            // Usar el tipo del primer mensaje del usuario
                            const primerMensaje = mensajesDelUsuario[0];
                            if (primerMensaje.remitente_tipo === 'tasker' && primerMensaje.remitente_id === taskerId) {
                                usuarioId = taskerId;
                                usuarioTipo = 'tasker';
                            } else {
                                usuarioId = clienteId;
                                usuarioTipo = 'cliente';
                            }
                        } else {
                            // Por defecto, si es usuario dual y no hay contexto, usar tasker
                            usuarioId = taskerId;
                            usuarioTipo = 'tasker';
                        }
                    }
                } else if (currentUser.tipo === 'cliente') {
                    // Usuario es cliente (no dual)
                    usuarioId = currentUser.id;
                    usuarioTipo = 'cliente';
                } else if (currentUser.tipo === 'tasker') {
                    // Usuario es tasker (no dual)
                    usuarioId = currentUser.id;
                    usuarioTipo = 'tasker';
                } else {
                    // Fallback
                    usuarioId = currentUser.id;
                    usuarioTipo = currentUser.tipo;
                }

                // Debug: mostrar información
                console.log('🔍 Chat - Usuario actual:', {
                    tipo: currentUser.tipo,
                    esUsuarioDual: currentUser.esUsuarioDual,
                    usuarioId,
                    usuarioTipo,
                    tarea: tarea ? { cliente_id: tarea.cliente_id, tasker_id: tarea.tasker_id } : null
                });

                let mensajesNoLeidos = [];
                
                // Para usuarios duales, necesitamos verificar ambos IDs posibles
                const posiblesIds = [];
                if (currentUser.esUsuarioDual) {
                    // Siempre agregar ambos IDs posibles para usuarios duales
                    posiblesIds.push({ id: currentUser.tasker_id, tipo: 'tasker' });
                    posiblesIds.push({ id: currentUser.cliente_id, tipo: 'cliente' });
                    // También verificar si hay mensajes con el ID original
                    if (currentUser.id !== currentUser.tasker_id && currentUser.id !== currentUser.cliente_id) {
                        posiblesIds.push({ id: currentUser.id, tipo: 'tasker' });
                        posiblesIds.push({ id: currentUser.id, tipo: 'cliente' });
                    }
                } else {
                    posiblesIds.push({ id: usuarioId, tipo: usuarioTipo });
                }
                
                mensajes.forEach(mensaje => {
                    // Verificar si el mensaje es mío comparando con todos los IDs posibles
                    let esMio = posiblesIds.some(possible => 
                        mensaje.remitente_id === possible.id && mensaje.remitente_tipo === possible.tipo
                    );
                    
                    // Si no se encontró, verificar también con el usuarioId y usuarioTipo directamente
                    if (!esMio) {
                        esMio = mensaje.remitente_id === usuarioId && mensaje.remitente_tipo === usuarioTipo;
                    }
                    
                    // Para taskers, también verificar si el mensaje fue enviado por el tasker_id o el id original
                    if (!esMio && currentUser.tipo === 'tasker') {
                        const taskerId = currentUser.esUsuarioDual ? currentUser.tasker_id : currentUser.id;
                        if (mensaje.remitente_tipo === 'tasker' && 
                            (mensaje.remitente_id === taskerId || mensaje.remitente_id === currentUser.id)) {
                            esMio = true;
                        }
                    }
                    
                    // Debug para el primer mensaje
                    if (mensajes.indexOf(mensaje) === 0) {
                        console.log('🔍 Chat - Primer mensaje:', {
                            remitente_id: mensaje.remitente_id,
                            remitente_tipo: mensaje.remitente_tipo,
                            usuarioId,
                            usuarioTipo,
                            posiblesIds,
                            esMio,
                            currentUser: {
                                id: currentUser.id,
                                tipo: currentUser.tipo,
                                esUsuarioDual: currentUser.esUsuarioDual,
                                tasker_id: currentUser.tasker_id,
                                cliente_id: currentUser.cliente_id
                            }
                        });
                    }
                    
                    // Formato de fecha mejorado (tiempo relativo)
                    const fecha = formatMessageTime(mensaje.createdAt);

                    messagesHTML += `
                        <div class="chat-message ${esMio ? 'chat-message-own' : 'chat-message-other'}">
                            <div class="chat-message-text">${escapeHtml(mensaje.mensaje)}</div>
                            <div class="chat-message-footer">
                                <span class="chat-message-time">${fecha}</span>
                                ${esMio ? `<span class="chat-message-status ${mensaje.leido ? 'read' : ''}">${mensaje.leido ? '✓✓' : '✓'}</span>` : ''}
                            </div>
                        </div>
                    `;

                    // Guardar mensajes no leídos para marcarlos después (solo los que NO son míos)
                    if (!esMio && !mensaje.leido) {
                        mensajesNoLeidos.push(mensaje.id);
                    }
                });

                messagesContainer.innerHTML = messagesHTML;
                scrollChatToBottom();
                
                // Marcar todos los mensajes no leídos como leídos de una vez
                if (mensajesNoLeidos.length > 0) {
                    markAllMessagesAsRead(mensajesNoLeidos, tareaId);
                }
            }
        } else {
            messagesContainer.innerHTML = `
                <div class="chat-error">
                    <p>❌ Error: ${data.message || 'Error al cargar mensajes'}</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error cargando mensajes:', error);
        const messagesContainer = document.getElementById('chatMessages');
        if (messagesContainer) {
            messagesContainer.innerHTML = `
                <div class="chat-error">
                    <p>❌ Error de conexión al cargar mensajes</p>
                </div>
            `;
        }
    }
}

/**
 * Enviar mensaje de chat
 */
async function sendChatMessage() {
    const chatInput = document.getElementById('chatInput');
    const sendBtn = document.getElementById('chatSendBtn');
    
    if (!chatInput || !currentChatTareaId) return;

    const mensaje = chatInput.value.trim();
    if (!mensaje) return;

    // Deshabilitar input y botón mientras se envía
    chatInput.disabled = true;
    if (sendBtn) sendBtn.disabled = true;

    try {
        const response = await fetch(`${API_BASE}/chat/tarea/${currentChatTareaId}`, {
            method: 'POST',
            headers: getAuthHeaders({
                'Content-Type': 'application/json'
            }),
            body: JSON.stringify({ mensaje })
        });

        const data = await response.json();

        if (response.ok) {
            // Limpiar input
            chatInput.value = '';
            
            // Recargar mensajes para mostrar el nuevo
            await loadChatMessages(currentChatTareaId);
        } else {
            showMessage(`❌ Error: ${data.message || 'Error al enviar mensaje'}`, 'error');
        }
    } catch (error) {
        console.error('Error enviando mensaje:', error);
        showMessage('❌ Error de conexión al enviar mensaje', 'error');
    } finally {
        // Rehabilitar input y botón
        chatInput.disabled = false;
        if (sendBtn) sendBtn.disabled = false;
        chatInput.focus();
    }
}

/**
 * Generar iniciales desde un nombre
 */
function getInitials(nombre) {
    if (!nombre) return '?';
    const partes = nombre.trim().split(' ');
    if (partes.length === 1) {
        return partes[0].substring(0, 2).toUpperCase();
    }
    return (partes[0].charAt(0) + partes[partes.length - 1].charAt(0)).toUpperCase();
}

/**
 * Formatear tiempo del mensaje (tiempo relativo)
 */
function formatMessageTime(dateString) {
    const fecha = new Date(dateString);
    const ahora = new Date();
    const diffMs = ahora - fecha;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    // Si es hoy
    if (diffDays === 0) {
        if (diffMins < 1) return 'Ahora';
        if (diffMins < 60) return `Hace ${diffMins} min`;
        if (diffHours < 24) return `Hace ${diffHours} h`;
    }
    
    // Si es ayer
    if (diffDays === 1) {
        return 'Ayer ' + fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    }
    
    // Si es esta semana
    if (diffDays < 7) {
        const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        return dias[fecha.getDay()] + ' ' + fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    }
    
    // Más de una semana: fecha completa
    return fecha.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Marcar mensaje como leído
 * @param {number} mensajeId - ID del mensaje
 */
async function markMessageAsRead(mensajeId) {
    try {
        await fetch(`${API_BASE}/chat/mensaje/${mensajeId}/leido`, {
            method: 'PUT',
            headers: getAuthHeaders()
        });
    } catch (error) {
        console.error('Error marcando mensaje como leído:', error);
    }
}

/**
 * Marcar todos los mensajes no leídos como leídos
 * @param {Array<number>} mensajeIds - IDs de los mensajes
 * @param {number} tareaId - ID de la tarea
 */
async function markAllMessagesAsRead(mensajeIds, tareaId) {
    try {
        // Marcar todos en paralelo
        await Promise.all(mensajeIds.map(id => markMessageAsRead(id)));
        
        // Actualizar badges inmediatamente
        await loadUnreadMessageCounts();
        
        // Si estamos en la lista de conversaciones, recargarla
        const chatContent = document.getElementById('chatContent');
        if (chatContent && chatContent.style.display !== 'none') {
            loadChatConversations();
        }
    } catch (error) {
        console.error('Error marcando mensajes como leídos:', error);
    }
}

/**
 * Iniciar polling para nuevos mensajes
 * @param {number} tareaId - ID de la tarea
 */
function startChatPolling(tareaId) {
    // Limpiar intervalo anterior si existe
    stopChatPolling();

    // Polling cada 3 segundos
    chatPollingInterval = setInterval(async () => {
        if (chatModalOpen && currentChatTareaId === tareaId) {
            await loadChatMessages(tareaId);
        }
    }, 3000);
}

/**
 * Detener polling de mensajes
 */
function stopChatPolling() {
    if (chatPollingInterval) {
        clearInterval(chatPollingInterval);
        chatPollingInterval = null;
    }
}

/**
 * Scroll al final del chat
 */
function scrollChatToBottom() {
    const messagesContainer = document.getElementById('chatMessages');
    if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}

/**
 * Función helper para escapar HTML
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Cargar contadores de mensajes no leídos para todas las tareas
 */
async function loadUnreadMessageCounts() {
    try {
        if (!currentToken || !currentUser) return;

        const response = await fetch(`${API_BASE}/chat/tareas-con-mensajes`, {
            headers: getAuthHeaders()
        });

        const data = await response.json();

        if (response.ok && data.tareas) {
            let totalUnread = 0;
            
            data.tareas.forEach(tareaInfo => {
                // Actualizar badges en las tareas
                const badge = document.getElementById(`chat-badge-${tareaInfo.tarea_id}`);
                if (badge) {
                    if (tareaInfo.mensajes_no_leidos > 0) {
                        badge.textContent = tareaInfo.mensajes_no_leidos;
                        badge.style.display = 'inline-block';
                    } else {
                        badge.style.display = 'none';
                    }
                }
                
                // Sumar total de no leídos
                totalUnread += tareaInfo.mensajes_no_leidos || 0;
            });

            // Actualizar badge en navegación
            updateChatNavBadge(totalUnread);
        }
    } catch (error) {
        console.error('Error cargando contadores de mensajes:', error);
    }
}

// Variables globales para notificaciones
let notificationPermission = null;
let lastUnreadCount = 0;
let lastMessagesState = {}; // Para detectar mensajes nuevos

// Solicitar permiso de notificaciones al cargar
if ('Notification' in window) {
    if (Notification.permission === 'default') {
        // No solicitar automáticamente, solo cuando el usuario interactúe
    } else {
        notificationPermission = Notification.permission;
    }
}

/**
 * Solicitar permiso de notificaciones
 */
function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
            notificationPermission = permission;
            if (permission === 'granted') {
                showMessage('✅ Notificaciones activadas', 'success');
            }
        });
    }
}

/**
 * Mostrar notificación de nuevo mensaje
 */
function showNewMessageNotification(tareaId, mensaje, remitenteNombre) {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
        return;
    }

    // No mostrar notificación si el chat está abierto para esta tarea
    if (chatModalOpen && currentChatTareaId === tareaId) {
        return;
    }

    const notification = new Notification('💬 Nuevo mensaje', {
        body: `${remitenteNombre}: ${mensaje.substring(0, 50)}${mensaje.length > 50 ? '...' : ''}`,
        icon: '/favicon.ico',
        tag: `chat-${tareaId}`,
        requireInteraction: false
    });

    notification.onclick = () => {
        window.focus();
        if (currentChatTareaId !== tareaId) {
            openChatModal(tareaId);
        }
        notification.close();
    };

    // Cerrar automáticamente después de 5 segundos
    setTimeout(() => notification.close(), 5000);
}

/**
 * Mostrar contenido de la sección de chat
 */
function showChatContent() {
    const chatContent = document.getElementById('chatContent');
    if (!chatContent) return;

    const chatHTML = `
        <div class="chat-section">
            <div class="chat-section-header">
                <h2>💬 Mensajes</h2>
                <div class="chat-header-actions">
                    <button class="btn-secondary btn-sm" onclick="requestNotificationPermission()" title="Activar notificaciones">
                        🔔 Notificaciones
                    </button>
                </div>
            </div>
            <div id="chatConversationsList" class="chat-conversations-list">
                <div class="chat-loading">Cargando conversaciones...</div>
            </div>
        </div>
    `;

    chatContent.innerHTML = chatHTML;
    loadChatConversations();
}

/**
 * Cargar lista de conversaciones
 */
async function loadChatConversations() {
    try {
        const conversationsList = document.getElementById('chatConversationsList');
        if (!conversationsList) return;

        const response = await fetch(`${API_BASE}/chat/tareas-con-mensajes`, {
            headers: getAuthHeaders()
        });

        const data = await response.json();
        
        // Debug
        console.log('🔍 Chat - Respuesta del backend:', {
            ok: response.ok,
            status: response.status,
            tareasCount: data.tareas ? data.tareas.length : 0,
            tareas: data.tareas
        });

        if (response.ok) {
            const tareas = data.tareas || [];
            
            if (tareas.length === 0) {
                conversationsList.innerHTML = `
                    <div class="chat-empty">
                        <p>💬 No tienes conversaciones aún</p>
                        <p style="font-size: 0.9em; color: #94a3b8; margin-top: 10px;">
                            Los mensajes aparecerán aquí cuando empieces a chatear sobre una tarea
                        </p>
                    </div>
                `;
                return;
            }

            let conversationsHTML = '';
            let totalUnread = 0;

            // Ordenar por último mensaje (más reciente primero)
            const sortedTareas = tareas.sort((a, b) => {
                const dateA = new Date(a.ultimo_mensaje_fecha || 0);
                const dateB = new Date(b.ultimo_mensaje_fecha || 0);
                return dateB - dateA;
            });

            sortedTareas.forEach(tareaInfo => {
                totalUnread += tareaInfo.mensajes_no_leidos || 0;
                
                // Formatear fecha del último mensaje (tiempo relativo)
                const fechaUltimo = tareaInfo.ultimo_mensaje_fecha 
                    ? formatMessageTime(tareaInfo.ultimo_mensaje_fecha)
                    : '';

                // Obtener información del otro usuario (compatibilidad con formato antiguo)
                const otroUsuario = tareaInfo.otro_usuario || {
                    nombre: tareaInfo.otro_usuario_nombre || 'Usuario',
                    tipo: tareaInfo.otro_usuario_tipo || 'cliente',
                    foto: null
                };

                // Generar iniciales para el avatar
                const iniciales = getInitials(otroUsuario.nombre);
                const avatarIcon = otroUsuario.tipo === 'cliente' ? '👤' : '👷';
                
                // Avatar con foto o iniciales
                const avatarHTML = otroUsuario.foto 
                    ? `<img src="${otroUsuario.foto}" alt="${otroUsuario.nombre}" class="conversation-avatar-img">`
                    : `<span class="conversation-avatar-initials">${iniciales}</span>`;

                conversationsHTML += `
                    <div class="chat-conversation-item" onclick="openChatModal(${tareaInfo.tarea_id})">
                        <div class="conversation-avatar">
                            ${avatarHTML}
                            ${otroUsuario.tipo === 'tasker' ? '<span class="conversation-avatar-badge">👷</span>' : ''}
                        </div>
                        <div class="conversation-content">
                            <div class="conversation-header">
                                <div class="conversation-name-wrapper">
                                    <span class="conversation-name">${escapeHtml(otroUsuario.nombre)}</span>
                                    ${otroUsuario.telefono ? `<span class="conversation-phone">📞 ${escapeHtml(otroUsuario.telefono)}</span>` : ''}
                                </div>
                                ${fechaUltimo ? `<span class="conversation-time">${fechaUltimo}</span>` : ''}
                            </div>
                            <div class="conversation-preview">
                                <span class="conversation-last-message">${escapeHtml(tareaInfo.ultimo_mensaje || 'Sin mensajes')}</span>
                                ${tareaInfo.mensajes_no_leidos > 0 ? `
                                    <span class="conversation-unread-badge">${tareaInfo.mensajes_no_leidos}</span>
                                ` : ''}
                            </div>
                            <div class="conversation-task-info">
                                <span class="task-preview-text">📋 ${escapeHtml(tareaInfo.tarea_descripcion || 'Tarea')}</span>
                                <span class="task-status-badge task-status-${tareaInfo.estado?.toLowerCase() || 'pendiente'}">${tareaInfo.estado || 'PENDIENTE'}</span>
                            </div>
                        </div>
                    </div>
                `;
            });

            conversationsList.innerHTML = conversationsHTML;

            // Actualizar badge en navegación
            updateChatNavBadge(totalUnread);
        } else {
            conversationsList.innerHTML = `
                <div class="chat-error">
                    <p>❌ Error al cargar conversaciones</p>
                    <p style="font-size: 0.9em; color: #94a3b8;">${data.message || 'Intenta recargar la página'}</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error cargando conversaciones:', error);
        const conversationsList = document.getElementById('chatConversationsList');
        if (conversationsList) {
            conversationsList.innerHTML = `
                <div class="chat-error">
                    <p>❌ Error de conexión</p>
                    <p style="font-size: 0.9em; color: #94a3b8;">No se pudo conectar al servidor</p>
                </div>
            `;
        }
    }
}

/**
 * Actualizar badge de chat en la navegación
 */
function updateChatNavBadge(count) {
    // Badge en bottom nav (móvil)
    const navBadge = document.getElementById('chat-nav-badge');
    if (navBadge) {
        if (count > 0) {
            navBadge.textContent = count > 99 ? '99+' : count;
            navBadge.style.display = 'inline-block';
        } else {
            navBadge.style.display = 'none';
        }
    }
    
    // Badge en header (desktop)
    const headerBadge = document.getElementById('header-chat-badge');
    if (headerBadge) {
        if (count > 0) {
            headerBadge.textContent = count > 99 ? '99+' : count;
            headerBadge.style.display = 'inline-block';
        } else {
            headerBadge.style.display = 'none';
        }
    }
    
    // Badge en menú móvil
    const menuBadge = document.getElementById('mobile-chat-badge');
    if (menuBadge) {
        if (count > 0) {
            menuBadge.textContent = count > 99 ? '99+' : count;
            menuBadge.style.display = 'inline-block';
        } else {
            menuBadge.style.display = 'none';
        }
    }
}

// Cargar contadores de mensajes no leídos periódicamente (cada 10 segundos)
setInterval(() => {
    if (currentUser && currentToken) {
        loadUnreadMessageCounts();
        // Si estamos en la sección de chat, recargar la lista para mantener el historial actualizado
        const chatContent = document.getElementById('chatContent');
        if (chatContent && chatContent.style.display !== 'none' && !chatContent.classList.contains('hidden')) {
            loadChatConversations();
        }
    }
}, 10000);

// Probar conexión al cargar la página
testConnection();
