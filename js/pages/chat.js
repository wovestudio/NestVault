// ================================================================
//  NestVault — Chat page (real-time via Supabase)
// ================================================================
import { sb, state }      from '../config.js';
import { esc, timeAgo, toast, loadingHtml } from '../utils/helpers.js';
import { router }         from '../router.js';

export async function renderChat(el, inquiryId) {
  if (!inquiryId) { router.navigate('home'); return; }
  el.innerHTML = loadingHtml('Opening chat…');

  // Fetch inquiry
  const { data: inq, error: ie } = await sb.from('inquiries').select('*').eq('id', inquiryId).single();
  if (ie || !inq) {
    el.innerHTML = `<div style="padding:60px;text-align:center;color:var(--txt2)">Conversation not found.</div>`;
    return;
  }

  // Security — only participants can view
  const isBuyer  = state.user.id === inq.buyer_id;
  const isSeller = state.user.id === inq.seller_id;
  const isAdmin  = state.profile?.role === 'ADMIN';
  if (!isBuyer && !isSeller && !isAdmin) {
    toast('You do not have access to this conversation.', 'error');
    router.navigate('home');
    return;
  }

  // Mark as read if seller
  if (isSeller && inq.status === 'Unread') {
    await sb.from('inquiries').update({ status: 'Read' }).eq('id', inquiryId);
  }

  // Fetch related info
  const [
    { data: prop },
    { data: buyerP },
    { data: sellerP },
  ] = await Promise.all([
    sb.from('properties').select('id,title').eq('id', inq.property_id).single(),
    sb.from('profiles').select('username').eq('id', inq.buyer_id).single(),
    sb.from('profiles').select('username').eq('id', inq.seller_id).single(),
  ]);

  const otherName = isBuyer
    ? (sellerP?.username ?? 'Seller')
    : (buyerP?.username  ?? 'Buyer');

  const backPage = isBuyer ? 'profile' : 'seller-dashboard';

  el.innerHTML = `
  <div class="chat-layout">
    <div class="chat-header">
      <button class="btn-ghost" style="padding:6px 14px"
              onclick="router.navigate('${backPage}')">← Back</button>
      <div class="chat-header-info">
        <div class="chat-header-title">Chat with ${esc(otherName)}</div>
        <div class="chat-header-sub">
          Re: <a href="#" onclick="router.navigate('property-detail',{id:'${esc(inq.property_id)}'});return false;"
                 style="color:var(--pur)">${esc(prop?.title ?? 'Property')}</a>
        </div>
      </div>
    </div>

    <div class="chat-messages" id="chat-msgs"></div>

    <div class="chat-input-bar">
      <input id="chat-input" placeholder="Type a message…"
             onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();sendMsg('${inquiryId}');}">
      <button class="btn-primary" onclick="sendMsg('${inquiryId}')">Send</button>
    </div>
  </div>`;

  // Load initial messages
  await loadMessages(inquiryId);

  // Subscribe real-time
  if (state.chatSub) sb.removeChannel(state.chatSub);
  state.chatSub = sb
    .channel('chat-room-' + inquiryId)
    .on('postgres_changes', {
      event: 'INSERT', schema: 'public', table: 'messages',
      filter: `inquiry_id=eq.${inquiryId}`,
    }, () => loadMessages(inquiryId))
    .subscribe();
}

async function loadMessages(inquiryId) {
  const { data: msgs } = await sb
    .from('messages')
    .select('*')
    .eq('inquiry_id', inquiryId)
    .order('created_at', { ascending: true });

  const el = document.getElementById('chat-msgs');
  if (!el) return;

  if (!msgs || msgs.length === 0) {
    el.innerHTML = `<div style="text-align:center;color:var(--txt2);font-size:13px;margin-top:40px">No messages yet. Say hello! 👋</div>`;
    return;
  }

  el.innerHTML = msgs.map(m => {
    const mine = m.sender_id === state.user.id;
    return `
    <div class="msg-row ${mine ? 'mine' : 'theirs'}">
      <div class="msg-bubble ${mine ? 'mine' : 'theirs'}">
        ${esc(m.body)}
        <span class="msg-time">${timeAgo(m.created_at)}</span>
      </div>
    </div>`;
  }).join('');

  // Auto-scroll to bottom
  el.scrollTop = el.scrollHeight;
}

async function sendMsg(inquiryId) {
  const input = document.getElementById('chat-input');
  const body  = (input?.value ?? '').trim();
  if (!body) return;
  input.value = '';

  const { error } = await sb.from('messages').insert({
    inquiry_id: inquiryId,
    sender_id:  state.user.id,
    body,
  });
  if (error) { toast('Failed to send: ' + error.message, 'error'); input.value = body; }
}

window.sendMsg = sendMsg;
