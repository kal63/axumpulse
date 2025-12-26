'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import { WebRTCClient } from '@/lib/webrtc-client'
import { apiClient } from '@/lib/api-client'
import { useAuth } from '@/contexts/auth-context'

export interface ChatMessage {
  id: string
  message: string
  userId: number
  timestamp: string
  isOwn?: boolean
}

export interface UseWebRTCReturn {
  // Connection state
  isConnected: boolean
  isConnecting: boolean
  connectionState: RTCPeerConnectionState | null
  iceConnectionState: RTCIceConnectionState | null

  // Media state
  localStream: MediaStream | null
  remoteStream: MediaStream | null
  isAudioEnabled: boolean
  isVideoEnabled: boolean

  // Chat
  messages: ChatMessage[]
  sendMessage: (message: string) => void

  // Controls
  toggleAudio: () => void
  toggleVideo: () => void
  endCall: () => void

  // Actions
  startCall: (bookingId: number, roomId: string, isInitiator: boolean) => Promise<void>
  joinCall: (bookingId: number, roomId: string) => Promise<void>

  // Error
  error: string | null
}

export function useWebRTC(): UseWebRTCReturn {
  const { user } = useAuth()
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionState, setConnectionState] = useState<RTCPeerConnectionState | null>(null)
  const [iceConnectionState, setIceConnectionState] = useState<RTCIceConnectionState | null>(null)
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [error, setError] = useState<string | null>(null)

  const socketRef = useRef<Socket | null>(null)
  const webrtcClientRef = useRef<WebRTCClient | null>(null)
  const currentRoomIdRef = useRef<string | null>(null)
  const currentBookingIdRef = useRef<number | null>(null)
  const isInitiatorRef = useRef<boolean>(false)
  const currentUserIdRef = useRef<number | null>(null)

  // Initialize Socket.io connection
  useEffect(() => {
    const signalingServer = process.env.NEXT_PUBLIC_SIGNALING_SERVER || 'http://localhost:3000'
    
    // Get auth token from localStorage
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null

    if (!token) {
      setError('Not authenticated. Please log in.')
      return
    }

    const socket = io(signalingServer, {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling']
    })

    socketRef.current = socket

    socket.on('connect', () => {
      console.log('Socket connected')
      setIsConnected(true)
      setError(null)
    })

    socket.on('disconnect', () => {
      console.log('Socket disconnected')
      setIsConnected(false)
    })

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err)
      setError('Failed to connect to signaling server')
      setIsConnected(false)
    })

    socket.on('error', (data) => {
      console.error('Socket error:', data)
      setError(data.message || 'An error occurred')
    })

    socket.on('room-joined', (data) => {
      console.log('Room joined:', data)
      currentRoomIdRef.current = data.roomId
    })

    socket.on('user-joined', (data) => {
      console.log('User joined:', data)
    })

    socket.on('user-left', (data) => {
      console.log('User left:', data)
    })

    socket.on('offer', async (data) => {
      console.log('Received offer:', data)
      if (webrtcClientRef.current && currentRoomIdRef.current) {
        try {
          const answer = await webrtcClientRef.current.createAnswer(data.offer)
          socket.emit('answer', { roomId: currentRoomIdRef.current, answer })
        } catch (err) {
          console.error('Error handling offer:', err)
          setError('Failed to handle call offer')
        }
      }
    })

    socket.on('answer', async (data) => {
      console.log('Received answer:', data)
      if (webrtcClientRef.current) {
        try {
          await webrtcClientRef.current.setRemoteDescription(data.answer)
        } catch (err) {
          console.error('Error handling answer:', err)
          setError('Failed to handle call answer')
        }
      }
    })

    socket.on('ice-candidate', async (data) => {
      console.log('Received ICE candidate:', data)
      if (webrtcClientRef.current) {
        try {
          await webrtcClientRef.current.addIceCandidate(data.candidate)
        } catch (err) {
          console.error('Error adding ICE candidate:', err)
        }
      }
    })

    socket.on('chat-message', (data: ChatMessage) => {
      setMessages((prev) => [
        ...prev,
        {
          ...data,
          isOwn: data.userId === (user?.id || currentUserIdRef.current)
        }
      ])
    })

    socket.on('call-ended', (data) => {
      console.log('Call ended:', data)
      handleEndCall()
    })

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [user])

  // Initialize WebRTC client
  useEffect(() => {
    const turnServer = process.env.NEXT_PUBLIC_COTURN_SERVER
    const turnPort = process.env.NEXT_PUBLIC_COTURN_PORT
      ? parseInt(process.env.NEXT_PUBLIC_COTURN_PORT)
      : undefined

    const client = new WebRTCClient({
      signalingServer: process.env.NEXT_PUBLIC_SIGNALING_SERVER || 'http://localhost:3000',
      turnServer,
      turnPort,
      turnUsername: process.env.NEXT_PUBLIC_COTURN_USERNAME,
      turnPassword: process.env.NEXT_PUBLIC_COTURN_PASSWORD
    })

    client.onRemoteStream((stream) => {
      setRemoteStream(stream)
    })

    client.onConnectionStateChange((state) => {
      setConnectionState(state)
      if (state === 'connected') {
        setIsConnecting(false)
      } else if (state === 'connecting') {
        setIsConnecting(true)
      }
    })

    client.onIceConnectionStateChange((state) => {
      setIceConnectionState(state)
      if (state === 'failed' || state === 'disconnected') {
        setError('Connection lost. Attempting to reconnect...')
      }
    })

    // Handle ICE candidates
    client.onIceCandidate((candidate) => {
      if (socketRef.current && currentRoomIdRef.current) {
        socketRef.current.emit('ice-candidate', {
          roomId: currentRoomIdRef.current,
          candidate: candidate.toJSON()
        })
      }
    })

    webrtcClientRef.current = client

    return () => {
      client.cleanup()
      webrtcClientRef.current = null
    }
  }, [])

  const startCall = useCallback(async (bookingId: number, roomId: string, isInitiator: boolean) => {
    if (!user?.id) {
      setError('User not authenticated')
      return
    }
    try {
      setError(null)
      setIsConnecting(true)
      currentBookingIdRef.current = bookingId
      currentRoomIdRef.current = roomId
      isInitiatorRef.current = isInitiator

      // Get user ID from auth context
      if (user?.id) {
        currentUserIdRef.current = user.id
      }

      // Initialize WebRTC
      if (!webrtcClientRef.current) {
        throw new Error('WebRTC client not initialized')
      }

      await webrtcClientRef.current.initializePeerConnection()

      // Get user media - with fallback to audio-only if video permission denied
      try {
        const stream = await webrtcClientRef.current.getUserMedia(true, true)
        setLocalStream(stream)
        setIsAudioEnabled(true)
        setIsVideoEnabled(true)
      } catch (mediaError: any) {
        // If video permission denied, try audio-only
        if (mediaError.message?.includes('Camera') || mediaError.message?.includes('permission')) {
          console.log('Video permission denied, trying audio-only...')
          const audioStream = await webrtcClientRef.current.getUserMedia(true, false)
          setLocalStream(audioStream)
          setIsAudioEnabled(true)
          setIsVideoEnabled(false)
        } else {
          throw mediaError
        }
      }

      // Add tracks to peer connection
      webrtcClientRef.current.addLocalTracks()

      // Join Socket.io room
      if (socketRef.current) {
        socketRef.current.emit('join-room', { bookingId, roomId })

        // If initiator, create offer
        if (isInitiator) {
          const offer = await webrtcClientRef.current.createOffer()
          socketRef.current.emit('offer', { roomId, offer })
        }
      }
    } catch (err: any) {
      console.error('Error starting call:', err)
      setError(err.message || 'Failed to start call')
      setIsConnecting(false)
      handleEndCall()
    }
  }, [user])

  const joinCall = useCallback(async (bookingId: number, roomId: string) => {
    await startCall(bookingId, roomId, false)
  }, [startCall])

  const toggleAudio = useCallback(() => {
    if (webrtcClientRef.current) {
      const enabled = webrtcClientRef.current.toggleAudio()
      setIsAudioEnabled(enabled)
    }
  }, [])

  const toggleVideo = useCallback(() => {
    if (webrtcClientRef.current) {
      const enabled = webrtcClientRef.current.toggleVideo()
      setIsVideoEnabled(enabled)
    }
  }, [])

  const sendMessage = useCallback((message: string) => {
    if (socketRef.current && currentRoomIdRef.current && message.trim()) {
      socketRef.current.emit('chat-message', {
        roomId: currentRoomIdRef.current,
        message: message.trim()
      })
    }
  }, [])

  const handleEndCall = useCallback(() => {
    if (socketRef.current && currentRoomIdRef.current) {
      socketRef.current.emit('end-call', { roomId: currentRoomIdRef.current })
    }

    if (webrtcClientRef.current) {
      webrtcClientRef.current.cleanup()
    }

    setLocalStream(null)
    setRemoteStream(null)
    setIsConnecting(false)
    setIsConnected(false)
    setMessages([])
    currentRoomIdRef.current = null
    currentBookingIdRef.current = null
  }, [])

  const endCall = useCallback(() => {
    handleEndCall()
  }, [handleEndCall])

  return {
    isConnected,
    isConnecting,
    connectionState,
    iceConnectionState,
    localStream,
    remoteStream,
    isAudioEnabled,
    isVideoEnabled,
    messages,
    sendMessage,
    toggleAudio,
    toggleVideo,
    endCall,
    startCall,
    joinCall,
    error
  }
}

