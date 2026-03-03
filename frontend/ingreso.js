/**
 * COMODISIMOS - Formulario de Ingreso
 * Gestión de medidas de ingreso de muebles
 */

// ============================================================================
// CONFIGURACIÓN
// ============================================================================

const API_URL = 'http://localhost:4000';

// ============================================================================
// UTILIDADES
// ============================================================================

/**
 * Extrae un parámetro de la URL
 * @param {string} parameterName - Nombre del parámetro
 * @returns {string|null} - Valor del parámetro o null
 */
function getUrlParameter(parameterName) {
  return new URLSearchParams(window.location.search).get(parameterName);
}

// ============================================================================
// VALIDACIÓN DE SESIÓN E INSPECCIÓN
// ============================================================================

const inspectionId = getUrlParameter('inspectionId');

// Validar que se haya proporcionado un ID de inspección
if (!inspectionId) {
  alert('Error: ID de inspección no proporcionado');
  window.location.href = 'index.html';
}

// ============================================================================
// MANEJADOR DEL FORMULARIO
// ============================================================================

/**
 * Manejador del envío del formulario de ingreso
 */
document.getElementById('saveIngreso').addEventListener('click', async () => {
  // Recopilar datos del formulario
  const ingresoData = {
    length: parseFloat(document.getElementById('iLength').value) || null,
    width: parseFloat(document.getElementById('iWidth').value) || null,
    observations: document.getElementById('iObs').value,
    enters: document.getElementById('iEnters').value === '1'
  };

  try {
    const response = await fetch(
      `${API_URL}/api/ingreso/${inspectionId}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ingresoData),
        credentials: 'include'
      }
    );

    if (!response.ok) {
      const errorMessage = await response.text();
      alert('Error al guardar ingreso: ' + errorMessage);
      return;
    }

    alert('Ingreso guardado exitosamente');
    
    // Volver al menú de procesos
    window.location.href = `menu.html?inspectionId=${inspectionId}`;
  } catch (error) {
    console.error('Error al enviar ingreso:', error);
    alert('Error al conectar con el servidor');
  }
});
