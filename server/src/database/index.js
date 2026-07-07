const { db, databasePath } = require('./connection');
const { runMigrations } = require('./migrate');
const { seedMenuItems, seedTables } = require('./seed');

function initDatabase() {
  runMigrations();
  seedTables();
  seedMenuItems();
  console.log(`SQLite database ready at ${databasePath}`);
}

function closeDatabase() {
  db.close();
}

module.exports = {
  closeDatabase,
  db,
  initDatabase
};
