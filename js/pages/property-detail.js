// ================================================================
//  NestVault — Property detail page
// ================================================================
import { sb, state }      from '../config.js';
import { esc, fmtPrice, propEmoji, toast, loadingHtml } from '../utils/helpers.js';
import { router }         from '../router.js';

export async function renderPropertyDetail(el, id) {
  if (!id) { router.navigate('properties'); return; }
  el.innerHTML = loadingHtml();

  const { data: p, error } = await sb.from('properties').select('*').eq('id', id).single();
  if (error || !p) {
    el.innerHTML = `<div style="padding:60px;text-align:center;color:var(--txt2)">Property not found.</div>`;
    return;
  }

  const isBuyer  = state.profile?.role === 'BUYER';
  const isSeller = state.user?.id === p.user_id;
  const isAdmin  = state.profile?.role === 'ADMIN';

  // Build image gallery
  const images = [p.image1, p.image2].filter(Boolean);
  let galleryHtml = '';
  if (images.length) {
    galleryHtml = `<div class="prop-gallery">
      ${images.map(u => `<img src="${esc(u)}" alt="Property photo" onerror="this.style.display='none'">`).join('')}
    </div>`;
  }

  // Contact / inquiry section
  let contactHtml = '';
  if (!state.user) {
    contactHtml = `
      <div style="text-align:center;padding:20px;background:rgba(239,68,68,.08);border-radius:10px;border:1px solid rgba(239,68,68,.2)">
        <p style="font-size:13px;color:var(--txt2);margin-bottom:12px">
          Sign in as a Buyer to contact the seller.
        </p>
        <a href="#" onclick="router.navigate('login');return false;">
          <button class="btn-primary" style="width:100%">Log In</button>
        </a>
      </div>`;
  } else if (isBuyer) {
    // Check existing inquiry
    const { data: existing } = await sb.from('inquiries')
      .select('id')
      .eq('property_id', id)
      .eq('buyer_id', state.user.id)
      .maybeSingle();

    if (existing) {
      contactHtml = `
        <div style="text-align:center;padding:20px;background:var(--pursoft);border:1px solid var(--purborder);border-radius:10px">
          <p style="font-size:13px;color:var(--txt2);margin-bottom:12px">
            You have an active conversation with this seller.
          </p>
          <button class="btn-primary" style="width:100%"
                  onclick="router.navigate('chat',{inquiryId:'${existing.id}'})">
            Open Chat
          </button>
        </div>`;
    } else {
      contactHtml = `
        <form id="inq-form">
          <div class="form-group">
            <label>Your Message</label>
            <textarea id="inq-msg" rows="5" required
              placeholder="I am interested in viewing this property…"></textarea>
          </div>
          <button type="submit" class="btn-primary" style="width:100%;padding:11px">
            Send Message
          </button>
        </form>`;
    }
  } else if (isSeller || isAdmin) {
    contactHtml = `
      <p style="font-size:13px;color:var(--txt2);text-align:center">
        ${isSeller ? 'This is your listing.' : 'Viewing as admin.'}
      </p>`;
  } else {
    contactHtml = `
      <p style="font-size:13px;color:var(--txt2);text-align:center">
        Only registered Buyers can send property inquiries.
      </p>`;
  }

  el.innerHTML = `
  <div class="detail-layout">

    <!-- Hero image (first image or emoji) -->
    <div class="detail-img" style="background:var(--card2)!important;border:1px solid var(--bdr)">
      ${images[0]
        ? `<img src="${esc(images[0])}" alt=""
               style="width:100%;height:100%;object-fit:cover;border-radius:inherit;display:block"
               onerror="this.style.display='none'">`
        : `<span style="font-size:80px">${propEmoji(p.property_type)}</span>`
      }
      <a href="#" onclick="router.navigate('properties');return false;" class="detail-back">
        ← Back to listings
      </a>
    </div>

    <div class="detail-two-col">

      <!-- Main info -->
      <div class="detail-main">
        ${galleryHtml}

        <div class="detail-header">
          <div class="detail-title">${esc(p.title)}</div>
          <div class="detail-price">${fmtPrice(p.price)}</div>
        </div>

        <div class="detail-loc">
          <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" stroke-width="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          <span>${esc(p.address)}${p.city ? ', ' + esc(p.city) : ''}</span>
        </div>

        <div class="detail-tags">
          <span class="detail-tag">${esc(p.property_type)}</span>
          <span class="detail-tag">${esc(p.listing_type === 'Rent' ? 'For Rent' : 'For Sale')}</span>
          <span class="detail-tag status-pill ${p.status === 'Available' ? 'status-available' : p.status === 'Sold' ? 'status-sold' : 'status-rented'}">
            ${esc(p.status)}
          </span>
          ${p.bedrooms  ? `<span class="detail-tag">🛏 ${p.bedrooms} bed</span>` : ''}
          ${p.bathrooms ? `<span class="detail-tag">🚿 ${p.bathrooms} bath</span>` : ''}
          ${p.area      ? `<span class="detail-tag">📐 ${p.area} sqft</span>` : ''}
          ${p.created_at
            ? `<span class="detail-tag">Listed: ${new Date(p.created_at).toLocaleDateString('en-LK')}</span>`
            : ''}
        </div>

        <div class="detail-desc">${esc(p.description || 'No description provided.')}</div>

        ${(isSeller || isAdmin)
          ? `<div class="owner-actions" style="display:flex;gap:10px;margin-top:16px">
               <button class="btn-primary"
                       onclick="router.navigate('add-property',{editId:'${p.id}'})">
                 Edit Listing
               </button>
               <button class="btn-danger" onclick="confirmDeleteProperty('${p.id}')">
                 Delete Listing
               </button>
             </div>`
          : ''}
      </div>

      <!-- Sidebar -->
      <div class="detail-side">
        <div class="contact-card">
          <h3>Contact Seller</h3>
          ${contactHtml}
        </div>

        ${p.lister_name
          ? `<div class="contact-card" style="margin-top:16px">
               <h3>Listed by</h3>
               <div class="contact-row">
                 <div class="contact-icon">
                   <svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                 </div>
                 <div><div class="contact-label">Name</div><div class="contact-value">${esc(p.lister_name)}</div></div>
               </div>
               ${p.lister_phone
                 ? `<div class="contact-row">
                      <div class="contact-icon">
                        <svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.07 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3 2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 17z"/></svg>
                      </div>
                      <div><div class="contact-label">Phone</div><div class="contact-value">${esc(p.lister_phone)}</div></div>
                    </div>`
                 : ''}
             </div>`
          : ''}
      </div>
    </div>
  </div>`;

  // Bind inquiry form
  const form = document.getElementById('inq-form');
  if (form) {
    form.addEventListener('submit', e => submitInquiry(e, p.id, p.user_id));
  }
}

async function submitInquiry(e, propertyId, sellerId) {
  e.preventDefault();
  const btn = e.submitter;
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span>&nbsp;Sending…';

  const msg = document.getElementById('inq-msg').value.trim();

  const { data: inq, error: ie } = await sb.from('inquiries').insert({
    property_id: propertyId,
    buyer_id:    state.user.id,
    seller_id:   sellerId,
    subject:     msg.substring(0, 120),
    status:      'Unread',
  }).select().single();

  if (ie) { toast('Error: ' + ie.message, 'error'); btn.disabled = false; btn.textContent = 'Send Message'; return; }

  // Insert the first message
  await sb.from('messages').insert({
    inquiry_id: inq.id,
    sender_id:  state.user.id,
    body:       msg,
  });

  toast('Message sent! Opening chat…', 'success');
  router.navigate('chat', { inquiryId: inq.id });
}

async function confirmDeleteProperty(id) {
  if (!confirm('Delete this listing permanently?')) return;
  const { error } = await sb.from('properties').delete().eq('id', id);
  if (error) { toast('Error: ' + error.message, 'error'); return; }
  toast('Listing deleted.', 'success');
  router.navigate(state.profile?.role === 'ADMIN' ? 'admin' : 'seller-dashboard');
}

window.confirmDeleteProperty = confirmDeleteProperty;
