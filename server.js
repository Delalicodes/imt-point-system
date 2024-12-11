const { createServer } = require('http');
const { Server } = require('socket.io');
const { parse } = require('url');

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

const messages = [];

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  console.log('Current messages in memory:', messages.length);

  // Send previous messages to newly connected client
  console.log('Sending previous messages to client');
  socket.emit('previousMessages', messages);

  socket.on('message', (message) => {
    console.log('Received message from client:', message);
    
    const newMessage = {
      ...message,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    };
    
    console.log('Created new message with ID:', newMessage.id);
    
    // Store the message
    messages.push(newMessage);
    console.log('Total messages in memory:', messages.length);
    
    // Keep only last 100 messages
    if (messages.length > 100) {
      messages.shift();
      console.log('Removed oldest message, new total:', messages.length);
    }
    
    // Broadcast to all clients
    console.log('Broadcasting message to all clients');
    io.emit('message', newMessage);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = 3001;
httpServer.listen(PORT, () => {
  console.log(`Socket.IO server running at http://localhost:${PORT}`);
});
