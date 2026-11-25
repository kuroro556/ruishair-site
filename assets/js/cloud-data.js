/* ============================================================
   RUIS HAIR — 云数据层（Supabase）
   封装对 site_data 表的读写。前台匿名读，后台登录后写。
   所有函数返回 Promise。数据为空时返回 null（由调用方回退到默认值）。
   ============================================================ */

// 初始化 cloud 实例（SDK 加载完成后调用一次）
function initCloud() {
  if (typeof supabase === 'undefined') {
    cloudReadyError = 'Supabase SDK 未加载';
    return;
  }
  try {
    cloud = supabase.createClient(CLOUD_CONFIG.url, CLOUD_CONFIG.publishableKey);
    cloudReady = true;
  } catch (e) {
    cloudReadyError = String(e && e.message || e);
  }
}

// 读取一个数据块
async function cloudGet(key) {
  if (!cloud) return null;
  try {
    const { data, error } = await cloud
      .from('site_data')
      .select('value')
      .eq('key', key)
      .maybeSingle();
    if (error) { console.warn('[cloud] get', key, error.message); return null; }
    return data ? data.value : null;
  } catch (e) {
    console.warn('[cloud] get', key, e);
    return null;
  }
}

// 写入一个数据块（upsert，key 为主键，存在则更新）
async function cloudSet(key, value) {
  if (!cloud) return { ok: false, msg: '云服务未初始化' };
  try {
    const { error } = await cloud
      .from('site_data')
      .upsert({ key: key, value: value, updated_at: new Date().toISOString() });
    if (error) return { ok: false, msg: error.message };
    return { ok: true };
  } catch (e) {
    return { ok: false, msg: String(e && e.message || e) };
  }
}

// 删除一个数据块
async function cloudDelete(key) {
  if (!cloud) return { ok: false, msg: '云服务未初始化' };
  try {
    const { error } = await cloud.from('site_data').delete().eq('key', key);
    if (error) return { ok: false, msg: error.message };
    return { ok: true };
  } catch (e) {
    return { ok: false, msg: String(e && e.message || e) };
  }
}

/* ---------- 登录相关（后台用） ---------- */

// 邮箱+密码登录
async function cloudSignIn(email, password) {
  if (!cloud) return { ok: false, msg: '云服务未初始化' };
  const { data, error } = await cloud.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, msg: error.message };
  return { ok: true, session: data };
}

// 当前会话
async function cloudGetSession() {
  if (!cloud) return null;
  const { data } = await cloud.auth.getSession();
  return data ? data.session : null;
}

// 登出
async function cloudSignOut() {
  if (!cloud) return;
  await cloud.auth.signOut();
}

/* ---------- 管理员首次注册（邮箱 OTP 验证后设密码） ---------- */

// 发送邮箱验证码
async function cloudSendOtp(email) {
  if (!cloud) return { ok: false, msg: '云服务未初始化' };
  const { data, error } = await cloud.auth.signInWithOtp({ email });
  if (error) return { ok: false, msg: error.message };
  // Supabase signInWithOtp 无 verificationId 概念，返回 data（可能为空）
  return { ok: true, verificationId: null, isExistingUser: null };
}

// 验证邮箱验证码（客户登录/注册用，返回是否通过）
async function cloudVerifyOtp(email, token) {
  if (!cloud) return { ok: false, msg: '云服务未初始化' };
  const { data, error } = await cloud.auth.verifyOtp({
    email: email,
    token: token,
    type: 'email'
  });
  if (error) return { ok: false, msg: '验证码错误或已过期，请重新获取' };
  return { ok: true, session: data };
}

// 验证码验证 + 注册（Supabase 用 verifyOtp，验证后即为已登录用户）
async function cloudSignUp(email, password, verificationId, isExistingUser, token) {
  if (!cloud) return { ok: false, msg: '云服务未初始化' };
  // Supabase：verifyOtp 用邮箱 + token；如需设密码，验证后 updateUser
  const { data, error } = await cloud.auth.verifyOtp({
    email: email,
    token: token,
    type: 'email'
  });
  if (error) return { ok: false, msg: error.message };
  // 若提供了密码，设置密码
  if (password) {
    const { error: pwErr } = await cloud.auth.updateUser({ password });
    if (pwErr) return { ok: false, msg: pwErr.message };
  }
  return { ok: true, session: data };
}
