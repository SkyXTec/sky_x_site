// JavaScript para página legal

document.addEventListener("DOMContentLoaded", () => {
  console.log("Página legal carregada");

  // Sistema de abas
  initTabNavigation();
  
  // Inicializar com aba correta baseada na hash da URL
  initializeActiveTab();
});

function initTabNavigation() {
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('.legal-section');
  
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href').replace('#', '');
      
      // Remover active de todos os links e seções
      navLinks.forEach(l => l.classList.remove('active'));
      sections.forEach(s => s.classList.remove('active'));
      
      // Adicionar active no link clicado e seção correspondente
      link.classList.add('active');
      const targetSection = document.getElementById(targetId);
      if (targetSection) {
        targetSection.classList.add('active');
      }
      
      // Atualizar hash na URL sem scroll
      history.pushState(null, null, `#${targetId}`);
      
      // Scroll suave para o topo da página (GSAP)
      if (typeof gsap !== 'undefined') {
        gsap.to(window, { duration: 0.8, scrollTo: 0, ease: "power2.inOut" });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  });
}

function initializeActiveTab() {
  const hash = window.location.hash.replace('#', '') || 'privacidade';
  const sections = document.querySelectorAll('.legal-section');
  const navLinks = document.querySelectorAll('.nav-link');
  
  // Remover active de tudo
  sections.forEach(s => s.classList.remove('active'));
  navLinks.forEach(l => l.classList.remove('active'));
  
  // Ativar seção e link correspondente
  const activeSection = document.getElementById(hash);
  const activeLink = document.querySelector(`.nav-link[href="#${hash}"]`);
  
  if (activeSection && activeLink) {
    activeSection.classList.add('active');
    activeLink.classList.add('active');
  } else {
    // Fallback para primeira seção
    sections[0]?.classList.add('active');
    navLinks[0]?.classList.add('active');
  }
}
