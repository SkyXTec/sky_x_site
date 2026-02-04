// Animações de entrada com Intersection Observer
export function initAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in');
      }
    });
  }, observerOptions);

  // Observar elementos que devem ter animação
  const animatedElements = document.querySelectorAll('.hero-content, .footer-hero-right');
  animatedElements.forEach(el => observer.observe(el));
}
