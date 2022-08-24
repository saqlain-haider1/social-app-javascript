let io;
// Initiating Server connection
const init = (server) => {
  io = require('socket.io')(server);
  return io;
};

// Function to get instance of IO
const getIO = () => {
  try {
    if (!io) {
      throw new Error('Socket.io not initialized');
    }
    return io;
  } catch (err) {
    console.error(err);
  }
};
module.exports = {
  init,
  getIO,
};
