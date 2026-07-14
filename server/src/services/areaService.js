const { db } = require('../database');
const { httpError } = require('../utils/httpError');

function normalizeId(value) {
  const id = Number(value);

  if (!Number.isInteger(id) || id <= 0) {
    throw httpError(400, 'Khu vực không hợp lệ.');
  }

  return id;
}

function normalizeName(value) {
  const name = String(value || '').trim();

  if (!name) {
    throw httpError(400, 'Tên khu vực không được để trống.');
  }

  if (name.length > 80) {
    throw httpError(400, 'Tên khu vực quá dài.');
  }

  return name;
}

function normalizeDescription(value) {
  const description = String(value || '').trim();

  if (description.length > 240) {
    throw httpError(400, 'Mô tả khu vực quá dài.');
  }

  return description;
}

function serializeArea(area) {
  return {
    id: area.id,
    name: area.name,
    description: area.description || '',
    sort_order: area.sort_order || 0,
    is_active: Boolean(area.is_active),
    table_count: area.table_count || 0,
    created_at: area.created_at,
    updated_at: area.updated_at
  };
}

function getAreaById(id) {
  const area = db.prepare(`
    SELECT
      a.id,
      a.name,
      a.description,
      a.sort_order,
      a.is_active,
      a.created_at,
      a.updated_at,
      COUNT(t.id) AS table_count
    FROM areas a
    LEFT JOIN tables t ON t.area_id = a.id
    WHERE a.id = ?
    GROUP BY a.id
  `).get(id);

  if (!area) {
    throw httpError(404, 'Không tìm thấy khu vực.');
  }

  return serializeArea(area);
}

function listAreas() {
  return db.prepare(`
    SELECT
      a.id,
      a.name,
      a.description,
      a.sort_order,
      a.is_active,
      a.created_at,
      a.updated_at,
      COUNT(t.id) AS table_count
    FROM areas a
    LEFT JOIN tables t ON t.area_id = a.id
    GROUP BY a.id
    ORDER BY a.sort_order ASC, a.id ASC
  `).all().map(serializeArea);
}

function createArea(input) {
  const name = normalizeName(input.name);
  const description = normalizeDescription(input.description);
  const sortOrder = Number.isInteger(Number(input.sort_order))
    ? Number(input.sort_order)
    : (db.prepare('SELECT COALESCE(MAX(sort_order), 0) + 1 AS next FROM areas').get().next);
  const isActive = input.is_active === undefined ? 1 : Number(Boolean(input.is_active));

  const result = db.prepare(`
    INSERT INTO areas (name, description, sort_order, is_active, updated_at)
    VALUES (?, ?, ?, ?, datetime('now'))
  `).run(name, description, sortOrder, isActive);

  return getAreaById(result.lastInsertRowid);
}

function updateArea(id, input) {
  const current = getAreaById(id);
  const name = normalizeName(input.name ?? current.name);
  const description = normalizeDescription(input.description ?? current.description);
  const sortOrder = Number.isInteger(Number(input.sort_order))
    ? Number(input.sort_order)
    : current.sort_order;
  const isActive = input.is_active === undefined
    ? Number(current.is_active)
    : Number(Boolean(input.is_active));

  db.prepare(`
    UPDATE areas
    SET name = ?, description = ?, sort_order = ?, is_active = ?, updated_at = datetime('now')
    WHERE id = ?
  `).run(name, description, sortOrder, isActive, id);

  return getAreaById(id);
}

function deleteArea(id) {
  const area = getAreaById(id);

  if (area.table_count > 0) {
    throw httpError(409, 'Hãy chuyển các bàn sang khu vực khác trước khi xoá.');
  }

  const total = db.prepare('SELECT COUNT(*) AS total FROM areas').get().total;
  if (total <= 1) {
    throw httpError(409, 'Hệ thống cần ít nhất một khu vực.');
  }

  db.prepare('DELETE FROM areas WHERE id = ?').run(id);
}

module.exports = {
  createArea,
  deleteArea,
  getAreaById,
  listAreas,
  normalizeId,
  updateArea
};
