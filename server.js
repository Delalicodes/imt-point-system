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

const messages = [];

io.on('connection', (socket) => {
  try {
    console.log('Client connected:', socket.id);
    console.log('Total clients connected:', io.engine.clientsCount);
    console.log('Current messages in memory:', messages.length);

    // Send previous messages to newly connected client
    console.log('Sending previous messages to client');
    socket.emit('previousMessages', messages);

    socket.on('message', (message) => {
      try {
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
      } catch (error) {
        console.error('Error handling message:', error);
        socket.emit('error', { message: 'Failed to process message' });
      }
    });

    socket.on('ping', () => {
      console.log('Received ping from client:', socket.id);
      socket.emit('pong');
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      console.log('Remaining clients:', io.engine.clientsCount);
    });
  } catch (error) {
    console.error('Error in connection handler:', error);
  }
});

const PORT = 3001;
httpServer.listen(PORT, () => {
  console.log(`Socket.IO server running at http://localhost:${PORT}`);
});
