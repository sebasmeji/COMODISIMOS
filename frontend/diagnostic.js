/**
 * COMODISIMOS - Formulario de Diagnóstico
 * Gestión de datos de diagnóstico de muebles
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
 * Manejador del envío del formulario de diagnóstico
 */
document.getElementById('saveDiag').addEventListener('click', async () => {
  // Recopilar datos del formulario
  const diagnosticData = {
    hygiene_state: document.getElementById('hygiene').value,
    base_type: document.getElementById('baseType').value,
    preserves_original_plastic: document.getElementById('preserve').checked,
    surface_uniform: document.getElementById('surfaceUniform').checked,
    observations: document.getElementById('diagObs').value
  };

  try {
    const response = await fetch(
      `${API_URL}/api/diagnostic/${inspectionId}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(diagnosticData),
        credentials: 'include'
      }
    );

    if (!response.ok) {
      const errorMessage = await response.text();
      alert('Error al guardar diagnóstico: ' + errorMessage);
      return;
    }

    alert('Diagnóstico guardado exitosamente');
    
    // Volver al menú de procesos
    window.location.href = `menu.html?inspectionId=${inspectionId}`;
  } catch (error) {
    console.error('Error al enviar diagnóstico:', error);
    alert('Error al conectar con el servidor');
  }
});
