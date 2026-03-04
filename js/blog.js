// JavaScript para página de Blog/Notícias

document.addEventListener("DOMContentLoaded", () => {
  console.log("Página de blog carregada");

  // Carregar notícias do backend
  carregarNoticiasBlog();
  // Carregar destaques
  carregarNoticiasDestaqueBlog();
  // Carrega notícias em destaque e renderiza na featured-grid
  async function carregarNoticiasDestaqueBlog() {
    const grid = document.querySelector('.featured-grid');
    if (!grid) return;
    grid.innerHTML = '<span style="color:#888;">Carregando destaques...</span>';
    try {
      const res = await fetch('api/noticias.php?destaque=all');
      let noticias = await res.json();
      if (!Array.isArray(noticias)) noticias = [];
      // Filtra apenas as que têm destaque
      const destaques = noticias.filter(n => n.destaque && n.destaque !== 'none');
      if (destaques.length === 0) {
        grid.innerHTML = '<span style="color:#888;">Nenhum destaque disponível.</span>';
        return;
      }
      grid.innerHTML = '';
      // Card principal: primeira notícia
      const principal = destaques[0];
      let imgSrc = '/assets/images/blog/placeholder.jpg';
      if (principal.capa_url) {
        if (/^\d+$/.test(principal.capa_url)) {
          imgSrc = 'api/get-imagem.php?id=' + principal.capa_url;
        } else {
          imgSrc = principal.capa_url.startsWith('/') ? principal.capa_url : '/' + principal.capa_url;
        }
      }
      const mainCard = document.createElement('article');
      mainCard.className = 'featured-card featured-main';
      mainCard.innerHTML = `
        <a href="noticia.html?id=${principal.id}" class="featured-link">
          <div class="card-image">
            <img src="${imgSrc}" alt="${principal.titulo}" loading="lazy" />
            <div class="featured-overlay">
              <h3 class="featured-title">${principal.titulo}</h3>
            </div>
          </div>
          <div class="card-content">
            <p class="featured-desc">${principal.resumo || principal.descricao || ''}</p>
          </div>
        </a>
      `;
      grid.appendChild(mainCard);
      // Cards secundários
      destaques.slice(1, 3).forEach(noticia => {
        let imgSrc = '/assets/images/blog/placeholder.jpg';
        if (noticia.capa_url) {
          if (/^\d+$/.test(noticia.capa_url)) {
            imgSrc = 'api/get-imagem.php?id=' + noticia.capa_url;
          } else {
            imgSrc = noticia.capa_url.startsWith('/') ? noticia.capa_url : '/' + noticia.capa_url;
          }
        }
        const secCard = document.createElement('article');
        secCard.className = 'featured-card featured-secondary';
        secCard.innerHTML = `
          <a href="noticia.html?id=${noticia.id}" class="featured-link" style="display: flex; flex-direction: column; height: 100%;">
            <div class="card-image-secondary" style="flex: 1; min-height: 200px;">
              <img src="${imgSrc}" alt="${noticia.titulo}" loading="lazy" />
              <div class="featured-overlay-secondary">
                <h3 class="featured-title-secondary">${noticia.titulo}</h3>
              </div>
            </div>
          </a>
        `;
        grid.appendChild(secCard);
      });
    } catch (e) {
      grid.innerHTML = '<span style="color:red;">Erro ao carregar destaques.</span>';
    }
  }
  // Sistema de filtros
  initFilters();
  // Load more functionality
  initLoadMore();
  // Smooth scroll para links
  initSmoothScroll();
// Carrega notícias do backend e renderiza na news-grid
async function carregarNoticiasBlog() {
  const grid = document.querySelector('.news-grid');
  if (!grid) return;
  grid.innerHTML = '<span style="color:#888;">Carregando notícias...</span>';
  try {
    const res = await fetch('api/noticias.php');
    let noticias = await res.json();
    if (!Array.isArray(noticias)) noticias = [];
    if (noticias.length === 0) {
      grid.innerHTML = '<span style="color:#888;">Nenhuma notícia encontrada.</span>';
      return;
    }
    grid.innerHTML = '';
    noticias.forEach(noticia => {
      // Categoria: usa primeira tag ou destaque
      let categoria = 'recentes';
      if (noticia.tags) {
        const tags = noticia.tags.split(',').map(t => t.trim()).filter(Boolean);
        if (tags.length) categoria = tags[0];
      } else if (noticia.destaque && noticia.destaque !== 'none') {
        categoria = noticia.destaque;
      }
      // Imagem
      let imgSrc = '/assets/images/blog/placeholder.jpg';
      if (noticia.capa_url) {
        if (/^\d+$/.test(noticia.capa_url)) {
          imgSrc = 'api/get-imagem.php?id=' + noticia.capa_url;
        } else {
          imgSrc = noticia.capa_url.startsWith('/') ? noticia.capa_url : '/' + noticia.capa_url;
        }
      }
      // Data
      let dataStr = '';
      if (noticia.data_publicacao) {
        const dt = new Date(noticia.data_publicacao);
        dataStr = dt.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
      }
      // Card
      const card = document.createElement('article');
      card.className = 'news-card';
      card.dataset.category = categoria;
      card.innerHTML = `
        <a href="noticia.html?id=${noticia.id}" class="news-link" style="display:block;text-decoration:none;color:inherit;">
          <div class="news-image">
            <img src="${imgSrc}" alt="${noticia.titulo}" loading="lazy" />
          </div>
          <div class="news-content">
            <h3 class="news-title">${noticia.titulo}</h3>
            <p class="news-description">${noticia.resumo || noticia.descricao || ''}</p>
            <span class="news-time">${dataStr ? 'Publicado em ' + dataStr : ''}</span>
          </div>
        </a>
      `;
      grid.appendChild(card);
    });
  } catch (e) {
    grid.innerHTML = '<span style="color:red;">Erro ao carregar notícias.</span>';
  }
}
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
