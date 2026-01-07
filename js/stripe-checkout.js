// XVETA SUITE - CHECKOUT CON GOOGLE FORM
// Envía datos a Google Sheets automáticamente y luego redirige a Stripe

document.addEventListener('DOMContentLoaded', function() {

// URL de Google Form (modo formResponse)
const GOOGLE_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSdaqVqKbpa5iw45V0RL7Yp1KT_ST-NbF3mpGay6TtWh12VpLQ/formResponse';

// Link de pago de Stripe
const PAYMENT_LINK = 'https://buy.stripe.com/test_9B69AVfEE7Ds2xv5asfMA00';

const form = document.getElementById('payment-form');
const submitButton = document.getElementById('submit-button');
const errorMessage = document.getElementById('error-message');
const successMessage = document.getElementById('success-message');

// Validar email
function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// Mostrar error
function showError(message) {
  errorMessage.textContent = message;
  errorMessage.style.display = 'block';
  successMessage.style.display = 'none';
  setTimeout(() => {
    errorMessage.style.display = 'none';
  }, 5000);
}

// Mostrar éxito
function showSuccess(message) {
  successMessage.textContent = message;
  successMessage.style.display = 'block';
  errorMessage.style.display = 'none';
}

// Enviar datos a Google Form
async function enviarAGoogleForm(machineId, email, nombre) {
  try {
    const formData = new FormData();
    formData.append('entry.1204242624', machineId);  // Machine ID
    formData.append('entry.1729565604', email);       // Email
    formData.append('entry.211014766', nombre);       // Nombre
    
    // Usar sendBeacon (más confiable en móviles)
    const blob = new Blob([new URLSearchParams(formData).toString()], {
      type: 'application/x-www-form-urlencoded'
    });
    
    if (navigator.sendBeacon) {
      navigator.sendBeacon(GOOGLE_FORM_URL, blob);
    } else {
      // Fallback para navegadores antiguos
      fetch(GOOGLE_FORM_URL, {
        method: 'POST',
        body: formData,
        mode: 'no-cors'
      });
    }
    
    return true;
  } catch (error) {
    console.warn('Error al enviar a Google Form:', error);
    return true;
  }
}

form.addEventListener('submit', async function(e) {
  e.preventDefault();
  
  // Ocultar mensajes
  errorMessage.style.display = 'none';
  successMessage.style.display = 'none';
  
  // Obtener datos
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
    console.warn('Error guardando en localStorage:', e);
  }
  
  // Enviar a Google Form
  await enviarAGoogleForm(machineId, email, userName);
  
  // Mostrar mensaje y redirigir
  showSuccess('✓ Datos registrados. Redirigiendo al pago...');
  submitButton.textContent = '🔄 Redirigiendo...';
  
  // Redirigir a Stripe (delay mayor para móviles)
  setTimeout(() => {
    window.location.href = PAYMENT_LINK;
  }, 2500);
});

});
