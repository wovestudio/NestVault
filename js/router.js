// ================================================================
//  NestVault — Router
// ================================================================
import { state, sb }       from './config.js';
import { navHtml, footerHtml, toast } from './utils/helpers.js';
import { bindThemeToggle } from './utils/theme.js';

// Page renderers — imported lazily to keep module tree clean
import { renderHome }            from './pages/home.js';
import { renderLogin }           from './pages/login.js';
import { renderRegister }        from './pages/register.js';
import { renderProperties }      from './pages/properties.js';
import { renderSearch }          from './pages/search.js';
import { renderPropertyDetail }  from './pages/property-detail.js';
import { renderAddProperty }     from './pages/add-property.js';
import { renderSellerDashboard } from './pages/seller-dashboard.js';
import { renderAdmin }           from './pages/admin.js';
import { renderProfile }         from './pages/profile.js';
import { renderChat }            from './pages/chat.js';
import { renderTerms }           from './pages/terms.js';
import { renderPrivacy }         from './pages/privacy.js';

const SHELL = document.getElementById('app');

export const router = {
  current: null,
  params:  {},

  navigate(page, params = {}) {
    // Kill any active chat subscription when leaving chat
    if (page !== 'chat' && state.chatSub) {
      sb.removeChannel(state.chatSub);
      state.chatSub = null;
    }
    this.current = page;
    this.params  = params;
    this._render(page, params);
    window.scrollTo(0, 0);
  },

  refresh() {
    if (this.current) this._render(this.current, this.params);
  },

  _render(page, params) {
    // Guard routes
    const needsAuth = ['add-property','seller-dashboard','admin','profile','chat'];
    if (needsAuth.includes(page) && !state.user) {
      toast('Please sign in first.', 'error');
      page = 'login';
    }

    // Inject nav + content shell
    SHELL.innerHTML = navHtml(state.profile, state.user) + `<div id="page-content"></div>`;
    bindThemeToggle();

    const content = document.getElementById('page-content');

    switch (page) {
      case 'home':             renderHome(content);                    break;
      case 'login':            renderLogin(content);                   break;
      case 'register':         renderRegister(content);                break;
      case 'properties':       renderProperties(content);              break;
      case 'search':           renderSearch(content, params);          break;
      case 'property-detail':  renderPropertyDetail(content, params.id); break;
      case 'add-property':     renderAddProperty(content, params);     break;
      case 'seller-dashboard': renderSellerDashboard(content);         break;
      case 'admin':            renderAdmin(content);                   break;
      case 'profile':          renderProfile(content);                 break;
      case 'chat':             renderChat(content, params.inquiryId);  break;
      case 'terms':            renderTerms(content);                   break;
      case 'privacy':          renderPrivacy(content);                 break;
      default:                 renderHome(content);
    }
  },
};
