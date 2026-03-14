/**
 * COMODISIMOS - Inspector Panel
 * Gestión de autenticación y formulario preoperacional
 */

// ============================================================================
// CONFIGURACIÓN
// ============================================================================

const API_URL = 'http://localhost:4000';

// ============================================================================
// REFERENCIAS AL DOM
// ============================================================================

const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const showRegisterBtn = document.getElementById('showRegister');
const authSection = document.getElementById('auth');
const flowSection = document.getElementById('flow');
const greetingElement = document.getElementById('greeting');

// ============================================================================
// ESTADO GLOBAL
// ============================================================================

let currentInspectionId = null;

// ============================================================================
// PREOPERACIONAL - PREGUNTAS Y CONFIGURACIÓN
// ============================================================================

/** Preguntas del formulario preoperacional */
const PREOP_QUESTIONS = [
  'Cedula',
  'Placas',
  'Modelo',
  'Funcionamiento del pito',
  'Espejos en buen estado',
  'Documentación al día',
  'luz traceras',
  'Estado de llantas',
  'Fuga de liquidos',
  'Casco de seguridad',
  'Cinturones en buen estado'
];

/** Preguntas que requieren entrada de texto */
const TEXT_INPUT_FIELDS = ['Cedula', 'Placas', 'Modelo'];

// ============================================================================
// VALIDACIONES Y FORMATEO DE ENTRADA
// ============================================================================

/**
 * Valida y formatea entrada de cédula (solo números, máx 10)
 * @param {string} value - Valor ingresado
 * @returns {string} - Valor formateado
 */
function formatCedula(value) {
  return value.replace(/[^0-9]/g, '').slice(0, 10);
}

/**
 * Valida y formatea entrada de placas (alpanuméricos, máx 6, mayúsculas)
 * @param {string} value - Valor ingresado
 * @returns {string} - Valor formateado
 */
function formatPlacas(value) {
  return value.replace(/[^0-9A-Za-z]/g, '').toUpperCase().slice(0, 6);
}

/**
 * Valida y formatea entrada de modelo (solo números, máx 4)
 * @param {string} value - Valor ingresado
 * @returns {string} - Valor formateado
 */
function formatModelo(value) {
  return value.replace(/[^0-9]/g, '').slice(0, 4);
}

// ============================================================================
// AUTENTICACIÓN
// ============================================================================

/**
 * Verifica si el usuario tiene sesión activa
 * Si existe sesión, muestra la interfaz de inspección
 */
async function checkUserSession() {
  try {
    const response = await fetch(API_URL + '/api/auth/me', { 
      credentials: 'include' 
    });

    if (!response.ok) {
      return; // Sin sesión activa
    }

    const userData = await response.json();
    displayGreeting(userData.user);

    // Mostrar formulario de inspección
    authSection.classList.add('hidden');
    flowSection.classList.remove('hidden');
    initializePreopForm();
  } catch (error) {
    console.error('Error al verificar sesión:', error);
  }
}

/**
 * Extrae el primer nombre del usuario para el saludo
 * @param {string} fullName - Nombre completo del usuario
 * @returns {string} - Primer nombre
 */
function extractFirstName(fullName) {
  return (fullName || '').toString().trim().split(' ')[0] || fullName;
}

/**
 * Muestra saludo personalizado al usuario
 * @param {Object} user - Datos del usuario
 */
function displayGreeting(user) {
  const userName = user?.name || user?.username || '';
  const firstName = extractFirstName(userName);

  if (greetingElement) {
    greetingElement.textContent = `Bienvenido ${firstName}`;
    greetingElement.classList.remove('hidden');
  }
}

/**
 * Manejador del formulario de login
 */
loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const formData = Object.fromEntries(new FormData(loginForm).entries());

  try {
    const loginResponse = await fetch(API_URL + '/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
      credentials: 'include'
    });

    if (!loginResponse.ok) {
      const errorMessage = await loginResponse.text();
      alert('Error de login: ' + errorMessage);
      return;
    }

    // Obtener datos del usuario después del login
    const userResponse = await fetch(API_URL + '/api/auth/me', { 
      credentials: 'include' 
    });

    if (userResponse.ok) {
      const userData = await userResponse.json();
      let userName = userData.user?.name || '';

      // Si no tiene nombre, pedirlo al usuario
      if (!userName) {
        userName = window.prompt('Por favor ingresa tu nombre completo (ej: Sebastian Mejia):');

        if (userName && userName.trim()) {
          await fetch(API_URL + '/api/auth/me', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: userName.trim() }),
            credentials: 'include'
          });
        }
      }

      displayGreeting({ name: userName, username: userData.user?.username });
    }

    // Mostrar interfaz de inspección
    authSection.classList.add('hidden');
    flowSection.classList.remove('hidden');
    initializePreopForm();
  } catch (error) {
    console.error('Error en login:', error);
    alert('Error al conectar con el servidor');
  }
});

/**
 * Manejador del formulario de registro
 */
registerForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const formData = Object.fromEntries(new FormData(registerForm).entries());

  try {
    const registerResponse = await fetch(API_URL + '/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
      credentials: 'include'
    });

    if (!registerResponse.ok) {
      const errorMessage = await registerResponse.text();
      alert('Error al registrar: ' + errorMessage);
      return;
    }

    // Obtener datos del usuario registrado
    const userResponse = await fetch(API_URL + '/api/auth/me', { 
      credentials: 'include' 
    });

    if (userResponse.ok) {
      const userData = await userResponse.json();
      displayGreeting(userData.user);
    }

    // Mostrar interfaz de inspección
    authSection.classList.add('hidden');
    flowSection.classList.remove('hidden');
    initializePreopForm();
  } catch (error) {
    console.error('Error en registro:', error);
    alert('Error al conectar con el servidor');
  }
});

/**
 * Alterna visibilidad del formulario de registro
 */
showRegisterBtn.addEventListener('click', () => {
  registerForm.classList.toggle('hidden');
});

// ============================================================================
// RECUPERACIÓN DE CONTRASEÑA
// ============================================================================

const showForgotPasswordBtn = document.getElementById('showForgotPassword');
const forgotPasswordForm = document.getElementById('forgotPasswordForm');

/**
 * Alterna visibilidad del formulario de recuperación de contraseña
 */
showForgotPasswordBtn.addEventListener('click', () => {
  forgotPasswordForm.classList.toggle('hidden');
});

/**
 * Manejador del formulario de recuperación de contraseña
 */
forgotPasswordForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const formData = Object.fromEntries(new FormData(forgotPasswordForm).entries());

  try {
    const forgotResponse = await fetch(API_URL + '/api/auth/forgot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
      credentials: 'include'
    });

    if (!forgotResponse.ok) {
      const errorMessage = await forgotResponse.text();
      alert('Error al procesar solicitud: ' + errorMessage);
      return;
    }

    const responseData = await forgotResponse.json();

    // Mostrar token para copiar (en desarrollo)
    alert(`Token de recuperación generado. En producción, esto se enviaría por correo.\n\nToken: ${responseData.token}`);

    // Limpiar formulario y ocultarlo
    forgotPasswordForm.reset();
    forgotPasswordForm.classList.add('hidden');
  } catch (error) {
    console.error('Error en recuperación de contraseña:', error);
    alert('Error al conectar con el servidor');
  }
});

// ============================================================================
// FORMULARIO PREOPERACIONAL
// ============================================================================

/**
 * Inicializa y renderiza el formulario preoperacional
 */
function initializePreopForm() {
  const container = document.getElementById('preopQuestions');
  container.innerHTML = '';

  PREOP_QUESTIONS.forEach((question, index) => {
    const questionElement = document.createElement('div');
    questionElement.className = 'question';

    if (TEXT_INPUT_FIELDS.includes(question)) {
      createTextInputField(questionElement, question, index);
    } else {
      createSelectField(questionElement, question, index);
    }

    container.appendChild(questionElement);
  });

  document.getElementById('processSelection').classList.add('hidden');
  document.getElementById('savePreop').addEventListener('click', savePreopForm);
}

/**
 * Crea un campo de entrada de texto con validación
 * @param {HTMLElement} container - Elemento contenedor
 * @param {string} fieldName - Nombre del campo
 * @param {string} fieldIndex - Índice del campo
 */
function createTextInputField(container, fieldName, fieldIndex) {
  const inputElement = document.createElement('input');
  inputElement.type = 'text';
  inputElement.dataset.key = `q${fieldIndex}`;
  inputElement.placeholder = `Ingrese ${fieldName.toLowerCase()}`;
  inputElement.maxLength = '10';

  // Aplicar validación según el tipo de campo
  inputElement.addEventListener('input', (event) => {
    if (fieldName === 'Cedula') {
      event.target.value = formatCedula(event.target.value);
    } else if (fieldName === 'Placas') {
      event.target.value = formatPlacas(event.target.value);
    } else if (fieldName === 'Modelo') {
      event.target.value = formatModelo(event.target.value);
    }
  });

  container.innerHTML = `<span>${fieldName}</span>`;
  container.appendChild(inputElement);
}

/**
 * Crea un campo selector SÍ/NO
 * @param {HTMLElement} container - Elemento contenedor
 * @param {string} fieldName - Nombre del campo
 * @param {string} fieldIndex - Índice del campo
 */
function createSelectField(container, fieldName, fieldIndex) {
  const selectElement = document.createElement('select');
  selectElement.dataset.key = `q${fieldIndex}`;

  const optionYes = document.createElement('option');
  optionYes.value = 'SI';
  optionYes.textContent = 'SI';

  const optionNo = document.createElement('option');
  optionNo.value = 'NO';
  optionNo.textContent = 'NO';

  selectElement.appendChild(optionYes);
  selectElement.appendChild(optionNo);

  container.innerHTML = `<span>${fieldName}</span>`;
  container.appendChild(selectElement);
}

/**
 * Guarda el formulario preoperacional y navega al menú de procesos
 */
async function savePreopForm() {
  const vehicleType = document.getElementById('vehicleType').value;
  
  // Recopilar respuestas de todos los campos
  const selectElements = document.querySelectorAll('#preopQuestions select');
  const inputElements = document.querySelectorAll('#preopQuestions input');
  const answers = {};

  selectElements.forEach(select => {
    answers[select.dataset.key] = select.value;
  });

  inputElements.forEach(input => {
    answers[input.dataset.key] = input.value;
  });

  try {
    const response = await fetch(API_URL + '/api/preoperacional', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vehicle_type: vehicleType, answers }),
      credentials: 'include'
    });

    if (!response.ok) {
      alert('Error guardando preoperacional');
      return;
    }

    const responseData = await response.json();
    currentInspectionId = responseData.inspectionId;

    // Navegar al menú de procesos
    window.location.href = `menu.html?inspectionId=${currentInspectionId}`;
  } catch (error) {
    console.error('Error al guardar preoperacional:', error);
    alert('Error al conectar con el servidor');
  }
}

/**
 * Manejador de botones de proceso (navegación hacia formularios específicos)
 */
function attachProcessButtons() {
  document.querySelectorAll('#processSelection button').forEach(button => {
    button.addEventListener('click', async () => {
      const processType = button.dataset.process;

      try {
        const response = await fetch(API_URL + '/api/process', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            inspectionId: currentInspectionId,
            process: processType
          }),
          credentials: 'include'
        });

        if (!response.ok) {
          alert('Error al seleccionar proceso');
          return;
        }

        // Mapear tipo de proceso a página correspondiente
        const processPageMap = {
          diagnostico: 'diagnostic.html',
          toma_medidas: 'measurements.html',
          toma_ingreso: 'ingreso.html'
        };

        const targetPage = processPageMap[processType] || 'index.html';

        // Navegar a la página del proceso
        window.location.href = `${targetPage}?inspectionId=${currentInspectionId}`;
      } catch (error) {
        console.error('Error al seleccionar proceso:', error);
        alert('Error al conectar con el servidor');
      }
    });
  });
}

// ============================================================================
// INICIALIZACIÓN
// ============================================================================

// Verificar sesión al cargar la página
checkUserSession();
