// Carrusel de Imágenes - XVETA Suite
document.addEventListener('DOMContentLoaded', function() {
  const track = document.querySelector('.carousel-track');
  const slides = document.querySelectorAll('.carousel-slide');
  const prevBtn = document.querySelector('.prev-btn');
  const nextBtn = document.querySelector('.next-btn');
  const pauseBtn = document.querySelector('.pause-btn');
  const indicators = document.querySelectorAll('.indicator');
  const carouselContainer = document.querySelector('.carousel-container');
  
  let currentIndex = 0;
  let isPlaying = true;
  let autoplayInterval;
  
  // Función para mostrar slide
  function showSlide(index) {
    slides.forEach(slide => slide.classList.remove('active'));
    indicators.forEach(ind => ind.classList.remove('active'));
    
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
    if (isPlaying) {
      autoplayInterval = setInterval(nextSlide, 4000); // Cada 4 segundos
    }
  }
  
  function stopAutoplay() {
    clearInterval(autoplayInterval);
  }
  
  // Event listeners para botones
  nextBtn.addEventListener('click', () => {
    nextSlide();
    stopAutoplay();
    isPlaying = false;
    pauseBtn.textContent = '▶';
  });
  
  prevBtn.addEventListener('click', () => {
    prevSlide();
    stopAutoplay();
    isPlaying = false;
    pauseBtn.textContent = '▶';
  });
  
  pauseBtn.addEventListener('click', () => {
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
  
  // Event listeners para indicadores
  indicators.forEach((indicator, index) => {
    indicator.addEventListener('click', () => {
      showSlide(index);
      stopAutoplay();
      isPlaying = false;
      pauseBtn.textContent = '▶';
    });
  });
  
  // Mostrar controles solo cuando el cursor está sobre el carrusel
  carouselContainer.addEventListener('mouseenter', () => {
    document.querySelector('.carousel-controls').classList.add('show');
  });
  
  carouselContainer.addEventListener('mouseleave', () => {
    document.querySelector('.carousel-controls').classList.remove('show');
  });
  
  // Iniciar autoplay
  startAutoplay();
});
