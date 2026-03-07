/**
 * COMODISIMOS - Menú de Procesos
 * Gestión de navegación entre diferentes procesos de inspección
 */

// ============================================================================
// CONFIGURACIÓN
// ============================================================================

const API_URL = 'http://localhost:4000'

// ============================================================================
// UTILIDADES
// ============================================================================

/**
 * Extrae un parámetro de la URL
 * @param {string} parameterName - Nombre del parámetro
 * @returns {string|null} - Valor del parámetro o null
 */
function getUrlParameter(parameterName) {
  return new URLSearchParams(window.location.search).get(parameterName)
}

/**
 * Extrae el primer nombre del usuario para el saludo
 * @param {string} fullName - Nombre completo del usuario
 * @returns {string} - Primer nombre
 */
function extractFirstName(fullName) {
  return (fullName || '').toString().trim().split(' ')[0] || fullName
}

// ============================================================================
// VALIDACIÓN DE INSPECCIÓN
// ============================================================================

const inspectionId = getUrlParameter('inspectionId')

// Validar que se haya proporcionado un ID de inspección
if (!inspectionId) {
  alert('Error: ID de inspección no proporcionado')
  window.location.href = 'index.html';
}

// ============================================================================
// INICIALIZACIÓN DEL MENÚ
// ============================================================================

/**
 * Inicializa el menú de procesos y muestra el saludo del usuario
 */
async function initializeMenu() {
  // Obtener datos del usuario y mostrar saludo
  await displayUserGreeting()

  // Asignar eventos a botones de procesos
  attachProcessButtons()

  // Asignar evento al botón de logout
  attachLogoutButton()
}

/**
 * Obtiene datos del usuario y muestra saludo personalizado
 */
async function displayUserGreeting() {
  try {
    const response = await fetch(API_URL + '/api/auth/me', {
      credentials: 'include'
    });

    if (!response.ok) {
      console.warn('No se pudo obtener datos del usuario')
      return
    }

    const userData = await response.json()
    const userName = userData.user?.name || userData.user?.username || ''
    const firstName = extractFirstName(userName)

    const greetingElement = document.getElementById('greetingMenu');
    if (greetingElement) {
      greetingElement.textContent = `Bienvenido ${firstName}`;
    }
  } catch (error) {
    console.error('Error al obtener datos del usuario:', error);
  }
}

/**
 * Asigna eventos a los botones de procesos
 */
function attachProcessButtons() {
  document.getElementById('btnDiagnostico').addEventListener('click', () => {
    window.location.href = `diagnostic.html?inspectionId=${inspectionId}`;
  });

  document.getElementById('btnMedidas').addEventListener('click', () => {
    window.location.href = `measurements.html?inspectionId=${inspectionId}`;
  });

  document.getElementById('btnIngreso').addEventListener('click', () => {
    window.location.href = `ingreso.html?inspectionId=${inspectionId}`;
  });
}

/**
 * Asigna evento al botón de cerrar sesión
 */
function attachLogoutButton() {
  const logoutButton = document.getElementById('btnLogout');

  logoutButton.addEventListener('click', async () => {
    const confirmLogout = confirm('¿Está seguro de que desea cerrar sesión?');

    if (!confirmLogout) {
      return;
    }

    try {
      const response = await fetch(API_URL + '/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        // Redirigir al inicio después de cerrar sesión
        window.location.href = 'index.html';
      } else {
        alert('Error al cerrar sesión');
      }
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      alert('Error al conectar con el servidor');
    }
  });
}

// ============================================================================
// INICIALIZACIÓN
// ============================================================================

initializeMenu();
