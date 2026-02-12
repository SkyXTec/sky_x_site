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

      // Fechar menu ao clicar nos links e Scroll Suave
      navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
          // Fechar menu mobile
          navMenu.classList.remove('active');
          menuToggle.classList.remove('active');
          document.body.style.overflow = 'auto';

          // Scroll Suave (GSAP)
          const href = link.getAttribute('href');
          if (href && href.startsWith('#')) {
            e.preventDefault();
            const targetId = href.substring(1);
            
            // Se for apenas "#", rola para o topo
            if (targetId === "" || targetId === "top") {
              if (typeof gsap !== 'undefined') {
                gsap.to(window, { duration: 1.2, scrollTo: 0, ease: "power3.inOut" });
              } else {
                 window.scrollTo({ top: 0, behavior: 'smooth' });
              }
              return;
            }

            const targetElement = document.getElementById(targetId);

            if (targetElement) {
              if (typeof gsap !== 'undefined') {
                gsap.to(window, {
                  duration: 1.5,
                  scrollTo: {
                    y: targetElement,
                    offsetY: 80 // Compensar header fixo
                  },
                  ease: "power4.inOut" // Efeito ultra suave "Cinematic"
                });
              } else {
                // Fallback original
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
  
                window.scrollTo({
                  top: offsetPosition,
                  behavior: 'smooth'
                });
              }
            }
          }
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
  // ANIMAÇÕES GSAP (Background Gradient)
  // ==============================================
  function initBackgroundAnimation() {
    if (typeof gsap === 'undefined') return;

    const curvedEdge = document.querySelector('.curved-edge');
    if (!curvedEdge) return;

    // Animação orgânica dos gradients
    // Movemos as posições X e Y das variáveis CSS definidas no base.css
    
    // Gradient 1 (Topo Direita)
    gsap.to(curvedEdge, {
      "--g1-x": "95%",
      "--g1-y": "-70%",
      duration: 8,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1
    });

    // Gradients Centrais (Azuis)
    gsap.to(curvedEdge, {
      "--g4-x": "55%", 
      "--g4-y": "35%",
      "--g5-x": "45%",
      "--g5-y": "45%",
      duration: 10,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1
    });

    // Gradients Laterais
    gsap.to(curvedEdge, {
      "--g6-x": "25%",
      "--g6-y": "45%",
      "--g7-x": "75%",
      "--g7-y": "55%",
      duration: 12,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
      delay: 1
    });
    
    // Gradient 3 (Topo Esquerda)
    gsap.to(curvedEdge, {
      "--g3-x": "25%",
      "--g3-y": "5%",
      duration: 9,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
      delay: 2
    });
  }

  // ==============================================
  // ANIMAÇÕES GSAP (Scroll & Hero)
  // ==============================================
  function initGSAPAnimations() {
    if (typeof gsap === 'undefined') {
      console.warn('GSAP não encontrado. As animações não funcionarão.');
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    // Configuração global para suavidade
    const animConfig = {
      duration: 1,
      ease: "power3.out"
    };

    // 1. Animações Genéricas (Fade Up)
    // Seleciona elementos individuais que não fazem parte de grupos de stagger
    const fadeUpElements = gsap.utils.toArray('.scroll-fade-up:not(.no-gsap)');
    fadeUpElements.forEach(el => {
      gsap.fromTo(el, 
        { y: 60, opacity: 0, visibility: 'hidden' },
        {
          y: 0,
          opacity: 1,
          visibility: 'visible',
          duration: animConfig.duration,
          ease: animConfig.ease,
          scrollTrigger: {
            trigger: el,
            start: "top 85%", // Inicia quando o topo do elemento atinge 85% da altura da tela
            toggleActions: "play none none reverse" // Toca na entrada, reverte na saída (subindo)
          }
        }
      );
    });

    // 2. Animações Genéricas (Fade Down)
    gsap.utils.toArray('.scroll-fade-down').forEach(el => {
      gsap.fromTo(el,
        { y: -60, opacity: 0, visibility: 'hidden' },
        {
          y: 0,
          opacity: 1,
          visibility: 'visible',
          duration: animConfig.duration,
          ease: animConfig.ease,
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            toggleActions: "play none none reverse"
          }
        }
      );
    });

    // 3. Animações Genéricas (Fade In)
    gsap.utils.toArray('.scroll-fade-in').forEach(el => {
      gsap.fromTo(el,
        { opacity: 0, visibility: 'hidden' },
        {
          opacity: 1,
          visibility: 'visible',
          duration: 1.5,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top 90%",
            toggleActions: "play none none reverse"
          }
        }
      );
    });

    // 4. Stagger para Cards (Parceiros, Contato, Projetos)
    // Função helper para criar staggers
    const createStagger = (selector, triggerSelector) => {
      const elements = gsap.utils.toArray(selector);
      if (elements.length > 0) {
        gsap.fromTo(elements,
          { y: 50, opacity: 0, scale: 0.9, visibility: 'hidden' },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            visibility: 'visible',
            duration: 0.8,
            stagger: 0.2, // Delay de 0.2s entre cada card
            ease: "back.out(1.2)", // Efeito de "pop" suave
            scrollTrigger: {
              trigger: triggerSelector || elements[0], // Dispara quando o primeiro elemento ou container aparecer
              start: "top 85%",
              toggleActions: "play none none reverse"
            }
          }
        );
      }
    };

    // Aplica os staggers nos grupos específicos
    createStagger('.parceiro-card', '#parceiro-cards');
    createStagger('.contato-card', '.contato-cards');
    
    // Animação Especial para Projetos (Premium)
    const projetos = gsap.utils.toArray('.projeto-card');
    if (projetos.length > 0) {
      gsap.fromTo(projetos, 
        { 
          y: 100, 
          opacity: 0, 
          scale: 0.8,
          filter: "blur(10px)",
          visibility: 'hidden'
        },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          filter: "blur(0px)",
          visibility: 'visible',
          duration: 1.2,
          stagger: 0.3,
          ease: "power4.out", // Desaceleração muito suave
          scrollTrigger: {
            trigger: '.projetos-grid',
            start: "top 80%",
            toggleActions: "play none none reverse"
          },
          onComplete: () => {
            // Ativa os listeners de hover apenas após a entrada inicial
            // Isso evita bugs visuais durante o scroll
          }
        }
      );

      // Hover Effects via GSAP (para manter fluidez)
      projetos.forEach(card => {
        card.addEventListener('mouseenter', () => {
          gsap.to(card, { 
            y: -10, 
            scale: 1.02, 
            duration: 0.4, 
            ease: "power2.out",
            overwrite: "auto"
          });
        });
        
        card.addEventListener('mouseleave', () => {
          gsap.to(card, { 
            y: 0, 
            scale: 1, 
            duration: 0.4, 
            ease: "power2.out",
            overwrite: "auto"
          });
        });
      });
    }
    
    // Cards Sobre (específico pois tem layout diferente)
    const sobreCards = gsap.utils.toArray('.cards-sobre > div');
    gsap.fromTo(sobreCards,
      { y: 40, opacity: 0, visibility: 'hidden' },
      {
        y: 0,
        opacity: 1,
        visibility: 'visible',
        duration: 1,
        stagger: 0.15,
        ease: "power3.out",
        scrollTrigger: {
          trigger: '.cards-sobre',
          start: "top 80%",
          toggleActions: "play none none reverse"
        }
      }
    );

    // Hero Animations (Entrada inicial)
    const tlHero = gsap.timeline({ defaults: { ease: "power3.out" } });
    tlHero
      .from('.header', { y: -20, opacity: 0, duration: 1 })
      .from('.hero-subtitle', { y: 30, opacity: 0, duration: 0.8 }, "-=0.5")
      .from('.hero-title', { y: 40, opacity: 0, duration: 0.8 }, "-=0.6")
      .from('.brilho1', { scale: 0, opacity: 0, duration: 0.8 }, "-=0.4")
      .from('.hero-img', { x: 30, opacity: 0, duration: 1.2 }, "-=0.6")
      .from('.footer-hero', { y: 20, opacity: 0, duration: 0.8 }, "-=0.8");
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
      initGSAPAnimations();
      console.log('✓ Animations (GSAP) inicializado');
      
      initBackgroundAnimation();
      console.log('✓ Background Animations inicializado');
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
