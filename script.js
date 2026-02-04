document.addEventListener("DOMContentLoaded", () => {
  const brilho1Elements = document.querySelectorAll(".brilho1");
  const brilho2Buttons = document.querySelectorAll(".brilho2 .btn-cta");
  
  brilho2Buttons.forEach((brilho2Button, index) => {
    const brilho1 = brilho1Elements[index];
    let timeoutId;
    
    if (brilho1 && brilho2Button) {
      brilho2Button.addEventListener("mousemove", (event) => {
        clearTimeout(timeoutId);
        brilho2Button.classList.add("hovering");
        
        const brilho1Rect = brilho1.getBoundingClientRect();
        const mouseX = event.clientX - brilho1Rect.left;
        const mousePercentage = Math.min(Math.max(mouseX / brilho1Rect.width, 0), 1);

        brilho1.style.setProperty("--before-opacity", mousePercentage.toFixed(2));
        brilho1.style.setProperty("--after-opacity", (1 - mousePercentage).toFixed(2));
        
        const buttonRect = brilho2Button.getBoundingClientRect();
        const relativeMouseX = event.clientX - buttonRect.left;
        const translateX = ((relativeMouseX / buttonRect.width) * 100) - 100;
        brilho2Button.style.setProperty("--button-translate-x", `${translateX}%`);
      });
      
      brilho2Button.addEventListener("mouseleave", () => {
        brilho2Button.classList.remove("hovering");
        timeoutId = setTimeout(() => {
          brilho1.style.setProperty("--before-opacity", "1");
          brilho1.style.setProperty("--after-opacity", "0");
          brilho2Button.style.setProperty("--button-translate-x", "-10%");
        }, 1200);
      });
    }
  });

  // Modal de Notícia
  const modal = document.getElementById('noticiaModal');
  const openModalBtn = document.getElementById('openModal');
  const closeModalBtn = document.querySelector('.modal-close');
  
  if (openModalBtn && modal && closeModalBtn) {
    // Abrir modal
    openModalBtn.addEventListener('click', () => {
      modal.style.display = 'block';
      document.body.style.overflow = 'hidden';
    });
    
    // Fechar modal ao clicar no X
    closeModalBtn.addEventListener('click', () => {
      modal.style.display = 'none';
      document.body.style.overflow = 'auto';
    });
    
    // Fechar modal ao clicar fora do conteúdo
    window.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
      }
    });
    
    // Fechar modal com tecla ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.style.display === 'block') {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
      }
    });
  }
});
