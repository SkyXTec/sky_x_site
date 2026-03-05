// js/portfolio-page.js — Portfólio dinâmico com scroll entre projetos

let projetos = [];
let currentIndex = 0;

document.addEventListener('DOMContentLoaded', async () => {
  await loadProjetos();
  initNavDots();
  initScrollObserver();
  initLightbox();
  initKeyboardNav();
  checkHashAndScroll();
});

// ── Carregar projetos da API ──────────────────────────────────────────────────
async function loadProjetos() {
  const wrap = document.getElementById('portfolioScrollWrap');
  try {
    const res = await fetch('api/projetos.php');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) {
      renderEmpty();
      return;
    }
    projetos = data;
    wrap.innerHTML = '';
    projetos.forEach((p, i) => wrap.appendChild(buildSlide(p, i)));
    updateCounter(0, projetos.length);
  } catch {
    renderError();
  }
}

// ── Construir slide de cada projeto ──────────────────────────────────────────
function buildSlide(p, index) {
  const slide = document.createElement('div');
  slide.className = 'portfolio-slide';
  slide.dataset.index = index;
  slide.id = `slide-${p.id}`;

  // Fundo com imagem de capa
  const bgHtml = p.capa_url
    ? `<div class="slide-bg"><img src="${p.capa_url}" alt="${esc(p.nome)}" loading="${index === 0 ? 'eager' : 'lazy'}" /><div class="slide-overlay"></div></div>`
    : `<div class="slide-bg slide-bg-fallback"><div class="slide-overlay"></div></div>`;

  // Items da galeria
  const galeriaHtml = buildGaleriaHtml(p);

  slide.innerHTML = `
    ${bgHtml}
    <div class="portfolio-container">
      <div class="project-info">
        <div class="project-badge">
          ${p.ano ? `<span class="project-year">${p.ano}</span><span class="badge-divider"></span>` : ''}
          <span class="project-client">${p.cliente ? 'CLIENTE: ' + esc(p.cliente) : esc(p.label || 'Projeto')}</span>
        </div>
        <h2 class="project-title">${esc(p.nome)}</h2>
        ${p.descricao ? `<div class="project-description"><p>${esc(p.descricao)}</p></div>` : ''}
        ${p.detalhes ? `<div class="project-details"><p>${esc(p.detalhes)}</p></div>` : ''}
      </div>
      ${galeriaHtml}
    </div>
    ${index < projetos.length - 1 ? '<div class="slide-scroll-hint"><span></span></div>' : ''}
  `;

  // Clique simples em imagem → troca background do slide
  slide
    .querySelectorAll('.gallery-item[data-tipo="imagem"]')
    .forEach((item) => {
      item.addEventListener('click', () => {
        const bgImg = slide.querySelector('.slide-bg img');
        if (bgImg && item.dataset.src) bgImg.src = item.dataset.src;
        slide
          .querySelectorAll('.gallery-item')
          .forEach((i) => i.classList.remove('featured'));
        item.classList.add('featured');
      });
      // Duplo clique → lightbox
      item.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        openImageLightbox(item.dataset.src, p.nome);
      });
    });

  // Vídeo → lightbox ao clicar
  slide.querySelectorAll('.gallery-item[data-tipo="video"]').forEach((item) => {
    item.addEventListener('click', () => openVideoLightbox(item.dataset.video));
  });

  return slide;
}

function buildGaleriaHtml(p) {
  if (!p.galeria || p.galeria.length === 0) return '';
  const items = p.galeria
    .map((g, gi) => {
      const featured = gi === 0 ? ' featured' : '';
      if (g.tipo === 'video') {
        return `<div class="gallery-item${featured}" data-video="${esc(g.url)}" data-tipo="video">
        <div class="gallery-video-thumb"><div class="gallery-play-icon">▶</div></div>
      </div>`;
      }
      return `<div class="gallery-item${featured}" data-src="${esc(g.url)}" data-tipo="imagem">
      <img src="${esc(g.url)}" alt="${esc(p.nome)}" loading="lazy" />
    </div>`;
    })
    .join('');
  return `<div class="project-gallery">
    <h3 class="gallery-title">Galeria</h3>
    <div class="gallery-grid">${items}</div>
  </div>`;
}

// ── Dots de navegação ─────────────────────────────────────────────────────────
function initNavDots() {
  const nav = document.getElementById('projectDotsNav');
  if (!nav) return;
  nav.innerHTML = '';
  projetos.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'project-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Projeto ${i + 1}`);
    dot.addEventListener('click', () => scrollToSlide(i));
    nav.appendChild(dot);
  });
}

function updateNavDots(index) {
  document.querySelectorAll('.project-dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === index);
  });
}

function scrollToSlide(index) {
  const wrap = document.getElementById('portfolioScrollWrap');
  const slides = wrap.querySelectorAll('.portfolio-slide');
  if (slides[index]) slides[index].scrollIntoView({ behavior: 'smooth' });
}

// ── IntersectionObserver → detecta slide ativo ───────────────────────────────
function initScrollObserver() {
  const wrap = document.getElementById('portfolioScrollWrap');
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
          const index = parseInt(entry.target.dataset.index, 10);
          if (!isNaN(index)) {
            currentIndex = index;
            updateNavDots(index);
            updateCounter(index, projetos.length);
          }
        }
      });
    },
    { root: wrap, threshold: 0.5 },
  );

  wrap
    .querySelectorAll('.portfolio-slide')
    .forEach((slide) => observer.observe(slide));
}

// ── Navegação por teclado ─────────────────────────────────────────────────────
function initKeyboardNav() {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'PageDown') {
      e.preventDefault();
      scrollToSlide(Math.min(currentIndex + 1, projetos.length - 1));
    } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
      e.preventDefault();
      scrollToSlide(Math.max(currentIndex - 1, 0));
    }
  });
}

// ── Contador de projetos ──────────────────────────────────────────────────────
function updateCounter(index, total) {
  const curr = document.getElementById('currentProjectNum');
  const tot = document.getElementById('totalProjectNum');
  if (curr) curr.textContent = String(index + 1).padStart(2, '0');
  if (tot) tot.textContent = String(total).padStart(2, '0');
}

// ── Hash → rola para o projeto correto no carregamento ───────────────────────
function checkHashAndScroll() {
  const hash = window.location.hash.replace('#', '');
  if (!hash) return;
  const slide = document.getElementById(`slide-${hash}`);
  if (slide)
    setTimeout(() => slide.scrollIntoView({ behavior: 'smooth' }), 150);
}

// ── Lightbox ──────────────────────────────────────────────────────────────────
function initLightbox() {
  const lb = document.getElementById('lightbox');
  const closeBtn = document.getElementById('lightboxClose');
  if (!lb || !closeBtn) return;
  closeBtn.onclick = closeLightbox;
  lb.addEventListener('click', (e) => {
    if (e.target === lb) closeLightbox();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
  });
}

function openImageLightbox(src, alt) {
  const content = document.getElementById('lightboxContent');
  content.innerHTML = `
    <span class="lightbox-close" id="lightboxClose">&times;</span>
    <img src="${esc(src)}" alt="${esc(alt || '')}" />
  `;
  content.querySelector('#lightboxClose').onclick = closeLightbox;
  document.getElementById('lightbox').style.display = 'flex';
}

function openVideoLightbox(url) {
  const content = document.getElementById('lightboxContent');
  let embedHtml;
  const yt = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  );
  const vm = url.match(/vimeo\.com\/(\d+)/);
  if (yt) {
    embedHtml = `<iframe src="https://www.youtube.com/embed/${yt[1]}?autoplay=1" frameborder="0" allowfullscreen allow="autoplay; encrypted-media"></iframe>`;
  } else if (vm) {
    embedHtml = `<iframe src="https://player.vimeo.com/video/${vm[1]}?autoplay=1" frameborder="0" allowfullscreen allow="autoplay"></iframe>`;
  } else {
    embedHtml = `<video src="${esc(url)}" controls autoplay></video>`;
  }
  content.innerHTML = `
    <span class="lightbox-close" id="lightboxClose">&times;</span>
    <div class="lightbox-video-wrap">${embedHtml}</div>
  `;
  content.querySelector('#lightboxClose').onclick = closeLightbox;
  document.getElementById('lightbox').style.display = 'flex';
}

function closeLightbox() {
  const lb = document.getElementById('lightbox');
  lb.style.display = 'none';
  document.getElementById('lightboxContent').innerHTML =
    '<span class="lightbox-close" id="lightboxClose">&times;</span>';
  document.getElementById('lightboxClose').onclick = closeLightbox;
}

// ── Estados vazios / erro ─────────────────────────────────────────────────────
function renderEmpty() {
  document.getElementById('portfolioScrollWrap').innerHTML = `
    <div class="portfolio-empty">
      <p>Nenhum projeto publicado ainda.</p>
      <a href="index.html" class="back-link">← Voltar ao início</a>
    </div>`;
  document.getElementById('projectDotsNav').innerHTML = '';
}

function renderError() {
  document.getElementById('portfolioScrollWrap').innerHTML = `
    <div class="portfolio-empty"><p>Erro ao carregar projetos. Tente novamente.</p></div>`;
}

// ── Utilitário ────────────────────────────────────────────────────────────────
function esc(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
