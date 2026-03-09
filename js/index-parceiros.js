// index-parceiros.js — Carrega logos de parceiros dinamicamente da API
document.addEventListener('DOMContentLoaded', async function () {
  const container = document.getElementById('parceiro-cards');
  if (!container) return;

  try {
    const res = await fetch('api/parceiros.php');
    if (!res.ok) throw new Error('Falha na API');
    const parceiros = await res.json();

    // Se a API não tiver registros, injeta de volta os fixos? Não, o usuário pediu
    // dinamicamente pela API. Vamos exibir se tivermos, se não ficará vazio.
    // Mas para garantir caso o usuário não tenha cadastrado nada,
    // não vamos preencher nada se for array vazio (o comportamento normal).

    // Mas vamos sempre limpar o HTML de dentro do container para renderizar os novos reais
    container.innerHTML = '';

    if (!Array.isArray(parceiros) || parceiros.length === 0) {
      return; // Fica sem cards porque nenhum parceiro está no DB
    }

    // Mata a ScrollTrigger antiga vinculada ao container, se existir
    if (typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.getAll().forEach((t) => {
        if (
          t.trigger &&
          (t.trigger === container || t.trigger.id === 'parceiro-cards')
        ) {
          t.kill();
        }
      });
    }

    parceiros.forEach((p, i) => {
      const div = document.createElement('div');
      div.className = 'parceiro-card';
      const img = document.createElement('img');
      // Assume a url base caso não venha pronta
      img.src = p.img_url || `api/get-imagem.php?id=${p.img_id}`;
      img.alt = p.nome;
      img.loading = 'lazy';
      div.appendChild(img);
      container.appendChild(div);
    });

    // Se o GSAP estiver disponível, aplica a animação com stagger (delay em cada um)
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      const newCards = container.querySelectorAll('.parceiro-card');
      if (newCards.length > 0) {
        gsap.fromTo(
          newCards,
          { y: 50, opacity: 0, scale: 0.9, visibility: 'hidden' },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            visibility: 'visible',
            duration: 0.8,
            stagger: 0.2, // Um de cada vez com delay de 200ms
            ease: 'back.out(1.2)',
            scrollTrigger: {
              trigger: container,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
          },
        );
        ScrollTrigger.refresh();
      }
    } else {
      // Fallback sem GSAP: aplica classes CSS manuais
      container.querySelectorAll('.parceiro-card').forEach((el, i) => {
        el.classList.add('scroll-scale-in');
        if (i > 0) el.classList.add(`delay-${Math.min(i * 200, 1200)}`);
        // Para garantir que apareçam
        el.style.visibility = 'visible';
        el.style.opacity = '1';
      });
    }
  } catch (err) {
    console.warn('Erro ao carregar parceiros dinâmicos:', err);
  }
});
