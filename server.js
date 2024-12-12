const { createServer } = require('http');
const { Server } = require('socket.io');

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
    allowedHeaders: ["*"]
  }
});

let messages = [];

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Send existing messages to the newly connected client
  socket.emit('previousMessages', messages);

  socket.on('message', (message) => {
    try {
      console.log('Received message:', message);
      
      // Add unique ID and timestamp
      const newMessage = {
        ...message,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date()
      };
      
      // Store message
      messages.push(newMessage);
      
      // Keep only last 100 messages
      if (messages.length > 100) {
        messages.shift();
      }
      
      // Broadcast to all clients including sender
      io.emit('message', newMessage);
      
      console.log('Message broadcast complete');
    } catch (error) {
      console.error('Error handling message:', error);
      socket.emit('error', { message: 'Failed to process message' });
    }
  });

  socket.on('editMessage', (updatedMessage) => {
    try {
      console.log('Edit message request:', updatedMessage);
      
      const index = messages.findIndex(msg => msg.id === updatedMessage.id);
      if (index !== -1) {
        messages[index] = {
          ...updatedMessage,
          isEdited: true,
          timestamp: new Date()
        };
        io.emit('editMessage', messages[index]);
        console.log('Message edit broadcast complete');
      }
    } catch (error) {
      console.error('Error editing message:', error);
      socket.emit('error', { message: 'Failed to edit message' });
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = 3001;
httpServer.listen(PORT, () => {
  console.log(`Socket.IO server running at http://localhost:${PORT}`);
});
