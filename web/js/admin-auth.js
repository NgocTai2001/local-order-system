(function () {
  const LOGIN_PATH = '/admin/login';
  const ADMIN_ROOT = '/admin';
  let config = null;
  let client = null;
  let session = null;
  let profile = null;

  function isLoginPage() {
    return window.location.pathname === LOGIN_PATH || window.location.pathname === `${LOGIN_PATH}.html`;
  }

  function isAdminPage() {
    return window.location.pathname === ADMIN_ROOT ||
      window.location.pathname === '/admin.html' ||
      window.location.pathname.startsWith('/admin/');
  }

  function loginUrl(reason) {
    const params = new URLSearchParams();
    const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;

    if (!isLoginPage()) {
      params.set('next', current);
    }

    if (reason) {
      params.set('reason', reason);
    }

    return `${LOGIN_PATH}${params.toString() ? `?${params.toString()}` : ''}`;
  }

  function redirectToLogin(reason) {
    if (!isLoginPage()) {
      window.location.replace(loginUrl(reason));
    }
  }

  async function fetchConfig() {
    const response = await fetch('/api/admin-auth/config', {
      headers: { accept: 'application/json' }
    });

    if (!response.ok) {
      throw new Error('Không thể tải cấu hình đăng nhập admin.');
    }

    return response.json();
  }

  function createClient() {
    if (!config.adminAuthRequired) {
      return null;
    }

    if (!config.supabaseUrl || !config.supabaseAnonKey) {
      throw new Error('Admin login chưa được cấu hình Supabase URL/Anon key.');
    }

    if (!window.supabase?.createClient) {
      throw new Error('Không tải được Supabase client. Vui lòng kiểm tra kết nối mạng.');
    }

    return window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });
  }

  async function init() {
    config = await fetchConfig();
    client = createClient();

    if (!client) {
      document.documentElement.classList.add('admin-auth-ready');
      return null;
    }

    const result = await client.auth.getSession();
    if (result.error) {
      throw new Error(result.error.message || 'Không thể khôi phục phiên đăng nhập.');
    }

    session = result.data.session || null;
    client.auth.onAuthStateChange((event, nextSession) => {
      session = nextSession || null;
      if (!session && isAdminPage() && !isLoginPage()) {
        redirectToLogin(event === 'SIGNED_OUT' ? 'logout' : 'expired');
      }
    });

    document.documentElement.classList.add('admin-auth-ready');
    return session;
  }

  const ready = init().catch((error) => {
    document.documentElement.classList.add('admin-auth-ready');
    throw error;
  });

  async function getSession() {
    await ready;
    if (!client) {
      return null;
    }

    if (session?.access_token) {
      return session;
    }

    const result = await client.auth.getSession();
    if (result.error) {
      throw new Error(result.error.message || 'Không thể khôi phục phiên đăng nhập.');
    }

    session = result.data.session || null;
    return session;
  }

  async function getAccessToken(options = {}) {
    await ready;

    if (!config.adminAuthRequired) {
      return '';
    }

    const currentSession = await getSession();
    if (!currentSession?.access_token) {
      if (options.redirectOnMissing !== false) {
        redirectToLogin('expired');
      }
      throw new Error('Bạn cần đăng nhập admin.');
    }

    return currentSession.access_token;
  }

  async function requestAdminProfile() {
    const token = await getAccessToken({ redirectOnMissing: false });
    const response = await fetch('/api/admin-auth/me', {
      headers: {
        accept: 'application/json',
        authorization: `Bearer ${token}`
      }
    });

    if (response.status === 401) {
      redirectToLogin('expired');
      throw new Error('Phiên đăng nhập đã hết hạn.');
    }

    if (response.status === 403) {
      redirectToLogin('forbidden');
      throw new Error('Tài khoản không có quyền quản trị quán này.');
    }

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body.error || 'Không thể kiểm tra quyền admin.');
    }

    const body = await response.json();
    profile = body.user || null;
    return profile;
  }

  function bindLogoutButton() {
    document.querySelectorAll('[data-admin-logout]').forEach((button) => {
      if (button.dataset.bound === '1') {
        return;
      }

      button.dataset.bound = '1';
      button.hidden = false;
      button.addEventListener('click', async () => {
        await signOut();
      });
    });
  }

  async function requireAdmin() {
    try {
      await ready;

      if (!config.adminAuthRequired) {
        bindLogoutButton();
        return null;
      }

      await requestAdminProfile();
      bindLogoutButton();
      return profile;
    } catch (error) {
      if (!isLoginPage()) {
        redirectToLogin(error.message.includes('quyền') ? 'forbidden' : 'expired');
      }
      throw error;
    }
  }

  async function signIn(email, password) {
    await ready;

    if (!config.adminAuthRequired) {
      return { session: null, user: null };
    }

    if (!client) {
      throw new Error('Supabase client chưa sẵn sàng.');
    }

    const result = await client.auth.signInWithPassword({ email, password });
    if (result.error) {
      throw new Error(result.error.message || 'Email hoặc mật khẩu không đúng.');
    }

    session = result.data.session || null;
    await requestAdminProfile();
    return result.data;
  }

  async function signOut() {
    await ready.catch(() => null);

    if (client) {
      await client.auth.signOut();
    }

    window.location.replace(loginUrl('logout'));
  }

  function shouldAuthorize(path, method = 'GET') {
    if (!config?.adminAuthRequired && config !== null) {
      return false;
    }

    const url = new URL(path, window.location.origin);
    const route = url.pathname;
    const verb = String(method || 'GET').toUpperCase();

    if (!route.startsWith('/api/')) {
      return false;
    }

    if (route.startsWith('/api/admin-auth/')) {
      return route === '/api/admin-auth/me';
    }

    if (
      route.startsWith('/api/admin/') ||
      route.startsWith('/api/statistics') ||
      route.startsWith('/api/areas') ||
      route.startsWith('/api/uploads')
    ) {
      return true;
    }

    if (route.startsWith('/api/menu')) {
      return verb !== 'GET' || url.searchParams.get('all') === '1';
    }

    if (route.startsWith('/api/tables')) {
      if (route.startsWith('/api/tables/token/')) {
        return false;
      }

      if (route.endsWith('/current-bill') || route.endsWith('/current-session')) {
        return false;
      }

      return true;
    }

    return false;
  }

  window.adminAuth = {
    getAccessToken,
    getSession,
    redirectToLogin,
    ready,
    requireAdmin,
    shouldAuthorize,
    signIn,
    signOut
  };
})();
