document.addEventListener('DOMContentLoaded', () => {
  const videoListContainer = document.getElementById('video-list-container');
  if (!videoListContainer) return; 

  const mainFrame = document.getElementById('main-video-frame');
  const mainTitle = document.getElementById('video-title');
  
  const cloudflareCustomerDomain = "https://customer-wq1ka1uuw98wqbst.cloudflarestream.com";

  fetch('api/get-streams.php')
    .then(response => response.json())
    .then(data => {
      videoListContainer.innerHTML = '';

      if (!data.success || !data.result) {
        videoListContainer.innerHTML = '<p style="color:white;">Nenhum vídeo salvo.</p>';
        return;
      }

      data.result.forEach(video => {
        const thumbnailUrl = `${cloudflareCustomerDomain}/${video.uid}/thumbnails/thumbnail.jpg`;
        const iframeUrl = `${cloudflareCustomerDomain}/${video.uid}/iframe`;
        
        const date = new Date(video.created).toLocaleDateString('pt-BR');
        const durationMins = Math.round(video.duration / 60);

        const card = document.createElement('div');
        card.className = 'video-cardItem';
        card.innerHTML = `
          <img src="${thumbnailUrl}" alt="${video.meta.name || 'Gravação'}">
          <div class="video-cardItem-info">
            <h4>${video.meta.name || 'Voo sem nome'}</h4>
            <p>${date} • ${durationMins} min</p>
          </div>
        `;

        card.addEventListener('click', () => {
          mainFrame.src = iframeUrl;
          mainTitle.innerText = video.meta.name || 'Gravação Arquivada';
        });

        videoListContainer.appendChild(card);
      });
    })
    .catch(error => {
      console.error('Erro:', error);
      videoListContainer.innerHTML = '<p style="color:white;">Erro ao carregar gravações.</p>';
    });
});