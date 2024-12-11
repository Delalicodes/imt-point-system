"use client"

import { useState, useEffect, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'

interface Message {
  content: string
  sender: string
  senderName: string
  profileImage?: string
  timestamp: Date
}

export function useChat(recipientUsername: string) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isJoined, setIsJoined] = useState(false)

  useEffect(() => {
    const socketUrl = `${process.env.NEXT_PUBLIC_SITE_URL}:${process.env.NEXT_PUBLIC_SOCKET_PORT}`
    console.log('Connecting to socket server at:', socketUrl)
    
    const newSocket = io(socketUrl, {
      path: '/api/socket/io',
      addTrailingSlash: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000,
      transports: ['websocket', 'polling'],
    })

    function handleConnect() {
      console.log('Connected to socket server')
      setIsConnected(true)
      setError(null)
      
      if (recipientUsername) {
        console.log('Joining room:', recipientUsername)
        newSocket.emit('join-room', recipientUsername)
      }
    }

    function handleDisconnect() {
      console.log('Disconnected from socket server')
      setIsConnected(false)
      setIsJoined(false)
    }

    function handleConnectError(err: Error) {
      console.error('Connection error:', err)
      setError('Connection error. Please try again.')
      setIsConnected(false)
      setIsJoined(false)
    }

    function handleMessage(message: Message) {
      console.log('Received message:', message)
      setMessages(prev => [...prev, {
        ...message,
        timestamp: new Date(message.timestamp)
      }])
    }

    function handleRoomJoined({ room }: { room: string }) {
      console.log('Joined room:', room)
      setIsJoined(true)
      setError(null)
    }

    function handleError({ message }: { message: string }) {
      console.error('Socket error:', message)
      setError(message)
    }

    newSocket.on('connect', handleConnect)
    newSocket.on('disconnect', handleDisconnect)
    newSocket.on('connect_error', handleConnectError)
    newSocket.on('message', handleMessage)
    newSocket.on('room-joined', handleRoomJoined)
    newSocket.on('error', handleError)

    setSocket(newSocket)

    return () => {
      console.log('Cleaning up socket connection...')
      if (recipientUsername) {
        newSocket.emit('leave-room', recipientUsername)
      }
      newSocket.off('connect', handleConnect)
      newSocket.off('disconnect', handleDisconnect)
      newSocket.off('connect_error', handleConnectError)
      newSocket.off('message', handleMessage)
      newSocket.off('room-joined', handleRoomJoined)
      newSocket.off('error', handleError)
      newSocket.close()
    }
  }, [recipientUsername])

  const sendMessage = useCallback((content: string, sender: string, senderName: string, profileImage?: string) => {
    if (!socket || !content.trim() || !recipientUsername) {
      console.warn('Cannot send message:', { socket: !!socket, content, recipientUsername })
      return
    }

    if (!isConnected || !isJoined) {
      console.warn('Socket not connected or room not joined')
      setError('Not connected to chat. Please try again.')
      return
    }

    console.log('Sending message:', { content, sender, recipient: recipientUsername })
    socket.emit('message', {
      content,
      sender,
      senderName,
      profileImage,
      recipient: recipientUsername,
    })
  }, [socket, recipientUsername, isConnected, isJoined])

  return {
    messages,
    sendMessage,
    isConnected: isConnected && isJoined,
    error
  }
}
