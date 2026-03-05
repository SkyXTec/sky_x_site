// index-parceiros.js — Carrega logos de parceiros dinamicamente da API
document.addEventListener('DOMContentLoaded', async function () {
  const container = document.getElementById('parceiro-cards');
  if (!container) return;

  try {
    const res = await fetch('api/parceiros.php');
    if (!res.ok) return; // mantém estáticos em caso de erro HTTP
    const parceiros = await res.json();
    if (!Array.isArray(parceiros) || parceiros.length === 0) return; // fallback estático

    // Substitui cards estáticos pelos dinâmicos
    container.innerHTML = '';
    parceiros.forEach((p, i) => {
      const delay = i === 0 ? '' : ` scroll-delay-${Math.min(i * 200, 600)}`;
      const div = document.createElement('div');
      div.className = `parceiro-card scroll-scale-in${delay}`;
      const img = document.createElement('img');
      img.src = p.img_url;
      img.alt = p.nome;
      img.loading = 'lazy';
      div.appendChild(img);
      container.appendChild(div);
    });
  } catch {
    // Mantém cards estáticos em silêncio
  }
});
