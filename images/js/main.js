// ═══════════════════════════════════════════════════════════
// XVETA Suite - JavaScript Principal
// Navegación, scroll suave y utilidades
// ═══════════════════════════════════════════════════════════

class XVETAMain {
  constructor() {
    this.init();
  }
  
  init() {
    this.setupMobileMenu();
    this.setupSmoothScroll();
    this.setupNavbarScroll();
  }
  
  // ═══════════════════════════════════════════════════════════
  // MENÚ MÓVIL
  // ═══════════════════════════════════════════════════════════
  
  setupMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    
    if (!hamburger || !navMenu) return;
    
    hamburger.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      hamburger.classList.toggle('active');
    });
    
    // Cerrar menú al hacer clic en un link
    const navLinks = navMenu.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
      });
    });
    
    // Cerrar menú al hacer clic fuera
    document.addEventListener('click', (e) => {
      if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
      }
    });
  }
  
  // ═══════════════════════════════════════════════════════════
  // SMOOTH SCROLL
  // ═══════════════════════════════════════════════════════════
  
  setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        
        // Solo para anclas válidas
        if (href === '#' || href === '#!') return;
        
        const targetId = href.substring(1);
        const target = document.getElementById(targetId);
        
        if (target) {
          e.preventDefault();
          
          const offsetTop = target.offsetTop - 80; // 80px para navbar
          
          window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
          });
        }
      });
    });
  }
  
  // ═══════════════════════════════════════════════════════════
  // NAVBAR AL HACER SCROLL
  // ═══════════════════════════════════════════════════════════
  
  setupNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
    
    let lastScroll = 0;
    
    window.addEventListener('scroll', () => {
      const currentScroll = window.pageYOffset;
      
      // Agregar sombra al hacer scroll
      if (currentScroll > 50) {
        navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.3)';
      } else {
        navbar.style.boxShadow = 'none';
      }
      
      lastScroll = currentScroll;
    });
  }
}

// ═══════════════════════════════════════════════════════════
// UTILIDADES GLOBALES
// ═══════════════════════════════════════════════════════════

// Función para copiar texto al portapapeles
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    showNotification('Copiado al portapapeles', 'success');
  }).catch(err => {
    console.error('Error al copiar:', err);
    showNotification('Error al copiar', 'error');
  });
}

// Mostrar notificaciones
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 100px;
    right: 20px;
    background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#667eea'};
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 10px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    z-index: 10000;
    animation: slideIn 0.3s ease;
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

// Validar email
function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Formatear fecha
function formatDate(date) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(date).toLocaleDateString('es-ES', options);
}

// ═══════════════════════════════════════════════════════════
// INICIALIZAR
// ═══════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  new XVETAMain();
});

// Agregar estilos de animación
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);
