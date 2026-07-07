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
  let menu = [];

  function setMessage(text, isError) {
    adminMessage.textContent = text || '';
    adminMessage.style.color = isError ? '#a9371d' : '';
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

  form.addEventListener('submit', saveItem);
  document.getElementById('resetForm').addEventListener('click', resetForm);
  document.getElementById('reloadAdminMenu').addEventListener('click', loadMenu);

  loadMenu();
})();
