// ================================================================
//  NestVault — Search page
// ================================================================
import { sb }                    from '../config.js';
import { propCard, esc, loadingHtml } from '../utils/helpers.js';

export function renderSearch(el, params = {}) {
  el.innerHTML = `
  <div class="search-layout">
    <div class="filter-panel">
      <div class="filter-title">Filters</div>

      <div class="filter-group">
        <label class="filter-label">Location</label>
        <input class="filter-input" id="sf-addr" placeholder="City or area…"
               value="${esc(params.address ?? '')}">
      </div>

      <div class="filter-group">
        <label class="filter-label">Property Type</label>
        <select class="filter-input" id="sf-type">
          <option value="">Any type</option>
          ${['House','Apartment','Land','Commercial'].map(t =>
            `<option value="${t}" ${params.type === t ? 'selected' : ''}>${t}</option>`
          ).join('')}
        </select>
      </div>

      <div class="filter-group">
        <label class="filter-label">Listing</label>
        <select class="filter-input" id="sf-listing">
          <option value="">Sale or Rent</option>
          <option value="Sale" ${params.listing === 'Sale' ? 'selected' : ''}>For Sale</option>
          <option value="Rent" ${params.listing === 'Rent' ? 'selected' : ''}>For Rent</option>
        </select>
      </div>

      <div class="filter-group">
        <label class="filter-label">Max Price (Rs.)</label>
        <input class="filter-input" type="number" id="sf-price" placeholder="Any"
               value="${esc(params.maxPrice ?? '')}">
      </div>

      <div class="filter-group">
        <label class="filter-label">Min Bedrooms</label>
        <input class="filter-input" type="number" id="sf-beds" placeholder="Any" min="0"
               value="${esc(params.beds ?? '')}">
      </div>

      <div class="filter-group">
        <label class="filter-label">Status</label>
        <select class="filter-input" id="sf-status">
          <option value="">Any status</option>
          <option value="Available">Available</option>
          <option value="Sold">Sold</option>
          <option value="Rented">Rented</option>
        </select>
      </div>

      <button class="btn-primary" style="width:100%;padding:11px;margin-top:4px"
              onclick="doSearch()">
        Search
      </button>
      <button class="btn-ghost" style="width:100%;padding:10px;margin-top:8px"
              onclick="clearFilters()">
        Clear Filters
      </button>
    </div>

    <div class="results-area">
      <div id="search-results">
        <div style="text-align:center;padding:80px 20px;color:var(--txt2)">
          <div style="font-size:40px;margin-bottom:12px">🔍</div>
          <div>Set your filters and click <strong>Search</strong>.</div>
        </div>
      </div>
    </div>
  </div>`;

  // Auto-search if params passed in (from quick search bar)
  if (params.address || params.type || params.maxPrice) doSearch();
}

async function doSearch() {
  const resultsEl = document.getElementById('search-results');
  if (!resultsEl) return;
  resultsEl.innerHTML = `<div class="page-loading"><div class="spinner"></div><span>Searching…</span></div>`;

  const addr    = document.getElementById('sf-addr')?.value?.trim()    ?? '';
  const type    = document.getElementById('sf-type')?.value            ?? '';
  const listing = document.getElementById('sf-listing')?.value         ?? '';
  const maxP    = document.getElementById('sf-price')?.value           ?? '';
  const beds    = document.getElementById('sf-beds')?.value            ?? '';
  const status  = document.getElementById('sf-status')?.value          ?? '';

  let q = sb.from('properties').select('*');
  if (addr)    q = q.or(`address.ilike.%${addr}%,city.ilike.%${addr}%`);
  if (type)    q = q.eq('property_type', type);
  if (listing) q = q.eq('listing_type', listing);
  if (maxP)    q = q.lte('price', Number(maxP));
  if (beds)    q = q.gte('bedrooms', Number(beds));
  if (status)  q = q.eq('status', status);
  q = q.order('created_at', { ascending: false });

  const { data, error } = await q;
  const props = data ?? [];

  if (error) {
    resultsEl.innerHTML = `<div class="msg-error">Search failed: ${error.message}</div>`;
    return;
  }

  resultsEl.innerHTML = `
    <div class="results-topbar">
      <div class="results-count">
        <strong>${props.length}</strong> result${props.length !== 1 ? 's' : ''} found
      </div>
    </div>
    ${props.length
      ? `<div class="prop-grid">${props.map(p => propCard(p)).join('')}</div>`
      : `<div style="text-align:center;padding:60px 20px;color:var(--txt2)">
           <div style="font-size:40px;margin-bottom:12px">🔍</div>
           <div>No properties match your filters.</div>
         </div>`
    }`;
}

function clearFilters() {
  ['sf-addr','sf-price','sf-beds'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  ['sf-type','sf-listing','sf-status'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.selectedIndex = 0;
  });
  document.getElementById('search-results').innerHTML =
    `<div style="text-align:center;padding:80px 20px;color:var(--txt2)">Filters cleared. Click Search.</div>`;
}

// expose to inline onclick
window.doSearch    = doSearch;
window.clearFilters = clearFilters;
