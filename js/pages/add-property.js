// ================================================================
//  NestVault — Add / Edit Property page
// ================================================================
import { sb, state }       from '../config.js';
import { esc, toast, loadingHtml } from '../utils/helpers.js';
import { uploadImage }     from '../utils/storage.js';
import { router }          from '../router.js';

export async function renderAddProperty(el, params = {}) {
  if (!state.user || (state.profile?.role !== 'SELLER' && state.profile?.role !== 'ADMIN')) {
    toast('Only sellers can list properties.', 'error');
    router.navigate('home');
    return;
  }

  const editId = params?.editId ?? null;
  let prop = null;

  if (editId) {
    el.innerHTML = loadingHtml('Loading listing…');
    const { data } = await sb.from('properties').select('*').eq('id', editId).single();
    prop = data;
  }

  const v = f => esc(prop?.[f] ?? '');
  const sel = (f, val) => prop?.[f] === val ? 'selected' : '';

  el.innerHTML = `
  <div class="page-section" style="max-width:700px;margin:0 auto">
    <div class="page-title">${editId ? 'Edit Listing' : 'List a New Property'}</div>
    <p class="page-subtitle">
      ${editId ? 'Update your listing details below.' : 'Fill in the details below to publish your listing.'}
    </p>

    <form id="ap-form"
          style="background:var(--surface);border:1px solid var(--bdr);border-radius:var(--radius-lg);padding:32px">

      <!-- Basic Info -->
      <div class="form-section-bar">Basic Info</div>

      <div class="form-group">
        <label>Property Title</label>
        <input type="text" id="ap-title" required placeholder="e.g. Modern Beachfront Villa" value="${v('title')}">
      </div>

      <div class="form-group">
        <label>Description</label>
        <textarea id="ap-desc" rows="4" required placeholder="Describe the property…">${v('description')}</textarea>
      </div>

      <div class="form-grid-2">
        <div class="form-group">
          <label>Price (Rs.)</label>
          <input type="number" id="ap-price" required min="1" placeholder="e.g. 15000000" value="${v('price')}">
        </div>
        <div class="form-group">
          <label>Property Type</label>
          <select id="ap-type" required>
            <option value="">Select type</option>
            ${['House','Apartment','Land','Commercial'].map(t =>
              `<option value="${t}" ${sel('property_type', t)}>${t}</option>`
            ).join('')}
          </select>
        </div>
      </div>

      <div class="form-grid-2">
        <div class="form-group">
          <label>Listing Type</label>
          <select id="ap-listing">
            <option value="Sale" ${sel('listing_type','Sale')}>For Sale</option>
            <option value="Rent" ${sel('listing_type','Rent')}>For Rent</option>
          </select>
        </div>
        <div class="form-group">
          <label>Status</label>
          <select id="ap-status">
            <option value="Available" ${sel('status','Available')}>Available</option>
            <option value="Sold"      ${sel('status','Sold')}>Sold</option>
            <option value="Rented"    ${sel('status','Rented')}>Rented</option>
          </select>
        </div>
      </div>

      <div class="form-grid-3">
        <div class="form-group">
          <label>Bedrooms</label>
          <input type="number" id="ap-beds" min="0" value="${prop?.bedrooms ?? 0}">
        </div>
        <div class="form-group">
          <label>Bathrooms</label>
          <input type="number" id="ap-baths" min="0" value="${prop?.bathrooms ?? 0}">
        </div>
        <div class="form-group">
          <label>Area (sqft)</label>
          <input type="number" id="ap-area" min="0" value="${prop?.area ?? 0}">
        </div>
      </div>

      <!-- Location -->
      <div class="form-section-bar">Location</div>
      <div class="form-grid-2">
        <div class="form-group">
          <label>Full Address</label>
          <input type="text" id="ap-addr" required placeholder="No. 12, Galle Road" value="${v('address')}">
        </div>
        <div class="form-group">
          <label>City</label>
          <input type="text" id="ap-city" placeholder="Colombo" value="${v('city')}">
        </div>
      </div>

      <!-- Images -->
      <div class="form-section-bar">Images (up to 2)</div>

      <div class="form-group">
        <label>Image 1${editId ? ' — leave blank to keep existing' : ''}</label>
        <input type="file" id="ap-img1" accept="image/*">
        <small style="font-size:11px;color:var(--txt3);display:block;margin-top:4px">
          JPG, PNG or WEBP — max 10 MB
        </small>
        ${prop?.image1
          ? `<img src="${esc(prop.image1)}" id="prev1" class="img-preview-box visible">`
          : `<img id="prev1" class="img-preview-box">`}
      </div>

      <div class="form-group">
        <label>Image 2${editId ? ' — leave blank to keep existing' : ' (optional)'}</label>
        <input type="file" id="ap-img2" accept="image/*">
        ${prop?.image2
          ? `<img src="${esc(prop.image2)}" id="prev2" class="img-preview-box visible">`
          : `<img id="prev2" class="img-preview-box">`}
      </div>

      <div id="ap-progress" style="display:none;font-size:13px;color:var(--txt2);margin-bottom:12px">
        <span class="spinner"></span>&nbsp;Uploading images, please wait…
      </div>

      <div style="display:flex;gap:12px;margin-top:8px">
        <button type="submit" class="btn-primary" id="ap-submit" style="flex:1;padding:12px">
          ${editId ? 'Update Listing' : 'Post Listing'}
        </button>
        <button type="button" class="btn-ghost"
                style="flex:1;padding:12px"
                onclick="router.navigate('seller-dashboard')">
          Cancel
        </button>
      </div>
    </form>
  </div>`;

  // Image preview
  document.getElementById('ap-img1').addEventListener('change', e => previewFile(e, 'prev1'));
  document.getElementById('ap-img2').addEventListener('change', e => previewFile(e, 'prev2'));

  document.getElementById('ap-form').addEventListener('submit', e => saveProperty(e, editId, prop));
}

function previewFile(e, previewId) {
  const file = e.target.files[0];
  if (!file) return;
  const img = document.getElementById(previewId);
  img.src = URL.createObjectURL(file);
  img.classList.add('visible');
}

async function saveProperty(e, editId, existingProp) {
  e.preventDefault();
  const btn = document.getElementById('ap-submit');
  const prog = document.getElementById('ap-progress');
  btn.disabled = true;

  // Gather values
  const title   = document.getElementById('ap-title').value.trim();
  const desc    = document.getElementById('ap-desc').value.trim();
  const price   = parseFloat(document.getElementById('ap-price').value);
  const pType   = document.getElementById('ap-type').value;
  const listing = document.getElementById('ap-listing').value;
  const status  = document.getElementById('ap-status').value;
  const beds    = parseInt(document.getElementById('ap-beds').value)  || 0;
  const baths   = parseInt(document.getElementById('ap-baths').value) || 0;
  const area    = parseFloat(document.getElementById('ap-area').value) || 0;
  const addr    = document.getElementById('ap-addr').value.trim();
  const city    = document.getElementById('ap-city').value.trim();
  const file1   = document.getElementById('ap-img1').files[0];
  const file2   = document.getElementById('ap-img2').files[0];

  // Keep existing images if editing and no new file chosen
  let image1 = existingProp?.image1 ?? '';
  let image2 = existingProp?.image2 ?? '';

  if (file1 || file2) {
    prog.style.display = 'block';
    try {
      if (file1) image1 = await uploadImage(file1);
      if (file2) image2 = await uploadImage(file2);
    } catch (err) {
      toast('Image upload failed: ' + err.message, 'error');
      prog.style.display = 'none';
      btn.disabled = false;
      return;
    }
    prog.style.display = 'none';
  }

  const payload = {
    title, description: desc, price, property_type: pType,
    listing_type: listing, status, bedrooms: beds, bathrooms: baths,
    area, address: addr, city, image1, image2,
    lister_name:  state.profile.username,
    lister_phone: state.profile.phone ?? '',
    lister_email: state.user.email,
  };

  let error;
  if (editId) {
    ({ error } = await sb.from('properties').update(payload).eq('id', editId));
  } else {
    payload.user_id = state.user.id;
    ({ error } = await sb.from('properties').insert(payload));
  }

  btn.disabled = false;
  if (error) { toast('Error: ' + error.message, 'error'); return; }

  toast(editId ? 'Listing updated!' : 'Listing posted!', 'success');
  router.navigate('seller-dashboard');
}
