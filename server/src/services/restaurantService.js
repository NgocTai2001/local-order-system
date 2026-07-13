const { db } = require('../database');
const { httpError } = require('../utils/httpError');

const defaultInfo = {
  id: 1,
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

function normalizeText(value, label, maxLength, { required = false } = {}) {
  const text = String(value ?? '').trim();

  if (required && !text) {
    throw httpError(400, `${label} không được để trống.`);
  }

  if (text.length > maxLength) {
    throw httpError(400, `${label} quá dài.`);
  }

  return text;
}

function ensureRestaurantInfo() {
  const row = db.prepare(`
    SELECT
      id,
      name,
      address,
      phone,
      cashier_name,
      logo_image,
      bank_name,
      bank_account_name,
      bank_account_number,
      bank_transfer_note,
      bank_qr_image,
      updated_at
    FROM restaurant_info
    WHERE id = 1
  `).get();

  if (row) {
    return row;
  }

  db.prepare(`
    INSERT INTO restaurant_info (
      id,
      name,
      address,
      phone,
      cashier_name,
      logo_image,
      bank_name,
      bank_account_name,
      bank_account_number,
      bank_transfer_note,
      bank_qr_image,
      updated_at
    )
    VALUES (1, ?, '', '', '', '', '', '', '', '', '', datetime('now'))
  `).run(defaultInfo.name);

  return {
    ...defaultInfo,
    updated_at: new Date().toISOString()
  };
}

function getRestaurantInfo() {
  return ensureRestaurantInfo();
}

function updateRestaurantInfo(input) {
  const current = ensureRestaurantInfo();
  const next = {
    name: normalizeText(input.name ?? current.name, 'Tên quán', 80, { required: true }),
    address: normalizeText(input.address ?? current.address, 'Địa chỉ quán', 200),
    phone: normalizeText(input.phone ?? current.phone, 'Số điện thoại quán', 30),
    cashier_name: normalizeText(input.cashier_name ?? current.cashier_name, 'Tên nhân viên thu ngân', 80),
    logo_image: normalizeText(input.logo_image ?? current.logo_image, 'Logo quán', 300),
    bank_name: normalizeText(input.bank_name ?? current.bank_name, 'Tên ngân hàng', 80),
    bank_account_name: normalizeText(input.bank_account_name ?? current.bank_account_name, 'Chủ tài khoản', 100),
    bank_account_number: normalizeText(input.bank_account_number ?? current.bank_account_number, 'Số tài khoản', 60),
    bank_transfer_note: normalizeText(input.bank_transfer_note ?? current.bank_transfer_note, 'Nội dung chuyển khoản', 160),
    bank_qr_image: normalizeText(input.bank_qr_image ?? current.bank_qr_image, 'Ảnh QR ngân hàng', 300)
  };

  db.prepare(`
    UPDATE restaurant_info
    SET name = ?,
        address = ?,
        phone = ?,
        cashier_name = ?,
        logo_image = ?,
        bank_name = ?,
        bank_account_name = ?,
        bank_account_number = ?,
        bank_transfer_note = ?,
        bank_qr_image = ?,
        updated_at = datetime('now')
    WHERE id = 1
  `).run(
    next.name,
    next.address,
    next.phone,
    next.cashier_name,
    next.logo_image,
    next.bank_name,
    next.bank_account_name,
    next.bank_account_number,
    next.bank_transfer_note,
    next.bank_qr_image
  );

  return getRestaurantInfo();
}

module.exports = {
  getRestaurantInfo,
  updateRestaurantInfo
};
