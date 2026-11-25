/* ============================================================
   RUIS HAIR — 云端同步层（前台使用）
   加载时机：在 data.js 之后、main.js 之前。
   职责：
   1. 初始化 SDK（initCloud）
   2. 异步从云端拉取全部数据块
   3. 若云端有数据 → 写回 localStorage（覆盖本地缓存），并标记需要刷新
   4. 若云端无数据（首次）→ 把 data.js 的默认数据上传到云端（种子初始化）
   注意：不主动 reload，避免干扰；由各页面通过 window.__cloudSynced 判断。
   ============================================================ */

(function () {
  // 等 DOM 基本可用后执行（body 解析完成后）
  function bootstrap() {
    initCloud();
    if (!cloudReady) {
      console.warn('[cloud-sync] 云服务未就绪，使用本地数据');
      return;
    }
    syncAll();
  }

  // 拉取全部数据块并同步到 localStorage
  async function syncAll() {
    try {
      const tasks = [
        { key: CLOUD_KEYS.categories, store: STORE.categories },
        { key: CLOUD_KEYS.siteContent, store: STORE.siteContent },
        { key: CLOUD_KEYS.tips, store: STORE.tips },
        { key: CLOUD_KEYS.reviews, store: STORE.reviews },
        { key: CLOUD_KEYS.whatsapps, store: STORE.whatsapps },
        { key: CLOUD_KEYS.customers, store: STORE.users }
      ];

      let changed = false;
      for (const t of tasks) {
        const val = await cloudGet(t.key);
        if (val == null) continue;
        // 云端有数据 → 覆盖本地缓存（仅当不同才标记 changed）
        const cur = localStorage.getItem(t.store);
        const next = JSON.stringify(val);
        if (cur !== next) {
          localStorage.setItem(t.store, next);
          changed = true;
        }
      }

      // 若本地缓存被云端更新，刷新一次页面让 data.js 读到最新数据
      if (changed && !sessionStorage.getItem('__cloud_reloading')) {
        sessionStorage.setItem('__cloud_reloading', '1');
        location.reload();
        return;
      }
      sessionStorage.removeItem('__cloud_reloading');

      // 标记同步完成
      window.__cloudSynced = true;
      if (typeof window.__onCloudSynced === 'function') {
        try { window.__onCloudSynced(); } catch (e) {}
      }
    } catch (e) {
      console.warn('[cloud-sync] 同步失败，使用本地数据', e);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }
})();
