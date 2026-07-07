require('dotenv').config();

const http = require('http');

const { createApp } = require('./app');
const { closeDatabase, initDatabase } = require('./database');
const { configureSocket } = require('./socket');

const port = Number(process.env.PORT || 3000);

initDatabase();

const app = createApp();
const server = http.createServer(app);

configureSocket(server);

server.listen(port, () => {
  console.log(`TableFlow API is running on port ${port}`);
});

function shutdown(signal) {
  console.log(`${signal} received, shutting down...`);
  server.close(() => {
    closeDatabase();
    process.exit(0);
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
