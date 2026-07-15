(function () {
  const api = window.orderApi;

  const form = document.getElementById('menuForm');
  const itemId = document.getElementById('itemId');
  const itemName = document.getElementById('itemName');
  const itemNameCount = document.getElementById('itemNameCount');
  const itemCategory = document.getElementById('itemCategory');
  const itemDescription = document.getElementById('itemDescription');
  const itemDescriptionCount = document.getElementById('itemDescriptionCount');
  const itemPrice = document.getElementById('itemPrice');
  const itemImage = document.getElementById('itemImage');
  const itemImageFile = document.getElementById('itemImageFile');
  const itemImageFileText = document.getElementById('itemImageFileText');
  const itemAvailable = document.getElementById('itemAvailable');
  const itemAvailableToggle = document.getElementById('itemAvailableToggle');
  const itemAvailableLabel = document.getElementById('itemAvailableLabel');
  const itemDisplaySelect = document.getElementById('itemDisplaySelect');
  const itemDisplayToggle = document.getElementById('itemDisplayToggle');
  const itemDisplayMenu = document.getElementById('itemDisplayMenu');
  const itemDisplaySummary = document.getElementById('itemDisplaySummary');
  const itemFeatured = document.getElementById('itemFeatured');
  const itemTodayOffer = document.getElementById('itemTodayOffer');
  const itemForYou = document.getElementById('itemForYou');
  const itemSortOrder = document.getElementById('itemSortOrder');
  const itemOptionGroups = document.getElementById('itemOptionGroups');
  const adminMenuBody = document.getElementById('adminMenuBody');
  const adminCount = document.getElementById('adminCount');
  const adminMessage = document.getElementById('adminMessage');
  const formTitle = document.getElementById('formTitle');
  const formMode = document.getElementById('formMode');
  const categoryForm = document.getElementById('categoryForm');
  const categoryId = document.getElementById('categoryId');
  const categoryName = document.getElementById('categoryName');
  const categoryIcon = document.getElementById('categoryIcon');
  const categoryColor = document.getElementById('categoryColor');
  const categorySortOrder = document.getElementById('categorySortOrder');
  const categoryVisible = document.getElementById('categoryVisible');
  const categoryBody = document.getElementById('categoryBody');
  const categoryCount = document.getElementById('categoryCount');
  const categoryMessage = document.getElementById('categoryMessage');
  const orderCategoryList = document.getElementById('orderCategoryList');
  const newCategoryButton = document.getElementById('newCategoryButton');
  const newMenuItemButton = document.getElementById('newMenuItemButton');
  const menuItemModal = document.getElementById('menuItemModal');
  const categoryModal = document.getElementById('categoryModal');
  const adminModalBackdrop = document.getElementById('adminModalBackdrop');
  const closeMenuItemModal = document.getElementById('closeMenuItemModal');
  const closeCategoryModal = document.getElementById('closeCategoryModal');
  const categoryFormTitle = document.getElementById('categoryFormTitle');
  const categoryFormMode = document.getElementById('categoryFormMode');
  const optionGroupForm = document.getElementById('optionGroupForm');
  const optionGroupId = document.getElementById('optionGroupId');
  const optionGroupName = document.getElementById('optionGroupName');
  const optionGroupDescription = document.getElementById('optionGroupDescription');
  const optionGroupSelectionType = document.getElementById('optionGroupSelectionType');
  const optionGroupRequired = document.getElementById('optionGroupRequired');
  const optionGroupMin = document.getElementById('optionGroupMin');
  const optionGroupMax = document.getElementById('optionGroupMax');
  const optionGroupSortOrder = document.getElementById('optionGroupSortOrder');
  const optionGroupActive = document.getElementById('optionGroupActive');
  const optionValuesList = document.getElementById('optionValuesList');
  const optionGroupBody = document.getElementById('optionGroupBody');
  const optionGroupCount = document.getElementById('optionGroupCount');
  const optionGroupMessage = document.getElementById('optionGroupMessage');
  const optionGroupModal = document.getElementById('optionGroupModal');
  const newOptionGroupButton = document.getElementById('newOptionGroupButton');
  const closeOptionGroupModal = document.getElementById('closeOptionGroupModal');
  const optionGroupFormTitle = document.getElementById('optionGroupFormTitle');
  const optionGroupFormMode = document.getElementById('optionGroupFormMode');

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
  const quickOrderLink = document.getElementById('quickOrderLink');
  const downloadTableOrderQr = document.getElementById('downloadTableOrderQr');
  const floorAreaList = document.getElementById('floorAreaList');
  const selectedAreaName = document.getElementById('selectedAreaName');
  const floorPlanViewport = document.getElementById('floorPlanViewport');
  const floorPlanStage = document.getElementById('floorPlanStage');
  const floorPlanEmpty = document.getElementById('floorPlanEmpty');
  const floorSaveStatus = document.getElementById('floorSaveStatus');
  const floorArrangeMode = document.getElementById('floorArrangeMode');
  const floorGridToggle = document.getElementById('floorGridToggle');
  const floorTableSearch = document.getElementById('floorTableSearch');
  const floorStatusFilters = document.getElementById('floorStatusFilters');
  const floorModalBackdrop = document.getElementById('floorModalBackdrop');
  const areaModal = document.getElementById('areaModal');
  const floorAreaForm = document.getElementById('floorAreaForm');
  const floorAreaId = document.getElementById('floorAreaId');
  const floorAreaName = document.getElementById('floorAreaName');
  const floorAreaDescription = document.getElementById('floorAreaDescription');
  const floorAreaSortOrder = document.getElementById('floorAreaSortOrder');
  const floorAreaActive = document.getElementById('floorAreaActive');
  const areaModalTitle = document.getElementById('areaModalTitle');
  const areaModalMode = document.getElementById('areaModalMode');
  const deleteAreaButton = document.getElementById('deleteAreaButton');
  const floorAreaMessage = document.getElementById('floorAreaMessage');
  const floorTableModal = document.getElementById('floorTableModal');
  const floorTableForm = document.getElementById('floorTableForm');
  const floorTableId = document.getElementById('floorTableId');
  const floorTableName = document.getElementById('floorTableName');
  const floorTableArea = document.getElementById('floorTableArea');
  const floorTableShape = document.getElementById('floorTableShape');
  const floorTableCapacity = document.getElementById('floorTableCapacity');
  const floorTableStatus = document.getElementById('floorTableStatus');
  const floorTableModalTitle = document.getElementById('floorTableModalTitle');
  const floorTableModalMode = document.getElementById('floorTableModalMode');
  const deleteFloorTableButton = document.getElementById('deleteFloorTableButton');
  const floorTableMessage = document.getElementById('floorTableMessage');
  const billTitle = document.getElementById('billTitle');
  const billMeta = document.getElementById('billMeta');
  const billOrders = document.getElementById('billOrders');
  const billPrintInfo = document.getElementById('billPrintInfo');
  const billPaymentInfo = document.getElementById('billPaymentInfo');
  const billSummary = document.getElementById('billSummary');
  const billGrandTotal = document.getElementById('billGrandTotal');
  const closeSessionButton = document.getElementById('closeSessionButton');
  const billMessage = document.getElementById('billMessage');
  const restaurantForm = document.getElementById('restaurantForm');
  const restaurantName = document.getElementById('restaurantName');
  const restaurantAddress = document.getElementById('restaurantAddress');
  const restaurantPhone = document.getElementById('restaurantPhone');
  const restaurantCashier = document.getElementById('restaurantCashier');
  const restaurantLogoImage = document.getElementById('restaurantLogoImage');
  const restaurantLogoFile = document.getElementById('restaurantLogoFile');
  const restaurantBankName = document.getElementById('restaurantBankName');
  const restaurantBankAccountName = document.getElementById('restaurantBankAccountName');
  const restaurantBankAccountNumber = document.getElementById('restaurantBankAccountNumber');
  const restaurantBankTransferNote = document.getElementById('restaurantBankTransferNote');
  const restaurantBankQrImage = document.getElementById('restaurantBankQrImage');
  const restaurantBankQrFile = document.getElementById('restaurantBankQrFile');
  const restaurantBankQrPreview = document.getElementById('restaurantBankQrPreview');
  const restaurantMessage = document.getElementById('restaurantMessage');
  const restaurantPreviewLogo = document.getElementById('restaurantPreviewLogo');
  const restaurantPreviewName = document.getElementById('restaurantPreviewName');
  const restaurantPreviewAddress = document.getElementById('restaurantPreviewAddress');
  const restaurantPreviewPhone = document.getElementById('restaurantPreviewPhone');
  const restaurantPreviewCashier = document.getElementById('restaurantPreviewCashier');
  const restaurantPreviewBankQr = document.getElementById('restaurantPreviewBankQr');
  const restaurantPreviewBankName = document.getElementById('restaurantPreviewBankName');
  const restaurantPreviewBankAccountName = document.getElementById('restaurantPreviewBankAccountName');
  const restaurantPreviewBankAccountNumber = document.getElementById('restaurantPreviewBankAccountNumber');
  const restaurantPreviewBankTransferNote = document.getElementById('restaurantPreviewBankTransferNote');

  let menu = [];
  let menuCategories = [];
  let optionGroups = [];
  let areas = [];
  let tables = [];
  let selectedAreaId = null;
  let floorStatusFilter = 'all';
  let floorPositionSaveTimer = null;
  const pendingFloorPositions = new Set();
  let realtimeRefreshTimer = null;
  let restaurantInfo = {
    name: 'Pho Viet',
    address: '',
    phone: '',
    cashier_name: '',
    logo_image: '',
    bank_name: '',
    bank_account_name: '',
    bank_account_number: '',
    bank_transfer_note: '',
    bank_qr_image: ''
  };
  let selectedLiveTableId = null;
  let lastClosedBill = null;
  const qrByTableId = new Map();
  const fallbackCategoryLabels = {
    food: 'Đồ ăn',
    drink: 'Nước uống'
  };
  const TODAY_OFFER_KEY = 'today-offer';
  const FOR_YOU_KEY = 'for-you';
  const tableStatusLabels = {
    available: 'Trống',
    in_use: 'Đang dùng',
    reserved: 'Đã đặt',
    maintenance: 'Bảo trì'
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

  function setCategoryMessage(text, isError) {
    categoryMessage.textContent = text || '';
    categoryMessage.style.color = isError ? '#a9371d' : '';
  }

  function setOptionGroupMessage(text, isError) {
    optionGroupMessage.textContent = text || '';
    optionGroupMessage.style.color = isError ? '#a9371d' : '';
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

  function openAdminModal(modal) {
    adminModalBackdrop.hidden = false;
    modal.hidden = false;
    document.body.classList.add('sheet-open');
  }

  function closeAdminModals() {
    menuItemModal.hidden = true;
    categoryModal.hidden = true;
    optionGroupModal.hidden = true;
    adminModalBackdrop.hidden = true;
    closeDisplayOptionMenu();
    document.body.classList.remove('sheet-open');
  }

  function openMenuItemModal() {
    resetForm();
    openAdminModal(menuItemModal);
    itemName.focus();
  }

  function openCategoryModal() {
    resetCategoryForm();
    openAdminModal(categoryModal);
    categoryName.focus();
  }

  function openOptionGroupModal() {
    resetOptionGroupForm();
    openAdminModal(optionGroupModal);
    optionGroupName.focus();
  }

  function restaurantPayloadFromForm() {
    return {
      name: restaurantName.value.trim(),
      address: restaurantAddress.value.trim(),
      phone: restaurantPhone.value.trim(),
      cashier_name: restaurantCashier.value.trim(),
      logo_image: restaurantLogoImage.value.trim(),
      bank_name: restaurantBankName.value.trim(),
      bank_account_name: restaurantBankAccountName.value.trim(),
      bank_account_number: restaurantBankAccountNumber.value.trim(),
      bank_transfer_note: restaurantBankTransferNote.value.trim(),
      bank_qr_image: restaurantBankQrImage.value.trim()
    };
  }

  function initials(value) {
    return String(value || '')
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'PV';
  }

  function renderImageSlot(slot, imageUrl, fallbackText) {
    slot.replaceChildren();
    const url = String(imageUrl || '').trim();

    if (url) {
      const image = document.createElement('img');
      image.src = url;
      image.alt = fallbackText;
      image.loading = 'lazy';
      image.onerror = () => {
        slot.textContent = fallbackText;
      };
      slot.append(image);
      return;
    }

    slot.textContent = fallbackText;
  }

  async function previewImageFile(input, slot, fallbackText) {
    const file = input.files?.[0];
    if (!file) {
      return '';
    }

    try {
      if (!file.type.startsWith('image/')) {
        throw new Error('Vui lòng chọn file ảnh.');
      }
      const dataUrl = await readFileAsDataUrl(file);
      renderImageSlot(slot, dataUrl, fallbackText);
      return dataUrl;
    } catch (error) {
      setRestaurantMessage(error.message, true);
      input.value = '';
      return '';
    }
  }

  async function uploadRestaurantImageIfNeeded(fileInput, hiddenInput, kind) {
    const file = fileInput.files?.[0];

    if (!file) {
      return hiddenInput.value.trim();
    }

    if (!file.type.startsWith('image/')) {
      throw new Error('Vui lòng chọn file ảnh.');
    }

    const dataUrl = kind === 'bank-qr'
      ? await readFileAsDataUrl(file)
      : await fileToCompressedDataUrl(file);
    const uploaded = await api.uploadRestaurantImage({
      fileName: file.name,
      kind,
      dataUrl
    });

    hiddenInput.value = uploaded.url;
    fileInput.value = '';
    return uploaded.url;
  }

  async function uploadRestaurantImagesIfNeeded() {
    if (restaurantLogoFile.files?.[0] || restaurantBankQrFile.files?.[0]) {
      setRestaurantMessage('Đang upload ảnh...');
    }
    await uploadRestaurantImageIfNeeded(restaurantLogoFile, restaurantLogoImage, 'logo');
    await uploadRestaurantImageIfNeeded(restaurantBankQrFile, restaurantBankQrImage, 'bank-qr');
  }

  function syncRestaurantDraftPreview() {
    const draft = restaurantPayloadFromForm();
    const restaurantNameText = draft.name || 'Pho Viet';
    const logoUrl = restaurantPreviewLogo.querySelector('img')?.src || draft.logo_image;
    const qrUrl = restaurantBankQrPreview.querySelector('img')?.src || draft.bank_qr_image;
    const transferNote = draft.bank_transfer_note || `${restaurantNameText} - Thanh toán hóa đơn`;

    renderImageSlot(restaurantPreviewLogo, logoUrl, initials(restaurantNameText));
    renderImageSlot(restaurantPreviewBankQr, qrUrl, 'QR');

    restaurantPreviewName.textContent = restaurantNameText;
    restaurantPreviewAddress.textContent = draft.address || 'Chưa có địa chỉ';
    restaurantPreviewPhone.textContent = draft.phone || 'Chưa có số điện thoại';
    restaurantPreviewCashier.textContent = draft.cashier_name || 'Chưa nhập';
    restaurantPreviewBankName.textContent = draft.bank_name || 'Chưa có ngân hàng';
    restaurantPreviewBankAccountName.textContent = draft.bank_account_name || 'Chưa nhập';
    restaurantPreviewBankAccountNumber.textContent = draft.bank_account_number || 'Chưa nhập';
    restaurantPreviewBankTransferNote.textContent = transferNote;
  }

  function renderRestaurantInfo() {
    restaurantName.value = restaurantInfo.name || '';
    restaurantAddress.value = restaurantInfo.address || '';
    restaurantPhone.value = restaurantInfo.phone || '';
    restaurantCashier.value = restaurantInfo.cashier_name || '';
    restaurantLogoImage.value = restaurantInfo.logo_image || '';
    restaurantBankName.value = restaurantInfo.bank_name || '';
    restaurantBankAccountName.value = restaurantInfo.bank_account_name || '';
    restaurantBankAccountNumber.value = restaurantInfo.bank_account_number || '';
    restaurantBankTransferNote.value = restaurantInfo.bank_transfer_note || '';
    restaurantBankQrImage.value = restaurantInfo.bank_qr_image || '';
    restaurantLogoFile.value = '';
    restaurantBankQrFile.value = '';

    const restaurantNameText = restaurantInfo.name || 'Pho Viet';
    renderImageSlot(restaurantPreviewLogo, restaurantInfo.logo_image, initials(restaurantNameText));
    renderImageSlot(restaurantBankQrPreview, restaurantInfo.bank_qr_image, 'QR');
    syncRestaurantDraftPreview();

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

  function getCategory(categoryKey) {
    return menuCategories.find((category) => category.key === categoryKey);
  }

  function categoryLabel(categoryKey) {
    return getCategory(categoryKey)?.name || fallbackCategoryLabels[categoryKey] || 'Chưa phân loại';
  }

  function categoryItemCount(category) {
    if (category.key === TODAY_OFFER_KEY) {
      return menu.filter((item) => item.show_today_offer).length;
    }

    if (category.key === FOR_YOU_KEY) {
      return menu.filter((item) => item.show_for_you).length;
    }

    return menu.filter((item) => item.category === category.key).length;
  }

  function renderCategoryOptions() {
    const currentValue = itemCategory.value;
    itemCategory.innerHTML = '<option value="">Chọn loại / mục</option>';

    for (const category of menuCategories) {
      if (category.is_system) {
        continue;
      }

      if (!category.visible && category.key !== currentValue) {
        continue;
      }

      const option = document.createElement('option');
      option.value = category.key;
      option.textContent = `${category.icon ? `${category.icon} ` : ''}${category.name}`;
      itemCategory.append(option);
    }

    itemCategory.value = currentValue;
  }

  function resetCategoryForm() {
    categoryForm.reset();
    categoryId.value = '';
    categoryColor.value = '#24745c';
    categorySortOrder.value = menuCategories.filter((category) => !category.is_system).length + 1;
    categoryVisible.checked = true;
    categoryFormTitle.textContent = 'Thêm loại mới';
    categoryFormMode.textContent = 'Tạo danh mục để hiển thị trên trang order';
    setCategoryMessage('');
  }

  function fillCategoryForm(category) {
    categoryId.value = category.id;
    categoryName.value = category.name;
    categoryIcon.value = category.icon || '';
    categoryColor.value = category.color || '#24745c';
    categorySortOrder.value = category.sort_order || 0;
    categoryVisible.checked = category.visible;
    categoryFormTitle.textContent = 'Sửa danh mục';
    categoryFormMode.textContent = category.is_system ? 'Mục cố định' : `#${category.id}`;
    setCategoryMessage('');
    openAdminModal(categoryModal);
    categoryName.focus();
  }

  function categoryPayloadFromForm() {
    return {
      name: categoryName.value.trim(),
      icon: categoryIcon.value.trim(),
      color: categoryColor.value,
      visible: categoryVisible.checked,
      sort_order: Number(categorySortOrder.value || 0)
    };
  }

  function iconSvg(paths) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');

    for (const value of paths) {
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', value);
      svg.append(path);
    }

    return svg;
  }

  function renderCategoryList() {
    categoryBody.replaceChildren();
    orderCategoryList?.replaceChildren();
    categoryCount.textContent = `${menuCategories.length} loại danh mục`;
    renderCategoryOptions();

    if (menuCategories.length === 0) {
      const row = document.createElement('tr');
      const cell = document.createElement('td');
      cell.colSpan = 4;
      cell.textContent = 'Chưa có loại món.';
      row.append(cell);
      categoryBody.append(row);
      return;
    }

    menuCategories.forEach((category, index) => {
      const itemCount = categoryItemCount(category);
      const row = document.createElement('tr');

      const order = document.createElement('td');
      order.textContent = index + 1;

      const name = document.createElement('td');
      const nameWrap = document.createElement('div');
      nameWrap.className = 'category-name-cell';
      const nameIcon = document.createElement('span');
      nameIcon.className = 'category-icon-tile';
      nameIcon.textContent = category.icon || '•';
      const nameText = document.createElement('span');
      const categoryTitle = document.createElement('strong');
      categoryTitle.textContent = category.name;
      nameText.append(categoryTitle);
      if (category.is_system) {
        const type = document.createElement('small');
        type.className = 'muted-line';
        type.textContent = 'Mục cố định';
        nameText.append(type);
      }
      nameWrap.append(nameIcon, nameText);
      name.append(nameWrap);

      const status = document.createElement('td');
      const pill = document.createElement('span');
      pill.className = `status-pill${category.visible ? '' : ' off'}`;
      pill.textContent = category.visible ? '✓ Hiển thị' : 'Đang ẩn';
      status.append(pill);

      const actions = document.createElement('td');
      const actionRow = document.createElement('div');
      actionRow.className = 'row-actions category-actions';

      const edit = document.createElement('button');
      edit.className = 'icon-action-button';
      edit.type = 'button';
      edit.title = 'Sửa danh mục';
      edit.setAttribute('aria-label', `Sửa ${category.name}`);
      edit.append(iconSvg([
        'M12 20h9',
        'M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4 11.5-11.5z'
      ]));
      edit.addEventListener('click', () => fillCategoryForm(category));

      const remove = document.createElement('button');
      remove.className = 'icon-action-button danger-icon-button';
      remove.type = 'button';
      remove.title = category.is_system ? 'Mục cố định không thể xoá' : 'Xoá danh mục';
      remove.setAttribute('aria-label', category.is_system ? `${category.name} là mục cố định` : `Xoá ${category.name}`);
      remove.append(iconSvg([
        'M3 6h18',
        'M8 6V4h8v2',
        'M6 6l1 15h10l1-15',
        'M10 11v6',
        'M14 11v6'
      ]));
      remove.disabled = category.is_system;
      if (!category.is_system) {
        remove.addEventListener('click', () => deleteCategory(category));
      }

      actionRow.append(edit, remove);
      actions.append(actionRow);
      row.append(order, name, status, actions);
      categoryBody.append(row);

      if (!orderCategoryList) {
        return;
      }

      const orderCard = document.createElement('div');
      orderCard.className = 'order-category-card';
      const orderNumber = document.createElement('strong');
      orderNumber.textContent = index + 1;
      const orderIcon = document.createElement('span');
      orderIcon.className = 'order-category-icon';
      orderIcon.textContent = category.icon || '•';
      const orderName = document.createElement('span');
      orderName.textContent = category.name;
      const orderCount = document.createElement('em');
      orderCount.textContent = category.is_system ? `${itemCount} món - cố định` : `${itemCount} món`;
      orderCard.append(orderNumber, orderIcon, orderName, orderCount);
      orderCategoryList.append(orderCard);
    });
  }

  async function loadCategories() {
    categoryBody.innerHTML = '<tr><td colspan="4">Đang tải loại món...</td></tr>';

    try {
      menuCategories = await api.getMenuCategories(true);
      renderCategoryList();
    } catch (error) {
      categoryBody.innerHTML = '';
      const row = document.createElement('tr');
      const cell = document.createElement('td');
      cell.colSpan = 4;
      cell.textContent = error.message;
      row.append(cell);
      categoryBody.append(row);
    }
  }

  async function saveCategory(event) {
    event.preventDefault();
    setCategoryMessage('Đang lưu loại...');

    try {
      if (categoryId.value) {
        await api.updateMenuCategory(categoryId.value, categoryPayloadFromForm());
        setCategoryMessage('Đã cập nhật loại.');
      } else {
        await api.createMenuCategory(categoryPayloadFromForm());
        setCategoryMessage('Đã thêm loại.');
      }

      resetCategoryForm();
      await loadCategories();
      await loadMenu();
      closeAdminModals();
    } catch (error) {
      setCategoryMessage(error.message, true);
    }
  }

  async function deleteCategory(category) {
    const ok = window.confirm(`Xoá loại "${category.name}"?`);
    if (!ok) {
      return;
    }

    try {
      await api.deleteMenuCategory(category.id);
      setCategoryMessage('Đã xoá loại.');
      if (categoryId.value === String(category.id)) {
        resetCategoryForm();
      }
      await loadCategories();
      await loadMenu();
    } catch (error) {
      setCategoryMessage(error.message, true);
    }
  }

  function formatAdjustment(value) {
    const amount = Number(value || 0);
    return amount === 0 ? 'Miễn phí' : `+${api.formatCurrency(amount)}`;
  }

  function renderItemOptionChoices(selectedGroups = []) {
    itemOptionGroups.replaceChildren();

    const selectedById = new Map((selectedGroups || []).map((group, index) => [
      Number(group.id || group.option_group_id),
      group.sort_order || index + 1
    ]));
    const activeGroups = optionGroups.filter((group) => group.is_active);

    if (activeGroups.length === 0) {
      itemOptionGroups.innerHTML = '<p class="empty-state compact-empty">Chưa có bộ tùy chọn nào. Hãy tạo ở phần Bộ tùy chọn.</p>';
      return;
    }

    activeGroups.forEach((group, index) => {
      const row = document.createElement('label');
      row.className = 'item-option-choice';
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.value = group.id;
      checkbox.checked = selectedById.has(group.id);
      const name = document.createElement('span');
      name.textContent = group.name;
      const sort = document.createElement('input');
      sort.type = 'number';
      sort.step = '1';
      sort.value = selectedById.get(group.id) || index + 1;
      sort.setAttribute('aria-label', `Thứ tự ${group.name}`);
      row.append(checkbox, name, sort);
      itemOptionGroups.append(row);
    });
  }

  function selectedItemOptionGroups() {
    return Array.from(itemOptionGroups.querySelectorAll('.item-option-choice'))
      .map((row, index) => {
        const checkbox = row.querySelector('input[type="checkbox"]');
        const sort = row.querySelector('input[type="number"]');

        if (!checkbox.checked) {
          return null;
        }

        return {
          option_group_id: Number(checkbox.value),
          sort_order: Number(sort.value || index + 1)
        };
      })
      .filter(Boolean)
      .sort((first, second) => first.sort_order - second.sort_order || first.option_group_id - second.option_group_id);
  }

  function addOptionValueRow(value = {}) {
    const row = document.createElement('div');
    row.className = 'option-value-row';
    row.dataset.id = value.id || '';
    row.innerHTML = `
      <span class="drag-handle" title="Sắp xếp">⋮⋮</span>
      <input class="option-value-name" type="text" maxlength="80" placeholder="Tên giá trị" value="">
      <input class="option-value-price" type="number" min="0" step="1000" placeholder="Giá cộng" value="0">
      <label class="inline-check"><input class="option-value-default" type="checkbox"> Mặc định</label>
      <label class="inline-check"><input class="option-value-active" type="checkbox" checked> Hiển thị</label>
      <input class="option-value-sort" type="number" step="1" value="0" aria-label="Thứ tự giá trị">
    `;
    const remove = document.createElement('button');
    remove.className = 'icon-action-button danger-icon-button option-value-remove';
    remove.type = 'button';
    remove.title = 'Xóa giá trị';
    remove.setAttribute('aria-label', 'Xóa giá trị tùy chọn');
    remove.append(iconSvg([
      'M3 6h18',
      'M8 6V4h8v2',
      'M6 6l1 15h10l1-15',
      'M10 11v6',
      'M14 11v6'
    ]));
    row.append(remove);
    row.querySelector('.option-value-name').value = value.name || '';
    row.querySelector('.option-value-price').value = value.price_adjustment || 0;
    row.querySelector('.option-value-default').checked = Boolean(value.is_default);
    row.querySelector('.option-value-active').checked = value.is_active !== false;
    row.querySelector('.option-value-sort').value = value.sort_order || optionValuesList.children.length + 1;
    remove.addEventListener('click', () => {
      row.remove();
    });
    optionValuesList.append(row);
  }

  function resetOptionGroupForm() {
    optionGroupForm.reset();
    optionGroupId.value = '';
    optionGroupSelectionType.value = 'single';
    optionGroupRequired.checked = false;
    optionGroupMin.value = '0';
    optionGroupMax.value = '1';
    optionGroupSortOrder.value = optionGroups.length + 1;
    optionGroupActive.checked = true;
    optionValuesList.replaceChildren();
    addOptionValueRow({ name: 'M', sort_order: 1, is_default: true });
    optionGroupFormTitle.textContent = 'Thêm bộ tùy chọn';
    optionGroupFormMode.textContent = 'Tạo bộ để gán cho nhiều món';
    setOptionGroupMessage('');
  }

  function fillOptionGroupForm(group) {
    optionGroupId.value = group.id;
    optionGroupName.value = group.name;
    optionGroupDescription.value = group.description || '';
    optionGroupSelectionType.value = group.selection_type;
    optionGroupRequired.checked = group.is_required;
    optionGroupMin.value = group.min_select || 0;
    optionGroupMax.value = group.max_select || 1;
    optionGroupSortOrder.value = group.sort_order || 0;
    optionGroupActive.checked = group.is_active;
    optionValuesList.replaceChildren();
    (group.values || []).forEach(addOptionValueRow);
    if (optionValuesList.children.length === 0) {
      addOptionValueRow();
    }
    optionGroupFormTitle.textContent = 'Sửa bộ tùy chọn';
    optionGroupFormMode.textContent = `#${group.id}`;
    setOptionGroupMessage('');
    openAdminModal(optionGroupModal);
    optionGroupName.focus();
  }

  function optionGroupPayloadFromForm() {
    const values = Array.from(optionValuesList.querySelectorAll('.option-value-row')).map((row, index) => ({
      id: row.dataset.id ? Number(row.dataset.id) : undefined,
      name: row.querySelector('.option-value-name').value.trim(),
      price_adjustment: Number(row.querySelector('.option-value-price').value || 0),
      is_default: row.querySelector('.option-value-default').checked,
      sort_order: Number(row.querySelector('.option-value-sort').value || index + 1),
      is_active: row.querySelector('.option-value-active').checked
    }));

    return {
      name: optionGroupName.value.trim(),
      description: optionGroupDescription.value.trim(),
      selection_type: optionGroupSelectionType.value,
      is_required: optionGroupRequired.checked,
      min_select: Number(optionGroupMin.value || 0),
      max_select: Number(optionGroupMax.value || 1),
      sort_order: Number(optionGroupSortOrder.value || 0),
      is_active: optionGroupActive.checked,
      values
    };
  }

  function renderOptionGroups() {
    optionGroupBody.replaceChildren();
    optionGroupCount.textContent = `${optionGroups.length} bộ`;
    renderItemOptionChoices();

    if (optionGroups.length === 0) {
      const row = document.createElement('tr');
      const cell = document.createElement('td');
      cell.colSpan = 5;
      cell.textContent = 'Chưa có bộ tùy chọn.';
      row.append(cell);
      optionGroupBody.append(row);
      return;
    }

    for (const group of optionGroups) {
      const row = document.createElement('tr');
      const name = document.createElement('td');
      const title = document.createElement('strong');
      title.textContent = group.name;
      const description = document.createElement('small');
      description.className = 'muted-line';
      description.textContent = group.description || `${group.values.length} giá trị`;
      name.append(title, description);

      const type = document.createElement('td');
      type.textContent = group.selection_type === 'multiple' ? 'Chọn nhiều' : 'Chọn một';

      const values = document.createElement('td');
      values.textContent = group.values.slice(0, 3).map((value) => `${value.name} (${formatAdjustment(value.price_adjustment)})`).join(', ')
        || 'Chưa có giá trị';

      const status = document.createElement('td');
      const pill = document.createElement('span');
      pill.className = `status-pill${group.is_active ? '' : ' off'}`;
      pill.textContent = group.is_active ? '✓ Hiển thị' : 'Đang ẩn';
      status.append(pill);

      const actions = document.createElement('td');
      const actionRow = document.createElement('div');
      actionRow.className = 'row-actions category-actions';
      const edit = document.createElement('button');
      edit.className = 'icon-action-button';
      edit.type = 'button';
      edit.title = 'Sửa bộ tùy chọn';
      edit.append(iconSvg([
        'M12 20h9',
        'M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4 11.5-11.5z'
      ]));
      edit.addEventListener('click', () => fillOptionGroupForm(group));
      const remove = document.createElement('button');
      remove.className = 'icon-action-button danger-icon-button';
      remove.type = 'button';
      remove.title = 'Xóa bộ tùy chọn';
      remove.append(iconSvg([
        'M3 6h18',
        'M8 6V4h8v2',
        'M6 6l1 15h10l1-15',
        'M10 11v6',
        'M14 11v6'
      ]));
      remove.addEventListener('click', () => deleteOptionGroup(group));
      actionRow.append(edit, remove);
      actions.append(actionRow);
      row.append(name, type, values, status, actions);
      optionGroupBody.append(row);
    }
  }

  async function loadOptionGroups() {
    optionGroupBody.innerHTML = '<tr><td colspan="5">Đang tải bộ tùy chọn...</td></tr>';

    try {
      optionGroups = await api.getOptionGroups();
      renderOptionGroups();
    } catch (error) {
      optionGroupBody.innerHTML = `<tr><td colspan="5">${error.message}</td></tr>`;
    }
  }

  async function saveOptionGroup(event) {
    event.preventDefault();
    setOptionGroupMessage('Đang lưu bộ tùy chọn...');

    try {
      if (optionGroupId.value) {
        await api.updateOptionGroup(optionGroupId.value, optionGroupPayloadFromForm());
      } else {
        await api.createOptionGroup(optionGroupPayloadFromForm());
      }

      await loadOptionGroups();
      await loadMenu();
      closeAdminModals();
    } catch (error) {
      setOptionGroupMessage(error.message, true);
    }
  }

  async function deleteOptionGroup(group) {
    const ok = window.confirm(`Xóa bộ tùy chọn "${group.name}"?`);
    if (!ok) {
      return;
    }

    try {
      await api.deleteOptionGroup(group.id);
      await loadOptionGroups();
      await loadMenu();
    } catch (error) {
      setOptionGroupMessage(error.message, true);
      fillOptionGroupForm(group);
    }
  }

  async function saveRestaurantInfo(event) {
    event.preventDefault();
    setRestaurantMessage('Đang lưu...');

    try {
      await uploadRestaurantImagesIfNeeded();
      restaurantInfo = await api.updateRestaurantInfo(restaurantPayloadFromForm());
      renderRestaurantInfo();
      setRestaurantMessage('Đã lưu thông tin quán.');
    } catch (error) {
      setRestaurantMessage(error.message, true);
    }
  }

  function updateDisplayOptionSummary() {
    const labels = [];

    if (itemTodayOffer.checked) {
      labels.push('Ưu đãi hôm nay');
    }

    if (itemForYou.checked) {
      labels.push('Dành cho bạn');
    }

    if (itemFeatured.checked) {
      labels.push('Nổi bật');
    }

    itemDisplaySummary.textContent = labels.length ? labels.join(', ') : 'Không áp dụng';
    itemDisplayToggle.classList.toggle('has-value', labels.length > 0);
  }

  function closeDisplayOptionMenu() {
    itemDisplayMenu.hidden = true;
    itemDisplayToggle.setAttribute('aria-expanded', 'false');
  }

  function toggleDisplayOptionMenu() {
    const shouldOpen = itemDisplayMenu.hidden;
    itemDisplayMenu.hidden = !shouldOpen;
    itemDisplayToggle.setAttribute('aria-expanded', String(shouldOpen));
  }

  function updateTextCounter(input, counter, maxLength) {
    counter.textContent = `${input.value.length}/${maxLength}`;
  }

  function updateMenuCounters() {
    updateTextCounter(itemName, itemNameCount, 100);
    updateTextCounter(itemDescription, itemDescriptionCount, 300);
  }

  function updateMenuFileText() {
    const file = itemImageFile.files[0];
    itemImageFileText.innerHTML = file ? file.name : 'Kéo thả ảnh vào đây<br>hoặc bấm để chọn file';
  }

  function setItemAvailableState(isAvailable) {
    itemAvailable.value = isAvailable ? '1' : '0';
    itemAvailableToggle.classList.toggle('is-on', isAvailable);
    itemAvailableToggle.setAttribute('aria-pressed', String(isAvailable));
    itemAvailableLabel.textContent = isAvailable ? 'Đang bán' : 'Tạm ẩn';
  }

  function resetForm() {
    form.reset();
    itemId.value = '';
    itemCategory.value = '';
    itemImageFile.value = '';
    itemImage.value = '';
    updateMenuFileText();
    setItemAvailableState(true);
    itemFeatured.checked = false;
    itemTodayOffer.checked = false;
    itemForYou.checked = false;
    updateDisplayOptionSummary();
    updateMenuCounters();
    renderItemOptionChoices();
    itemSortOrder.value = '0';
    formTitle.textContent = 'Thêm món mới';
    formMode.textContent = 'Tạo món để hiển thị trên trang order';
    setMessage('');
  }

  function fillForm(item) {
    itemId.value = item.id;
    itemName.value = item.name;
    itemCategory.value = item.category || '';
    itemDescription.value = item.description || '';
    itemPrice.value = item.price;
    itemImage.value = item.image || '';
    itemImageFile.value = '';
    updateMenuFileText();
    setItemAvailableState(Boolean(item.available));
    itemFeatured.checked = item.featured;
    itemTodayOffer.checked = item.show_today_offer;
    itemForYou.checked = item.show_for_you;
    updateDisplayOptionSummary();
    updateMenuCounters();
    renderItemOptionChoices(item.option_groups || []);
    itemSortOrder.value = item.sort_order || 0;
    formTitle.textContent = 'Sửa món';
    formMode.textContent = `#${item.id}`;
    setMessage('');
    openAdminModal(menuItemModal);
    itemName.focus();
  }

  function payloadFromForm() {
    return {
      name: itemName.value.trim(),
      category: itemCategory.value,
      description: itemDescription.value.trim(),
      price: Number(itemPrice.value),
      image: itemImage.value.trim(),
      available: itemAvailable.value === '1',
      featured: itemFeatured.checked,
      show_today_offer: itemTodayOffer.checked,
      show_for_you: itemForYou.checked,
      sort_order: Number(itemSortOrder.value || 0),
      option_groups: selectedItemOptionGroups()
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
    updateMenuFileText();
    return uploaded.url;
  }

  function renderMenu() {
    adminMenuBody.replaceChildren();
    adminCount.textContent = `${menu.length} món`;
    renderCategoryList();

    if (menu.length === 0) {
      const row = document.createElement('tr');
      const cell = document.createElement('td');
      cell.colSpan = 9;
      cell.textContent = 'Menu đang trống.';
      row.append(cell);
      adminMenuBody.append(row);
      return;
    }

    for (const item of menu) {
      const row = document.createElement('tr');

      const name = document.createElement('td');
      const title = document.createElement('strong');
      title.textContent = item.name;
      const description = document.createElement('small');
      description.className = 'muted-line';
      description.textContent = item.description || 'Chưa có mô tả';
      name.append(title, description);

      const category = document.createElement('td');
      category.textContent = categoryLabel(item.category);

      const price = document.createElement('td');
      price.textContent = api.formatCurrency(item.price);

      const special = document.createElement('td');
      const specialLabels = [];
      if (item.show_today_offer) {
        specialLabels.push('Ưu đãi');
      }
      if (item.show_for_you) {
        specialLabels.push('Dành cho bạn');
      }
      special.textContent = specialLabels.length ? specialLabels.join(', ') : '-';

      const featured = document.createElement('td');
      featured.textContent = item.featured ? 'Có' : '-';

      const options = document.createElement('td');
      const assignedOptions = item.option_groups || [];
      options.textContent = assignedOptions.length
        ? assignedOptions.map((group) => group.name).join(', ')
        : 'Không có';

      const status = document.createElement('td');
      const pill = document.createElement('span');
      pill.className = `status-pill${item.available ? '' : ' off'}`;
      pill.textContent = item.available ? 'Đang bán' : 'Tạm ẩn';
      status.append(pill);

      const sort = document.createElement('td');
      sort.textContent = item.sort_order || 0;

      const actions = document.createElement('td');
      const actionRow = document.createElement('div');
      actionRow.className = 'row-actions';

      const edit = document.createElement('button');
      edit.className = 'icon-action-button';
      edit.type = 'button';
      edit.title = 'Sửa món';
      edit.setAttribute('aria-label', `Sửa ${item.name}`);
      edit.append(iconSvg([
        'M12 20h9',
        'M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4 11.5-11.5z'
      ]));
      edit.addEventListener('click', () => fillForm(item));

      const remove = document.createElement('button');
      remove.className = 'icon-action-button danger-icon-button';
      remove.type = 'button';
      remove.title = 'Xoá món';
      remove.setAttribute('aria-label', `Xoá ${item.name}`);
      remove.append(iconSvg([
        'M3 6h18',
        'M8 6V4h8v2',
        'M6 6l1 15h10l1-15',
        'M10 11v6',
        'M14 11v6'
      ]));
      remove.addEventListener('click', () => deleteItem(item));

      actionRow.append(edit, remove);
      actions.append(actionRow);
      row.append(name, category, price, special, featured, options, status, sort, actions);
      adminMenuBody.append(row);
    }
  }

  async function loadMenu() {
    adminMenuBody.innerHTML = '<tr><td colspan="9">Đang tải menu...</td></tr>';
    try {
      menu = await api.getMenu(true);
      renderMenu();
    } catch (error) {
      adminMenuBody.innerHTML = '';
      const row = document.createElement('tr');
      const cell = document.createElement('td');
      cell.colSpan = 9;
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
      closeAdminModals();
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
    if (restaurant.logo_image) {
      const logo = document.createElement('img');
      logo.className = 'print-receipt-logo';
      logo.src = restaurant.logo_image;
      logo.alt = restaurant.name || 'Logo quán';
      card.append(logo);
    }

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

    if (restaurant.bank_qr_image || restaurant.bank_account_number) {
      const payment = document.createElement('div');
      payment.className = 'print-receipt-payment';
      const paymentTitle = document.createElement('h3');
      paymentTitle.textContent = 'Thanh toán';
      payment.append(paymentTitle);

      if (restaurant.bank_qr_image) {
        const qr = document.createElement('img');
        qr.src = restaurant.bank_qr_image;
        qr.alt = 'QR ngân hàng';
        payment.append(qr);
      }

      for (const text of [
        restaurant.bank_name || '',
        restaurant.bank_account_name ? `Chủ TK: ${restaurant.bank_account_name}` : '',
        restaurant.bank_account_number ? `STK: ${restaurant.bank_account_number}` : '',
        restaurant.bank_transfer_note ? `Nội dung: ${restaurant.bank_transfer_note}` : ''
      ]) {
        if (!text) {
          continue;
        }
        const line = document.createElement('p');
        line.textContent = text;
        payment.append(line);
      }

      card.append(payment);
    }

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
    const notify = isTableDetailOpen() ? setBillMessage : setTableMessage;

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
      notify(`Đã tải QR ${label} ${table.name}.`);
    } catch (error) {
      notify(error.message, true);
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
      remove.className = 'icon-action-button danger-icon-button';
      remove.type = 'button';
      remove.title = 'Xoá bàn';
      remove.setAttribute('aria-label', `Xoá ${table.name}`);
      remove.append(iconSvg([
        'M3 6h18',
        'M8 6V4h8v2',
        'M6 6l1 15h10l1-15',
        'M10 11v6',
        'M14 11v6'
      ]));
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

  function createStatusPill(status) {
    const pill = document.createElement('span');
    pill.className = `status-pill table-status-${status || 'unknown'}`;
    pill.textContent = tableStatusLabels[status] || status || 'Không rõ';
    return pill;
  }

  function orderUrlForTable(table) {
    if (table?.url) {
      return table.url;
    }

    if (table?.token) {
      return `/t/${encodeURIComponent(table.token)}`;
    }

    return '';
  }

  function updateQuickOrderLink(table) {
    const url = orderUrlForTable(table);

    if (!url) {
      quickOrderLink.hidden = true;
      quickOrderLink.removeAttribute('href');
      downloadTableOrderQr.hidden = true;
      return;
    }

    quickOrderLink.href = url;
    quickOrderLink.hidden = false;
    quickOrderLink.title = `Gọi món cho ${table.name}`;
    quickOrderLink.setAttribute('aria-label', `Gọi món cho ${table.name}`);
    downloadTableOrderQr.hidden = false;
    downloadTableOrderQr.title = `Tải mã QR gọi món cho ${table.name}`;
    downloadTableOrderQr.setAttribute('aria-label', `Tải mã QR gọi món cho ${table.name}`);
  }

  function renderBillPrintInfo(info, bill) {
    const source = info || restaurantInfo;
    billPrintInfo.replaceChildren();
    billPaymentInfo.replaceChildren();

    if (source.logo_image) {
      const logo = document.createElement('img');
      logo.className = 'bill-print-logo';
      logo.src = source.logo_image;
      logo.alt = source.name || 'Logo quán';
      billPrintInfo.append(logo);
    }

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

    if (source.bank_qr_image || source.bank_account_number) {
      const payment = document.createElement('div');
      payment.className = 'bill-payment-preview';

      if (source.bank_qr_image) {
        const qr = document.createElement('img');
        qr.src = source.bank_qr_image;
        qr.alt = 'QR ngân hàng';
        payment.append(qr);
      }

      const content = document.createElement('div');
      const title = document.createElement('strong');
      title.textContent = source.bank_name || 'Thông tin thanh toán';
      content.append(title);

      for (const text of [
        source.bank_account_name ? `Chủ TK: ${source.bank_account_name}` : '',
        source.bank_account_number ? `STK: ${source.bank_account_number}` : '',
        source.bank_transfer_note ? `ND: ${source.bank_transfer_note}` : ''
      ]) {
        if (!text) {
          continue;
        }
        const line = document.createElement('span');
        line.textContent = text;
        content.append(line);
      }

      payment.append(content);
      billPaymentInfo.append(payment);
    }
  }

  function resetBillPanel() {
    billTitle.textContent = 'Chọn bàn';
    billMeta.textContent = 'Xem các món đã gọi trong bill hiện tại';
    updateQuickOrderLink(null);
    closeSessionButton.disabled = true;
    closeSessionButton.textContent = 'Thanh toán';
    renderBillPrintInfo(restaurantInfo);
    billOrders.innerHTML = '<p class="empty-state">Chọn một bàn để xem bill.</p>';
    billSummary.innerHTML = '<p class="empty-state">Chưa có món.</p>';
    billGrandTotal.textContent = api.formatCurrency(0);
    setBillMessage('');
  }

  function setFloorMessage(element, text, isError = false) {
    element.textContent = text || '';
    element.style.color = isError ? '#a9371d' : '';
  }

  function currentArea() {
    return areas.find((area) => area.id === Number(selectedAreaId)) || null;
  }

  function renderFloorAreaOptions() {
    const selectedValue = floorTableArea.value;
    floorTableArea.replaceChildren();

    for (const area of areas) {
      const option = document.createElement('option');
      option.value = area.id;
      option.textContent = area.name;
      option.disabled = !area.is_active;
      floorTableArea.append(option);
    }

    if (areas.some((area) => String(area.id) === selectedValue)) {
      floorTableArea.value = selectedValue;
    } else if (selectedAreaId) {
      floorTableArea.value = String(selectedAreaId);
    }
  }

  function selectArea(areaId) {
    selectedAreaId = Number(areaId);
    floorTableSearch.value = '';
    renderFloorAreas();
    renderFloorPlan();
  }

  function renderFloorAreas() {
    floorAreaList.replaceChildren();
    const area = currentArea();
    selectedAreaName.textContent = area?.name || 'Chưa có khu vực';
    document.getElementById('editSelectedAreaButton').disabled = !area;
    document.getElementById('editAreaButton').disabled = !area;

    if (areas.length === 0) {
      floorAreaList.innerHTML = '<p class="empty-state compact-empty">Chưa có khu vực.</p>';
      renderFloorAreaOptions();
      return;
    }

    for (const item of areas) {
      const button = document.createElement('button');
      button.className = 'floor-area-item';
      button.type = 'button';
      button.classList.toggle('is-active', item.id === Number(selectedAreaId));
      button.classList.toggle('is-inactive', !item.is_active);

      const icon = document.createElement('span');
      icon.className = 'floor-area-icon';
      icon.textContent = '⌂';
      const name = document.createElement('span');
      name.textContent = item.name;
      const count = document.createElement('b');
      count.textContent = item.table_count;
      button.append(icon, name, count);
      button.addEventListener('click', () => selectArea(item.id));
      floorAreaList.append(button);
    }

    renderFloorAreaOptions();
  }

  function filteredFloorTables() {
    const query = floorTableSearch.value.trim().toLocaleLowerCase('vi');

    return tables.filter((table) => {
      if (Number(table.area_id) !== Number(selectedAreaId)) {
        return false;
      }
      if (floorStatusFilter !== 'all' && table.status !== floorStatusFilter) {
        return false;
      }
      return !query || table.name.toLocaleLowerCase('vi').includes(query);
    });
  }

  function updateFloorPlanSize() {
    const viewportWidth = Math.max(floorPlanViewport.clientWidth - 2, 320);
    const baseWidth = Math.max(viewportWidth, 900);
    const stageHeight = window.matchMedia('(max-width: 560px)').matches ? 420 : 560;
    floorPlanStage.style.width = `${Math.round(baseWidth)}px`;
    floorPlanStage.style.height = `${stageHeight}px`;
  }

  async function savePendingFloorPositions() {
    const ids = Array.from(pendingFloorPositions);
    pendingFloorPositions.clear();

    if (ids.length === 0) {
      return;
    }

    setFloorMessage(floorSaveStatus, 'Đang lưu vị trí...');

    try {
      await api.updateTablePositions(ids.map((id) => {
        const table = tables.find((item) => item.id === id);
        return { id, pos_x: table.pos_x, pos_y: table.pos_y };
      }));
      setFloorMessage(floorSaveStatus, 'Đã lưu vị trí.');
      window.setTimeout(() => {
        if (floorSaveStatus.textContent === 'Đã lưu vị trí.') {
          setFloorMessage(floorSaveStatus, '');
        }
      }, 1200);
    } catch (error) {
      setFloorMessage(floorSaveStatus, error.message, true);
      await loadLiveTables();
    }
  }

  function scheduleFloorPositionSave(tableIdValue) {
    pendingFloorPositions.add(tableIdValue);
    window.clearTimeout(floorPositionSaveTimer);
    setFloorMessage(floorSaveStatus, 'Chưa lưu...');
    floorPositionSaveTimer = window.setTimeout(savePendingFloorPositions, 500);
  }

  function bindFloorTableDrag(card, table) {
    card.addEventListener('pointerdown', (event) => {
      if (!floorArrangeMode.checked || event.button !== 0 || event.target.closest('button')) {
        return;
      }

      const stageRect = floorPlanStage.getBoundingClientRect();
      const cardRect = card.getBoundingClientRect();
      const offsetX = event.clientX - cardRect.left;
      const offsetY = event.clientY - cardRect.top;
      let moved = false;

      card.setPointerCapture(event.pointerId);
      card.classList.add('is-dragging');
      event.preventDefault();

      const move = (moveEvent) => {
        const nextX = Math.max(0, Math.min(100 - table.width,
          ((moveEvent.clientX - stageRect.left - offsetX) / stageRect.width) * 100));
        const nextY = Math.max(0, Math.min(100 - table.height,
          ((moveEvent.clientY - stageRect.top - offsetY) / stageRect.height) * 100));
        table.pos_x = Number(nextX.toFixed(2));
        table.pos_y = Number(nextY.toFixed(2));
        card.style.left = `${table.pos_x}%`;
        card.style.top = `${table.pos_y}%`;
        moved = true;
      };

      const finish = () => {
        card.removeEventListener('pointermove', move);
        card.removeEventListener('pointerup', finish);
        card.removeEventListener('pointercancel', finish);
        card.classList.remove('is-dragging');

        if (moved) {
          card.dataset.justDragged = '1';
          scheduleFloorPositionSave(table.id);
          window.setTimeout(() => delete card.dataset.justDragged, 0);
        }
      };

      card.addEventListener('pointermove', move);
      card.addEventListener('pointerup', finish);
      card.addEventListener('pointercancel', finish);
    });
  }

  function createFloorTableCard(table) {
    const card = document.createElement('article');
    card.className = `floor-table shape-${table.shape} status-${table.status}`;
    card.style.left = `${table.pos_x}%`;
    card.style.top = `${table.pos_y}%`;
    card.style.width = `${table.width}%`;
    card.style.height = `${table.height}%`;
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `${table.name}, ${tableStatusLabels[table.status] || table.status}`);

    const dragHandle = document.createElement('span');
    dragHandle.className = 'floor-table-drag-handle';
    dragHandle.textContent = '⠿';
    dragHandle.title = 'Kéo để sắp xếp';

    const edit = document.createElement('button');
    edit.className = 'floor-table-edit';
    edit.type = 'button';
    edit.title = `Sửa ${table.name}`;
    edit.setAttribute('aria-label', `Sửa ${table.name}`);
    edit.append(iconSvg([
      'M4 20h4l11-11-4-4L4 16v4',
      'M13 7l4 4'
    ]));
    edit.addEventListener('click', (event) => {
      event.stopPropagation();
      openFloorTableModal(table);
    });

    const name = document.createElement('strong');
    name.textContent = table.name;
    const status = document.createElement('span');
    status.className = 'floor-table-status';
    status.innerHTML = `<i></i>${tableStatusLabels[table.status] || table.status}`;
    const capacity = document.createElement('small');
    capacity.textContent = `${table.capacity} chỗ`;
    card.append(dragHandle, edit, name, status, capacity);

    const openDetail = () => {
      if (!floorArrangeMode.checked && !card.dataset.justDragged) {
        selectLiveTable(table.id);
      }
    };
    card.addEventListener('click', openDetail);
    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openDetail();
      }
    });
    bindFloorTableDrag(card, table);
    return card;
  }

  function renderFloorPlan() {
    updateFloorPlanSize();
    floorPlanStage.replaceChildren();
    floorPlanStage.append(floorPlanEmpty);
    floorPlanStage.classList.toggle('is-arranging', floorArrangeMode.checked);
    const visibleTables = filteredFloorTables();
    floorPlanEmpty.hidden = visibleTables.length > 0;

    for (const table of visibleTables) {
      floorPlanStage.append(createFloorTableCard(table));
    }
  }

  function renderLiveTables() {
    if (!selectedAreaId || !areas.some((area) => area.id === Number(selectedAreaId))) {
      selectedAreaId = areas.find((area) => area.is_active)?.id || areas[0]?.id || null;
    }
    renderFloorAreas();
    renderFloorPlan();

    if (tables.length === 0) {
      resetBillPanel();
    }
  }

  function openFloorModal(modal) {
    floorModalBackdrop.hidden = false;
    modal.hidden = false;
    document.body.classList.add('modal-open');
  }

  function closeFloorModals() {
    floorModalBackdrop.hidden = true;
    areaModal.hidden = true;
    floorTableModal.hidden = true;
    document.body.classList.remove('modal-open');
    setFloorMessage(floorAreaMessage, '');
    setFloorMessage(floorTableMessage, '');
  }

  function openAreaModal(area = null) {
    floorAreaId.value = area?.id || '';
    floorAreaName.value = area?.name || '';
    floorAreaDescription.value = area?.description || '';
    floorAreaSortOrder.value = area?.sort_order ?? areas.length + 1;
    floorAreaActive.checked = area ? area.is_active : true;
    areaModalTitle.textContent = area ? 'Sửa khu vực' : 'Tạo khu vực';
    areaModalMode.textContent = area ? `#${area.id}` : 'Thêm khu vực phục vụ mới';
    deleteAreaButton.hidden = !area;
    openFloorModal(areaModal);
    floorAreaName.focus();
  }

  async function saveFloorArea(event) {
    event.preventDefault();
    setFloorMessage(floorAreaMessage, 'Đang lưu...');
    const payload = {
      name: floorAreaName.value.trim(),
      description: floorAreaDescription.value.trim(),
      sort_order: Number(floorAreaSortOrder.value || 0),
      is_active: floorAreaActive.checked
    };

    try {
      const saved = floorAreaId.value
        ? await api.updateArea(floorAreaId.value, payload)
        : await api.createArea(payload);
      selectedAreaId = saved.id;
      closeFloorModals();
      await loadLiveTables();
    } catch (error) {
      setFloorMessage(floorAreaMessage, error.message, true);
    }
  }

  async function removeFloorArea() {
    const area = areas.find((item) => item.id === Number(floorAreaId.value));
    if (!area || !window.confirm(`Xoá khu vực "${area.name}"?`)) {
      return;
    }

    try {
      await api.deleteArea(area.id);
      selectedAreaId = null;
      closeFloorModals();
      await loadLiveTables();
    } catch (error) {
      setFloorMessage(floorAreaMessage, error.message, true);
    }
  }

  const floorShapeSizes = {
    rectangle: { width: 18, height: 15 },
    circle: { width: 12, height: 20 },
    oval: { width: 21, height: 17 },
    diamond: { width: 14, height: 20 },
    hexagon: { width: 16, height: 18 }
  };

  function openFloorTableModal(table = null) {
    renderFloorAreaOptions();
    floorTableId.value = table?.id || '';
    floorTableName.value = table?.name || '';
    floorTableArea.value = String(table?.area_id || selectedAreaId || areas[0]?.id || '');
    floorTableShape.value = table?.shape || 'rectangle';
    floorTableCapacity.value = table?.capacity || 4;
    floorTableStatus.value = table?.status || 'available';
    floorTableModalTitle.textContent = table ? 'Sửa thông tin bàn' : 'Tạo bàn mới';
    floorTableModalMode.textContent = table ? `Token: ${table.token}` : 'Thêm bàn vào sơ đồ';
    deleteFloorTableButton.hidden = !table;
    openFloorModal(floorTableModal);
    floorTableName.focus();
  }

  function floorTablePayload() {
    const current = tables.find((table) => table.id === Number(floorTableId.value));
    const areaTables = tables.filter((table) => table.area_id === Number(floorTableArea.value));
    const index = areaTables.length;
    const shape = floorTableShape.value;
    const shapeChanged = current && current.shape !== shape;
    const size = shapeChanged || !current ? floorShapeSizes[shape] : current;

    return {
      name: floorTableName.value.trim(),
      area_id: Number(floorTableArea.value),
      shape,
      capacity: Number(floorTableCapacity.value || 1),
      status: floorTableStatus.value,
      pos_x: current?.pos_x ?? 4 + (index % 4) * 24,
      pos_y: current?.pos_y ?? 6 + Math.floor(index / 4) * 21,
      width: size.width,
      height: size.height,
      sort_order: current?.sort_order ?? index + 1
    };
  }

  async function saveFloorTable(event) {
    event.preventDefault();
    setFloorMessage(floorTableMessage, 'Đang lưu...');

    try {
      const saved = floorTableId.value
        ? await api.updateTable(floorTableId.value, floorTablePayload())
        : await api.createTable(floorTablePayload());
      selectedAreaId = saved.area_id;
      closeFloorModals();
      await loadLiveTables();
    } catch (error) {
      setFloorMessage(floorTableMessage, error.message, true);
    }
  }

  async function removeFloorTable() {
    const table = tables.find((item) => item.id === Number(floorTableId.value));
    if (!table || !window.confirm(`Xoá "${table.name}"?`)) {
      return;
    }

    try {
      await api.deleteTable(table.id);
      closeFloorModals();
      await loadLiveTables();
    } catch (error) {
      setFloorMessage(floorTableMessage, error.message, true);
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
      const canRemoveOrder = canCancelOrder && order.status === 'pending';

      if (canRemoveOrder) {
        card.classList.add('has-delete');
      }

      const content = document.createElement('div');
      content.className = 'bill-order-content';

      const header = document.createElement('div');
      header.className = 'bill-order-head';

      const title = document.createElement('strong');
      title.textContent = `Đơn #${order.id}`;

      const meta = document.createElement('span');
      meta.textContent = `${orderStatusLabels[order.status] || order.status} - ${formatTime(order.created_at)}`;

      const orderActions = document.createElement('div');
      orderActions.className = 'bill-order-actions';
      orderActions.append(meta);

      header.append(title, orderActions);

      const list = document.createElement('ul');
      list.className = 'bill-item-list';

      for (const item of order.items) {
        const row = document.createElement('li');
        const quantity = document.createElement('b');
        quantity.textContent = item.quantity;
        const name = document.createElement('span');
        const itemName = document.createElement('strong');
        itemName.textContent = item.name;
        name.append(itemName);

        if (item.base_price !== undefined) {
          const base = document.createElement('small');
          base.className = 'bill-option-line';
          base.textContent = `Giá gốc: ${api.formatCurrency(item.base_price)} - Đơn giá: ${api.formatCurrency(item.unit_price || item.price || 0)}`;
          name.append(base);
        }

        for (const option of item.options || []) {
          const optionLine = document.createElement('small');
          optionLine.className = 'bill-option-line';
          optionLine.textContent = `${option.group_name}: ${option.value_name}${option.price_adjustment ? ` (+${api.formatCurrency(option.price_adjustment)})` : ''}`;
          name.append(optionLine);
        }

        if (item.customer_note) {
          const note = document.createElement('small');
          note.className = 'bill-option-line';
          note.textContent = `Ghi chú: ${item.customer_note}`;
          name.append(note);
        }
        const total = document.createElement('small');
        total.textContent = api.formatCurrency(item.subtotal);
        row.append(quantity, name, total);
        list.append(row);
      }

      content.append(header, list);
      card.append(content);

      if (canRemoveOrder) {
        const remove = document.createElement('button');
        remove.className = 'bill-remove-order-button';
        remove.type = 'button';
        remove.title = 'Xóa đơn';
        remove.setAttribute('aria-label', `Xóa đơn #${order.id}`);
        remove.append(createTrashIcon());
        remove.addEventListener('click', () => cancelBillOrder(order));
        card.append(remove);
      }

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
    updateQuickOrderLink(table);
    closeSessionButton.disabled = true;
    closeSessionButton.textContent = 'Thanh toán';
    setBillMessage('');

    try {
      const bill = await api.getAdminCurrentBill(table.id);
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
    showTableDetailScreen();
  }

  async function loadLiveTables() {
    floorPlanStage.innerHTML = '<p class="empty-state floor-plan-empty">Đang tải sơ đồ bàn...</p>';

    try {
      [areas, tables] = await Promise.all([
        api.getAreas(),
        api.getTables()
      ]);

      if (selectedLiveTableId && !tables.some((table) => table.id === selectedLiveTableId)) {
        selectedLiveTableId = null;
        resetBillPanel();
      }

      renderLiveTables();
    } catch (error) {
      floorPlanStage.replaceChildren();
      const empty = document.createElement('p');
      empty.className = 'empty-state floor-plan-empty';
      empty.textContent = error.message;
      floorPlanStage.append(empty);
      resetBillPanel();
    }
  }

  function activeAdminTabId() {
    return document.querySelector('.tab-button.is-active')?.dataset.tab || '';
  }

  function isTableDetailOpen() {
    return !tableDetailScreen.hidden;
  }

  function shouldRefreshSelectedBill(payload) {
    if (!selectedLiveTableId) {
      return false;
    }

    const eventTableId = Number(payload?.table_id || 0);
    return !eventTableId || eventTableId === Number(selectedLiveTableId);
  }

  function scheduleRealtimeRefresh(payload) {
    window.clearTimeout(realtimeRefreshTimer);
    realtimeRefreshTimer = window.setTimeout(async () => {
      realtimeRefreshTimer = null;

      try {
        const activeTab = activeAdminTabId();

        if (activeTab === 'tablesTab') {
          await loadTables();
          return;
        }

        if (activeTab !== 'liveTablesTab' && !isTableDetailOpen()) {
          return;
        }

        await loadLiveTables();

        if (isTableDetailOpen() && shouldRefreshSelectedBill(payload)) {
          await loadSelectedBill();
        }
      } catch (error) {
        setBillMessage(error.message || 'Không cập nhật realtime được.', true);
      }
    }, 180);
  }

  function setupRealtime() {
    if (!window.io) {
      return;
    }

    const socket = window.io();

    socket.on('connect', () => {
      scheduleRealtimeRefresh();
    });
    socket.on('order:new', scheduleRealtimeRefresh);
    socket.on('order:updated', scheduleRealtimeRefresh);
    socket.on('order:status_changed', scheduleRealtimeRefresh);
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
      const closedBill = await api.closeAdminTableSession(table.id);
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
      await api.updateAdminOrder(order.id, 'cancelled');
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

  function adminTabUrl(tabId) {
    return tabId === 'liveTablesTab' ? '/admin' : `/admin?tab=${encodeURIComponent(tabId)}`;
  }

  function switchTab(tabId, options = {}) {
    const { updateUrl = true } = options;
    tableDetailScreen.hidden = true;
    adminTabs.hidden = false;

    let activeTab = null;
    document.querySelectorAll('.tab-button').forEach((button) => {
      const isActive = button.dataset.tab === tabId;
      button.classList.toggle('is-active', isActive);
      if (isActive) {
        activeTab = button;
      }
    });
    document.querySelectorAll('.admin-tab-panel').forEach((panel) => {
      panel.classList.toggle('is-active', panel.id === tabId);
    });

    activeTab?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center'
    });

    if (tabId === 'tablesTab') {
      loadTables();
    } else if (tabId === 'liveTablesTab') {
      loadLiveTables();
    } else if (tabId === 'menuTab') {
      loadCategories();
      loadOptionGroups();
      loadMenu();
    } else if (tabId === 'restaurantTab') {
      loadRestaurantInfo();
    }

    if (updateUrl) {
      window.history.replaceState(null, '', adminTabUrl(tabId));
    }
  }

  form.addEventListener('submit', saveItem);
  itemName.addEventListener('input', updateMenuCounters);
  itemDescription.addEventListener('input', updateMenuCounters);
  itemImageFile.addEventListener('change', updateMenuFileText);
  itemAvailableToggle.addEventListener('click', () => {
    setItemAvailableState(itemAvailable.value !== '1');
  });
  newMenuItemButton.addEventListener('click', openMenuItemModal);
  itemDisplayToggle.addEventListener('click', (event) => {
    event.stopPropagation();
    toggleDisplayOptionMenu();
  });
  itemDisplayMenu.addEventListener('click', (event) => {
    event.stopPropagation();
  });
  [itemTodayOffer, itemForYou, itemFeatured].forEach((input) => {
    input.addEventListener('change', updateDisplayOptionSummary);
  });
  categoryForm.addEventListener('submit', saveCategory);
  document.getElementById('resetCategoryForm').addEventListener('click', resetCategoryForm);
  newCategoryButton.addEventListener('click', openCategoryModal);
  optionGroupForm.addEventListener('submit', saveOptionGroup);
  newOptionGroupButton.addEventListener('click', openOptionGroupModal);
  closeOptionGroupModal.addEventListener('click', closeAdminModals);
  document.getElementById('addOptionValue').addEventListener('click', () => addOptionValueRow());
  optionGroupSelectionType.addEventListener('change', () => {
    if (optionGroupSelectionType.value === 'single') {
      optionGroupMax.value = '1';
      if (Number(optionGroupMin.value || 0) > 1) {
        optionGroupMin.value = '1';
      }
    }
  });
  closeMenuItemModal.addEventListener('click', closeAdminModals);
  closeCategoryModal.addEventListener('click', closeAdminModals);
  adminModalBackdrop.addEventListener('click', closeAdminModals);
  document.addEventListener('click', (event) => {
    if (!itemDisplaySelect.contains(event.target)) {
      closeDisplayOptionMenu();
    }
  });
  restaurantForm.addEventListener('submit', saveRestaurantInfo);
  [
    restaurantName,
    restaurantAddress,
    restaurantPhone,
    restaurantCashier,
    restaurantBankName,
    restaurantBankAccountName,
    restaurantBankAccountNumber,
    restaurantBankTransferNote
  ].forEach((input) => {
    input.addEventListener('input', syncRestaurantDraftPreview);
  });
  restaurantLogoFile.addEventListener('change', async () => {
    await previewImageFile(
      restaurantLogoFile,
      restaurantPreviewLogo,
      initials(restaurantName.value || restaurantInfo.name)
    );
  });
  restaurantBankQrFile.addEventListener('change', async () => {
    const dataUrl = await previewImageFile(restaurantBankQrFile, restaurantBankQrPreview, 'QR');
    if (dataUrl) {
      renderImageSlot(restaurantPreviewBankQr, dataUrl, 'QR');
    }
  });

  tableForm.addEventListener('submit', saveTable);
  bulkTableForm.addEventListener('submit', createBulkTables);
  document.getElementById('resetTableForm').addEventListener('click', resetTableForm);
  document.getElementById('printAllQr').addEventListener('click', printAllQr);
  backToTablesButton.addEventListener('click', showTableManagerScreen);
  downloadTableOrderQr.addEventListener('click', () => {
    const table = tables.find((item) => item.id === selectedLiveTableId);
    if (table) {
      downloadQr(table, 'order');
    }
  });
  document.getElementById('quickAddAreaButton').addEventListener('click', () => openAreaModal());
  document.getElementById('editAreaButton').addEventListener('click', () => {
    const area = currentArea();
    if (area) {
      openAreaModal(area);
    }
  });
  document.getElementById('editSelectedAreaButton').addEventListener('click', () => {
    const area = currentArea();
    if (area) {
      openAreaModal(area);
    }
  });
  document.getElementById('newFloorTableButton').addEventListener('click', () => {
    if (areas.length === 0) {
      openAreaModal();
      return;
    }
    openFloorTableModal();
  });
  document.getElementById('closeAreaModal').addEventListener('click', closeFloorModals);
  document.getElementById('closeFloorTableModal').addEventListener('click', closeFloorModals);
  floorModalBackdrop.addEventListener('click', closeFloorModals);
  floorAreaForm.addEventListener('submit', saveFloorArea);
  deleteAreaButton.addEventListener('click', removeFloorArea);
  floorTableForm.addEventListener('submit', saveFloorTable);
  deleteFloorTableButton.addEventListener('click', removeFloorTable);
  floorTableSearch.addEventListener('input', renderFloorPlan);
  floorStatusFilters.addEventListener('click', (event) => {
    const button = event.target.closest('[data-status]');
    if (!button) {
      return;
    }
    floorStatusFilter = button.dataset.status;
    floorStatusFilters.querySelectorAll('[data-status]').forEach((item) => {
      item.classList.toggle('is-active', item === button);
    });
    renderFloorPlan();
  });
  floorArrangeMode.addEventListener('change', () => {
    renderFloorPlan();
    setFloorMessage(
      floorSaveStatus,
      floorArrangeMode.checked ? 'Kéo bàn để thay đổi vị trí.' : ''
    );
  });
  floorGridToggle.addEventListener('click', () => {
    const showGrid = floorGridToggle.getAttribute('aria-pressed') !== 'true';
    floorGridToggle.setAttribute('aria-pressed', String(showGrid));
    floorGridToggle.classList.toggle('is-active', showGrid);
    floorPlanStage.classList.toggle('without-grid', !showGrid);
  });
  closeSessionButton.addEventListener('click', handleBillAction);
  window.addEventListener('afterprint', closePrintView);
  window.addEventListener('resize', updateFloorPlanSize);
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !floorModalBackdrop.hidden) {
      closeFloorModals();
      return;
    }

    if (event.key === 'Escape' && !itemDisplayMenu.hidden) {
      closeDisplayOptionMenu();
      return;
    }

    if (event.key === 'Escape' && !adminModalBackdrop.hidden) {
      closeAdminModals();
    }
  });

  document.querySelectorAll('.tab-button[data-tab]').forEach((button) => {
    button.addEventListener('click', () => switchTab(button.dataset.tab));
  });

  const validInitialTabs = ['liveTablesTab', 'menuTab', 'restaurantTab'];
  const tabFromQuery = new URLSearchParams(window.location.search).get('tab');
  const tabFromHash = window.location.hash.slice(1);
  const requestedInitialTab = tabFromQuery || tabFromHash;
  const initialTab = validInitialTabs.includes(requestedInitialTab)
    ? requestedInitialTab
    : 'liveTablesTab';
  const shouldResetAdminScroll = Boolean(tabFromQuery || tabFromHash);

  loadRestaurantInfo();
  loadLiveTables();
  loadCategories();
  loadOptionGroups();
  loadMenu();
  if (initialTab !== 'liveTablesTab') {
    switchTab(initialTab, { updateUrl: false });
  }
  if (shouldResetAdminScroll) {
    requestAnimationFrame(() => {
      window.scrollTo(0, 0);
      window.history.replaceState(null, '', adminTabUrl(initialTab));
    });
  }
  setupRealtime();
})();
