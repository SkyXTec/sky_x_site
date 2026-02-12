// JavaScript para página de portfólio

document.addEventListener("DOMContentLoaded", () => {
  console.log("Página de portfólio carregada");

  // Troca de imagem de fundo ao clicar na galeria
  initBackgroundSwitch();
  
  // Adicionar lightbox para galeria (opcional)
  initGalleryLightbox();
});

function initBackgroundSwitch() {
  const portfolioPage = document.getElementById('portfolioPage');
  const galleryItems = document.querySelectorAll('.gallery-item');
  
  galleryItems.forEach((item) => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      if (img && img.src) {
        // Atualiza a variável CSS com a nova imagem
        const imagePath = img.src.replace(window.location.origin + '/', '');
        portfolioPage.style.setProperty('--bg-image', `url('${imagePath}')`);
        
        // Remove a classe 'featured' de todos e adiciona ao clicado
        galleryItems.forEach(i => i.classList.remove('featured'));
        item.classList.add('featured');
        
        console.log('Imagem de fundo alterada:', imagePath);
      }
    });
  });
}

function initGalleryLightbox() {
  const galleryItems = document.querySelectorAll('.gallery-item');
  
  galleryItems.forEach((item) => {
    // Duplo clique abre lightbox
    item.addEventListener('dblclick', (e) => {
      e.stopPropagation();
      const img = item.querySelector('img');
      if (img && img.src) {
        openLightbox(img.src, img.alt);
      }
    });
  });
}

function openLightbox(imageSrc, imageAlt) {
  // Criar lightbox simples
  const lightbox = document.createElement('div');
  lightbox.className = 'lightbox';
  lightbox.innerHTML = `
    <div class="lightbox-content">
      <span class="lightbox-close">&times;</span>
      <img src="${imageSrc}" alt="${imageAlt}" loading="lazy">
    </div>
  `;
  
  document.body.appendChild(lightbox);
  
  // Fechar ao clicar no X ou fora da imagem
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox || e.target.classList.contains('lightbox-close')) {
      lightbox.remove();
    }
  });
  
  // Fechar com ESC
  document.addEventListener('keydown', function closeOnEsc(e) {
    if (e.key === 'Escape') {
      lightbox.remove();
      document.removeEventListener('keydown', closeOnEsc);
    }
  });
}
