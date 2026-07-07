(function () {
  const api = window.orderApi;
  const ordersList = document.getElementById('ordersList');
  const orderSummary = document.getElementById('orderSummary');
  const connectionStatus = document.getElementById('connectionStatus');
  let orders = [];

  function formatTime(value) {
    const date = new Date(`${value.replace(' ', 'T')}Z`);
    return new Intl.DateTimeFormat('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  function upsertOrder(order) {
    const index = orders.findIndex((current) => current.id === order.id);

    if (order.status !== 'pending') {
      orders = orders.filter((current) => current.id !== order.id);
      return;
    }

    if (index >= 0) {
      orders[index] = order;
    } else {
      orders = [order, ...orders];
    }
  }

  function renderOrders() {
    ordersList.replaceChildren();
    orderSummary.textContent = `${orders.length} đơn`;

    if (orders.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'empty-state';
      empty.textContent = 'Chưa có đơn đang chờ.';
      ordersList.append(empty);
      return;
    }

    for (const order of orders) {
      const card = document.createElement('article');
      card.className = 'order-card';

      const header = document.createElement('div');
      const title = document.createElement('h2');
      title.textContent = `Bàn ${order.table_token}`;
      const meta = document.createElement('div');
      meta.className = 'order-meta';
      meta.innerHTML = `<span>#${order.id}</span><time>${formatTime(order.created_at)}</time>`;
      header.append(title, meta);

      const list = document.createElement('ul');
      list.className = 'order-items';
      for (const item of order.items) {
        const line = document.createElement('li');
        const quantity = document.createElement('b');
        quantity.textContent = item.quantity;
        const name = document.createElement('span');
        name.textContent = item.name;
        line.append(quantity, name);
        list.append(line);
      }

      const done = document.createElement('button');
      done.className = 'primary-button';
      done.type = 'button';
      done.textContent = 'Hoàn thành';
      done.addEventListener('click', () => completeOrder(order.id, done));

      card.append(header, list, done);
      ordersList.append(card);
    }
  }

  async function loadOrders() {
    ordersList.innerHTML = '<p class="empty-state">Đang tải đơn...</p>';
    try {
      orders = await api.getOrders('pending');
      renderOrders();
    } catch (error) {
      ordersList.innerHTML = '';
      const empty = document.createElement('p');
      empty.className = 'empty-state';
      empty.textContent = error.message;
      ordersList.append(empty);
    }
  }

  async function completeOrder(id, button) {
    button.disabled = true;
    button.textContent = 'Đang lưu...';
    try {
      const order = await api.updateOrder(id, 'completed');
      upsertOrder(order);
      renderOrders();
    } catch (error) {
      button.disabled = false;
      button.textContent = error.message;
    }
  }

  const socket = io();
  socket.on('connect', () => {
    connectionStatus.textContent = 'Realtime đã bật';
  });
  socket.on('disconnect', () => {
    connectionStatus.textContent = 'Mất kết nối realtime';
  });
  socket.on('order:new', (order) => {
    upsertOrder(order);
    renderOrders();
  });
  socket.on('order:updated', (order) => {
    upsertOrder(order);
    renderOrders();
  });

  document.getElementById('reloadOrders').addEventListener('click', loadOrders);

  loadOrders();
})();
