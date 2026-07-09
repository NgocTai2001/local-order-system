const { db } = require('../database');
const restaurantService = require('./restaurantService');
const { httpError } = require('../utils/httpError');

function getTable(tableId) {
  const table = db.prepare(`
    SELECT id, name, token, status, created_at, updated_at
    FROM tables
    WHERE id = ?
  `).get(tableId);

  if (!table) {
    throw httpError(404, 'Không tìm thấy bàn.');
  }

  return table;
}

function getOpenSession(tableId) {
  return db.prepare(`
    SELECT id, table_id, status, opened_at, closed_at
    FROM table_sessions
    WHERE table_id = ? AND status = 'open'
    ORDER BY id DESC
    LIMIT 1
  `).get(tableId);
}

function getOrCreateOpenSession(tableId) {
  getTable(tableId);

  const existing = getOpenSession(tableId);
  if (existing) {
    return existing;
  }

  const result = db.prepare(`
    INSERT INTO table_sessions (table_id, status, opened_at)
    VALUES (?, 'open', datetime('now'))
  `).run(tableId);

  db.prepare(`
    UPDATE tables
    SET status = 'occupied',
        updated_at = datetime('now')
    WHERE id = ?
  `).run(tableId);

  return getOpenSession(tableId) || {
    id: result.lastInsertRowid,
    table_id: tableId,
    status: 'open',
    opened_at: new Date().toISOString(),
    closed_at: null
  };
}

function getCurrentSession(tableId) {
  const table = getTable(tableId);
  const session = getOpenSession(tableId);

  return {
    table_id: table.id,
    table: table.name,
    table_status: table.status,
    session
  };
}

function mapBillOrders(rows) {
  const orders = new Map();

  for (const row of rows) {
    if (!orders.has(row.order_id)) {
      orders.set(row.order_id, {
        id: row.order_id,
        status: row.order_status,
        created_at: row.created_at,
        updated_at: row.updated_at,
        items: []
      });
    }

    if (row.order_item_id) {
      const price = row.price_snapshot || 0;
      const quantity = row.quantity || 0;

      orders.get(row.order_id).items.push({
        id: row.order_item_id,
        menu_item_id: row.menu_item_id,
        name: row.name_snapshot || 'Món đã xoá',
        price,
        price_snapshot: price,
        quantity,
        subtotal: row.subtotal ?? price * quantity
      });
    }
  }

  return Array.from(orders.values());
}

function emptyBill(table) {
  return {
    table_id: table.id,
    table: table.name,
    table_status: table.status,
    session_id: null,
    session_status: null,
    opened_at: null,
    closed_at: null,
    restaurant: restaurantService.getRestaurantInfo(),
    orders: [],
    summary: [],
    grand_total: 0
  };
}

function buildBill(table, session) {
  const rows = db.prepare(`
    SELECT
      o.id AS order_id,
      o.status AS order_status,
      o.created_at,
      o.updated_at,
      oi.id AS order_item_id,
      oi.menu_item_id,
      oi.name_snapshot,
      oi.price_snapshot,
      oi.quantity,
      oi.subtotal
    FROM orders o
    LEFT JOIN order_items oi ON oi.order_id = o.id
    WHERE o.session_id = ?
      AND o.status != 'cancelled'
    ORDER BY o.created_at ASC, o.id ASC, oi.id ASC
  `).all(session.id);

  const summary = db.prepare(`
    SELECT
      oi.menu_item_id,
      oi.name_snapshot AS name,
      oi.price_snapshot AS price,
      SUM(oi.quantity) AS quantity,
      SUM(COALESCE(oi.subtotal, oi.price_snapshot * oi.quantity)) AS total,
      MIN(oi.id) AS first_item_id
    FROM orders o
    JOIN order_items oi ON oi.order_id = o.id
    WHERE o.session_id = ?
      AND o.status != 'cancelled'
    GROUP BY oi.menu_item_id, oi.name_snapshot, oi.price_snapshot
    ORDER BY first_item_id ASC
  `).all(session.id).map((item) => ({
    menu_item_id: item.menu_item_id,
    name: item.name || 'Món đã xoá',
    price: item.price || 0,
    quantity: item.quantity || 0,
    total: item.total || 0
  }));

  return {
    table_id: table.id,
    table: table.name,
    table_status: table.status,
    session_id: session.id,
    session_status: session.status,
    opened_at: session.opened_at,
    closed_at: session.closed_at,
    restaurant: restaurantService.getRestaurantInfo(),
    orders: mapBillOrders(rows),
    summary,
    grand_total: summary.reduce((total, item) => total + item.total, 0)
  };
}

function getCurrentBill(tableId) {
  const table = getTable(tableId);
  const session = getOpenSession(tableId);

  if (!session) {
    return emptyBill(table);
  }

  return buildBill(table, session);
}

function closeCurrentSession(tableId) {
  const table = getTable(tableId);
  const session = getOpenSession(tableId);

  if (!session) {
    return emptyBill(table);
  }

  const closeTransaction = db.transaction(() => {
    db.prepare(`
      UPDATE orders
      SET status = 'paid',
          updated_at = datetime('now')
      WHERE session_id = ?
        AND status != 'cancelled'
    `).run(session.id);

    db.prepare(`
      UPDATE table_sessions
      SET status = 'closed',
          closed_at = datetime('now')
      WHERE id = ?
    `).run(session.id);

    db.prepare(`
      UPDATE tables
      SET status = 'empty',
          updated_at = datetime('now')
      WHERE id = ?
    `).run(tableId);
  });

  closeTransaction();
  const closedTable = getTable(tableId);
  const closedSession = db.prepare(`
    SELECT id, table_id, status, opened_at, closed_at
    FROM table_sessions
    WHERE id = ?
  `).get(session.id);

  return buildBill(closedTable, closedSession);
}

module.exports = {
  closeCurrentSession,
  getCurrentBill,
  getCurrentSession,
  getOrCreateOpenSession
};
