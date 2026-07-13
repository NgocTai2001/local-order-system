const { db } = require('../database');
const { httpError } = require('../utils/httpError');

function normalizeId(value, label = 'ID') {
  const id = Number(value);

  if (!Number.isInteger(id) || id <= 0) {
    throw httpError(400, `${label} không hợp lệ.`);
  }

  return id;
}

function toBooleanInt(value, fallback = false) {
  if (value === undefined || value === null || value === '') {
    return fallback ? 1 : 0;
  }

  if (typeof value === 'boolean') {
    return value ? 1 : 0;
  }

  if (value === 1 || value === '1' || value === 'true' || value === 'on') {
    return 1;
  }

  if (value === 0 || value === '0' || value === 'false' || value === 'off') {
    return 0;
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

function serializeValue(row) {
  return {
    id: row.id,
    option_group_id: row.option_group_id,
    name: row.name,
    price_adjustment: row.price_adjustment || 0,
    is_default: Boolean(row.is_default),
    sort_order: row.sort_order || 0,
    is_active: Boolean(row.is_active)
  };
}

function serializeGroup(row, values = []) {
  return {
    id: row.id,
    name: row.name,
    description: row.description || '',
    selection_type: row.selection_type === 'multiple' ? 'multiple' : 'single',
    is_required: Boolean(row.is_required),
    min_select: row.min_select || 0,
    max_select: row.max_select || 0,
    sort_order: row.sort_order || 0,
    is_active: Boolean(row.is_active),
    values: values.map(serializeValue)
  };
}

function normalizeGroupInput(input, { partial = false } = {}) {
  const data = {};

  if (!partial || input.name !== undefined) {
    const name = String(input.name || '').trim();
    if (!name) {
      throw httpError(400, 'Tên bộ tùy chọn không được để trống.');
    }
    data.name = name;
  }

  if (!partial || input.description !== undefined) {
    data.description = String(input.description || '').trim();
  }

  if (!partial || input.selection_type !== undefined) {
    const selectionType = String(input.selection_type || 'single').trim();
    if (!['single', 'multiple'].includes(selectionType)) {
      throw httpError(400, 'Kiểu chọn không hợp lệ.');
    }
    data.selection_type = selectionType;
  }

  if (!partial || input.is_required !== undefined) {
    data.is_required = toBooleanInt(input.is_required, false);
  }

  if (!partial || input.min_select !== undefined) {
    data.min_select = toInteger(input.min_select, 'Số lựa chọn tối thiểu', 0);
    if (data.min_select < 0) {
      throw httpError(400, 'Số lựa chọn tối thiểu không hợp lệ.');
    }
  }

  if (!partial || input.max_select !== undefined) {
    data.max_select = toInteger(input.max_select, 'Số lựa chọn tối đa', 1);
    if (data.max_select < 0) {
      throw httpError(400, 'Số lựa chọn tối đa không hợp lệ.');
    }
  }

  if (!partial || input.sort_order !== undefined) {
    data.sort_order = toInteger(input.sort_order, 'Thứ tự bộ tùy chọn', 0);
  }

  if (!partial || input.is_active !== undefined) {
    data.is_active = toBooleanInt(input.is_active, true);
  }

  return data;
}

function normalizeValueInput(value, index) {
  const name = String(value.name || '').trim();
  if (!name) {
    throw httpError(400, `Tên giá trị dòng ${index + 1} không được để trống.`);
  }

  const priceAdjustment = toInteger(value.price_adjustment, 'Giá cộng thêm', 0);
  if (priceAdjustment < 0) {
    throw httpError(400, 'Giá cộng thêm không được âm.');
  }

  return {
    id: value.id ? normalizeId(value.id, 'Giá trị tùy chọn') : null,
    name,
    price_adjustment: priceAdjustment,
    is_default: toBooleanInt(value.is_default, false),
    sort_order: toInteger(value.sort_order, 'Thứ tự giá trị', index + 1),
    is_active: toBooleanInt(value.is_active, true)
  };
}

function validateGroupWithValues(group, values) {
  const activeValues = values.filter((value) => value.is_active);

  if (activeValues.length === 0) {
    throw httpError(400, 'Mỗi bộ tùy chọn phải có ít nhất một giá trị đang hoạt động.');
  }

  if (group.selection_type === 'single') {
    group.max_select = 1;
    if (group.min_select > 1) {
      group.min_select = 1;
    }

    const defaults = activeValues.filter((value) => value.is_default);
    if (defaults.length > 1) {
      throw httpError(400, 'Bộ chọn một chỉ được có một giá trị mặc định.');
    }
    return;
  }

  if (group.max_select < group.min_select) {
    throw httpError(400, 'Số lựa chọn tối đa phải lớn hơn hoặc bằng tối thiểu.');
  }
}

function listOptionGroups({ includeInactive = true } = {}) {
  const groups = db.prepare(`
    SELECT id, name, description, selection_type, is_required, min_select, max_select, sort_order, is_active
    FROM option_groups
    ${includeInactive ? '' : 'WHERE is_active = 1'}
    ORDER BY sort_order ASC, id ASC
  `).all();

  const values = db.prepare(`
    SELECT id, option_group_id, name, price_adjustment, is_default, sort_order, is_active
    FROM option_values
    ${includeInactive ? '' : 'WHERE is_active = 1'}
    ORDER BY sort_order ASC, id ASC
  `).all();
  const valuesByGroup = new Map();

  for (const value of values) {
    if (!valuesByGroup.has(value.option_group_id)) {
      valuesByGroup.set(value.option_group_id, []);
    }
    valuesByGroup.get(value.option_group_id).push(value);
  }

  return groups.map((group) => serializeGroup(group, valuesByGroup.get(group.id) || []));
}

function getOptionGroup(id, { includeInactive = true } = {}) {
  const group = db.prepare(`
    SELECT id, name, description, selection_type, is_required, min_select, max_select, sort_order, is_active
    FROM option_groups
    WHERE id = ?
      ${includeInactive ? '' : 'AND is_active = 1'}
  `).get(id);

  if (!group) {
    throw httpError(404, 'Không tìm thấy bộ tùy chọn.');
  }

  const values = db.prepare(`
    SELECT id, option_group_id, name, price_adjustment, is_default, sort_order, is_active
    FROM option_values
    WHERE option_group_id = ?
      ${includeInactive ? '' : 'AND is_active = 1'}
    ORDER BY sort_order ASC, id ASC
  `).all(id);

  return serializeGroup(group, values);
}

function normalizeOptionGroupPayload(input, { partial = false } = {}) {
  const group = normalizeGroupInput(input, { partial });
  const rawValues = Array.isArray(input.values) ? input.values : [];
  const values = rawValues.map(normalizeValueInput);

  if (!partial || input.values !== undefined) {
    validateGroupWithValues(group, values);
  }

  return { group, values };
}

function createOptionGroup(input) {
  const { group, values } = normalizeOptionGroupPayload(input);

  const transaction = db.transaction(() => {
    const result = db.prepare(`
      INSERT INTO option_groups (
        name,
        description,
        selection_type,
        is_required,
        min_select,
        max_select,
        sort_order,
        is_active,
        updated_at
      )
      VALUES (
        @name,
        @description,
        @selection_type,
        @is_required,
        @min_select,
        @max_select,
        @sort_order,
        @is_active,
        datetime('now')
      )
    `).run(group);

    const insertValue = db.prepare(`
      INSERT INTO option_values (
        option_group_id,
        name,
        price_adjustment,
        is_default,
        sort_order,
        is_active,
        updated_at
      )
      VALUES (
        @option_group_id,
        @name,
        @price_adjustment,
        @is_default,
        @sort_order,
        @is_active,
        datetime('now')
      )
    `);

    for (const value of values) {
      insertValue.run({ ...value, option_group_id: result.lastInsertRowid });
    }

    return result.lastInsertRowid;
  });

  return getOptionGroup(transaction());
}

function valueUsedInOrders(valueId) {
  return db.prepare('SELECT 1 FROM order_item_options WHERE option_value_id = ? LIMIT 1').get(valueId);
}

function syncValues(groupId, values) {
  const existing = db.prepare('SELECT id FROM option_values WHERE option_group_id = ?').all(groupId);
  const submittedIds = new Set(values.filter((value) => value.id).map((value) => value.id));
  const insertValue = db.prepare(`
    INSERT INTO option_values (
      option_group_id,
      name,
      price_adjustment,
      is_default,
      sort_order,
      is_active,
      updated_at
    )
    VALUES (
      @option_group_id,
      @name,
      @price_adjustment,
      @is_default,
      @sort_order,
      @is_active,
      datetime('now')
    )
  `);
  const updateValue = db.prepare(`
    UPDATE option_values
    SET
      name = @name,
      price_adjustment = @price_adjustment,
      is_default = @is_default,
      sort_order = @sort_order,
      is_active = @is_active,
      updated_at = datetime('now')
    WHERE id = @id
      AND option_group_id = @option_group_id
  `);

  for (const value of values) {
    if (value.id) {
      const result = updateValue.run({ ...value, option_group_id: groupId });
      if (result.changes === 0) {
        throw httpError(400, 'Giá trị tùy chọn không thuộc bộ này.');
      }
    } else {
      insertValue.run({ ...value, option_group_id: groupId });
    }
  }

  for (const value of existing) {
    if (submittedIds.has(value.id)) {
      continue;
    }

    if (valueUsedInOrders(value.id)) {
      db.prepare(`
        UPDATE option_values
        SET is_active = 0,
            is_default = 0,
            updated_at = datetime('now')
        WHERE id = ?
      `).run(value.id);
    } else {
      db.prepare('DELETE FROM option_values WHERE id = ?').run(value.id);
    }
  }
}

function updateOptionGroup(id, input) {
  getOptionGroup(id);
  const { group, values } = normalizeOptionGroupPayload(input);

  const transaction = db.transaction(() => {
    db.prepare(`
      UPDATE option_groups
      SET
        name = @name,
        description = @description,
        selection_type = @selection_type,
        is_required = @is_required,
        min_select = @min_select,
        max_select = @max_select,
        sort_order = @sort_order,
        is_active = @is_active,
        updated_at = datetime('now')
      WHERE id = @id
    `).run({ ...group, id });

    syncValues(id, values);
  });

  transaction();
  return getOptionGroup(id);
}

function optionGroupUsed(id) {
  const menuUse = db.prepare('SELECT 1 FROM menu_item_option_groups WHERE option_group_id = ? LIMIT 1').get(id);
  const orderUse = db.prepare('SELECT 1 FROM order_item_options WHERE option_group_id = ? LIMIT 1').get(id);
  return Boolean(menuUse || orderUse);
}

function deleteOptionGroup(id) {
  getOptionGroup(id);

  if (optionGroupUsed(id)) {
    throw httpError(400, 'Bộ tùy chọn đang được sử dụng. Hãy tắt hiển thị hoặc gỡ khỏi món trước khi xoá.');
  }

  const transaction = db.transaction(() => {
    db.prepare('DELETE FROM option_values WHERE option_group_id = ?').run(id);
    db.prepare('DELETE FROM option_groups WHERE id = ?').run(id);
  });

  transaction();
}

function reorderOptionGroups(ids) {
  if (!Array.isArray(ids) || ids.length === 0) {
    throw httpError(400, 'Danh sách sắp xếp không hợp lệ.');
  }

  const update = db.prepare('UPDATE option_groups SET sort_order = ?, updated_at = datetime(\'now\') WHERE id = ?');
  const transaction = db.transaction(() => {
    ids.forEach((id, index) => {
      update.run(index + 1, normalizeId(id, 'Bộ tùy chọn'));
    });
  });

  transaction();
  return listOptionGroups();
}

module.exports = {
  createOptionGroup,
  deleteOptionGroup,
  getOptionGroup,
  listOptionGroups,
  normalizeId,
  reorderOptionGroups,
  updateOptionGroup
};
