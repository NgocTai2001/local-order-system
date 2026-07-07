const { db } = require('./connection');

const seedItems = [
  { name: 'Bún bò', price: 45000 },
  { name: 'Phở', price: 40000 },
  { name: 'Cơm tấm', price: 50000 },
  { name: 'Bánh mì', price: 25000 },
  { name: 'Trà đào', price: 30000 },
  { name: 'Coca', price: 15000 },
  { name: 'Pepsi', price: 15000 }
];

function seedMenuItems() {
  const count = db.prepare('SELECT COUNT(*) AS total FROM menu_items').get().total;

  if (count > 0) {
    return;
  }

  const insert = db.prepare(`
    INSERT INTO menu_items (name, price, image, available)
    VALUES (@name, @price, @image, 1)
  `);

  const insertMany = db.transaction((items) => {
    for (const item of items) {
      insert.run({ ...item, image: '' });
    }
  });

  insertMany(seedItems);
}

module.exports = { seedMenuItems };
