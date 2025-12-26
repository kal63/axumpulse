/**
 * WebRTC Client for managing peer connections and media streams
 */

export interface WebRTCConfig {
  signalingServer: string
  turnServer?: string
  turnPort?: number
  turnUsername?: string
  turnPassword?: string
}

export interface MediaStreamState {
  localStream: MediaStream | null
  remoteStream: MediaStream | null
  isAudioEnabled: boolean
  isVideoEnabled: boolean
}

export class WebRTCClient {
  private peerConnection: RTCPeerConnection | null = null
  private localStream: MediaStream | null = null
  private remoteStream: MediaStream | null = null
  private config: WebRTCConfig
  private onRemoteStreamCallback?: (stream: MediaStream) => void
  private onConnectionStateChangeCallback?: (state: RTCPeerConnectionState) => void
  private onIceConnectionStateChangeCallback?: (state: RTCIceConnectionState) => void
  private onIceCandidateCallback?: (candidate: RTCIceCandidate) => void

  constructor(config: WebRTCConfig) {
    this.config = config
  }

  /**
   * Initialize peer connection with STUN/TURN servers
   */
  async initializePeerConnection(): Promise<void> {
    const rtcConfig: RTCConfiguration = {
      iceServers: [
        // STUN server (public)
        { urls: 'stun:stun.l.google.com:19302' },
        // TURN server (if configured)
        ...(this.config.turnServer
          ? [
              {
                urls: `turn:${this.config.turnServer}:${this.config.turnPort || 3478}`,
                username: this.config.turnUsername || '',
                credential: this.config.turnPassword || ''
              }
            ]
          : [])
      ],
      iceCandidatePoolSize: 10
    }

    this.peerConnection = new RTCPeerConnection(rtcConfig)

    // Handle remote stream
    this.peerConnection.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        this.remoteStream = event.streams[0]
        if (this.onRemoteStreamCallback) {
          this.onRemoteStreamCallback(this.remoteStream)
        }
      }
    }

    // Handle connection state changes
    this.peerConnection.onconnectionstatechange = () => {
      if (this.peerConnection && this.onConnectionStateChangeCallback) {
        this.onConnectionStateChangeCallback(this.peerConnection.connectionState)
      }
    }

    // Handle ICE connection state changes
    this.peerConnection.oniceconnectionstatechange = () => {
      if (this.peerConnection && this.onIceConnectionStateChangeCallback) {
        this.onIceConnectionStateChangeCallback(this.peerConnection.iceConnectionState)
      }
    }

    // Handle ICE candidate events (will be sent via signaling)
    this.peerConnection.onicecandidate = (event) => {
      // ICE candidates will be sent via signaling layer
      // Store callback to send candidates
      if (event.candidate && this.onIceCandidateCallback) {
        this.onIceCandidateCallback(event.candidate)
      }
    }
  }

  /**
   * Get user media (camera and microphone)
   */
  async getUserMedia(audio: boolean = true, video: boolean = true): Promise<MediaStream> {
    try {
      const constraints: MediaStreamConstraints = {
        audio: audio ? { echoCancellation: true, noiseSuppression: true } : false,
        video: video
          ? {
              width: { ideal: 1280 },
              height: { ideal: 720 },
              frameRate: { ideal: 30 }
            }
          : false
      }

      this.localStream = await navigator.mediaDevices.getUserMedia(constraints)
      return this.localStream
    } catch (error: any) {
      console.error('Error getting user media:', error)
      
      // Handle specific permission errors
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        // Try audio-only if video permission denied
        if (video && audio) {
          console.log('Video permission denied, trying audio-only...')
          try {
            const audioConstraints: MediaStreamConstraints = {
              audio: { echoCancellation: true, noiseSuppression: true },
              video: false
            }
            this.localStream = await navigator.mediaDevices.getUserMedia(audioConstraints)
            return this.localStream
          } catch (audioError) {
            throw new Error('Camera and microphone permissions are required. Please allow access in your browser settings and refresh the page.')
          }
        }
        throw new Error('Microphone permission is required. Please allow access in your browser settings and refresh the page.')
      }
      
      if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        throw new Error('No camera or microphone found. Please connect a device and try again.')
      }
      
      if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        throw new Error('Camera or microphone is already in use by another application. Please close other apps and try again.')
      }
      
      throw new Error(`Failed to access camera/microphone: ${error.message || 'Unknown error'}. Please check permissions.`)
    }
  }

  /**
   * Add local stream tracks to peer connection
   */
  addLocalTracks(): void {
    if (!this.peerConnection || !this.localStream) {
      throw new Error('Peer connection or local stream not initialized')
    }

    this.localStream.getTracks().forEach((track) => {
      this.peerConnection!.addTrack(track, this.localStream!)
    })
  }

  /**
   * Create and return WebRTC offer
   */
  async createOffer(): Promise<RTCSessionDescriptionInit> {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized')
    }

    const offer = await this.peerConnection.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: true
    })

    await this.peerConnection.setLocalDescription(offer)
    return offer
  }

  /**
   * Set remote description from answer
   */
  async setRemoteDescription(description: RTCSessionDescriptionInit): Promise<void> {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized')
    }

    await this.peerConnection.setRemoteDescription(description)
  }

  /**
   * Create and return WebRTC answer
   */
  async createAnswer(offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit> {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized')
    }

    await this.peerConnection.setRemoteDescription(offer)
    const answer = await this.peerConnection.createAnswer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: true
    })

    await this.peerConnection.setLocalDescription(answer)
    return answer
  }

  /**
   * Add ICE candidate
   */
  async addIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized')
    }

    try {
      await this.peerConnection.addIceCandidate(candidate)
    } catch (error) {
      console.error('Error adding ICE candidate:', error)
    }
  }

  /**
   * Toggle audio (mute/unmute)
   */
  toggleAudio(): boolean {
    if (!this.localStream) {
      return false
    }

    const audioTracks = this.localStream.getAudioTracks()
    if (audioTracks.length > 0) {
      const enabled = !audioTracks[0].enabled
      audioTracks.forEach((track) => {
        track.enabled = enabled
      })
      return enabled
    }
    return false
  }

  /**
   * Toggle video (enable/disable)
   */
  toggleVideo(): boolean {
    if (!this.localStream) {
      return false
    }

    const videoTracks = this.localStream.getVideoTracks()
    if (videoTracks.length > 0) {
      const enabled = !videoTracks[0].enabled
      videoTracks.forEach((track) => {
        track.enabled = enabled
      })
      return enabled
    }
    return false
  }

  /**
   * Get current media state
   */
  getMediaState(): MediaStreamState {
    return {
      localStream: this.localStream,
      remoteStream: this.remoteStream,
      isAudioEnabled: this.localStream?.getAudioTracks()[0]?.enabled ?? false,
      isVideoEnabled: this.localStream?.getVideoTracks()[0]?.enabled ?? false
    }
  }

  /**
   * Set callbacks
   */
  onRemoteStream(callback: (stream: MediaStream) => void): void {
    this.onRemoteStreamCallback = callback
  }

  onConnectionStateChange(callback: (state: RTCPeerConnectionState) => void): void {
    this.onConnectionStateChangeCallback = callback
  }

  onIceConnectionStateChange(callback: (state: RTCIceConnectionState) => void): void {
    this.onIceConnectionStateChangeCallback = callback
  }

  onIceCandidate(callback: (candidate: RTCIceCandidate) => void): void {
    this.onIceCandidateCallback = callback
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    // Stop local stream tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        track.stop()
      })
      this.localStream = null
    }

    // Close peer connection
    if (this.peerConnection) {
      this.peerConnection.close()
      this.peerConnection = null
    }

    this.remoteStream = null
  }

  /**
   * Get peer connection state
   */
  getConnectionState(): RTCPeerConnectionState | null {
    return this.peerConnection?.connectionState || null
  }

  /**
   * Get ICE connection state
   */
  getIceConnectionState(): RTCIceConnectionState | null {
    return this.peerConnection?.iceConnectionState || null
  }
}

