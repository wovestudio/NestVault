// ================================================================
//  NestVault — Profile page
// ================================================================
import { sb, state }       from '../config.js';
import { esc, timeAgo, toast, loadingHtml } from '../utils/helpers.js';
import { auth }            from '../auth.js';
import { router }          from '../router.js';

export async function renderProfile(el) {
  el.innerHTML = loadingHtml('Loading profile…');

  // Load buyer conversations if role is BUYER
  let inqs = [];
  let propTitles = {};
  if (state.profile?.role === 'BUYER') {
    const { data } = await sb.from('inquiries').select('*')
      .eq('buyer_id', state.user.id)
      .order('created_at', { ascending: false });
    inqs = data ?? [];

    if (inqs.length) {
      const ids = [...new Set(inqs.map(i => i.property_id))];
      const { data: ps } = await sb.from('properties').select('id,title').in('id', ids);
      (ps ?? []).forEach(p => { propTitles[p.id] = p.title; });
    }
  }

  const u = state.profile;

  el.innerHTML = `
  <div class="page-section" style="max-width:580px;margin:0 auto">
    <div class="page-title">My Profile</div>
    <p class="page-subtitle">Manage your account details.</p>

    <!-- Account card -->
    <div style="background:var(--surface);border:1px solid var(--bdr);border-radius:var(--radius-lg);padding:28px;margin-bottom:24px">

      <!-- Avatar row -->
      <div style="display:flex;align-items:center;gap:16px;margin-bottom:24px">
        <div class="user-avatar" style="width:56px;height:56px;font-size:22px;font-weight:700">
          ${(u.username ?? 'U').charAt(0).toUpperCase()}
        </div>
        <div>
          <div style="font-family:var(--font-head);font-size:17px;font-weight:700">
            ${esc(u.username)}
          </div>
          <div style="font-size:12px;color:var(--txt2)">${esc(state.user.email)}</div>
          <div style="margin-top:5px">
            <span class="role-chip ${u.role === 'ADMIN' ? 'role-admin' : 'role-user'}">${esc(u.role)}</span>
          </div>
        </div>
      </div>

      <!-- Edit form -->
      <form id="profile-form">
        <div class="form-section-bar">Account Details</div>

        <div class="form-group">
          <label>Email (cannot change)</label>
          <input type="email" value="${esc(state.user.email)}" readonly
                 style="opacity:.55;cursor:not-allowed">
        </div>
        <div class="form-group">
          <label>Username</label>
          <input type="text" id="pf-name" value="${esc(u.username)}" required>
        </div>
        <div class="form-group">
          <label>Phone Number</label>
          <input type="text" id="pf-phone" value="${esc(u.phone ?? '')}" placeholder="+94 77 000 0000">
        </div>
        <div class="form-group">
          <label>Address</label>
          <input type="text" id="pf-addr" value="${esc(u.address ?? '')}" placeholder="Your address">
        </div>

        <button type="submit" class="btn-primary btn-full" id="pf-btn" style="margin-top:8px">
          Save Changes
        </button>
      </form>
    </div>

    <!-- Buyer conversations -->
    ${state.profile?.role === 'BUYER' && inqs.length > 0 ? `
    <div style="background:var(--surface);border:1px solid var(--bdr);border-radius:var(--radius-lg);padding:24px;margin-bottom:24px">
      <div style="font-family:var(--font-head);font-size:15px;font-weight:700;margin-bottom:14px">
        💬 My Conversations
      </div>
      ${inqs.map(i => `
      <div class="inquiry-card ${i.status === 'Unread' ? 'unread' : ''}"
           onclick="router.navigate('chat',{inquiryId:'${i.id}'})">
        <div style="width:36px;height:36px;border-radius:50%;background:var(--purglow);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:16px">💬</div>
        <div style="flex:1;min-width:0">
          <div style="font-size:13px;font-weight:600">
            ${esc(propTitles[i.property_id] ?? 'Property')}
            ${i.status === 'Unread' ? '<span class="badge-unread">New</span>' : ''}
          </div>
          <div style="font-size:12px;color:var(--txt3);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
            ${esc((i.subject ?? '').substring(0, 80))}
          </div>
        </div>
        <div style="font-size:11px;color:var(--txt3);white-space:nowrap">${timeAgo(i.created_at)}</div>
      </div>`).join('')}
    </div>` : ''}

    <!-- Danger zone -->
    <div style="background:rgba(239,68,68,.06);border:1px solid rgba(239,68,68,.2);border-radius:var(--radius-lg);padding:22px">
      <div style="font-family:var(--font-head);font-size:13px;font-weight:700;color:#ef4444;margin-bottom:8px">
        ⚠ Danger Zone
      </div>
      <p style="font-size:13px;color:var(--txt2);margin-bottom:14px">
        Permanently delete your account, all your listings, and all your messages.
        This cannot be undone.
      </p>
      <button class="btn-danger" style="width:100%;padding:10px" onclick="deleteMyAccount()">
        Delete My Account Permanently
      </button>
    </div>

    <div style="text-align:center;margin-top:16px">
      <a href="#" onclick="router.navigate('home');return false;" style="font-size:13px;color:var(--txt2)">
        ← Back to Home
      </a>
    </div>
  </div>`;

  document.getElementById('profile-form').addEventListener('submit', async e => {
    e.preventDefault();
    const btn = document.getElementById('pf-btn');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span>&nbsp;Saving…';

    const { error } = await sb.from('profiles').update({
      username: document.getElementById('pf-name').value.trim(),
      phone:    document.getElementById('pf-phone').value.trim(),
      address:  document.getElementById('pf-addr').value.trim(),
    }).eq('id', state.user.id);

    if (error) { toast('Error: ' + error.message, 'error'); btn.disabled = false; btn.textContent = 'Save Changes'; return; }

    // Refresh state
    const { data } = await sb.from('profiles').select('*').eq('id', state.user.id).single();
    state.profile = data;

    toast('Profile updated!', 'success');
    router.navigate('profile'); // re-render with fresh data
  });
}

async function deleteMyAccount() {
  if (!confirm('Are you absolutely sure? This deletes all your data permanently.')) return;
  // Delete properties (cascade handles inquiries + messages)
  await sb.from('properties').delete().eq('user_id', state.user.id);
  await sb.from('profiles').delete().eq('id', state.user.id);
  await sb.auth.signOut();
  state.user    = null;
  state.profile = null;
  toast('Account deleted.', 'info');
  router.navigate('home');
}

window.deleteMyAccount = deleteMyAccount;
