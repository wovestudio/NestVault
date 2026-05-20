// ================================================================
//  NestVault — Entry point
// ================================================================
import { auth }   from './auth.js';
import { router } from './router.js';
import { initTheme } from './utils/theme.js';

// Make router and auth globally accessible for inline onclick handlers
window.router = router;
window.auth   = auth;

async function boot() {
  // Apply saved theme before first render to avoid flash
  initTheme();

  // Load Supabase session (sets state.user + state.profile)
  await auth.loadSession();

  // Render initial page
  router.navigate('home');

  // Subscribe to auth state changes (email confirmation, etc.)
  auth.listen();
}

boot();
