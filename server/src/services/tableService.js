const { db } = require('../database');
const { createQrDataUrl } = require('./qrService');
const { httpError } = require('../utils/httpError');
const { generateToken } = require('../utils/token');

const allowedTableStatuses = new Set(['available', 'in_use', 'reserved', 'maintenance']);
const allowedTableShapes = new Set(['rectangle', 'circle', 'oval', 'diamond', 'hexagon']);
const defaultWifiConfig = {
  ssid: 'TABLEFLOW_ORDER',
  password: 'order1234',
  security: 'WPA'
};

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

function normalizeNumber(value, label, { min, max, fallback, integer = false }) {
  const number = value === undefined || value === null || value === '' ? fallback : Number(value);

  if (!Number.isFinite(number) || (integer && !Number.isInteger(number)) || number < min || number > max) {
    throw httpError(400, `${label} không hợp lệ.`);
  }

  return number;
}

function normalizeShape(value, fallback = 'rectangle') {
  const shape = String(value || fallback).trim();

  if (!allowedTableShapes.has(shape)) {
    throw httpError(400, 'Hình dạng bàn không hợp lệ.');
  }

  return shape;
}

function normalizeStatus(value, fallback = 'available') {
  const status = String(value || fallback).trim();

  if (!allowedTableStatuses.has(status)) {
    throw httpError(400, 'Trạng thái bàn không hợp lệ.');
  }

  return status;
}

function getArea(areaId) {
  const id = normalizeId(areaId, 'Khu vực');
  const area = db.prepare('SELECT id, name, is_active FROM areas WHERE id = ?').get(id);

  if (!area) {
    throw httpError(400, 'Khu vực không tồn tại.');
  }

  return area;
}

function getDefaultArea() {
  const area = db.prepare(`
    SELECT id, name, is_active
    FROM areas
    WHERE is_active = 1
    ORDER BY sort_order ASC, id ASC
    LIMIT 1
  `).get() || db.prepare('SELECT id, name, is_active FROM areas ORDER BY sort_order ASC, id ASC LIMIT 1').get();

  if (!area) {
    throw httpError(409, 'Hãy tạo khu vực trước khi tạo bàn.');
  }

  return area;
}

function tableUrl(table, baseUrl) {
  return `${baseUrl.replace(/\/+$/, '')}/t/${encodeURIComponent(table.token)}`;
}

function normalizeWifiSecurity(value) {
  const security = String(value || defaultWifiConfig.security).trim();

  if (security.toLowerCase() === 'nopass') {
    return 'nopass';
  }

  return security.toUpperCase() || defaultWifiConfig.security;
}

function escapeWifiQrValue(value) {
  return String(value).replace(/([\\;,":])/g, '\\$1');
}

function getWifiConfig() {
  return {
    ssid: String(process.env.WIFI_SSID || defaultWifiConfig.ssid).trim() || defaultWifiConfig.ssid,
    password: String(process.env.WIFI_PASSWORD || defaultWifiConfig.password),
    security: normalizeWifiSecurity(process.env.WIFI_SECURITY)
  };
}

function createWifiQrText(config) {
  const ssid = escapeWifiQrValue(config.ssid);

  if (config.security === 'nopass') {
    return `WIFI:T:nopass;S:${ssid};;`;
  }

  return `WIFI:T:${config.security};S:${ssid};P:${escapeWifiQrValue(config.password)};;`;
}

async function createWifiQr() {
  const config = getWifiConfig();
  const qrText = createWifiQrText(config);

  return {
    ssid: config.ssid,
    security: config.security,
    qrText,
    qrDataUrl: await createQrDataUrl(qrText)
  };
}

async function createTableQr(table, baseUrl, wifiQr) {
  const url = table.url || tableUrl(table, baseUrl);
  const orderQrDataUrl = await createQrDataUrl(url);

  return {
    table_id: table.id,
    name: table.name,
    token: table.token,
    url,
    qrDataUrl: orderQrDataUrl,
    wifi: wifiQr,
    order: {
      url,
      qrText: url,
      qrDataUrl: orderQrDataUrl
    }
  };
}

function serializeTable(table, baseUrl) {
  const output = {
    id: table.id,
    area_id: table.area_id,
    area_name: table.area_name || '',
    name: table.name,
    shape: table.shape || 'rectangle',
    capacity: table.capacity || 1,
    pos_x: Number(table.pos_x || 0),
    pos_y: Number(table.pos_y || 0),
    width: Number(table.width || 18),
    height: Number(table.height || 15),
    token: table.token,
    status: table.status,
    sort_order: table.sort_order || 0,
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
    SELECT t.*, a.name AS area_name
    FROM tables t
    LEFT JOIN areas a ON a.id = t.area_id
    WHERE t.id = ?
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
    SELECT t.*, a.name AS area_name
    FROM tables t
    LEFT JOIN areas a ON a.id = t.area_id
    WHERE t.token = ?
  `).get(normalizedToken);

  if (!table) {
    throw httpError(404, 'Invalid table token');
  }

  return serializeTable(table, baseUrl);
}

function listTables(baseUrl, filters = {}) {
  const areaId = filters.area_id === undefined || filters.area_id === ''
    ? null
    : normalizeId(filters.area_id, 'Khu vực');
  const rows = areaId === null
    ? db.prepare(`
      SELECT t.*, a.name AS area_name
      FROM tables t
      LEFT JOIN areas a ON a.id = t.area_id
      ORDER BY a.sort_order ASC, t.sort_order ASC, t.id ASC
    `).all()
    : db.prepare(`
      SELECT t.*, a.name AS area_name
      FROM tables t
      LEFT JOIN areas a ON a.id = t.area_id
      WHERE t.area_id = ?
      ORDER BY t.sort_order ASC, t.id ASC
    `).all(areaId);

  return rows.map((table) => serializeTable(table, baseUrl));
}

function createTable(input, baseUrl) {
  const name = normalizeTableName(input.name);
  const area = input.area_id ? getArea(input.area_id) : getDefaultArea();
  const shape = normalizeShape(input.shape);
  const capacity = normalizeNumber(input.capacity, 'Sức chứa', { min: 1, max: 99, fallback: 4, integer: true });
  const posX = normalizeNumber(input.pos_x, 'Vị trí ngang', { min: 0, max: 100, fallback: 4 });
  const posY = normalizeNumber(input.pos_y, 'Vị trí dọc', { min: 0, max: 100, fallback: 6 });
  const width = normalizeNumber(input.width, 'Chiều rộng', { min: 6, max: 50, fallback: shape === 'circle' ? 14 : 18 });
  const height = normalizeNumber(input.height, 'Chiều cao', { min: 6, max: 50, fallback: shape === 'circle' ? 18 : 15 });
  const status = normalizeStatus(input.status);
  const sortOrder = normalizeNumber(input.sort_order, 'Thứ tự', {
    min: -9999,
    max: 99999,
    fallback: db.prepare('SELECT COALESCE(MAX(sort_order), 0) + 1 AS next FROM tables WHERE area_id = ?').get(area.id).next,
    integer: true
  });
  const token = createUniqueToken();

  const result = db.prepare(`
    INSERT INTO tables (
      area_id, name, shape, capacity, pos_x, pos_y, width, height,
      token, status, sort_order, updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `).run(area.id, name, shape, capacity, posX, posY, width, height, token, status, sortOrder);

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
  const area = input.area_id ? getArea(input.area_id) : getDefaultArea();
  const currentCount = db.prepare('SELECT COUNT(*) AS total FROM tables WHERE area_id = ?').get(area.id).total;
  const createdIds = [];

  const insert = db.prepare(`
    INSERT INTO tables (
      area_id, name, shape, capacity, pos_x, pos_y, width, height,
      token, status, sort_order, updated_at
    )
    VALUES (?, ?, 'rectangle', 4, ?, ?, 18, 15, ?, 'available', ?, datetime('now'))
  `);

  const createMany = db.transaction(() => {
    for (let value = from; value <= to; value += 1) {
      const index = currentCount + createdIds.length;
      const result = insert.run(
        area.id,
        `${prefix} ${String(value).padStart(width, '0')}`,
        4 + (index % 4) * 24,
        6 + Math.floor(index / 4) * 21,
        createUniqueToken(),
        index + 1
      );
      createdIds.push(result.lastInsertRowid);
    }
  });

  createMany();

  return createdIds.map((id) => getTableById(id, baseUrl));
}

function updateTable(id, input, baseUrl) {
  const current = getTableById(id);
  const name = normalizeTableName(input.name ?? current.name);
  const area = getArea(input.area_id ?? current.area_id);
  const shape = normalizeShape(input.shape, current.shape);
  const capacity = normalizeNumber(input.capacity, 'Sức chứa', { min: 1, max: 99, fallback: current.capacity, integer: true });
  const posX = normalizeNumber(input.pos_x, 'Vị trí ngang', { min: 0, max: 100, fallback: current.pos_x });
  const posY = normalizeNumber(input.pos_y, 'Vị trí dọc', { min: 0, max: 100, fallback: current.pos_y });
  const width = normalizeNumber(input.width, 'Chiều rộng', { min: 6, max: 50, fallback: current.width });
  const height = normalizeNumber(input.height, 'Chiều cao', { min: 6, max: 50, fallback: current.height });
  const status = normalizeStatus(input.status, current.status);
  const sortOrder = normalizeNumber(input.sort_order, 'Thứ tự', {
    min: -9999,
    max: 99999,
    fallback: current.sort_order,
    integer: true
  });

  if (status !== 'in_use') {
    const openSession = db.prepare(`
      SELECT id FROM table_sessions WHERE table_id = ? AND status = 'open' LIMIT 1
    `).get(id);
    if (openSession) {
      throw httpError(409, 'Bàn đang có bill mở, không thể đổi trạng thái này.');
    }
  }

  const result = db.prepare(`
    UPDATE tables
    SET area_id = ?,
        name = ?,
        shape = ?,
        capacity = ?,
        pos_x = ?,
        pos_y = ?,
        width = ?,
        height = ?,
        status = ?,
        sort_order = ?,
        updated_at = datetime('now')
    WHERE id = ?
  `).run(area.id, name, shape, capacity, posX, posY, width, height, status, sortOrder, id);

  if (result.changes === 0) {
    throw httpError(404, 'Không tìm thấy bàn.');
  }

  return getTableById(id, baseUrl);
}

function updateTablePositions(input, baseUrl) {
  const positions = Array.isArray(input) ? input : input.positions;

  if (!Array.isArray(positions) || positions.length === 0 || positions.length > 200) {
    throw httpError(400, 'Danh sách vị trí bàn không hợp lệ.');
  }

  const update = db.prepare(`
    UPDATE tables
    SET pos_x = ?, pos_y = ?, updated_at = datetime('now')
    WHERE id = ?
  `);
  const ids = [];
  const save = db.transaction(() => {
    for (const position of positions) {
      const id = normalizeId(position.id);
      const posX = normalizeNumber(position.pos_x, 'Vị trí ngang', { min: 0, max: 100, fallback: 0 });
      const posY = normalizeNumber(position.pos_y, 'Vị trí dọc', { min: 0, max: 100, fallback: 0 });
      const result = update.run(posX, posY, id);

      if (result.changes === 0) {
        throw httpError(404, `Không tìm thấy bàn #${id}.`);
      }
      ids.push(id);
    }
  });

  save();
  return ids.map((id) => getTableById(id, baseUrl));
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
  const wifiQr = await createWifiQr();

  return createTableQr(table, baseUrl, wifiQr);
}

async function getAllTableQr(baseUrl) {
  const tables = listTables(baseUrl);
  const wifiQr = await createWifiQr();
  const output = [];

  for (const table of tables) {
    output.push(await createTableQr(table, baseUrl, wifiQr));
  }

  return output;
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
  updateTable,
  updateTablePositions
};
