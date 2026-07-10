const { db } = require('../database');
const { httpError } = require('../utils/httpError');

const SYSTEM_SECTION_KEYS = new Set(['today-offer', 'for-you']);

function slugify(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'category';
}

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

  throw httpError(400, 'Trạng thái không hợp lệ.');
}

function toInteger(value, label, fallback = 0) {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }

  const number = Number(value);

  if (!Number.isInteger(number)) {
    throw httpError(400, `${label} phải là số nguyên.`);
  }

  return number;
}

function getCategoryByKey(key) {
  return db.prepare(`
    SELECT id, key, name, icon, color, visible, is_system, card_layout, sort_order
    FROM menu_categories
    WHERE key = ?
  `).get(key);
}

function normalizeCategoryKey(value) {
  const category = String(value || '').trim();

  if (!category) {
    throw httpError(400, 'Vui lòng chọn loại món.');
  }

  const categoryRow = getCategoryByKey(category);

  if (!categoryRow) {
    throw httpError(400, 'Loại món không tồn tại.');
  }

  if (categoryRow.is_system) {
    throw httpError(400, 'Mục cố định không dùng làm loại chính của món.');
  }

  return category;
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

  if (!partial || input.category !== undefined) {
    data.category = normalizeCategoryKey(input.category);
  }

  if (!partial || input.description !== undefined) {
    data.description = String(input.description || '').trim();
  }

  if (!partial || input.image !== undefined) {
    data.image = String(input.image || '').trim();
  }

  if (!partial || input.available !== undefined) {
    data.available = toAvailability(input.available, true) ? 1 : 0;
  }

  if (!partial || input.featured !== undefined) {
    data.featured = toAvailability(input.featured, false) ? 1 : 0;
  }

  if (!partial || input.show_today_offer !== undefined) {
    data.show_today_offer = toAvailability(input.show_today_offer, false) ? 1 : 0;
  }

  if (!partial || input.show_for_you !== undefined) {
    data.show_for_you = toAvailability(input.show_for_you, false) ? 1 : 0;
  }

  if (!partial || input.sort_order !== undefined) {
    data.sort_order = toInteger(input.sort_order, 'Thứ tự hiển thị', 0);
  }

  return data;
}

function serializeMenuItem(item) {
  return {
    id: item.id,
    name: item.name,
    category: item.category,
    category_name: item.category_name || item.category,
    category_icon: item.category_icon || '',
    category_color: item.category_color || '#24745c',
    description: item.description || '',
    price: item.price,
    image: item.image || '',
    available: Boolean(item.available),
    featured: Boolean(item.featured),
    show_today_offer: Boolean(item.show_today_offer),
    show_for_you: Boolean(item.show_for_you),
    sort_order: item.sort_order || 0
  };
}

function serializeCategory(category) {
  return {
    ...category,
    icon: category.icon || '',
    color: category.color || '#24745c',
    visible: Boolean(category.visible),
    is_system: Boolean(category.is_system),
    card_layout: category.card_layout === 'horizontal' ? 'horizontal' : 'vertical',
    sort_order: category.sort_order || 0
  };
}

function listMenuCategories({ includeHidden = false } = {}) {
  const rows = db.prepare(`
    SELECT id, key, name, icon, color, visible, is_system, card_layout, sort_order
    FROM menu_categories
    ${includeHidden ? '' : 'WHERE visible = 1'}
    ORDER BY is_system DESC, sort_order ASC, id ASC
  `).all();

  return rows.map(serializeCategory);
}

function listMenuItems({ includeUnavailable = false } = {}) {
  const sql = `
    SELECT
      mi.id,
      mi.name,
      mi.category,
      COALESCE(mc.name, mi.category) AS category_name,
      COALESCE(mc.icon, '') AS category_icon,
      COALESCE(mc.color, '#24745c') AS category_color,
      mi.description,
      mi.price,
      mi.image,
      mi.available,
      mi.featured,
      mi.show_today_offer,
      mi.show_for_you,
      mi.sort_order
    FROM menu_items mi
    LEFT JOIN menu_categories mc ON mc.key = mi.category
    ${includeUnavailable ? '' : 'WHERE mi.available = 1 AND COALESCE(mc.visible, 1) = 1'}
    ORDER BY
      COALESCE(mc.sort_order, 999),
      mi.sort_order ASC,
      mi.id ASC
  `;

  return db.prepare(sql).all().map(serializeMenuItem);
}

function getMenuItem(id) {
  const item = db.prepare(`
    SELECT
      mi.id,
      mi.name,
      mi.category,
      COALESCE(mc.name, mi.category) AS category_name,
      COALESCE(mc.icon, '') AS category_icon,
      COALESCE(mc.color, '#24745c') AS category_color,
      mi.description,
      mi.price,
      mi.image,
      mi.available,
      mi.featured,
      mi.show_today_offer,
      mi.show_for_you,
      mi.sort_order
    FROM menu_items mi
    LEFT JOIN menu_categories mc ON mc.key = mi.category
    WHERE mi.id = ?
  `).get(id);

  if (!item) {
    throw httpError(404, 'Không tìm thấy món.');
  }

  return serializeMenuItem(item);
}

function createMenuItem(input) {
  const data = normalizeMenuInput(input);

  const result = db.prepare(`
    INSERT INTO menu_items (
      name,
      category,
      description,
      price,
      image,
      available,
      featured,
      show_today_offer,
      show_for_you,
      sort_order,
      updated_at
    )
    VALUES (
      @name,
      @category,
      @description,
      @price,
      @image,
      @available,
      @featured,
      @show_today_offer,
      @show_for_you,
      @sort_order,
      datetime('now')
    )
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
    SET ${assignments},
        updated_at = datetime('now')
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

function normalizeCategoryInput(input, { partial = false, currentKey = '' } = {}) {
  const data = {};

  if (!partial || input.name !== undefined) {
    const name = String(input.name || '').trim();
    if (!name) {
      throw httpError(400, 'Tên loại không được để trống.');
    }
    data.name = name;
  }

  if (!partial || input.key !== undefined || (!partial && input.name !== undefined)) {
    const rawKey = input.key === undefined ? data.name : input.key;
    data.key = slugify(rawKey);
    if (!data.key) {
      throw httpError(400, 'Mã loại không hợp lệ.');
    }
  }

  if (!partial || input.icon !== undefined) {
    data.icon = String(input.icon || '').trim();
  }

  if (!partial || input.color !== undefined) {
    const color = String(input.color || '').trim();
    data.color = /^#[0-9a-fA-F]{6}$/.test(color) ? color : '#24745c';
  }

  if (!partial || input.visible !== undefined) {
    data.visible = toAvailability(input.visible, true) ? 1 : 0;
  }

  data.card_layout = 'vertical';

  if (!partial || input.sort_order !== undefined) {
    data.sort_order = toInteger(input.sort_order, 'Thứ tự loại', 0);
  }

  if (data.key && data.key !== currentKey) {
    const existing = getCategoryByKey(data.key);
    if (existing) {
      throw httpError(400, 'Mã loại này đã tồn tại.');
    }
  }

  return data;
}

function getMenuCategory(id) {
  const category = db.prepare(`
    SELECT id, key, name, icon, color, visible, is_system, card_layout, sort_order
    FROM menu_categories
    WHERE id = ?
  `).get(id);

  if (!category) {
    throw httpError(404, 'Không tìm thấy loại món.');
  }

  return serializeCategory(category);
}

function createMenuCategory(input) {
  const data = normalizeCategoryInput(input);
  data.is_system = 0;
  data.card_layout = 'vertical';

  const result = db.prepare(`
    INSERT INTO menu_categories (key, name, icon, color, visible, is_system, card_layout, sort_order, updated_at)
    VALUES (@key, @name, @icon, @color, @visible, @is_system, @card_layout, @sort_order, datetime('now'))
  `).run(data);

  return getMenuCategory(result.lastInsertRowid);
}

function updateMenuCategory(id, input) {
  const category = getMenuCategory(id);
  const data = normalizeCategoryInput(input, {
    partial: true,
    currentKey: category.key
  });

  if (category.is_system || SYSTEM_SECTION_KEYS.has(category.key)) {
    delete data.key;
    delete data.name;
    data.card_layout = category.key === 'today-offer' ? 'horizontal' : 'vertical';
  } else {
    data.card_layout = 'vertical';
  }

  const fields = Object.keys(data);

  if (fields.length === 0) {
    throw httpError(400, 'Không có dữ liệu để cập nhật.');
  }

  const transaction = db.transaction(() => {
    const assignments = fields.map((field) => `${field} = @${field}`).join(', ');
    db.prepare(`
      UPDATE menu_categories
      SET ${assignments},
          updated_at = datetime('now')
      WHERE id = @id
    `).run({ ...data, id });

    if (data.key && data.key !== category.key) {
      db.prepare('UPDATE menu_items SET category = ? WHERE category = ?').run(data.key, category.key);
    }
  });

  transaction();
  return getMenuCategory(id);
}

function deleteMenuCategory(id) {
  const category = getMenuCategory(id);

  if (category.is_system || SYSTEM_SECTION_KEYS.has(category.key)) {
    throw httpError(400, 'Không thể xoá mục cố định.');
  }

  const used = db.prepare('SELECT COUNT(*) AS total FROM menu_items WHERE category = ?').get(category.key).total;

  if (used > 0) {
    throw httpError(400, 'Loại này đang có món, hãy chuyển món sang loại khác trước khi xoá.');
  }

  db.prepare('DELETE FROM menu_categories WHERE id = ?').run(id);
}

module.exports = {
  createMenuCategory,
  createMenuItem,
  deleteMenuCategory,
  deleteMenuItem,
  listMenuCategories,
  listMenuItems,
  updateMenuCategory,
  updateMenuItem
};
