const { db } = require('../database');
const { httpError } = require('../utils/httpError');

const defaultInfo = {
  id: 1,
  name: 'Pho Viet',
  address: '',
  phone: '',
  cashier_name: ''
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
    SELECT id, name, address, phone, cashier_name, updated_at
    FROM restaurant_info
    WHERE id = 1
  `).get();

  if (row) {
    return row;
  }

  db.prepare(`
    INSERT INTO restaurant_info (id, name, address, phone, cashier_name, updated_at)
    VALUES (1, ?, '', '', '', datetime('now'))
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
    cashier_name: normalizeText(input.cashier_name ?? current.cashier_name, 'Tên nhân viên thu ngân', 80)
  };

  db.prepare(`
    UPDATE restaurant_info
    SET name = ?,
        address = ?,
        phone = ?,
        cashier_name = ?,
        updated_at = datetime('now')
    WHERE id = 1
  `).run(next.name, next.address, next.phone, next.cashier_name);

  return getRestaurantInfo();
}

module.exports = {
  getRestaurantInfo,
  updateRestaurantInfo
};
