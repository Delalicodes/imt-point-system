import { Server } from 'socket.io'
import { NextApiResponseServerIO } from '@/types/socket'
import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { getIO } from '@/lib/socket'

const users = new Map()

// Remove any existing socket server instance
if (global.io) {
  console.log('Cleaning up existing Socket.IO server...')
  global.io.close()
  delete global.io
}

// Create new socket server instance
const io = new Server({
  path: '/api/socket/io',
  addTrailingSlash: false,
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  connectionStateRecovery: {
    maxDisconnectionDuration: 2 * 60 * 1000,
  },
})

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id)

  socket.on('join-room', (username) => {
    console.log(`${socket.id} joined room: ${username}`)
    users.set(socket.id, username)
    socket.join(username)
    socket.emit('room-joined', { room: username })
  })

  socket.on('leave-room', (username) => {
    console.log(`${socket.id} left room: ${username}`)
    socket.leave(username)
    users.delete(socket.id)
  })

  socket.on('message', ({ content, sender, recipient }) => {
    console.log(`Message from ${sender} to ${recipient}:`, content)
    const messageData = {
      content,
      sender,
      timestamp: new Date(),
    }

    // Send to recipient
    socket.to(recipient).emit('message', messageData)
    // Send back to sender
    socket.emit('message', messageData)
  })

  socket.on('disconnect', () => {
    const username = users.get(socket.id)
    if (username) {
      socket.leave(username)
      users.delete(socket.id)
    }
    console.log('Client disconnected:', socket.id)
  })

  socket.on('error', (error) => {
    console.error('Socket error:', error)
    socket.emit('error', { message: 'An error occurred' })
  })
})

// Store the io instance globally
global.io = io

export async function GET(req: Request) {
  try {
    const io = getIO()
    const headersList = headers()
    const origin = headersList.get('origin') || '*'

    return new NextResponse('Socket server is running', {
      headers: {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'GET, POST',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Credentials': 'true',
      },
    })
  } catch (error) {
    console.error('Socket.IO error:', error)
    return new NextResponse('Socket server not initialized', { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
