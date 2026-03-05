// dashboard-projetos.js — Gerenciamento de projetos do portfólio

let projetoEditando = null;

// ── Listar projetos ──────────────────────────────────────────────────────────
async function renderProjetosList() {
  const list = document.getElementById('projetosList');
  if (!list) return;
  list.innerHTML = '<span style="color:#888;">Carregando...</span>';
  try {
    const res = await fetch('api/projetos.php?admin=1');
    const projetos = await res.json();
    if (!Array.isArray(projetos) || projetos.length === 0) {
      list.innerHTML =
        '<span style="color:#888;">Nenhum projeto cadastrado. Clique em "+ Novo Projeto" para começar.</span>';
      return;
    }
    list.innerHTML = '';
    projetos.forEach(renderProjetoCard);
  } catch {
    list.innerHTML =
      '<span style="color:red;">Erro ao carregar projetos.</span>';
  }
}

function renderProjetoCard(p) {
  const list = document.getElementById('projetosList');
  const card = document.createElement('div');
  card.className = 'projeto-dash-card';
  card.dataset.id = p.id;

  const capaStyle = p.capa_url
    ? `background-image:url('${p.capa_url}')`
    : 'background:#e8e8e8;';
  const statusClass = p.status === 'publicado' ? 'publicada' : 'arquivada';
  const statusLabel = p.status === 'publicado' ? 'Publicado' : 'Arquivado';
  const metaParts = [p.ano, p.cliente ? escHtml(p.cliente) : null].filter(
    Boolean,
  );

  card.innerHTML = `
    <div class="projeto-dash-capa" style="${capaStyle}"></div>
    <div class="projeto-dash-body">
      <div class="projeto-dash-info">
        <span class="projeto-dash-nome">${escHtml(p.nome)}</span>
        ${metaParts.length ? `<span class="projeto-dash-meta">${metaParts.join(' · ')}</span>` : ''}
        <span class="noticia-status ${statusClass}">${statusLabel}</span>
      </div>
      <div class="projeto-dash-actions">
        <button class="noticia-btn-editar">Editar</button>
        <button class="projeto-btn-status ${p.status === 'publicado' ? 'btn-arquivar' : 'btn-publicar'}">
          ${p.status === 'publicado' ? 'Arquivar' : 'Publicar'}
        </button>
        <button class="projeto-btn-excluir">Excluir</button>
      </div>
    </div>
  `;

  card.querySelector('.noticia-btn-editar').onclick = () => openProjetoModal(p);
  card.querySelector('.projeto-btn-status').onclick = () =>
    toggleProjetoStatus(p);
  card.querySelector('.projeto-btn-excluir').onclick = () =>
    excluirProjeto(p.id, p.nome);

  list.appendChild(card);
}

// ── Toggle status ────────────────────────────────────────────────────────────
async function toggleProjetoStatus(p) {
  const novoStatus = p.status === 'publicado' ? 'arquivado' : 'publicado';
  try {
    const res = await fetch('api/projetos.php', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: p.id, status: novoStatus }),
    });
    const result = await res.json();
    if (result.success) renderProjetosList();
    else alert(result.error || 'Erro ao atualizar status.');
  } catch {
    alert('Erro ao atualizar status.');
  }
}

// ── Excluir ──────────────────────────────────────────────────────────────────
async function excluirProjeto(id, nome) {
  if (
    !confirm(
      `Excluir o projeto "${nome}"?\nTodas as imagens e vídeos da galeria também serão removidos.`,
    )
  )
    return;
  try {
    const res = await fetch('api/projetos.php', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    const result = await res.json();
    if (result.success) renderProjetosList();
    else alert(result.error || 'Erro ao excluir.');
  } catch {
    alert('Erro ao excluir projeto.');
  }
}

// ── Modal: abrir ─────────────────────────────────────────────────────────────
function openProjetoModal(projeto = null) {
  projetoEditando = projeto;
  const title = document.getElementById('projetoModalTitle');
  const galeriaSection = document.getElementById('galeriaSection');

  if (projeto) {
    title.textContent = 'Editar Projeto';
    document.getElementById('projetoNome').value = projeto.nome || '';
    document.getElementById('projetoCliente').value = projeto.cliente || '';
    document.getElementById('projetoAno').value = projeto.ano || '';
    document.getElementById('projetoLabel').value = projeto.label || 'Projeto';
    document.getElementById('projetoDescricao').value = projeto.descricao || '';
    document.getElementById('projetoDetalhes').value = projeto.detalhes || '';
    document.getElementById('projetoStatus').value =
      projeto.status || 'publicado';
    document.getElementById('projetoOrdem').value = projeto.ordem ?? 0;

    const preview = document.getElementById('projetoImgPreview');
    if (projeto.capa_url) {
      preview.src = projeto.capa_url;
      preview.style.display = 'block';
    } else {
      preview.src = '';
      preview.style.display = 'none';
    }

    galeriaSection.style.display = 'block';
    renderGaleriaList(projeto);
  } else {
    title.textContent = 'Novo Projeto';
    document.getElementById('projetoForm').reset();
    document.getElementById('projetoLabel').value = 'Projeto';
    document.getElementById('projetoImgPreview').style.display = 'none';
    galeriaSection.style.display = 'none';
    document.getElementById('galeriaList').innerHTML = '';
  }

  document.getElementById('projetoImagem').value = '';
  document.getElementById('projetoModal').style.display = 'flex';
}

function closeProjetoModal() {
  document.getElementById('projetoModal').style.display = 'none';
  projetoEditando = null;
}

// ── Galeria: renderizar ───────────────────────────────────────────────────────
function renderGaleriaList(projeto) {
  const galeriaList = document.getElementById('galeriaList');
  galeriaList.innerHTML = '';

  if (!projeto.galeria || projeto.galeria.length === 0) {
    galeriaList.innerHTML =
      '<span style="color:#888;font-size:.88rem;">Nenhuma mídia na galeria ainda.</span>';
    return;
  }

  projeto.galeria.forEach((item) => {
    const div = document.createElement('div');
    div.className = 'galeria-dash-item';

    if (item.tipo === 'imagem') {
      div.innerHTML = `
        <img src="${item.url}" alt="Galeria" class="galeria-dash-thumb" />
        <span class="galeria-tipo-badge img">IMG</span>
        <button class="galeria-btn-remover" data-id="${item.id}" title="Remover">✕</button>
      `;
    } else {
      div.innerHTML = `
        <div class="galeria-dash-video-thumb">▶</div>
        <span class="galeria-tipo-badge vid">VID</span>
        <button class="galeria-btn-remover" data-id="${item.id}" title="Remover">✕</button>
      `;
    }

    div.querySelector('.galeria-btn-remover').onclick = () =>
      removeGaleriaItem(item.id, projeto);
    galeriaList.appendChild(div);
  });
}

async function removeGaleriaItem(itemId, projeto) {
  if (!confirm('Remover esta mídia da galeria?')) return;
  try {
    const res = await fetch(`api/projetos.php?galeria_item=${itemId}`, {
      method: 'DELETE',
    });
    const result = await res.json();
    if (result.success) {
      const updated = await fetchProjeto(projeto.id);
      if (updated) {
        projetoEditando = updated;
        renderGaleriaList(updated);
      }
    } else {
      alert(result.error || 'Erro ao remover.');
    }
  } catch {
    alert('Erro ao remover item da galeria.');
  }
}

async function addGaleriaImagem(projetoId) {
  const input = document.getElementById('galeriaImgInput');
  const file = input.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('imagem', file);

  try {
    const res = await fetch(`api/projetos.php?galeria=${projetoId}`, {
      method: 'POST',
      body: formData,
    });
    const result = await res.json();
    input.value = '';
    if (result.success) {
      const updated = await fetchProjeto(projetoId);
      if (updated) {
        projetoEditando = updated;
        renderGaleriaList(updated);
      }
    } else {
      alert(result.error || 'Erro ao adicionar imagem.');
    }
  } catch {
    alert('Erro ao adicionar imagem à galeria.');
  }
}

async function addGaleriaVideo(projetoId) {
  const urlInput = document.getElementById('galeriaVideoUrl');
  const url = urlInput.value.trim();
  if (!url) {
    alert('Digite a URL do vídeo (YouTube, Vimeo ou link direto).');
    return;
  }
  try {
    const res = await fetch(`api/projetos.php?galeria=${projetoId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ video_url: url }),
    });
    const result = await res.json();
    urlInput.value = '';
    if (result.success) {
      const updated = await fetchProjeto(projetoId);
      if (updated) {
        projetoEditando = updated;
        renderGaleriaList(updated);
      }
    } else {
      alert(result.error || 'Erro ao adicionar vídeo.');
    }
  } catch {
    alert('Erro ao adicionar vídeo à galeria.');
  }
}

async function fetchProjeto(id) {
  try {
    const res = await fetch(`api/projetos.php?id=${id}`);
    return await res.json();
  } catch {
    return null;
  }
}

// ── Salvar (criar ou editar) ──────────────────────────────────────────────────
async function saveProjetoForm(e) {
  e.preventDefault();

  const btn = e.target.querySelector('button[type="submit"]');
  btn.disabled = true;
  btn.textContent = 'Salvando...';

  const formData = new FormData();
  formData.append('nome', document.getElementById('projetoNome').value.trim());
  formData.append(
    'cliente',
    document.getElementById('projetoCliente').value.trim(),
  );
  formData.append('ano', document.getElementById('projetoAno').value);
  formData.append(
    'label',
    document.getElementById('projetoLabel').value.trim(),
  );
  formData.append(
    'descricao',
    document.getElementById('projetoDescricao').value.trim(),
  );
  formData.append(
    'detalhes',
    document.getElementById('projetoDetalhes').value.trim(),
  );
  formData.append('status', document.getElementById('projetoStatus').value);
  formData.append('ordem', document.getElementById('projetoOrdem').value);

  if (projetoEditando) formData.append('id', projetoEditando.id);

  const file = document.getElementById('projetoImagem').files[0];
  if (file) formData.append('imagem', file);

  try {
    const res = await fetch('api/projetos.php', {
      method: 'POST',
      body: formData,
    });
    const result = await res.json();
    if (result.success) {
      renderProjetosList();
      if (!projetoEditando && result.projeto) {
        // Mantém modal aberto em modo edição para galeria
        projetoEditando = result.projeto;
        document.getElementById('projetoModalTitle').textContent =
          'Editar Projeto';
        document.getElementById('galeriaSection').style.display = 'block';
        renderGaleriaList(projetoEditando);
        if (result.projeto.capa_url) {
          const preview = document.getElementById('projetoImgPreview');
          preview.src = result.projeto.capa_url;
          preview.style.display = 'block';
        }
      }
    } else {
      alert(result.error || 'Erro ao salvar projeto.');
    }
  } catch {
    alert('Erro ao salvar projeto.');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Salvar';
  }
}

// ── Utilitário ───────────────────────────────────────────────────────────────
function escHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Inicialização ────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderProjetosList();

  const modal = document.getElementById('projetoModal');

  document.getElementById('btnNovoProjeto').onclick = () => openProjetoModal();
  document.getElementById('closeProjetoModal').onclick = closeProjetoModal;
  document.getElementById('cancelarProjetoModal').onclick = closeProjetoModal;
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeProjetoModal();
  });

  document.getElementById('projetoForm').onsubmit = saveProjetoForm;

  // Preview de capa
  document
    .getElementById('projetoImagem')
    .addEventListener('change', function () {
      const file = this.files[0];
      const preview = document.getElementById('projetoImgPreview');
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          preview.src = ev.target.result;
          preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
      }
    });

  // Galeria: adicionar imagem
  const galeriaImgInput = document.getElementById('galeriaImgInput');
  document.getElementById('btnAddGaleriaImg').onclick = () =>
    galeriaImgInput.click();
  galeriaImgInput.addEventListener('change', () => {
    if (projetoEditando) addGaleriaImagem(projetoEditando.id);
  });

  // Galeria: adicionar vídeo
  document.getElementById('btnAddGaleriaVideo').onclick = () => {
    if (projetoEditando) addGaleriaVideo(projetoEditando.id);
  };
  document
    .getElementById('galeriaVideoUrl')
    .addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (projetoEditando) addGaleriaVideo(projetoEditando.id);
      }
    });
});

window.renderProjetosList = renderProjetosList;
