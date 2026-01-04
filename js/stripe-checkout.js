// STRIPE CHECKOUT - XVETA SUITE (Automático con Google Sheets)

document.addEventListener('DOMContentLoaded', function() {

// ⚠️ CONFIGURA AQUÍ TU GOOGLE FORM URL
// Instrucciones: Ver INSTRUCCIONES-CONFIGURACION.txt paso 1-5
const GOOGLE_FORM_URL = 'TU_URL_DE_GOOGLE_FORM_AQUI';

// Link de pago de Stripe
const PAYMENT_LINK = 'https://checkout.link.com/c264a6702036b6feff7f46b6a3987a141aa7f08f/';

const form = document.getElementById('payment-form');
const submitButton = document.getElementById('submit-button');
const errorMessage = document.getElementById('error-message');
const successMessage = document.getElementById('success-message');

// Función para validar email
function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// Función para mostrar error
function showError(message) {
  errorMessage.textContent = message;
  errorMessage.style.display = 'block';
  successMessage.style.display = 'none';
  setTimeout(() => {
    errorMessage.style.display = 'none';
  }, 5000);
}

// Función para mostrar éxito
function showSuccess(message) {
  successMessage.textContent = message;
  successMessage.style.display = 'block';
  errorMessage.style.display = 'none';
}

// Función para enviar datos a Google Sheets
async function enviarAGoogleSheets(machineId, email, userName) {
  try {
    // Crear FormData para enviar a Google Form
    const formData = new FormData();
    formData.append('entry.MACHINE_ID', machineId);  // Se actualizará con IDs reales
    formData.append('entry.EMAIL', email);
    formData.append('entry.NOMBRE', userName);
    formData.append('entry.FECHA', new Date().toISOString());
    
    // Enviar a Google Form (sin esperar respuesta por CORS)
    fetch(GOOGLE_FORM_URL, {
      method: 'POST',
      body: formData,
      mode: 'no-cors'
    });
    
    return true;
  } catch (error) {
    console.warn('Error al enviar a Google Sheets:', error);
    return true; // Continuar de todos modos
  }
}

form.addEventListener('submit', async function(e) {
  e.preventDefault();
  
  // Verificar configuración
  if (GOOGLE_FORM_URL === 'TU_URL_DE_GOOGLE_FORM_AQUI') {
    showError('⚠️ Google Form no configurado. Ver INSTRUCCIONES-CONFIGURACION.txt');
    console.error('ERROR: Configura GOOGLE_FORM_URL en stripe-checkout.js');
    return;
  }
  
  // Ocultar mensajes previos
  errorMessage.style.display = 'none';
  successMessage.style.display = 'none';
  
  // Obtener valores
  const machineId = document.getElementById('machine-id').value.trim();
  const email = document.getElementById('email').value.trim();
  const userName = document.getElementById('user-name').value.trim();
  
  // Validaciones
  if (!machineId) {
    showError('❌ Por favor ingresa tu Machine ID');
    return;
  }
  
  if (!email) {
    showError('❌ Por favor ingresa tu email');
    return;
  }
  
  if (!isValidEmail(email)) {
    showError('❌ Por favor ingresa un email válido');
    return;
  }
  
  if (!userName) {
    showError('❌ Por favor ingresa tu nombre');
    return;
  }
  
  // Deshabilitar botón
  submitButton.disabled = true;
  submitButton.textContent = '⏳ Registrando datos...';
  
  // Guardar en localStorage
  try {
    localStorage.setItem('xveta_machine_id', machineId);
    localStorage.setItem('xveta_email', email);
    localStorage.setItem('xveta_user_name', userName);
    localStorage.setItem('xveta_timestamp', new Date().toISOString());
  } catch (e) {
    console.warn('No se pudo guardar en localStorage:', e);
  }
  
  // Enviar a Google Sheets
  await enviarAGoogleSheets(machineId, email, userName);
  
  // Mostrar mensaje y redirigir
  showSuccess('✓ Datos registrados. Redirigiendo al pago...');
  submitButton.textContent = '🔄 Redirigiendo a pago...';
  
  // Redirigir a Stripe después de 1.5 segundos
  setTimeout(() => {
    window.location.href = PAYMENT_LINK;
  }, 1500);
});

});
