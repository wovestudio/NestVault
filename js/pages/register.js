// ================================================================
//  NestVault — Register page
// ================================================================
import { sb }    from '../config.js';
import { toast } from '../utils/helpers.js';
import { router } from '../router.js';

export function renderRegister(el, { errMsg = '' } = {}) {
  el.innerHTML = `
  <div class="auth-layout">
    <div class="auth-left">
      <div class="auth-heading">Join <span>NestVault</span><br>today — it's free</div>
      <p class="auth-subtext">
        Whether you're looking to buy, rent, or sell —
        NestVault connects you with the right people fast.
      </p>
      <div style="margin-top:24px">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">
          <div style="width:32px;height:32px;border-radius:50%;background:var(--purglow);display:flex;align-items:center;justify-content:center;font-size:14px">🏠</div>
          <span style="font-size:13px;color:var(--txt2)">List and manage properties as a Seller</span>
        </div>
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">
          <div style="width:32px;height:32px;border-radius:50%;background:var(--purglow);display:flex;align-items:center;justify-content:center;font-size:14px">🔍</div>
          <span style="font-size:13px;color:var(--txt2)">Search and contact sellers as a Buyer</span>
        </div>
        <div style="display:flex;align-items:center;gap:10px">
          <div style="width:32px;height:32px;border-radius:50%;background:var(--purglow);display:flex;align-items:center;justify-content:center;font-size:14px">💬</div>
          <span style="font-size:13px;color:var(--txt2)">Send inquiries directly to property owners</span>
        </div>
      </div>
    </div>
    <div class="auth-right">
      <div class="auth-form-box">
        <p class="auth-switch">Already have an account?
          <a href="#" onclick="router.navigate('login');return false;">Sign in</a>
        </p>
        <h2 style="font-family:var(--font-head);font-size:22px;font-weight:700;margin-bottom:20px">Create Account</h2>
        ${errMsg ? `<div class="msg-error">${errMsg}</div>` : ''}
        <form id="reg-form">
          <div class="form-group">
            <label>Full Name</label>
            <input type="text" id="rg-name" required placeholder="Your full name">
          </div>
          <div class="form-group">
            <label>Email Address</label>
            <input type="email" id="rg-email" required placeholder="you@email.com">
          </div>
          <div class="form-group">
            <label>Password</label>
            <input type="password" id="rg-pass" required placeholder="Min 6 characters" minlength="6">
          </div>
          <div class="form-group">
            <label>Phone Number</label>
            <input type="text" id="rg-phone" required placeholder="+94 77 000 0000">
          </div>
          <div class="form-group">
            <label>I want to</label>
            <select id="rg-role" required>
              <option value="BUYER">Buy / Rent Properties</option>
              <option value="SELLER">Sell / List Properties</option>
            </select>
          </div>
          <button type="submit" class="btn-primary btn-full" style="margin-top:8px" id="rg-btn">
            Create Account
          </button>
        </form>
        <p style="font-size:11px;color:var(--txt3);text-align:center;margin-top:14px">
          By signing up you agree to our
          <a href="#" onclick="router.navigate('terms');return false;" style="color:var(--pur)">Terms of Service</a>
          and
          <a href="#" onclick="router.navigate('privacy');return false;" style="color:var(--pur)">Privacy Policy</a>.
          <br>Supabase will send you a confirmation email — check your inbox!
        </p>
      </div>
    </div>
  </div>`;

  document.getElementById('reg-form').addEventListener('submit', async e => {
    e.preventDefault();
    const btn = document.getElementById('rg-btn');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span>&nbsp;Creating account…';

    const username = document.getElementById('rg-name').value.trim();
    const email    = document.getElementById('rg-email').value.trim();
    const pass     = document.getElementById('rg-pass').value;
    const phone    = document.getElementById('rg-phone').value.trim();
    const role     = document.getElementById('rg-role').value;

    const { error } = await sb.auth.signUp({
      email,
      password: pass,
      options: { data: { username, phone, role } },
    });

    if (error) { renderRegister(el, { errMsg: error.message }); return; }

    toast('Account created! Check your email to confirm, then sign in.', 'success');
    // Navigate to login — pass a success message via a query-style state approach
    window._loginSuccessMsg = '✅ Account created! Check your email for a confirmation link, then sign in.';
    router.navigate('login');
  });
}
