// XVETA SUITE - CHECKOUT SIMPLE
// Versión 1: Solo captura datos y redirige a pago

document.addEventListener('DOMContentLoaded', function() {

// Link de pago de Stripe/Link
const PAYMENT_LINK = 'https://checkout.link.com/c264a6702036b6feff7f46b6a3987a141aa7f08f/';

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

form.addEventListener('submit', function(e) {
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
  
  // Guardar datos en localStorage
  try {
    localStorage.setItem('xveta_machine_id', machineId);
    localStorage.setItem('xveta_email', email);
    localStorage.setItem('xveta_user_name', userName);
    localStorage.setItem('xveta_timestamp', new Date().toISOString());
    
    console.log('✅ Datos guardados:', { machineId, email, userName });
  } catch (e) {
    console.warn('Error guardando en localStorage:', e);
  }
  
  // Mostrar mensaje y redirigir
  showSuccess('✓ Datos guardados. Redirigiendo al pago...');
  submitButton.disabled = true;
  submitButton.textContent = '🔄 Redirigiendo...';
  
  // Redirigir a Stripe
  setTimeout(() => {
    window.location.href = PAYMENT_LINK;
  }, 1500);
});

});
