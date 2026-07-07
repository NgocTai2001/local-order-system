(function () {
  const api = window.orderApi;
  const menuList = document.getElementById('menuList');
  const cartItems = document.getElementById('cartItems');
  const cartCount = document.getElementById('cartCount');
  const cartTotal = document.getElementById('cartTotal');
  const orderMessage = document.getElementById('orderMessage');
  const submitOrder = document.getElementById('submitOrder');
  const tableTokenLabel = document.getElementById('tableToken');

  const params = new URLSearchParams(window.location.search);
  const tableToken = params.get('table') || params.get('ban') || localStorage.getItem('tableToken') || 'A1';
  const cart = new Map();
  let menu = [];

  localStorage.setItem('tableToken', tableToken);
  tableTokenLabel.textContent = tableToken;

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

    for (const item of menu) {
      const card = document.createElement('article');
      card.className = 'menu-card';

      const content = document.createElement('div');
      content.className = 'menu-content';

      const title = document.createElement('h3');
      title.textContent = item.name;

      const price = document.createElement('div');
      price.className = 'price';
      price.textContent = api.formatCurrency(item.price);

      content.append(title, price, createQuantityControls(item));
      card.append(createFoodVisual(item), content);
      menuList.append(card);
    }
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
        table_token: tableToken,
        items
      });
      cart.clear();
      render();
      setMessage('Đặt món thành công');
    } catch (error) {
      setMessage(error.message, true);
      submitOrder.disabled = false;
    }
  }

  document.getElementById('reloadMenu').addEventListener('click', loadMenu);
  submitOrder.addEventListener('click', placeOrder);

  loadMenu();
})();
