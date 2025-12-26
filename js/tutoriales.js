// ═══════════════════════════════════════════════════════════
// XVETA Suite - Sistema de Tutoriales
// Gestión de videos, categorías y modal
// ═══════════════════════════════════════════════════════════

class TutorialsManager {
  constructor() {
    this.currentVideo = null;
    this.init();
  }
  
  init() {
    this.setupCategoryFilters();
    this.setupVideoModal();
  }
  
  // ═══════════════════════════════════════════════════════════
  // FILTROS POR CATEGORÍA
  // ═══════════════════════════════════════════════════════════
  
  setupCategoryFilters() {
    const tabs = document.querySelectorAll('.category-tab');
    const videos = document.querySelectorAll('.video-card');
    
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const category = tab.getAttribute('data-category');
        
        // Actualizar tabs activos
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Filtrar videos
        videos.forEach(video => {
          const videoCategories = video.getAttribute('data-category') || '';
          
          if (category === 'todos' || videoCategories.includes(category)) {
            video.style.display = 'block';
            video.style.animation = 'fadeIn 0.5s';
          } else {
            video.style.display = 'none';
          }
        });
      });
    });
  }
  
  // ═══════════════════════════════════════════════════════════
  // MODAL DE VIDEO
  // ═══════════════════════════════════════════════════════════
  
  setupVideoModal() {
    const modal = document.getElementById('videoModal');
    if (!modal) return;
    
    // Cerrar con ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('active')) {
        this.closeVideo();
      }
    });
    
    // Cerrar al hacer clic fuera del contenido
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.closeVideo();
      }
    });
  }
  
  openVideo(videoId, title) {
    const modal = document.getElementById('videoModal');
    const player = document.getElementById('videoPlayer');
    const modalTitle = document.getElementById('modalTitle');
    
    // Mapeo de IDs a rutas de video
    const videoSources = {
      'intro-1': 'videos/01-introduccion.mp4',
      'licencia': 'videos/02-activar-licencia.mp4',
      'ids': 'videos/03-xveta-ids.mp4',
      'optimizador': 'videos/04-optimizador.mp4',
      'tablero': 'videos/05-tablero.mp4',
      'despiece': 'videos/06-despiece.mp4'
    };
    
    const videoPath = videoSources[videoId];
    
    if (!videoPath) {
      showNotification('Video próximamente disponible', 'info');
      return;
    }
    
    // Configurar y mostrar modal
    modalTitle.textContent = title || 'Tutorial';
    player.src = videoPath;
    modal.classList.add('active');
    player.play();
    
    // Deshabilitar scroll del body
    document.body.style.overflow = 'hidden';
    
    this.currentVideo = videoId;
  }
  
  closeVideo() {
    const modal = document.getElementById('videoModal');
    const player = document.getElementById('videoPlayer');
    
    // Pausar y resetear video
    player.pause();
    player.currentTime = 0;
    player.src = '';
    
    // Ocultar modal
    modal.classList.remove('active');
    
    // Restaurar scroll
    document.body.style.overflow = 'auto';
    
    this.currentVideo = null;
  }
}

// ═══════════════════════════════════════════════════════════
// FUNCIONES GLOBALES
// ═══════════════════════════════════════════════════════════

let tutorialsManager;

function openVideo(videoId, title) {
  if (!tutorialsManager) {
    tutorialsManager = new TutorialsManager();
  }
  tutorialsManager.openVideo(videoId, title);
}

function closeVideo() {
  if (tutorialsManager) {
    tutorialsManager.closeVideo();
  }
}

// ═══════════════════════════════════════════════════════════
// INICIALIZAR
// ═══════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  tutorialsManager = new TutorialsManager();
});

// Agregar estilos de animación
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }
`;
document.head.appendChild(style);
