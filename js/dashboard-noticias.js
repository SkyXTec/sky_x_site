// Insere <br> ao pressionar Enter no textarea de conteúdo
function enableEnterBr() {
  const textarea = document.getElementById('noticiaConteudo');
  textarea.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      textarea.setRangeText('<br>\n', start, end, 'end');
      textarea.focus();
    }
  });
}
// Função para inserir tag HTML no textarea no cursor
function insertTag(tag) {
  const textarea = document.getElementById('noticiaConteudo');
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  let insertText = '';
  if (tag === 'h2' || tag === 'h3' || tag === 'p' || tag === 'blockquote') {
    insertText = `<${tag}>Texto aqui</${tag}>`;
  } else if (tag === 'strong') {
    insertText = `<strong>Negrito</strong>`;
  } else if (tag === 'ul') {
    insertText = `<ul>\n  <li>Item 1</li>\n  <li>Item 2</li>\n</ul>`;
  } else if (tag === 'li') {
    insertText = `<li>Item</li>`;
  } else if (tag === 'a') {
    insertText = `<a href=\"https://\">Link</a>`;
  } else if (tag === 'img') {
    insertText = `<img src=\"assets/images/blog/exemplo.jpg\" alt=\"Descrição\">`;
  }
  // Insere no cursor
  textarea.setRangeText(insertText, start, end, 'end');
  textarea.focus();
}
// Inicialização da barra de formatação
function initToolbar() {
  const toolbar = document.getElementById('noticiaToolbar');
  if (!toolbar) return;
  toolbar.querySelectorAll('button[data-tag]').forEach((btn) => {
    btn.onclick = () => insertTag(btn.getAttribute('data-tag'));
  });
}
// dashboard-noticias.js — Gerenciamento de notícias no dashboard
// Estrutura inicial para criar, editar, listar e gerenciar notícias

let noticias = [];
let noticiaEditando = null;
let tagsSelecionadas = [];

function openNoticiaModal(noticia = null) {
  const modal = document.getElementById('noticiaModal');
  const form = document.getElementById('noticiaForm');
  const titulo = document.getElementById('noticiaTitulo');
  const resumo = document.getElementById('noticiaResumo');
  const slug = document.getElementById('noticiaSlug');
  const conteudo = document.getElementById('noticiaConteudo');
  const imgPreview = document.getElementById('noticiaImgPreview');
  const tagsDiv = document.getElementById('noticiaTags');
  const tagsInput = document.getElementById('noticiaTagsInput');
  const imagemInput = document.getElementById('noticiaImagem');
  const destaqueSelect = document.getElementById('noticiaDestaque');
  noticiaEditando = noticia;
  tagsSelecionadas = [];

  if (noticia) {
    document.getElementById('noticiaModalTitle').textContent = 'Editar Notícia';
    titulo.value = noticia.titulo;
    resumo.value = noticia.resumo || '';
    slug.value = noticia.slug;
    conteudo.value = noticia.conteudo_html || '';
    destaqueSelect.value = noticia.destaque || 'none';
    tagsSelecionadas = noticia.tags
      ? noticia.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
      : [];
    if (noticia.capa_url) {
      if (/^\d+$/.test(noticia.capa_url)) {
        imgPreview.src = 'api/get-imagem.php?id=' + noticia.capa_url;
        imgPreview.setAttribute(
          'data-capa-url',
          'api/get-imagem.php?id=' + noticia.capa_url,
        );
      } else {
        imgPreview.src = noticia.capa_url.startsWith('/')
          ? noticia.capa_url
          : '/' + noticia.capa_url;
        imgPreview.setAttribute('data-capa-url', imgPreview.src);
      }
      imgPreview.style.display = '';
    } else {
      imgPreview.src = '/assets/images/blog/placeholder.jpg';
      imgPreview.removeAttribute('data-capa-url');
      imgPreview.style.display = '';
    }
  } else {
    document.getElementById('noticiaModalTitle').textContent = 'Nova Notícia';
    titulo.value = '';
    resumo.value = '';
    slug.value = '';
    conteudo.value = '';
    destaqueSelect.value = 'none';
    tagsSelecionadas = [];
    imgPreview.src = '/assets/images/blog/placeholder.jpg';
    imgPreview.removeAttribute('data-capa-url');
    imgPreview.style.display = '';
  }
  tagsInput.value = '';
  renderTags();
  modal.style.display = 'flex';
}

// Atualiza status de publicação/arquivamento de uma notícia
async function updateStatus(id, status) {
  try {
    const res = await fetch('api/noticias.php', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    const result = await res.json();
    if (result.success) {
      renderNoticiasList();
    } else {
      alert('Erro ao atualizar status.');
    }
  } catch {
    alert('Erro ao atualizar status.');
  }
}

// Função para listar notícias na aba
async function renderNoticiasList() {
  const list = document.getElementById('noticiasList');
  if (!list) return;
  list.innerHTML = '<span style="color:#888;">Carregando...</span>';
  try {
    const res = await fetch('api/noticias.php');
    noticias = await res.json();
    if (!Array.isArray(noticias)) noticias = [];
    if (noticias.length === 0) {
      list.innerHTML =
        '<span style="color:#888;">Nenhuma notícia cadastrada.</span>';
      return;
    }
    list.innerHTML = '';
    noticias.forEach((noticia) => {
      const card = document.createElement('div');
      card.className = 'noticia-card';
      card.innerHTML = `
                                <img class="noticia-card-img" src="${noticia.capa_url ? (/^\d+$/.test(noticia.capa_url) ? 'api/get-imagem.php?id=' + noticia.capa_url : noticia.capa_url.startsWith('/') ? noticia.capa_url : '/' + noticia.capa_url) : '/assets/images/blog/placeholder.jpg'}" alt="Capa" />
                                <div class="noticia-card-body">
                                    <div class="noticia-card-title">${noticia.titulo}</div>
                                    <div class="noticia-card-tags">
                                        ${(noticia.tags || '')
                                          .split(',')
                                          .filter(Boolean)
                                          .map(
                                            (tag) =>
                                              `<span class="noticia-tag">${tag.trim()}</span>`,
                                          )
                                          .join(' ')}
                                    </div>
                                    <div class="noticia-actions-status">
                                        <div class="noticia-card-status">
                                            <span class="noticia-status ${noticia.status === 'arquivada' ? 'arquivada' : 'publicada'}">${noticia.status === 'arquivada' ? 'Arquivada' : 'Publicada'}</span>
                                        </div>
                                        <div class="noticia-card-actions">
                                            <button class="noticia-btn-editar">Editar</button>
                                            <button class="noticia-btn-pub" ${noticia.status === 'publicada' ? 'style="display:none;"' : ''}>Publicar</button>
                                            <button class="noticia-btn-arq" ${noticia.status === 'arquivada' ? 'style="display:none;"' : ''}>Arquivar</button>
                                        </div>
                                    </div>
                                </div>
                        `;
      card.querySelector('.noticia-btn-editar').onclick = () =>
        openNoticiaModal(noticia);
      card.querySelector('.noticia-btn-pub').onclick = () =>
        updateStatus(noticia.id, 'publicada');
      card.querySelector('.noticia-btn-arq').onclick = () =>
        updateStatus(noticia.id, 'arquivada');
      list.appendChild(card);
    });
  } catch (e) {
    list.innerHTML =
      '<span style="color:red;">Erro ao carregar notícias.</span>';
  }
}

// Atualiza os cards de visão geral (overview) com dados reais da API
async function updateOverviewNoticias() {
  const countEl = document.getElementById('metricNoticias');
  const gridEl = document.getElementById('overviewNewsGrid');
  try {
    const res = await fetch('api/noticias.php');
    const data = await res.json();
    if (!Array.isArray(data)) return;
    const publicadas = data.filter((n) => n.status === 'publicada');
    if (countEl) countEl.textContent = publicadas.length;
    if (gridEl) {
      gridEl.innerHTML = '';
      if (publicadas.length === 0) {
        gridEl.innerHTML =
          '<span style="color:#888;">Nenhuma notícia publicada.</span>';
        return;
      }
      publicadas.slice(0, 3).forEach((n) => {
        const imgUrl = n.capa_url
          ? /^\d+$/.test(n.capa_url)
            ? 'api/get-imagem.php?id=' + n.capa_url
            : n.capa_url.startsWith('/')
              ? n.capa_url
              : '/' + n.capa_url
          : '';
        const dateStr = n.data_publicacao || n.created_at || '';
        const dateFmt = dateStr
          ? new Date(dateStr).toLocaleDateString('pt-BR')
          : '';
        const card = document.createElement('div');
        card.className = 'news-card';
        card.innerHTML = `
          <div class="news-card-img"${imgUrl ? ` style="background-image:url('${imgUrl}');background-size:cover;background-position:center;"` : ''}></div>
          <div class="news-card-body">
            <span class="news-badge">Publicado</span>
            <h3>${n.titulo}</h3>
            <span class="news-date">${dateFmt}</span>
          </div>
        `;
        gridEl.appendChild(card);
      });
    }
  } catch (e) {
    console.error('Erro ao atualizar overview de notícias:', e);
  }
}

// Expõe funções para uso em outros scripts
window.renderNoticiasList = renderNoticiasList;
window.updateOverviewNoticias = updateOverviewNoticias;

// Função para salvar notícia (criar ou editar)
async function saveNoticia(e) {
  e.preventDefault();
  const titulo = document.getElementById('noticiaTitulo').value.trim();
  const resumo = document.getElementById('noticiaResumo').value.trim();
  const slug = document.getElementById('noticiaSlug').value.trim();
  const conteudo = document.getElementById('noticiaConteudo').value.trim();
  const imgPreview = document.getElementById('noticiaImgPreview');
  let capa_url = '';
  // Sempre prioriza o atributo data-capa-url se existir
  if (imgPreview.hasAttribute('data-capa-url')) {
    const val = imgPreview.getAttribute('data-capa-url');
    // Se for get-imagem.php?id=NUM, salva só o NUM
    const match = val.match(/get-imagem\.php\?id=(\d+)/);
    capa_url = match ? match[1] : val;
  } else if (imgPreview.src && !imgPreview.src.startsWith('data:')) {
    // Se for get-imagem.php?id=NUM, salva só o NUM
    const match = imgPreview.src.match(/get-imagem\.php\?id=(\d+)/);
    capa_url = match ? match[1] : imgPreview.src;
  }
  const tags = tagsSelecionadas.join(',');
  const destaque = document.getElementById('noticiaDestaque').value;
  const id = noticiaEditando ? noticiaEditando.id : null;
  if (!titulo || !slug || !conteudo) {
    alert('Preencha todos os campos obrigatórios.');
    return;
  }
  const data = {
    titulo,
    resumo: resumo || '',
    slug,
    conteudo_html: conteudo,
    capa_url: capa_url && !capa_url.startsWith('data:') ? capa_url : '',
    tags,
    destaque,
    status:
      noticiaEditando && noticiaEditando.status
        ? noticiaEditando.status
        : 'publicada',
  };
  let url = 'api/noticias.php';
  let method = id ? 'PUT' : 'POST';
  if (id) data.id = id;
  try {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (result.success) {
      closeNoticiaModal();
      renderNoticiasList();
    } else {
      alert('Erro ao salvar notícia.');
    }
  } catch (err) {
    alert('Erro ao salvar notícia.');
  }
}

// Função para upload de imagens (capa)
async function uploadImagem(file, cb) {
  const formData = new FormData();
  formData.append('imagem', file);
  try {
    const res = await fetch('api/upload-imagem.php', {
      method: 'POST',
      body: formData,
    });
    const result = await res.json();
    if (result.success && result.img_id) {
      cb('api/get-imagem.php?id=' + result.img_id);
    } else {
      alert('Erro ao enviar imagem.');
      cb('');
    }
  } catch {
    alert('Erro ao enviar imagem.');
    cb('');
  }
}

// Função para adicionar/remover tags
function handleTagsInput() {
  const tagsInput = document.getElementById('noticiaTagsInput');
  tagsInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && tagsInput.value.trim()) {
      e.preventDefault();
      const tag = tagsInput.value.trim();
      if (tag && !tagsSelecionadas.includes(tag)) {
        tagsSelecionadas.push(tag);
        renderTags();
      }
      tagsInput.value = '';
    }
  });
}

function renderTags() {
  const tagsDiv = document.getElementById('noticiaTags');
  tagsDiv.innerHTML = '';
  tagsSelecionadas.forEach((tag) => {
    const el = document.createElement('span');
    el.className = 'noticia-modal-tag';
    el.innerHTML = `${tag} <button class="noticia-modal-tag-remove" title="Remover">&times;</button>`;
    el.querySelector('button').onclick = () => {
      tagsSelecionadas = tagsSelecionadas.filter((t) => t !== tag);
      renderTags();
    };
    tagsDiv.appendChild(el);
  });
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  updateOverviewNoticias();
  renderNoticiasList();
  document.getElementById('btnNovaNoticia').onclick = () => openNoticiaModal();
  document.getElementById('closeNoticiaModal').onclick = closeNoticiaModal;
  document.getElementById('cancelarNoticiaModal').onclick = closeNoticiaModal;
  document.getElementById('noticiaForm').onsubmit = saveNoticia;
  handleTagsInput();
  document
    .getElementById('noticiaImagem')
    .addEventListener('change', function (e) {
      const file = e.target.files[0];
      if (file) {
        uploadImagem(file, (url) => {
          const imgPreview = document.getElementById('noticiaImgPreview');
          if (url && !url.startsWith('data:')) {
            imgPreview.src = url;
            imgPreview.style.display = '';
            imgPreview.setAttribute('data-capa-url', url);
          } else {
            // Se falhar, remove data-capa-url e mostra placeholder
            imgPreview.removeAttribute('data-capa-url');
            imgPreview.src = '/assets/images/blog/placeholder.jpg';
            imgPreview.style.display = '';
          }
        });
      }
    });
  initToolbar();
  enableEnterBr();
});

function closeNoticiaModal() {
  document.getElementById('noticiaModal').style.display = 'none';
  noticiaEditando = null;
  tagsSelecionadas = [];
  // Limpa imagem e input
  const imgPreview = document.getElementById('noticiaImgPreview');
  const imagemInput = document.getElementById('noticiaImagem');
  if (imgPreview) {
    imgPreview.src = '/assets/images/blog/placeholder.jpg';
    imgPreview.style.display = '';
    imgPreview.removeAttribute('data-capa-url');
  }
  if (imagemInput) {
    imagemInput.value = '';
  }
}
