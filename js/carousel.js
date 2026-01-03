// Carrusel de Imágenes - XVETA Suite
document.addEventListener('DOMContentLoaded', function() {
  const slides = document.querySelectorAll('.carousel-slide');
  const prevBtn = document.querySelector('.prev-btn');
  const nextBtn = document.querySelector('.next-btn');
  const pauseBtn = document.querySelector('.pause-btn');
  const indicators = document.querySelectorAll('.indicator');
  
  if (!slides.length) return;
  
  let currentIndex = 0;
  let isPlaying = true;
  let autoplayInterval = null;
  
  // Función para mostrar slide específico
  function showSlide(index) {
    // Asegurar que el índice esté en rango
    if (index < 0) index = slides.length - 1;
    if (index >= slides.length) index = 0;
    
    // Remover active de todos
    slides.forEach(slide => {
      slide.classList.remove('active');
    });
    indicators.forEach(ind => {
      ind.classList.remove('active');
    });
    
    // Agregar active al actual
    slides[index].classList.add('active');
    if (indicators[index]) {
      indicators[index].classList.add('active');
    }
    
    currentIndex = index;
  }
  
  // Función para siguiente slide
  function nextSlide() {
    showSlide(currentIndex + 1);
  }
  
  // Función para slide anterior
  function prevSlide() {
    showSlide(currentIndex - 1);
  }
  
  // Función para detener autoplay
  function stopAutoplay() {
    if (autoplayInterval) {
      clearInterval(autoplayInterval);
      autoplayInterval = null;
    }
  }
  
  // Función para iniciar autoplay
  function startAutoplay() {
    stopAutoplay(); // Limpiar cualquier intervalo anterior
    if (isPlaying) {
      autoplayInterval = setInterval(() => {
        nextSlide();
      }, 4000);
    }
  }
  
  // Event listener para botón siguiente
  if (prevBtn) {
    prevBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      prevSlide();
      // Pausar al usar controles manuales
      isPlaying = false;
      stopAutoplay();
      if (pauseBtn) pauseBtn.textContent = '▶';
    });
  }
  
  // Event listener para botón anterior
  if (nextBtn) {
    nextBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      nextSlide();
      // Pausar al usar controles manuales
      isPlaying = false;
      stopAutoplay();
      if (pauseBtn) pauseBtn.textContent = '▶';
    });
  }
  
  // Event listener para botón de pausa/play
  if (pauseBtn) {
    pauseBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      if (isPlaying) {
        // Pausar
        isPlaying = false;
        stopAutoplay();
        pauseBtn.textContent = '▶';
      } else {
        // Reanudar
        isPlaying = true;
        pauseBtn.textContent = '⏸';
        startAutoplay();
      }
    });
  }
  
  // Event listeners para indicadores
  indicators.forEach((indicator, index) => {
    indicator.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      showSlide(index);
      // Pausar al usar indicadores
      isPlaying = false;
      stopAutoplay();
      if (pauseBtn) pauseBtn.textContent = '▶';
    });
  });
  
  // Inicializar
  showSlide(0);
  startAutoplay();
});
