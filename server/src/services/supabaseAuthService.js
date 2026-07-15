const { httpError } = require('../utils/httpError');

const ADMIN_ROLES = new Set(['owner', 'admin', 'staff']);

function isAdminAuthRequired() {
  return process.env.ADMIN_AUTH_REQUIRED !== 'false';
}

function cleanUrl(value) {
  return String(value || '').trim().replace(/\/+$/, '');
}

function getRestaurantId() {
  return String(process.env.RESTAURANT_ID || process.env.STORE_ID || '').trim();
}

function getStoreColumn() {
  return String(process.env.ADMIN_STORE_COLUMN || (process.env.STORE_ID && !process.env.RESTAURANT_ID ? 'store_id' : 'restaurant_id')).trim();
}

function getPublicAuthConfig() {
  return {
    adminAuthRequired: isAdminAuthRequired(),
    supabaseUrl: cleanUrl(process.env.SUPABASE_URL),
    supabaseAnonKey: String(process.env.SUPABASE_ANON_KEY || '').trim()
  };
}

function getServerConfig() {
  return {
    ...getPublicAuthConfig(),
    supabaseServiceRoleKey: String(process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim(),
    restaurantId: getRestaurantId(),
    storeColumn: getStoreColumn()
  };
}

function ensureConfigured(config) {
  if (
    !config.supabaseUrl ||
    !config.supabaseAnonKey ||
    !config.supabaseServiceRoleKey ||
    !config.restaurantId ||
    !config.storeColumn
  ) {
    throw httpError(503, 'Chưa cấu hình Supabase Auth cho admin.');
  }
}

async function readJson(response) {
  const text = await response.text();
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    return null;
  }
}

async function getSupabaseUser(config, accessToken) {
  const response = await fetch(`${config.supabaseUrl}/auth/v1/user`, {
    headers: {
      apikey: config.supabaseAnonKey,
      authorization: `Bearer ${accessToken}`
    }
  });

  if (response.status === 401 || response.status === 403) {
    throw httpError(401, 'Phiên đăng nhập admin không hợp lệ hoặc đã hết hạn.');
  }

  if (!response.ok) {
    throw httpError(503, 'Không thể xác thực với Supabase Auth.');
  }

  const user = await readJson(response);
  if (!user?.id) {
    throw httpError(401, 'Phiên đăng nhập admin không hợp lệ.');
  }

  return user;
}

async function getAdminProfile(config, user) {
  const url = new URL(`${config.supabaseUrl}/rest/v1/admin_users`);
  url.searchParams.set('id', `eq.${user.id}`);
  url.searchParams.set(config.storeColumn, `eq.${config.restaurantId}`);
  url.searchParams.set('select', `id,email,${config.storeColumn},role`);
  url.searchParams.set('limit', '1');

  const response = await fetch(url, {
    headers: {
      apikey: config.supabaseServiceRoleKey,
      authorization: `Bearer ${config.supabaseServiceRoleKey}`,
      accept: 'application/json'
    }
  });
  const body = await readJson(response);

  if (!response.ok) {
    if (body?.code === 'PGRST205') {
      throw httpError(503, 'Chưa tạo bảng admin_users trên Supabase.');
    }

    if (body?.code === 'PGRST204') {
      throw httpError(503, 'Bảng admin_users thiếu cột restaurant_id/store_id.');
    }

    if (body?.code === '42501') {
      throw httpError(503, 'Supabase chưa cấp quyền đọc bảng admin_users cho service_role.');
    }

    throw httpError(503, 'Không thể kiểm tra quyền admin trên Supabase.');
  }

  const rows = body;
  const profile = Array.isArray(rows) ? rows[0] : null;
  if (!profile || !ADMIN_ROLES.has(profile.role)) {
    throw httpError(403, 'Tài khoản không có quyền quản trị quán này.');
  }

  return {
    id: user.id,
    email: profile.email || user.email || '',
    restaurant_id: profile.restaurant_id || profile.store_id || config.restaurantId,
    role: profile.role
  };
}

async function verifyAdminAccess(accessToken) {
  if (!isAdminAuthRequired()) {
    return {
      id: 'local-dev-admin',
      email: 'local-dev-admin',
      restaurant_id: getRestaurantId() || 'local',
      role: 'owner'
    };
  }

  const config = getServerConfig();
  ensureConfigured(config);

  const user = await getSupabaseUser(config, accessToken);
  return getAdminProfile(config, user);
}

module.exports = {
  getPublicAuthConfig,
  isAdminAuthRequired,
  verifyAdminAccess
};
