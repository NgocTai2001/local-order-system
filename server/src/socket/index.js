const { Server } = require('socket.io');

let io;

function configureSocket(server) {
  io = new Server(server, {
    path: '/socket.io',
    transports: ['websocket', 'polling']
  });

  io.on('connection', (socket) => {
    socket.emit('socket:ready', { ok: true });
  });

  return io;
}

function emitOrderCreated(order) {
  if (io) {
    io.emit('order:new', order);
  }
}

function emitOrderUpdated(order) {
  if (io) {
    io.emit('order:updated', order);
  }
}

module.exports = {
  configureSocket,
  emitOrderCreated,
  emitOrderUpdated
};
