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
  const pendingOfferRef = useRef<any>(null) // Queue for offer received before ready
  const isReadyRef = useRef<boolean>(false) // Track if peer connection is ready

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
      console.log('✅ Room joined:', data)
      currentRoomIdRef.current = data.roomId
      console.log('📋 Current room participants:', data.participants?.length || 0)
    })

    socket.on('user-joined', (data) => {
      console.log('User joined:', data)
    })

    socket.on('user-left', (data) => {
      console.log('User left:', data)
    })

    socket.on('offer', async (data) => {
      console.log('📨 Received offer from', data.from, '- Processing...', {
        hasOffer: !!data.offer,
        offerType: data.offer?.type,
        isReady: isReadyRef.current,
        hasClient: !!webrtcClientRef.current,
        hasRoom: !!currentRoomIdRef.current
      })
      
      // If not ready yet, queue the offer
      if (!isReadyRef.current || !webrtcClientRef.current || !currentRoomIdRef.current) {
        console.log('⏳ Client not ready yet, queueing offer...', {
          isReady: isReadyRef.current,
          hasClient: !!webrtcClientRef.current,
          hasRoom: !!currentRoomIdRef.current
        })
        pendingOfferRef.current = data
        return
      }
      
      try {
        console.log('✅ Client ready, processing offer...')
        const answer = await webrtcClientRef.current.createAnswer(data.offer)
        console.log('✅ Created answer, sending to room:', currentRoomIdRef.current)
        socket.emit('answer', { roomId: currentRoomIdRef.current, answer })
        console.log('✅ Answer sent successfully')
      } catch (err: any) {
        console.error('❌ Error handling offer:', err)
        setError(`Failed to handle call offer: ${err.message || 'Unknown error'}`)
      }
    })

    socket.on('answer', async (data) => {
      console.log('📥 Received answer from', data.from)
      if (webrtcClientRef.current) {
        try {
          // Check if remote description is already set
          const currentState = webrtcClientRef.current.getConnectionState()
          const peerConn = webrtcClientRef.current.peerConnection
          const currentRemoteDesc = peerConn?.remoteDescription
          
          if (currentRemoteDesc && currentRemoteDesc.type === 'answer') {
            console.log('⚠️ Answer already set, ignoring duplicate')
            return
          }
          
          if (currentState === 'stable' && !currentRemoteDesc) {
            console.log('⚠️ Connection already stable, but no remote description. Setting answer...')
          }
          
          await webrtcClientRef.current.setRemoteDescription(data.answer)
          console.log('✅ Remote description (answer) set successfully')
        } catch (err: any) {
          // If error is about wrong state, it might be because answer was already set
          if (err.message?.includes('wrong state') || err.message?.includes('stable')) {
            console.log('⚠️ Answer already processed or connection already established (this is normal)')
          } else {
            console.error('❌ Error handling answer:', err)
            setError(`Failed to handle call answer: ${err.message || 'Unknown error'}`)
          }
        }
      } else {
        console.error('❌ WebRTC client not available when answer received')
      }
    })

    socket.on('ice-candidate', async (data) => {
      // Extract info from candidate string if available
      const candidateStr = data.candidate?.candidate || ''
      const candidatePreview = candidateStr.substring(0, 80) + (candidateStr.length > 80 ? '...' : '')
      
      console.log('📥 Received ICE candidate from', data.from, ':', {
        candidate: candidatePreview,
        sdpMLineIndex: data.candidate?.sdpMLineIndex,
        sdpMid: data.candidate?.sdpMid
      })
      
      if (webrtcClientRef.current) {
        try {
          await webrtcClientRef.current.addIceCandidate(data.candidate)
          console.log('✅ ICE candidate added successfully')
        } catch (err: any) {
          // Ignore errors for duplicate or invalid candidates (common and non-critical)
          if (err.message?.includes('duplicate') || err.message?.includes('InvalidStateError')) {
            console.log('⚠️ Skipping duplicate or invalid ICE candidate (this is normal)')
          } else {
            console.error('❌ Error adding ICE candidate:', err)
          }
        }
      } else {
        console.warn('⚠️ WebRTC client not available when ICE candidate received')
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
      console.log('Peer connection state changed:', state)
      setConnectionState(state)
      if (state === 'connected') {
        console.log('✅ Peer connection established!')
        setIsConnecting(false)
        setIsConnected(true)
      } else if (state === 'connecting') {
        console.log('🔄 Peer connection connecting...')
        setIsConnecting(true)
      } else if (state === 'disconnected') {
        console.log('❌ Peer connection disconnected')
        setIsConnecting(false)
        setIsConnected(false)
      } else if (state === 'failed') {
        console.error('❌ Peer connection failed')
        setIsConnecting(false)
        setIsConnected(false)
        setError('Connection failed. Please try again.')
      } else if (state === 'closed') {
        console.log('🔒 Peer connection closed')
        setIsConnecting(false)
        setIsConnected(false)
      }
    })

    client.onIceConnectionStateChange((state) => {
      console.log('ICE connection state changed:', state)
      setIceConnectionState(state)
      if (state === 'failed') {
        const errorMsg = 'ICE connection failed. This may be due to network issues or TURN server configuration. Check TURN server accessibility.'
        console.error('❌', errorMsg)
        setError(errorMsg)
        setIsConnecting(false)
      } else if (state === 'disconnected') {
        console.warn('⚠️ ICE connection disconnected')
        setError('Connection lost. Attempting to reconnect...')
        setIsConnecting(true)
      } else if (state === 'connected') {
        console.log('✅ ICE connection established successfully!')
        setError(null)
        setIsConnecting(false)
        setIsConnected(true)
      } else if (state === 'checking') {
        console.log('🔄 ICE connection checking... (this may take a moment)')
        setIsConnecting(true)
      } else if (state === 'completed') {
        console.log('✅ ICE connection completed')
        setIsConnecting(false)
        setIsConnected(true)
      } else if (state === 'new') {
        console.log('🆕 ICE connection new')
        setIsConnecting(true)
      }
    })

    // Handle ICE candidates
    client.onIceCandidate((candidate) => {
      if (socketRef.current && currentRoomIdRef.current) {
        // Properly serialize ICE candidate
        const candidateData: RTCIceCandidateInit = {
          candidate: candidate.candidate,
          sdpMLineIndex: candidate.sdpMLineIndex,
          sdpMid: candidate.sdpMid,
          usernameFragment: candidate.usernameFragment
        }
        
        console.log('📤 Sending ICE candidate:', {
          type: candidate.type,
          protocol: candidate.protocol,
          address: candidate.address,
          port: candidate.port,
          candidate: candidate.candidate?.substring(0, 50) + '...'
        })
        
        socketRef.current.emit('ice-candidate', {
          roomId: currentRoomIdRef.current,
          candidate: candidateData
        })
      } else {
        console.warn('⚠️ Cannot send ICE candidate - socket or room not ready', {
          hasSocket: !!socketRef.current,
          hasRoom: !!currentRoomIdRef.current
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
      
      // Mark as ready
      isReadyRef.current = true
      console.log('✅ Peer connection ready and tracks added')

      // Join Socket.io room
      if (socketRef.current) {
        console.log(`🚪 Joining room ${roomId} as ${isInitiator ? 'initiator' : 'participant'}`)
        socketRef.current.emit('join-room', { bookingId, roomId })

        // Wait a bit for room join to complete
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Check if there's a pending offer (received before we were ready)
        if (pendingOfferRef.current) {
          console.log('📨 Processing queued offer...')
          try {
            const answer = await webrtcClientRef.current.createAnswer(pendingOfferRef.current.offer)
            console.log('✅ Created answer from queued offer, sending...')
            socketRef.current.emit('answer', { roomId, answer })
            pendingOfferRef.current = null
          } catch (err: any) {
            console.error('❌ Error processing queued offer:', err)
            setError(`Failed to handle queued offer: ${err.message || 'Unknown error'}`)
          }
        } else if (isInitiator) {
          // Create offer if initiator and no pending offer
          console.log('📤 Creating offer as initiator...')
          const offer = await webrtcClientRef.current.createOffer()
          console.log('✅ Offer created, sending...')
          socketRef.current.emit('offer', { roomId, offer })
        } else {
          console.log('⏳ Waiting for offer as participant...')
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
    pendingOfferRef.current = null
    isReadyRef.current = false
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

