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

module.exports = { seedMenuItems, seedTables };
