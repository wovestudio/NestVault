// ================================================================
//  NestVault — Home page
// ================================================================
import { sb }                          from '../config.js';
import { state }                       from '../config.js';
import { esc, fmtPrice, propCard, footerHtml } from '../utils/helpers.js';
import { router }                      from '../router.js';

export async function renderHome(el) {
  el.innerHTML = `<div class="page-loading"><div class="spinner"></div><span>Loading…</span></div>`;

  const [{ data: statsRow }, { data: props }] = await Promise.all([
    sb.from('site_stats').select('*').single(),
    sb.from('properties').select('*').eq('status', 'Available')
      .order('created_at', { ascending: false }).limit(6),
  ]);

  const stats = statsRow ?? {};
  const cards = (props ?? []).length
    ? (props ?? []).map(p => propCard(p)).join('')
    : `<div style="text-align:center;padding:60px 20px;color:var(--txt2);grid-column:1/-1">
        <div style="font-size:48px;margin-bottom:12px">🏘️</div>
        <div style="font-size:18px;font-weight:600">No listings yet</div>
        ${state.profile?.role === 'SELLER'
          ? `<a href="#" onclick="router.navigate('add-property');return false;"><button class="btn-primary" style="margin-top:16px">List a Property</button></a>` : ''}
       </div>`;

  el.innerHTML = `
  <section class="hero">
    <canvas id="particle-canvas"></canvas>
    <div class="hero-content">
      <div class="hero-eyebrow"><span class="hero-pulse"></span>Live listings updated daily</div>
      <h1>Find Your Next<br><span>Dream Property</span></h1>
      <p class="hero-subtitle">
        Browse, list, and connect. NestVault brings buyers, renters and sellers
        together in one sleek platform.
      </p>
      <div class="hero-ctas">
        <a href="#" onclick="router.navigate('properties');return false;">
          <button class="btn-primary-lg">Browse Properties</button>
        </a>
        ${state.profile?.role === 'SELLER'
          ? `<a href="#" onclick="router.navigate('add-property');return false;"><button class="btn-outline-lg">List Your Property</button></a>` : ''}
        ${!state.user
          ? `<a href="#" onclick="router.navigate('register');return false;"><button class="btn-outline-lg">Join NestVault</button></a>` : ''}
      </div>
      <div class="hero-stats">
        <div class="hero-stat">
          <div class="hero-stat-num" id="stat-total">${stats.total_properties ?? 0}</div>
          <div class="hero-stat-lbl">Total Listings</div>
        </div>
        <div class="hero-stat">
          <div class="hero-stat-num" id="stat-avail">${stats.available_properties ?? 0}</div>
          <div class="hero-stat-lbl">Available Now</div>
        </div>
        <div class="hero-stat">
          <div class="hero-stat-num" id="stat-users">${stats.total_users ?? 0}</div>
          <div class="hero-stat-lbl">Members</div>
        </div>
      </div>
    </div>
  </section>

  <!-- Quick search bar -->
  <div class="quick-search">
    <form class="quick-search-inner" id="quick-search-form">
      <div class="qs-field">
        <label>Location</label>
        <input id="qs-addr" placeholder="City or area…">
      </div>
      <div class="qs-divider"></div>
      <div class="qs-field">
        <label>Type</label>
        <select id="qs-type">
          <option value="">Any</option>
          <option value="House">House</option>
          <option value="Apartment">Apartment</option>
          <option value="Land">Land</option>
          <option value="Commercial">Commercial</option>
        </select>
      </div>
      <div class="qs-divider"></div>
      <div class="qs-field">
        <label>Max Price (Rs.)</label>
        <input id="qs-price" type="number" placeholder="Any">
      </div>
      <button type="submit" class="btn-primary" style="padding:10px 24px;white-space:nowrap">
        Search
      </button>
    </form>
  </div>

  <!-- Latest listings -->
  <div class="page-section">
    <div class="section-header">
      <div class="section-title">Latest Listings</div>
      <a href="#" onclick="router.navigate('properties');return false;" class="section-link">View all →</a>
    </div>
    <div class="prop-grid">${cards}</div>
  </div>

  ${footerHtml()}`;

  // Bind quick search
  document.getElementById('quick-search-form').addEventListener('submit', e => {
    e.preventDefault();
    router.navigate('search', {
      address:  document.getElementById('qs-addr').value,
      type:     document.getElementById('qs-type').value,
      maxPrice: document.getElementById('qs-price').value,
    });
  });

  // Init particles (the particles.js file is a classic IIFE, re-run it)
  const canvas = document.getElementById('particle-canvas');
  if (canvas && window.__initParticles) window.__initParticles();
}
