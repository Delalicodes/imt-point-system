import { Server as NetServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import { NextApiResponse } from 'next'

export type NextApiResponseServerIO = NextApiResponse & {
  socket: {
    server: NetServer & {
      io: SocketIOServer
    }
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}

let io: SocketIOServer | null = null
const messages: any[] = []

export function getIO() {
  if (!io) {
    throw new Error('Socket.io not initialized')
  }
  return io
}

export function initSocket(server: NetServer) {
  if (io) {
    console.log('Socket.io already initialized')
    return io
  }

  console.log('Initializing Socket.io...')
  io = new SocketIOServer(server, {
    path: '/api/socket/io',
    addTrailingSlash: false,
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  })

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id)

    // Send previous messages to newly connected client
    socket.emit('previousMessages', messages)

    socket.on('message', (message) => {
      console.log('Received message:', message)
      const newMessage = {
        ...message,
        id: Date.now().toString(),
        timestamp: new Date(),
        senderName: message.senderName || message.sender,
        profileImage: message.profileImage || `/api/avatar/${message.senderId}`,
        isAdmin: message.isAdmin || false
      }
      messages.push(newMessage)
      // Broadcast the message to all clients
      io.emit('message', newMessage)
      console.log('Message broadcasted:', newMessage)
    })

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id)
    })
  })

  return io
}

export function cleanupSocket() {
  if (io) {
    io.close()
    io = null
  }
}
