const { db } = require('../database');
const sessionService = require('./sessionService');
const { httpError } = require('../utils/httpError');

const allowedStatuses = new Set(['pending', 'cooking', 'ready', 'served', 'cancelled', 'paid']);
const kitchenStatuses = ['pending', 'cooking', 'ready'];

function normalizeId(value, label = 'ID') {
  const id = Number(value);

  if (!Number.isInteger(id) || id <= 0) {
    throw httpError(400, `${label} không hợp lệ.`);
  }

  return id;
}

function normalizeStatus(value) {
  const status = String(value || '').trim();
  const mappedStatus = status === 'completed' ? 'served' : status;

  if (!allowedStatuses.has(mappedStatus)) {
    throw httpError(400, 'Trạng thái đơn hàng không hợp lệ.');
  }

  return mappedStatus;
}

function normalizeOrderItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw httpError(400, 'Đơn hàng phải có ít nhất một món.');
  }

  const mergedItems = new Map();

  for (const item of items) {
    const menuItemId = normalizeId(item.menu_item_id, 'Món');
    const quantity = Number(item.quantity);
    const selectedOptionValueIds = Array.isArray(item.selected_option_value_ids)
      ? [...new Set(item.selected_option_value_ids.map((id) => normalizeId(id, 'Tùy chọn')))].sort((a, b) => a - b)
      : [];
    const customerNote = String(item.customer_note || '').trim().replace(/\s+/g, ' ');

    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw httpError(400, 'Số lượng món phải là số nguyên lớn hơn 0.');
    }

    const key = `${menuItemId}|${selectedOptionValueIds.join(',')}|${customerNote.toLowerCase()}`;
    const existing = mergedItems.get(key);

    if (existing) {
      existing.quantity += quantity;
    } else {
      mergedItems.set(key, {
        menu_item_id: menuItemId,
        quantity,
        selected_option_value_ids: selectedOptionValueIds,
        customer_note: customerNote
      });
    }
  }

  return Array.from(mergedItems.values());
}

function mapOrderRows(rows) {
  const orders = new Map();
  const itemMaps = new Map();

  for (const row of rows) {
    if (!orders.has(row.id)) {
      const tableToken = row.table_token || row.legacy_table_token || '';

      orders.set(row.id, {
        id: row.id,
        order_id: row.id,
        session_id: row.session_id,
        table_id: row.table_id,
        table_token: tableToken,
        table_name: row.table_name || (tableToken ? `Bàn ${tableToken}` : 'Bàn không rõ'),
        status: row.status,
        created_at: row.created_at,
        updated_at: row.updated_at,
        success: true,
        items: []
      });
      itemMaps.set(row.id, new Map());
    }

    if (row.order_item_id) {
      const orderItems = itemMaps.get(row.id);
      const quantity = row.quantity || 0;
      let item = orderItems.get(row.order_item_id);

      if (!item) {
        const basePrice = row.base_price_snapshot ?? row.price_snapshot ?? row.price ?? 0;
        const optionsTotal = row.options_total_snapshot ?? 0;
        const unitPrice = row.unit_price_snapshot ?? row.price_snapshot ?? (basePrice + optionsTotal);

        item = {
          id: row.order_item_id,
          menu_item_id: row.menu_item_id,
          name: row.name_snapshot || row.item_name || 'Món đã xoá',
          price: unitPrice,
          price_snapshot: unitPrice,
          base_price: basePrice,
          base_price_snapshot: basePrice,
          options_total: optionsTotal,
          options_total_snapshot: optionsTotal,
          unit_price: unitPrice,
          unit_price_snapshot: unitPrice,
          quantity,
          subtotal: row.subtotal ?? unitPrice * quantity,
          customer_note: row.customer_note || '',
          options: []
        };
        orderItems.set(row.order_item_id, item);
        orders.get(row.id).items.push(item);
      }

      if (row.order_item_option_id) {
        item.options.push({
          id: row.order_item_option_id,
          option_group_id: row.option_group_id,
          option_value_id: row.option_value_id,
          group_name: row.group_name_snapshot,
          group_name_snapshot: row.group_name_snapshot,
          value_name: row.value_name_snapshot,
          value_name_snapshot: row.value_name_snapshot,
          price_adjustment: row.price_adjustment_snapshot || 0,
          price_adjustment_snapshot: row.price_adjustment_snapshot || 0
        });
      }
    }
  }

  return Array.from(orders.values());
}

function orderSelectSql(where = '') {
  return `
    SELECT
      o.id,
      o.session_id,
      o.table_id,
      o.table_token AS legacy_table_token,
      o.status,
      o.created_at,
      o.updated_at,
      t.name AS table_name,
      t.token AS table_token,
      oi.id AS order_item_id,
      oi.menu_item_id,
      oi.name_snapshot,
      oi.price_snapshot,
      oi.base_price_snapshot,
      oi.options_total_snapshot,
      oi.unit_price_snapshot,
      oi.quantity,
      oi.subtotal,
      oi.customer_note,
      oio.id AS order_item_option_id,
      oio.option_group_id,
      oio.option_value_id,
      oio.group_name_snapshot,
      oio.value_name_snapshot,
      oio.price_adjustment_snapshot,
      mi.name AS item_name,
      mi.price
    FROM orders o
    LEFT JOIN tables t ON t.id = o.table_id
    LEFT JOIN order_items oi ON oi.order_id = o.id
    LEFT JOIN order_item_options oio ON oio.order_item_id = oi.id
    LEFT JOIN menu_items mi ON mi.id = oi.menu_item_id
    ${where}
  `;
}

function getOrderById(id) {
  const rows = db.prepare(`
    ${orderSelectSql('WHERE o.id = ?')}
    ORDER BY oi.id ASC, oio.id ASC
  `).all(id);

  if (rows.length === 0) {
    throw httpError(404, 'Không tìm thấy đơn hàng.');
  }

  return mapOrderRows(rows)[0];
}

function listOrders({ status, kitchen = false } = {}) {
  const values = [];
  let where = '';
  let orderBy = 'ORDER BY o.created_at DESC, o.id DESC, oi.id ASC, oio.id ASC';

  if (status) {
    const nextStatus = normalizeStatus(status);
    where = 'WHERE o.status = ?';
    values.push(nextStatus);
  } else if (kitchen) {
    where = `WHERE o.status IN (${kitchenStatuses.map(() => '?').join(', ')})`;
    values.push(...kitchenStatuses);
    orderBy = 'ORDER BY o.created_at ASC, o.id ASC, oi.id ASC, oio.id ASC';
  }

  const rows = db.prepare(`
    ${orderSelectSql(where)}
    ${orderBy}
  `).all(...values);

  return mapOrderRows(rows);
}

function resolveTable(input) {
  if (input.table_id !== undefined && input.table_id !== null && input.table_id !== '') {
    const tableId = normalizeId(input.table_id, 'Bàn');
    const table = db.prepare('SELECT id, name, token FROM tables WHERE id = ?').get(tableId);

    if (!table) {
      throw httpError(400, 'Bàn không tồn tại.');
    }

    return table;
  }

  const tableToken = String(input.table_token || '').trim();

  if (!tableToken) {
    throw httpError(400, 'Vui lòng quét QR trên bàn để gọi món.');
  }

  const table = db.prepare('SELECT id, name, token FROM tables WHERE token = ?').get(tableToken);

  if (!table) {
    throw httpError(400, 'Invalid table token');
  }

  return table;
}

function getAssignedOptionGroups(menuItemId) {
  const groups = db.prepare(`
    SELECT
      og.id,
      og.name,
      og.selection_type,
      og.is_required,
      og.min_select,
      og.max_select,
      miog.sort_order AS assignment_sort_order
    FROM menu_item_option_groups miog
    JOIN option_groups og ON og.id = miog.option_group_id
    WHERE miog.menu_item_id = ?
      AND og.is_active = 1
    ORDER BY miog.sort_order ASC, og.sort_order ASC, og.id ASC
  `).all(menuItemId);

  if (groups.length === 0) {
    return [];
  }

  const groupIds = groups.map((group) => group.id);
  const values = db.prepare(`
    SELECT
      ov.id,
      ov.option_group_id,
      ov.name,
      ov.price_adjustment,
      ov.is_default,
      ov.sort_order
    FROM option_values ov
    WHERE ov.option_group_id IN (${groupIds.map(() => '?').join(', ')})
      AND ov.is_active = 1
    ORDER BY ov.sort_order ASC, ov.id ASC
  `).all(...groupIds);
  const valuesByGroup = new Map();

  for (const value of values) {
    if (!valuesByGroup.has(value.option_group_id)) {
      valuesByGroup.set(value.option_group_id, []);
    }
    valuesByGroup.get(value.option_group_id).push(value);
  }

  return groups.map((group) => ({
    ...group,
    values: valuesByGroup.get(group.id) || []
  }));
}

function validateSelectedOptions(menuItem, orderItem) {
  const groups = getAssignedOptionGroups(menuItem.id);
  const selectedIds = orderItem.selected_option_value_ids || [];
  const selectedSet = new Set(selectedIds);
  const valueById = new Map();
  const groupById = new Map();
  const selectedByGroup = new Map();

  for (const group of groups) {
    groupById.set(group.id, group);
    for (const value of group.values) {
      valueById.set(value.id, { ...value, group });
    }
  }

  for (const valueId of selectedSet) {
    const value = valueById.get(valueId);

    if (!value) {
      throw httpError(400, `Tùy chọn không hợp lệ cho ${menuItem.name}.`);
    }

    if (!selectedByGroup.has(value.option_group_id)) {
      selectedByGroup.set(value.option_group_id, []);
    }
    selectedByGroup.get(value.option_group_id).push(value);
  }

  const snapshots = [];

  for (const group of groups) {
    const selected = selectedByGroup.get(group.id) || [];
    const minSelect = group.is_required ? Math.max(1, group.min_select || 0) : group.min_select || 0;
    const maxSelect = group.selection_type === 'single' ? 1 : group.max_select || selected.length;

    if (selected.length < minSelect) {
      throw httpError(400, `Vui lòng chọn ${group.name} cho ${menuItem.name}.`);
    }

    if (selected.length > maxSelect) {
      throw httpError(400, `${group.name} chỉ được chọn tối đa ${maxSelect} lựa chọn.`);
    }

    if (group.selection_type === 'single' && selected.length > 1) {
      throw httpError(400, `${group.name} chỉ được chọn một lựa chọn.`);
    }

    for (const value of selected) {
      snapshots.push({
        option_group_id: group.id,
        option_value_id: value.id,
        group_name_snapshot: group.name,
        value_name_snapshot: value.name,
        price_adjustment_snapshot: value.price_adjustment || 0,
        group_sort_order: group.assignment_sort_order || 0,
        value_sort_order: value.sort_order || 0
      });
    }
  }

  return snapshots.sort((first, second) => (
    first.group_sort_order - second.group_sort_order ||
    first.value_sort_order - second.value_sort_order ||
    first.option_value_id - second.option_value_id
  ));
}

function createOrder(input) {
  const table = resolveTable(input);
  const items = normalizeOrderItems(input.items);

  const createTransaction = db.transaction(() => {
    const session = sessionService.getOrCreateOpenSession(table.id);
    const ids = [...new Set(items.map((item) => item.menu_item_id))];
    const placeholders = ids.map(() => '?').join(', ');
    const availableItems = db.prepare(`
      SELECT id, name, price
      FROM menu_items
      WHERE available = 1 AND id IN (${placeholders})
    `).all(...ids);

    if (availableItems.length !== ids.length) {
      throw httpError(400, 'Có món không tồn tại hoặc đang tạm hết.');
    }

    const menuById = new Map(availableItems.map((item) => [item.id, item]));

    const orderResult = db.prepare(`
      INSERT INTO orders (session_id, table_id, table_token, status, updated_at)
      VALUES (?, ?, ?, 'pending', datetime('now'))
    `).run(session.id, table.id, table.token);

    const insertItem = db.prepare(`
      INSERT INTO order_items (
        order_id,
        menu_item_id,
        name_snapshot,
        price_snapshot,
        base_price_snapshot,
        options_total_snapshot,
        unit_price_snapshot,
        quantity,
        subtotal,
        customer_note
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const insertOption = db.prepare(`
      INSERT INTO order_item_options (
        order_item_id,
        option_group_id,
        option_value_id,
        group_name_snapshot,
        value_name_snapshot,
        price_adjustment_snapshot
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    for (const item of items) {
      const menuItem = menuById.get(item.menu_item_id);
      const optionSnapshots = validateSelectedOptions(menuItem, item);
      const optionsTotal = optionSnapshots.reduce((total, option) => total + option.price_adjustment_snapshot, 0);
      const basePrice = menuItem.price;
      const unitPrice = basePrice + optionsTotal;
      const subtotal = unitPrice * item.quantity;
      const itemResult = insertItem.run(
        orderResult.lastInsertRowid,
        item.menu_item_id,
        menuItem.name,
        unitPrice,
        basePrice,
        optionsTotal,
        unitPrice,
        item.quantity,
        subtotal,
        item.customer_note
      );
      const orderItemId = itemResult.lastInsertRowid;

      for (const option of optionSnapshots) {
        insertOption.run(
          orderItemId,
          option.option_group_id,
          option.option_value_id,
          option.group_name_snapshot,
          option.value_name_snapshot,
          option.price_adjustment_snapshot
        );
      }
    }

    db.prepare(`
      UPDATE tables
      SET status = 'occupied',
          updated_at = datetime('now')
      WHERE id = ?
    `).run(table.id);

    return getOrderById(orderResult.lastInsertRowid);
  });

  return createTransaction();
}

function updateOrderStatus(id, status) {
  const nextStatus = normalizeStatus(status);

  const result = db.prepare(`
    UPDATE orders
    SET status = ?,
        updated_at = datetime('now')
    WHERE id = ?
  `).run(nextStatus, id);

  if (result.changes === 0) {
    throw httpError(404, 'Không tìm thấy đơn hàng.');
  }

  const order = getOrderById(id);

  if (order.table_id && nextStatus === 'paid') {
    db.prepare(`
      UPDATE tables
      SET status = 'paid',
          updated_at = datetime('now')
      WHERE id = ?
    `).run(order.table_id);
  }

  return getOrderById(id);
}

module.exports = {
  createOrder,
  getOrderById,
  listOrders,
  normalizeId,
  updateOrderStatus
};
