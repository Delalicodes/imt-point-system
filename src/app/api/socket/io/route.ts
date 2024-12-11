import { Server as NetServer } from 'http'
import { Server as ServerIO } from 'socket.io'
import { NextApiResponse } from 'next'
import { NextRequest } from 'next/server'

interface Message {
  id: string
  content: string
  senderId: string
  senderName: string
  isAdmin: boolean
  timestamp: Date
  profileImage?: string
}

// Store messages in memory for now
const messages: Message[] = []

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest, res: NextApiResponse) {
  if (!res?.socket?.server?.io) {
    const path = '/api/socket/io'
    const httpServer: NetServer = res?.socket?.server as any
    
    const io = new ServerIO(httpServer, {
      path: path,
      addTrailingSlash: false,
      cors: {
        origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
        methods: ["GET", "POST"],
        allowedHeaders: ["*"],
        credentials: true
      }
    })

    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id)

      // Send previous messages to newly connected client
      socket.emit('previousMessages', messages)

      socket.on('message', (message: Omit<Message, 'id'>) => {
        console.log('Received message:', message)
        
        const newMessage = {
          ...message,
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date()
        }
        
        // Store the message
        messages.push(newMessage)
        
        // Keep only last 100 messages
        if (messages.length > 100) {
          messages.shift()
        }
        
        // Broadcast to all clients
        io.emit('message', newMessage)
      })

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id)
      })
    })

    res.socket.server.io = io
  }

  return new Response('Socket is running', {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST',
      'Access-Control-Allow-Headers': '*',
      'Content-Type': 'text/plain',
    }
  })
}
