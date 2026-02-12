// ================================================
// SKY X - JavaScript Principal
// ================================================

(function() {
  'use strict';
  
  console.log('SKY X - Inicializando...');

  // ==============================================
  // MODAL
  // ==============================================
  function initModal() {
    const openModalBtns = document.querySelectorAll('.btn-noticia, .btn-sobre');
    const closeModalBtns = document.querySelectorAll('.modal-close');
    
    openModalBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const modalId = btn.getAttribute('data-modal');
        const modal = btn.classList.contains('btn-noticia') 
          ? document.getElementById(`noticiaModal${modalId}`)
          : document.getElementById(`${modalId}Modal`);
        
        if (modal) {
          modal.style.display = 'block';
          document.body.style.overflow = 'hidden';
        }
      });
    });
    
    closeModalBtns.forEach(closeBtn => {
      closeBtn.addEventListener('click', () => {
        const modal = closeBtn.closest('.modal');
        if (modal) {
          modal.style.display = 'none';
          document.body.style.overflow = 'auto';
        }
      });
    });
    
    window.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
        document.body.style.overflow = 'auto';
      }
    });
    
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
          if (modal.style.display === 'block') {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
          }
        });
      }
    });
  }

  // ==============================================
  // CARROSSEL DE BLOG
  // ==============================================
  function initBlogCarousel() {
    const blogContents = document.querySelectorAll('.blog-content');
    const prevBtn = document.querySelector('.carousel-btn-prev');
    const nextBtn = document.querySelector('.carousel-btn-next');
    const indicators = document.querySelectorAll('.indicator');
    const carousel = document.querySelector('.blog-carousel');
    
    if (!blogContents.length) return;
    
    let currentSlide = 0;
    const totalSlides = blogContents.length;
    let touchStartX = 0;
    let touchEndX = 0;
    
    function showSlide(index) {
      blogContents.forEach(content => content.classList.remove('active'));
      indicators.forEach(indicator => indicator.classList.remove('active'));
      
      blogContents[index].classList.add('active');
      if (indicators[index]) indicators[index].classList.add('active');
    }
    
    function nextSlide() {
      currentSlide = (currentSlide + 1) % totalSlides;
      showSlide(currentSlide);
    }
    
    function prevSlide() {
      currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
      showSlide(currentSlide);
    }
    
    // Event listeners para botões (apenas desktop)
    if (prevBtn && nextBtn) {
      nextBtn.addEventListener('click', nextSlide);
      prevBtn.addEventListener('click', prevSlide);
    }
    
    // Indicadores
    indicators.forEach((indicator, index) => {
      indicator.addEventListener('click', () => {
        currentSlide = index;
        showSlide(currentSlide);
      });
    });
    
    // Teclado (apenas desktop)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') prevSlide();
      else if (e.key === 'ArrowRight') nextSlide();
    });
    
    // Suporte a Touch/Swipe para mobile
    if (carousel) {
      carousel.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
      }, { passive: true });
      
      carousel.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
      }, { passive: true });
      
      function handleSwipe() {
        const swipeThreshold = 50; // Mínimo de pixels para considerar swipe
        const diff = touchStartX - touchEndX;
        
        if (Math.abs(diff) > swipeThreshold) {
          if (diff > 0) {
            // Swipe para esquerda - próximo slide
            nextSlide();
          } else {
            // Swipe para direita - slide anterior
            prevSlide();
          }
        }
      }
    }
    
    showSlide(0);
  }

  // ==============================================
  // CARROSSEL DE SERVIÇOS
  // ==============================================
  function initCarousel() {
    const carouselTrack = document.querySelector('.carousel-track');
    const prevBtn = document.querySelector('.carousel-nav-prev');
    const nextBtn = document.querySelector('.carousel-nav-next');
    
    if (carouselTrack && prevBtn && nextBtn) {
      let currentPosition = 0;
      const cardWidth = 320;
      const gap = 32;
      const scrollAmount = cardWidth + gap;
      
      const updatePosition = () => {
        carouselTrack.style.transform = `translateX(-${currentPosition}px)`;
      };
      
      nextBtn.addEventListener('click', () => {
        const maxScroll = carouselTrack.scrollWidth - carouselTrack.parentElement.offsetWidth;
        if (currentPosition < maxScroll - scrollAmount) {
          currentPosition += scrollAmount;
        } else {
          currentPosition = 0;
        }
        updatePosition();
      });
      
      prevBtn.addEventListener('click', () => {
        if (currentPosition > 0) {
          currentPosition -= scrollAmount;
        } else {
          currentPosition = carouselTrack.scrollWidth - carouselTrack.parentElement.offsetWidth;
        }
        updatePosition();
      });
    }
    
    initBlogCarousel();
  }

  // ==============================================
  // NAVEGAÇÃO
  // ==============================================
  function initNavigation() {
    const nav = document.querySelector('.nav');
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav');
    const navLinks = document.querySelectorAll('.nav-list a');
    
    if (menuToggle && navMenu) {
      menuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        menuToggle.classList.toggle('active');
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : 'auto';
      });

      // Fechar menu ao clicar nos links
      navLinks.forEach(link => {
        link.addEventListener('click', () => {
          navMenu.classList.remove('active');
          menuToggle.classList.remove('active');
          document.body.style.overflow = 'auto';
        });
      });

      // Fechar menu ao clicar fora
      document.addEventListener('click', (e) => {
        if (navMenu.classList.contains('active') && 
            !navMenu.contains(e.target) && 
            !menuToggle.contains(e.target)) {
          navMenu.classList.remove('active');
          menuToggle.classList.remove('active');
          document.body.style.overflow = 'auto';
        }
      });
    }
    
    if (nav) {
      let lastScroll = 0;
      window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        if (currentScroll > 100) {
          nav.classList.add('scrolled');
        } else {
          nav.classList.remove('scrolled');
        }
        lastScroll = currentScroll;
      });
    }
  }

  // ==============================================
  // ANIMAÇÕES
  // ==============================================
  function initAnimations() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, observerOptions);
    
    document.querySelectorAll('.fade-in, .slide-up').forEach(el => {
      observer.observe(el);
    });
  }

  // ==============================================
  // BOTÕES
  // ==============================================
  function initButtonEffects() {
    document.querySelectorAll('button, .btn').forEach(btn => {
      btn.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.05)';
      });
      btn.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1)';
      });
    });
  }

  // ==============================================
  // FOOTER
  // ==============================================
  function initFooter() {
    const year = new Date().getFullYear();
    const yearElement = document.querySelector('.footer-year');
    if (yearElement) {
      yearElement.textContent = year;
    }
  }

  // ==============================================
  // EFEITO DE BRILHO DO BOTÃO HERO
  // ==============================================
  function initHeroButtonGlow() {
    const brilho1 = document.querySelector('.brilho1');
    const brilho2 = document.querySelector('.brilho2');
    
    if (!brilho1 || !brilho2) return;
    
    brilho1.addEventListener('mousemove', (e) => {
      const rect = brilho1.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      brilho1.style.setProperty('--mouse-x', `${x}px`);
      brilho1.style.setProperty('--mouse-y', `${y}px`);
      brilho2.style.setProperty('--mouse-x', `${x}px`);
      brilho2.style.setProperty('--mouse-y', `${y}px`);
    });
  }

  // ==============================================
  // INICIALIZAÇÃO
  // ==============================================
  document.addEventListener('DOMContentLoaded', () => {
    try {
      initNavigation();
      console.log('✓ Navigation inicializado');
    } catch (e) { console.error('✗ Navigation:', e); }
    
    try {
      initCarousel();
      console.log('✓ Carousel inicializado');
    } catch (e) { console.error('✗ Carousel:', e); }
    
    try {
      initModal();
      console.log('✓ Modal inicializado');
    } catch (e) { console.error('✗ Modal:', e); }
    
    try {
      initAnimations();
      console.log('✓ Animations inicializado');
    } catch (e) { console.error('✗ Animations:', e); }
    
    try {
      initButtonEffects();
      console.log('✓ Button Effects inicializado');
    } catch (e) { console.error('✗ Button Effects:', e); }
    
    try {
      initFooter();
      console.log('✓ Footer inicializado');
    } catch (e) { console.error('✗ Footer:', e); }
    
    try {
      initHeroButtonGlow();
      console.log('✓ Hero Button Glow inicializado');
    } catch (e) { console.error('✗ Hero Button Glow:', e); }
    
    console.log('✓ SKY X inicializado com sucesso');
  });

})();
