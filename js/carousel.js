// Carrusel de Imágenes - XVETA Suite
document.addEventListener('DOMContentLoaded', function() {
  const track = document.querySelector('.carousel-track');
  const slides = document.querySelectorAll('.carousel-slide');
  const prevBtn = document.querySelector('.prev-btn');
  const nextBtn = document.querySelector('.next-btn');
  const pauseBtn = document.querySelector('.pause-btn');
  const indicators = document.querySelectorAll('.indicator');
  
  let currentIndex = 0;
  let isPlaying = true;
  let autoplayInterval;
  
  // Función para mostrar slide
  function showSlide(index) {
    // Remover active de todos
    slides.forEach(slide => slide.classList.remove('active'));
    indicators.forEach(ind => ind.classList.remove('active'));
    
    // Agregar active al actual
    slides[index].classList.add('active');
    indicators[index].classList.add('active');
    currentIndex = index;
  }
  
  // Función para siguiente slide
  function nextSlide() {
    const next = (currentIndex + 1) % slides.length;
    showSlide(next);
  }
  
  // Función para slide anterior
  function prevSlide() {
    const prev = (currentIndex - 1 + slides.length) % slides.length;
    showSlide(prev);
  }
  
  // Autoplay
  function startAutoplay() {
    stopAutoplay(); // Limpiar cualquier intervalo anterior
    if (isPlaying) {
      autoplayInterval = setInterval(nextSlide, 4000);
    }
  }
  
  function stopAutoplay() {
    if (autoplayInterval) {
      clearInterval(autoplayInterval);
    }
  }
  
  // Event listeners para botones
  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.preventDefault();
      nextSlide();
      stopAutoplay();
      isPlaying = false;
      if (pauseBtn) pauseBtn.textContent = '▶';
    });
  }
  
  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.preventDefault();
      prevSlide();
      stopAutoplay();
      isPlaying = false;
      if (pauseBtn) pauseBtn.textContent = '▶';
    });
  }
  
  if (pauseBtn) {
    pauseBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (isPlaying) {
        stopAutoplay();
        isPlaying = false;
        pauseBtn.textContent = '▶';
      } else {
        isPlaying = true;
        pauseBtn.textContent = '⏸';
        startAutoplay();
      }
    });
  }
  
  // Event listeners para indicadores
  indicators.forEach((indicator, index) => {
    indicator.addEventListener('click', (e) => {
      e.preventDefault();
      showSlide(index);
      stopAutoplay();
      isPlaying = false;
      if (pauseBtn) pauseBtn.textContent = '▶';
    });
  });
  
  // Inicializar primer slide
  showSlide(0);
  
  // Iniciar autoplay
  startAutoplay();
});
