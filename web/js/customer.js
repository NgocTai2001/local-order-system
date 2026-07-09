(function () {
  const api = window.orderApi;
  const menuList = document.getElementById('menuList');
  const cartItems = document.getElementById('cartItems');
  const cartCount = document.getElementById('cartCount');
  const cartTotal = document.getElementById('cartTotal');
  const orderMessage = document.getElementById('orderMessage');
  const submitOrder = document.getElementById('submitOrder');
  const tableTokenLabel = document.getElementById('tableToken');
  const tableNotice = document.getElementById('tableNotice');

  const params = new URLSearchParams(window.location.search);
  const tableToken = getTableTokenFromUrl();
  const cart = new Map();
  let menu = [];
  let currentTable = null;
  const categoryOrder = [
    { key: 'food', label: 'Đồ ăn' },
    { key: 'drink', label: 'Nước uống' }
  ];

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
    orderMessage.textContent = text || '';
    orderMessage.style.color = isError ? '#a9371d' : '';
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
      setMessage('Đặt món thành công. Bếp đã nhận đơn của bạn.');
    } catch (error) {
      setMessage(error.message, true);
      submitOrder.disabled = false;
    }
  }

  submitOrder.addEventListener('click', placeOrder);

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
    } catch (error) {
      currentTable = null;
      setHeaderSubtitle('QR không hợp lệ');
      tableNotice.textContent = error.message;
      setMessage(error.message, true);
      await loadMenu();
    }
  }

  loadRestaurantInfo();
  initTable();
})();
