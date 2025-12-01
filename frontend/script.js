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
        
        // Si es el panel admin, cargar contenido automáticamente
        if (tabName === 'admin' && currentUser && currentUser.tipo === 'admin') {
            setTimeout(() => {
                showAdminContent();
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

    // Cargar contenido dinámico según la pestaña
    if (tabName === 'tasks' && currentUser) {
        showTasksContent();
    } else if (tabName === 'profile' && currentUser) {
        showProfileContent();
    } else if (tabName === 'search' && currentUser) {
        showSearchContent();
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

            // Actualizar botón de disponibilidad si es tasker
            if (currentUser.tipo === 'tasker') {
                updateAvailabilityButton();
            }

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
    let profileBtn = null;
    let searchBtn = null;
    let availabilityBtn = null;
    let adminBtn = null;

    tabBtns.forEach(btn => {
        if (btn.onclick && btn.onclick.toString().includes('logout')) {
            logoutBtn = btn;
        }
        if (btn.onclick && btn.onclick.toString().includes('showTabWithContent(\'tasks\')')) {
            tasksBtn = btn;
        }
        if (btn.onclick && btn.onclick.toString().includes('showTabWithContent(\'profile\')')) {
            profileBtn = btn;
        }
        if (btn.onclick && btn.onclick.toString().includes('showTabWithContent(\'search\')')) {
            searchBtn = btn;
        }
        if (btn.id === 'availabilityBtn' || (btn.onclick && btn.onclick.toString().includes('toggleAvailability'))) {
            availabilityBtn = btn;
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

    // Mostrar pestañas de Perfil y Buscar para todos los usuarios (excepto admin)
    if (currentUser.tipo !== 'admin') {
        if (profileBtn) {
            profileBtn.style.display = 'inline-block';
        }
        if (searchBtn) {
            searchBtn.style.display = 'inline-block';
        }
    }

    // Mostrar botón de disponibilidad solo para taskers
    if (currentUser.tipo === 'tasker' && availabilityBtn) {
        availabilityBtn.style.display = 'inline-block';
        updateAvailabilityButton();
    }
}

// Función para actualizar el texto y estilo del botón de disponibilidad
function updateAvailabilityButton() {
    const availabilityBtn = document.getElementById('availabilityBtn');
    if (!availabilityBtn || !currentUser) return;

    const disponible = currentUser.disponible !== false; // Por defecto true si no está definido
    
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
        if (!currentToken || currentUser.tipo !== 'tasker') {
            showMessage('❌ Solo los taskers pueden cambiar su disponibilidad', 'error');
            return;
        }

        const nuevaDisponibilidad = !(currentUser.disponible !== false);
        
        const response = await fetch(`${API_BASE}/tasker/profile/${currentUser.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentToken}`
            },
            body: JSON.stringify({
                disponible: nuevaDisponibilidad
            })
        });

        const data = await response.json();

        if (response.ok) {
            // Actualizar currentUser
            currentUser.disponible = nuevaDisponibilidad;
            if (data.tasker) {
                currentUser.disponible = data.tasker.disponible;
            }
            
            // Actualizar el botón
            updateAvailabilityButton();
            
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

    // Ocultar botón de disponibilidad directamente por ID
    const availabilityBtn = document.getElementById('availabilityBtn');
    if (availabilityBtn) {
        availabilityBtn.style.display = 'none';
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
    document.getElementById('dashboardContent').innerHTML = '';

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
                            ${estadoTarea === 'PENDIENTE_PAGO' ? `
                                <div class="task-actions" onclick="event.stopPropagation();">
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
            headers: {
                'Authorization': `Bearer ${currentToken}`
            }
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
                            ${estadoTarea === 'ASIGNADA' ? `
                                <div class="task-actions" onclick="event.stopPropagation();">
                                    <button class="start-task-btn" onclick="startTask(${tarea.id})">▶️ Empezar Tarea</button>
                                </div>
                            ` : ''}
                            ${estadoTarea === 'EN_PROCESO' ? `
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
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentToken}`
            }
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
            headers: {
                'Authorization': `Bearer ${currentToken}`
            }
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

// ========== FUNCIONES DE PERFIL ==========

// Función para mostrar el contenido del perfil
function showProfileContent() {
    const profileContent = document.getElementById('profileContent');
    if (!profileContent) return;

    const userType = currentUser.tipo;
    let profileHTML = '';

    if (userType === 'cliente') {
        profileHTML = `
            <div class="profile-container">
                <h2>👤 Mi Perfil</h2>
                <form id="profileForm" class="profile-form">
                    <div class="form-group">
                        <label>Nombre *</label>
                        <input type="text" id="profileNombre" value="${currentUser.nombre || ''}" required>
                    </div>
                    <div class="form-group">
                        <label>Apellido *</label>
                        <input type="text" id="profileApellido" value="${currentUser.apellido || ''}" required>
                    </div>
                    <div class="form-group">
                        <label>Teléfono *</label>
                        <input type="tel" id="profileTelefono" value="${currentUser.telefono || ''}" required>
                    </div>
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" id="profileEmail" value="${currentUser.email || ''}" disabled>
                        <small>El email no se puede modificar</small>
                    </div>
                    <div class="form-group">
                        <label>Ubicación por defecto</label>
                        <input type="text" id="profileUbicacion" value="${currentUser.ubicacion_default || ''}" placeholder="Ej: Av. Corrientes 1234, CABA">
                    </div>
                    <button type="submit" class="btn-primary">💾 Guardar Cambios</button>
                </form>
                <div class="my-ratings-section">
                    <h3>⭐ Mis Calificaciones</h3>
                    <div id="myRatingsContainer"></div>
                </div>
            </div>
        `;
    } else if (userType === 'tasker') {
        // Obtener datos completos del tasker
        loadTaskerProfileForEdit();
        profileHTML = `
            <div class="profile-container">
                <h2>👤 Mi Perfil</h2>
                <form id="profileForm" class="profile-form">
                    <div class="form-row">
                        <div class="form-group half">
                            <label>Nombre *</label>
                            <input type="text" id="profileNombre" value="${currentUser.nombre || ''}" required>
                        </div>
                        <div class="form-group half">
                            <label>Apellido *</label>
                            <input type="text" id="profileApellido" value="${currentUser.apellido || ''}" required>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Teléfono *</label>
                        <input type="tel" id="profileTelefono" value="${currentUser.telefono || ''}" required>
                    </div>
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" id="profileEmail" value="${currentUser.email || ''}" disabled>
                        <small>El email no se puede modificar</small>
                    </div>
                    <div class="form-group">
                        <label>Categoría Principal *</label>
                        <select id="profileCategoria" required>
                            <option value="">Selecciona una categoría</option>
                            <option value="EXPRESS">⚡ Express</option>
                            <option value="OFICIOS">🔧 Oficios</option>
                        </select>
                    </div>
                    <div class="form-group" id="especialidadesGroup" style="display: none;">
                        <label>Especialidades (si aplica)</label>
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
                        <label>Skills / Habilidades (separadas por comas)</label>
                        <input type="text" id="profileSkills" placeholder="Ej: Reparación de grifos, Instalación eléctrica">
                        <small>Lista tus habilidades principales</small>
                    </div>
                    <div class="form-group">
                        <label>Licencias (separadas por comas)</label>
                        <input type="text" id="profileLicencias" placeholder="Ej: Licencia de conducir, Matrícula de gasista">
                        <small>Lista tus licencias y certificaciones</small>
                    </div>
                    <div class="form-group">
                        <label>Descripción Profesional</label>
                        <textarea id="profileDescripcion" rows="4" placeholder="Cuéntanos sobre tu experiencia y especialidades..."></textarea>
                    </div>
                    <div class="form-group">
                        <label>CVU/CBU (para recibir pagos)</label>
                        <input type="text" id="profileCVUCBU" placeholder="0000003100000000000001">
                        <small>Tu CVU o CBU para recibir pagos</small>
                    </div>
                    <div class="form-group">
                        <label>Disponibilidad</label>
                        <label class="checkbox-label">
                            <input type="checkbox" id="profileDisponible" checked>
                            Estoy disponible para trabajar
                        </label>
                    </div>
                    <button type="submit" class="btn-primary">💾 Guardar Cambios</button>
                </form>
                <div class="my-ratings-section">
                    <h3>⭐ Mis Calificaciones</h3>
                    <div id="myRatingsContainer"></div>
                </div>
            </div>
        `;
    }

    profileContent.innerHTML = profileHTML;

    // Cargar datos completos después de renderizar
    setTimeout(() => {
        if (userType === 'tasker') {
            loadTaskerProfileForEdit();
        } else if (userType === 'cliente') {
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
        const response = await fetch(`${API_BASE}/cliente/profile/${currentUser.id}`, {
            headers: {
                'Authorization': `Bearer ${currentToken}`
            }
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
        const response = await fetch(`${API_BASE}/tasker/profile/${currentUser.id}`, {
            headers: {
                'Authorization': `Bearer ${currentToken}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            const tasker = data.tasker;

            // Actualizar currentUser con los datos más recientes
            Object.assign(currentUser, {
                nombre: tasker.nombre,
                apellido: tasker.apellido,
                telefono: tasker.telefono,
                disponible: tasker.disponible
            });

            // Actualizar botón de disponibilidad
            updateAvailabilityButton();

            // Llenar campos básicos del formulario
            if (document.getElementById('profileNombre')) {
                document.getElementById('profileNombre').value = tasker.nombre || '';
            }
            if (document.getElementById('profileApellido')) {
                document.getElementById('profileApellido').value = tasker.apellido || '';
            }
            if (document.getElementById('profileTelefono')) {
                document.getElementById('profileTelefono').value = tasker.telefono || '';
            }

            // Llenar campos específicos del tasker
            if (document.getElementById('profileCategoria')) {
                document.getElementById('profileCategoria').value = tasker.categoria_principal || '';
                // Trigger change para mostrar especialidades si aplica
                document.getElementById('profileCategoria').dispatchEvent(new Event('change'));
            }
            if (document.getElementById('profileSkills')) {
                document.getElementById('profileSkills').value = (tasker.skills || []).join(', ');
            }
            if (document.getElementById('profileLicencias')) {
                document.getElementById('profileLicencias').value = (tasker.licencias || []).join(', ');
            }
            if (document.getElementById('profileDescripcion')) {
                document.getElementById('profileDescripcion').value = tasker.descripcion_profesional || '';
            }
            if (document.getElementById('profileCVUCBU')) {
                document.getElementById('profileCVUCBU').value = tasker.cvu_cbu || '';
            }
            if (document.getElementById('profileDisponible')) {
                document.getElementById('profileDisponible').checked = tasker.disponible !== false;
            }

            // Marcar especialidades seleccionadas
            if (tasker.especialidades && tasker.especialidades.length > 0) {
                tasker.especialidades.forEach(esp => {
                    const checkbox = document.querySelector(`input[value="${esp}"]`);
                    if (checkbox) checkbox.checked = true;
                });
            }
        }
    } catch (error) {
        console.error('Error cargando perfil del tasker:', error);
    }
}

// Función para manejar actualización de perfil
async function handleProfileUpdate(e) {
    e.preventDefault();

    try {
        const userType = currentUser.tipo;
        let updateData = {};

        if (userType === 'cliente') {
            updateData = {
                nombre: document.getElementById('profileNombre').value,
                apellido: document.getElementById('profileApellido').value,
                telefono: document.getElementById('profileTelefono').value,
                ubicacion_default: document.getElementById('profileUbicacion').value || null
            };
        } else if (userType === 'tasker') {
            // Obtener especialidades seleccionadas
            const especialidades = Array.from(document.querySelectorAll('#especialidadesGroup input[type="checkbox"]:checked'))
                .map(cb => cb.value);

            // Obtener skills y licencias (separar por comas)
            const skillsText = document.getElementById('profileSkills').value;
            const licenciasText = document.getElementById('profileLicencias').value;

            updateData = {
                nombre: document.getElementById('profileNombre').value,
                apellido: document.getElementById('profileApellido').value,
                telefono: document.getElementById('profileTelefono').value,
                categoria_principal: document.getElementById('profileCategoria').value || null,
                especialidades: especialidades,
                skills: skillsText ? skillsText.split(',').map(s => s.trim()).filter(s => s) : [],
                licencias: licenciasText ? licenciasText.split(',').map(l => l.trim()).filter(l => l) : [],
                descripcion_profesional: document.getElementById('profileDescripcion').value || null,
                cvu_cbu: document.getElementById('profileCVUCBU').value || null,
                disponible: document.getElementById('profileDisponible').checked
            };
        }

        const endpoint = userType === 'cliente' 
            ? `${API_BASE}/cliente/profile/${currentUser.id}`
            : `${API_BASE}/tasker/profile/${currentUser.id}`;

        const response = await fetch(endpoint, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentToken}`
            },
            body: JSON.stringify(updateData)
        });

        const data = await response.json();

        if (response.ok) {
            showMessage('✅ Perfil actualizado exitosamente', 'success');
            // Actualizar currentUser con los nuevos datos
            if (userType === 'cliente') {
                Object.assign(currentUser, data.cliente);
            } else {
                Object.assign(currentUser, data.tasker);
                // Actualizar botón de disponibilidad si es tasker
                updateAvailabilityButton();
            }
        } else {
            showMessage(`❌ Error: ${data.message || 'Error al actualizar perfil'}`, 'error');
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

    const userType = currentUser.tipo;
    let searchHTML = '';

    if (userType === 'cliente') {
        // Cliente busca taskers
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
    } else if (userType === 'tasker') {
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
            headers: {
                'Authorization': `Bearer ${currentToken}`
            }
        });

        const data = await response.json();
        if (response.ok && data.tasker) {
            const tasker = data.tasker;
            const isCliente = currentUser.tipo === 'cliente';
            
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
                        ${isCliente ? `
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
            if (isCliente) {
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
            headers: {
                'Authorization': `Bearer ${currentToken}`
            }
        });

        const data = await response.json();
        if (response.ok && data.cliente) {
            const cliente = data.cliente;
            const isTasker = currentUser.tipo === 'tasker';
            
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
                        ${isTasker ? `
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
            if (isTasker) {
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
        if (currentUser.tipo === 'tasker' && userType === 'cliente') {
            const response = await fetch(`${API_BASE}/task/my-assigned-tasks`, {
                headers: {
                    'Authorization': `Bearer ${currentToken}`
                }
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
            if (currentUser.tipo === 'cliente' && userType === 'tasker') {
                const response = await fetch(`${API_BASE}/task/my-tasks`, {
                    headers: {
                        'Authorization': `Bearer ${currentToken}`
                    }
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
        const headers = {};
        if (currentToken) {
            headers['Authorization'] = `Bearer ${currentToken}`;
        }

        const response = await fetch(`${API_BASE}/rating/user/${userId}?tipo=${userType}`, {
            headers: headers
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

// Probar conexión al cargar la página
testConnection();
