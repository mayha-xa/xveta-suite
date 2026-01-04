// ════════════════════════════════════════════════════════════════════
// STRIPE CHECKOUT - XVETA SUITE
// ════════════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', function() {

// Inicializar Stripe con tu clave pública de TEST
const stripe = Stripe('pk_test_51SlsM1Rt1ZKQZLINocKlKSrLqBrxWz579xVnNw8Vmr71WpU7X1sRwR3IOoJvmMRAZnekPmsa9WbqMYLZL2Huv4C000sC50goR6');

// Crear elementos de Stripe
const elements = stripe.elements();
const cardElement = elements.create('card', {
  style: {
    base: {
      color: '#e5e7eb',
      fontFamily: '"Segoe UI", sans-serif',
      fontSize: '16px',
      '::placeholder': {
        color: '#6b7280'
      }
    },
    invalid: {
      color: '#ef4444'
    }
  }
});

// Montar el elemento en el DOM
cardElement.mount('#card-element');

// Price ID del producto (suscripción mensual de $1 USD)
const PRICE_ID = 'price_1SlshtRt1ZKQZLINX5O3vymp';

// Elementos del formulario
const form = document.getElementById('payment-form');
const submitButton = document.getElementById('submit-button');
const errorMessage = document.getElementById('error-message');
const successMessage = document.getElementById('success-message');

// ════════════════════════════════════════════════════════════════════
// MANEJO DEL FORMULARIO
// ════════════════════════════════════════════════════════════════════

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  // Deshabilitar botón para evitar doble clic
  submitButton.disabled = true;
  submitButton.textContent = '⏳ Procesando pago...';
  
  // Limpiar mensajes previos
  errorMessage.style.display = 'none';
  successMessage.style.display = 'none';
  
  try {
    // Obtener datos del formulario
    const machineId = document.getElementById('machine-id').value.trim();
    const email = document.getElementById('email').value.trim();
    const userName = document.getElementById('user-name').value.trim();
    
    // Validar campos
    if (!machineId || !email || !userName) {
      throw new Error('Por favor completa todos los campos obligatorios');
    }
    
    // Crear Checkout Session en Stripe
    const { error } = await stripe.redirectToCheckout({
      lineItems: [{
        price: PRICE_ID,
        quantity: 1,
      }],
      mode: 'subscription',
      successUrl: window.location.origin + '/xveta-suite/success.html?session_id={CHECKOUT_SESSION_ID}&machine_id=' + encodeURIComponent(machineId) + '&email=' + encodeURIComponent(email) + '&name=' + encodeURIComponent(userName),
      cancelUrl: window.location.origin + '/xveta-suite/comprar.html?canceled=true',
      customerEmail: email,
      clientReferenceId: machineId, // Guardamos el Machine ID aquí
      metadata: {
        machine_id: machineId,
        user_name: userName
      }
    });
    
    // Si hay error, mostrarlo
    if (error) {
      throw new Error(error.message);
    }
    
  } catch (error) {
    // Mostrar error
    errorMessage.textContent = '❌ ' + error.message;
    errorMessage.style.display = 'block';
    
    // Rehabilitar botón
    submitButton.disabled = false;
    submitButton.textContent = '🔒 Pagar $1 USD/mes de forma segura';
    
    console.error('Error:', error);
  }
});

// ════════════════════════════════════════════════════════════════════
// DETECCIÓN DE CANCELACIÓN
// ════════════════════════════════════════════════════════════════════

// Si el usuario regresó porque canceló el pago
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('canceled') === 'true') {
  errorMessage.textContent = 'ℹ️ Pago cancelado. Puedes intentar nuevamente cuando estés listo.';
  errorMessage.style.display = 'block';
  errorMessage.style.background = 'rgba(249, 115, 22, 0.1)';
  errorMessage.style.borderColor = '#f97316';
  errorMessage.style.color = '#f97316';
}
-e 
}); // Fin DOMContentLoaded
