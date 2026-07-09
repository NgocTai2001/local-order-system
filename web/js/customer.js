(function () {
  const api = window.orderApi;
  const menuList = document.getElementById('menuList');
  const cartItems = document.getElementById('cartItems');
  const cartCount = document.getElementById('cartCount');
  const cartTotal = document.getElementById('cartTotal');
  const orderMessage = document.getElementById('orderMessage');
  const orderedReview = document.getElementById('orderedReview');
  const reviewOrdersButton = document.getElementById('reviewOrdersButton');
  const orderedList = document.getElementById('orderedList');
  const submitOrder = document.getElementById('submitOrder');
  const tableTokenLabel = document.getElementById('tableToken');
  const tableNotice = document.getElementById('tableNotice');

  const params = new URLSearchParams(window.location.search);
  const tableToken = getTableTokenFromUrl();
  const cart = new Map();
  let menu = [];
  let currentTable = null;
  let orderedListOpen = false;
  let reviewPromptTimer = null;
  const categoryOrder = [
    { key: 'food', label: 'Đồ ăn' },
    { key: 'drink', label: 'Nước uống' }
  ];
  const orderStatusLabels = {
    pending: 'Chưa làm',
    cooking: 'Đang làm',
    ready: 'Hoàn thành',
    served: 'Đã phục vụ',
    cancelled: 'Đã hủy',
    paid: 'Đã thanh toán'
  };

  function setHeaderSubtitle(text) {
    tableTokenLabel.textContent = text || '';
    tableTokenLabel.hidden = !text;
  }

  async function loadRestaurantInfo() {
    try {
      const info = await api.getRestaurantInfo();
      api.applyRestaurantInfo(info, 'Gọi món');
    } catch (error) {
      // Menu vẫn phải dùng được nếu cấu hình quán tạm thời không tải được.
    }
  }

  function getTableTokenFromUrl() {
    const match = window.location.pathname.match(/^\/t\/([^/]+)$/);

    if (match) {
      return decodeURIComponent(match[1]);
    }

    return params.get('table') || params.get('ban') || '';
  }

  function initials(name) {
    return name
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  function setMessage(text, isError) {
    clearReviewPromptTimer();
    orderMessage.textContent = text || '';
    orderMessage.hidden = !text;
    orderMessage.style.color = isError ? '#a9371d' : '';
  }

  function clearReviewPromptTimer() {
    if (!reviewPromptTimer) {
      return;
    }

    window.clearTimeout(reviewPromptTimer);
    reviewPromptTimer = null;
  }

  function showReviewPromptAfterSuccess() {
    clearReviewPromptTimer();
    reviewPromptTimer = window.setTimeout(() => {
      reviewPromptTimer = null;
      orderMessage.textContent = '';
      orderMessage.hidden = true;
      showOrderedReviewPrompt();
    }, 1000);
  }

  function formatTime(value) {
    if (!value) {
      return '';
    }

    const normalized = value.includes('T') ? value : value.replace(' ', 'T');
    const date = new Date(normalized);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function statusLabel(status) {
    return orderStatusLabels[status] || status || 'Không rõ';
  }

  function createTrashIcon() {
    const svgNs = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNs, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');

    const lines = [
      'M3 6h18',
      'M8 6V4h8v2',
      'M6 6l1 14h10l1-14',
      'M10 11v5',
      'M14 11v5'
    ];

    for (const value of lines) {
      const path = document.createElementNS(svgNs, 'path');
      path.setAttribute('d', value);
      svg.append(path);
    }

    return svg;
  }

  function createCancelOrderButton(order) {
    const button = document.createElement('button');
    button.className = 'ordered-delete-button';
    button.type = 'button';
    button.title = 'Xóa đơn khi bếp chưa làm';
    button.setAttribute('aria-label', `Xóa đơn #${order.id}`);
    button.append(createTrashIcon());
    button.addEventListener('click', () => cancelPendingOrder(order, button));
    return button;
  }

  function showOrderedReviewPrompt() {
    if (!currentTable) {
      return;
    }

    orderedReview.removeAttribute('hidden');
  }

  function hideOrderedReview() {
    orderedReview.setAttribute('hidden', '');
    orderedList.setAttribute('hidden', '');
    orderedListOpen = false;
    orderedList.replaceChildren();
    reviewOrdersButton.textContent = 'Xem lại món đã đặt';
  }

  function renderOrderedBill(bill) {
    orderedList.replaceChildren();

    const orders = bill?.orders || [];

    if (orders.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'empty-state compact-empty';
      empty.textContent = 'Bàn này chưa có món đã đặt.';
      orderedList.append(empty);
      return;
    }

    for (const order of orders) {
      const card = document.createElement('article');
      card.className = 'ordered-order-card';
      const canCancel = order.status === 'pending';

      if (canCancel) {
        card.classList.add('has-delete');
      }

      const content = document.createElement('div');
      content.className = 'ordered-order-content';

      const head = document.createElement('div');
      head.className = 'ordered-order-head';

      const title = document.createElement('strong');
      title.textContent = `Đơn #${order.id}`;

      const meta = document.createElement('span');
      meta.textContent = `${statusLabel(order.status)}${order.created_at ? ` - ${formatTime(order.created_at)}` : ''}`;

      head.append(title, meta);

      const items = document.createElement('div');
      items.className = 'ordered-items';

      for (const item of order.items || []) {
        const row = document.createElement('div');
        row.className = 'ordered-item-row';

        const quantity = document.createElement('b');
        quantity.textContent = item.quantity;

        const info = document.createElement('div');
        info.className = 'ordered-item-info';
        const name = document.createElement('span');
        name.textContent = item.name;
        const price = document.createElement('small');
        price.textContent = api.formatCurrency(item.subtotal || 0);
        info.append(name, price);

        row.append(quantity, info);
        items.append(row);
      }

      content.append(head, items);
      card.append(content);

      if (canCancel) {
        card.append(createCancelOrderButton(order));
      }

      orderedList.append(card);
    }
  }

  async function loadOrderedReview() {
    if (!currentTable) {
      setMessage('Vui lòng quét QR trên bàn để xem món đã đặt.', true);
      return;
    }

    orderedList.removeAttribute('hidden');
    orderedList.innerHTML = '<p class="empty-state compact-empty">Đang tải món đã đặt...</p>';
    reviewOrdersButton.disabled = true;

    try {
      const bill = await api.getCurrentBill(currentTable.id);
      renderOrderedBill(bill);
      orderedListOpen = true;
      reviewOrdersButton.textContent = 'Ẩn danh sách món đã đặt';
    } catch (error) {
      orderedList.innerHTML = '';
      const empty = document.createElement('p');
      empty.className = 'empty-state compact-empty';
      empty.textContent = error.message;
      orderedList.append(empty);
    } finally {
      reviewOrdersButton.disabled = false;
    }
  }

  async function cancelPendingOrder(order, button) {
    if (order.status !== 'pending') {
      setMessage('Đơn này bếp đã bắt đầu làm, không thể xóa.', true);
      await loadOrderedReview();
      return;
    }

    const ok = window.confirm(`Xóa đơn #${order.id}? Chỉ nên xóa khi gọi nhầm.`);
    if (!ok) {
      return;
    }

    button.disabled = true;

    try {
      const latestBill = await api.getCurrentBill(currentTable.id);
      const latestOrder = (latestBill.orders || []).find((item) => item.id === order.id);

      if (!latestOrder) {
        renderOrderedBill(latestBill);
        setMessage('Đơn này không còn trong bill hiện tại.');
        return;
      }

      if (latestOrder.status !== 'pending') {
        renderOrderedBill(latestBill);
        setMessage('Đơn này bếp đã bắt đầu làm, không thể xóa.', true);
        return;
      }

      await api.updateOrder(order.id, 'cancelled');
      const bill = await api.getCurrentBill(currentTable.id);
      const hasOrders = (bill.orders || []).some((item) => (item.items || []).length > 0);

      if (!hasOrders) {
        hideOrderedReview();
      } else {
        orderedList.removeAttribute('hidden');
        orderedListOpen = true;
        reviewOrdersButton.textContent = 'Ẩn danh sách món đã đặt';
        renderOrderedBill(bill);
      }

      setMessage(`Đã xóa đơn #${order.id}.`);
    } catch (error) {
      setMessage(error.message, true);
      button.disabled = false;
    }
  }

  async function refreshOrderedReviewAvailability() {
    if (!currentTable) {
      hideOrderedReview();
      return;
    }

    try {
      const bill = await api.getCurrentBill(currentTable.id);
      const hasOrders = (bill.orders || []).some((order) => (order.items || []).length > 0);

      if (!hasOrders) {
        hideOrderedReview();
        return;
      }

      showOrderedReviewPrompt();

      if (orderedListOpen) {
        renderOrderedBill(bill);
      }
    } catch (error) {
      // Không chặn việc gọi món nếu phần xem lại món tạm thời không tải được.
    }
  }

  function toggleOrderedReview() {
    if (orderedListOpen) {
      orderedList.setAttribute('hidden', '');
      orderedListOpen = false;
      reviewOrdersButton.textContent = 'Xem lại món đã đặt';
      return;
    }

    loadOrderedReview();
  }

  function getQuantity(id) {
    return cart.get(id)?.quantity || 0;
  }

  function changeQuantity(item, delta) {
    const nextQuantity = Math.max(0, getQuantity(item.id) + delta);

    if (nextQuantity === 0) {
      cart.delete(item.id);
    } else {
      cart.set(item.id, { item, quantity: nextQuantity });
    }

    setMessage('');
    render();
  }

  function createFoodVisual(item) {
    if (item.image) {
      const image = document.createElement('img');
      image.className = 'food-image';
      image.src = item.image;
      image.alt = item.name;
      image.loading = 'lazy';
      image.onerror = () => {
        image.replaceWith(createFallback(item.name));
      };
      return image;
    }

    return createFallback(item.name);
  }

  function createFallback(name) {
    const fallback = document.createElement('div');
    fallback.className = 'food-fallback';
    fallback.textContent = initials(name);
    return fallback;
  }

  function createQuantityControls(item) {
    const row = document.createElement('div');
    row.className = 'quantity-row';

    const minus = document.createElement('button');
    minus.className = 'qty-button';
    minus.type = 'button';
    minus.textContent = '-';
    minus.setAttribute('aria-label', `Giảm ${item.name}`);
    minus.disabled = getQuantity(item.id) === 0;
    minus.addEventListener('click', () => changeQuantity(item, -1));

    const value = document.createElement('span');
    value.className = 'qty-value';
    value.textContent = getQuantity(item.id);

    const plus = document.createElement('button');
    plus.className = 'qty-button';
    plus.type = 'button';
    plus.textContent = '+';
    plus.setAttribute('aria-label', `Thêm ${item.name}`);
    plus.addEventListener('click', () => changeQuantity(item, 1));

    row.append(minus, value, plus);
    return row;
  }

  function renderMenu() {
    menuList.replaceChildren();

    if (menu.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'empty-state';
      empty.textContent = 'Menu đang trống.';
      menuList.append(empty);
      return;
    }

    for (const category of categoryOrder) {
      const items = menu.filter((item) => item.category === category.key);

      if (items.length === 0) {
        continue;
      }

      const section = document.createElement('section');
      section.className = 'menu-category';

      const heading = document.createElement('h2');
      heading.className = 'menu-category-title';
      heading.textContent = category.label;

      const grid = document.createElement('div');
      grid.className = 'menu-category-grid';

      for (const item of items) {
        grid.append(createMenuCard(item));
      }

      section.append(heading, grid);
      menuList.append(section);
    }
  }

  function createMenuCard(item) {
    const card = document.createElement('article');
    card.className = 'menu-card';

    const content = document.createElement('div');
    content.className = 'menu-content';

    const title = document.createElement('h3');
    title.textContent = item.name;

    const price = document.createElement('div');
    price.className = 'price';
    price.textContent = api.formatCurrency(item.price);

    content.append(title, price);
    card.append(createFoodVisual(item), content, createQuantityControls(item));
    return card;
  }

  function renderCart() {
    cartItems.replaceChildren();

    const entries = Array.from(cart.values());
    const totalQuantity = entries.reduce((sum, entry) => sum + entry.quantity, 0);
    const totalPrice = entries.reduce((sum, entry) => sum + entry.quantity * entry.item.price, 0);

    cartCount.textContent = totalQuantity ? `${totalQuantity} món` : 'Chưa có món';
    cartTotal.textContent = api.formatCurrency(totalPrice);
    submitOrder.disabled = entries.length === 0;

    if (entries.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'empty-state';
      empty.textContent = 'Chọn món bằng nút +.';
      cartItems.append(empty);
      return;
    }

    for (const entry of entries) {
      const row = document.createElement('div');
      row.className = 'cart-item';

      const text = document.createElement('div');
      const name = document.createElement('strong');
      name.textContent = entry.item.name;
      const line = document.createElement('small');
      line.textContent = `${entry.quantity} x ${api.formatCurrency(entry.item.price)}`;
      text.append(name, line);

      row.append(text, createQuantityControls(entry.item));
      cartItems.append(row);
    }
  }

  function render() {
    renderMenu();
    renderCart();
  }

  async function loadMenu() {
    menuList.innerHTML = '<p class="empty-state">Đang tải menu...</p>';
    try {
      menu = await api.getMenu(false);
      render();
    } catch (error) {
      menuList.innerHTML = '';
      const empty = document.createElement('p');
      empty.className = 'empty-state';
      empty.textContent = error.message;
      menuList.append(empty);
    }
  }

  async function placeOrder() {
    if (!currentTable) {
      setMessage('Vui lòng quét QR trên bàn để gọi món.', true);
      return;
    }

    const items = Array.from(cart.values()).map((entry) => ({
      menu_item_id: entry.item.id,
      quantity: entry.quantity
    }));

    if (items.length === 0) {
      return;
    }

    submitOrder.disabled = true;
    setMessage('Đang gửi đơn...');

    try {
      await api.createOrder({
        table_id: currentTable.id,
        items
      });
      cart.clear();
      render();
      hideOrderedReview();
      setMessage('Đặt món thành công. Bếp đã nhận đơn của bạn.');
      showReviewPromptAfterSuccess();
    } catch (error) {
      setMessage(error.message, true);
      submitOrder.disabled = false;
    }
  }

  submitOrder.addEventListener('click', placeOrder);
  reviewOrdersButton.addEventListener('click', toggleOrderedReview);

  async function initTable() {
    if (!tableToken) {
      setHeaderSubtitle('');
      tableNotice.textContent = 'Quét QR trên bàn khi đặt món.';
      await loadMenu();
      return;
    }

    setHeaderSubtitle('Đang kiểm tra bàn...');
    tableNotice.textContent = 'Đang nhận diện bàn từ QR.';

    try {
      currentTable = await api.getTableByToken(tableToken);
      setHeaderSubtitle(currentTable.name);
      tableNotice.textContent = `Bạn đang gọi món tại: ${currentTable.name}`;
      await loadMenu();
      refreshOrderedReviewAvailability();
    } catch (error) {
      currentTable = null;
      hideOrderedReview();
      setHeaderSubtitle('QR không hợp lệ');
      tableNotice.textContent = error.message;
      setMessage(error.message, true);
      await loadMenu();
    }
  }

  loadRestaurantInfo();
  initTable();
})();
