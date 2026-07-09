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

    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw httpError(400, 'Số lượng món phải là số nguyên lớn hơn 0.');
    }

    mergedItems.set(menuItemId, (mergedItems.get(menuItemId) || 0) + quantity);
  }

  return Array.from(mergedItems, ([menu_item_id, quantity]) => ({
    menu_item_id,
    quantity
  }));
}

function mapOrderRows(rows) {
  const orders = new Map();

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
    }

    if (row.order_item_id) {
      const price = row.price_snapshot ?? row.price ?? 0;
      const quantity = row.quantity || 0;

      orders.get(row.id).items.push({
        id: row.order_item_id,
        menu_item_id: row.menu_item_id,
        name: row.name_snapshot || row.item_name || 'Món đã xoá',
        price,
        price_snapshot: price,
        quantity,
        subtotal: row.subtotal ?? price * quantity
      });
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
      oi.quantity,
      oi.subtotal,
      mi.name AS item_name,
      mi.price
    FROM orders o
    LEFT JOIN tables t ON t.id = o.table_id
    LEFT JOIN order_items oi ON oi.order_id = o.id
    LEFT JOIN menu_items mi ON mi.id = oi.menu_item_id
    ${where}
  `;
}

function getOrderById(id) {
  const rows = db.prepare(`
    ${orderSelectSql('WHERE o.id = ?')}
    ORDER BY oi.id ASC
  `).all(id);

  if (rows.length === 0) {
    throw httpError(404, 'Không tìm thấy đơn hàng.');
  }

  return mapOrderRows(rows)[0];
}

function listOrders({ status, kitchen = false } = {}) {
  const values = [];
  let where = '';
  let orderBy = 'ORDER BY o.created_at DESC, o.id DESC, oi.id ASC';

  if (status) {
    const nextStatus = normalizeStatus(status);
    where = 'WHERE o.status = ?';
    values.push(nextStatus);
  } else if (kitchen) {
    where = `WHERE o.status IN (${kitchenStatuses.map(() => '?').join(', ')})`;
    values.push(...kitchenStatuses);
    orderBy = 'ORDER BY o.created_at ASC, o.id ASC, oi.id ASC';
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

function createOrder(input) {
  const table = resolveTable(input);
  const items = normalizeOrderItems(input.items);

  const createTransaction = db.transaction(() => {
    const session = sessionService.getOrCreateOpenSession(table.id);
    const ids = items.map((item) => item.menu_item_id);
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
        quantity,
        subtotal
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    for (const item of items) {
      const menuItem = menuById.get(item.menu_item_id);
      insertItem.run(
        orderResult.lastInsertRowid,
        item.menu_item_id,
        menuItem.name,
        menuItem.price,
        item.quantity,
        menuItem.price * item.quantity
      );
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
