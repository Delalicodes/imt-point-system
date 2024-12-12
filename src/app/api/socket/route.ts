import { Server } from 'socket.io'
import { NextResponse } from 'next/server'
import type { NextApiRequest } from 'next'
import { Server as NetServer } from 'http'

// Create HTTP server
const httpServer = new NetServer()

// Create Socket.IO server
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
})

// Store messages in memory (you might want to use a database in production)
const messages: any[] = []

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id)

  // Send existing messages to the newly connected client
  socket.emit('previousMessages', messages)

  socket.on('message', (data) => {
    console.log('Received message:', data)
    
    // Add unique ID to message if not present
    const messageWithId = {
      ...data,
      id: data.id || Math.random().toString(36).substr(2, 9),
      timestamp: data.timestamp || new Date()
    }
    
    // Store the message
    messages.push(messageWithId)
    
    // Broadcast the message to all connected clients
    io.emit('message', messageWithId)
  })

  socket.on('editMessage', (data) => {
    const index = messages.findIndex(m => m.id === data.id)
    if (index !== -1) {
      messages[index] = { ...messages[index], ...data, isEdited: true }
      io.emit('editMessage', messages[index])
    }
  })

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id)
  })

  // Handle ping/pong for connection health check
  socket.on('ping', () => {
    socket.emit('pong')
  })
})

const port = 3001
httpServer.listen(port)
console.log(`Socket.IO server running on port ${port}`)

export async function GET(req: NextApiRequest) {
  return NextResponse.json({ status: 'Socket server running' })
}

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
