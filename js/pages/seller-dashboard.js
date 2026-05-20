// ================================================================
//  NestVault — Seller Dashboard
// ================================================================
import { sb, state }      from '../config.js';
import { esc, fmtPrice, timeAgo, toast, loadingHtml } from '../utils/helpers.js';
import { router }         from '../router.js';

export async function renderSellerDashboard(el) {
  if (state.profile?.role !== 'SELLER') {
    toast('Only sellers can access this page.', 'error');
    router.navigate('home');
    return;
  }

  el.innerHTML = loadingHtml('Loading your dashboard…');

  const [propsRes, inqRes] = await Promise.all([
    sb.from('properties').select('*')
      .eq('user_id', state.user.id)
      .order('created_at', { ascending: false }),
    sb.from('inquiries').select('*')
      .eq('seller_id', state.user.id)
      .order('created_at', { ascending: false }),
  ]);

  const props = propsRes.data ?? [];
  const inqs  = inqRes.data  ?? [];

  // Fetch buyer usernames
  const buyerIds = [...new Set(inqs.map(i => i.buyer_id))];
  let buyerMap = {};
  if (buyerIds.length) {
    const { data: buyers } = await sb.from('profiles').select('id,username').in('id', buyerIds);
    (buyers ?? []).forEach(b => { buyerMap[b.id] = b.username; });
  }

  // Build property title map for inquiry rows
  const propTitleMap = {};
  props.forEach(p => { propTitleMap[p.id] = p.title; });
  // Also fetch titles for inquiries about other people's properties (edge case)
  const missingIds = inqs.map(i => i.property_id).filter(pid => !propTitleMap[pid]);
  if (missingIds.length) {
    const { data: extraProps } = await sb.from('properties').select('id,title').in('id', [...new Set(missingIds)]);
    (extraProps ?? []).forEach(p => { propTitleMap[p.id] = p.title; });
  }

  const unread = inqs.filter(i => i.status === 'Unread').length;

  el.innerHTML = `
  <div class="page-section">

    <!-- Header -->
    <div class="section-header">
      <div>
        <div class="page-title">Welcome, ${esc(state.profile.username)}</div>
        <p class="page-subtitle">Manage your listings and buyer inquiries.</p>
      </div>
      <a href="#" onclick="router.navigate('add-property');return false;">
        <button class="btn-primary">+ List New Property</button>
      </a>
    </div>

    <!-- Listings table -->
    <div style="background:var(--surface);border:1px solid var(--bdr);border-radius:var(--radius-lg);overflow:hidden;margin-bottom:32px">
      <div style="padding:18px 24px;border-bottom:1px solid var(--bdr);display:flex;align-items:center;justify-content:space-between">
        <div style="font-family:var(--font-head);font-size:15px;font-weight:700">Your Listings</div>
        <span style="font-size:12px;color:var(--txt2)">${props.length} propert${props.length !== 1 ? 'ies' : 'y'}</span>
      </div>

      ${props.length === 0
        ? `<div style="padding:48px;text-align:center;color:var(--txt2)">
             <div style="font-size:40px;margin-bottom:12px">🏘️</div>
             <div style="font-weight:600;margin-bottom:8px">No listings yet</div>
             <a href="#" onclick="router.navigate('add-property');return false;">
               <button class="btn-primary" style="margin-top:8px">List Your First Property</button>
             </a>
           </div>`
        : `<div style="overflow-x:auto">
             <table class="admin-table">
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
                   <button class="admin-btn-view" onclick="router.navigate('property-detail',{id:'${p.id}'})">View</button>
                   <button class="admin-btn-edit" onclick="router.navigate('add-property',{editId:'${p.id}'})">Edit</button>
                   <button class="admin-btn-delete" onclick="sdDeleteProp('${p.id}')">Delete</button>
                 </td>
               </tr>`).join('')}
               </tbody>
             </table>
           </div>`
      }
    </div>

    <!-- Inquiries / inbox -->
    <div style="background:var(--surface);border:1px solid var(--bdr);border-radius:var(--radius-lg);overflow:hidden">
      <div style="padding:18px 24px;border-bottom:1px solid var(--bdr);display:flex;align-items:center;gap:10px">
        <div style="font-family:var(--font-head);font-size:15px;font-weight:700">📥 Buyer Inquiries</div>
        ${unread > 0 ? `<span class="badge-unread">${unread} new</span>` : ''}
      </div>

      ${inqs.length === 0
        ? `<div style="padding:48px;text-align:center;color:var(--txt2)">
             <div style="font-size:40px;margin-bottom:12px">📭</div>
             <div style="font-weight:600">No inquiries yet</div>
             <div style="font-size:13px;margin-top:6px">Buyer messages will appear here.</div>
           </div>`
        : `<div style="padding:16px">
             ${inqs.map(i => `
             <div class="inquiry-card ${i.status === 'Unread' ? 'unread' : ''}"
                  onclick="router.navigate('chat',{inquiryId:'${i.id}'})">
               <div style="width:40px;height:40px;border-radius:50%;background:var(--purglow);display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0">
                 💬
               </div>
               <div style="flex:1;min-width:0">
                 <div style="display:flex;align-items:center;justify-content:space-between;gap:8px">
                   <div style="font-weight:600;font-size:14px">
                     ${esc(buyerMap[i.buyer_id] ?? 'Unknown Buyer')}
                     ${i.status === 'Unread' ? '<span class="badge-unread">New</span>' : ''}
                   </div>
                   <div style="font-size:11px;color:var(--txt3);white-space:nowrap">${timeAgo(i.created_at)}</div>
                 </div>
                 <div style="font-size:12px;color:var(--txt2);margin-top:2px">
                   Re: ${esc(propTitleMap[i.property_id] ?? i.property_id)}
                 </div>
                 <div style="font-size:12px;color:var(--txt3);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
                   ${esc((i.subject ?? '').substring(0, 90))}
                 </div>
               </div>
             </div>`).join('')}
           </div>`
      }
    </div>

  </div>`;
}

async function sdDeleteProp(id) {
  if (!confirm('Delete this listing permanently?')) return;
  const { error } = await sb.from('properties').delete().eq('id', id);
  if (error) { toast('Error: ' + error.message, 'error'); return; }
  toast('Listing deleted.', 'success');
  router.navigate('seller-dashboard');
}

window.sdDeleteProp = sdDeleteProp;
