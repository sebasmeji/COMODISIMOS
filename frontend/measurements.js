/**
 * COMODISIMOS - Formulario de Medidas
 * Gestión de medidas de muebles
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
 * Manejador del envío del formulario de medidas
 */
document.getElementById('saveMeasures').addEventListener('click', async () => {
  // Recopilar datos del formulario
  const measurementsData = {
    length: parseFloat(document.getElementById('mLength').value) || null,
    width: parseFloat(document.getElementById('mWidth').value) || null,
    height: parseFloat(document.getElementById('mHeight').value) || null,
    backrest_height: parseFloat(document.getElementById('mBackrest').value) || null,
    plank_state: document.getElementById('mPlank').value,
    bed_type: document.getElementById('mBedType').value,
    additional_observations: document.getElementById('mObs').value,
    fits_restriction: document.getElementById('mFits').value === '1'
  };

  try {
    const response = await fetch(
      `${API_URL}/api/measurements/${inspectionId}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(measurementsData),
        credentials: 'include'
      }
    );

    if (!response.ok) {
      const errorMessage = await response.text();
      alert('Error al guardar medidas: ' + errorMessage);
      return;
    }

    alert('Medidas guardadas exitosamente');
    
    // Volver al menú de procesos
    window.location.href = `menu.html?inspectionId=${inspectionId}`;
  } catch (error) {
    console.error('Error al enviar medidas:', error);
    alert('Error al conectar con el servidor');
  }
});
