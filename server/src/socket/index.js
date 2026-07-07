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

function emitOrderStatusChanged(order) {
  if (io) {
    io.emit('order:status_changed', {
      order_id: order.id,
      id: order.id,
      status: order.status,
      table_id: order.table_id,
      table_name: order.table_name
    });
  }
}

module.exports = {
  configureSocket,
  emitOrderCreated,
  emitOrderStatusChanged,
  emitOrderUpdated
};
