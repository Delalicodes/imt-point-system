import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

export const connectSocket = () => {
  if (!socket) {
    console.log('Creating new socket connection...')
    socket = io('http://localhost:3001', {
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
    })

    socket.on('connect', () => {
      console.log('Socket connected successfully with ID:', socket?.id)
    })

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message)
    })

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason)
    })

    socket.on('error', (error: Error) => {
      console.error('Socket error:', error.message)
    })

    // Add ping/pong for connection health check
    setInterval(() => {
      if (socket?.connected) {
        socket.emit('ping')
      }
    }, 5000)

    socket.on('pong', () => {
      console.log('Received pong from server')
    })
  } else {
    console.log('Using existing socket connection:', socket.id)
  }
  return socket
}

export const disconnectSocket = () => {
  if (socket) {
    console.log('Disconnecting socket:', socket.id)
    socket.disconnect()
    socket = null
  }
}

export const getSocket = () => {
  if (!socket) {
    throw new Error('Socket not initialized. Call connectSocket first.')
  }
  return socket
}
