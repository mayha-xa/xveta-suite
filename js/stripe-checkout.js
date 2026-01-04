// STRIPE CHECKOUT - XVETA SUITE (Payment Link)

document.addEventListener('DOMContentLoaded', function() {

const PAYMENT_LINK = 'https://checkout.link.com/c264a6702036b6feff7f46b6a3987a141aa7f08f/';

const form = document.getElementById('payment-form');
const errorMessage = document.getElementById('error-message');

form.addEventListener('submit', function(e) {
  e.preventDefault();
  
  const machineId = document.getElementById('machine-id').value.trim();
  const email = document.getElementById('email').value.trim();
  const userName = document.getElementById('user-name').value.trim();
  
  if (!machineId || !email || !userName) {
    errorMessage.textContent = '❌ Completa todos los campos';
    errorMessage.style.display = 'block';
    return;
  }
  
  localStorage.setItem('xveta_machine_id', machineId);
  localStorage.setItem('xveta_email', email);
  localStorage.setItem('xveta_user_name', userName);
  
  window.location.href = PAYMENT_LINK + '?prefilled_email=' + encodeURIComponent(email);
});

});
