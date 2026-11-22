let allMembers = [];
let selectedRole = 'ALL';
let searchQuery = '';
let siteLogoUrl = '';

const roleOrder = ['Founder', 'Leader', 'Member'];

function pad2(num) {
  return String(num).padStart(2, '0');
}

function formatPluralRole(role) {
  const upper = role.toUpperCase();
  if (upper.endsWith('S')) return upper;
  return `${upper}S`;
}

function getInitials(name = '') {
  return name.trim().slice(0, 2).toUpperCase() || 'UG';
}

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

function getOrderedRoles(members) {
  const uniqueRoles = [...new Set(members.map((m) => m.role).filter(Boolean))];
  return uniqueRoles.sort((a, b) => {
    const ia = roleOrder.indexOf(a);
    const ib = roleOrder.indexOf(b);
    if (ia !== -1 && ib !== -1) return ia - ib;
    if (ia !== -1) return -1;
    if (ib !== -1) return 1;
    return a.localeCompare(b);
  });
}

function renderFilters(roles) {
  const container = document.getElementById('role-filters');

  const buttonsHtml = roles
    .map((role) => {
      const count = allMembers.filter((m) => m.role === role).length;
      const isActive = selectedRole === role;
      const badgeHtml = isActive ? `<span class="filter-count">${count}</span>` : '';
      return `
        <button class="filter-btn ${isActive ? 'active' : ''}" data-role="${role}">
          <span class="filter-role">${role.toUpperCase()}</span>
          ${badgeHtml}
        </button>
      `;
    })
    .join('');

  const clearBtnHtml =
    selectedRole !== 'ALL' || searchQuery.trim() !== ''
      ? `<button id="clear-filter-btn" class="clear-btn" title="ล้างตัวกรอง">✕</button>`
      : '';

  container.innerHTML = `<div class="filter-group">${buttonsHtml}</div>${clearBtnHtml}`;

  container.querySelectorAll('.filter-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const clickedRole = btn.dataset.role;
      selectedRole = selectedRole === clickedRole ? 'ALL' : clickedRole;
      renderFilters(roles);
      renderSections(roles);
    });
  });

  const clearBtn = document.getElementById('clear-filter-btn');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      selectedRole = 'ALL';
      searchQuery = '';
      const searchEl = document.getElementById('search-input');
      if (searchEl) searchEl.value = '';
      renderFilters(roles);
      renderSections(roles);
    });
  }
}

function renderSections(roles) {
  const container = document.getElementById('roster-sections');
  const q = searchQuery.trim().toLowerCase();

  const filtered = allMembers.filter((m) => {
    const matchRole = selectedRole === 'ALL' || m.role === selectedRole;
    const matchText =
      !q ||
      (m.name && m.name.toLowerCase().includes(q)) ||
      (m.role && m.role.toLowerCase().includes(q)) ||
      (m.platform && m.platform.toLowerCase().includes(q));
    return matchRole && matchText;
  });

  const targetRoles = selectedRole === 'ALL' ? roles : [selectedRole];

  const html = targetRoles
    .map((role) => {
      const groupMembers = filtered.filter((m) => m.role === role);
      if (groupMembers.length === 0) return '';

      return `
        <section class="role-section">
          <h2 class="role-heading">
            <span>${formatPluralRole(role)}</span>
            <span class="role-slash">/</span>
            <span class="role-count">${pad2(groupMembers.length)}</span>
          </h2>
          <div class="cards-grid">
            ${groupMembers
              .map((m) => {
                const avatarSrc = m.avatar || siteLogoUrl;
                const avatarHtml = avatarSrc
                  ? `<img class="card-avatar-img" src="${avatarSrc}" alt="${m.name}" />`
                  : `<span>${getInitials(m.name)}</span>`;

                const platformLabel = `${(m.platform || 'FACEBOOK').toUpperCase()} ↗`;
                const fbUrl = m.facebook || m.fbUrl || '';
                const platformHtml = fbUrl
                  ? `<a class="card-platform card-platform-link" href="${fbUrl}" target="_blank" rel="noopener noreferrer">${platformLabel}</a>`
                  : `<span class="card-platform">${platformLabel}</span>`;

                return `
                  <article class="member-card" tabindex="0">
                    <div class="card-avatar">${avatarHtml}</div>
                    <div class="card-meta">
                      <div class="card-role">${(m.tag || m.role || 'MEMBER').toUpperCase()}</div>
                      <div class="card-name">${m.name}</div>
                      ${platformHtml}
                    </div>
                  </article>
                `;
              })
              .join('')}
          </div>
        </section>
      `;
    })
    .join('');

  container.innerHTML = html || '<p class="empty-msg">ไม่พบสมาชิกที่ค้นหา</p>';
}

async function initRoster() {
  const res = await fetch('./members.json');
  const data = await res.json();

  siteLogoUrl = data.logoUrl || '';
  document.title = `${data.groupName || 'ROSTER'} — MEMBERS`;
  applyBackground(data);
  allMembers = data.members || [];

  const roles = getOrderedRoles(allMembers);
  renderFilters(roles);
  renderSections(roles);

  document.getElementById('search-input').addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderFilters(roles);
    renderSections(roles);
  });
}

initRoster();