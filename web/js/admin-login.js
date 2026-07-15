(function () {
  const form = document.getElementById('adminLoginForm');
  const email = document.getElementById('adminEmail');
  const password = document.getElementById('adminPassword');
  const passwordToggle = document.getElementById('adminPasswordToggle');
  const submitButton = document.getElementById('adminLoginSubmit');
  const submitText = submitButton.querySelector('span') || submitButton;
  const message = document.getElementById('adminLoginMessage');

  function nextPath() {
    const params = new URLSearchParams(window.location.search);
    const next = params.get('next') || '/admin';

    if (!next.startsWith('/admin') || next.startsWith('/admin/login')) {
      return '/admin';
    }

    return next;
  }

  function setMessage(text, type = 'error') {
    message.textContent = text || '';
    message.classList.toggle('is-error', Boolean(type === 'error' && text));
    message.classList.toggle('is-success', Boolean(type === 'success' && text));
  }

  function reasonMessage() {
    const reason = new URLSearchParams(window.location.search).get('reason');
    if (reason === 'expired') {
      return {
        text: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
        type: 'error'
      };
    }

    if (reason === 'forbidden') {
      return {
        text: 'Tài khoản này không có quyền quản trị quán.',
        type: 'error'
      };
    }

    if (reason === 'logout') {
      return {
        text: 'Bạn đã đăng xuất khỏi trang quản trị.',
        type: 'success'
      };
    }

    return { text: '', type: 'error' };
  }

  async function redirectIfLoggedIn() {
    try {
      await window.adminAuth.ready;
      const session = await window.adminAuth.getSession();
      if (session?.access_token) {
        await window.adminAuth.requireAdmin();
        window.location.replace(nextPath());
      }
    } catch (error) {
      if (!reasonMessage().text) {
        setMessage(error.message || 'Không thể kiểm tra phiên đăng nhập.');
      }
    }
  }

  passwordToggle.addEventListener('click', () => {
    const showPassword = password.type === 'password';
    password.type = showPassword ? 'text' : 'password';
    passwordToggle.classList.toggle('is-visible', showPassword);
    passwordToggle.setAttribute('aria-label', showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu');
    passwordToggle.setAttribute('aria-pressed', String(showPassword));
    password.focus();
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    setMessage('');
    submitButton.disabled = true;
    submitButton.classList.add('is-loading');
    submitText.textContent = 'Đang đăng nhập...';

    try {
      await window.adminAuth.signIn(email.value.trim(), password.value);
      window.location.replace(nextPath());
    } catch (error) {
      setMessage(error.message || 'Đăng nhập thất bại.');
      password.focus();
    } finally {
      submitButton.disabled = false;
      submitButton.classList.remove('is-loading');
      submitText.textContent = 'Đăng nhập';
    }
  });

  const initialMessage = reasonMessage();
  setMessage(initialMessage.text, initialMessage.type);
  requestAnimationFrame(() => {
    if (!email.value) {
      email.focus();
    }
  });
  redirectIfLoggedIn();
})();
