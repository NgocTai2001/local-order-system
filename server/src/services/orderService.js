const { db } = require('../database');
const { httpError } = require('../utils/httpError');

const allowedStatuses = new Set(['pending', 'completed', 'cancelled']);

function normalizeId(value, label = 'ID') {
  const id = Number(value);

  if (!Number.isInteger(id) || id <= 0) {
    throw httpError(400, `${label} không hợp lệ.`);
  }

  return id;
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
      orders.set(row.id, {
        id: row.id,
        table_token: row.table_token,
        status: row.status,
        created_at: row.created_at,
        items: []
      });
    }

    if (row.order_item_id) {
      orders.get(row.id).items.push({
        id: row.order_item_id,
        menu_item_id: row.menu_item_id,
        name: row.item_name || 'Món đã xoá',
        price: row.price || 0,
        quantity: row.quantity
      });
    }
  }

  return Array.from(orders.values());
}

function getOrderById(id) {
  const rows = db.prepare(`
    SELECT
      o.id,
      o.table_token,
      o.status,
      o.created_at,
      oi.id AS order_item_id,
      oi.menu_item_id,
      oi.quantity,
      mi.name AS item_name,
      mi.price
    FROM orders o
    LEFT JOIN order_items oi ON oi.order_id = o.id
    LEFT JOIN menu_items mi ON mi.id = oi.menu_item_id
    WHERE o.id = ?
    ORDER BY oi.id ASC
  `).all(id);

  if (rows.length === 0) {
    throw httpError(404, 'Không tìm thấy đơn hàng.');
  }

  return mapOrderRows(rows)[0];
}

function listOrders({ status } = {}) {
  const values = [];
  let where = '';

  if (status) {
    if (!allowedStatuses.has(status)) {
      throw httpError(400, 'Trạng thái đơn hàng không hợp lệ.');
    }
    where = 'WHERE o.status = ?';
    values.push(status);
  }

  const rows = db.prepare(`
    SELECT
      o.id,
      o.table_token,
      o.status,
      o.created_at,
      oi.id AS order_item_id,
      oi.menu_item_id,
      oi.quantity,
      mi.name AS item_name,
      mi.price
    FROM orders o
    LEFT JOIN order_items oi ON oi.order_id = o.id
    LEFT JOIN menu_items mi ON mi.id = oi.menu_item_id
    ${where}
    ORDER BY o.created_at DESC, o.id DESC, oi.id ASC
  `).all(...values);

  return mapOrderRows(rows);
}

function createOrder(input) {
  const tableToken = String(input.table_token || '').trim();

  if (!tableToken) {
    throw httpError(400, 'Mã bàn không được để trống.');
  }

  if (tableToken.length > 40) {
    throw httpError(400, 'Mã bàn quá dài.');
  }

  const items = normalizeOrderItems(input.items);

  const createTransaction = db.transaction(() => {
    const ids = items.map((item) => item.menu_item_id);
    const placeholders = ids.map(() => '?').join(', ');
    const availableItems = db.prepare(`
      SELECT id
      FROM menu_items
      WHERE available = 1 AND id IN (${placeholders})
    `).all(...ids);

    if (availableItems.length !== ids.length) {
      throw httpError(400, 'Có món không tồn tại hoặc đang tạm hết.');
    }

    const orderResult = db.prepare(`
      INSERT INTO orders (table_token, status)
      VALUES (?, 'pending')
    `).run(tableToken);

    const insertItem = db.prepare(`
      INSERT INTO order_items (order_id, menu_item_id, quantity)
      VALUES (?, ?, ?)
    `);

    for (const item of items) {
      insertItem.run(orderResult.lastInsertRowid, item.menu_item_id, item.quantity);
    }

    return getOrderById(orderResult.lastInsertRowid);
  });

  return createTransaction();
}

function updateOrderStatus(id, status) {
  const nextStatus = String(status || '').trim();

  if (!allowedStatuses.has(nextStatus)) {
    throw httpError(400, 'Trạng thái đơn hàng không hợp lệ.');
  }

  const result = db.prepare(`
    UPDATE orders
    SET status = ?
    WHERE id = ?
  `).run(nextStatus, id);

  if (result.changes === 0) {
    throw httpError(404, 'Không tìm thấy đơn hàng.');
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
