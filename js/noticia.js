// noticia.js — Página de detalhes da notícia
// Espera receber ?id= ou ?slug= na URL

async function carregarNoticia() {
  const content = document.getElementById('noticia-content');
  if (!content) return;
  content.innerHTML = '<span style="color:#888;">Carregando notícia...</span>';

  // Extrai id ou slug da URL
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const slug = params.get('slug');
  let url = 'api/noticias.php';
  if (id) url += '?id=' + encodeURIComponent(id);
  else if (slug) url += '?slug=' + encodeURIComponent(slug);

  try {
    const res = await fetch(url);
    const noticia = await res.json();
    if (!noticia || !noticia.titulo) {
      content.innerHTML = '<span style="color:#888;">Notícia não encontrada.</span>';
      return;
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
    // Conteúdo
    content.innerHTML = `
      <div class="noticia-detalhe">
      <div class="noticia-detalhe-header">
        <div class="noticia-detalhe-img">
          <img src="${imgSrc}" alt="${noticia.titulo}" loading="lazy" />
        </div>

        <div class="noticia-detalhe-cabecalho">
          <h2 class="noticia-detalhe-title">${noticia.titulo}</h2>
          <span class="noticia-detalhe-data">${dataStr ? 'Publicado em ' + dataStr : ''}</span>
          <div class="noticia-detalhe-tags">
            ${(noticia.tags || '').split(',').filter(Boolean).map(tag => `<span class="noticia-tag">${tag.trim()}</span>`).join(' ')}
          </div>
        
        </div>


      </div>
        
        <div class="noticia-detalhe-info">
          

          <div class="noticia-detalhe-resumo">${noticia.resumo || ''}</div>
          <div class="noticia-detalhe-conteudo">${noticia.conteudo_html || noticia.descricao || ''}</div>
        </div>
      </div>
    `;
  } catch (e) {
    content.innerHTML = '<span style="color:red;">Erro ao carregar notícia.</span>';
  }
}

// Inicializa ao carregar
window.addEventListener('DOMContentLoaded', carregarNoticia);
