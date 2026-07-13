const { db } = require('./connection');
const { generateToken } = require('../utils/token');

const seedItems = [
  { name: 'Bún bò', category: 'food', description: 'Nước dùng đậm vị, bò mềm, rau thơm.', price: 45000, sort_order: 1 },
  { name: 'Phở bò', category: 'food', description: 'Phở bò nóng với bánh phở mềm và nước dùng trong.', price: 50000, sort_order: 2 },
  { name: 'Cơm tấm', category: 'food', description: 'Cơm tấm sườn, đồ chua và nước mắm.', price: 40000, sort_order: 3 },
  { name: 'Bánh mì', category: 'food', description: 'Bánh mì giòn, nhân đầy đặn.', price: 25000, sort_order: 4 },
  { name: 'Trà đào', category: 'drink', description: 'Trà đào mát, vị ngọt thanh.', price: 30000, sort_order: 1 },
  { name: 'Coca', category: 'drink', description: 'Nước ngọt có gas.', price: 15000, sort_order: 2 },
  { name: 'Pepsi', category: 'drink', description: 'Nước ngọt có gas.', price: 15000, sort_order: 3 }
];

const seedOptionGroups = [
  {
    name: 'Size',
    description: 'Chọn kích thước',
    selection_type: 'single',
    is_required: 1,
    min_select: 1,
    max_select: 1,
    sort_order: 1,
    values: [
      { name: 'M', price_adjustment: 0, is_default: 1, sort_order: 1 },
      { name: 'L', price_adjustment: 10000, is_default: 0, sort_order: 2 },
      { name: 'XL', price_adjustment: 20000, is_default: 0, sort_order: 3 }
    ]
  },
  {
    name: 'Đường',
    description: 'Chọn mức đường',
    selection_type: 'single',
    is_required: 1,
    min_select: 1,
    max_select: 1,
    sort_order: 2,
    values: [
      { name: '0%', price_adjustment: 0, is_default: 0, sort_order: 1 },
      { name: '25%', price_adjustment: 0, is_default: 0, sort_order: 2 },
      { name: '50%', price_adjustment: 0, is_default: 0, sort_order: 3 },
      { name: '75%', price_adjustment: 0, is_default: 0, sort_order: 4 },
      { name: '100%', price_adjustment: 0, is_default: 1, sort_order: 5 }
    ]
  },
  {
    name: 'Đá',
    description: 'Chọn mức đá',
    selection_type: 'single',
    is_required: 1,
    min_select: 1,
    max_select: 1,
    sort_order: 3,
    values: [
      { name: 'Không đá', price_adjustment: 0, is_default: 0, sort_order: 1 },
      { name: 'Ít đá', price_adjustment: 0, is_default: 0, sort_order: 2 },
      { name: 'Đá bình thường', price_adjustment: 0, is_default: 1, sort_order: 3 },
      { name: 'Nhiều đá', price_adjustment: 0, is_default: 0, sort_order: 4 }
    ]
  },
  {
    name: 'Topping',
    description: 'Chọn topping thêm',
    selection_type: 'multiple',
    is_required: 0,
    min_select: 0,
    max_select: 5,
    sort_order: 4,
    values: [
      { name: 'Trân châu', price_adjustment: 5000, is_default: 0, sort_order: 1 },
      { name: 'Thạch', price_adjustment: 5000, is_default: 0, sort_order: 2 },
      { name: 'Kem cheese', price_adjustment: 10000, is_default: 0, sort_order: 3 }
    ]
  }
];

function createUniqueTableToken() {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const token = generateToken();
    const existing = db.prepare('SELECT id FROM tables WHERE token = ?').get(token);

    if (!existing) {
      return token;
    }
  }

  throw new Error('Không thể tạo token bàn duy nhất.');
}

function seedMenuItems() {
  const count = db.prepare('SELECT COUNT(*) AS total FROM menu_items').get().total;

  if (count > 0) {
    return;
  }

  const insert = db.prepare(`
    INSERT INTO menu_items (name, category, description, price, image, available, featured, sort_order)
    VALUES (@name, @category, @description, @price, @image, 1, 0, @sort_order)
  `);

  const insertMany = db.transaction((items) => {
    for (const item of items) {
      insert.run({ ...item, image: '' });
    }
  });

  insertMany(seedItems);
}

function seedTables() {
  const count = db.prepare('SELECT COUNT(*) AS total FROM tables').get().total;

  if (count > 0) {
    return;
  }

  const insert = db.prepare(`
    INSERT INTO tables (name, token, status)
    VALUES (@name, @token, 'empty')
  `);

  const insertMany = db.transaction(() => {
    for (let index = 1; index <= 10; index += 1) {
      insert.run({
        name: `Bàn ${String(index).padStart(2, '0')}`,
        token: createUniqueTableToken()
      });
    }
  });

  insertMany();
}

function seedOptions() {
  const count = db.prepare('SELECT COUNT(*) AS total FROM option_groups').get().total;

  if (count > 0) {
    return;
  }

  const insertGroup = db.prepare(`
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
      1,
      datetime('now')
    )
  `);
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
      1,
      datetime('now')
    )
  `);

  const insertMany = db.transaction(() => {
    for (const group of seedOptionGroups) {
      const result = insertGroup.run(group);
      for (const value of group.values) {
        insertValue.run({
          ...value,
          option_group_id: result.lastInsertRowid
        });
      }
    }
  });

  insertMany();
}

module.exports = { seedMenuItems, seedOptions, seedTables };
