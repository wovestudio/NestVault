// ================================================================
//  NestVault — Admin Dashboard
// ================================================================
import { sb, state }      from '../config.js';
import { esc, fmtPrice, toast, loadingHtml } from '../utils/helpers.js';
import { router }         from '../router.js';

export async function renderAdmin(el) {
  if (state.profile?.role !== 'ADMIN') {
    toast('Admin access required.', 'error');
    router.navigate('home');
    return;
  }

  el.innerHTML = loadingHtml('Loading admin dashboard…');

  const [usersRes, propsRes, inqsRes] = await Promise.all([
    sb.from('profiles').select('*').order('created_at', { ascending: false }),
    sb.from('properties').select('*').order('created_at', { ascending: false }),
    sb.from('inquiries').select('*').order('created_at', { ascending: false }),
  ]);

  const users = usersRes.data ?? [];
  const props = propsRes.data ?? [];
  const inqs  = inqsRes.data  ?? [];

  el.innerHTML = `
  <div class="admin-header">
    <div class="admin-header-inner">
      <div>
        <div class="admin-title">Admin Dashboard</div>
        <p class="admin-subtitle">Manage users, properties, and system activity.</p>
      </div>
      <div class="user-pill">
        <div class="user-avatar admin-avatar" style="width:36px;height:36px;font-size:14px">
          ${(state.profile.username ?? 'A').charAt(0).toUpperCase()}
        </div>
        <span class="user-name">${esc(state.profile.username)} (ADMIN)</span>
      </div>
    </div>
  </div>

  <div class="page-section">

    <!-- Stats -->
    <div class="admin-stats-row">
      <div class="admin-stat-card">
        <div class="admin-stat-icon">👥</div>
        <div class="admin-stat-num">${users.length}</div>
        <div class="admin-stat-lbl">Total Users</div>
      </div>
      <div class="admin-stat-card">
        <div class="admin-stat-icon">🏘️</div>
        <div class="admin-stat-num">${props.length}</div>
        <div class="admin-stat-lbl">Total Properties</div>
      </div>
      <div class="admin-stat-card">
        <div class="admin-stat-icon">📨</div>
        <div class="admin-stat-num">${inqs.length}</div>
        <div class="admin-stat-lbl">Total Inquiries</div>
      </div>
      <div class="admin-stat-card">
        <div class="admin-stat-icon">✅</div>
        <div class="admin-stat-num">${props.filter(p => p.status === 'Available').length}</div>
        <div class="admin-stat-lbl">Available Now</div>
      </div>
    </div>

    <!-- Tab buttons -->
    <div class="admin-tabs">
      <button class="admin-tab active" id="atab-btn-users"     onclick="adminTab('users')">👥 Users (${users.length})</button>
      <button class="admin-tab"        id="atab-btn-properties" onclick="adminTab('properties')">🏘️ Properties (${props.length})</button>
      <button class="admin-tab"        id="atab-btn-inquiries"  onclick="adminTab('inquiries')">📨 Inquiries (${inqs.length})</button>
    </div>

    <!-- ── USERS TAB ── -->
    <div id="atab-users">
      <div class="admin-table-toolbar">
        <input class="filter-input" id="usr-search" placeholder="Search by name or role…"
               style="max-width:280px" oninput="adminFilter('usr-search','atbl-users')">
      </div>
      <div class="admin-table-wrap">
        <table class="admin-table" id="atbl-users">
          <thead><tr>
            <th>Role</th><th>Name</th><th>Phone</th><th>Status</th><th>Actions</th>
          </tr></thead>
          <tbody>
          ${users.map(u => `
          <tr>
            <td><span class="role-chip ${u.role === 'ADMIN' ? 'role-admin' : 'role-user'}">${esc(u.role)}</span></td>
            <td>${esc(u.username)}</td>
            <td style="font-size:12px;color:var(--txt2)">${esc(u.phone ?? '—')}</td>
            <td>
              <span class="status-chip ${u.status === 'Banned' ? 'status-sold' : 'status-available'}">
                ${esc(u.status ?? 'Active')}
              </span>
            </td>
            <td class="admin-actions">
              ${u.id !== state.user.id ? `
                ${u.status !== 'Banned'
                  ? `<button class="admin-btn-delete" onclick="adminBan('${u.id}',true)">Ban</button>`
                  : `<button class="admin-btn-edit"   onclick="adminBan('${u.id}',false)">Unban</button>`}
                <button class="admin-btn-delete" style="background:rgba(80,0,0,.3)"
                        onclick="adminDeleteUser('${u.id}')">Delete</button>
              ` : `<span style="font-size:11px;color:var(--txt3)">You</span>`}
            </td>
          </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <!-- ── PROPERTIES TAB ── -->
    <div id="atab-properties" style="display:none">
      <div class="admin-table-toolbar">
        <input class="filter-input" id="prop-search" placeholder="Search properties…"
               style="max-width:280px" oninput="adminFilter('prop-search','atbl-props')">
      </div>
      <div class="admin-table-wrap">
        <table class="admin-table" id="atbl-props">
          <thead><tr>
            <th>Title</th><th>Type</th><th>Price</th><th>Status</th><th>Actions</th>
          </tr></thead>
          <tbody>
          ${props.map(p => `
          <tr>
            <td>${esc(p.title)}</td>
            <td>${esc(p.property_type)}</td>
            <td>${fmtPrice(p.price)}</td>
            <td>
              <span class="status-chip ${p.status === 'Available' ? 'status-available' : p.status === 'Sold' ? 'status-sold' : 'status-rented'}">
                ${esc(p.status)}
              </span>
            </td>
            <td class="admin-actions">
              <button class="admin-btn-view"   onclick="router.navigate('property-detail',{id:'${p.id}'})">View</button>
              <button class="admin-btn-delete" onclick="adminDeleteProp('${p.id}')">Delete</button>
            </td>
          </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <!-- ── INQUIRIES TAB ── -->
    <div id="atab-inquiries" style="display:none">
      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead><tr>
            <th>Subject</th><th>Status</th><th>Date</th><th>Actions</th>
          </tr></thead>
          <tbody>
          ${inqs.map(i => `
          <tr>
            <td style="max-width:260px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
              ${esc(i.subject ?? '(no subject)')}
            </td>
            <td>
              <span class="status-chip ${i.status === 'Read' ? 'status-available' : 'status-rented'}">
                ${esc(i.status)}
              </span>
            </td>
            <td style="font-size:12px;color:var(--txt2)">${new Date(i.created_at).toLocaleDateString('en-LK')}</td>
            <td class="admin-actions">
              <button class="admin-btn-delete" onclick="adminDeleteInq('${i.id}')">Delete</button>
            </td>
          </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>

  </div>`;
}

// ── Tab switching ────────────────────────────────────────────
function adminTab(name) {
  ['users','properties','inquiries'].forEach(t => {
    document.getElementById('atab-' + t).style.display = t === name ? '' : 'none';
    document.getElementById('atab-btn-' + t)?.classList.toggle('active', t === name);
  });
}

// ── Table filter ─────────────────────────────────────────────
function adminFilter(inputId, tableId) {
  const q = document.getElementById(inputId)?.value?.toLowerCase() ?? '';
  document.querySelectorAll(`#${tableId} tbody tr`).forEach(row => {
    row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none';
  });
}

// ── Actions ──────────────────────────────────────────────────
async function adminBan(userId, ban) {
  if (!confirm(`${ban ? 'Ban' : 'Unban'} this user?`)) return;
  const { error } = await sb.from('profiles').update({ status: ban ? 'Banned' : 'Active' }).eq('id', userId);
  if (error) { toast('Error: ' + error.message, 'error'); return; }
  toast(`User ${ban ? 'banned' : 'unbanned'}.`, 'success');
  router.navigate('admin');
}

async function adminDeleteUser(userId) {
  if (!confirm('Permanently delete this user? This cannot be undone.')) return;
  const { error } = await sb.from('profiles').delete().eq('id', userId);
  if (error) { toast('Error: ' + error.message, 'error'); return; }
  toast('User deleted.', 'success');
  router.navigate('admin');
}

async function adminDeleteProp(propId) {
  if (!confirm('Force delete this listing?')) return;
  const { error } = await sb.from('properties').delete().eq('id', propId);
  if (error) { toast('Error: ' + error.message, 'error'); return; }
  toast('Property deleted.', 'success');
  router.navigate('admin');
}

async function adminDeleteInq(inqId) {
  if (!confirm('Delete this inquiry and all its messages?')) return;
  const { error } = await sb.from('inquiries').delete().eq('id', inqId);
  if (error) { toast('Error: ' + error.message, 'error'); return; }
  toast('Inquiry deleted.', 'success');
  router.navigate('admin');
}

// Expose to inline onclick
window.adminTab        = adminTab;
window.adminFilter     = adminFilter;
window.adminBan        = adminBan;
window.adminDeleteUser = adminDeleteUser;
window.adminDeleteProp = adminDeleteProp;
window.adminDeleteInq  = adminDeleteInq;
