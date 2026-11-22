function applyBackground(data) {
  const videoEl = document.getElementById('bg-video');
  const imgEl = document.getElementById('bg-image');
  if (!videoEl || !imgEl) return;

  if (data.bgVideoUrl) {
    videoEl.src = data.bgVideoUrl;
    videoEl.style.display = 'block';
    imgEl.style.display = 'none';
  } else {
    videoEl.style.display = 'none';
    if (data.bgImageUrl) {
      imgEl.style.backgroundImage = `url("${data.bgImageUrl}")`;
      imgEl.style.display = 'block';
    } else {
      imgEl.style.display = 'none';
    }
  }
}

async function initGate() {
  const res = await fetch('./members.json');
  const data = await res.json();

  applyBackground(data);

  document.title = `${data.groupName || 'GROUP'} — GATE`;
  document.getElementById('sub-title').textContent = data.subTitle || 'ROSTER';
  document.getElementById('group-name').textContent = data.groupName || 'GROUP';

  const partnersEl = document.getElementById('partners-list');
  partnersEl.innerHTML = (data.partners || [])
    .map(
      (p) => `
      <a class="partner-item" href="${p.url || '#'}" target="_blank" rel="noopener noreferrer">
        <span>${p.name}</span>
        <span class="partner-tag">${p.tag || 'Partner'}</span>
      </a>
    `
    )
    .join('');

  const socialsEl = document.getElementById('socials-box');
  const links = [];
  if (data.socials?.discord) links.push(`<a href="${data.socials.discord}" target="_blank" rel="noopener noreferrer">DISCORD</a>`);
  if (data.socials?.facebook) links.push(`<a href="${data.socials.facebook}" target="_blank" rel="noopener noreferrer">FACEBOOK</a>`);
  socialsEl.innerHTML = links.join('');

  const btn = document.getElementById('enter-btn');
  btn.addEventListener('click', () => {
    btn.disabled = true;
    btn.textContent = 'ACCESSING...';
    setTimeout(() => {
      btn.textContent = 'ACCESSING_YOU';
    }, 500);
    setTimeout(() => {
      window.location.href = 'members.html';
    }, 1050);
  });
}

initGate();