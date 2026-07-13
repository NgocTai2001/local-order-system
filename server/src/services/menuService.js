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

function normalizeId(value, label = 'ID') {
  const id = Number(value);

  if (!Number.isInteger(id) || id <= 0) {
    throw httpError(400, `${label} không hợp lệ.`);
  }

  return id;
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
    sort_order: item.sort_order || 0,
    option_groups: item.option_groups || []
  };
}

function serializeOptionValue(value) {
  return {
    id: value.id,
    name: value.name,
    price_adjustment: value.price_adjustment || 0,
    is_default: Boolean(value.is_default),
    sort_order: value.sort_order || 0
  };
}

function serializeAssignedOptionGroup(group) {
  return {
    id: group.id,
    option_group_id: group.id,
    name: group.name,
    description: group.description || '',
    selection_type: group.selection_type === 'multiple' ? 'multiple' : 'single',
    is_required: Boolean(group.is_required),
    min_select: group.min_select || 0,
    max_select: group.max_select || 0,
    sort_order: group.assignment_sort_order || group.sort_order || 0,
    is_active: Boolean(group.is_active),
    values: (group.values || []).map(serializeOptionValue)
  };
}

function optionGroupsForMenuItems(menuItemIds, { includeInactive = false } = {}) {
  if (!menuItemIds.length) {
    return new Map();
  }

  const placeholders = menuItemIds.map(() => '?').join(', ');
  const groups = db.prepare(`
    SELECT
      miog.menu_item_id,
      miog.sort_order AS assignment_sort_order,
      og.id,
      og.name,
      og.description,
      og.selection_type,
      og.is_required,
      og.min_select,
      og.max_select,
      og.sort_order,
      og.is_active
    FROM menu_item_option_groups miog
    JOIN option_groups og ON og.id = miog.option_group_id
    WHERE miog.menu_item_id IN (${placeholders})
      ${includeInactive ? '' : 'AND og.is_active = 1'}
    ORDER BY miog.menu_item_id ASC, miog.sort_order ASC, og.sort_order ASC, og.id ASC
  `).all(...menuItemIds);
  const groupIds = [...new Set(groups.map((group) => group.id))];
  const valuesByGroup = new Map();

  if (groupIds.length) {
    const valuePlaceholders = groupIds.map(() => '?').join(', ');
    const values = db.prepare(`
      SELECT id, option_group_id, name, price_adjustment, is_default, sort_order, is_active
      FROM option_values
      WHERE option_group_id IN (${valuePlaceholders})
        ${includeInactive ? '' : 'AND is_active = 1'}
      ORDER BY sort_order ASC, id ASC
    `).all(...groupIds);

    for (const value of values) {
      if (!valuesByGroup.has(value.option_group_id)) {
        valuesByGroup.set(value.option_group_id, []);
      }
      valuesByGroup.get(value.option_group_id).push(value);
    }
  }

  const output = new Map();
  for (const group of groups) {
    if (!output.has(group.menu_item_id)) {
      output.set(group.menu_item_id, []);
    }
    output.get(group.menu_item_id).push(serializeAssignedOptionGroup({
      ...group,
      values: valuesByGroup.get(group.id) || []
    }));
  }

  return output;
}

function attachOptionGroups(items, { includeInactive = false } = {}) {
  const optionGroupsByItem = optionGroupsForMenuItems(items.map((item) => item.id), { includeInactive });
  return items.map((item) => ({
    ...item,
    option_groups: optionGroupsByItem.get(item.id) || []
  }));
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

  const items = db.prepare(sql).all().map(serializeMenuItem);
  return attachOptionGroups(items, { includeInactive: includeUnavailable });
}

function getMenuItem(id, { includeInactiveOptions = true } = {}) {
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

  const [output] = attachOptionGroups([serializeMenuItem(item)], {
    includeInactive: includeInactiveOptions
  });
  return output;
}

function normalizeOptionAssignments(input) {
  const source = input.option_groups ?? input.option_group_ids;

  if (source === undefined) {
    return null;
  }

  if (!Array.isArray(source)) {
    throw httpError(400, 'Danh sách bộ tùy chọn không hợp lệ.');
  }

  const seen = new Set();
  return source.map((entry, index) => {
    const optionGroupId = typeof entry === 'object'
      ? normalizeId(entry.option_group_id ?? entry.id, 'Bộ tùy chọn')
      : normalizeId(entry, 'Bộ tùy chọn');

    if (seen.has(optionGroupId)) {
      throw httpError(400, 'Một bộ tùy chọn không thể gán hai lần cho cùng món.');
    }
    seen.add(optionGroupId);

    return {
      option_group_id: optionGroupId,
      sort_order: typeof entry === 'object'
        ? toInteger(entry.sort_order, 'Thứ tự bộ tùy chọn', index + 1)
        : index + 1
    };
  });
}

function syncMenuItemOptionGroups(menuItemId, assignments) {
  if (assignments === null) {
    return;
  }

  const deleteExisting = db.prepare('DELETE FROM menu_item_option_groups WHERE menu_item_id = ?');
  const insertAssignment = db.prepare(`
    INSERT INTO menu_item_option_groups (menu_item_id, option_group_id, sort_order)
    VALUES (@menu_item_id, @option_group_id, @sort_order)
  `);
  const existingGroups = assignments.length
    ? db.prepare(`
      SELECT id
      FROM option_groups
      WHERE id IN (${assignments.map(() => '?').join(', ')})
    `).all(...assignments.map((assignment) => assignment.option_group_id))
    : [];
  const existingIds = new Set(existingGroups.map((group) => group.id));

  for (const assignment of assignments) {
    if (!existingIds.has(assignment.option_group_id)) {
      throw httpError(400, 'Bộ tùy chọn không tồn tại.');
    }
  }

  deleteExisting.run(menuItemId);
  for (const assignment of assignments) {
    insertAssignment.run({
      menu_item_id: menuItemId,
      option_group_id: assignment.option_group_id,
      sort_order: assignment.sort_order
    });
  }
}

function createMenuItem(input) {
  const data = normalizeMenuInput(input);
  const optionAssignments = normalizeOptionAssignments(input) || [];

  const transaction = db.transaction(() => {
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

    syncMenuItemOptionGroups(result.lastInsertRowid, optionAssignments);
    return result.lastInsertRowid;
  });

  return getMenuItem(transaction());
}

function updateMenuItem(id, input) {
  getMenuItem(id);

  const data = normalizeMenuInput(input, { partial: true });
  const optionAssignments = normalizeOptionAssignments(input);
  const fields = Object.keys(data);

  if (fields.length === 0 && optionAssignments === null) {
    throw httpError(400, 'Không có dữ liệu để cập nhật.');
  }

  const transaction = db.transaction(() => {
    if (fields.length > 0) {
      const assignments = fields.map((field) => `${field} = @${field}`).join(', ');

      db.prepare(`
        UPDATE menu_items
        SET ${assignments},
            updated_at = datetime('now')
        WHERE id = @id
      `).run({ ...data, id });
    }

    syncMenuItemOptionGroups(id, optionAssignments);
  });

  transaction();
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
  getMenuItem,
  listMenuCategories,
  listMenuItems,
  updateMenuCategory,
  updateMenuItem
};
