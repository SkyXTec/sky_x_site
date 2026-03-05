/**
 * dashboard.js — Navegação interna e utilitários do dashboard
 */

document.addEventListener('DOMContentLoaded', function () {
  setCurrentDate();
  initNavigation();
  initActiveViewFromHash();
  setTimeout(() => {
    document.querySelectorAll('.btn-delete').forEach((btn) => {
      btn.style.display = 'inline-block';
    });
  }, 100);

  // Botão "Ver todas" das mensagens no overview
  const verTodasMsg = document.querySelector(
    '.last-messages .section-link[data-view="mensagens"]',
  );
  if (verTodasMsg) {
    verTodasMsg.addEventListener('click', function (e) {
      e.preventDefault();
      const navMensagens = document.querySelector(
        '.sidebar-nav .nav-item[data-view="mensagens"]',
      );
      if (navMensagens) navMensagens.click();
    });
  }
});

// ── Data dinâmica ─────────────────────────────────────────────────────────────
function setCurrentDate() {
  const el = document.getElementById('currentDate');
  if (!el) return;

  const now = new Date();
  const dias = [
    'Domingo',
    'Segunda',
    'Terça',
    'Quarta',
    'Quinta',
    'Sexta',
    'Sábado',
  ];
  const meses = [
    'jan',
    'fev',
    'mar',
    'abr',
    'mai',
    'jun',
    'jul',
    'ago',
    'set',
    'out',
    'nov',
    'dez',
  ];

  const diaSemana = dias[now.getDay()];
  const dia = now.getDate();
  const mes = meses[now.getMonth()];
  const ano = now.getFullYear();

  el.textContent = `${diaSemana}, ${dia} ${mes}. ${ano}`;
}

// ── Navegação interna (padrão legal.js) ───────────────────────────────────────
function initNavigation() {
  const navLinks = document.querySelectorAll('.sidebar-nav .nav-item');
  const views = document.querySelectorAll('.dash-view');
  const pageTitle = document.getElementById('pageTitle');

  navLinks.forEach((link) => {
    link.addEventListener('click', function (e) {
      e.preventDefault();

      const target = this.getAttribute('data-view');
      if (!target) return;

      // Atualiza links
      navLinks.forEach((l) => l.parentElement.classList.remove('active'));
      this.parentElement.classList.add('active');

      // Atualiza views
      views.forEach((v) => v.classList.remove('active'));
      const targetView = document.querySelector(
        `.dash-view[data-view="${target}"]`,
      );
      if (targetView) targetView.classList.add('active');

      // Atualiza título e hash
      if (pageTitle)
        pageTitle.textContent = this.getAttribute('data-label') || target;
      history.pushState(null, null, `#${target}`);

      // Scroll para o topo
      const main = document.querySelector('.main-content');
      if (main) main.scrollTo({ top: 0, behavior: 'smooth' });

      // Atualiza conteúdo da view ativada
      if (
        target === 'noticias' &&
        typeof window.renderNoticiasList === 'function'
      )
        window.renderNoticiasList();
      if (
        target === 'overview' &&
        typeof window.updateOverviewNoticias === 'function'
      )
        window.updateOverviewNoticias();
      if (
        target === 'parceiros' &&
        typeof window.renderParceirosList === 'function'
      )
        window.renderParceirosList();
      if (
        target === 'projetos' &&
        typeof window.renderProjetosList === 'function'
      )
        window.renderProjetosList();
    });
  });
}

function initActiveViewFromHash() {
  const hash = window.location.hash.replace('#', '') || 'overview';
  const link = document.querySelector(
    `.sidebar-nav .nav-item[data-view="${hash}"]`,
  );
  if (link) link.click();
}

let messages = [];

async function fetchMessages() {
  try {
    const res = await fetch('api/mensagens.php');
    if (!res.ok) throw new Error('Erro ao buscar mensagens');
    messages = await res.json();
  } catch (e) {
    messages = [];
    console.error(e);
  }
}

function renderMessages(tab) {
  const list = document.getElementById('messages-list');
  list.innerHTML = '';
  const filtered = messages.filter((m) => m.status === tab);
  if (filtered.length === 0) {
    list.innerHTML = '<p>Nenhuma mensagem nesta categoria.</p>';
    return;
  }
  const template = document.getElementById('message-template');
  if (!template) {
    list.innerHTML =
      '<p class="msg-template-error">Erro: Template de mensagem não encontrado no HTML.</p>';
    return;
  }
  filtered.forEach((msg) => {
    const card = template.cloneNode(true);
    card.id = '';
    card.style.display = '';
    // Preenchimento seguro
    const nameEl = card.querySelector('.msg-name');
    const emailEl = card.querySelector('.msg-email');
    const dateEl = card.querySelector('.msg-date');
    const subjectEl = card.querySelector('.msg-subject');
    const bodyEl = card.querySelector('.msg-body');
    if (nameEl) {
      nameEl.textContent = msg.nome;
      // Email e telefone juntos
      let infoDiv = card.querySelector('.msg-info-extra');
      if (!infoDiv) {
        infoDiv = document.createElement('div');
        infoDiv.className = 'msg-info-extra';
        nameEl.insertAdjacentElement('afterend', infoDiv);
      }
      // Email
      let emailSpan = card.querySelector('.msg-email');
      if (!emailSpan) {
        emailSpan = document.createElement('span');
        emailSpan.className = 'msg-email';
      }
      emailSpan.textContent = msg.email || '';
      // Telefone
      let phoneSpan = card.querySelector('.msg-phone');
      if (!phoneSpan) {
        phoneSpan = document.createElement('span');
        phoneSpan.className = 'msg-phone';
      }
      phoneSpan.textContent = msg.telefone || '';
      // Adiciona ambos na infoDiv
      infoDiv.innerHTML = '';
      infoDiv.appendChild(emailSpan);
      infoDiv.appendChild(phoneSpan);
    }
    // Data formatada
    if (dateEl) {
      let msgDt;
      if (
        typeof msg.data === 'string' &&
        msg.data.match(/^\d{4}-\d{2}-\d{2}T/)
      ) {
        msgDt = new Date(msg.data);
      } else if (msg.data instanceof Date) {
        msgDt = msg.data;
      } else {
        msgDt = new Date(msg.data);
      }
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const msgDay = new Date(
        msgDt.getFullYear(),
        msgDt.getMonth(),
        msgDt.getDate(),
      );
      const diffDays = Math.round((today - msgDay) / (24 * 60 * 60 * 1000));
      const hora = msgDt.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
      if (diffDays === 0) {
        dateEl.textContent = hora;
      } else if (diffDays === 1) {
        dateEl.textContent = `ontem ${hora}`;
      } else {
        const meses = [
          'Jan',
          'Fev',
          'Mar',
          'Abr',
          'Mai',
          'Jun',
          'Jul',
          'Ago',
          'Set',
          'Out',
          'Nov',
          'Dez',
        ];
        dateEl.textContent = `${msgDt.getDate()} de ${meses[msgDt.getMonth()]}`;
      }
    }
    if (subjectEl) subjectEl.textContent = msg.assunto;
    if (bodyEl) bodyEl.textContent = msg.mensagem;

    // Botões
    const btnAnswered = card.querySelector('.btn-answered');
    const btnArchived = card.querySelector('.btn-archived');
    const btnUnarchive = card.querySelector('.btn-unarchive');
    const btnDelete = card.querySelector('.btn-delete');
    const btnMarkUnread = card.querySelector('.btn-mark-unread');

    // Exibir/ocultar botões conforme status
    if (msg.status === 'unread') {
      if (btnAnswered) btnAnswered.style.display = '';
      if (btnArchived) btnArchived.style.display = '';
      if (btnUnarchive) btnUnarchive.style.display = 'none';
      if (btnDelete) btnDelete.style.display = 'none';
      if (btnMarkUnread) btnMarkUnread.style.display = 'none';
    } else if (msg.status === 'answered') {
      if (btnAnswered) btnAnswered.style.display = 'none';
      if (btnArchived) btnArchived.style.display = '';
      if (btnUnarchive) btnUnarchive.style.display = 'none';
      if (btnDelete) btnDelete.style.display = '';
      if (btnMarkUnread) btnMarkUnread.style.display = '';
    } else if (msg.status === 'archived') {
      if (btnAnswered) btnAnswered.style.display = 'none';
      if (btnArchived) btnArchived.style.display = 'none';
      if (btnUnarchive) btnUnarchive.style.display = '';
      if (btnDelete) btnDelete.style.display = '';
      if (btnMarkUnread) btnMarkUnread.style.display = 'none';
    }

    // Ações dos botões (com log para depuração)
    if (btnAnswered)
      btnAnswered.onclick = () => {
        console.log('Botão: answered', msg.id);
        markAs('answered', msg.id);
      };
    if (btnArchived)
      btnArchived.onclick = () => {
        console.log('Botão: archived', msg.id);
        markAs('archived', msg.id);
      };
    if (btnUnarchive)
      btnUnarchive.onclick = () => {
        console.log('Botão: unarchive', msg.id);
        markAs('answered', msg.id);
      };
    if (btnMarkUnread)
      btnMarkUnread.onclick = () => {
        console.log('Botão: unread', msg.id);
        markAs('unread', msg.id);
      };

    list.appendChild(card);
  });
}

window.markAs = async function (status, id) {
  const msg = messages.find((m) => m.id === id);
  if (!msg) return;
  console.log('[markAs] Enviando update:', { id, status });
  try {
    const res = await fetch('api/update_mensagem.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    console.log('[markAs] Status HTTP:', res.status);
    let data = null;
    try {
      data = await res.json();
    } catch (err) {
      console.error('[markAs] Erro ao parsear JSON:', err);
      const text = await res.text();
      console.error('[markAs] Resposta bruta:', text);
      alert('Resposta inválida do servidor ao atualizar mensagem.');
      return;
    }
    console.log('[markAs] Resposta da API:', data);
    if (!data.success) {
      alert(
        'Erro ao atualizar mensagem: ' + (data.error || 'Erro desconhecido.'),
      );
      return;
    }
    msg.status = status;
    // Atualiza a aba atual
    const activeTab = document.querySelector('.tab.active').dataset.tab;
    renderMessages(activeTab);
    updateOverviewMessages();
  } catch (e) {
    console.error('[markAs] Erro de conexão:', e);
    alert('Erro de conexão ao atualizar mensagem.');
  }
};

document.querySelectorAll('.tab').forEach((tab) => {
  tab.addEventListener('click', function () {
    document
      .querySelectorAll('.tab')
      .forEach((t) => t.classList.remove('active'));
    this.classList.add('active');
    renderMessages(this.dataset.tab);
  });
});

function updateOverviewMessages() {
  // Atualiza o contador de mensagens novas no overview
  const metricLabel = Array.from(
    document.querySelectorAll('.metric-label'),
  ).find((el) => el.textContent.includes('Mensagens Novas'));
  if (metricLabel) {
    const value = metricLabel.parentElement.querySelector('.metric-value');
    if (value) {
      value.textContent = messages.filter((m) => m.status === 'unread').length;
    }
  }

  // Atualiza a seção de últimas mensagens no overview
  const grid = document.querySelector(
    '.dash-view[data-view="overview"] .messages-grid',
  );
  if (grid) {
    // Limpa mensagens antigas
    grid.innerHTML = '';
    // Ordena por data decrescente (assumindo campo msg.data no formato ISO ou similar)
    const sorted = [...messages].sort(
      (a, b) => new Date(b.data) - new Date(a.data),
    );
    // Pega as 3 mais recentes
    sorted.slice(0, 3).forEach((msg) => {
      const card = document.createElement('div');
      card.className =
        'message-card' + (msg.status === 'unread' ? ' unread' : '');
      // Formatação da data
      let msgDate = '';
      if (msg.data) {
        let msgDt;
        if (
          typeof msg.data === 'string' &&
          msg.data.match(/^\d{4}-\d{2}-\d{2}T/)
        ) {
          msgDt = new Date(msg.data);
        } else if (msg.data instanceof Date) {
          msgDt = msg.data;
        } else {
          msgDt = new Date(msg.data);
        }
        const now = new Date();
        const today = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
        );
        const msgDay = new Date(
          msgDt.getFullYear(),
          msgDt.getMonth(),
          msgDt.getDate(),
        );
        const diffDays = Math.round((today - msgDay) / (24 * 60 * 60 * 1000));
        const hora = msgDt.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        });
        if (diffDays === 0) {
          msgDate = hora;
        } else if (diffDays === 1) {
          msgDate = `ontem ${hora}`;
        } else {
          const meses = [
            'Jan',
            'Fev',
            'Mar',
            'Abr',
            'Mai',
            'Jun',
            'Jul',
            'Ago',
            'Set',
            'Out',
            'Nov',
            'Dez',
          ];
          msgDate = `${msgDt.getDate()} de ${meses[msgDt.getMonth()]}`;
        }
      }
      // Email e telefone juntos
      let infoHtml = `<div class="msg-info-extra">
                <span class="msg-email">${msg.email || ''}</span>
                <span class="msg-phone">${msg.telefone || ''}</span>
            </div>`;
      card.innerHTML = `
                <div class="message-header">
                    <div class="message-avatar">${(msg.nome || '')[0] || '?'}</div>
                    <div class="message-meta">
                        <span class="message-sender">${msg.nome || 'Anônimo'}</span>
                        <span class="message-time">${msgDate}</span>
                    </div>
                    ${msg.status === 'unread' ? '<span class="unread-dot"></span>' : ''}
                </div>
                <h3 class="message-subject">${msg.assunto || ''}</h3>
                <p class="message-preview">${msg.mensagem ? msg.mensagem.substring(0, 80) : ''}</p>
                ${infoHtml}
            `;
      grid.appendChild(card);
    });
  }
}

// Inicialização dinâmica
fetchMessages().then(() => {
  renderMessages('unread');
  updateOverviewMessages();
});
