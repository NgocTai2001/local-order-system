(function () {
  const api = window.orderApi;

  const form = document.getElementById('menuForm');
  const itemId = document.getElementById('itemId');
  const itemName = document.getElementById('itemName');
  const itemPrice = document.getElementById('itemPrice');
  const itemImage = document.getElementById('itemImage');
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
  const printArea = document.getElementById('printArea');

  let menu = [];
  let tables = [];
  const qrByTableId = new Map();

  function setMessage(text, isError) {
    adminMessage.textContent = text || '';
    adminMessage.style.color = isError ? '#a9371d' : '';
  }

  function setTableMessage(text, isError) {
    tableMessage.textContent = text || '';
    tableMessage.style.color = isError ? '#a9371d' : '';
  }

  function resetForm() {
    form.reset();
    itemId.value = '';
    itemAvailable.checked = true;
    formTitle.textContent = 'Thêm món';
    formMode.textContent = 'Nhập thông tin món';
    setMessage('');
  }

  function fillForm(item) {
    itemId.value = item.id;
    itemName.value = item.name;
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
      price: Number(itemPrice.value),
      image: itemImage.value.trim(),
      available: itemAvailable.checked
    };
  }

  function renderMenu() {
    adminMenuBody.replaceChildren();
    adminCount.textContent = `${menu.length} món`;

    if (menu.length === 0) {
      const row = document.createElement('tr');
      const cell = document.createElement('td');
      cell.colSpan = 4;
      cell.textContent = 'Menu đang trống.';
      row.append(cell);
      adminMenuBody.append(row);
      return;
    }

    for (const item of menu) {
      const row = document.createElement('tr');

      const name = document.createElement('td');
      name.textContent = item.name;

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
      row.append(name, price, status, actions);
      adminMenuBody.append(row);
    }
  }

  async function loadMenu() {
    adminMenuBody.innerHTML = '<tr><td colspan="4">Đang tải menu...</td></tr>';
    try {
      menu = await api.getMenu(true);
      renderMenu();
    } catch (error) {
      adminMenuBody.innerHTML = '';
      const row = document.createElement('tr');
      const cell = document.createElement('td');
      cell.colSpan = 4;
      cell.textContent = error.message;
      row.append(cell);
      adminMenuBody.append(row);
    }
  }

  async function saveItem(event) {
    event.preventDefault();
    setMessage('Đang lưu...');

    try {
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
    if (!qrByTableId.has(tableIdValue)) {
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
      renderTables();
    } catch (error) {
      setTableMessage(error.message, true);
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

  function createQrPreviewSet(table) {
    const set = document.createElement('div');
    set.className = 'qr-preview-set';
    set.append(
      createQrPreview(table, 'wifi', 'QR Wi-Fi'),
      createQrPreview(table, 'order', 'QR Order')
    );
    return set;
  }

  function createPrintCard(qr) {
    const card = document.createElement('article');
    card.className = 'print-qr-card';

    const brand = document.createElement('strong');
    brand.textContent = 'TableFlow';

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

  function closePrintView() {
    document.body.classList.remove('print-mode');
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
      linkWrap.append(createQrPreviewSet(table), orderBlock);
      link.append(linkWrap);

      const actions = document.createElement('td');
      const actionRow = document.createElement('div');
      actionRow.className = 'row-actions table-actions';

      const downloadWifi = document.createElement('button');
      downloadWifi.className = 'ghost-button';
      downloadWifi.type = 'button';
      downloadWifi.textContent = 'Download Wi-Fi QR';
      downloadWifi.addEventListener('click', () => downloadQr(table, 'wifi'));

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

      actionRow.append(downloadWifi, downloadOrder, remove);
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

  function switchTab(tabId) {
    document.querySelectorAll('.tab-button').forEach((button) => {
      button.classList.toggle('is-active', button.dataset.tab === tabId);
    });
    document.querySelectorAll('.admin-tab-panel').forEach((panel) => {
      panel.classList.toggle('is-active', panel.id === tabId);
    });

    if (tabId === 'tablesTab' && tables.length === 0) {
      loadTables();
    }
  }

  form.addEventListener('submit', saveItem);
  document.getElementById('resetForm').addEventListener('click', resetForm);
  document.getElementById('reloadAdminMenu').addEventListener('click', loadMenu);

  tableForm.addEventListener('submit', saveTable);
  bulkTableForm.addEventListener('submit', createBulkTables);
  document.getElementById('resetTableForm').addEventListener('click', resetTableForm);
  document.getElementById('reloadTables').addEventListener('click', loadTables);
  document.getElementById('printAllQr').addEventListener('click', printAllQr);
  window.addEventListener('afterprint', closePrintView);

  document.querySelectorAll('.tab-button').forEach((button) => {
    button.addEventListener('click', () => switchTab(button.dataset.tab));
  });

  loadMenu();
})();
