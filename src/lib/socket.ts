import { Server as NetServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import { NextApiResponse } from 'next'
import { Server } from 'socket.io'

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
  io = new Server(server, {
    path: '/api/socket/io',
    addTrailingSlash: false,
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
  })

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id)

    socket.on('join-room', (username) => {
      console.log(`${socket.id} joining room:`, username)
      socket.join(username)
      socket.emit('room-joined', { room: username })
    })

    socket.on('leave-room', (username) => {
      console.log(`${socket.id} leaving room:`, username)
      socket.leave(username)
    })

    socket.on('message', ({ content, sender, recipient }) => {
      console.log(`Message from ${sender} to ${recipient}:`, content)
      const messageData = {
        content,
        sender,
        timestamp: new Date(),
      }
      socket.to(recipient).emit('message', messageData)
      socket.emit('message', messageData)
    })

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id)
    })

    socket.on('error', (error) => {
      console.error('Socket error:', error)
      socket.emit('error', { message: 'An error occurred' })
    })
  })

  return io
}

export function cleanupSocket() {
  if (io) {
    console.log('Cleaning up Socket.io...')
    io.close()
    io = null
  }
}
