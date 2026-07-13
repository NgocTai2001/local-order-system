(function () {
  const api = window.orderApi;
  const ordersList = document.getElementById('ordersList');
  const orderSummary = document.getElementById('orderSummary');
  const connectionStatus = document.getElementById('connectionStatus');
  const activeStatuses = new Set(['pending', 'cooking', 'ready']);
  let orders = [];

  async function loadRestaurantInfo() {
    try {
      const info = await api.getRestaurantInfo();
      api.applyRestaurantInfo(info, 'Bếp');
    } catch (error) {
      // Bếp vẫn nhận đơn bình thường nếu cấu hình quán chưa tải được.
    }
  }

  function setConnectionMessage(text) {
    connectionStatus.textContent = text || '';
    connectionStatus.hidden = !text;
  }

  function formatTime(value) {
    const raw = String(value || '').trim();
    if (!raw) {
      return '';
    }

    const hasTimezone = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(raw);
    const normalized = raw.includes('T')
      ? `${raw}${hasTimezone ? '' : 'Z'}`
      : `${raw.replace(' ', 'T')}Z`;
    const date = new Date(normalized);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  function statusLabel(status) {
    return {
      pending: 'Mới',
      cooking: 'Đang làm',
      ready: 'Hoàn thành',
      served: 'Đã phục vụ',
      cancelled: 'Đã hủy',
      paid: 'Đã thanh toán'
    }[status] || status;
  }

  function upsertOrder(order) {
    const index = orders.findIndex((current) => current.id === order.id);

    if (!activeStatuses.has(order.status)) {
      orders = orders.filter((current) => current.id !== order.id);
      return;
    }

    if (index >= 0) {
      orders[index] = order;
    } else {
      orders = [...orders, order];
    }

    sortOrders();
  }

  function sortOrders() {
    orders.sort((first, second) => {
      const firstCreated = String(first.created_at || '');
      const secondCreated = String(second.created_at || '');
      return firstCreated.localeCompare(secondCreated) || first.id - second.id;
    });
  }

  function applyStatusChange(payload) {
    const orderId = payload.id || payload.order_id;
    const order = orders.find((current) => current.id === orderId);

    if (!order) {
      loadOrders();
      return;
    }

    order.status = payload.status;
    upsertOrder(order);
    renderOrders();
  }

  function createStatusButton(order, status, label, danger) {
    const button = document.createElement('button');
    button.className = `${danger ? 'danger-button' : 'ghost-button'} status-step-button`;
    if (order.status === status) {
      button.classList.add('is-active');
    }
    button.type = 'button';
    button.textContent = label;
    button.disabled = order.status === status;
    button.addEventListener('click', () => updateStatus(order.id, status, button));
    return button;
  }

  function renderOrders() {
    ordersList.replaceChildren();
    orderSummary.textContent = `${orders.length} đơn`;

    if (orders.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'empty-state';
      empty.textContent = 'Chưa có đơn trong bếp.';
      ordersList.append(empty);
      return;
    }

    for (const order of orders) {
      const card = document.createElement('article');
      card.className = 'order-card';

      const header = document.createElement('div');
      const title = document.createElement('h2');
      title.textContent = order.table_name || `Bàn ${order.table_token}`;
      const meta = document.createElement('div');
      meta.className = 'order-meta';
      meta.innerHTML = `<span>#${order.id} · ${statusLabel(order.status)}</span><time>${formatTime(order.created_at)}</time>`;
      header.append(title, meta);

      const list = document.createElement('ul');
      list.className = 'order-items';
      for (const item of order.items) {
        const line = document.createElement('li');
        const quantity = document.createElement('b');
        quantity.textContent = item.quantity;
        const info = document.createElement('span');
        info.className = 'kitchen-item-info';
        const name = document.createElement('span');
        name.textContent = item.name;
        info.append(name);

        for (const option of item.options || []) {
          const optionLine = document.createElement('small');
          optionLine.textContent = `${option.group_name}: ${option.value_name}`;
          info.append(optionLine);
        }

        if (item.customer_note) {
          const note = document.createElement('small');
          note.textContent = `Ghi chú: ${item.customer_note}`;
          info.append(note);
        }

        line.append(quantity, info);
        list.append(line);
      }

      const actions = document.createElement('div');
      actions.className = 'order-actions';
      actions.append(
        createStatusButton(order, 'cooking', 'Đang làm'),
        createStatusButton(order, 'ready', 'Hoàn thành'),
        createStatusButton(order, 'served', 'Đã phục vụ'),
        createStatusButton(order, 'cancelled', 'Hủy', true)
      );

      card.append(header, list, actions);
      ordersList.append(card);
    }
  }

  async function loadOrders() {
    ordersList.innerHTML = '<p class="empty-state">Đang tải đơn...</p>';
    try {
      const kitchenOrders = api.getKitchenOrders ? await api.getKitchenOrders() : await api.getOrders();
      orders = kitchenOrders.filter((order) => activeStatuses.has(order.status));
      sortOrders();
      renderOrders();
    } catch (error) {
      ordersList.innerHTML = '';
      const empty = document.createElement('p');
      empty.className = 'empty-state';
      empty.textContent = error.message;
      ordersList.append(empty);
    }
  }

  async function updateStatus(id, status, button) {
    const originalText = button.textContent;
    const currentOrder = orders.find((order) => order.id === id);
    const previousOrder = currentOrder
      ? { ...currentOrder, items: currentOrder.items.map((item) => ({ ...item })) }
      : null;

    button.disabled = true;
    button.textContent = 'Đang lưu...';

    if (currentOrder) {
      currentOrder.status = status;
      upsertOrder(currentOrder);
      renderOrders();
    }

    try {
      const order = await api.updateOrder(id, status);
      upsertOrder(order);
      renderOrders();
    } catch (error) {
      if (previousOrder) {
        upsertOrder(previousOrder);
        renderOrders();
      } else {
        button.disabled = false;
        button.textContent = error.message || originalText;
      }
      setConnectionMessage(error.message || 'Không cập nhật được trạng thái.');
    }
  }

  const socket = io();
  socket.on('connect', () => {
    setConnectionMessage('');
    loadOrders();
  });
  socket.on('disconnect', () => {
    setConnectionMessage('Mất kết nối realtime');
  });
  socket.on('order:new', (order) => {
    upsertOrder(order);
    renderOrders();
  });
  socket.on('order:updated', (order) => {
    upsertOrder(order);
    renderOrders();
  });
  socket.on('order:status_changed', applyStatusChange);

  loadRestaurantInfo();
  loadOrders();
})();
