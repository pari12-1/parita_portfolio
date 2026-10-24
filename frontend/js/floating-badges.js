// 3D Parallax & Magnetic Interactions for Floating Badges & AI Neural Core
document.addEventListener('DOMContentLoaded', () => {
  const heroSection = document.querySelector('.hero-section');
  const badges = document.querySelectorAll('.floating-badge');
  const coreSphere = document.querySelector('.neural-core-sphere');

  if (!heroSection || badges.length === 0) return;

  // Track mouse coordinates over hero section
  let mouseX = 0;
  let mouseY = 0;
  let currentX = 0;
  let currentY = 0;

  heroSection.addEventListener('mousemove', (e) => {
    const rect = heroSection.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    mouseX = x / (rect.width / 2);
    mouseY = y / (rect.height / 2);
  });

  heroSection.addEventListener('mouseleave', () => {
    mouseX = 0;
    mouseY = 0;
  });

  // Smooth lerp loop for 3D depth parallax
  function updateParallax() {
    currentX += (mouseX - currentX) * 0.05;
    currentY += (mouseY - currentY) * 0.05;

    // Shift AI Neural Core in 3D
    if (coreSphere) {
      coreSphere.style.transform = `translateX(${currentX * 18}px) translateY(${currentY * 12}px) rotateY(${currentX * 15}deg) rotateX(${-currentY * 15}deg)`;
    }

    // Parallax badges with varying depth factors
    badges.forEach((badge, index) => {
      const depth = (index % 4 + 1) * 14;
      const rotFactor = (index % 2 === 0 ? 1 : -1) * 9;
      const offsetX = currentX * depth;
      const offsetY = currentY * depth;
      const rotX = -currentY * rotFactor;
      const rotY = currentX * rotFactor;

      // Only apply if not actively being hovered
      if (!badge.matches(':hover')) {
        badge.style.transform = `translate3d(${offsetX}px, ${offsetY}px, 0) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
      }
    });

    requestAnimationFrame(updateParallax);
  }

  updateParallax();

  // Interactive badge click: filter projects or jump to section
  badges.forEach(badge => {
    badge.addEventListener('click', () => {
      const toolName = badge.getAttribute('data-tool');
      if (!toolName) return;

      // Play sci-fi interaction blip
      if (window.playSfx) window.playSfx('badge');

      // Flash neon notification
      badge.style.borderColor = '#00f0ff';
      badge.style.boxShadow = '0 0 40px #00f0ff';

      // Auto-filter or jump to project
      const filterBtn = document.querySelector(`.filter-btn[data-filter="${toolName.toLowerCase()}"]`);
      if (filterBtn) {
        filterBtn.click();
        const projectsSec = document.getElementById('projects');
        if (projectsSec) {
          projectsSec.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        const stackSec = document.getElementById('stack');
        if (stackSec) {
          stackSec.scrollIntoView({ behavior: 'smooth' });
        }
      }

      setTimeout(() => {
        badge.style.borderColor = '';
        badge.style.boxShadow = '';
      }, 1200);
    });
  });
});
