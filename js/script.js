

// Smooth scroll para os links de navegação
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Adicionar classe ativa no scroll
window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    if (window.scrollY > 100) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// Animações de entrada
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
        }
    });
}, observerOptions);

// Observar elementos que devem ter animação
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.hero-content, .footer-hero-right');
    animatedElements.forEach(el => observer.observe(el));

    // Navegação do Carrossel de Serviços
    const carouselTrack = document.querySelector('.carousel-track');
    const prevBtn = document.querySelector('.carousel-nav-prev');
    const nextBtn = document.querySelector('.carousel-nav-next');
    
    if (carouselTrack && prevBtn && nextBtn) {
        let currentPosition = 0;
        const cardWidth = 320; // Largura do card
        const gap = 32; // Gap entre cards (2rem = 32px)
        const scrollAmount = cardWidth + gap;
        
        // Função para atualizar a posição
        const updatePosition = () => {
            carouselTrack.style.transform = `translateX(-${currentPosition}px)`;
        };
        
        // Botão próximo
        nextBtn.addEventListener('click', () => {
            const maxScroll = carouselTrack.scrollWidth - carouselTrack.parentElement.offsetWidth;
            if (currentPosition < maxScroll - scrollAmount) {
                currentPosition += scrollAmount;
            } else {
                currentPosition = 0; // Volta ao início
            }
            updatePosition();
        });
        
        // Botão anterior
        prevBtn.addEventListener('click', () => {
            if (currentPosition > 0) {
                currentPosition -= scrollAmount;
            } else {
                // Vai para o final
                currentPosition = carouselTrack.scrollWidth - carouselTrack.parentElement.offsetWidth;
            }
            updatePosition();
        });
        
        // Auto-play opcional (comentado por padrão)
        // setInterval(() => {
        //     nextBtn.click();
        // }, 5000);
    }

    // Modal de Notícia
    const modal = document.getElementById('noticiaModal');
    const openModalBtn = document.getElementById('openModal');
    const closeModalBtn = document.querySelector('.modal-close');
    
    if (openModalBtn && modal && closeModalBtn) {
        // Abrir modal
        openModalBtn.addEventListener('click', () => {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden'; // Previne scroll da página
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
