// dashboard-parceiros.js — Gerenciamento de logotipos de parceiros

// ── Listar parceiros ─────────────────────────────────────────────────────────
async function renderParceirosList() {
  const grid = document.getElementById('parceirosList');
  if (!grid) return;
  grid.innerHTML = '<span style="color:#888;">Carregando...</span>';
  try {
    const res = await fetch('api/parceiros.php');
    const parceiros = await res.json();
    if (!Array.isArray(parceiros) || parceiros.length === 0) {
      grid.innerHTML =
        '<span style="color:#888;">Nenhum parceiro cadastrado.</span>';
      return;
    }
    grid.innerHTML = '';
    parceiros.forEach((p) => {
      const card = document.createElement('div');
      card.className = 'parceiro-dash-card';
      card.innerHTML = `
        <div class="parceiro-dash-img-wrap">
          <img src="${p.img_url}" alt="${escapeHtml(p.nome)}" />
        </div>
        <div class="parceiro-dash-body">
          <span class="parceiro-dash-nome">${escapeHtml(p.nome)}</span>
          <button class="parceiro-btn-remover" data-id="${p.id}">Remover</button>
        </div>
      `;
      card
        .querySelector('.parceiro-btn-remover')
        .addEventListener('click', () => removerParceiro(p.id, p.nome));
      grid.appendChild(card);
    });
  } catch {
    grid.innerHTML =
      '<span style="color:red;">Erro ao carregar parceiros.</span>';
  }
}

// ── Remover parceiro ─────────────────────────────────────────────────────────
async function removerParceiro(id, nome) {
  if (
    !confirm(`Remover o parceiro "${nome}"?\nEsta ação não pode ser desfeita.`)
  )
    return;
  try {
    const res = await fetch('api/parceiros.php', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    const result = await res.json();
    if (result.success) {
      renderParceirosList();
    } else {
      alert(result.error || 'Erro ao remover parceiro.');
    }
  } catch {
    alert('Erro ao remover parceiro.');
  }
}

// ── Modal ────────────────────────────────────────────────────────────────────
function openParceiroModal() {
  document.getElementById('parceiroNome').value = '';
  document.getElementById('parceiroImagem').value = '';
  const preview = document.getElementById('parceiroImgPreview');
  preview.src = '';
  preview.style.display = 'none';
  document.getElementById('parceiroModal').style.display = 'flex';
}

function closeParceiroModal() {
  document.getElementById('parceiroModal').style.display = 'none';
}

// ── Utilitário para evitar XSS nos nomes ────────────────────────────────────
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Inicialização ────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderParceirosList();

  document
    .getElementById('btnAdicionarParceiro')
    .addEventListener('click', openParceiroModal);
  document
    .getElementById('closeParceiroModal')
    .addEventListener('click', closeParceiroModal);
  document
    .getElementById('cancelarParceiroModal')
    .addEventListener('click', closeParceiroModal);

  // Fecha modal ao clicar fora da caixa
  document.getElementById('parceiroModal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('parceiroModal'))
      closeParceiroModal();
  });

  // Preview da imagem selecionada
  document
    .getElementById('parceiroImagem')
    .addEventListener('change', function () {
      const file = this.files[0];
      const preview = document.getElementById('parceiroImgPreview');
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          preview.src = e.target.result;
          preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
      } else {
        preview.src = '';
        preview.style.display = 'none';
      }
    });

  // Submit: upload + save
  document
    .getElementById('parceiroForm')
    .addEventListener('submit', async (e) => {
      e.preventDefault();
      const nome = document.getElementById('parceiroNome').value.trim();
      const file = document.getElementById('parceiroImagem').files[0];
      if (!file) {
        alert('Selecione uma imagem.');
        return;
      }
      const formData = new FormData();
      formData.append('imagem', file);
      if (nome) formData.append('nome', nome);

      const btn = e.target.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.textContent = 'Salvando...';

      try {
        const res = await fetch('api/parceiros.php', {
          method: 'POST',
          body: formData,
        });
        const result = await res.json();
        if (result.success) {
          closeParceiroModal();
          renderParceirosList();
        } else {
          alert(result.error || 'Erro ao adicionar parceiro.');
        }
      } catch {
        alert('Erro ao adicionar parceiro.');
      } finally {
        btn.disabled = false;
        btn.textContent = 'Salvar';
      }
    });
});

// Expõe para uso em dashboard.js (trigger ao trocar de view)
window.renderParceirosList = renderParceirosList;
