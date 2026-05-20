// ================================================================
//  NestVault — Properties listing page
// ================================================================
import { sb }                    from '../config.js';
import { propCard, loadingHtml } from '../utils/helpers.js';

export async function renderProperties(el) {
  el.innerHTML = loadingHtml('Loading properties…');

  const { data, error } = await sb
    .from('properties')
    .select('*')
    .order('created_at', { ascending: false });

  const props = data ?? [];

  el.innerHTML = `
  <div class="page-section">
    <div class="section-header">
      <div>
        <div class="page-title">All Properties</div>
        <p class="page-subtitle">Browse every listing on NestVault.</p>
      </div>
      <span style="font-size:13px;color:var(--txt2)">${props.length} listing${props.length !== 1 ? 's' : ''}</span>
    </div>

    ${error
      ? `<div class="msg-error">Failed to load properties: ${error.message}</div>`
      : props.length
        ? `<div class="prop-grid">${props.map(p => propCard(p)).join('')}</div>`
        : `<div style="text-align:center;padding:80px 20px;color:var(--txt2)">
             <div style="font-size:48px;margin-bottom:12px">🏘️</div>
             <div style="font-size:18px;font-weight:600">No properties listed yet.</div>
           </div>`
    }
  </div>`;
}
