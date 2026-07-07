const { db } = require('../database');
const { httpError } = require('../utils/httpError');

function toAvailability(value, fallback = true) {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  if (value === 1 || value === '1' || value === 'true' || value === 'on') {
    return true;
  }

  if (value === 0 || value === '0' || value === 'false' || value === 'off') {
    return false;
  }

  throw httpError(400, 'Trạng thái món không hợp lệ.');
}

function normalizeMenuInput(input, { partial = false } = {}) {
  const data = {};

  if (!partial || input.name !== undefined) {
    const name = String(input.name || '').trim();
    if (!name) {
      throw httpError(400, 'Tên món không được để trống.');
    }
    data.name = name;
  }

  if (!partial || input.price !== undefined) {
    const price = Number(input.price);
    if (!Number.isInteger(price) || price < 0) {
      throw httpError(400, 'Giá món phải là số nguyên không âm.');
    }
    data.price = price;
  }

  if (!partial || input.image !== undefined) {
    data.image = String(input.image || '').trim();
  }

  if (!partial || input.available !== undefined) {
    data.available = toAvailability(input.available, true) ? 1 : 0;
  }

  return data;
}

function serializeMenuItem(item) {
  return {
    ...item,
    available: Boolean(item.available)
  };
}

function listMenuItems({ includeUnavailable = false } = {}) {
  const sql = `
    SELECT id, name, price, image, available
    FROM menu_items
    ${includeUnavailable ? '' : 'WHERE available = 1'}
    ORDER BY id ASC
  `;

  return db.prepare(sql).all().map(serializeMenuItem);
}

function getMenuItem(id) {
  const item = db.prepare(`
    SELECT id, name, price, image, available
    FROM menu_items
    WHERE id = ?
  `).get(id);

  if (!item) {
    throw httpError(404, 'Không tìm thấy món.');
  }

  return serializeMenuItem(item);
}

function createMenuItem(input) {
  const data = normalizeMenuInput(input);

  const result = db.prepare(`
    INSERT INTO menu_items (name, price, image, available)
    VALUES (@name, @price, @image, @available)
  `).run(data);

  return getMenuItem(result.lastInsertRowid);
}

function updateMenuItem(id, input) {
  getMenuItem(id);

  const data = normalizeMenuInput(input, { partial: true });
  const fields = Object.keys(data);

  if (fields.length === 0) {
    throw httpError(400, 'Không có dữ liệu để cập nhật.');
  }

  const assignments = fields.map((field) => `${field} = @${field}`).join(', ');

  db.prepare(`
    UPDATE menu_items
    SET ${assignments}
    WHERE id = @id
  `).run({ ...data, id });

  return getMenuItem(id);
}

function deleteMenuItem(id) {
  const result = db.prepare('DELETE FROM menu_items WHERE id = ?').run(id);

  if (result.changes === 0) {
    throw httpError(404, 'Không tìm thấy món.');
  }
}

module.exports = {
  createMenuItem,
  deleteMenuItem,
  listMenuItems,
  updateMenuItem
};
