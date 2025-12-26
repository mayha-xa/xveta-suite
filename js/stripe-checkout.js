// ═══════════════════════════════════════════════════════════
// XVETA Suite - Stripe Checkout
// Integración segura de pagos con Stripe
// ═══════════════════════════════════════════════════════════

// ⚠️ IMPORTANTE: CONFIGURA TU CLAVE PÚBLICA DE STRIPE AQUÍ
const STRIPE_PUBLIC_KEY = 'pk_test_TU_CLAVE_PUBLICA_AQUI'; // Cámbiala por tu clave real

// URL del GitHub Action que generará la licencia
const GITHUB_ACTION_URL = 'https://api.github.com/repos/mayha-xa/xveta-suite/dispatches';

class StripeCheckout {
  constructor() {
    this.stripe = null;
    this.cardElement = null;
    this.init();
  }
  
  async init() {
    try {
      // Inicializar Stripe
      this.stripe = Stripe(STRIPE_PUBLIC_KEY);
      
      // Crear elementos de Stripe
      const elements = this.stripe.elements();
      
      // Estilo personalizado para el elemento de tarjeta
      const style = {
        base: {
          color: '#ffffff',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
          fontSize: '16px',
          '::placeholder': {
            color: '#888888'
          }
        },
        invalid: {
          color: '#ef4444',
          iconColor: '#ef4444'
        }
      };
      
      // Crear elemento de tarjeta
      this.cardElement = elements.create('card', { style });
      this.cardElement.mount('#card-element');
      
      // Manejar errores en tiempo real
      this.cardElement.on('change', (event) => {
        const errorElement = document.getElementById('error-message');
        if (event.error) {
          errorElement.textContent = event.error.message;
          errorElement.style.display = 'block';
        } else {
          errorElement.style.display = 'none';
        }
      });
      
      // Manejar envío del formulario
      this.setupFormSubmit();
      
    } catch (error) {
      console.error('Error inicializando Stripe:', error);
      this.showError('Error al cargar el sistema de pagos. Por favor recarga la página.');
    }
  }
  
  // ═══════════════════════════════════════════════════════════
  // ENVÍO DEL FORMULARIO
  // ═══════════════════════════════════════════════════════════
  
  setupFormSubmit() {
    const form = document.getElementById('payment-form');
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const submitButton = document.getElementById('submit-button');
      const email = document.getElementById('email').value;
      
      // Validar email
      if (!isValidEmail(email)) {
        this.showError('Por favor ingresa un email válido');
        return;
      }
      
      // Deshabilitar botón
      submitButton.disabled = true;
      submitButton.textContent = '⏳ Procesando pago...';
      
      try {
        // Paso 1: Crear Payment Intent en el backend
        const paymentIntent = await this.createPaymentIntent(email);
        
        // Paso 2: Confirmar el pago con Stripe
        const result = await this.stripe.confirmCardPayment(
          paymentIntent.client_secret,
          {
            payment_method: {
              card: this.cardElement,
              billing_details: {
                email: email
              }
            }
          }
        );
        
        if (result.error) {
          // Mostrar error al usuario
          this.showError(result.error.message);
          submitButton.disabled = false;
          submitButton.textContent = '🔒 Pagar $3/mes de forma segura';
        } else {
          // Pago exitoso
          if (result.paymentIntent.status === 'succeeded') {
            await this.handleSuccessfulPayment(email, result.paymentIntent.id);
          }
        }
        
      } catch (error) {
        console.error('Error en el pago:', error);
        this.showError('Error al procesar el pago. Por favor intenta de nuevo.');
        submitButton.disabled = false;
        submitButton.textContent = '🔒 Pagar $3/mes de forma segura';
      }
    });
  }
  
  // ═══════════════════════════════════════════════════════════
  // CREAR PAYMENT INTENT (BACKEND)
  // ═══════════════════════════════════════════════════════════
  
  async createPaymentIntent(email) {
    // ⚠️ IMPORTANTE: Esto debe llamar a tu backend
    // Por ahora uso un endpoint de ejemplo
    
    const response = await fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email,
        amount: 300, // $3.00 en centavos
        currency: 'usd',
        product: 'XVETA-SUITE-MENSUAL'
      })
    });
    
    if (!response.ok) {
      throw new Error('Error al crear el pago');
    }
    
    return await response.json();
  }
  
  // ═══════════════════════════════════════════════════════════
  // PAGO EXITOSO → GENERAR LICENCIA
  // ═══════════════════════════════════════════════════════════
  
  async handleSuccessfulPayment(email, paymentId) {
    try {
      // Disparar GitHub Action para generar licencia
      await this.triggerLicenseGeneration(email, paymentId);
      
      // Mostrar éxito
      this.showSuccess(email);
      
    } catch (error) {
      console.error('Error al generar licencia:', error);
      this.showError('Pago exitoso, pero hubo un error al generar tu licencia. Te contactaremos a ' + email);
    }
  }
  
  // ═══════════════════════════════════════════════════════════
  // DISPARAR GITHUB ACTION
  // ═══════════════════════════════════════════════════════════
  
  async triggerLicenseGeneration(email, paymentId) {
    // ⚠️ IMPORTANTE: Necesitas un GitHub Personal Access Token
    // Este token debe estar en tu backend, NO en el frontend
    
    // Llama a tu backend que tiene el token seguro
    const response = await fetch('/api/generate-license', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email,
        payment_id: paymentId,
        product: 'XVETA-SUITE',
        type: 'mensual'
      })
    });
    
    if (!response.ok) {
      throw new Error('Error al generar licencia');
    }
    
    return await response.json();
  }
  
  // ═══════════════════════════════════════════════════════════
  // UI: MOSTRAR ERRORES Y ÉXITOS
  // ═══════════════════════════════════════════════════════════
  
  showError(message) {
    const errorElement = document.getElementById('error-message');
    errorElement.textContent = '❌ ' + message;
    errorElement.style.display = 'block';
    
    // Ocultar después de 5 segundos
    setTimeout(() => {
      errorElement.style.display = 'none';
    }, 5000);
  }
  
  showSuccess(email) {
    const successElement = document.getElementById('success-message');
    const form = document.getElementById('payment-form');
    
    successElement.innerHTML = `
      <strong>✅ ¡Pago exitoso!</strong><br><br>
      Tu licencia ha sido generada y será enviada a:<br>
      <strong>${email}</strong><br><br>
      Revisa tu correo en los próximos minutos.<br>
      (No olvides revisar spam/correo no deseado)
    `;
    successElement.style.display = 'block';
    
    // Ocultar formulario
    form.style.display = 'none';
    
    // Redireccionar después de 5 segundos
    setTimeout(() => {
      window.location.href = 'descargas.html';
    }, 5000);
  }
}

// ═══════════════════════════════════════════════════════════
// INICIALIZAR
// ═══════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  // Solo inicializar en página de compra
  if (document.getElementById('payment-form')) {
    new StripeCheckout();
  }
});
