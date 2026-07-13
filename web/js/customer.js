(function () {
  const api = window.orderApi;
  const menuList = document.getElementById('menuList');
  const categoryTabs = document.getElementById('categoryTabs');
  const cartItems = document.getElementById('cartItems');
  const cartCount = document.getElementById('cartCount');
  const cartTotal = document.getElementById('cartTotal');
  const orderMessage = document.getElementById('orderMessage');
  const orderedList = document.getElementById('orderedList');
  const submitOrder = document.getElementById('submitOrder');
  const cartToggle = document.getElementById('cartToggle');
  const cartBadge = document.getElementById('cartBadge');
  const cartSheet = document.getElementById('cartSheet');
  const cartBackdrop = document.getElementById('cartBackdrop');
  const cartSheetClose = document.getElementById('cartSheetClose');
  const cartCurrentTab = document.getElementById('cartCurrentTab');
  const cartHistoryTab = document.getElementById('cartHistoryTab');
  const cartCurrentPanel = document.getElementById('cartCurrentPanel');
  const cartHistoryPanel = document.getElementById('cartHistoryPanel');
  const tableNotice = document.getElementById('tableNotice');
  const optionBackdrop = document.getElementById('optionBackdrop');
  const optionSheet = document.getElementById('optionSheet');
  const optionSheetClose = document.getElementById('optionSheetClose');
  const optionSheetBody = document.getElementById('optionSheetBody');

  const params = new URLSearchParams(window.location.search);
  const tableToken = getTableTokenFromUrl();
  const cart = new Map();
  let menu = [];
  let menuCategories = [];
  let currentTable = null;
  let orderedListOpen = false;
  let reviewPromptTimer = null;
  let sheetCloseTimer = null;
  let orderedReviewRefreshTimer = null;
  let sheetTouchStartY = 0;
  let sheetTouchCurrentY = 0;
  let optionDraft = null;
  const TODAY_OFFER_KEY = 'today-offer';
  const FOR_YOU_KEY = 'for-you';
  const fallbackCategories = [
    { key: TODAY_OFFER_KEY, name: 'Ưu đãi hôm nay', icon: '🔥', color: '#e8590c', card_layout: 'horizontal', is_system: true },
    { key: FOR_YOU_KEY, name: 'Dành cho bạn', icon: '✨', color: '#24745c', card_layout: 'vertical', is_system: true },
    { key: 'food', name: 'Đồ ăn', icon: '🍽', color: '#24745c', card_layout: 'vertical', is_system: false },
    { key: 'drink', name: 'Nước uống', icon: '🥤', color: '#1f6feb', card_layout: 'vertical', is_system: false }
  ];
  const orderStatusLabels = {
    pending: 'Chưa làm',
    cooking: 'Đang làm',
    ready: 'Hoàn thành',
    served: 'Đã phục vụ',
    cancelled: 'Đã hủy',
    paid: 'Đã thanh toán'
  };

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

  function hideOrderMessageAfterSuccess() {
    clearReviewPromptTimer();
    reviewPromptTimer = window.setTimeout(() => {
      reviewPromptTimer = null;
      orderMessage.textContent = '';
      orderMessage.hidden = true;
    }, 1000);
  }

  function formatTime(value) {
    if (!value) {
      return '';
    }

    const raw = String(value).trim();
    const hasTimezone = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(raw);
    const normalized = raw.includes('T')
      ? `${raw}${hasTimezone ? '' : 'Z'}`
      : `${raw.replace(' ', 'T')}Z`;
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

  function categoryLabel(categoryKey) {
    return menuCategories.find((category) => category.key === categoryKey)?.name
      || fallbackCategories.find((category) => category.key === categoryKey)?.name
      || categoryKey
      || 'Món khác';
  }

  function categoryMeta(categoryKey) {
    return menuCategories.find((category) => category.key === categoryKey)
      || fallbackCategories.find((category) => category.key === categoryKey)
      || { key: categoryKey, name: categoryLabel(categoryKey), icon: '', color: '#24745c', card_layout: 'vertical', is_system: false };
  }

  function itemsForSection(category) {
    if (category.key === TODAY_OFFER_KEY) {
      return menu.filter((item) => item.show_today_offer);
    }

    if (category.key === FOR_YOU_KEY) {
      return menu.filter((item) => item.show_for_you);
    }

    return menu.filter((item) => item.category === category.key);
  }

  function productCategories() {
    const keysInMenu = new Set(menu.map((item) => item.category));
    const known = menuCategories.filter((category) => !category.is_system && keysInMenu.has(category.key));
    const knownKeys = new Set(known.map((category) => category.key));
    const missing = [...keysInMenu]
      .filter((key) => !knownKeys.has(key))
      .map((key) => categoryMeta(key));

    return [...known, ...missing];
  }

  function activeSections() {
    const fixedSections = menuCategories
      .filter((category) => category.is_system)
      .filter((category) => [TODAY_OFFER_KEY, FOR_YOU_KEY].includes(category.key));

    return [...fixedSections, ...productCategories()]
      .map((category) => ({
        ...category,
        items: itemsForSection(category)
      }))
      .filter((section) => section.items.length > 0);
  }

  function captureHorizontalMenuScroll() {
    const positions = new Map();

    document.querySelectorAll('.menu-category-grid.is-horizontal').forEach((grid) => {
      const categoryKey = grid.closest('.menu-category')?.id?.replace(/^category-/, '');

      if (categoryKey) {
        positions.set(categoryKey, grid.scrollLeft);
      }
    });

    return positions;
  }

  function restoreHorizontalMenuScroll(positions) {
    if (!positions?.size) {
      return;
    }

    document.querySelectorAll('.menu-category-grid.is-horizontal').forEach((grid) => {
      const categoryKey = grid.closest('.menu-category')?.id?.replace(/^category-/, '');
      const scrollLeft = positions.get(categoryKey);

      if (scrollLeft !== undefined) {
        grid.scrollLeft = scrollLeft;
      }
    });
  }

  function cartSummary() {
    const entries = Array.from(cart.values());
    const totalQuantity = entries.reduce((sum, entry) => sum + entry.quantity, 0);
    const totalPrice = entries.reduce((sum, entry) => sum + entry.quantity * entry.unit_price, 0);

    return { entries, totalQuantity, totalPrice };
  }

  function updateCartBadge(totalQuantity) {
    cartBadge.textContent = totalQuantity;
    cartBadge.hidden = totalQuantity === 0;
    cartToggle.setAttribute(
      'aria-label',
      totalQuantity ? `Mở giỏ hàng, ${totalQuantity} món` : 'Mở giỏ hàng'
    );
  }

  function bumpCartBadge() {
    cartBadge.classList.remove('is-bumping');
    cartToggle.classList.remove('is-pulsing');
    void cartBadge.offsetWidth;
    cartBadge.classList.add('is-bumping');
    cartToggle.classList.add('is-pulsing');

    window.setTimeout(() => {
      cartBadge.classList.remove('is-bumping');
      cartToggle.classList.remove('is-pulsing');
    }, 420);
  }

  function setCartTab(tab) {
    const isHistory = tab === 'history';

    cartCurrentTab.classList.toggle('is-active', !isHistory);
    cartHistoryTab.classList.toggle('is-active', isHistory);
    cartCurrentTab.setAttribute('aria-selected', String(!isHistory));
    cartHistoryTab.setAttribute('aria-selected', String(isHistory));
    cartCurrentPanel.hidden = isHistory;
    cartHistoryPanel.hidden = !isHistory;
    cartCurrentPanel.classList.toggle('is-active', !isHistory);
    cartHistoryPanel.classList.toggle('is-active', isHistory);
  }

  function openCartSheet(tab = 'current', loadHistory = false) {
    window.clearTimeout(sheetCloseTimer);
    cartSheet.hidden = false;
    cartBackdrop.hidden = false;
    document.body.classList.add('sheet-open');
    setCartTab(tab);

    window.requestAnimationFrame(() => {
      cartSheet.classList.add('is-open');
      cartBackdrop.classList.add('is-open');
    });

    if (tab === 'history' && loadHistory) {
      loadOrderedReview();
    }
  }

  function closeCartSheet() {
    cartSheet.classList.remove('is-open');
    cartBackdrop.classList.remove('is-open');
    document.body.classList.remove('sheet-open');

    sheetCloseTimer = window.setTimeout(() => {
      cartSheet.hidden = true;
      cartBackdrop.hidden = true;
    }, 240);
  }

  function createFlyerContent(item) {
    if (item.image) {
      const image = document.createElement('img');
      image.src = item.image;
      image.alt = '';
      image.onerror = () => {
        image.replaceWith(createFallback(item.name));
      };
      return image;
    }

    return createFallback(item.name);
  }

  function animateAddToCart(item, triggerElement) {
    if (!triggerElement || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const targetRect = cartToggle.getBoundingClientRect();
    const card = triggerElement.closest('.menu-card');
    const source = card?.querySelector('.food-image, .food-fallback') || triggerElement;
    const sourceRect = source.getBoundingClientRect();
    const flyer = document.createElement('div');
    const size = Math.min(46, Math.max(34, sourceRect.width || 36));

    flyer.className = 'cart-flyer';
    flyer.style.width = `${size}px`;
    flyer.style.height = `${size}px`;
    flyer.style.left = `${sourceRect.left + sourceRect.width / 2 - size / 2}px`;
    flyer.style.top = `${sourceRect.top + sourceRect.height / 2 - size / 2}px`;
    flyer.append(createFlyerContent(item));
    document.body.append(flyer);

    const endX = targetRect.left + targetRect.width / 2 - (sourceRect.left + sourceRect.width / 2);
    const endY = targetRect.top + targetRect.height / 2 - (sourceRect.top + sourceRect.height / 2);
    if (!flyer.animate) {
      window.setTimeout(() => flyer.remove(), 620);
      return;
    }

    const animation = flyer.animate(
      [
        { opacity: 1, transform: 'translate3d(0, 0, 0) scale(1)' },
        { opacity: 0.94, transform: `translate3d(${endX * 0.66}px, ${endY * 0.66 - 28}px, 0) scale(0.72)` },
        { opacity: 0, transform: `translate3d(${endX}px, ${endY}px, 0) scale(0.18)` }
      ],
      {
        duration: 620,
        easing: 'cubic-bezier(0.2, 0.72, 0.22, 1)'
      }
    );

    animation.finished.then(
      () => flyer.remove(),
      () => flyer.remove()
    );
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

  function hideOrderedReview() {
    orderedList.setAttribute('hidden', '');
    orderedListOpen = false;
    orderedList.replaceChildren();
  }

  function renderOrderedBill(bill) {
    orderedList.replaceChildren();

    const orders = [...(bill?.orders || [])].sort((first, second) => {
      const firstCreated = String(first.created_at || '');
      const secondCreated = String(second.created_at || '');
      return secondCreated.localeCompare(firstCreated) || second.id - first.id;
    });

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

        for (const option of item.options || []) {
          const optionLine = document.createElement('small');
          optionLine.className = 'ordered-option-line';
          optionLine.textContent = `${option.group_name}: ${option.value_name}`;
          info.append(optionLine);
        }

        if (item.customer_note) {
          const note = document.createElement('small');
          note.className = 'ordered-option-line';
          note.textContent = `Ghi chú: ${item.customer_note}`;
          info.append(note);
        }

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
      orderedList.removeAttribute('hidden');
      orderedList.innerHTML = '<p class="empty-state compact-empty">Vui lòng quét QR trên bàn để xem món đã đặt.</p>';
      return;
    }

    orderedList.removeAttribute('hidden');
    orderedList.innerHTML = '<p class="empty-state compact-empty">Đang tải món đã đặt...</p>';
    cartHistoryTab.disabled = true;

    try {
      const bill = await api.getCurrentBill(currentTable.id);
      renderOrderedBill(bill);
      orderedListOpen = true;
    } catch (error) {
      orderedList.innerHTML = '';
      const empty = document.createElement('p');
      empty.className = 'empty-state compact-empty';
      empty.textContent = error.message;
      orderedList.append(empty);
    } finally {
      cartHistoryTab.disabled = false;
    }
  }

  function isCurrentTableEvent(payload) {
    if (!currentTable) {
      return false;
    }

    const eventTableId = Number(payload?.table_id || 0);
    return !eventTableId || eventTableId === Number(currentTable.id);
  }

  function scheduleOrderedReviewRefresh(payload) {
    if (!isCurrentTableEvent(payload)) {
      return;
    }

    if (cartHistoryPanel.hidden && !orderedListOpen) {
      return;
    }

    window.clearTimeout(orderedReviewRefreshTimer);
    orderedReviewRefreshTimer = window.setTimeout(() => {
      orderedReviewRefreshTimer = null;
      loadOrderedReview();
    }, 180);
  }

  function setupRealtime() {
    if (!window.io) {
      return;
    }

    const socket = window.io();

    socket.on('connect', () => {
      if (!cartHistoryPanel.hidden || orderedListOpen) {
        loadOrderedReview();
      }
    });
    socket.on('order:new', scheduleOrderedReviewRefresh);
    socket.on('order:updated', scheduleOrderedReviewRefresh);
    socket.on('order:status_changed', scheduleOrderedReviewRefresh);
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

      if (orderedListOpen) {
        renderOrderedBill(bill);
      }
    } catch (error) {
      // Không chặn việc gọi món nếu phần xem lại món tạm thời không tải được.
    }
  }

  function normalizeNote(value) {
    return String(value || '').trim().replace(/\s+/g, ' ');
  }

  function cartLineKey(itemId, optionValueIds = [], note = '') {
    return [
      itemId,
      [...optionValueIds].sort((first, second) => first - second).join(','),
      normalizeNote(note).toLowerCase()
    ].join('|');
  }

  function itemHasOptions(item) {
    return Array.isArray(item.option_groups) && item.option_groups.length > 0;
  }

  function defaultOptionIds(item) {
    const ids = [];

    for (const group of item.option_groups || []) {
      const defaults = (group.values || []).filter((value) => value.is_default);
      if (group.selection_type === 'single') {
        const selected = defaults[0] || (group.is_required ? group.values?.[0] : null);
        if (selected) {
          ids.push(selected.id);
        }
      } else {
        ids.push(...defaults.map((value) => value.id));
      }
    }

    return ids;
  }

  function selectedOptionDetails(item, selectedIds) {
    const selectedSet = new Set(selectedIds.map(Number));
    const groups = [];
    let optionsTotal = 0;

    for (const group of item.option_groups || []) {
      const values = (group.values || []).filter((value) => selectedSet.has(Number(value.id)));
      for (const value of values) {
        optionsTotal += value.price_adjustment || 0;
      }
      if (values.length) {
        groups.push({ ...group, selected_values: values });
      }
    }

    return { groups, optionsTotal };
  }

  function getQuantity(id) {
    return Array.from(cart.values())
      .filter((entry) => entry.item.id === id)
      .reduce((sum, entry) => sum + entry.quantity, 0);
  }

  function firstCartKeyForItem(id) {
    return Array.from(cart.entries()).find(([, entry]) => entry.item.id === id)?.[0] || '';
  }

  function changeQuantity(item, delta, triggerElement) {
    if (delta > 0 && itemHasOptions(item)) {
      openOptionSheet(item, null, triggerElement);
      return;
    }

    const key = firstCartKeyForItem(item.id) || cartLineKey(item.id);
    const existing = cart.get(key) || {
      key,
      item,
      quantity: 0,
      selected_option_value_ids: [],
      option_groups: [],
      options_total: 0,
      unit_price: item.price,
      customer_note: ''
    };
    const nextQuantity = Math.max(0, existing.quantity + delta);

    if (nextQuantity === 0) {
      cart.delete(key);
    } else {
      cart.set(key, { ...existing, quantity: nextQuantity });
    }

    if (delta > 0) {
      animateAddToCart(item, triggerElement);
    }

    setMessage('');
    render();

    if (delta > 0) {
      bumpCartBadge();
    }
  }

  function changeCartLineQuantity(key, delta) {
    const entry = cart.get(key);
    if (!entry) {
      return;
    }

    const nextQuantity = Math.max(0, entry.quantity + delta);
    if (nextQuantity === 0) {
      cart.delete(key);
    } else {
      cart.set(key, { ...entry, quantity: nextQuantity });
    }
    setMessage('');
    render();
  }

  function closeOptionSheet() {
    optionSheet.classList.remove('is-open');
    optionBackdrop.classList.remove('is-open');
    window.setTimeout(() => {
      optionSheet.hidden = true;
      optionBackdrop.hidden = true;
      optionDraft = null;
      optionSheetBody.replaceChildren();
      document.body.classList.remove('sheet-open');
    }, 180);
  }

  function optionSelectionFromSheet() {
    return Array.from(optionSheetBody.querySelectorAll('[data-option-value]:checked'))
      .map((input) => Number(input.value))
      .sort((first, second) => first - second);
  }

  function optionDraftQuantity() {
    return Math.max(1, Number(optionSheetBody.querySelector('#optionDraftQuantity')?.textContent || 1));
  }

  function optionDraftNote() {
    return normalizeNote(optionSheetBody.querySelector('#optionDraftNote')?.value || '');
  }

  function validateOptionDraft(item, selectedIds) {
    const selectedSet = new Set(selectedIds);

    for (const group of item.option_groups || []) {
      const count = (group.values || []).filter((value) => selectedSet.has(Number(value.id))).length;
      const min = group.is_required ? Math.max(1, group.min_select || 0) : group.min_select || 0;
      const max = group.selection_type === 'single' ? 1 : group.max_select || count;

      if (count < min) {
        return `Vui lòng chọn ${group.name}.`;
      }

      if (count > max) {
        return `${group.name} chỉ được chọn tối đa ${max}.`;
      }
    }

    return '';
  }

  function optionGroupRuleText(group) {
    const min = Math.max(0, Number(group.min_select || 0));
    const maxFromValues = Array.isArray(group.values) ? group.values.length : 0;
    const max = group.selection_type === 'single'
      ? 1
      : Math.max(0, Number(group.max_select || maxFromValues));
    const required = Boolean(group.is_required) || min > 0;

    if (group.selection_type === 'single') {
      return required ? 'Chọn 1' : 'Không bắt buộc, chọn 1';
    }

    if (!required) {
      return max > 0 ? `Không bắt buộc, tối đa ${max}` : 'Không bắt buộc';
    }

    if (min === max) {
      return `Chọn ${min}`;
    }

    return max > 0 ? `Chọn ${min}-${max}` : `Chọn ít nhất ${min}`;
  }

  function updateOptionDraftTotal() {
    if (!optionDraft) {
      return;
    }

    const selectedIds = optionSelectionFromSheet();
    const quantity = optionDraftQuantity();
    const { optionsTotal } = selectedOptionDetails(optionDraft.item, selectedIds);
    const unitPrice = optionDraft.item.price + optionsTotal;
    const error = validateOptionDraft(optionDraft.item, selectedIds);
    const total = optionSheetBody.querySelector('#optionDraftTotal');
    const message = optionSheetBody.querySelector('#optionDraftMessage');
    const submit = optionSheetBody.querySelector('#optionDraftSubmit');

    total.textContent = api.formatCurrency(unitPrice * quantity);
    message.textContent = error;
    message.hidden = !error;
    submit.disabled = Boolean(error);
  }

  function setOptionDraftQuantity(nextQuantity) {
    const value = optionSheetBody.querySelector('#optionDraftQuantity');
    value.textContent = Math.max(1, nextQuantity);
    updateOptionDraftTotal();
  }

  function submitOptionDraft(triggerElement) {
    const item = optionDraft.item;
    const selectedIds = optionSelectionFromSheet();
    const note = optionDraftNote();
    const quantity = optionDraftQuantity();
    const error = validateOptionDraft(item, selectedIds);

    if (error) {
      updateOptionDraftTotal();
      return;
    }

    const { groups, optionsTotal } = selectedOptionDetails(item, selectedIds);
    const unitPrice = item.price + optionsTotal;
    const key = cartLineKey(item.id, selectedIds, note);
    const existing = optionDraft.editKey && optionDraft.editKey === key ? null : cart.get(key);
    const nextEntry = {
      key,
      item,
      quantity: quantity + (existing?.quantity || 0),
      selected_option_value_ids: selectedIds,
      option_groups: groups,
      options_total: optionsTotal,
      unit_price: unitPrice,
      customer_note: note
    };

    if (optionDraft.editKey && optionDraft.editKey !== key) {
      cart.delete(optionDraft.editKey);
    }

    cart.set(key, nextEntry);
    setMessage('');
    closeOptionSheet();
    render();
    bumpCartBadge();
    animateAddToCart(item, triggerElement || cartToggle);
  }

  function openOptionSheet(item, entry = null, triggerElement = null) {
    const selectedIds = entry?.selected_option_value_ids || defaultOptionIds(item);
    optionDraft = { item, editKey: entry?.key || '' };
    optionSheetBody.replaceChildren();

    const title = document.createElement('h2');
    title.id = 'optionSheetTitle';
    title.textContent = item.name;
    const description = document.createElement('p');
    description.className = 'menu-description';
    description.textContent = item.description || 'Chọn tùy chọn cho món.';
    const basePrice = document.createElement('strong');
    basePrice.className = 'option-base-price';
    basePrice.textContent = `Giá gốc: ${api.formatCurrency(item.price)}`;
    optionSheetBody.append(title, description, basePrice);

    for (const group of item.option_groups || []) {
      const section = document.createElement('section');
      section.className = 'option-choice-group';
      const headingRow = document.createElement('div');
      headingRow.className = 'option-choice-head';
      const heading = document.createElement('h3');
      heading.textContent = group.name;
      const rule = document.createElement('span');
      rule.className = `option-rule-pill${group.is_required ? '' : ' is-optional'}`;
      rule.textContent = optionGroupRuleText(group);
      headingRow.append(heading, rule);
      section.append(headingRow);

      for (const value of group.values || []) {
        const label = document.createElement('label');
        label.className = 'option-choice-row';
        const input = document.createElement('input');
        input.type = group.selection_type === 'multiple' ? 'checkbox' : 'radio';
        input.name = `option-group-${group.id}`;
        input.value = value.id;
        input.checked = selectedIds.includes(value.id);
        input.dataset.optionValue = '1';
        input.addEventListener('change', () => {
          if (group.selection_type === 'multiple') {
            const checked = section.querySelectorAll('input:checked');
            if (checked.length > group.max_select) {
              input.checked = false;
              setMessage(`${group.name} chỉ được chọn tối đa ${group.max_select}.`, true);
            }
          }
          updateOptionDraftTotal();
        });
        const name = document.createElement('span');
        name.textContent = value.name;
        const price = document.createElement('small');
        price.textContent = value.price_adjustment ? `+${api.formatCurrency(value.price_adjustment)}` : 'Miễn phí';
        label.append(input, name, price);
        section.append(label);
      }

      optionSheetBody.append(section);
    }

    const note = document.createElement('label');
    note.className = 'form-field option-note-field';
    note.innerHTML = 'Ghi chú cho món<textarea id="optionDraftNote" rows="2" placeholder="Ít ngọt, để riêng topping..."></textarea>';
    optionSheetBody.append(note);
    note.querySelector('textarea').value = entry?.customer_note || '';

    const quantity = document.createElement('div');
    quantity.className = 'option-quantity-row';
    quantity.innerHTML = `
      <span>Số lượng</span>
      <button class="qty-button minus-button" type="button">-</button>
      <strong id="optionDraftQuantity">${entry?.quantity || 1}</strong>
      <button class="qty-button plus-button" type="button">+</button>
    `;
    quantity.querySelector('.minus-button').addEventListener('click', () => setOptionDraftQuantity(optionDraftQuantity() - 1));
    quantity.querySelector('.plus-button').addEventListener('click', () => setOptionDraftQuantity(optionDraftQuantity() + 1));
    optionSheetBody.append(quantity);

    const footer = document.createElement('div');
    footer.className = 'option-sheet-footer';
    footer.innerHTML = `
      <div><span>Tổng</span><strong id="optionDraftTotal">${api.formatCurrency(item.price)}</strong></div>
      <p class="message" id="optionDraftMessage" hidden></p>
      <button class="primary-button" id="optionDraftSubmit" type="button">Thêm vào giỏ</button>
    `;
    footer.querySelector('#optionDraftSubmit').addEventListener('click', () => submitOptionDraft(triggerElement));
    optionSheetBody.append(footer);

    optionSheet.hidden = false;
    optionBackdrop.hidden = false;
    document.body.classList.add('sheet-open');
    window.requestAnimationFrame(() => {
      optionSheet.classList.add('is-open');
      optionBackdrop.classList.add('is-open');
      updateOptionDraftTotal();
    });
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

  function createPencilIcon() {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');

    const paths = [
      'M12 20h9',
      'M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4 11.5-11.5z'
    ];

    for (const value of paths) {
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', value);
      svg.append(path);
    }

    return svg;
  }

  function createQuantityControls(item) {
    const quantity = getQuantity(item.id);
    const row = document.createElement('div');
    row.className = 'quantity-row';
    if (quantity === 0) {
      row.classList.add('is-zero');
    }

    const minus = document.createElement('button');
    minus.className = 'qty-button minus-button';
    minus.type = 'button';
    minus.textContent = '-';
    minus.setAttribute('aria-label', `Giảm ${item.name}`);
    minus.disabled = quantity === 0;
    minus.addEventListener('click', () => changeQuantity(item, -1));

    const value = document.createElement('span');
    value.className = 'qty-value';
    value.textContent = quantity;

    const plus = document.createElement('button');
    plus.className = 'qty-button plus-button';
    plus.type = 'button';
    plus.textContent = '+';
    plus.setAttribute('aria-label', `Thêm ${item.name}`);
    plus.addEventListener('click', () => changeQuantity(item, 1, plus));

    row.append(minus, value, plus);
    return row;
  }

  function renderCategoryTabs() {
    categoryTabs.replaceChildren();
    const categories = activeSections();

    if (categories.length <= 1) {
      categoryTabs.hidden = true;
      return;
    }

    categoryTabs.hidden = false;

    for (const category of categories) {
      const button = document.createElement('button');
      button.className = 'category-tab-chip';
      button.type = 'button';
      button.style.setProperty('--category-color', category.color || '#24745c');
      const icon = document.createElement('span');
      icon.textContent = category.icon || '•';
      const name = document.createElement('strong');
      name.textContent = category.name;
      button.append(icon, name);
      button.addEventListener('click', () => {
        document.getElementById(`category-${category.key}`)?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      });
      categoryTabs.append(button);
    }
  }

  function renderMenu() {
    menuList.replaceChildren();
    renderCategoryTabs();

    if (menu.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'empty-state';
      empty.textContent = 'Menu đang trống.';
      menuList.append(empty);
      return;
    }

    for (const sectionData of activeSections()) {
      const { items, ...category } = sectionData;

      if (items.length === 0) {
        continue;
      }

      const section = document.createElement('section');
      section.className = 'menu-category';
      section.id = `category-${category.key}`;

      const heading = document.createElement('h2');
      heading.className = 'menu-category-title';
      const titleText = document.createElement('span');
      titleText.textContent = category.name;

      if (category.is_system) {
        heading.classList.add('is-system');
        heading.append(titleText);
      } else {
        const icon = document.createElement('span');
        icon.className = 'menu-category-icon';
        icon.style.setProperty('--category-color', category.color || '#24745c');
        icon.textContent = category.icon || '•';
        heading.append(icon, titleText);
      }

      const grid = document.createElement('div');
      grid.className = 'menu-category-grid';
      if (category.key === FOR_YOU_KEY) {
        grid.classList.add('is-recommendation');
      }
      if (category.card_layout === 'horizontal') {
        grid.classList.add('is-horizontal');
      }

      for (const item of items) {
        grid.append(category.key === FOR_YOU_KEY ? createRecommendationCard(item) : createMenuCard(item));
      }

      section.append(heading, grid);
      menuList.append(section);
    }
  }

  function createMenuCard(item) {
    const card = document.createElement('article');
    card.className = 'menu-card';
    if (item.featured) {
      card.classList.add('is-featured');
    }

    const content = document.createElement('div');
    content.className = 'menu-content';

    const title = document.createElement('h3');
    title.textContent = item.name;

    const price = document.createElement('div');
    price.className = 'price';
    price.textContent = api.formatCurrency(item.price);

    content.append(title);

    if (item.description) {
      const description = document.createElement('p');
      description.className = 'menu-description';
      description.textContent = item.description;
      content.append(description);
    }

    content.append(price);
    card.append(createFoodVisual(item), content, createQuantityControls(item));

    if (item.featured) {
      const badge = document.createElement('span');
      badge.className = 'featured-badge';
      badge.textContent = 'Nổi bật';
      card.append(badge);
    }

    return card;
  }

  function createRecommendationCard(item) {
    const card = document.createElement('article');
    card.className = 'recommendation-card';

    const visual = document.createElement('div');
    visual.className = 'recommendation-visual';
    visual.append(createFoodVisual(item), createQuantityControls(item));

    if (item.featured) {
      const badge = document.createElement('span');
      badge.className = 'recommendation-badge';
      badge.textContent = 'Bán chạy';
      visual.append(badge);
    }

    const content = document.createElement('div');
    content.className = 'recommendation-content';

    const title = document.createElement('h3');
    title.textContent = item.name;
    const price = document.createElement('div');
    price.className = 'price';
    price.textContent = api.formatCurrency(item.price);

    content.append(title);

    if (item.description) {
      const description = document.createElement('p');
      description.className = 'menu-description';
      description.textContent = item.description;
      content.append(description);
    }

    content.append(price);
    card.append(visual, content);
    return card;
  }

  function renderCart() {
    cartItems.replaceChildren();

    const { entries, totalQuantity, totalPrice } = cartSummary();

    cartCount.textContent = totalQuantity ? `${totalQuantity} món` : 'Chưa có món';
    cartTotal.textContent = api.formatCurrency(totalPrice);
    submitOrder.disabled = entries.length === 0;
    updateCartBadge(totalQuantity);

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
      line.textContent = `${entry.quantity} x ${api.formatCurrency(entry.unit_price)}`;
      text.append(name, line);

      for (const group of entry.option_groups || []) {
        const optionLine = document.createElement('small');
        optionLine.className = 'cart-option-line';
        optionLine.textContent = `${group.name}: ${group.selected_values.map((value) => value.name).join(', ')}`;
        text.append(optionLine);
      }

      if (entry.customer_note) {
        const note = document.createElement('small');
        note.className = 'cart-option-line';
        note.textContent = `Ghi chú: ${entry.customer_note}`;
        text.append(note);
      }

      const controls = document.createElement('div');
      controls.className = 'cart-line-actions';
      const minus = document.createElement('button');
      minus.className = 'qty-button minus-button';
      minus.type = 'button';
      minus.textContent = '-';
      minus.addEventListener('click', () => changeCartLineQuantity(entry.key, -1));
      const value = document.createElement('span');
      value.className = 'qty-value';
      value.textContent = entry.quantity;
      const plus = document.createElement('button');
      plus.className = 'qty-button plus-button';
      plus.type = 'button';
      plus.textContent = '+';
      plus.addEventListener('click', () => changeCartLineQuantity(entry.key, 1));
      controls.append(minus, value, plus);

      if (itemHasOptions(entry.item)) {
        const edit = document.createElement('button');
        edit.className = 'cart-edit-button';
        edit.type = 'button';
        edit.title = 'Sửa tùy chọn';
        edit.setAttribute('aria-label', `Sửa tùy chọn ${entry.item.name}`);
        edit.append(createPencilIcon());
        edit.addEventListener('click', () => openOptionSheet(entry.item, entry));
        controls.append(edit);
      } else {
        const placeholder = document.createElement('span');
        placeholder.className = 'cart-edit-placeholder';
        placeholder.setAttribute('aria-hidden', 'true');
        controls.append(placeholder);
      }

      row.append(text, controls);
      cartItems.append(row);
    }
  }

  function render() {
    const horizontalScroll = captureHorizontalMenuScroll();
    renderMenu();
    restoreHorizontalMenuScroll(horizontalScroll);
    window.requestAnimationFrame(() => restoreHorizontalMenuScroll(horizontalScroll));
    renderCart();
  }

  async function loadMenu() {
    menuList.innerHTML = '<p class="empty-state">Đang tải menu...</p>';
    try {
      const [categories, items] = await Promise.all([
        api.getMenuCategories(false),
        api.getMenu(false)
      ]);
      menuCategories = categories;
      menu = items;
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
      quantity: entry.quantity,
      customer_note: entry.customer_note,
      selected_option_value_ids: entry.selected_option_value_ids
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
      hideOrderMessageAfterSuccess();
    } catch (error) {
      setMessage(error.message, true);
      submitOrder.disabled = false;
    }
  }

  cartToggle.addEventListener('click', () => openCartSheet('current'));
  cartBackdrop.addEventListener('click', closeCartSheet);
  cartSheetClose.addEventListener('click', closeCartSheet);
  optionBackdrop.addEventListener('click', closeOptionSheet);
  optionSheetClose.addEventListener('click', closeOptionSheet);
  cartCurrentTab.addEventListener('click', () => setCartTab('current'));
  cartHistoryTab.addEventListener('click', () => {
    setCartTab('history');
    loadOrderedReview();
  });
  cartSheet.addEventListener('touchstart', (event) => {
    sheetTouchStartY = event.touches[0]?.clientY || 0;
    sheetTouchCurrentY = sheetTouchStartY;
  }, { passive: true });
  cartSheet.addEventListener('touchmove', (event) => {
    sheetTouchCurrentY = event.touches[0]?.clientY || sheetTouchStartY;
    const deltaY = Math.max(0, sheetTouchCurrentY - sheetTouchStartY);

    if (deltaY > 0) {
      cartSheet.style.setProperty('--sheet-drag', `${Math.min(deltaY, 120)}px`);
    }
  }, { passive: true });
  cartSheet.addEventListener('touchend', () => {
    const deltaY = sheetTouchCurrentY - sheetTouchStartY;
    cartSheet.style.removeProperty('--sheet-drag');

    if (deltaY > 72) {
      closeCartSheet();
    }
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !optionSheet.hidden) {
      closeOptionSheet();
      return;
    }

    if (event.key === 'Escape' && !cartSheet.hidden) {
      closeCartSheet();
    }
  });
  submitOrder.addEventListener('click', placeOrder);

  async function initTable() {
    if (!tableToken) {
      tableNotice.textContent = 'Quét QR trên bàn khi đặt món.';
      await loadMenu();
      return;
    }

    tableNotice.textContent = 'Đang nhận diện bàn từ QR.';

    try {
      currentTable = await api.getTableByToken(tableToken);
      tableNotice.textContent = `Bạn đang gọi món tại: ${currentTable.name}`;
      await loadMenu();
      refreshOrderedReviewAvailability();
    } catch (error) {
      currentTable = null;
      hideOrderedReview();
      tableNotice.textContent = error.message;
      setMessage(error.message, true);
      await loadMenu();
    }
  }

  loadRestaurantInfo();
  initTable();
  setupRealtime();
})();
