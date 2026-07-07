const { db } = require('./connection');

function tableExists(name) {
  return Boolean(
    db.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?").get(name)
  );
}

function tableSql(name) {
  return db.prepare("SELECT sql FROM sqlite_master WHERE type = 'table' AND name = ?").get(name)?.sql || '';
}

function columnExists(table, column) {
  return db.prepare(`PRAGMA table_info(${table})`).all().some((info) => info.name === column);
}

function ensureColumn(table, column, definition) {
  if (!columnExists(table, column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

function createTablesTable() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS tables (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      token TEXT NOT NULL UNIQUE,
      status TEXT NOT NULL DEFAULT 'empty'
        CHECK (status IN ('empty', 'occupied', 'payment_requested', 'paid')),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}

function createMenuItemsTable() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS menu_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price INTEGER NOT NULL CHECK (price >= 0),
      image TEXT NOT NULL DEFAULT '',
      available INTEGER NOT NULL DEFAULT 1 CHECK (available IN (0, 1)),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  ensureColumn('menu_items', 'image', "TEXT NOT NULL DEFAULT ''");
  ensureColumn('menu_items', 'available', 'INTEGER NOT NULL DEFAULT 1');
  ensureColumn('menu_items', 'created_at', 'TEXT');
  ensureColumn('menu_items', 'updated_at', 'TEXT');
}

function createOrdersTable() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      table_id INTEGER,
      table_token TEXT,
      status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'cooking', 'ready', 'served', 'cancelled', 'paid')),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (table_id) REFERENCES tables(id)
    );
  `);
}

function createOrderItemsTable() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      menu_item_id INTEGER,
      name_snapshot TEXT,
      price_snapshot INTEGER,
      quantity INTEGER NOT NULL CHECK (quantity > 0),
      subtotal INTEGER,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE SET NULL
    );
  `);
}

function ordersNeedRebuild() {
  if (!tableExists('orders')) {
    return false;
  }

  const sql = tableSql('orders');
  return !columnExists('orders', 'table_id') || !sql.includes("'cooking'");
}

function orderItemsNeedRebuild() {
  if (!tableExists('order_items')) {
    return false;
  }

  return (
    !columnExists('order_items', 'name_snapshot') ||
    !columnExists('order_items', 'price_snapshot') ||
    !columnExists('order_items', 'subtotal')
  );
}

function rebuildOrderTablesIfNeeded() {
  const rebuildOrders = ordersNeedRebuild();
  const rebuildItems = orderItemsNeedRebuild();

  if (!rebuildOrders && !rebuildItems) {
    createOrdersTable();
    createOrderItemsTable();
    return;
  }

  const hasOrders = tableExists('orders');
  const hasItems = tableExists('order_items');

  db.pragma('foreign_keys = OFF');

  if (hasItems) {
    db.exec('ALTER TABLE order_items RENAME TO order_items_legacy');
  }

  if (hasOrders) {
    db.exec('ALTER TABLE orders RENAME TO orders_legacy');
  }

  createOrdersTable();
  createOrderItemsTable();

  if (hasOrders) {
    const legacyHasTableId = columnExists('orders_legacy', 'table_id');
    const legacyHasTableToken = columnExists('orders_legacy', 'table_token');
    const legacyHasUpdatedAt = columnExists('orders_legacy', 'updated_at');

    db.exec(`
      INSERT INTO orders (id, table_id, table_token, status, created_at, updated_at)
      SELECT
        id,
        ${legacyHasTableId ? 'table_id' : 'NULL'},
        ${legacyHasTableToken ? 'table_token' : 'NULL'},
        CASE
          WHEN status = 'completed' THEN 'served'
          WHEN status IN ('pending', 'cooking', 'ready', 'served', 'cancelled', 'paid') THEN status
          ELSE 'pending'
        END,
        created_at,
        ${legacyHasUpdatedAt ? 'COALESCE(updated_at, created_at, datetime(\'now\'))' : 'COALESCE(created_at, datetime(\'now\'))'}
      FROM orders_legacy;
    `);
  }

  if (hasItems) {
    const legacyHasNameSnapshot = columnExists('order_items_legacy', 'name_snapshot');
    const legacyHasPriceSnapshot = columnExists('order_items_legacy', 'price_snapshot');
    const legacyHasSubtotal = columnExists('order_items_legacy', 'subtotal');

    db.exec(`
      INSERT INTO order_items (
        id,
        order_id,
        menu_item_id,
        name_snapshot,
        price_snapshot,
        quantity,
        subtotal
      )
      SELECT
        oi.id,
        oi.order_id,
        oi.menu_item_id,
        ${legacyHasNameSnapshot ? 'oi.name_snapshot' : 'mi.name'},
        ${legacyHasPriceSnapshot ? 'oi.price_snapshot' : 'mi.price'},
        oi.quantity,
        ${legacyHasSubtotal ? 'oi.subtotal' : 'COALESCE(mi.price, 0) * oi.quantity'}
      FROM order_items_legacy oi
      LEFT JOIN menu_items mi ON mi.id = oi.menu_item_id;
    `);
  }

  if (hasItems) {
    db.exec('DROP TABLE order_items_legacy');
  }

  if (hasOrders) {
    db.exec('DROP TABLE orders_legacy');
  }

  db.pragma('foreign_keys = ON');
}

function runMigrations() {
  createTablesTable();
  createMenuItemsTable();
  rebuildOrderTablesIfNeeded();

  ensureColumn('orders', 'table_id', 'INTEGER');
  ensureColumn('orders', 'table_token', 'TEXT');
  ensureColumn('orders', 'updated_at', 'TEXT');
  ensureColumn('order_items', 'name_snapshot', 'TEXT');
  ensureColumn('order_items', 'price_snapshot', 'INTEGER');
  ensureColumn('order_items', 'subtotal', 'INTEGER');

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_tables_token
      ON tables(token);

    CREATE INDEX IF NOT EXISTS idx_orders_status_created_at
      ON orders(status, created_at);

    CREATE INDEX IF NOT EXISTS idx_orders_table_id
      ON orders(table_id);

    CREATE INDEX IF NOT EXISTS idx_order_items_order_id
      ON order_items(order_id);
  `);
}

module.exports = { runMigrations };
