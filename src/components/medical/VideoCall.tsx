'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWebRTC } from '@/hooks/useWebRTC'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { NeumorphicCard } from '@/components/user/NeumorphicCard'
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Phone,
  PhoneOff,
  MessageSquare,
  X,
  Loader2
} from 'lucide-react'

interface VideoCallProps {
  bookingId: number
  roomId: string
  isInitiator: boolean
  onEndCall?: () => void
  otherUserName?: string
}

export function VideoCall({
  bookingId,
  roomId,
  isInitiator,
  onEndCall,
  otherUserName = 'Participant'
}: VideoCallProps) {
  const {
    isConnected,
    isConnecting,
    connectionState,
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
  } = useWebRTC()

  const [showChat, setShowChat] = useState(false)
  const [chatInput, setChatInput] = useState('')
  const [hasStarted, setHasStarted] = useState(false)
  const [permissionError, setPermissionError] = useState<string | null>(null)
  const [audioOnlyMode, setAudioOnlyMode] = useState(false)
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Initialize call
  useEffect(() => {
    if (!hasStarted && roomId) {
      setHasStarted(true)
      if (isInitiator) {
        startCall(bookingId, roomId, true)
      } else {
        joinCall(bookingId, roomId)
      }
    }
  }, [bookingId, roomId, isInitiator, hasStarted, startCall, joinCall])

  // Update video elements
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream
    }
  }, [localStream])

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream
    }
  }, [remoteStream])

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = () => {
    if (chatInput.trim()) {
      sendMessage(chatInput)
      setChatInput('')
    }
  }

  const handleEndCall = () => {
    endCall()
    if (onEndCall) {
      onEndCall()
    }
  }

  const getConnectionStatus = () => {
    if (isConnecting) return 'Connecting...'
    if (connectionState === 'connected') return 'Connected'
    if (connectionState === 'connecting') return 'Connecting...'
    if (connectionState === 'disconnected') return 'Disconnected'
    if (error) return error
    return 'Initializing...'
  }

  return (
    <div className="fixed inset-0 z-50 bg-[var(--neumorphic-bg)] flex items-center justify-center">
      <div className="w-full h-full flex flex-col">
        {/* Video Grid */}
        <div className="flex-1 relative overflow-hidden">
          {/* Remote Video (Main) */}
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-emerald-500/5 to-blue-500/10">
            {remoteStream ? (
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-32 h-32 bg-gradient-to-r from-teal-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-4xl font-bold text-white">
                      {otherUserName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xl font-semibold text-[var(--neumorphic-text)]">
                    {otherUserName}
                  </p>
                  <p className="text-sm text-[var(--neumorphic-muted)] mt-2">
                    {isConnecting ? 'Connecting...' : 'Waiting for video...'}
                  </p>
                </div>
              </div>
            )}

            {/* Local Video (Picture-in-Picture) */}
            {localStream && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute bottom-4 right-4 w-48 h-36 rounded-lg overflow-hidden shadow-2xl border-2 border-teal-500/50 bg-black"
              >
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {!isVideoEnabled && (
                  <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
                    <VideoOff className="w-8 h-8 text-gray-400" />
                  </div>
                )}
              </motion.div>
            )}

            {/* Connection Status Indicator */}
            <div className="absolute top-4 left-4">
              <NeumorphicCard variant="raised" className="px-4 py-2">
                <div className="flex items-center gap-2">
                  {isConnecting ? (
                    <Loader2 className="w-4 h-4 animate-spin text-teal-500" />
                  ) : connectionState === 'connected' ? (
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  ) : (
                    <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                  )}
                  <span className="text-sm text-[var(--neumorphic-text)]">
                    {getConnectionStatus()}
                  </span>
                </div>
              </NeumorphicCard>
            </div>

            {/* Error Message */}
            {(error || permissionError) && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50"
              >
                <NeumorphicCard variant="raised" className={`px-4 py-2 border ${
                  permissionError && audioOnlyMode 
                    ? 'bg-yellow-500/10 border-yellow-500/20' 
                    : 'bg-red-500/10 border-red-500/20'
                }`}>
                  <p className={`text-sm ${
                    permissionError && audioOnlyMode ? 'text-yellow-500' : 'text-red-500'
                  }`}>
                    {error || permissionError}
                  </p>
                  {permissionError && audioOnlyMode && (
                    <p className="text-xs text-yellow-400 mt-1">
                      You can still participate in the call with audio only.
                    </p>
                  )}
                </NeumorphicCard>
              </motion.div>
            )}
          </div>
        </div>

        {/* Controls Bar */}
        <div className="bg-[var(--neumorphic-bg)] border-t border-[var(--neumorphic-muted)]/20 p-4">
          <div className="max-w-4xl mx-auto flex items-center justify-center gap-4">
            {/* Mute/Unmute Audio */}
            <Button
              onClick={toggleAudio}
              variant="ghost"
              size="lg"
              className={`rounded-full w-14 h-14 ${
                isAudioEnabled
                  ? 'bg-[var(--neumorphic-surface)] hover:bg-[var(--neumorphic-surface)]'
                  : 'bg-red-500/20 hover:bg-red-500/30 text-red-500'
              }`}
            >
              {isAudioEnabled ? (
                <Mic className="w-6 h-6" />
              ) : (
                <MicOff className="w-6 h-6" />
              )}
            </Button>

            {/* Enable/Disable Video */}
            <Button
              onClick={toggleVideo}
              variant="ghost"
              size="lg"
              className={`rounded-full w-14 h-14 ${
                isVideoEnabled
                  ? 'bg-[var(--neumorphic-surface)] hover:bg-[var(--neumorphic-surface)]'
                  : 'bg-red-500/20 hover:bg-red-500/30 text-red-500'
              }`}
            >
              {isVideoEnabled ? (
                <Video className="w-6 h-6" />
              ) : (
                <VideoOff className="w-6 h-6" />
              )}
            </Button>

            {/* Chat Toggle */}
            <Button
              onClick={() => setShowChat(!showChat)}
              variant="ghost"
              size="lg"
              className={`rounded-full w-14 h-14 ${
                showChat
                  ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white'
                  : 'bg-[var(--neumorphic-surface)] hover:bg-[var(--neumorphic-surface)]'
              }`}
            >
              <MessageSquare className="w-6 h-6" />
            </Button>

            {/* End Call */}
            <Button
              onClick={handleEndCall}
              size="lg"
              className="rounded-full w-14 h-14 bg-red-500 hover:bg-red-600 text-white"
            >
              <PhoneOff className="w-6 h-6" />
            </Button>
          </div>
        </div>

        {/* Chat Sidebar */}
        <AnimatePresence>
          {showChat && (
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 bottom-0 w-80 bg-[var(--neumorphic-bg)] border-l border-[var(--neumorphic-muted)]/20 shadow-2xl flex flex-col"
            >
              {/* Chat Header */}
              <div className="p-4 border-b border-[var(--neumorphic-muted)]/20 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[var(--neumorphic-text)]">Chat</h3>
                <Button
                  onClick={() => setShowChat(false)}
                  variant="ghost"
                  size="sm"
                  className="w-8 h-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                  <div className="text-center text-sm text-[var(--neumorphic-muted)] mt-8">
                    No messages yet. Start the conversation!
                  </div>
                ) : (
                  messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-lg px-3 py-2 ${
                          msg.isOwn
                            ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white'
                            : 'bg-[var(--neumorphic-surface)] text-[var(--neumorphic-text)]'
                        }`}
                      >
                        <p className="text-sm">{msg.message}</p>
                        <p
                          className={`text-xs mt-1 ${
                            msg.isOwn ? 'text-white/70' : 'text-[var(--neumorphic-muted)]'
                          }`}
                        >
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </motion.div>
                  ))
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input */}
              <div className="p-4 border-t border-[var(--neumorphic-muted)]/20">
                <div className="flex gap-2">
                  <Input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type a message..."
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSendMessage}
                    className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white"
                  >
                    Send
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

