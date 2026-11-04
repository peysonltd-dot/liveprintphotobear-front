(() => {
  'use strict';
  const storageKey = 'peyson-system03-admin';
  let key = sessionStorage.getItem(storageKey) || '';
  const css = document.createElement('style');
  css.textContent = `body:not([data-admin-ready]) > :not(#admin-login):not(script){display:none!important}#admin-login{max-width:420px;margin:12vh auto;padding:32px;border:1px solid #475569;border-radius:20px;background:#0f172a;color:#f8fafc}#admin-login h1{font-size:26px;font-weight:900;margin:0 0 12px}#admin-login p{color:#cbd5e1;line-height:1.7}#admin-login label{display:block;margin-top:24px}#admin-login input{width:100%;padding:13px;margin:8px 0 16px;border-radius:8px;border:1px solid #64748b;background:#020617;color:white;box-sizing:border-box}#admin-login button{width:100%;padding:13px;border:0;border-radius:8px;background:#22d3ee;color:#082f49;font-weight:900}#admin-login [role=alert]{color:#fda4af;font-size:14px;min-height:24px}`;
  document.head.appendChild(css);
  async function request(url, options = {}) {
    const target = new URL(url, location.href);
    const base = new URL(window.PEYSON_API_BASE);
    if (target.origin !== base.origin || !target.pathname.startsWith('/api/admin/')) throw new Error('後台連線網址不正確');
    const headers = new Headers(options.headers);
    headers.set('Authorization', 'Bearer ' + key);
    const response = await fetch(target.href, {...options, headers, cache:'no-store'});
    if (response.status === 401 && document.body.dataset.adminReady) logout();
    return response;
  }
  async function verify() {
    const response = await request(window.PEYSON_API_BASE + '/api/admin/session');
    const data = await response.json();
    if (!response.ok || !data.success) throw new Error(data.error || '登入失敗');
    if (data.appId !== window.PEYSON_SYSTEM_ID) throw new Error('連線到其他活動，請通知管理人員');
  }
  function logout() { sessionStorage.removeItem(storageKey); key=''; location.reload(); }
  async function ready() {
    if (key) { try { await verify(); document.body.dataset.adminReady='true'; return; } catch (_) { sessionStorage.removeItem(storageKey); key=''; } }
    const panel=document.createElement('section'); panel.id='admin-login';
    panel.innerHTML='<h1>03 號系統後台</h1><p>請輸入管理密碼以查看訂單及照片。</p><form><label for="admin-password">管理密碼</label><input id="admin-password" type="password" autocomplete="current-password" required><button type="submit">登入後台</button><p role="alert" aria-live="polite"></p></form>';
    document.body.appendChild(panel);
    return new Promise(resolve=>{
      panel.querySelector('form').addEventListener('submit',async event=>{
        event.preventDefault();const button=panel.querySelector('button'),error=panel.querySelector('[role=alert]');
        key=panel.querySelector('input').value.trim();button.disabled=true;error.textContent='';
        try { await verify();sessionStorage.setItem(storageKey,key);document.body.dataset.adminReady='true';panel.remove();resolve(); }
        catch(e){key='';error.textContent=e.message;button.disabled=false;}
      });
    });
  }
  window.PeysonAdmin={ready,request,logout};
})();
