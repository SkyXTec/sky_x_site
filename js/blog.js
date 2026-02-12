// JavaScript para página de Blog/Notícias

document.addEventListener("DOMContentLoaded", () => {
  console.log("Página de blog carregada");

  // Sistema de filtros
  initFilters();
  
  // Load more functionality
  initLoadMore();
  
  // Smooth scroll para links
  initSmoothScroll();
});

function initFilters() {
  const categorySelect = document.getElementById('categoryFilter');
  const newsCards = document.querySelectorAll('.news-card');

  if (categorySelect) {
    categorySelect.addEventListener('change', (e) => {
      const filter = e.target.value;
      
      // Filtrar cards
      newsCards.forEach(card => {
        const category = card.dataset.category;
        
        if (filter === 'all' || category === filter) {
          card.style.display = 'flex';
          card.style.animation = 'fadeIn 0.5s ease';
        } else {
          card.style.display = 'none';
        }
      });
    });
  }
}

function initLoadMore() {
  const loadMoreBtn = document.querySelector('.btn-load-more');
  
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
      // Simular carregamento de mais notícias
      loadMoreBtn.textContent = 'Carregando...';
      loadMoreBtn.disabled = true;
      
      setTimeout(() => {
        // Aqui você faria uma chamada à API para carregar mais notícias
        console.log('Carregar mais notícias...');
        
        loadMoreBtn.textContent = 'Carregar mais notícias';
        loadMoreBtn.disabled = false;
        
        // Exemplo: poderia adicionar novos cards ao grid
        // const newsGrid = document.querySelector('.news-grid');
        // newsGrid.innerHTML += novasNoticias;
      }, 1500);
    });
  }
}

function initSmoothScroll() {
  const links = document.querySelectorAll('a[href^="#"]');
  
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      
      if (href === '#') {
        e.preventDefault();
        return;
      }
      
      const targetId = href.replace('#', '');
      const targetSection = document.getElementById(targetId);
      
      if (targetSection) {
        e.preventDefault();
        
        if (typeof gsap !== 'undefined') {
          gsap.to(window, {
            duration: 1.2,
            scrollTo: { y: targetSection, offsetY: 100 },
            ease: "power2.inOut"
          });
        } else {
          const headerOffset = 100;
          const elementPosition = targetSection.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }
    });
  });
}

// Animação de fade in para filtros
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;
document.head.appendChild(style);
