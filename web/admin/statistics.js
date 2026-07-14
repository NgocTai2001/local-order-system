(function () {
  const api = window.orderApi;
  const periodTabs = document.getElementById('statisticsPeriodTabs');
  const dateInput = document.getElementById('statisticsDate');
  const periodLabel = document.getElementById('statisticsPeriodLabel');
  const totalRevenue = document.getElementById('totalRevenue');
  const revenueComparison = document.getElementById('revenueComparison');
  const statisticsList = document.getElementById('statisticsList');
  const statisticsMessage = document.getElementById('statisticsMessage');
  const validTypes = new Set(['day', 'week', 'month']);
  const params = new URLSearchParams(window.location.search);
  let currentType = validTypes.has(params.get('type')) ? params.get('type') : 'day';
  let currentDate = params.get('date') || localDate();
  let requestSequence = 0;
  let refreshTimer;

  function localDate() {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Bangkok',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).formatToParts(new Date());
    const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    return `${values.year}-${values.month}-${values.day}`;
  }

  function parseLocalDate(value) {
    const parts = String(value).split('-').map(Number);
    return new Date(parts[0], (parts[1] || 1) - 1, parts[2] || 1);
  }

  function formatPeriod(result) {
    const start = parseLocalDate(result.period.start);
    const end = parseLocalDate(result.period.end);
    const fullDate = new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    if (result.type === 'month') {
      return new Intl.DateTimeFormat('vi-VN', {
        month: 'long',
        year: 'numeric'
      }).format(start);
    }

    if (result.type === 'week') {
      return `${fullDate.format(start)} - ${fullDate.format(end)}`;
    }

    return fullDate.format(start);
  }

  function initials(name) {
    return String(name || '')
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'M';
  }

  function setLoading() {
    totalRevenue.classList.add('is-loading');
    totalRevenue.textContent = '0 đ';
    revenueComparison.textContent = '';
    periodLabel.textContent = '';
    statisticsMessage.textContent = 'Đang cập nhật...';
    statisticsList.replaceChildren();

    for (let index = 0; index < 4; index += 1) {
      const row = document.createElement('div');
      row.className = 'statistics-skeleton-row';
      row.append(document.createElement('span'), document.createElement('span'), document.createElement('span'));
      statisticsList.append(row);
    }
  }

  function renderComparison(current, previous) {
    revenueComparison.className = 'statistics-comparison';

    if (previous <= 0) {
      revenueComparison.textContent = current > 0
        ? 'Kỳ trước chưa có doanh thu.'
        : 'Chưa phát sinh doanh thu trong kỳ.';
      return;
    }

    const change = ((current - previous) / previous) * 100;
    const direction = change > 0 ? 'Tăng' : change < 0 ? 'Giảm' : 'Không đổi';
    revenueComparison.classList.toggle('is-positive', change > 0);
    revenueComparison.classList.toggle('is-negative', change < 0);
    revenueComparison.textContent = `${direction} ${Math.abs(change).toLocaleString('vi-VN', {
      maximumFractionDigits: 1
    })}% so với kỳ trước`;
  }

  function createItemImage(item) {
    if (item.image) {
      const image = document.createElement('img');
      image.className = 'statistics-item-image';
      image.src = item.image;
      image.alt = '';
      image.loading = 'lazy';
      image.addEventListener('error', () => {
        const placeholder = document.createElement('span');
        placeholder.className = 'statistics-item-placeholder';
        placeholder.textContent = initials(item.name);
        image.replaceWith(placeholder);
      }, { once: true });
      return image;
    }

    const placeholder = document.createElement('span');
    placeholder.className = 'statistics-item-placeholder';
    placeholder.textContent = initials(item.name);
    return placeholder;
  }

  function renderItems(items) {
    statisticsList.replaceChildren();

    if (!items.length) {
      const empty = document.createElement('p');
      empty.className = 'statistics-empty';
      empty.textContent = 'Chưa có dữ liệu thống kê.';
      statisticsList.append(empty);
      return;
    }

    const highestQuantity = Math.max(...items.map((item) => item.quantity), 1);
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

    items.forEach((item, index) => {
      const row = document.createElement('article');
      row.className = 'statistics-item-row';

      const rank = document.createElement('span');
      rank.className = `statistics-rank rank-${index + 1}`;
      rank.textContent = String(index + 1);

      const identity = document.createElement('div');
      identity.className = 'statistics-item-identity';
      const name = document.createElement('strong');
      name.className = 'statistics-item-name';
      name.textContent = item.name;
      identity.append(createItemImage(item), name);

      const progress = document.createElement('div');
      progress.className = 'statistics-progress';
      const progressValue = document.createElement('span');
      progressValue.style.setProperty('--progress', `${Math.max((item.quantity / highestQuantity) * 100, 2)}%`);
      progress.append(progressValue);

      const revenue = document.createElement('strong');
      revenue.className = 'statistics-item-revenue';
      revenue.textContent = api.formatCurrency(item.revenue);

      const quantity = document.createElement('span');
      quantity.className = 'statistics-item-quantity';
      const quantityValue = document.createElement('strong');
      quantityValue.textContent = `${item.quantity.toLocaleString('vi-VN')} phần`;
      const share = document.createElement('span');
      share.textContent = `${((item.quantity / totalQuantity) * 100).toLocaleString('vi-VN', {
        maximumFractionDigits: 1
      })}%`;
      quantity.append(quantityValue, share);

      row.append(rank, identity, progress, revenue, quantity);
      statisticsList.append(row);
    });
  }

  function updateControls() {
    periodTabs.querySelectorAll('[data-type]').forEach((button) => {
      const active = button.dataset.type === currentType;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-selected', String(active));
    });

    if (currentType === 'month') {
      dateInput.type = 'month';
      dateInput.value = currentDate.slice(0, 7);
    } else {
      dateInput.type = 'date';
      dateInput.value = /^\d{4}-\d{2}-\d{2}$/.test(currentDate)
        ? currentDate
        : `${currentDate.slice(0, 7)}-01`;
    }
  }

  async function loadStatistics() {
    const requestId = ++requestSequence;
    setLoading();

    try {
      const result = await api.getStatistics(currentType, currentDate);
      if (requestId !== requestSequence) {
        return;
      }

      currentDate = result.date;
      totalRevenue.classList.remove('is-loading');
      totalRevenue.textContent = api.formatCurrency(result.totalRevenue);
      periodLabel.textContent = formatPeriod(result);
      renderComparison(result.totalRevenue, result.previousTotalRevenue);
      renderItems(result.topItems || []);
      statisticsMessage.textContent = '';

      const urlDate = currentType === 'month' ? currentDate.slice(0, 7) : currentDate;
      window.history.replaceState(null, '', `/admin/statistics.html?type=${currentType}&date=${urlDate}`);
      updateControls();
    } catch (error) {
      if (requestId !== requestSequence) {
        return;
      }

      totalRevenue.classList.remove('is-loading');
      totalRevenue.textContent = api.formatCurrency(0);
      revenueComparison.textContent = '';
      statisticsList.replaceChildren();
      const errorMessage = document.createElement('p');
      errorMessage.className = 'statistics-error';
      errorMessage.textContent = error.message;
      statisticsList.append(errorMessage);
      statisticsMessage.textContent = 'Không thể tải dữ liệu.';
    }
  }

  function scheduleRefresh() {
    window.clearTimeout(refreshTimer);
    refreshTimer = window.setTimeout(loadStatistics, 250);
  }

  periodTabs.addEventListener('click', (event) => {
    const button = event.target.closest('[data-type]');
    if (!button || button.dataset.type === currentType) {
      return;
    }

    currentType = button.dataset.type;
    updateControls();
    loadStatistics();
  });

  dateInput.addEventListener('change', () => {
    if (!dateInput.value) {
      return;
    }
    currentDate = currentType === 'month' ? `${dateInput.value}-01` : dateInput.value;
    loadStatistics();
  });

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      scheduleRefresh();
    }
  });

  if (window.io) {
    const socket = window.io();
    socket.on('order:status_changed', (order) => {
      if (order?.status === 'paid') {
        scheduleRefresh();
      }
    });
  }

  updateControls();
  api.getRestaurantInfo()
    .then((info) => api.applyRestaurantInfo(info, 'Thống kê'))
    .catch(() => {});
  loadStatistics();
})();
