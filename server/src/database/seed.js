const { db } = require('./connection');
const { generateToken } = require('../utils/token');

const seedItems = [
  { name: 'Bún bò', category: 'food', price: 45000 },
  { name: 'Phở bò', category: 'food', price: 50000 },
  { name: 'Cơm tấm', category: 'food', price: 40000 },
  { name: 'Bánh mì', category: 'food', price: 25000 },
  { name: 'Trà đào', category: 'drink', price: 30000 },
  { name: 'Coca', category: 'drink', price: 15000 },
  { name: 'Pepsi', category: 'drink', price: 15000 }
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
    INSERT INTO menu_items (name, category, price, image, available)
    VALUES (@name, @category, @price, @image, 1)
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
