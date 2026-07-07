const { db } = require('../database');
const { createQrDataUrl } = require('./qrService');
const { httpError } = require('../utils/httpError');
const { generateToken } = require('../utils/token');

const allowedTableStatuses = new Set(['empty', 'occupied', 'payment_requested', 'paid']);

function normalizeTableName(value) {
  const name = String(value || '').trim();

  if (!name) {
    throw httpError(400, 'Tên bàn không được để trống.');
  }

  if (name.length > 80) {
    throw httpError(400, 'Tên bàn quá dài.');
  }

  return name;
}

function normalizeId(value, label = 'Bàn') {
  const id = Number(value);

  if (!Number.isInteger(id) || id <= 0) {
    throw httpError(400, `${label} không hợp lệ.`);
  }

  return id;
}

function tableUrl(table, baseUrl) {
  return `${baseUrl.replace(/\/$/, '')}/t/${encodeURIComponent(table.token)}`;
}

function serializeTable(table, baseUrl) {
  const output = {
    id: table.id,
    name: table.name,
    token: table.token,
    status: table.status,
    created_at: table.created_at,
    updated_at: table.updated_at
  };

  if (baseUrl) {
    output.url = tableUrl(table, baseUrl);
  }

  return output;
}

function createUniqueToken() {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const token = generateToken();
    const existing = db.prepare('SELECT id FROM tables WHERE token = ?').get(token);

    if (!existing) {
      return token;
    }
  }

  throw httpError(500, 'Không thể tạo token bàn duy nhất.');
}

function getTableById(id, baseUrl) {
  const table = db.prepare(`
    SELECT id, name, token, status, created_at, updated_at
    FROM tables
    WHERE id = ?
  `).get(id);

  if (!table) {
    throw httpError(404, 'Không tìm thấy bàn.');
  }

  return serializeTable(table, baseUrl);
}

function getTableByToken(token, baseUrl) {
  const normalizedToken = String(token || '').trim();

  if (!normalizedToken) {
    throw httpError(400, 'Invalid table token');
  }

  const table = db.prepare(`
    SELECT id, name, token, status, created_at, updated_at
    FROM tables
    WHERE token = ?
  `).get(normalizedToken);

  if (!table) {
    throw httpError(404, 'Invalid table token');
  }

  return serializeTable(table, baseUrl);
}

function listTables(baseUrl) {
  return db.prepare(`
    SELECT id, name, token, status, created_at, updated_at
    FROM tables
    ORDER BY id ASC
  `).all().map((table) => serializeTable(table, baseUrl));
}

function createTable(input, baseUrl) {
  const name = normalizeTableName(input.name);
  const token = createUniqueToken();

  const result = db.prepare(`
    INSERT INTO tables (name, token, status, updated_at)
    VALUES (?, ?, 'empty', datetime('now'))
  `).run(name, token);

  return getTableById(result.lastInsertRowid, baseUrl);
}

function createTablesBulk(input, baseUrl) {
  const prefix = normalizeTableName(input.prefix || 'Bàn');
  const from = Number(input.from);
  const to = Number(input.to);

  if (!Number.isInteger(from) || !Number.isInteger(to) || from <= 0 || to <= 0 || from > to) {
    throw httpError(400, 'Khoảng số bàn không hợp lệ.');
  }

  if (to - from > 99) {
    throw httpError(400, 'Chỉ tạo tối đa 100 bàn mỗi lần.');
  }

  const width = Math.max(String(from).length, String(to).length, 2);
  const createdIds = [];

  const insert = db.prepare(`
    INSERT INTO tables (name, token, status, updated_at)
    VALUES (?, ?, 'empty', datetime('now'))
  `);

  const createMany = db.transaction(() => {
    for (let value = from; value <= to; value += 1) {
      const result = insert.run(`${prefix} ${String(value).padStart(width, '0')}`, createUniqueToken());
      createdIds.push(result.lastInsertRowid);
    }
  });

  createMany();

  return createdIds.map((id) => getTableById(id, baseUrl));
}

function updateTable(id, input, baseUrl) {
  const name = normalizeTableName(input.name);
  const status = input.status === undefined ? undefined : String(input.status).trim();

  if (status !== undefined && !allowedTableStatuses.has(status)) {
    throw httpError(400, 'Trạng thái bàn không hợp lệ.');
  }

  const result = db.prepare(`
    UPDATE tables
    SET name = ?,
        status = COALESCE(?, status),
        updated_at = datetime('now')
    WHERE id = ?
  `).run(name, status, id);

  if (result.changes === 0) {
    throw httpError(404, 'Không tìm thấy bàn.');
  }

  return getTableById(id, baseUrl);
}

function deleteTable(id) {
  const table = getTableById(id);
  const orderCount = db.prepare(`
    SELECT COUNT(*) AS total
    FROM orders
    WHERE table_id = ? OR table_token = ?
  `).get(id, table.token).total;

  if (orderCount > 0) {
    throw httpError(409, 'Bàn đã có đơn hàng, không thể xoá.');
  }

  db.prepare('DELETE FROM tables WHERE id = ?').run(id);
}

function regenerateTableToken(id, baseUrl) {
  getTableById(id);
  const token = createUniqueToken();

  db.prepare(`
    UPDATE tables
    SET token = ?,
        updated_at = datetime('now')
    WHERE id = ?
  `).run(token, id);

  return getTableById(id, baseUrl);
}

async function getTableQr(id, baseUrl) {
  const table = getTableById(id, baseUrl);
  const url = table.url || tableUrl(table, baseUrl);

  return {
    table_id: table.id,
    name: table.name,
    token: table.token,
    url,
    qrDataUrl: await createQrDataUrl(url)
  };
}

async function getAllTableQr(baseUrl) {
  const tables = listTables(baseUrl);

  return Promise.all(
    tables.map(async (table) => ({
      table_id: table.id,
      name: table.name,
      token: table.token,
      url: table.url,
      qrDataUrl: await createQrDataUrl(table.url)
    }))
  );
}

module.exports = {
  createTable,
  createTablesBulk,
  deleteTable,
  getAllTableQr,
  getTableById,
  getTableByToken,
  getTableQr,
  listTables,
  normalizeId,
  regenerateTableToken,
  updateTable
};
