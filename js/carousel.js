// Carrossel de serviços
export function initCarousel() {
  const carouselTrack = document.querySelector('.carousel-track');
  const prevBtn = document.querySelector('.carousel-nav-prev');
  const nextBtn = document.querySelector('.carousel-nav-next');
  
  if (carouselTrack && prevBtn && nextBtn) {
    let currentPosition = 0;
    const cardWidth = 320;
    const gap = 32;
    const scrollAmount = cardWidth + gap;
    
    const updatePosition = () => {
      carouselTrack.style.transform = `translateX(-${currentPosition}px)`;
    };
    
    nextBtn.addEventListener('click', () => {
      const maxScroll = carouselTrack.scrollWidth - carouselTrack.parentElement.offsetWidth;
      if (currentPosition < maxScroll - scrollAmount) {
        currentPosition += scrollAmount;
      } else {
        currentPosition = 0;
      }
      updatePosition();
    });
    
    prevBtn.addEventListener('click', () => {
      if (currentPosition > 0) {
        currentPosition -= scrollAmount;
      } else {
        currentPosition = carouselTrack.scrollWidth - carouselTrack.parentElement.offsetWidth;
      }
      updatePosition();
    });
  }
}
