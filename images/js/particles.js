// ═══════════════════════════════════════════════════════════
// XVETA Suite - Partículas de Fondo
// Sistema de partículas animadas con Canvas
// ═══════════════════════════════════════════════════════════

class ParticlesBackground {
  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.particleCount = 80;
    this.connectionDistance = 150;
    
    this.init();
  }
  
  init() {
    // Configurar canvas
    const container = document.getElementById('particles');
    if (!container) return;
    
    container.appendChild(this.canvas);
    this.canvas.style.position = 'absolute';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    
    this.resize();
    this.createParticles();
    this.animate();
    
    // Event listeners
    window.addEventListener('resize', () => this.resize());
  }
  
  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = document.documentElement.scrollHeight;
  }
  
  createParticles() {
    this.particles = [];
    for (let i = 0; i < this.particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 2 + 1
      });
    }
  }
  
  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Actualizar y dibujar partículas
    this.particles.forEach((particle, i) => {
      // Actualizar posición
      particle.x += particle.vx;
      particle.y += particle.vy;
      
      // Rebotar en bordes
      if (particle.x < 0 || particle.x > this.canvas.width) particle.vx *= -1;
      if (particle.y < 0 || particle.y > this.canvas.height) particle.vy *= -1;
      
      // Dibujar partícula
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = 'rgba(102, 126, 234, 0.5)';
      this.ctx.fill();
      
      // Conectar partículas cercanas
      for (let j = i + 1; j < this.particles.length; j++) {
        const dx = this.particles[j].x - particle.x;
        const dy = this.particles[j].y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < this.connectionDistance) {
          this.ctx.beginPath();
          this.ctx.moveTo(particle.x, particle.y);
          this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
          const opacity = (1 - distance / this.connectionDistance) * 0.3;
          this.ctx.strokeStyle = `rgba(102, 126, 234, ${opacity})`;
          this.ctx.lineWidth = 0.5;
          this.ctx.stroke();
        }
      }
    });
    
    requestAnimationFrame(() => this.animate());
  }
}

// Inicializar al cargar la página
document.addEventListener('DOMContentLoaded', () => {
  new ParticlesBackground();
});
