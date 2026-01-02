// ═══════════════════════════════════════════════════════════
// XVETA Suite - Animaciones de Scroll
// Sistema de animaciones al hacer scroll (AOS)
// ═══════════════════════════════════════════════════════════

class ScrollAnimations {
  constructor() {
    this.elements = [];
    this.init();
  }
  
  init() {
    // Encontrar todos los elementos con data-aos
    this.elements = Array.from(document.querySelectorAll('[data-aos]'));
    
    if (this.elements.length === 0) return;
    
    // Observador de intersección
    this.observer = new IntersectionObserver(
      (entries) => this.handleIntersection(entries),
      {
        root: null,
        threshold: 0.1,
        rootMargin: '0px'
      }
    );
    
    // Observar todos los elementos
    this.elements.forEach(element => {
      this.observer.observe(element);
    });
  }
  
  handleIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Aplicar delay si existe
        const delay = entry.target.getAttribute('data-aos-delay') || 0;
        
        setTimeout(() => {
          entry.target.classList.add('aos-animate');
        }, delay);
        
        // Dejar de observar una vez animado (para mejor performance)
        this.observer.unobserve(entry.target);
      }
    });
  }
}

// Inicializar al cargar la página
document.addEventListener('DOMContentLoaded', () => {
  new ScrollAnimations();
});
