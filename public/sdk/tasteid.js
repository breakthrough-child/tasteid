/*! TasteID SDK — "Sign in with Taste". Dependency-free. MIT. */
(function () {
  var script = document.currentScript;
  var BASE = script ? new URL(script.src).origin : location.origin;
  var CSS = '.tid-btn{all:unset;box-sizing:border-box;cursor:pointer;display:inline-flex;align-items:center;gap:10px;padding:11px 18px 11px 12px;border-radius:999px;background:#0b0d17;color:#fff;font:600 14px/1 system-ui,sans-serif;border:1px solid rgba(255,255,255,.18);box-shadow:0 0 0 1px #ff5a36 inset,0 6px 20px -8px #ff5a36;transition:transform .15s}.tid-btn:hover{transform:translateY(-1px)}.tid-btn[disabled]{opacity:.6;cursor:wait}.tid-ico{width:24px;height:24px;border-radius:50%;background:conic-gradient(from 200deg,#ff5a36,#ffb347,#6ee7ff,#a78bfa,#ff5a36);display:grid;place-items:center;font-size:12px;color:#0b0d17}.tid-ok{background:#12301f;box-shadow:0 0 0 1px #34d399 inset}';
  var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);

  function rand(n) { var a = new Uint8Array(n); crypto.getRandomValues(a); return b64(a); }
  function b64(buf) { var s = ''; new Uint8Array(buf).forEach(function (b) { s += String.fromCharCode(b); }); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
  function sha(v) { return crypto.subtle.digest('SHA-256', new TextEncoder().encode(v)).then(b64); }

  function signIn(opts) {
    var verifier = rand(48), state = rand(16), redirect = BASE + '/sdk/callback.html';
    return sha(verifier).then(function (challenge) {
      var q = new URLSearchParams({ client_id: opts.clientId, redirect_uri: redirect, scope: opts.scopes.join(' '), state: state, code_challenge: challenge, code_challenge_method: 'S256' });
      var url = BASE + '/authorize?' + q;
      var w = window.open(url, 'tasteid', 'width=460,height=720');
      if (!w) { // popup blocked: full-page redirect fallback; callback.html returns here with the code in the URL fragment
        var q2 = new URLSearchParams(q); q2.set('state', state + '.' + btoa(location.href.split('#')[0]).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''));
        try { sessionStorage.setItem('tid_pending', JSON.stringify({ verifier: verifier, state: q2.get('state'), clientId: opts.clientId, redirect: redirect })); } catch (e) { throw new Error('Popup blocked'); }
        location.href = BASE + '/authorize?' + q2; return new Promise(function () {});
      }
      return new Promise(function (resolve, reject) {
        function onMsg(e) {
          var d = e.data; if (!d || d.type !== 'tasteid:callback') return;
          window.removeEventListener('message', onMsg); clearInterval(t);
          if (d.error || d.state !== state || !d.code) return reject(new Error(d.error || 'state_mismatch'));
          fetch(BASE + '/api/oauth/token', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ grant_type: 'authorization_code', code: d.code, client_id: opts.clientId, redirect_uri: redirect, code_verifier: verifier }) })
            .then(function (r) { return r.json(); }).then(function (j) { if (j.error) throw new Error(j.error); resolve({ accessToken: j.access_token, scopes: j.scope.split(' '), expiresIn: j.expires_in }); }).catch(reject);
        }
        window.addEventListener('message', onMsg);
        var t = setInterval(function () { if (w.closed) { clearInterval(t); setTimeout(function () { window.removeEventListener('message', onMsg); reject(new Error('closed')); }, 600); } }, 500);
      });
    });
  }

  function api(token) {
    function h() { return { authorization: 'Bearer ' + token, 'content-type': 'application/json' }; }
    return {
      taste: function () { return fetch(BASE + '/api/v1/taste', { headers: h() }).then(function (r) { return r.json(); }); },
      recommend: function (body) { return fetch(BASE + '/api/v1/recommend', { method: 'POST', headers: h(), body: JSON.stringify(body) }).then(function (r) { return r.json(); }); }
    };
  }

  function mount(el) {
    if (el.__tid) return; el.__tid = 1;
    var opts = { clientId: el.getAttribute('data-client-id'), scopes: (el.getAttribute('data-scopes') || 'taste:summary').split(/[ ,]+/).filter(Boolean) };
    var cb = el.getAttribute('data-callback');
    var b = document.createElement('button'); b.className = 'tid-btn'; b.type = 'button';
    b.innerHTML = '<span class="tid-ico">✦</span><span>Sign in with Taste</span>';
    b.onclick = function () {
      b.disabled = true;
      signIn(opts).then(function (res) {
        b.className = 'tid-btn tid-ok'; b.innerHTML = '<span class="tid-ico">✓</span><span>TasteID connected</span>';
        var detail = Object.assign({ api: api(res.accessToken) }, res);
        el.dispatchEvent(new CustomEvent('tasteid:signin', { detail: detail, bubbles: true }));
        if (cb && window[cb]) window[cb](detail);
      }).catch(function (e) { b.disabled = false; if (el.getAttribute('data-onerror') && window[el.getAttribute('data-onerror')]) window[el.getAttribute('data-onerror')](e); });
    };
    el.appendChild(b);
  }
  function resume() {
    var m = location.hash.match(/tasteid_code=([^&]+)&tasteid_state=([^&]+)/), p;
    try { p = JSON.parse(sessionStorage.getItem('tid_pending') || 'null'); } catch (e) {}
    if (!m || !p || decodeURIComponent(m[2]) !== p.state) return;
    sessionStorage.removeItem('tid_pending'); history.replaceState(null, '', location.pathname + location.search);
    fetch(BASE + '/api/oauth/token', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ grant_type: 'authorization_code', code: decodeURIComponent(m[1]), client_id: p.clientId, redirect_uri: p.redirect, code_verifier: p.verifier }) })
      .then(function (r) { return r.json(); }).then(function (j) {
        if (j.error) return; var d = Object.assign({ api: api(j.access_token) }, { accessToken: j.access_token, scopes: j.scope.split(' '), expiresIn: j.expires_in });
        function fire() { document.dispatchEvent(new CustomEvent('tasteid:signin', { detail: d })); var el = document.querySelector('[data-tasteid-button] .tid-btn'); if (el) { el.className = 'tid-btn tid-ok'; el.innerHTML = '<span class="tid-ico">✓</span><span>TasteID connected</span>'; } }
        setTimeout(fire, 400);
      });
  }
  function scan() { document.querySelectorAll('[data-tasteid-button]').forEach(mount); }
  resume();
  window.TasteID = { signIn: signIn, api: api, mount: mount, scan: scan, base: BASE };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', scan); else scan();
})();
