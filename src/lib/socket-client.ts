import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

export const connectSocket = () => {
  if (!socket) {
    console.log('Creating new socket connection...')
    socket = io('http://localhost:3001', {
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 60000, // Increased timeout to 60 seconds
      transports: ['websocket', 'polling'] // Try WebSocket first, fallback to polling
    })

    socket.on('connect', () => {
      console.log('Socket connected successfully with ID:', socket?.id)
    })

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message)
      // Try to reconnect on error
      setTimeout(() => {
        if (socket) {
          socket.connect()
        }
      }, 1000)
    })

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason)
      if (reason === 'io server disconnect') {
        // If the server disconnected us, try to reconnect
        setTimeout(() => {
          if (socket) {
            socket.connect()
          }
        }, 1000)
      }
    })

    socket.on('error', (error: Error) => {
      console.error('Socket error:', error.message)
    })

    // Add ping/pong for connection health check
    const pingInterval = setInterval(() => {
      if (socket?.connected) {
        console.log('Sending ping to server...')
        socket.emit('ping')
      }
    }, 20000) // Send ping every 20 seconds

    socket.on('pong', () => {
      console.log('Received pong from server')
    })

    // Clean up interval on disconnect
    socket.on('disconnect', () => {
      clearInterval(pingInterval)
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

export const getSocket = () => socket
