// index-noticias.js
// Carrega notícias com destaque do backend e insere dinamicamente no index.html

// Função para buscar notícias destacadas
async function carregarNoticiasDestaque() {
  try {
    const response = await fetch('api/noticias.php?destaque=all');
    const noticias = await response.json();
    if (!Array.isArray(noticias)) return;

    // Seleciona o container do carrossel
    const carousel = document.querySelector('.blog-carousel');
    if (!carousel) return;
    carousel.innerHTML = '';

    // Cria os indicadores
    const indicators = document.querySelector('.carousel-indicators');
    if (indicators) indicators.innerHTML = '';

    // let idx = 1; // Removido: idx será declarado apenas antes do forEach após a ordenação
    // Container para modais
    let modaisContainer = document.getElementById('noticiasModaisContainer');
    if (!modaisContainer) {
      modaisContainer = document.createElement('div');
      modaisContainer.id = 'noticiasModaisContainer';
      document.body.appendChild(modaisContainer);
    }
    modaisContainer.innerHTML = '';

    // Ordena as notícias por destaque: destaque1, destaque2, destaque3
    const ordemDestaque = { destaque1: 1, destaque2: 2, destaque3: 3 };
    const noticiasDestaque = noticias
      .filter(noticia => noticia.destaque && noticia.destaque !== 'none')
      .sort((a, b) => {
        const aVal = ordemDestaque[a.destaque] || 99;
        const bVal = ordemDestaque[b.destaque] || 99;
        return aVal - bVal;
      });
    let idx = 1;
    noticiasDestaque.forEach(noticia => {
        // Card do carrossel
        const noticiaDiv = document.createElement('div');
        noticiaDiv.className = 'blog-content' + (idx === 1 ? ' active' : '');
        noticiaDiv.dataset.noticia = idx;

        // Imagem
        const imgDiv = document.createElement('div');
        imgDiv.className = 'noticia-destaque';
        const img = document.createElement('img');
        if (noticia.capa_url && /^\d+$/.test(noticia.capa_url)) {
          img.src = 'api/get-imagem.php?id=' + noticia.capa_url;
        } else {
          img.src = noticia.capa_url || 'assets/images/default-news.jpg';
        }
        img.alt = noticia.titulo;
        img.className = 'noticia-imagem';
        img.loading = 'lazy';
        imgDiv.appendChild(img);

        // Info
        const infoDiv = document.createElement('div');
        infoDiv.className = 'noticia-info';
        const cabecalhoDiv = document.createElement('div');
        cabecalhoDiv.className = 'noticia-cabecalho';
        const h3 = document.createElement('h3');
        h3.className = 'noticia-titulo';
        h3.textContent = noticia.titulo;
        cabecalhoDiv.appendChild(h3);
        const badge = document.createElement('span');
        badge.className = 'badge-destaque';
        badge.textContent = `Destaque #${idx}`;
        cabecalhoDiv.appendChild(badge);
        infoDiv.appendChild(cabecalhoDiv);

        const desc = document.createElement('p');
        desc.className = 'noticia-descricao';
        desc.textContent = noticia.resumo || noticia.descricao || '';
        infoDiv.appendChild(desc);

        const acoesDiv = document.createElement('div');
        acoesDiv.className = 'noticia-acoes';
        const btn = document.createElement('a');
        btn.className = 'btn-noticia';
        btn.href = `noticia.html?id=${noticia.id}`;
        btn.textContent = 'Veja a notícia completa';
        btn.style.textDecoration = 'none';
        btn.style.color = 'inherit';
        btn.target = '_blank';
        btn.rel = 'noopener noreferrer';
        acoesDiv.appendChild(btn);
        const link = document.createElement('a');
        link.href = 'blog.html';
        link.className = 'btn-noticias-secundario';
        link.textContent = 'Outras notícias';
        acoesDiv.appendChild(link);
        infoDiv.appendChild(acoesDiv);

        noticiaDiv.appendChild(imgDiv);
        noticiaDiv.appendChild(infoDiv);
        carousel.appendChild(noticiaDiv);

        // Modal dinâmico
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = `noticiaModal${idx}`;
        modal.innerHTML = `
          <div class="modal-content">
            <span class="modal-close" style="cursor:pointer;font-size:2rem;float:right">&times;</span>
            <div class="modal-header">
              <h2>${noticia.titulo}</h2>
              <p class="modal-data">${noticia.data_publicacao ? new Date(noticia.data_publicacao).toLocaleDateString('pt-BR') : ''}</p>
            </div>
            <div class="modal-body">
              <img src="${noticia.capa_url && /^\d+$/.test(noticia.capa_url) ? 'api/get-imagem.php?id=' + noticia.capa_url : (noticia.capa_url || 'assets/images/default-news.jpg')}" alt="${noticia.titulo}" class="noticia-imagem" style="max-width:100%;border-radius:24px;margin-bottom:2rem;" />
              <div class="noticia-conteudo">${noticia.conteudo_html || noticia.descricao || ''}</div>
            </div>
          </div>
        `;
        // Fechar modal
        modal.querySelector('.modal-close').onclick = () => {
          modal.style.display = 'none';
          document.body.style.overflow = 'auto';
        };
        // Fechar ao clicar fora
        modal.onclick = (e) => {
          if (e.target === modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
          }
        };
        modaisContainer.appendChild(modal);

        // Indicador
        if (indicators) {
          const indicator = document.createElement('button');
          indicator.className = 'indicator' + (idx === 1 ? ' active' : '');
          indicator.dataset.slide = idx;
          indicator.ariaLabel = `Ir para notícia ${idx}`;
          indicators.appendChild(indicator);
        }
        idx++;
    });
    // Após inserir as notícias, inicializa o carrossel
    if (typeof window.initBlogCarousel === 'function') {
      window.initBlogCarousel();
    }
  } catch (e) {
    console.error('Erro ao carregar notícias:', e);
  }
}

// Chama ao carregar
window.addEventListener('DOMContentLoaded', carregarNoticiasDestaque);