// ================================================================
//  NestVault — Theme (dark / light) toggle
// ================================================================

export function initTheme() {
  const saved = localStorage.getItem('nv-theme') || 'dark';
  applyTheme(saved);
}

export function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('nv-theme', theme);
  // Sync any checkboxes that might be in the current nav
  document.querySelectorAll('.theme-checkbox').forEach(cb => { cb.checked = theme === 'light'; });
  document.querySelectorAll('#theme-thumb').forEach(el => { el.textContent = theme === 'light' ? '☀️' : '🌙'; });
}

// Called after nav is re-injected
export function bindThemeToggle() {
  document.querySelectorAll('.theme-checkbox').forEach(cb => {
    cb.addEventListener('change', () => {
      applyTheme(cb.checked ? 'light' : 'dark');
    });
  });
}
