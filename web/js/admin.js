(function () {
  const api = window.orderApi;

  const form = document.getElementById('menuForm');
  const itemId = document.getElementById('itemId');
  const itemName = document.getElementById('itemName');
  const itemCategory = document.getElementById('itemCategory');
  const itemPrice = document.getElementById('itemPrice');
  const itemImage = document.getElementById('itemImage');
  const itemImageFile = document.getElementById('itemImageFile');
  const itemAvailable = document.getElementById('itemAvailable');
  const adminMenuBody = document.getElementById('adminMenuBody');
  const adminCount = document.getElementById('adminCount');
  const adminMessage = document.getElementById('adminMessage');
  const formTitle = document.getElementById('formTitle');
  const formMode = document.getElementById('formMode');

  const tableForm = document.getElementById('tableForm');
  const tableId = document.getElementById('tableId');
  const tableName = document.getElementById('tableName');
  const tableFormTitle = document.getElementById('tableFormTitle');
  const tableFormMode = document.getElementById('tableFormMode');
  const bulkTableForm = document.getElementById('bulkTableForm');
  const bulkPrefix = document.getElementById('bulkPrefix');
  const bulkFrom = document.getElementById('bulkFrom');
  const bulkTo = document.getElementById('bulkTo');
  const tablesBody = document.getElementById('tablesBody');
  const tableCount = document.getElementById('tableCount');
  const tableMessage = document.getElementById('tableMessage');
  const wifiQrPanel = document.getElementById('wifiQrPanel');
  const printArea = document.getElementById('printArea');
  const adminTabs = document.getElementById('adminTabs');
  const tableDetailScreen = document.getElementById('tableDetailScreen');
  const backToTablesButton = document.getElementById('backToTablesButton');
  const liveTablesGrid = document.getElementById('liveTablesGrid');
  const liveTableCount = document.getElementById('liveTableCount');
  const billTitle = document.getElementById('billTitle');
  const billMeta = document.getElementById('billMeta');
  const billOrders = document.getElementById('billOrders');
  const billPrintInfo = document.getElementById('billPrintInfo');
  const billSummary = document.getElementById('billSummary');
  const billGrandTotal = document.getElementById('billGrandTotal');
  const closeSessionButton = document.getElementById('closeSessionButton');
  const billMessage = document.getElementById('billMessage');
  const restaurantForm = document.getElementById('restaurantForm');
  const restaurantName = document.getElementById('restaurantName');
  const restaurantAddress = document.getElementById('restaurantAddress');
  const restaurantPhone = document.getElementById('restaurantPhone');
  const restaurantCashier = document.getElementById('restaurantCashier');
  const restaurantMessage = document.getElementById('restaurantMessage');
  const restaurantPreviewName = document.getElementById('restaurantPreviewName');
  const restaurantPreviewAddress = document.getElementById('restaurantPreviewAddress');
  const restaurantPreviewPhone = document.getElementById('restaurantPreviewPhone');
  const restaurantPreviewCashier = document.getElementById('restaurantPreviewCashier');

  let menu = [];
  let tables = [];
  let restaurantInfo = {
    name: 'Pho Viet',
    address: '',
    phone: '',
    cashier_name: ''
  };
  let selectedLiveTableId = null;
  let lastClosedBill = null;
  const qrByTableId = new Map();
  const categoryLabels = {
    food: 'Đồ ăn',
    drink: 'Nước uống'
  };
  const tableStatusLabels = {
    empty: 'Trống',
    occupied: 'Đang ăn',
    payment_requested: 'Chờ thanh toán',
    paid: 'Đã thanh toán'
  };
  const orderStatusLabels = {
    pending: 'Mới gọi',
    cooking: 'Đang làm',
    ready: 'Hoàn thành',
    served: 'Đã phục vụ',
    cancelled: 'Đã huỷ',
    paid: 'Đã thanh toán'
  };

  function setMessage(text, isError) {
    adminMessage.textContent = text || '';
    adminMessage.style.color = isError ? '#a9371d' : '';
  }

  function setTableMessage(text, isError) {
    tableMessage.textContent = text || '';
    tableMessage.style.color = isError ? '#a9371d' : '';
  }

  function setBillMessage(text, isError) {
    billMessage.textContent = text || '';
    billMessage.style.color = isError ? '#a9371d' : '';
  }

  function setRestaurantMessage(text, isError) {
    restaurantMessage.textContent = text || '';
    restaurantMessage.style.color = isError ? '#a9371d' : '';
  }

  function restaurantPayloadFromForm() {
    return {
      name: restaurantName.value.trim(),
      address: restaurantAddress.value.trim(),
      phone: restaurantPhone.value.trim(),
      cashier_name: restaurantCashier.value.trim()
    };
  }

  function renderRestaurantInfo() {
    restaurantName.value = restaurantInfo.name || '';
    restaurantAddress.value = restaurantInfo.address || '';
    restaurantPhone.value = restaurantInfo.phone || '';
    restaurantCashier.value = restaurantInfo.cashier_name || '';

    restaurantPreviewName.textContent = restaurantInfo.name || 'Pho Viet';
    restaurantPreviewAddress.textContent = restaurantInfo.address || 'Chưa có địa chỉ';
    restaurantPreviewPhone.textContent = restaurantInfo.phone || 'Chưa có số điện thoại';
    restaurantPreviewCashier.textContent = restaurantInfo.cashier_name
      ? `Thu ngân: ${restaurantInfo.cashier_name}`
      : 'Thu ngân: chưa nhập';

    api.applyRestaurantInfo(restaurantInfo, 'Admin');

    if (!selectedLiveTableId) {
      renderBillPrintInfo(restaurantInfo);
    }
  }

  async function loadRestaurantInfo() {
    try {
      restaurantInfo = await api.getRestaurantInfo();
      renderRestaurantInfo();
    } catch (error) {
      setRestaurantMessage(error.message, true);
    }
  }

  async function saveRestaurantInfo(event) {
    event.preventDefault();
    setRestaurantMessage('Đang lưu...');

    try {
      restaurantInfo = await api.updateRestaurantInfo(restaurantPayloadFromForm());
      renderRestaurantInfo();
      setRestaurantMessage('Đã lưu thông tin quán.');
    } catch (error) {
      setRestaurantMessage(error.message, true);
    }
  }

  function resetForm() {
    form.reset();
    itemId.value = '';
    itemCategory.value = '';
    itemImageFile.value = '';
    itemAvailable.checked = true;
    formTitle.textContent = 'Thêm món';
    formMode.textContent = 'Nhập thông tin món';
    setMessage('');
  }

  function fillForm(item) {
    itemId.value = item.id;
    itemName.value = item.name;
    itemCategory.value = item.category || '';
    itemPrice.value = item.price;
    itemImage.value = item.image || '';
    itemAvailable.checked = item.available;
    formTitle.textContent = 'Sửa món';
    formMode.textContent = `#${item.id}`;
    setMessage('');
    itemName.focus();
  }

  function payloadFromForm() {
    return {
      name: itemName.value.trim(),
      category: itemCategory.value,
      price: Number(itemPrice.value),
      image: itemImage.value.trim(),
      available: itemAvailable.checked
    };
  }

  function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('Không đọc được ảnh.'));
      reader.readAsDataURL(file);
    });
  }

  function loadImage(dataUrl) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('Không xử lý được ảnh.'));
      image.src = dataUrl;
    });
  }

  async function fileToCompressedDataUrl(file) {
    if (!file) {
      return '';
    }

    if (!file.type.startsWith('image/')) {
      throw new Error('Vui lòng chọn file ảnh.');
    }

    const dataUrl = await readFileAsDataUrl(file);

    const image = await loadImage(dataUrl);
    const maxSide = 1280;
    const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
    const width = Math.max(1, Math.round(image.width * scale));
    const height = Math.max(1, Math.round(image.height * scale));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    context.drawImage(image, 0, 0, width, height);

    return canvas.toDataURL('image/jpeg', 0.82);
  }

  async function uploadSelectedImageIfNeeded() {
    const file = itemImageFile.files?.[0];

    if (!file) {
      return itemImage.value.trim();
    }

    setMessage('Đang upload ảnh...');
    const dataUrl = await fileToCompressedDataUrl(file);
    const uploaded = await api.uploadMenuImage({
      fileName: file.name,
      dataUrl
    });
    itemImage.value = uploaded.url;
    itemImageFile.value = '';
    return uploaded.url;
  }

  function renderMenu() {
    adminMenuBody.replaceChildren();
    const foodCount = menu.filter((item) => item.category === 'food').length;
    const drinkCount = menu.filter((item) => item.category === 'drink').length;
    adminCount.textContent = `${menu.length} món - ${foodCount} đồ ăn, ${drinkCount} nước uống`;

    if (menu.length === 0) {
      const row = document.createElement('tr');
      const cell = document.createElement('td');
      cell.colSpan = 5;
      cell.textContent = 'Menu đang trống.';
      row.append(cell);
      adminMenuBody.append(row);
      return;
    }

    for (const item of menu) {
      const row = document.createElement('tr');

      const name = document.createElement('td');
      name.textContent = item.name;

      const category = document.createElement('td');
      category.textContent = categoryLabels[item.category] || 'Chưa phân loại';

      const price = document.createElement('td');
      price.textContent = api.formatCurrency(item.price);

      const status = document.createElement('td');
      const pill = document.createElement('span');
      pill.className = `status-pill${item.available ? '' : ' off'}`;
      pill.textContent = item.available ? 'Đang bán' : 'Tạm ẩn';
      status.append(pill);

      const actions = document.createElement('td');
      const actionRow = document.createElement('div');
      actionRow.className = 'row-actions';

      const edit = document.createElement('button');
      edit.className = 'ghost-button';
      edit.type = 'button';
      edit.textContent = 'Sửa';
      edit.addEventListener('click', () => fillForm(item));

      const remove = document.createElement('button');
      remove.className = 'danger-button';
      remove.type = 'button';
      remove.textContent = 'Xoá';
      remove.addEventListener('click', () => deleteItem(item));

      actionRow.append(edit, remove);
      actions.append(actionRow);
      row.append(name, category, price, status, actions);
      adminMenuBody.append(row);
    }
  }

  async function loadMenu() {
    adminMenuBody.innerHTML = '<tr><td colspan="5">Đang tải menu...</td></tr>';
    try {
      menu = await api.getMenu(true);
      renderMenu();
    } catch (error) {
      adminMenuBody.innerHTML = '';
      const row = document.createElement('tr');
      const cell = document.createElement('td');
      cell.colSpan = 5;
      cell.textContent = error.message;
      row.append(cell);
      adminMenuBody.append(row);
    }
  }

  async function saveItem(event) {
    event.preventDefault();
    setMessage('Đang lưu...');

    try {
      await uploadSelectedImageIfNeeded();

      if (itemId.value) {
        await api.updateMenuItem(itemId.value, payloadFromForm());
        setMessage('Đã cập nhật món.');
      } else {
        await api.createMenuItem(payloadFromForm());
        setMessage('Đã thêm món.');
      }

      resetForm();
      await loadMenu();
    } catch (error) {
      setMessage(error.message, true);
    }
  }

  async function deleteItem(item) {
    const ok = window.confirm(`Xoá món "${item.name}"?`);
    if (!ok) {
      return;
    }

    try {
      await api.deleteMenuItem(item.id);
      setMessage('Đã xoá món.');
      if (itemId.value === String(item.id)) {
        resetForm();
      }
      await loadMenu();
    } catch (error) {
      setMessage(error.message, true);
    }
  }

  function resetTableForm() {
    tableForm.reset();
    tableId.value = '';
    tableFormTitle.textContent = 'Thêm bàn';
    tableFormMode.textContent = 'Token tự tạo';
    setTableMessage('');
  }

  function fillTableForm(table) {
    tableId.value = table.id;
    tableName.value = table.name;
    tableFormTitle.textContent = 'Sửa bàn';
    tableFormMode.textContent = table.token;
    setTableMessage('');
    tableName.focus();
  }

  function tablePayloadFromForm() {
    return {
      name: tableName.value.trim()
    };
  }

  function slugify(value) {
    return String(value)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'table';
  }

  async function copyLink(table) {
    const orderUrl = getOrderUrl(table);

    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(orderUrl);
      } else {
        const input = document.createElement('textarea');
        input.value = orderUrl;
        document.body.append(input);
        input.select();
        document.execCommand('copy');
        input.remove();
      }
      setTableMessage(`Đã copy link ${table.name}.`);
    } catch (error) {
      setTableMessage(error.message, true);
    }
  }

  async function ensureQr(tableIdValue) {
    const cachedQr = qrByTableId.get(tableIdValue);

    if (!cachedQr?.wifi?.qrDataUrl || !cachedQr?.order?.qrDataUrl) {
      const qr = await api.getTableQr(tableIdValue);
      qrByTableId.set(tableIdValue, qr);
    }

    return qrByTableId.get(tableIdValue);
  }

  function getOrderUrl(table) {
    const qr = qrByTableId.get(table.id);
    return qr?.order?.url || table.url;
  }

  async function loadQrPreviews() {
    try {
      const qrs = await api.getAllTableQr();
      for (const qr of qrs) {
        qrByTableId.set(qr.table_id, qr);
      }
      renderWifiQrPanel(qrs[0]?.wifi);
      renderTables();
    } catch (error) {
      setTableMessage('Không tải trước QR được, bấm Download để tạo QR từng bàn.', true);
    }
  }

  function createQrPreview(table, type, label) {
    const tile = document.createElement('div');
    tile.className = 'qr-preview-tile';

    const title = document.createElement('span');
    title.className = 'qr-preview-label';
    title.textContent = label;

    const wrap = document.createElement('div');
    wrap.className = 'qr-preview';
    const qr = qrByTableId.get(table.id);
    const qrDataUrl = qr?.[type]?.qrDataUrl;

    if (qrDataUrl) {
      const image = document.createElement('img');
      image.src = qrDataUrl;
      image.alt = `${label} ${table.name}`;
      image.loading = 'lazy';
      wrap.append(image);
    } else {
      wrap.textContent = 'QR';
    }

    tile.append(title, wrap);
    return tile;
  }

  function renderWifiQrPanel(wifi) {
    wifiQrPanel.replaceChildren();

    if (!wifi?.qrDataUrl) {
      wifiQrPanel.hidden = true;
      return;
    }

    wifiQrPanel.hidden = false;

    const text = document.createElement('div');
    text.className = 'wifi-qr-text';
    const title = document.createElement('strong');
    title.textContent = 'QR Wi-Fi dùng chung';
    const ssid = document.createElement('span');
    ssid.textContent = `Tên Wi-Fi: ${wifi.ssid || 'Chưa cấu hình'}`;
    text.append(title, ssid);

    const preview = document.createElement('div');
    preview.className = 'qr-preview wifi-main-qr';
    const image = document.createElement('img');
    image.src = wifi.qrDataUrl;
    image.alt = 'QR Wi-Fi dùng chung';
    preview.append(image);

    const download = document.createElement('button');
    download.className = 'ghost-button compact-button';
    download.type = 'button';
    download.textContent = 'Download Wi-Fi QR';
    download.addEventListener('click', () => downloadWifiQr(wifi));

    wifiQrPanel.append(text, preview, download);
  }

  function downloadWifiQr(wifi) {
    const link = document.createElement('a');
    link.href = wifi.qrDataUrl;
    link.download = 'wifi-qr.png';
    document.body.append(link);
    link.click();
    link.remove();
    setTableMessage('Đã tải QR Wi-Fi.');
  }

  function createPrintCard(qr) {
    const card = document.createElement('article');
    card.className = 'print-qr-card';

    const brand = document.createElement('strong');
    brand.textContent = restaurantInfo.name || 'Pho Viet';

    const title = document.createElement('h2');
    title.textContent = qr.name.toUpperCase();

    const wifiHint = document.createElement('p');
    wifiHint.textContent = 'Bước 1: Quét mã này để kết nối Wi-Fi';

    const wifiImage = document.createElement('img');
    wifiImage.src = qr.wifi.qrDataUrl;
    wifiImage.alt = `QR Wi-Fi ${qr.name}`;

    const orderHint = document.createElement('p');
    orderHint.textContent = 'Bước 2: Nếu menu chưa tự mở, quét mã này';

    const orderImage = document.createElement('img');
    orderImage.src = qr.order.qrDataUrl;
    orderImage.alt = `QR Order ${qr.name}`;

    const footer = document.createElement('p');
    footer.className = 'print-qr-footer';
    footer.textContent = 'Đặt món tại bàn của bạn';

    const url = document.createElement('small');
    url.textContent = qr.order.url;

    card.append(brand, title, wifiHint, wifiImage, orderHint, orderImage, footer, url);
    return card;
  }

  function openPrintView(qrs) {
    printArea.replaceChildren();
    for (const qr of qrs) {
      printArea.append(createPrintCard(qr));
    }

    document.body.classList.add('print-mode');
    window.print();
  }

  function createReceiptPrintCard(bill) {
    const card = document.createElement('article');
    card.className = 'print-receipt-card';

    const restaurant = bill.restaurant || restaurantInfo;
    const title = document.createElement('h2');
    title.textContent = restaurant.name || 'Pho Viet';
    card.append(title);

    for (const text of [
      restaurant.address ? `Địa chỉ: ${restaurant.address}` : '',
      restaurant.phone ? `SĐT: ${restaurant.phone}` : '',
      restaurant.cashier_name ? `Thu ngân: ${restaurant.cashier_name}` : '',
      bill.table ? `Bàn: ${bill.table}` : '',
      bill.opened_at ? `Giờ vào: ${formatTime(bill.opened_at)}` : '',
      bill.closed_at ? `Giờ ra: ${formatTime(bill.closed_at)}` : ''
    ]) {
      if (!text) {
        continue;
      }

      const line = document.createElement('p');
      line.textContent = text;
      card.append(line);
    }

    const divider = document.createElement('hr');
    card.append(divider);

    const heading = document.createElement('h3');
    heading.textContent = 'Tổng món';
    card.append(heading);

    for (const item of bill.summary || []) {
      const row = document.createElement('div');
      row.className = 'print-receipt-row';
      const name = document.createElement('span');
      name.textContent = `${item.quantity} ${item.name}`;
      const total = document.createElement('strong');
      total.textContent = api.formatCurrency(item.total);
      row.append(name, total);
      card.append(row);
    }

    const totalRow = document.createElement('div');
    totalRow.className = 'print-receipt-row print-receipt-total';
    const totalLabel = document.createElement('span');
    totalLabel.textContent = 'Tổng tiền';
    const totalValue = document.createElement('strong');
    totalValue.textContent = api.formatCurrency(bill.grand_total || 0);
    totalRow.append(totalLabel, totalValue);
    card.append(totalRow);

    return card;
  }

  function printReceipt(bill) {
    printArea.replaceChildren(createReceiptPrintCard(bill));
    document.body.classList.add('receipt-print-mode');
    window.print();
  }

  function closePrintView() {
    document.body.classList.remove('print-mode', 'receipt-print-mode');
  }

  async function printQr(table) {
    try {
      const qr = await ensureQr(table.id);
      openPrintView([qr]);
    } catch (error) {
      setTableMessage(error.message, true);
    }
  }

  async function printAllQr() {
    try {
      const qrs = await api.getAllTableQr();
      for (const qr of qrs) {
        qrByTableId.set(qr.table_id, qr);
      }
      openPrintView(qrs);
    } catch (error) {
      setTableMessage(error.message, true);
    }
  }

  async function downloadQr(table, type) {
    try {
      const qr = await ensureQr(table.id);
      const qrData = qr[type];
      const label = type === 'wifi' ? 'Wi-Fi' : 'Order';

      if (!qrData?.qrDataUrl) {
        throw new Error(`Không tìm thấy QR ${label}.`);
      }

      const link = document.createElement('a');
      link.href = qrData.qrDataUrl;
      link.download = `table-${slugify(table.name)}-${type}-qr.png`;
      document.body.append(link);
      link.click();
      link.remove();
      setTableMessage(`Đã tải QR ${label} ${table.name}.`);
    } catch (error) {
      setTableMessage(error.message, true);
    }
  }

  async function regenerateToken(table) {
    const ok = window.confirm(`Reset token và QR của "${table.name}"? QR cũ sẽ không còn hợp lệ.`);
    if (!ok) {
      return;
    }

    try {
      const updated = await api.regenerateTableToken(table.id);
      qrByTableId.delete(table.id);
      setTableMessage(`Đã reset token ${updated.name}.`);
      await loadTables();
    } catch (error) {
      setTableMessage(error.message, true);
    }
  }

  async function deleteTable(table) {
    const ok = window.confirm(`Xoá "${table.name}"?`);
    if (!ok) {
      return;
    }

    try {
      await api.deleteTable(table.id);
      qrByTableId.delete(table.id);
      setTableMessage('Đã xoá bàn.');
      if (tableId.value === String(table.id)) {
        resetTableForm();
      }
      await loadTables();
    } catch (error) {
      setTableMessage(error.message, true);
    }
  }

  function renderTables() {
    tablesBody.replaceChildren();
    tableCount.textContent = `${tables.length} bàn`;

    if (tables.length === 0) {
      const row = document.createElement('tr');
      const cell = document.createElement('td');
      cell.colSpan = 4;
      cell.textContent = 'Chưa có bàn.';
      row.append(cell);
      tablesBody.append(row);
      return;
    }

    for (const table of tables) {
      const row = document.createElement('tr');

      const name = document.createElement('td');
      const title = document.createElement('strong');
      title.textContent = table.name;
      const status = document.createElement('span');
      status.className = 'status-pill';
      status.textContent = table.status;
      name.append(title, document.createElement('br'), status);

      const token = document.createElement('td');
      token.className = 'mono-cell';
      token.textContent = table.token;

      const link = document.createElement('td');
      const linkWrap = document.createElement('div');
      linkWrap.className = 'qr-link-cell';
      const orderUrl = getOrderUrl(table);
      const orderBlock = document.createElement('div');
      orderBlock.className = 'order-url-block';
      const orderLabel = document.createElement('span');
      orderLabel.textContent = 'Order URL:';
      const url = document.createElement('a');
      url.href = orderUrl;
      url.target = '_blank';
      url.rel = 'noreferrer';
      url.textContent = orderUrl;
      orderBlock.append(orderLabel, url);
      linkWrap.append(createQrPreview(table, 'order', 'QR Order'), orderBlock);
      link.append(linkWrap);

      const actions = document.createElement('td');
      const actionRow = document.createElement('div');
      actionRow.className = 'row-actions table-actions';

      const downloadOrder = document.createElement('button');
      downloadOrder.className = 'ghost-button';
      downloadOrder.type = 'button';
      downloadOrder.textContent = 'Download Order QR';
      downloadOrder.addEventListener('click', () => downloadQr(table, 'order'));

      const remove = document.createElement('button');
      remove.className = 'danger-button';
      remove.type = 'button';
      remove.textContent = 'Xoá';
      remove.addEventListener('click', () => deleteTable(table));

      actionRow.append(downloadOrder, remove);
      actions.append(actionRow);
      row.append(name, token, link, actions);
      tablesBody.append(row);
    }
  }

  async function loadTables() {
    tablesBody.innerHTML = '<tr><td colspan="4">Đang tải bàn...</td></tr>';
    try {
      tables = await api.getTables();
      renderTables();
      loadQrPreviews();
    } catch (error) {
      tablesBody.innerHTML = '';
      const row = document.createElement('tr');
      const cell = document.createElement('td');
      cell.colSpan = 4;
      cell.textContent = error.message;
      row.append(cell);
      tablesBody.append(row);
    }
  }

  async function saveTable(event) {
    event.preventDefault();
    setTableMessage('Đang lưu...');

    try {
      if (tableId.value) {
        await api.updateTable(tableId.value, tablePayloadFromForm());
        qrByTableId.delete(Number(tableId.value));
        setTableMessage('Đã cập nhật bàn.');
      } else {
        await api.createTable(tablePayloadFromForm());
        setTableMessage('Đã thêm bàn.');
      }

      resetTableForm();
      await loadTables();
    } catch (error) {
      setTableMessage(error.message, true);
    }
  }

  async function createBulkTables(event) {
    event.preventDefault();
    setTableMessage('Đang tạo bàn...');

    try {
      const created = await api.createTablesBulk({
        prefix: bulkPrefix.value.trim(),
        from: Number(bulkFrom.value),
        to: Number(bulkTo.value)
      });
      setTableMessage(`Đã tạo ${created.length} bàn.`);
      await loadTables();
    } catch (error) {
      setTableMessage(error.message, true);
    }
  }

  function formatTime(value) {
    if (!value) {
      return '';
    }

    const date = new Date(value.replace(' ', 'T'));
    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function createStatusPill(status) {
    const pill = document.createElement('span');
    pill.className = `status-pill table-status-${status || 'unknown'}`;
    pill.textContent = tableStatusLabels[status] || status || 'Không rõ';
    return pill;
  }

  function renderBillPrintInfo(info, bill) {
    const source = info || restaurantInfo;
    billPrintInfo.replaceChildren();

    const name = document.createElement('strong');
    name.textContent = source.name || 'Pho Viet';
    billPrintInfo.append(name);

    for (const text of [
      source.address ? `Địa chỉ: ${source.address}` : '',
      source.phone ? `SĐT: ${source.phone}` : '',
      source.cashier_name ? `Thu ngân: ${source.cashier_name}` : '',
      bill?.opened_at ? `Giờ vào: ${formatTime(bill.opened_at)}` : '',
      bill?.session_id ? `Giờ ra: ${bill.closed_at ? formatTime(bill.closed_at) : 'Chưa thanh toán'}` : ''
    ]) {
      if (!text) {
        continue;
      }

      const line = document.createElement('span');
      line.textContent = text;
      billPrintInfo.append(line);
    }
  }

  function resetBillPanel() {
    billTitle.textContent = 'Chọn bàn';
    billMeta.textContent = 'Xem các món đã gọi trong bill hiện tại';
    closeSessionButton.disabled = true;
    closeSessionButton.textContent = 'Thanh toán';
    renderBillPrintInfo(restaurantInfo);
    billOrders.innerHTML = '<p class="empty-state">Chọn một bàn để xem bill.</p>';
    billSummary.innerHTML = '<p class="empty-state">Chưa có món.</p>';
    billGrandTotal.textContent = api.formatCurrency(0);
    setBillMessage('');
  }

  function renderLiveTables() {
    liveTablesGrid.replaceChildren();
    liveTableCount.textContent = `${tables.length} bàn`;

    if (tables.length === 0) {
      liveTablesGrid.innerHTML = '<p class="empty-state">Chưa có bàn.</p>';
      resetBillPanel();
      return;
    }

    for (const table of tables) {
      const card = document.createElement('button');
      card.className = 'table-status-card';
      card.type = 'button';
      card.classList.toggle('is-selected', table.id === selectedLiveTableId);

      const titleRow = document.createElement('span');
      titleRow.className = 'table-status-title';

      const name = document.createElement('strong');
      name.textContent = table.name;
      titleRow.append(name, createStatusPill(table.status));
      card.append(titleRow);
      card.addEventListener('click', () => selectLiveTable(table.id));
      liveTablesGrid.append(card);
    }
  }

  function renderBillOrders(orders, bill) {
    billOrders.replaceChildren();

    if (!orders.length) {
      billOrders.innerHTML = '<p class="empty-state">Bàn này chưa có món trong bill hiện tại.</p>';
      return;
    }

    const canCancelOrder = bill?.session_status === 'open';

    for (const order of orders) {
      const card = document.createElement('article');
      card.className = 'bill-order-card';

      const header = document.createElement('div');
      header.className = 'bill-order-head';

      const title = document.createElement('strong');
      title.textContent = `Đơn #${order.id}`;

      const meta = document.createElement('span');
      meta.textContent = `${orderStatusLabels[order.status] || order.status} - ${formatTime(order.created_at)}`;

      const orderActions = document.createElement('div');
      orderActions.className = 'bill-order-actions';
      orderActions.append(meta);

      if (canCancelOrder) {
        const remove = document.createElement('button');
        remove.className = 'danger-button compact-button bill-remove-order-button';
        remove.type = 'button';
        remove.textContent = 'Xóa đơn';
        remove.addEventListener('click', () => cancelBillOrder(order));
        orderActions.append(remove);
      }

      header.append(title, orderActions);

      const list = document.createElement('ul');
      list.className = 'bill-item-list';

      for (const item of order.items) {
        const row = document.createElement('li');
        const quantity = document.createElement('b');
        quantity.textContent = item.quantity;
        const name = document.createElement('span');
        name.textContent = item.name;
        const total = document.createElement('small');
        total.textContent = api.formatCurrency(item.subtotal);
        row.append(quantity, name, total);
        list.append(row);
      }

      card.append(header, list);
      billOrders.append(card);
    }
  }

  function renderBillSummary(summary) {
    billSummary.replaceChildren();

    if (!summary.length) {
      billSummary.innerHTML = '<p class="empty-state">Chưa có món.</p>';
      return;
    }

    const list = document.createElement('div');
    list.className = 'bill-summary-list';

    for (const item of summary) {
      const row = document.createElement('div');
      row.className = 'bill-summary-row';
      const name = document.createElement('span');
      name.textContent = `${item.quantity} ${item.name}`;
      const total = document.createElement('strong');
      total.textContent = api.formatCurrency(item.total);
      row.append(name, total);
      list.append(row);
    }

    billSummary.append(list);
  }

  function renderBill(bill) {
    billTitle.textContent = bill.table;
    lastClosedBill = bill.session_status === 'closed' ? bill : null;
    closeSessionButton.textContent = bill.session_status === 'closed' ? 'In hóa đơn' : 'Thanh toán';
    closeSessionButton.disabled = !bill.session_id;
    billMeta.textContent = bill.session_id
      ? `Bill #${bill.session_id} - ${bill.closed_at ? `ra lúc ${formatTime(bill.closed_at)}` : `mở lúc ${formatTime(bill.opened_at)}`}`
      : 'Bàn chưa có bill mở.';

    renderBillPrintInfo(bill.restaurant, bill);
    renderBillOrders(bill.orders || [], bill);
    renderBillSummary(bill.summary || []);
    billGrandTotal.textContent = api.formatCurrency(bill.grand_total || 0);
  }

  async function loadSelectedBill() {
    const table = tables.find((item) => item.id === selectedLiveTableId);

    if (!table) {
      selectedLiveTableId = null;
      resetBillPanel();
      return;
    }

    billTitle.textContent = table.name;
    billMeta.textContent = 'Đang tải bill...';
    closeSessionButton.disabled = true;
    closeSessionButton.textContent = 'Thanh toán';
    setBillMessage('');

    try {
      const bill = await api.getCurrentBill(table.id);
      renderBill(bill);
    } catch (error) {
      billMeta.textContent = error.message;
      billOrders.innerHTML = '<p class="empty-state">Không tải được bill.</p>';
      billSummary.innerHTML = '<p class="empty-state">Chưa có món.</p>';
      billGrandTotal.textContent = api.formatCurrency(0);
      setBillMessage(error.message, true);
    }
  }

  async function selectLiveTable(tableIdValue) {
    selectedLiveTableId = tableIdValue;
    renderLiveTables();
    showTableDetailScreen();
  }

  async function loadLiveTables() {
    liveTablesGrid.innerHTML = '<p class="empty-state">Đang tải bàn...</p>';

    try {
      tables = await api.getTables();

      if (selectedLiveTableId && !tables.some((table) => table.id === selectedLiveTableId)) {
        selectedLiveTableId = null;
        resetBillPanel();
      }

      renderLiveTables();
    } catch (error) {
      liveTablesGrid.replaceChildren();
      const empty = document.createElement('p');
      empty.className = 'empty-state';
      empty.textContent = error.message;
      liveTablesGrid.append(empty);
      resetBillPanel();
    }
  }

  async function closeSelectedSession() {
    const table = tables.find((item) => item.id === selectedLiveTableId);

    if (!table) {
      return;
    }

    const ok = window.confirm(`Thanh toán và đóng ${table.name}?`);
    if (!ok) {
      return;
    }

    try {
      setBillMessage('Đang thanh toán...');
      const closedBill = await api.closeTableSession(table.id);
      await loadLiveTables();
      renderBill(closedBill);
      setBillMessage(`Đã thanh toán ${table.name}.`);
    } catch (error) {
      setBillMessage(error.message, true);
    }
  }

  async function cancelBillOrder(order) {
    const ok = window.confirm(`Xóa đơn #${order.id} khỏi bill?`);
    if (!ok) {
      return;
    }

    try {
      setBillMessage(`Đang xóa đơn #${order.id}...`);
      await api.updateOrder(order.id, 'cancelled');
      await loadLiveTables();
      await loadSelectedBill();
      setBillMessage(`Đã xóa đơn #${order.id}.`);
    } catch (error) {
      setBillMessage(error.message, true);
    }
  }

  function handleBillAction() {
    if (lastClosedBill) {
      printReceipt(lastClosedBill);
      return;
    }

    closeSelectedSession();
  }

  function showTableDetailScreen() {
    adminTabs.hidden = true;
    document.querySelectorAll('.admin-tab-panel').forEach((panel) => {
      panel.classList.remove('is-active');
    });
    tableDetailScreen.hidden = false;
    loadSelectedBill();
  }

  function showTableManagerScreen() {
    tableDetailScreen.hidden = true;
    adminTabs.hidden = false;
    switchTab('liveTablesTab');
  }

  function switchTab(tabId) {
    tableDetailScreen.hidden = true;
    adminTabs.hidden = false;

    document.querySelectorAll('.tab-button').forEach((button) => {
      button.classList.toggle('is-active', button.dataset.tab === tabId);
    });
    document.querySelectorAll('.admin-tab-panel').forEach((panel) => {
      panel.classList.toggle('is-active', panel.id === tabId);
    });

    if (tabId === 'tablesTab') {
      loadTables();
    } else if (tabId === 'liveTablesTab') {
      loadLiveTables();
    } else if (tabId === 'restaurantTab') {
      loadRestaurantInfo();
    }
  }

  form.addEventListener('submit', saveItem);
  document.getElementById('resetForm').addEventListener('click', resetForm);
  restaurantForm.addEventListener('submit', saveRestaurantInfo);

  tableForm.addEventListener('submit', saveTable);
  bulkTableForm.addEventListener('submit', createBulkTables);
  document.getElementById('resetTableForm').addEventListener('click', resetTableForm);
  document.getElementById('printAllQr').addEventListener('click', printAllQr);
  backToTablesButton.addEventListener('click', showTableManagerScreen);
  closeSessionButton.addEventListener('click', handleBillAction);
  window.addEventListener('afterprint', closePrintView);

  document.querySelectorAll('.tab-button').forEach((button) => {
    button.addEventListener('click', () => switchTab(button.dataset.tab));
  });

  loadRestaurantInfo();
  loadLiveTables();
  loadMenu();
})();
