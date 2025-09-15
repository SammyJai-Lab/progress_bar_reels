// Socket.IO setup for Vercel
function setupSocket(io) {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
    
    // Add your custom socket events here
    socket.on('message', (data) => {
      console.log('Message received:', data);
      io.emit('message', data);
    });
  });
}

module.exports = { setupSocket };