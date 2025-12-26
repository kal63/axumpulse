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
  startCall: (bookingId: number, roomId: string, isInitiator: boolean, enableVideo?: boolean) => Promise<void>
  joinCall: (bookingId: number, roomId: string, enableVideo?: boolean) => Promise<void>

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
      const isCallActiveRef = useRef<boolean>(false) // Track if call is currently active to prevent duplicate calls

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
          const peerConn = webrtcClientRef.current.peerConnection
          const currentRemoteDesc = peerConn?.remoteDescription
          const signalingState = peerConn?.signalingState
          
          if (currentRemoteDesc && currentRemoteDesc.type === 'answer') {
            console.log('⚠️ Answer already set, ignoring duplicate')
            return
          }
          
          // Check if signaling state is stable and we already have a remote description
          if (signalingState === 'stable' && currentRemoteDesc) {
            console.log('⚠️ Signaling state is stable and remote description already set, skipping duplicate answer')
            return
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
      // Only cleanup if we're actually unmounting (not just re-rendering)
      // In React Strict Mode, this runs twice, so we need to be careful
      if (webrtcClientRef.current === client) {
        console.log('🧹 Cleaning up WebRTC client on unmount')
        client.cleanup()
        webrtcClientRef.current = null
      }
    }
  }, [])

  const startCall = useCallback(async (bookingId: number, roomId: string, isInitiator: boolean, enableVideo: boolean = true) => {
    if (!user?.id) {
      setError('User not authenticated')
      return
    }
    
    // Prevent duplicate calls for the same room
    if (isCallActiveRef.current && currentRoomIdRef.current === roomId) {
      console.warn('⚠️ Call already active for this room, skipping duplicate startCall')
      return
    }
    
    try {
      setError(null)
      setIsConnecting(true)
      isCallActiveRef.current = true
      currentBookingIdRef.current = bookingId
      currentRoomIdRef.current = roomId
      isInitiatorRef.current = isInitiator

      // Get user ID from auth context
      if (user?.id) {
        currentUserIdRef.current = user.id
      }

      // Initialize WebRTC
      if (!webrtcClientRef.current) {
        console.error('❌ WebRTC client is null')
        throw new Error('WebRTC client not initialized')
      }

      console.log('✅ WebRTC client exists, checking peer connection state...')

      // Check if peer connection already exists and has a local description
      const existingPC = webrtcClientRef.current.peerConnection
      if (existingPC && existingPC.localDescription) {
        console.warn('⚠️ Peer connection already has local description, cleaning up first...')
        webrtcClientRef.current.cleanup()
        // Wait a bit for cleanup to complete
        await new Promise(resolve => setTimeout(resolve, 100))
        // Verify cleanup completed
        if (webrtcClientRef.current.peerConnection) {
          console.warn('⚠️ Peer connection still exists after cleanup, forcing null')
          webrtcClientRef.current.cleanup() // Cleanup again
          await new Promise(resolve => setTimeout(resolve, 50))
        }
      }

      // Initialize peer connection
      console.log('🔄 Initializing peer connection...')
      console.log('   Client state before init:', {
        hasClient: !!webrtcClientRef.current,
        hasExistingPC: !!webrtcClientRef.current?.peerConnection
      })
      
      await webrtcClientRef.current.initializePeerConnection()
      
      // Small delay to ensure peer connection is fully set (helps with React Strict Mode timing)
      await new Promise(resolve => setTimeout(resolve, 10))
      
      // Verify peer connection was created
      let pc = webrtcClientRef.current?.peerConnection
      if (!pc) {
        // This can happen in React Strict Mode or other edge cases
        // Try to re-initialize once - this is a recoverable situation
        console.warn('⚠️ Peer connection is null after first initialization (likely React Strict Mode), retrying...')
        await webrtcClientRef.current.initializePeerConnection()
        await new Promise(resolve => setTimeout(resolve, 10))
        pc = webrtcClientRef.current?.peerConnection
        if (!pc) {
          // Only log as error if retry also fails
          console.error('❌ Peer connection is null after retry - this is a real error')
          console.error('   Client state:', {
            hasClient: !!webrtcClientRef.current,
            clientType: typeof webrtcClientRef.current,
            clientConstructor: webrtcClientRef.current?.constructor?.name
          })
          throw new Error('Failed to initialize peer connection: peer connection is null after retry')
        }
        console.log('✅ Peer connection created successfully on retry')
      } else {
        console.log('✅ Peer connection initialized successfully:', {
          connectionState: pc.connectionState,
          signalingState: pc.signalingState
        })
      }

      // Get user media - audio-only or audio+video based on enableVideo parameter
      let localMediaStream: MediaStream | null = null
      try {
        if (enableVideo) {
          localMediaStream = await webrtcClientRef.current.getUserMedia(true, true)
          setLocalStream(localMediaStream)
          setIsAudioEnabled(true)
          setIsVideoEnabled(true)
        } else {
          // Audio-only mode
          localMediaStream = await webrtcClientRef.current.getUserMedia(true, false)
          setLocalStream(localMediaStream)
          setIsAudioEnabled(true)
          setIsVideoEnabled(false)
        }
      } catch (mediaError: any) {
        // If video permission denied and we wanted video, try audio-only
        if (enableVideo && (mediaError.message?.includes('Camera') || mediaError.message?.includes('permission'))) {
          console.log('Video permission denied, trying audio-only...')
          localMediaStream = await webrtcClientRef.current.getUserMedia(true, false)
          setLocalStream(localMediaStream)
          setIsAudioEnabled(true)
          setIsVideoEnabled(false)
        } else {
          throw mediaError
        }
      }

      // Verify stream was obtained before adding tracks
      if (!localMediaStream) {
        throw new Error('Failed to obtain local media stream')
      }
      
      // Verify stream has tracks
      if (localMediaStream.getTracks().length === 0) {
        throw new Error('Media stream has no tracks')
      }
      
      // Verify peer connection exists
      if (!webrtcClientRef.current.peerConnection) {
        throw new Error('Peer connection not initialized before adding tracks')
      }
      
      // Verify that getUserMedia() actually set the stream in the client
      // getUserMedia() should have set this.localStream in WebRTCClient
      // If it didn't, we need to check why
      console.log('📹 Stream obtained:', {
        streamId: localMediaStream.id,
        tracksCount: localMediaStream.getTracks().length,
        hasPeerConnection: !!webrtcClientRef.current.peerConnection
      })

      // Add tracks to peer connection
      // Note: getUserMedia() sets this.localStream in the WebRTCClient, so it should be available
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
          // Check if peer connection already has a local description
          const pc = webrtcClientRef.current.peerConnection
          if (pc && pc.localDescription) {
            console.warn('⚠️ Peer connection already has local description, skipping offer creation')
            return
          }
          
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

  const joinCall = useCallback(async (bookingId: number, roomId: string, enableVideo: boolean = true) => {
    await startCall(bookingId, roomId, false, enableVideo)
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
    isCallActiveRef.current = false // Reset call active flag
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

