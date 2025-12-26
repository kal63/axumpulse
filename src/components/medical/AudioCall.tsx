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
  Phone,
  PhoneOff,
  MessageSquare,
  X,
  Loader2,
  Volume2
} from 'lucide-react'

interface AudioCallProps {
  bookingId: number
  roomId: string
  isInitiator: boolean
  onEndCall?: () => void
  otherUserName?: string
}

export function AudioCall({
  bookingId,
  roomId,
  isInitiator,
  onEndCall,
  otherUserName = 'Participant'
}: AudioCallProps) {
  const {
    isConnected,
    isConnecting,
    connectionState,
    iceConnectionState,
    localStream,
    remoteStream,
    isAudioEnabled,
    messages,
    sendMessage,
    toggleAudio,
    endCall,
    startCall,
    joinCall,
    error
  } = useWebRTC()

  const [showChat, setShowChat] = useState(false)
  const [chatInput, setChatInput] = useState('')
  const [hasStarted, setHasStarted] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const remoteAudioRef = useRef<HTMLAudioElement>(null)

  // Initialize call (audio-only mode)
  useEffect(() => {
    if (!hasStarted && roomId) {
      setHasStarted(true)
      if (isInitiator) {
        startCall(bookingId, roomId, true, false) // false = audio only
      } else {
        joinCall(bookingId, roomId, false) // false = audio only
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId, roomId, isInitiator, hasStarted]) // Removed startCall and joinCall from deps to prevent duplicate calls

  // Update remote audio element
  useEffect(() => {
    if (remoteAudioRef.current && remoteStream) {
      remoteAudioRef.current.srcObject = remoteStream
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
    if (error) return error
    if (isConnecting) {
      if (iceConnectionState === 'checking') return 'Connecting...'
      return 'Connecting...'
    }
    if (connectionState === 'connected' || iceConnectionState === 'connected') return 'Connected'
    if (connectionState === 'connecting') return 'Connecting...'
    if (iceConnectionState === 'checking') return 'Connecting...'
    return 'Initializing...'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-6 right-6 z-50 w-96"
    >
      <NeumorphicCard variant="raised" className="p-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-teal-500 to-emerald-600 flex items-center justify-center">
              <Volume2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-semibold text-[var(--neumorphic-text)]">{otherUserName}</p>
              <div className="flex items-center gap-2">
                {isConnecting ? (
                  <Loader2 className="w-3 h-3 animate-spin text-teal-500" />
                ) : connectionState === 'connected' ? (
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                ) : (
                  <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                )}
                <span className="text-xs text-[var(--neumorphic-muted)]">
                  {getConnectionStatus()}
                </span>
              </div>
            </div>
          </div>
          <Button
            onClick={() => setShowChat(!showChat)}
            variant="ghost"
            size="sm"
            className="w-8 h-8 p-0"
          >
            <MessageSquare className="w-4 h-4" />
          </Button>
        </div>

        {/* Remote Audio (hidden, auto-play) */}
        {remoteStream && (
          <audio
            ref={remoteAudioRef}
            autoPlay
            playsInline
            className="hidden"
          />
        )}

        {/* Controls */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <Button
            onClick={toggleAudio}
            variant="ghost"
            size="lg"
            className={`rounded-full w-12 h-12 ${
              isAudioEnabled
                ? 'bg-[var(--neumorphic-surface)] hover:bg-[var(--neumorphic-surface)]'
                : 'bg-red-500/20 hover:bg-red-500/30 text-red-500'
            }`}
          >
            {isAudioEnabled ? (
              <Mic className="w-5 h-5" />
            ) : (
              <MicOff className="w-5 h-5" />
            )}
          </Button>

          <Button
            onClick={handleEndCall}
            size="lg"
            className="rounded-full w-14 h-14 bg-red-500 hover:bg-red-600 text-white"
          >
            <PhoneOff className="w-6 h-6" />
          </Button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-2 rounded-lg bg-red-500/10 border border-red-500/20">
            <p className="text-xs text-red-500">{error}</p>
          </div>
        )}

        {/* Chat Sidebar */}
        <AnimatePresence>
          {showChat && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 border-t border-[var(--neumorphic-muted)]/20 pt-4"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-[var(--neumorphic-text)]">Chat</h4>
                <Button
                  onClick={() => setShowChat(false)}
                  variant="ghost"
                  size="sm"
                  className="w-6 h-6 p-0"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
              <div className="h-32 overflow-y-auto mb-2 space-y-2">
                {messages.length === 0 ? (
                  <p className="text-xs text-center text-[var(--neumorphic-muted)] py-4">
                    No messages yet
                  </p>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`text-xs p-2 rounded-lg ${
                        msg.isOwn
                          ? 'bg-teal-500/20 text-right ml-8'
                          : 'bg-[var(--neumorphic-surface)] text-left mr-8'
                      }`}
                    >
                      <p className="text-[var(--neumorphic-text)]">{msg.message}</p>
                      <p className="text-[10px] text-[var(--neumorphic-muted)] mt-1">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  ))
                )}
                <div ref={chatEndRef} />
              </div>
              <div className="flex gap-2">
                <Input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message..."
                  className="text-sm h-8"
                />
                <Button
                  onClick={handleSendMessage}
                  size="sm"
                  className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white"
                >
                  Send
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </NeumorphicCard>
    </motion.div>
  )
}

