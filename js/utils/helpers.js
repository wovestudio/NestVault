// ================================================================
//  NestVault — Helper utilities
// ================================================================

/** Escape HTML special chars */
export function esc(s) {
  return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

/** Format price in Sri Lankan format */
export function fmtPrice(p) {
  return 'Rs.\u202f' + Number(p).toLocaleString('en-LK');
}

/** Relative time string */
export function timeAgo(ts) {
  const diff = Math.floor((Date.now() - new Date(ts)) / 1000);
  if (diff < 60)    return 'just now';
  if (diff < 3600)  return Math.floor(diff / 60)   + 'm ago';
  if (diff < 86400) return Math.floor(diff / 3600)  + 'h ago';
  return new Date(ts).toLocaleDateString('en-LK');
}

/** Property type emoji */
export function propEmoji(type) {
  return { House: '🏠', Apartment: '🏢', Land: '🌳', Commercial: '🏗️' }[type] ?? '🏠';
}

/** Show a toast notification */
export function toast(msg, type = 'info') {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.style.borderLeft =
    type === 'error'   ? '3px solid #ef4444' :
    type === 'success' ? '3px solid #22c55e' :
                         '3px solid #8b5cf6';
  el.classList.add('show');
  clearTimeout(el._timer);
  el._timer = setTimeout(() => el.classList.remove('show'), 3200);
}

/** Loading HTML snippet */
export function loadingHtml(msg = 'Loading…') {
  return `<div class="page-loading"><div class="spinner"></div><span>${esc(msg)}</span></div>`;
}

/** Standard property card HTML */
export function propCard(p, onclick) {
  const call = onclick ?? `router.navigate('property-detail', { id: '${p.id}' })`;
  const img = p.image1
    ? `<img src="${esc(p.image1)}" alt="" style="width:100%;height:100%;object-fit:cover;" onerror="this.style.display='none'">`
    : `<span style="font-size:52px">${propEmoji(p.property_type)}</span>`;
  return `
  <a href="#" onclick="${call};return false;" class="prop-card">
    <div class="prop-card-img">
      ${img}
      <span class="listing-badge ${p.status === 'Available' ? 'badge-sale' : 'badge-rent'}">${esc(p.status)}</span>
    </div>
    <div class="prop-card-body">
      <div class="prop-card-name">${esc(p.title)}</div>
      <div class="prop-card-loc">
        <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" fill="none" stroke-width="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
        <span>${esc(p.address)}</span>
      </div>
      <div class="prop-card-footer">
        <div class="prop-price">${fmtPrice(p.price)}</div>
        <div class="prop-tags"><span class="prop-tag">${esc(p.property_type)}</span></div>
      </div>
    </div>
  </a>`;
}

/** Nav HTML (shared across pages) */
export function navHtml(profile, user) {
  const role = profile?.role;
  return `
  <nav class="nav" id="main-nav">
    <a href="#" onclick="router.navigate('home');return false;" class="nav-logo">
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
        <path d="M3 12L13 3L23 12V22C23 22.5523 22.5523 23 22 23H16V17H10V23H4C3.44772 23 3 22.5523 3 22V12Z"
              fill="#8b5cf6" stroke="#8b5cf6" stroke-width="1.4" stroke-linejoin="round"/>
        <rect x="10" y="16" width="6" height="7" rx="1" fill="white" opacity=".22"/>
        <circle cx="19" cy="7" r="2.5" fill="#a78bfa" opacity=".75"/>
      </svg>
      Nest<span>Vault</span>
    </a>
    <div class="nav-links">
      <a href="#" onclick="router.navigate('home');return false;"       class="nav-link">Home</a>
      <a href="#" onclick="router.navigate('properties');return false;" class="nav-link">Properties</a>
      <a href="#" onclick="router.navigate('search');return false;"     class="nav-link">Search</a>
      ${role === 'SELLER' ? `
        <a href="#" onclick="router.navigate('seller-dashboard');return false;" class="nav-link">My Listings</a>` : ''}
      ${role === 'ADMIN' ? `
        <a href="#" onclick="router.navigate('admin');return false;"
           class="nav-link" style="color:#ef4444;font-weight:700">Admin Portal</a>` : ''}
    </div>
    <div class="nav-right">
      ${!user ? `
        <a href="#" onclick="router.navigate('login');return false;"><button class="btn-ghost">Sign In</button></a>
        <a href="#" onclick="router.navigate('register');return false;"><button class="btn-primary">Sign Up</button></a>
      ` : `
        <span style="font-size:13px;color:var(--txt2)">Hi, ${esc(profile?.username ?? '')}</span>
        <a href="#" onclick="router.navigate('profile');return false;"><button class="btn-ghost">Profile</button></a>
        <button class="btn-ghost" onclick="auth.logout()">Logout</button>
      `}
      <label class="theme-toggle" title="Toggle light/dark mode">
        <input type="checkbox" class="theme-checkbox" id="theme-cb" ${document.documentElement.dataset.theme === 'light' ? 'checked' : ''}>
        <div class="theme-track"><span class="icon-moon">🌙</span><span class="icon-sun">☀️</span></div>
        <span class="theme-thumb" id="theme-thumb">${document.documentElement.dataset.theme === 'light' ? '☀️' : '🌙'}</span>
      </label>
    </div>
  </nav>`;
}

/** Standard footer HTML */
export function footerHtml() {
  return `
  <footer style="background:var(--surface);border-top:1px solid var(--bdr);padding:32px 40px;margin-top:40px;">
    <div style="max-width:1100px;margin:0 auto;display:flex;justify-content:space-between;flex-wrap:wrap;gap:20px;">
      <div>
        <div class="nav-logo" style="font-size:18px;font-weight:700;margin-bottom:8px;">
          <svg width="22" height="22" viewBox="0 0 26 26" fill="none" style="margin-right:6px">
            <path d="M3 12L13 3L23 12V22C23 22.5523 22.5523 23 22 23H16V17H10V23H4C3.44772 23 3 22.5523 3 22V12Z"
                  fill="#8b5cf6" stroke="#8b5cf6" stroke-width="1.4" stroke-linejoin="round"/>
          </svg>
          Nest<span style="color:var(--pur)">Vault</span>
        </div>
        <p style="font-size:13px;color:var(--txt2);">Elevating the standard of modern real estate discovery.</p>
      </div>
      <div style="display:flex;gap:40px;flex-wrap:wrap;">
        <div>
          <div style="font-size:12px;font-weight:700;color:var(--txt2);text-transform:uppercase;letter-spacing:.5px;margin-bottom:10px;">Quick Links</div>
          <a href="#" onclick="router.navigate('properties');return false;" style="display:block;font-size:13px;color:var(--txt2);margin-bottom:6px;">Browse Properties</a>
          <a href="#" onclick="router.navigate('register');return false;" style="display:block;font-size:13px;color:var(--txt2);margin-bottom:6px;">Sign Up</a>
          <a href="#" onclick="router.navigate('search');return false;" style="display:block;font-size:13px;color:var(--txt2);">Search</a>
        </div>
        <div>
          <div style="font-size:12px;font-weight:700;color:var(--txt2);text-transform:uppercase;letter-spacing:.5px;margin-bottom:10px;">Legal</div>
          <a href="#" onclick="router.navigate('privacy');return false;" style="display:block;font-size:13px;color:var(--txt2);margin-bottom:6px;">Privacy Policy</a>
          <a href="#" onclick="router.navigate('terms');return false;" style="display:block;font-size:13px;color:var(--txt2);">Terms of Service</a>
        </div>
      </div>
    </div>
    <div style="text-align:center;margin-top:24px;font-size:12px;color:var(--txt3);">
      © ${new Date().getFullYear()} NestVault. All rights reserved.
    </div>
  </footer>`;
}
