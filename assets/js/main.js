/* ============================================================
   RUIS HAIR — 公共交互脚本
   ============================================================ */

/* ---------- 工具 ---------- */
function escAttr(s) { return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

/* ---------- 图标 ---------- */
const ICONS = {
  search:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>',
  cart:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 4h2l2.4 11.2a2 2 0 002 1.6h7.7a2 2 0 002-1.6L21 8H6"/><circle cx="10" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/></svg>',
  user:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/></svg>',
  menu:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>',
  close:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 5l14 14M19 5L5 19"/></svg>',
  mail:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>',
  phone:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 3h4l2 5-2.5 1.5a12 12 0 006 6L16 13l5 2v4a2 2 0 01-2 2C10 21 3 14 3 5a2 2 0 012-2z"/></svg>',
  pin:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s7-6.5 7-12a7 7 0 10-14 0c0 5.5 7 12 7 12z"/><circle cx="12" cy="10" r="2.6"/></svg>',
  check:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12l5 5L20 6"/></svg>',
  ship:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17l2-7h14l2 7M3 17h18M3 17c0 2 2 3 4 3s4-1 4-3M13 17c0 2 2 3 4 3s4-1 4-3M12 3v7M9 6h6"/></svg>',
  shield:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6z"/><path d="M9 12l2 2 4-4"/></svg>',
  spark:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8z"/><path d="M19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z"/></svg>',
  wa:      '<svg viewBox="0 0 24 24"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 004.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2zm0 18.1h-.01a8.2 8.2 0 01-4.17-1.14l-.3-.18-3.11.81.83-3.03-.2-.31a8.18 8.18 0 01-1.26-4.35c0-4.53 3.69-8.21 8.22-8.21 2.2 0 4.26.86 5.81 2.41a8.16 8.16 0 012.4 5.8c0 4.53-3.68 8.2-8.21 8.2zm4.5-6.13c-.25-.12-1.46-.72-1.69-.8-.23-.08-.39-.12-.56.12-.17.25-.64.8-.78.97-.14.17-.29.19-.53.06-.25-.12-1.04-.38-1.99-1.23-.73-.65-1.23-1.46-1.37-1.71-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.43.13-.14.17-.25.25-.42.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.23.25-.87.85-.87 2.07s.89 2.4 1.02 2.56c.12.17 1.75 2.67 4.24 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.47-.07 1.46-.6 1.66-1.17.21-.58.21-1.07.14-1.17-.06-.11-.23-.17-.48-.29z"/></svg>',
  ins:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none"/></svg>',
  fb:      '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 8h2.5V4.5H14c-2.5 0-4 1.6-4 4V11H7.5v3.5H10V21h3.5v-6.5h2.6l.4-3.5h-3V8.6c0-.5.3-.6.5-.6z"/></svg>',
  tk:      '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.6 3c.3 1.9 1.6 3.2 3.4 3.5v2.6c-1.3 0-2.5-.4-3.4-1.1v5.9c0 3.4-2.6 5.7-5.7 5.7-2.6 0-4.9-1.8-5.5-4.2-.7-3 1.4-5.9 4.4-5.9.4 0 .8 0 1.2.1v2.8c-.4-.1-.8-.2-1.2-.2-1.4 0-2.5 1.2-2.4 2.7.1 1.4 1.2 2.4 2.6 2.4 1.4 0 2.5-1.1 2.5-2.5V3h3.1z"/></svg>'
};

/* ---------- 顶部公告 + 导航 + 页脚 渲染 ---------- */
function renderHeader(active) {
  const nav = `
  <div class="topbar"><div class="wrap">
    <b>Quality Remy Human Hair Since 2005</b>
    <span class="tb-long">— Factory Price · Low MOQ · 1~3 Days Fast Shipping · Custom Packaging</span>
  </div></div>
  <header class="header"><div class="wrap">
    <nav class="nav">
      <a class="brand" href="index.html"><img src="${IMG}logo.png" alt="Ruis Hair"><span class="btxt">RUIS HAIR<small>VIRGIN REMY HAIR</small></span></a>
      <ul class="menu">
        <li><a href="index.html" class="${active==='home'?'active':''}">Home</a></li>
        <li class="drop"><a href="products.html" class="${active==='products'?'active':''}">Products</a>
          <ul class="dropdown">
            ${CATEGORIES.slice(0,6).map(c=>`<a href="products.html?cat=${c.id}">${c.name}</a>`).join('')}
          </ul>
        </li>
        <li><a href="about.html" class="${active==='about'?'active':''}">About Us</a></li>
        <li><a href="tips.html" class="${active==='tips'?'active':''}">Hair Tips</a></li>
        <li><a href="faq.html" class="${active==='faq'?'active':''}">FAQ</a></li>
        <li><a href="contact.html" class="${active==='contact'?'active':''}">Contact</a></li>
      </ul>
      <div class="nav-actions">
        <button class="icon-btn" id="searchBtn" aria-label="Search">${ICONS.search}</button>
        <button class="icon-btn" id="accountBtn" aria-label="Account">${ICONS.user}</button>
        <button class="icon-btn" id="cartBtn" aria-label="Cart">${ICONS.cart}<span class="cart-count" id="cartCount">0</span></button>
        <button class="icon-btn menu-toggle" id="menuBtn" aria-label="Menu">${ICONS.menu}</button>
      </div>
    </nav>
  </div></header>
  <div class="overlay" id="overlay"></div>
  <aside class="mobile-panel" id="mobilePanel">
    <div class="mp-head"><span class="h3">Menu</span><button class="icon-btn" id="closeMenu">${ICONS.close}</button></div>
    <a href="index.html">Home</a>
    <a href="products.html">All Products</a>
    ${CATEGORIES.map(c=>`<a class="sub" href="products.html?cat=${c.id}">${c.name}</a>`).join('')}
    <a href="about.html">About Us</a>
    <a href="tips.html">Hair Tips</a>
    <a href="faq.html">FAQ</a>
    <a href="contact.html">Contact</a>
    <a class="btn btn-gold btn-block" href="mailto:${COMPANY.email}">Get a Quote</a>
  </aside>`;
  document.body.insertAdjacentHTML('afterbegin', nav);
}

function renderFooter() {
  const sc = getSiteContent();
  const cm = sc.company;
  const html = `
  <section class="cta-band"><div class="wrap">
    <div><h2>${cm.ctaTitle}</h2><p>${cm.ctaDesc}</p></div>
    <a class="btn btn-light" href="contact.html">${cm.ctaBtn}</a>
  </div></section>
  <footer class="footer"><div class="wrap">
    <div>
      <a class="brand" href="index.html"><img src="${IMG}logo.png" alt="Ruis Hair"><span class="btxt">${cm.logoText}<small>${cm.logoSub}</small></span></a>
      <p class="fdesc">${cm.footerDesc}</p>
      <div class="socials">
        ${cm.instagram ? `<a href="${escAttr(cm.instagram)}" target="_blank" rel="noopener" aria-label="Instagram">${ICONS.ins}</a>` : ''}
        ${cm.facebook ? `<a href="${escAttr(cm.facebook)}" target="_blank" rel="noopener" aria-label="Facebook">${ICONS.fb}</a>` : ''}
        ${cm.tiktok ? `<a href="${escAttr(cm.tiktok)}" target="_blank" rel="noopener" aria-label="TikTok">${ICONS.tk}</a>` : ''}
        <a href="https://wa.me/${pickWhatsApp()}" target="_blank" aria-label="WhatsApp">${ICONS.wa.replace('<svg','<svg width="16" height="16"')}</a>
        <a href="mailto:${COMPANY.email}" aria-label="Email">${ICONS.mail}</a>
      </div>
    </div>
    <div class="fcol"><h4>Shop</h4><ul>
      ${CATEGORIES.slice(0,6).map(c=>`<li><a href="products.html?cat=${c.id}">${c.name}</a></li>`).join('')}
    </ul></div>
    <div class="fcol"><h4>Quick Links</h4><ul>
      <li><a href="about.html">About Us</a></li>
      <li><a href="products.html">All Products</a></li>
      <li><a href="invoice.html">Proforma Invoice</a></li>
      <li><a href="tips.html">Hair Care Tips</a></li>
      <li><a href="faq.html">FAQ's</a></li>
      <li><a href="contact.html">Contact Us</a></li>
    </ul></div>
    <div class="fcol"><h4>Contact</h4>
      <div class="fa">${ICONS.mail}<span>Email: <a href="mailto:${COMPANY.email}">${COMPANY.email}</a></span></div>
      <div class="fa">${ICONS.phone}<span>Phone / WhatsApp:<br>${COMPANY.phone}</span></div>
      <div class="fa">${ICONS.pin}<span>${COMPANY.address}</span></div>
    </div>
  </div>
  <div class="footer-bottom"><div class="wrap">
    <span>Copyright © ${new Date().getFullYear()} ${cm.copyright} · All rights reserved.</span>
    <a href="faq.html">Shipping Option</a><a href="faq.html">Privacy Policy</a><a href="faq.html">Returns & Exchanges</a>
  </div></div>
  </footer>
  <a class="wa-float wa-float-direct" id="waDirect" href="https://wa.me/${pickWhatsApp()}" target="_blank" rel="noopener" aria-label="Chat on WhatsApp" title="Chat with a sales rep on WhatsApp">${ICONS.wa}</a>
  <div class="cart-drawer" id="cartDrawer">
    <div class="cart-head"><h3>Your Cart (<span id="cartCount2">0</span>)</h3><button class="icon-btn" id="closeCart">${ICONS.close}</button></div>
    <div class="cart-body" id="cartBody"></div>
    <div class="cart-foot"><div class="cart-total"><span>Subtotal</span><b id="cartTotal">$0.00</b></div>
      <a class="btn btn-gold btn-block" href="mailto:${COMPANY.email}?subject=Order%20Inquiry">Send Order Inquiry</a>
      <p class="muted" style="font-size:11.5px;text-align:center;margin-top:10px">We'll confirm price & shipping with you shortly.</p>
    </div>
  </div>
  <div class="toast" id="toast"></div>`;
  document.body.insertAdjacentHTML('beforeend', html);
}

/* ---------- 右侧悬浮社媒按钮组（INS / FB / TK，与 WhatsApp 统一风格，后台可编辑链接） ---------- */
function renderHeroSocials() {
  const cm = getSiteContent().company;
  const items = [
    { href: cm.instagram, icon: ICONS.ins, label: 'Instagram' },
    { href: cm.facebook, icon: ICONS.fb, label: 'Facebook' },
    { href: cm.tiktok, icon: ICONS.tk, label: 'TikTok' }
  ].filter(x => x.href);
  if (!items.length) return;
  const html = `<div class="social-float" id="socialFloat">
    ${items.map(x => `<a href="${escAttr(x.href)}" target="_blank" rel="noopener" aria-label="${x.label}" title="${x.label}">${x.icon}</a>`).join('')}
  </div>`;
  document.body.insertAdjacentHTML('beforeend', html);
}

/* ---------- 客户账户：注册 / 验证码登录（弹窗） ---------- */
function renderAccount() {
  const html = `
  <div class="modal-mask" id="accountModal">
    <div class="modal account-modal">
      <div class="modal-head"><h3 id="accModalTitle">Sign In</h3><button class="icon-btn" onclick="closeAccount()">✕</button></div>
      <div class="acc-tabs">
        <button class="acc-tab active" data-tab="login" type="button">Sign In</button>
        <button class="acc-tab" data-tab="register" type="button">Register</button>
      </div>

      <!-- 登录 -->
      <div class="acc-pane" id="acc-login">
        <div class="modal-body">
          <div class="field"><label>Email</label><input id="loginEmail" type="email" placeholder="you@example.com"></div>
          <div class="field"><label>Verification Code</label>
            <div class="code-row">
              <input id="loginCode" maxlength="6" inputmode="numeric" placeholder="6-digit code">
              <button class="btn btn-outline" type="button" id="sendCodeBtn">Send Code</button>
            </div>
            <div class="code-hint" id="codeHint"></div>
          </div>
        </div>
        <div class="modal-foot"><button class="btn btn-light" onclick="closeAccount()">Cancel</button><button class="btn btn-gold" id="loginSubmitBtn">Sign In</button></div>
      </div>

      <!-- 注册 -->
      <div class="acc-pane" id="acc-register" style="display:none">
        <div class="modal-body">
          <div class="field"><label>Name *</label><input id="regName" placeholder="Your full name"></div>
          <div class="field"><label>Email *</label><input id="regEmail" type="email" placeholder="you@example.com"></div>
          <div class="grid2">
            <div class="field"><label>Country</label><select id="regCountry">${COUNTRIES.map(c=>`<option value="${c}">${c}</option>`).join('')}</select></div>
            <div class="field"><label>Phone</label><input id="regPhone" placeholder="+1 555 000 0000"></div>
          </div>
          <div class="field"><label>Address</label><input id="regAddress" placeholder="Street, City, ZIP"></div>
          <div class="field"><label>Avatar (optional)</label>
            <div class="tip-img-upload">
              <img id="regAvatarPreview" src="" alt="" style="display:none;border-radius:50%">
              <div class="tip-upload-btns">
                <button class="btn btn-outline" type="button" onclick="document.getElementById('regAvatarFile').click()">Upload avatar</button>
                <input type="file" id="regAvatarFile" accept="image/*" style="display:none">
              </div>
              <input id="regAvatar" placeholder="Or paste an image URL">
            </div>
          </div>
        </div>
        <div class="modal-foot"><button class="btn btn-light" onclick="closeAccount()">Cancel</button><button class="btn btn-gold" id="registerSubmitBtn">Create Account</button></div>
      </div>
    </div>
  </div>

  <!-- 账户下拉菜单 -->
  <div class="account-menu" id="accountMenu" style="display:none"></div>`;

  document.body.insertAdjacentHTML('beforeend', html);
  bindAccount();
}

function bindAccount() {
  const modal = document.getElementById('accountModal');
  const menu = document.getElementById('accountMenu');
  const btn = document.getElementById('accountBtn');
  if (!modal || !btn) return;

  let sentCode = null;   // 已发送的验证码
  let sendTs = 0;        // 发送时间戳，用于 60s 倒计时

  // Tab 切换
  document.querySelectorAll('.acc-tab').forEach(t => {
    t.addEventListener('click', () => {
      document.querySelectorAll('.acc-tab').forEach(x => x.classList.remove('active'));
      t.classList.add('active');
      const which = t.dataset.tab;
      document.getElementById('acc-login').style.display = which === 'login' ? 'block' : 'none';
      document.getElementById('acc-register').style.display = which === 'register' ? 'block' : 'none';
      document.getElementById('accModalTitle').textContent = which === 'login' ? 'Sign In' : 'Create Account';
    });
  });

  // 发送验证码（走 Supabase 真实邮件 OTP）
  document.getElementById('sendCodeBtn').addEventListener('click', async () => {
    const email = document.getElementById('loginEmail').value.trim();
    if (!isValidEmail(email)) { alert('Please enter a valid email address.'); return; }
    if (sendTs && (Date.now() - sendTs) < 60000) {
      const left = Math.ceil((60000 - (Date.now() - sendTs)) / 1000);
      alert('Please wait ' + left + 's before resending.'); return;
    }
    // 调用 Supabase 发送 OTP 验证码邮件
    if (typeof cloudSendOtp === 'function' && typeof cloud !== 'undefined') {
      const hint = document.getElementById('codeHint');
      hint.textContent = 'Sending verification code…';
      hint.style.display = 'block';
      const res = await cloudSendOtp(email);
      if (!res.ok) {
        hint.textContent = res.msg || 'Failed to send code. Please try again.';
        return;
      }
      sentCode = true; // 标记已发送（真实验证码由 Supabase 校验，本地只记录"已发送"）
      sendTs = Date.now();
      hint.textContent = 'Verification code sent to ' + email + '. Please check your inbox (and spam folder).';
      showToast('Verification code sent to your email');
    } else {
      // 兜底：云端不可用时退回本地演示模式
      sentCode = genCode();
      sendTs = Date.now();
      const hint = document.getElementById('codeHint');
      hint.textContent = 'Demo mode — your code is: ' + sentCode + ' (valid 5 min)';
      hint.style.display = 'block';
      showToast('Verification code sent (see hint below)');
    }
    // 倒计时
    const b = document.getElementById('sendCodeBtn');
    b.disabled = true;
    let sec = 60;
    const timer = setInterval(() => {
      sec--;
      if (sec <= 0) { clearInterval(timer); b.disabled = false; b.textContent = 'Send Code'; }
      else b.textContent = sec + 's';
    }, 1000);
  });

  // 登录（验证码验证走 Supabase）
  document.getElementById('loginSubmitBtn').addEventListener('click', async () => {
    const email = document.getElementById('loginEmail').value.trim();
    const code = document.getElementById('loginCode').value.trim();
    if (!isValidEmail(email)) { alert('Please enter a valid email address.'); return; }
    if (!sentCode) { alert('Please send a verification code first.'); return; }
    if (!code) { alert('Please enter the verification code.'); return; }

    // 优先用 Supabase 验证真实验证码
    if (typeof cloudVerifyOtp === 'function' && typeof cloud !== 'undefined') {
      const verifyRes = await cloudVerifyOtp(email, code);
      if (!verifyRes.ok) {
        alert(verifyRes.msg || 'Incorrect or expired verification code.');
        return;
      }
      // 验证码通过。若该邮箱尚未注册过本地客户，则为新用户（走注册流程提示）
      const r = loginUser(email);
      if (!r.ok) {
        // 登录时邮箱未注册 → 提示先注册
        alert(r.msg);
        return;
      }
      closeAccount();
      refreshAccountUI();
      showToast('Welcome back, ' + r.user.name + '!');
      return;
    }

    // 兜底：本地演示模式校验
    if (code !== sentCode) { alert('Incorrect verification code.'); return; }
    const r = loginUser(email);
    if (!r.ok) { alert(r.msg); return; }
    closeAccount();
    refreshAccountUI();
    showToast('Welcome back, ' + r.user.name + '!');
  });

  // 注册
  document.getElementById('registerSubmitBtn').addEventListener('click', () => {
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    if (!name) { alert('Please enter your name.'); return; }
    if (!isValidEmail(email)) { alert('Please enter a valid email address.'); return; }
    const r = registerUser({
      name,
      email,
      country: document.getElementById('regCountry').value,
      phone: document.getElementById('regPhone').value.trim(),
      address: document.getElementById('regAddress').value.trim(),
      avatar: document.getElementById('regAvatar').value.trim()
    });
    if (!r.ok) { alert(r.msg); return; }
    closeAccount();
    refreshAccountUI();
    showToast('Account created. Welcome, ' + r.user.name + '!');
  });

  // 头像上传
  document.getElementById('regAvatarFile').addEventListener('change', function(e) {
    const f = e.target.files[0]; if (!f) return;
    if (f.size > 2 * 1024 * 1024) { alert('Image too large. Max 2MB.'); return; }
    const r = new FileReader();
    r.onload = () => {
      document.getElementById('regAvatar').value = r.result;
      document.getElementById('regAvatarPreview').src = r.result;
      document.getElementById('regAvatarPreview').style.display = 'block';
    };
    r.readAsDataURL(f);
    e.target.value = '';
  });

  // 账户按钮：显示下拉菜单
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    renderAccountMenu();
    const rect = btn.getBoundingClientRect();
    menu.style.display = 'block';
    menu.style.top = (rect.bottom + 8) + 'px';
    menu.style.right = (window.innerWidth - rect.right) + 'px';
  });
  document.addEventListener('click', (e) => {
    if (!menu.contains(e.target) && e.target !== btn) menu.style.display = 'none';
  });
}

function renderAccountMenu() {
  const menu = document.getElementById('accountMenu');
  const user = getCurrentUser();
  const btn = document.getElementById('accountBtn');
  if (!menu) return;
  if (user) {
    btn.innerHTML = user.avatar
      ? `<span class="nav-avatar"><img src="${user.avatar}" alt=""></span>`
      : ICONS.user;
    menu.innerHTML = `
      <div class="am-head">
        ${user.avatar ? `<div class="am-avatar"><img src="${user.avatar}" alt=""></div>` : `<div class="am-avatar am-avatar-fb"></div>`}
        <div><b>${user.name}</b><span>${user.email}</span></div>
      </div>
      <a href="account.html">My Account</a>
      <a href="javascript:void(0)" onclick="doLogout()">Sign Out</a>`;
  } else {
    btn.innerHTML = ICONS.user;
    menu.innerHTML = `
      <div class="am-head"><div class="am-avatar am-avatar-fb"></div><div><b>Guest</b><span>Sign in to track orders</span></div></div>
      <a href="javascript:void(0)" onclick="openAccount('login')">Sign In</a>
      <a href="javascript:void(0)" onclick="openAccount('register')">Register</a>`;
  }
}

function refreshAccountUI() { renderAccountMenu(); }

function openAccount(tab) {
  const modal = document.getElementById('accountModal');
  const menu = document.getElementById('accountMenu');
  if (menu) menu.style.display = 'none';
  modal.classList.add('show');
  const t = tab === 'register' ? 'register' : 'login';
  document.querySelectorAll('.acc-tab').forEach(x => x.classList.toggle('active', x.dataset.tab === t));
  document.getElementById('acc-login').style.display = t === 'login' ? 'block' : 'none';
  document.getElementById('acc-register').style.display = t === 'register' ? 'block' : 'none';
  document.getElementById('accModalTitle').textContent = t === 'login' ? 'Sign In' : 'Create Account';
}

function closeAccount() { const m = document.getElementById('accountModal'); if (m) m.classList.remove('show'); }
function doLogout() { logoutUser(); refreshAccountUI(); showToast('Signed out'); }

/* ---------- 首页弹窗（节假日活动） ---------- */
function renderPopup() {
  // 仅首页显示
  if (document.body.dataset.page !== 'home') return;
  const p = getSiteContent().popup || {};
  if (!p.enabled) return;                 // 后台未启用则完全不渲染
  // 「只显示一次」：本浏览器关闭过就不再自动弹出
  if (p.showOnce && localStorage.getItem('ruis_popup_closed') === '1') return;

  const html = `
  <div class="popup-mask" id="popupMask">
    <div class="popup-card">
      <button class="popup-close" id="popupClose" aria-label="Close">${ICONS.close}</button>
      ${p.image ? `<div class="popup-img"><img src="${p.image}" alt=""></div>` : ''}
      <div class="popup-body">
        ${p.badge ? `<span class="popup-badge">${p.badge}</span>` : ''}
        <h3 class="popup-title">${p.title}</h3>
        ${p.subtitle ? `<p class="popup-sub">${p.subtitle}</p>` : ''}
        ${p.btnText ? `<a class="btn btn-gold btn-block" href="${p.btnLink || 'contact.html'}">${p.btnText}</a>` : ''}
        ${p.footerNote ? `<div class="popup-note">${p.footerNote}</div>` : ''}
      </div>
    </div>
  </div>`;
  document.body.insertAdjacentHTML('beforeend', html);

  const mask = document.getElementById('popupMask');
  const close = document.getElementById('popupClose');
  const show = () => mask.classList.add('show');
  const hide = () => {
    mask.classList.remove('show');
    if (p.showOnce) localStorage.setItem('ruis_popup_closed', '1');
    setTimeout(() => mask.remove(), 300);
  };
  // 延迟弹出
  setTimeout(show, Number(p.delay) || 0);
  close.addEventListener('click', hide);
  // 点遮罩空白处也可关闭
  mask.addEventListener('click', e => { if (e.target === mask) hide(); });
}

/* ---------- 商品卡片 ---------- */
// colorProduct 卡片：颜色作为独立商品展示（列表页/首页特色区）
function colorProductCard(p) {
  const img = p.img || p.cover || '';
  const title = p.title || (p.catName ? p.catName + ' · ' + p.name : p.name);
  return `<article class="pcard" onclick="goColor('${p.catId}', '${encodeURIComponent(p.name)}')" style="cursor:pointer">
    <div class="imgbox">
      <img src="${img}" alt="${title}" loading="lazy">
      <div class="quick"><button class="btn btn-gold btn-block" onclick="event.stopPropagation();goColor('${p.catId}', '${encodeURIComponent(p.name)}')">View</button></div>
    </div>
    <div class="info">
      <div class="cat-name">${p.catName || p.catSub || ''}</div>
      <div class="pname">${p.name}</div>
      <div class="price">${money(p.price)} <small>/ 100g</small>
        <a class="p-wa" href="https://wa.me/${pickWhatsApp()}?text=${encodeURIComponent('Hi Ruis Hair, best price for ' + (p.catName||'') + ' · ' + p.name + '?')}" target="_blank" onclick="event.stopPropagation()" title="Chat for best price">${ICONS.wa}</a>
      </div>
    </div>
  </article>`;
}
// 品类卡片（首页分类区用）
function productCard(c) {
  const img = c.cover || (c.colors && c.colors[0] ? c.colors[0].img : '');
  const minPrice = c.colors && c.colors.length
    ? Math.min(...c.colors.map(cl => Number(cl.prices && cl.prices[16] || 0)))
    : (c.base || 0);
  return `<article class="pcard" onclick="goProduct('${c.id}')" style="cursor:pointer">
    <div class="imgbox">
      <img src="${img}" alt="${c.name}" loading="lazy">
      <div class="quick"><button class="btn btn-gold btn-block" onclick="event.stopPropagation();goProduct('${c.id}')">View Colors</button></div>
    </div>
    <div class="info">
      <div class="cat-name">${c.sub || ''}</div>
      <div class="pname">${c.name}</div>
      <div class="price">${money(minPrice)} <small>from · ${c.colors ? c.colors.length : 0} colors</small></div>
    </div>
  </article>`;
}
function goProduct(id){ window.location.href = 'product.html?id=' + id; }
function goColor(catId, colorName){ window.location.href = 'product.html?id=' + catId + '&color=' + colorName; }

/* ---------- 购物车（localStorage） ---------- */
function getCart() { try { return JSON.parse(localStorage.getItem('ruis_cart')) || []; } catch(e) { return []; } }
function saveCart(c) { localStorage.setItem('ruis_cart', JSON.stringify(c)); updateCartUI(); }
function addToCart(id, opts) {
  opts = opts || {};
  const cart = getCart();
  const key = id + '|' + (opts.color || '') + '|' + (opts.len || '');
  const exist = cart.find(i => i.key === key);
  if (exist) exist.qty += (opts.qty) || 1;
  else {
    const p = getCategory(id) || CATEGORIES.find(x => x.id === id) || {};
    const color = (p.colors || []).find(cl => cl.name === opts.color) || (p.colors && p.colors[0]);
    const img = (color && color.img) || p.cover || '';
    // 价格：优先用传入的 opts.price（已按颜色+尺寸算好），否则用 16 寸价
    let price = Number(opts.price);
    if (!price) {
      const len = opts.len ? parseInt(opts.len) : 16;
      price = color && color.prices ? Number(color.prices[len] || color.prices[16] || 0) : 0;
    }
    cart.push({ key, id, qty: opts.qty || 1, color: opts.color || '', len: opts.len || '', price: price || 0, name: p.name || '', img: img });
  }
  saveCart(cart);
  showToast('Added to cart');
  openCart();
}
function quickAdd(id) { addToCart(id); }
function updateCartUI() {
  const cart = getCart();
  const count = cart.reduce((s,i)=>s+i.qty,0);
  ['cartCount','cartCount2'].forEach(id=>{ const el=document.getElementById(id); if(el) el.textContent = count; });
  const body = document.getElementById('cartBody');
  const total = document.getElementById('cartTotal');
  if (body) {
    if (!cart.length) {
      body.innerHTML = `<div class="cart-empty">${ICONS.cart}<p>Your cart is empty.</p></div>`;
    } else {
      body.innerHTML = cart.map(i=>`<div class="cart-item">
        <img src="${i.img}" alt="">
        <div class="ci-info">
          <div class="ci-name">${i.name}</div>
          <div class="ci-meta">${[i.color,i.len].filter(Boolean).join(' · ') || 'Standard'}</div>
          <div class="ci-price">${money(i.price)} × ${i.qty}</div>
          <button class="ci-rm" onclick="removeCart('${i.key}')">Remove</button>
        </div>
      </div>`).join('');
    }
    if (total) total.textContent = money(cart.reduce((s,i)=>s+i.price*i.qty,0));
  }
}
function removeCart(key) { saveCart(getCart().filter(i=>i.key!==key)); }
function openCart(){ document.getElementById('cartDrawer')?.classList.add('open'); document.getElementById('overlay')?.classList.add('show'); }
function closeCart(){ document.getElementById('cartDrawer')?.classList.remove('open'); }

/* ---------- 提示 ---------- */
let toastTimer;
function showToast(msg){
  const t=document.getElementById('toast'); if(!t) return;
  t.textContent=msg; t.classList.add('show');
  clearTimeout(toastTimer); toastTimer=setTimeout(()=>t.classList.remove('show'),2200);
}

/* ---------- 绑定公共事件 ---------- */
function bindCommon() {
  document.getElementById('menuBtn')?.addEventListener('click', ()=>{ document.getElementById('mobilePanel').classList.add('open'); document.getElementById('overlay').classList.add('show'); });
  document.getElementById('closeMenu')?.addEventListener('click', closeAll);
  document.getElementById('cartBtn')?.addEventListener('click', openCart);
  document.getElementById('closeCart')?.addEventListener('click', closeAll);
  document.getElementById('searchBtn')?.addEventListener('click', ()=>{ window.location.href='products.html'; });
  document.getElementById('overlay')?.addEventListener('click', closeAll);
  document.getElementById('searchForm')?.addEventListener('submit', e=>{
    e.preventDefault(); const q=document.getElementById('searchInput').value.trim();
    window.location.href='products.html?q='+encodeURIComponent(q);
  });
}
function closeAll(){ document.getElementById('mobilePanel')?.classList.remove('open'); document.getElementById('cartDrawer')?.classList.remove('open'); document.getElementById('overlay')?.classList.remove('show'); }

/* ---------- 在线聊天窗口已移除（改用 WhatsApp 直连按钮） ---------- */
function initChat() {
  // 业务员直连浮动按钮：每次点击随机分配一名业务员再跳转
  const waDirect = document.getElementById('waDirect');
  if (waDirect) {
    waDirect.addEventListener('click', (e)=>{
      e.preventDefault();
      const q = new URLSearchParams(location.search).get('q') || '';
      const productId = new URLSearchParams(location.search).get('id') || '';
      const ctx = productId ? `I'm looking at a product on your site (${productId}).` : (q ? `I'm interested in: ${q}` : "Hi Ruis Hair, I'd like a quote.");
      window.open('https://wa.me/' + pickWhatsApp() + '?text=' + encodeURIComponent(ctx), '_blank');
    });
  }
}

/* ---------- 滚动出现动画 ---------- */
function initReveal(){
  const obs = new IntersectionObserver(entries=>{
    entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); obs.unobserve(e.target);} });
  },{threshold:.12});
  document.querySelectorAll('.reveal').forEach(el=>obs.observe(el));
}

/* ---------- 初始化 ---------- */
document.addEventListener('DOMContentLoaded', ()=>{
  const active = document.body.dataset.page || '';
  renderHeader(active);
  renderFooter();
  renderAccount();
  renderPopup();
  renderHeroSocials();
  bindCommon();
  updateCartUI();
  initChat();
  initReveal();
  refreshAccountUI();
});
