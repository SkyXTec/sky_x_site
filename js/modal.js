// Modal de notícias
export function initModal() {
  const modal = document.getElementById('noticiaModal');
  const openModalBtn = document.getElementById('openModal');
  const closeModalBtn = document.querySelector('.modal-close');
  
  if (openModalBtn && modal && closeModalBtn) {
    openModalBtn.addEventListener('click', () => {
      modal.style.display = 'block';
      document.body.style.overflow = 'hidden';
    });
    
    closeModalBtn.addEventListener('click', () => {
      modal.style.display = 'none';
      document.body.style.overflow = 'auto';
    });
    
    window.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
      }
    });
    
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.style.display === 'block') {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
      }
    });
  }
}
