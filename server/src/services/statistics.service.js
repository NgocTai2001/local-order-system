const { db } = require('../database');
const { httpError } = require('../utils/httpError');

const allowedTypes = new Set(['day', 'week', 'month']);
const localOffsetMilliseconds = 7 * 60 * 60 * 1000;
const dayMilliseconds = 24 * 60 * 60 * 1000;

function formatDate(date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function localToday() {
  return formatDate(new Date(Date.now() + localOffsetMilliseconds));
}

function parseDate(value, type) {
  let input = String(value || '').trim();

  if (!input) {
    input = localToday();
  }

  if (type === 'month' && /^\d{4}-\d{2}$/.test(input)) {
    input += '-01';
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(input);
  if (!match) {
    throw httpError(400, 'Ngày thống kê không hợp lệ.');
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw httpError(400, 'Ngày thống kê không hợp lệ.');
  }

  return date;
}

function addDays(date, days) {
  return new Date(date.getTime() + days * dayMilliseconds);
}

function toSqlUtc(localDate) {
  return new Date(localDate.getTime() - localOffsetMilliseconds)
    .toISOString()
    .slice(0, 19)
    .replace('T', ' ');
}

function resolvePeriod(typeValue, dateValue) {
  const type = String(typeValue || 'day').toLowerCase();

  if (!allowedTypes.has(type)) {
    throw httpError(400, 'Loại thống kê phải là day, week hoặc month.');
  }

  const selected = parseDate(dateValue, type);
  let start = selected;
  let end;
  let previousStart;

  if (type === 'week') {
    const daysFromMonday = (selected.getUTCDay() + 6) % 7;
    start = addDays(selected, -daysFromMonday);
    end = addDays(start, 7);
    previousStart = addDays(start, -7);
  } else if (type === 'month') {
    start = new Date(Date.UTC(selected.getUTCFullYear(), selected.getUTCMonth(), 1));
    end = new Date(Date.UTC(selected.getUTCFullYear(), selected.getUTCMonth() + 1, 1));
    previousStart = new Date(Date.UTC(selected.getUTCFullYear(), selected.getUTCMonth() - 1, 1));
  } else {
    end = addDays(start, 1);
    previousStart = addDays(start, -1);
  }

  return {
    type,
    selectedDate: formatDate(selected),
    start,
    end,
    previousStart,
    startUtc: toSqlUtc(start),
    endUtc: toSqlUtc(end),
    previousStartUtc: toSqlUtc(previousStart)
  };
}

function getRevenue(startUtc, endUtc) {
  const row = db.prepare(`
    SELECT COALESCE(SUM(COALESCE(
      oi.subtotal,
      COALESCE(NULLIF(oi.unit_price_snapshot, 0), oi.price_snapshot, oi.base_price_snapshot, 0) * oi.quantity
    )), 0) AS total_revenue
    FROM orders o
    JOIN order_items oi ON oi.order_id = o.id
    WHERE o.status = 'paid'
      AND o.updated_at >= ?
      AND o.updated_at < ?
  `).get(startUtc, endUtc);

  return Number(row?.total_revenue || 0);
}

function getTopItems(startUtc, endUtc) {
  return db.prepare(`
    SELECT
      oi.menu_item_id,
      COALESCE(
        MAX(NULLIF(mi.name, '')),
        MAX(NULLIF(oi.name_snapshot, '')),
        'Món đã xoá'
      ) AS name,
      COALESCE(MAX(NULLIF(mi.image, '')), '') AS image,
      SUM(oi.quantity) AS quantity,
      SUM(COALESCE(
        oi.subtotal,
        COALESCE(NULLIF(oi.unit_price_snapshot, 0), oi.price_snapshot, oi.base_price_snapshot, 0) * oi.quantity
      )) AS revenue
    FROM orders o
    JOIN order_items oi ON oi.order_id = o.id
    LEFT JOIN menu_items mi ON mi.id = oi.menu_item_id
    WHERE o.status = 'paid'
      AND o.updated_at >= ?
      AND o.updated_at < ?
    GROUP BY
      oi.menu_item_id,
      CASE WHEN oi.menu_item_id IS NULL THEN COALESCE(oi.name_snapshot, '') ELSE '' END
    ORDER BY quantity DESC, revenue DESC, name COLLATE NOCASE ASC
    LIMIT 10
  `).all(startUtc, endUtc).map((item) => ({
    menu_item_id: item.menu_item_id,
    name: item.name,
    image: item.image || '',
    quantity: Number(item.quantity || 0),
    revenue: Number(item.revenue || 0)
  }));
}

function getStatistics({ type, date } = {}) {
  const period = resolvePeriod(type, date);
  const totalRevenue = getRevenue(period.startUtc, period.endUtc);
  const previousTotalRevenue = getRevenue(period.previousStartUtc, period.startUtc);

  return {
    type: period.type,
    date: period.selectedDate,
    period: {
      start: formatDate(period.start),
      end: formatDate(addDays(period.end, -1))
    },
    totalRevenue,
    previousTotalRevenue,
    topItems: getTopItems(period.startUtc, period.endUtc)
  };
}

module.exports = {
  getStatistics,
  resolvePeriod
};
