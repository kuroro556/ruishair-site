/* ============================================================
   RUIS HAIR — 云服务初始化（Supabase）
   纯静态站点，走 CDN <script> 形式加载 supabase-js
   ============================================================ */

// Supabase 连接信息（publishable key 可安全放前端）
const CLOUD_CONFIG = {
  url: "https://fcepnvuovkxjijjlkxyt.supabase.co",
  publishableKey: "sb_publishable_V6L59DMKfwTqUNBbkWEfGA_WIC_Db_2"
};

// 管理员邮箱（后台登录校验用）
const ADMIN_EMAIL = "h15622305767@163.com";

// 云端数据块的 key 约定
const CLOUD_KEYS = {
  categories: "categories",      // 品类+颜色+价格
  siteContent: "site_content",   // 全站文案/公司/收款/社媒/弹窗
  tips: "tips",                  // 护理文章
  reviews: "reviews",            // 客户好评
  whatsapps: "whatsapps",        // 业务员 WhatsApp 号码池
  customers: "customers"         // 客户注册账号
};

// 全局 cloud 实例（SDK 加载后使用）
let cloud = null;
let cloudReady = false;
let cloudReadyError = null;
