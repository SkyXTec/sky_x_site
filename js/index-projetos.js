// index-projetos.js — Carrega projetos dinamicamente na seção portfólio do index
document.addEventListener('DOMContentLoaded', async function () {
  const grid = document.querySelector('.projetos-grid');
  if (!grid) return;

  try {
    const res = await fetch('api/projetos.php');
    if (!res.ok) return;
    const projetos = await res.json();
    if (!Array.isArray(projetos) || projetos.length === 0) return; // mantém estático

    grid.innerHTML = '';

    // Exibe o primeiro projeto como card em destaque
    const p = projetos[0];
    const card = document.createElement('a');
    card.href = `portfolio-page.html#${p.id}`;
    card.className = 'projeto-card projeto-card-1';

    card.innerHTML = `
      ${p.capa_url ? `<img src="${p.capa_url}" alt="${esc(p.nome)}" loading="lazy" />` : ''}
      <div class="projeto-card-overlay">
        <span class="projeto-label">${esc(p.label || 'Projeto')}</span>
        <h3 class="projeto-nome">${esc(p.nome)}</h3>
      </div>
    `;
    grid.appendChild(card);
  } catch {
    // Mantém card estático em silêncio
  }

  function esc(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
});
