'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api-client'
import { 
  ArrowLeft, Heart, Bookmark, CheckCircle, TrendingUp, Clock, Play, 
  Star, User, Share2, Download, Volume2, VolumeX, Maximize, 
  ThumbsUp, MessageCircle, Zap, Target, Award, Timer,
  ChevronRight, Eye, Users, Calendar, MapPin, Sparkles, Globe
} from 'lucide-react'
import { NeumorphicCard } from '@/components/user/NeumorphicCard'
import { XPRing } from '@/components/user/XPRing'
import type { ContentItem } from '@/lib/api-client'
import { useToast } from '@/hooks/use-toast'
import { getImageUrl } from '@/lib/upload-utils'

export default function VideoPlayerPage() {
    const params = useParams()
    const router = useRouter()
    const { toast } = useToast()
    const videoRef = useRef<HTMLVideoElement>(null)
    
    const [content, setContent] = useState<ContentItem | null>(null)
    const [relatedContent, setRelatedContent] = useState<ContentItem[]>([])
    const [loading, setLoading] = useState(true)
    
    // User engagement state
    const [liked, setLiked] = useState(false)
    const [saved, setSaved] = useState(false)
    const [completed, setCompleted] = useState(false)
    const [watchTime, setWatchTime] = useState(0) // Maximum timeline position reached through actual playback
    const [maxWatchedTime, setMaxWatchedTime] = useState(0) // Track max time reached while playing (prevents seeking abuse)
    const [effectiveWatchTime, setEffectiveWatchTime] = useState(0) // Total seconds actually played (excluding pauses)
    const [playStartTime, setPlayStartTime] = useState<number | null>(null) // Timestamp when video started playing
    const [lastSeekTime, setLastSeekTime] = useState<number | null>(null) // Track when seeking occurred to prevent counting seeks
    const [isPlaying, setIsPlaying] = useState(false)
    const [showControls, setShowControls] = useState(true)
    const [volume, setVolume] = useState(1)
    const [isMuted, setIsMuted] = useState(false)
    const [progress, setProgress] = useState(0)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const [showRelated, setShowRelated] = useState(true)
    const [completing, setCompleting] = useState(false) // Loading state for completion
    const [watchPercentage, setWatchPercentage] = useState(0) // Watch percentage for display
    const [effectiveWatchPercentage, setEffectiveWatchPercentage] = useState(0) // Effective watch percentage
    const [userXP, setUserXP] = useState(0) // User's current XP
    const [userLevel, setUserLevel] = useState(1) // User's current level
    const [xpToNextLevel, setXpToNextLevel] = useState(50) // XP needed for next level
    const [xpProgress, setXpProgress] = useState(0) // Current XP progress in current level

    const contentId = Number(params.id)

    useEffect(() => {
        if (contentId) {
            fetchContent()
            fetchUserProfile()
        }
    }, [contentId])
    
    // Fetch user profile to get XP and level
    const fetchUserProfile = async () => {
        try {
            const response = await apiClient.getUserStats()
            if (response.success && response.data) {
                const user = response.data.user
                setUserXP(user.xp || 0)
                setUserLevel(user.level || 1)
                setXpToNextLevel(user.xpNeeded || 50)
                setXpProgress(user.xpProgress || 0)
            }
        } catch (error) {
            console.error('Error fetching user profile:', error)
        }
    }

    // Track effective watch time (time video has been playing, excluding pauses)
    useEffect(() => {
        const video = videoRef.current
        if (!video) return

        let playStartTimestamp: number | null = null
        
        const handlePlay = () => {
            playStartTimestamp = Date.now()
            setPlayStartTime(playStartTimestamp)
        }
        
        const handlePause = () => {
            if (playStartTimestamp !== null) {
                const playedDuration = Math.floor((Date.now() - playStartTimestamp) / 1000)
                setEffectiveWatchTime(prev => prev + playedDuration)
                playStartTimestamp = null
                setPlayStartTime(null)
            }
        }
        
        const handleEnded = () => {
            if (playStartTimestamp !== null) {
                const playedDuration = Math.floor((Date.now() - playStartTimestamp) / 1000)
                setEffectiveWatchTime(prev => prev + playedDuration)
                playStartTimestamp = null
                setPlayStartTime(null)
            }
        }
        
        const handleSeeked = () => {
            // Video finished seeking - mark the seek time
            setLastSeekTime(Date.now())
        }

        video.addEventListener('play', handlePlay)
        video.addEventListener('pause', handlePause)
        video.addEventListener('ended', handleEnded)
        video.addEventListener('seeked', handleSeeked)

        return () => {
            video.removeEventListener('play', handlePlay)
            video.removeEventListener('pause', handlePause)
            video.removeEventListener('ended', handleEnded)
            video.removeEventListener('seeked', handleSeeked)
        }
    }, [contentId])

    // Track watch progress every 5 seconds
    useEffect(() => {
        const interval = setInterval(async () => {
            if (videoRef.current && !videoRef.current.paused) {
                const currentTime = Math.floor(videoRef.current.currentTime)
                
                // Only update maxWatchedTime if video is playing and we haven't recently seeked
                // This prevents seeking from instantly updating watch time
                const now = Date.now()
                const seekThreshold = 3000 // If we seeked within last 3 seconds, don't count this as watched
                
                if (!lastSeekTime || (now - lastSeekTime) > seekThreshold) {
                    // Video is playing naturally (no recent seek), update max watched time
                    // Only update if currentTime is greater than maxWatchedTime (moving forward naturally)
                    if (currentTime > maxWatchedTime) {
                        setMaxWatchedTime(currentTime)
                        setWatchTime(currentTime) // Only update watchTime when actually playing forward
                    }
                } else {
                    // Recent seek detected - don't update maxWatchedTime yet
                    // Wait for video to actually play through the seeked position
                    // Use maxWatchedTime (last known valid position) for now
                    if (maxWatchedTime > 0) {
                        setWatchTime(maxWatchedTime)
                    }
                }
                
                // Calculate current effective watch time (including current playing session)
                let currentEffectiveTime = effectiveWatchTime
                if (playStartTime !== null) {
                    const playedDuration = Math.floor((Date.now() - playStartTime) / 1000)
                    currentEffectiveTime = effectiveWatchTime + playedDuration
                }
                
                // Use maxWatchedTime (not currentTime) for watch progress to prevent seeking abuse
                const watchTimeToSend = maxWatchedTime > 0 ? maxWatchedTime : currentTime
                
                // Auto-save progress with effective watch time
                try {
                    const response = await apiClient.updateWatchProgress(contentId, watchTimeToSend, false, currentEffectiveTime)
                    if (response.success && response.data) {
                        // Prefer client-side calculation for display to avoid backend issues
                        if (content?.duration) {
                            const localWatchPct = (maxWatchedTime / content.duration) * 100
                            setWatchPercentage(Math.min(100, Math.round(localWatchPct)))
                        } else {
                            setWatchPercentage(response.data.watchPercentage || 0)
                        }
                        setEffectiveWatchPercentage(response.data.effectiveWatchPercentage || 0)
                        
                        // Handle auto-completion
                        if (response.data.autoCompleted && !completed) {
                            setCompleted(true)
                            // Refresh user profile to get updated XP/level
                            fetchUserProfile().catch(console.error)
                            // Show gamified completion notification
                            toast({
                                title: '🎉 Video Completed!',
                                description: (
                                    <div className="flex flex-col gap-1">
                                        <span className="font-semibold text-lg">+{response.data.xpEarned} XP Earned!</span>
                                        <span className="text-sm opacity-90">Great job watching the video!</span>
                                    </div>
                                ),
                                duration: 6000,
                                className: "bg-gradient-to-r from-[var(--ethio-lemon)] to-[var(--ethio-deep-blue)] text-white border-0 shadow-2xl",
                            })
                        }
                        // Handle milestone notifications
                        if (response.data.newlyAwardedMilestones && response.data.newlyAwardedMilestones.length > 0) {
                            const milestone = response.data.newlyAwardedMilestones[response.data.newlyAwardedMilestones.length - 1]
                            toast({
                                title: `🎯 ${milestone.milestone}% Milestone!`,
                                description: `+${milestone.xp} XP`,
                                duration: 3000,
                                className: "bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 shadow-xl",
                            })
                        }
                    } else if (!response.success && response.error) {
                        // Handle API errors (non-network errors)
                        console.error('Error updating watch progress:', response.error)
                        // Don't show toast for every progress update error to avoid spam
                    }
                } catch (error) {
                    console.error('Error updating watch progress:', error)
                    // Network errors are caught here, but we don't want to spam user with toasts
                }
            }
        }, 5000)

        return () => clearInterval(interval)
    }, [contentId, effectiveWatchTime, playStartTime, completed, maxWatchedTime, lastSeekTime, content])

    const fetchContent = async () => {
        try {
            setLoading(true)
            const response = await apiClient.getUserContentById(contentId)
            
            if (response.success && response.data) {
                const contentData = response.data.content
                setContent(contentData)
                setRelatedContent(response.data.relatedContent)
                
                // Set initial engagement state from user progress
                const userProgress = (contentData as any).userProgress?.[0]
                if (userProgress) {
                    setLiked(userProgress.liked || false)
                    setSaved(userProgress.saved || false)
                    setCompleted(userProgress.completed || false)
                    const savedWatchTime = userProgress.watchTime || 0
                    setWatchTime(savedWatchTime)
                    setMaxWatchedTime(savedWatchTime) // Initialize max watched time from saved progress
                    // Initialize effective watch time (for now, use watchTime as approximation)
                    // In future, we could store effectiveWatchTime in DB
                    setEffectiveWatchTime(savedWatchTime)
                    
                    // Calculate initial watch percentage
                    if (contentData.duration) {
                        const initialWatchPct = (savedWatchTime / contentData.duration) * 100
                        setWatchPercentage(Math.min(100, Math.round(initialWatchPct)))
                        setEffectiveWatchPercentage(Math.min(100, Math.round(initialWatchPct)))
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching content:', error)
            toast({
                title: 'Error',
                description: 'Failed to load video',
                variant: 'destructive'
            })
        } finally {
            setLoading(false)
        }
    }

    const handleLike = async () => {
        try {
            const response = await apiClient.likeContent(contentId)
            if (response.success && response.data) {
                setLiked(response.data.liked)
                toast({
                    title: response.data.liked ? '❤️ Liked!' : 'Unliked',
                    description: response.data.liked ? 'Added to your liked videos' : 'Removed from liked videos'
                })
            }
        } catch (error) {
            console.error('Error liking content:', error)
        }
    }

    const handleSave = async () => {
        try {
            const response = await apiClient.saveContent(contentId)
            if (response.success && response.data) {
                setSaved(response.data.saved)
                toast({
                    title: response.data.saved ? '💾 Saved!' : 'Unsaved',
                    description: response.data.saved ? 'Added to your saved videos' : 'Removed from saved videos'
                })
            }
        } catch (error) {
            console.error('Error saving content:', error)
        }
    }

    const handleComplete = async () => {
        if (completing || completed) return // Prevent multiple clicks
        
        try {
            setCompleting(true)
            // Use maxWatchedTime (not currentTime) to prevent seeking abuse
            const watchTimeToSend = maxWatchedTime > 0 ? maxWatchedTime : (videoRef.current ? Math.floor(videoRef.current.currentTime) : watchTime)
            
            // Calculate current effective watch time
            let currentEffectiveTime = effectiveWatchTime
            if (playStartTime !== null) {
                const playedDuration = Math.floor((Date.now() - playStartTime) / 1000)
                currentEffectiveTime = effectiveWatchTime + playedDuration
            }
            
            const response = await apiClient.updateWatchProgress(contentId, watchTimeToSend, true, currentEffectiveTime)
            
            if (response.success && response.data) {
                setCompleted(true)
                if (content?.duration) {
                    const localWatchPct = (maxWatchedTime / content.duration) * 100
                    setWatchPercentage(Math.min(100, Math.round(localWatchPct)))
                } else {
                    setWatchPercentage(response.data.watchPercentage || 0)
                }
                setEffectiveWatchPercentage(response.data.effectiveWatchPercentage || 0)
                
                // Refresh user profile to get updated XP/level
                await fetchUserProfile()
                
                toast({
                    title: '🎉 Completed!',
                    description: (
                        <div className="flex flex-col gap-1">
                            <span className="font-semibold text-lg">+{response.data.xpEarned} XP Earned!</span>
                            <span className="text-sm opacity-90">Great job watching the video!</span>
                        </div>
                    ),
                    duration: 6000,
                    className: "bg-gradient-to-r from-[var(--ethio-lemon)] to-[var(--ethio-deep-blue)] text-white border-0 shadow-2xl",
                })
            } else if (!response.success && response.error) {
                // Handle API errors
                const errorCode = response.error.code
                const errorMessage = response.error.message || 'An error occurred'
                
                if (errorCode === 'INSUFFICIENT_WATCH_TIME') {
                    toast({
                        title: '⚠️ Watch More to Complete',
                        description: (
                            <div className="flex flex-col gap-1">
                                <span>{errorMessage}</span>
                                <span className="text-sm opacity-90">
                                    You've watched {Math.round(watchPercentage)}%. Watch at least 80% to complete.
                                </span>
                            </div>
                        ),
                        variant: 'destructive',
                        duration: 5000,
                    })
                } else {
                    toast({
                        title: 'Error',
                        description: errorMessage,
                        variant: 'destructive',
                        duration: 5000,
                    })
                }
            }
        } catch (error: any) {
            // Handle network errors
            console.error('Error completing content:', error)
            toast({
                title: 'Network Error',
                description: 'Failed to complete video. Please check your connection and try again.',
                variant: 'destructive',
                duration: 5000,
            })
        } finally {
            setCompleting(false)
        }
    }

    // Video control handlers
    const handlePlayPause = () => {
        if (videoRef.current) {
            if (videoRef.current.paused) {
                videoRef.current.play()
                setIsPlaying(true)
            } else {
                videoRef.current.pause()
                setIsPlaying(false)
            }
        }
    }

    const handleVolumeChange = (newVolume: number) => {
        if (videoRef.current) {
            videoRef.current.volume = newVolume
            setVolume(newVolume)
            setIsMuted(newVolume === 0)
        }
    }

    const handleMute = () => {
        if (videoRef.current) {
            if (isMuted) {
                videoRef.current.volume = volume
                setIsMuted(false)
            } else {
                videoRef.current.volume = 0
                setIsMuted(true)
            }
        }
    }

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            const current = videoRef.current.currentTime
            const total = videoRef.current.duration
            setCurrentTime(current)
            setProgress((current / total) * 100)
        }
    }

    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        if (videoRef.current) {
            const rect = e.currentTarget.getBoundingClientRect()
            const clickX = e.clientX - rect.left
            const newTime = (clickX / rect.width) * videoRef.current.duration
            videoRef.current.currentTime = newTime
            
            // Mark that we just seeked - don't count this as watch time
            setLastSeekTime(Date.now())
            
            // If seeking backward, don't update watchTime
            // If seeking forward, only update maxWatchedTime if we actually play through it
            const currentTime = Math.floor(videoRef.current.currentTime)
            if (currentTime <= maxWatchedTime) {
                // Seeking backward - don't update anything
                // maxWatchedTime stays the same
            }
            // If seeking forward, we'll only update maxWatchedTime when video actually plays to that point
        }
    }

    const getDifficultyColor = (difficulty?: string) => {
        switch (difficulty) {
            case 'beginner': return 'bg-green-500/20 text-green-400 border-green-500/30'
            case 'intermediate': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
            case 'advanced': return 'bg-red-500/20 text-red-400 border-red-500/30'
            default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
        }
    }

    const formatDuration = (seconds?: number) => {
        if (!seconds) return 'N/A'
        const minutes = Math.floor(seconds / 60)
        return `${minutes}min`
    }

    if (loading) {
        return (
            <div className="min-h-dvh min-h-full user-app-page p-4 md:p-8">
                <div className="max-w-7xl mx-auto space-y-6">
                    {/* Back Button Skeleton */}
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 user-app-paper rounded-lg animate-pulse" />
                        <div className="w-24 h-6 user-app-paper rounded animate-pulse" />
                    </div>
                    
                    {/* Video Player Skeleton */}
                    <NeumorphicCard variant="recessed" size="lg" className="p-0 overflow-hidden">
                        <div className="aspect-video bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                            <div className="text-center space-y-4">
                                <div className="w-16 h-16 user-app-paper rounded-full flex items-center justify-center mx-auto animate-pulse">
                                    <Play className="w-8 h-8 user-app-muted" />
                                </div>
                                <div className="w-32 h-4 user-app-paper rounded animate-pulse mx-auto" />
                            </div>
                        </div>
                    </NeumorphicCard>
                    
                    {/* Content Info Skeleton */}
                    <NeumorphicCard variant="raised" size="lg" className="p-6">
                        <div className="space-y-4">
                            <div className="h-8 user-app-paper rounded animate-pulse w-3/4" />
                            <div className="h-4 user-app-paper rounded animate-pulse w-1/2" />
                            <div className="h-4 user-app-paper rounded animate-pulse w-2/3" />
                        </div>
                    </NeumorphicCard>
                </div>
            </div>
        )
    }

    if (!content) {
        return (
            <div className="min-h-dvh min-h-full user-app-page p-4 md:p-8">
                <div className="max-w-2xl mx-auto">
                    <NeumorphicCard variant="raised" size="lg" className="p-12 text-center">
                        <div className="space-y-6">
                            <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-pink-600 rounded-full flex items-center justify-center mx-auto">
                                <Play className="w-10 h-10 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold user-app-ink mb-2">
                                    Video Not Found
                                </h2>
                                <p className="user-app-muted">
                                    This video might have been removed or doesn't exist.
                                </p>
                            </div>
                            <button
                                onClick={() => router.push('/user/videos')}
                                className="px-6 py-3 bg-gradient-to-r from-[var(--ethio-lemon)] to-[var(--ethio-deep-blue)] text-white rounded-xl font-medium hover:opacity-95 transition-all duration-200 transform hover:scale-105"
                            >
                                <ArrowLeft className="w-5 h-5 mr-2 inline" />
                                Back to Videos
                            </button>
                        </div>
                    </NeumorphicCard>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-dvh min-h-full user-app-page p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Back Button */}
                <button
                    onClick={() => router.push('/user/videos')}
                    className="flex items-center space-x-2 user-app-ink hover:user-app-link transition-colors duration-200 group"
                >
                    <NeumorphicCard variant="raised" size="sm" className="p-2 group-hover:scale-105 transition-transform duration-200">
                        <ArrowLeft className="w-5 h-5" />
                    </NeumorphicCard>
                    <span className="font-medium">Back to Videos</span>
                </button>

                {/* Video Player */}
                <NeumorphicCard variant="recessed" size="lg" className="p-0 overflow-hidden group">
                    <div className="aspect-video bg-black relative overflow-hidden">
                        {content.type === 'video' && content.fileUrl ? (
                            <>
                                <video
                                    ref={videoRef}
                                    className="w-full h-full object-cover"
                                    src={`${process.env.NEXT_PUBLIC_API_URL}${content.fileUrl}`}
                                    poster={content.thumbnailUrl ? `${process.env.NEXT_PUBLIC_API_URL}${content.thumbnailUrl}` : undefined}
                                    onTimeUpdate={handleTimeUpdate}
                                    onLoadedMetadata={() => {
                                        if (videoRef.current) {
                                            setDuration(videoRef.current.duration)
                                        }
                                    }}
                                    onPlay={() => setIsPlaying(true)}
                                    onPause={() => setIsPlaying(false)}
                                    onClick={handlePlayPause}
                                >
                                    Your browser does not support the video tag.
                                </video>
                                
                                {/* Custom Video Controls Overlay */}
                                <div 
                                    className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300 ${
                                        showControls ? 'opacity-100' : 'opacity-0'
                                    }`}
                                    onMouseEnter={() => setShowControls(true)}
                                    onMouseLeave={() => setShowControls(false)}
                                >
                                    {/* Top Controls */}
                                    <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
                                        {/* Difficulty Badge */}
                                        {content.difficulty && (
                                            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                content.difficulty === 'beginner' ? 'bg-green-500/90 text-white' :
                                                content.difficulty === 'intermediate' ? 'bg-yellow-500/90 text-white' :
                                                'bg-red-500/90 text-white'
                                            }`}>
                                                {content.difficulty}
                                            </div>
                                        )}
                                    </div>

                                    {/* Center Play Button */}
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <button
                                            onClick={handlePlayPause}
                                            className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-200 transform hover:scale-110"
                                        >
                                            {isPlaying ? (
                                                <div className="w-8 h-8 bg-white rounded-sm flex items-center justify-center">
                                                    <div className="w-1 h-6 bg-black"></div>
                                                    <div className="w-1 h-6 bg-black ml-1"></div>
                                                </div>
                                            ) : (
                                                <Play className="w-8 h-8 text-white ml-1" fill="currentColor" />
                                            )}
                                        </button>
                                    </div>

                                    {/* Bottom Controls */}
                                    <div className="absolute bottom-4 left-4 right-4 space-y-3">
                                        {/* Progress Bar */}
                                        <div 
                                            className="w-full h-1 bg-white/30 rounded-full cursor-pointer"
                                            onClick={handleSeek}
                                        >
                                            <div 
                                                className="h-full bg-gradient-to-r from-[var(--ethio-lemon)] to-[var(--ethio-deep-blue)] rounded-full transition-all duration-100"
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>

                                        {/* Control Buttons */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <button
                                                    onClick={handlePlayPause}
                                                    className="text-white hover:text-[var(--ethio-lemon)] transition-colors"
                                                >
                                                    {isPlaying ? (
                                                        <div className="w-6 h-6 flex items-center justify-center">
                                                            <div className="w-2 h-4 bg-white rounded-sm"></div>
                                                            <div className="w-2 h-4 bg-white rounded-sm ml-1"></div>
                                                        </div>
                                                    ) : (
                                                        <Play className="w-6 h-6" fill="currentColor" />
                                                    )}
                                                </button>

                                                <button
                                                    onClick={handleMute}
                                                    className="text-white hover:text-[var(--ethio-lemon)] transition-colors"
                                                >
                                                    {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                                                </button>

                                                <div className="text-white text-sm">
                                                    {Math.floor(currentTime / 60)}:{(Math.floor(currentTime) % 60).toString().padStart(2, '0')} / {Math.floor(duration / 60)}:{(Math.floor(duration) % 60).toString().padStart(2, '0')}
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <button className="text-white hover:text-[var(--ethio-lemon)] transition-colors">
                                                    <Maximize className="w-6 h-6" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : content.type === 'image' && content.fileUrl ? (
                            <img
                                src={`${process.env.NEXT_PUBLIC_API_URL}${content.fileUrl}`}
                                alt={content.title}
                                className="w-full h-full object-contain"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-white">
                                <div className="text-center space-y-4">
                                    <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto">
                                        <Play className="h-12 w-12" />
                                    </div>
                                    <p className="text-lg font-medium">Video not available</p>
                                </div>
                            </div>
                        )}
                    </div>
                </NeumorphicCard>

                {/* Video Info - Flowing Layout */}
                <div className="space-y-8">
                    {/* Hero Section */}
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--ethio-lemon)]/10 via-[var(--ethio-deep-blue)]/8 to-transparent p-8 md:p-12">
                        <div className="absolute inset-0 bg-gradient-to-r from-[var(--ethio-lemon)]/8 to-[var(--ethio-deep-blue)]/8"></div>
                        <div className="relative z-10">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                                <div className="flex-1">
                                    <h1 className="text-3xl md:text-4xl font-bold user-app-ink leading-tight mb-4">
                                        {content.title}
                                    </h1>
                                    
                                    {/* Floating Stats */}
                                    <div className="flex flex-wrap items-center gap-4">
                                        {content.difficulty && (
                                            <div className={`px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm ${
                                                content.difficulty === 'beginner' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                                                content.difficulty === 'intermediate' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                                                'bg-red-500/20 text-red-400 border border-red-500/30'
                                            }`}>
                                                {content.difficulty}
                                            </div>
                                        )}
                                        
                                        {content.duration && (
                                            <div className="flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full user-app-ink">
                                                <Clock className="h-4 w-4" />
                                                <span>{formatDuration(content.duration)}</span>
                                            </div>
                                        )}
                                        
                                        <div className="flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full user-app-ink">
                                            <Eye className="h-4 w-4" />
                                            <span>{content.views || 0} views</span>
                                        </div>
                                        
                                        <div className="flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full user-app-ink">
                                            <Heart className="h-4 w-4" />
                                            <span>{content.likes || 0} likes</span>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Action Buttons */}
                                <div className="flex flex-wrap gap-3">
                                    <button
                                        onClick={handleLike}
                                        className={`flex items-center space-x-2 px-6 py-3 rounded-full font-medium transition-all duration-200 transform hover:scale-105 ${
                                            liked 
                                                ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg' 
                                                : 'bg-white/20 backdrop-blur-sm user-app-ink hover:bg-white/30'
                                        }`}
                                    >
                                        <Heart className={`w-5 h-5 ${liked ? 'fill-white' : ''}`} />
                                        <span>{liked ? 'Liked' : 'Like'}</span>
                                    </button>
                                    
                                    <button
                                        onClick={handleSave}
                                        className={`flex items-center space-x-2 px-6 py-3 rounded-full font-medium transition-all duration-200 transform hover:scale-105 ${
                                            saved 
                                                ? 'bg-gradient-to-r from-[var(--ethio-lemon)] to-[var(--ethio-deep-blue)] text-white shadow-lg' 
                                                : 'bg-white/20 backdrop-blur-sm user-app-ink hover:bg-white/30'
                                        }`}
                                    >
                                        <Bookmark className={`w-5 h-5 ${saved ? 'fill-white' : ''}`} />
                                        <span>{saved ? 'Saved' : 'Save'}</span>
                                    </button>
                                    
                                    <button className="flex items-center space-x-2 px-6 py-3 rounded-full font-medium transition-all duration-200 transform hover:scale-105 bg-white/20 backdrop-blur-sm user-app-ink hover:bg-white/30">
                                        <Share2 className="w-5 h-5" />
                                        <span>Share</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        {/* Description */}
                        {content.description && (
                            <div className="mt-8">
                                <p className="user-app-ink leading-relaxed text-lg whitespace-pre-wrap">
                                    {content.description}
                                </p>
                            </div>
                        )}
                        
                        {/* Tags and Video Details */}
                        <div className="mt-8 space-y-4">
                            {/* Tags */}
                            {content.tags && content.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {content.tags.map((tag, index) => (
                                        <span 
                                            key={index}
                                            className="px-3 py-1 bg-white/10 backdrop-blur-sm user-app-ink text-sm rounded-full border border-white/20 hover:bg-white/20 transition-all duration-200"
                                        >
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                            
                            {/* Video Details */}
                            <div className="flex flex-wrap items-center gap-4 text-sm user-app-muted">
                                <div className="flex items-center space-x-2">
                                    <Calendar className="h-4 w-4" />
                                    <span>Published {new Date(content.createdAt).toLocaleDateString()}</span>
                                </div>
                                
                                {content.category && (
                                    <div className="flex items-center space-x-2">
                                        <Target className="h-4 w-4" />
                                        <span className="capitalize">{content.category}</span>
                                    </div>
                                )}
                                
                                {content.language && (
                                    <div className="flex items-center space-x-2">
                                        <Globe className="h-4 w-4" />
                                        <span className="uppercase">{content.language}</span>
                                    </div>
                                )}
                                
                                {content.trainer && (
                                    <div className="flex items-center space-x-2">
                                        <User className="h-4 w-4" />
                                        <span>by {content.trainer.User?.name || 'Unknown Trainer'}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto space-y-6">
                {/* Trainer Section */}
                {content.trainer && (
                    <div className="user-app-surface p-8 shadow-sm">
                        <div className="flex items-start gap-6">
                            {/* Avatar */}
                            <div className="relative flex-shrink-0">
                                {content.trainer.User?.profilePicture ? (
                                    <img 
                                        src={getImageUrl(content.trainer.User.profilePicture)} 
                                        alt={content.trainer.User.name || 'Trainer'} 
                                        className="w-20 h-20 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-20 h-20 rounded-full bg-[var(--ethio-deep-blue)] flex items-center justify-center text-white font-bold text-2xl">
                                        {(content.trainer.User?.name || 'T').charAt(0).toUpperCase()}
                                    </div>
                                )}
                                {content.trainer.verified && (
                                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                        <CheckCircle className="w-4 h-4 text-white" />
                                    </div>
                                )}
                            </div>
                            
                            {/* Content */}
                            <div className="flex-1 space-y-4">
                                <div>
                                    <h3 className="text-2xl font-bold user-app-ink mb-1">
                                        {content.trainer.User?.name || 'Unknown Trainer'}
                                    </h3>
                                    <p className="user-app-muted">
                                        Certified Fitness Trainer
                                    </p>
                                </div>
                                
                                {content.trainer.bio && (
                                    <p className="user-app-muted leading-relaxed">
                                        {content.trainer.bio}
                                    </p>
                                )}
                                
                                {Array.isArray(content.trainer.specialties) && content.trainer.specialties.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {content.trainer.specialties.slice(0, 3).map((specialty, index) => {
                                            const borderColors = [
                                                'border-[var(--ethio-deep-blue)]/40',
                                                'border-[var(--ethio-lemon)]/40', 
                                                'border-green-500/50'
                                            ];
                                            return (
                                                <span 
                                                    key={index}
                                                    className={`px-3 py-1 border bg-slate-100 dark:bg-slate-800 ${borderColors[index % borderColors.length]} user-app-ink text-sm rounded-full shadow-sm`}
                                                >
                                                    {specialty.replace('_', ' ')}
                                                </span>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}



                {/* XP Reward Section */}
                <NeumorphicCard variant="raised" className="p-8">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        {/* Left: XP Ring */}
                        <div className="flex-shrink-0 flex flex-col items-center">
                            <XPRing 
                                currentXP={userXP} 
                                level={userLevel} 
                                xpToNextLevel={xpToNextLevel}
                                xpProgress={xpProgress}
                                size="lg"
                            />
                            <div className="mt-4 text-center">
                                <div className="text-sm user-app-muted">
                                    {xpToNextLevel - xpProgress} to next
                                </div>
                            </div>
                        </div>
                        
                        {/* Right: Progress and Action */}
                        <div className="flex-1 w-full md:w-auto">
                            <h3 className="text-2xl font-bold user-app-ink mb-4 text-center md:text-left">
                                Complete Video for XP
                            </h3>
                            
                            {/* Watch Progress */}
                            <div className="mb-6 space-y-2">
                                <div className="flex items-center justify-between text-sm user-app-muted mb-2">
                                    <span>Watch Progress</span>
                                    <span className="font-semibold user-app-ink">{Math.round(watchPercentage)}%</span>
                                </div>
                                <div className="h-3 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                                    <div 
                                        className="bg-gradient-to-r from-[var(--ethio-lemon)] to-[var(--ethio-deep-blue)] h-3 rounded-full transition-all duration-500"
                                        style={{ width: `${Math.min(watchPercentage, 100)}%` }}
                                    />
                                </div>
                                {watchPercentage < 80 && !completed && (
                                    <p className="text-sm user-app-muted text-center md:text-left">
                                        Watch {80 - Math.round(watchPercentage)}% more to complete
                                    </p>
                                )}
                            </div>
                            
                            <p className="user-app-muted mb-6 text-center md:text-left">
                                {completed 
                                    ? '✅ You earned XP for completing this video!' 
                                    : 'Watch at least 80% to earn XP and complete this video'
                                }
                            </p>
                            
                            {/* Complete Button */}
                            {completed ? (
                                <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-full font-bold text-lg shadow-xl text-center">
                                    <div className="flex items-center justify-center space-x-2">
                                        <CheckCircle className="w-6 h-6" />
                                        <span>Completed!</span>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={handleComplete}
                                    disabled={completing || watchPercentage < 80}
                                    className={`w-full md:w-auto px-8 py-4 rounded-full font-bold text-lg transition-all duration-200 shadow-xl ${
                                        watchPercentage < 80
                                            ? 'bg-gray-400 text-gray-200 cursor-not-allowed opacity-60'
                                            : completing
                                            ? 'bg-gradient-to-r from-[var(--ethio-lemon)] to-[var(--ethio-deep-blue)] text-white cursor-wait'
                                            : 'bg-gradient-to-r from-[var(--ethio-lemon)] to-[var(--ethio-deep-blue)] text-white hover:opacity-95 transform hover:scale-105'
                                    }`}
                                    title={watchPercentage < 80 ? `Watch at least 80% to complete. Currently at ${Math.round(watchPercentage)}%.` : undefined}
                                >
                                    <div className="flex items-center justify-center space-x-2">
                                        {completing ? (
                                            <>
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                                <span>Completing...</span>
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle className="w-6 h-6" />
                                                <span>Complete for XP</span>
                                            </>
                                        )}
                                    </div>
                                </button>
                            )}
                        </div>
                    </div>
                </NeumorphicCard>
                
                {/* Related Videos */}
                {relatedContent.length > 0 && (
                    <div className="space-y-6 mt-10 mb-10 pb-10 overflow-visible">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold user-app-ink flex items-center space-x-3">
                                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center">
                                    <Target className="w-4 h-4 text-white" />
                                </div>
                                <span>Related Videos</span>
                            </h2>
                            <button
                                onClick={() => setShowRelated(!showRelated)}
                                className="flex items-center space-x-2 user-app-link hover:opacity-90 transition-colors"
                            >
                                <span>{showRelated ? 'Hide' : 'Show'} Related</span>
                                <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${showRelated ? 'rotate-90' : ''}`} />
                            </button>
                        </div>
                        
                        <div className={`transition-all duration-500 ease-in-out overflow-hidden ${
                            showRelated ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'
                        }`}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {relatedContent.map((item) => (
                                    <NeumorphicCard 
                                        key={item.id}
                                        variant="raised" 
                                        size="md" 
                                        className="group cursor-pointer hover:scale-105 transition-all duration-300 overflow-hidden"
                                        onClick={() => router.push(`/user/videos/${item.id}`)}
                                    >
                                        <div className="aspect-video bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 relative overflow-hidden">
                                            {item.thumbnailUrl ? (
                                                <>
                                                    <img
                                                        src={`${process.env.NEXT_PUBLIC_API_URL}${item.thumbnailUrl}`}
                                                        alt={item.title}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 filter brightness-90 contrast-110 saturate-90"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-60" />
                                                </>
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <div className="relative">
                                                        <Play className="h-12 w-12 text-gray-400 user-app-group-hover-text transition-colors duration-300" />
                                                        <div className="absolute inset-0 bg-gradient-to-r from-[var(--ethio-lemon)]/15 to-[var(--ethio-deep-blue)]/12 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                                    </div>
                                                </div>
                                            )}
                                            
                                            {/* Play Overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                                                <div className="bg-white/90 backdrop-blur-sm rounded-full p-3 transform scale-0 group-hover:scale-100 transition-transform duration-300">
                                                    <Play className="h-6 w-6 text-gray-800 fill-current" />
                                                </div>
                                            </div>
                                            
                                            {/* Duration Badge */}
                                            {item.duration && (
                                                <div className="absolute bottom-3 right-3 bg-black/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 shadow-lg">
                                                    <Clock className="w-3 h-3" />
                                                    <span>{formatDuration(item.duration)}</span>
                                                </div>
                                            )}
                                            
                                            {/* Difficulty Badge */}
                                            {item.difficulty && (
                                                <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium shadow-lg backdrop-blur-sm ${
                                                    item.difficulty === 'beginner' ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white' :
                                                    item.difficulty === 'intermediate' ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white' :
                                                    'bg-gradient-to-r from-red-500 to-rose-600 text-white'
                                                }`}>
                                                    {item.difficulty}
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="p-4 space-y-3">
                                            <h3 className="font-semibold text-lg line-clamp-2 user-app-ink group-hover:user-app-link transition-colors duration-300">
                                                {item.title}
                                            </h3>
                                            
                                            {/* Trainer Info */}
                                            <div className="flex items-center space-x-2">
                                                <div className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300 font-bold text-xs">
                                                    {item.trainer?.User?.name ? item.trainer.User.name.charAt(0).toUpperCase() : 'U'}
                                                </div>
                                                <p className="text-sm user-app-muted">
                                                    {item.trainer?.User?.name || 'Unknown Trainer'}
                                                </p>
                                                <div className="flex items-center space-x-1 ml-auto">
                                                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                                    <span className="text-sm font-medium user-app-ink">4.8</span>
                                                </div>
                                            </div>
                                            
                                            {/* Stats */}
                                            <div className="flex items-center justify-between text-sm user-app-muted">
                                                <div className="flex items-center space-x-1">
                                                    <Eye className="w-4 h-4" />
                                                    <span>{item.views || 0}</span>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                    <Heart className="w-4 h-4" />
                                                    <span>{item.likes || 0}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </NeumorphicCard>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
                </div>
        </div>
         
    )
}


