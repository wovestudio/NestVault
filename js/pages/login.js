// ================================================================
//  NestVault — Login page
// ================================================================
import { sb, state }   from '../config.js';
import { auth }        from '../auth.js';
import { toast }       from '../utils/helpers.js';
import { router }      from '../router.js';

export function renderLogin(el, { errMsg = '', sucMsg = '' } = {}) {
  // Pick up cross-page success message (from register)
  if (!sucMsg && window._loginSuccessMsg) {
    sucMsg = window._loginSuccessMsg;
    window._loginSuccessMsg = null;
  }
  el.innerHTML = `
  <div class="auth-layout">
    <div class="auth-left">
      <div class="auth-heading">Welcome back<br>to <span>NestVault</span></div>
      <p class="auth-subtext">
        Sign in to access your listings, saved properties,
        and messages from buyers and sellers.
      </p>
      <div class="auth-stats">
        <div><div class="auth-stat-num">500+</div><div class="auth-stat-lbl">Active Listings</div></div>
        <div><div class="auth-stat-num">2K+</div><div class="auth-stat-lbl">Members</div></div>
        <div><div class="auth-stat-num">100%</div><div class="auth-stat-lbl">Free to Join</div></div>
      </div>
    </div>
    <div class="auth-right">
      <div class="auth-form-box">
        <p class="auth-switch">No account?
          <a href="#" onclick="router.navigate('register');return false;">Sign up free</a>
        </p>
        <h2 style="font-family:var(--font-head);font-size:22px;font-weight:700;margin-bottom:20px">Sign In</h2>
        ${errMsg ? `<div class="msg-error">${errMsg}</div>` : ''}
        ${sucMsg ? `<div class="msg-success">${sucMsg}</div>` : ''}
        <form id="login-form">
          <div class="form-group">
            <label>Email address</label>
            <input type="email" id="li-email" required placeholder="you@email.com">
          </div>
          <div class="form-group">
            <label>Password</label>
            <input type="password" id="li-pass" required placeholder="••••••••">
          </div>
          <button type="submit" class="btn-primary btn-full" style="margin-top:8px" id="li-btn">Sign In</button>
        </form>
        <div class="divider"><span>or</span></div>
        <p style="font-size:12px;color:var(--txt2);text-align:center">
          Forgot your password?
          <a href="#" style="color:var(--pur)" onclick="handleForgotPassword();return false;">Reset it here</a>
        </p>
      </div>
    </div>
  </div>`;

  document.getElementById('login-form').addEventListener('submit', async e => {
    e.preventDefault();
    const btn = document.getElementById('li-btn');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span>&nbsp;Signing in…';

    const email = document.getElementById('li-email').value.trim();
    const pass  = document.getElementById('li-pass').value;

    const { error } = await sb.auth.signInWithPassword({ email, password: pass });
    if (error) {
      renderLogin(el, { errMsg: error.message });
      return;
    }

    await auth.loadSession();

    if (state.profile?.status === 'Banned') {
      await sb.auth.signOut();
      state.user = null; state.profile = null;
      renderLogin(el, { errMsg: 'Your account has been suspended. Please contact support.' });
      return;
    }

    toast(`Welcome back, ${state.profile?.username ?? ''}!`, 'success');
    router.navigate('home');
  });
}

async function handleForgotPassword() {
  const email = prompt('Enter your email address to receive a password reset link:');
  if (!email) return;
  const { error } = await sb.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin,
  });
  if (error) { toast(error.message, 'error'); return; }
  toast('Password reset email sent! Check your inbox.', 'success');
}

// expose for inline onclick
window.handleForgotPassword = handleForgotPassword;
