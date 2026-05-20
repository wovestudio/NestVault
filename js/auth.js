// ================================================================
//  NestVault — Auth
// ================================================================
import { sb, state } from './config.js';
import { toast }     from './utils/helpers.js';

// Lazy getter avoids circular import (auth ↔ router)
function getRouter() { return window.router; }

export const auth = {

  async loadSession() {
    const { data: { session } } = await sb.auth.getSession();
    if (session?.user) {
      state.user = session.user;
      const { data } = await sb.from('profiles').select('*').eq('id', state.user.id).single();
      state.profile = data ?? null;
    } else {
      state.user    = null;
      state.profile = null;
    }
  },

  async logout() {
    if (state.chatSub) { sb.removeChannel(state.chatSub); state.chatSub = null; }
    await sb.auth.signOut();
    state.user    = null;
    state.profile = null;
    toast('Signed out successfully.', 'success');
    getRouter().navigate('home');
  },

  /** Listen for Supabase auth events (email confirmation, etc.) */
  listen() {
    sb.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        state.user = session.user;
        // Trigger may take a tick to insert the profile row
        await new Promise(r => setTimeout(r, 600));
        const { data } = await sb.from('profiles').select('*').eq('id', state.user.id).single();
        state.profile = data ?? null;
        getRouter().refresh();
      } else if (event === 'SIGNED_OUT') {
        state.user    = null;
        state.profile = null;
        getRouter().refresh();
      }
    });
  },
};
