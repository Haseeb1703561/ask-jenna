import { useEffect, useMemo, useRef, useState } from 'react'
import StreamingAvatar, { AvatarQuality, StreamingEvents, TaskType } from '@heygen/streaming-avatar'
import { Mic, MicOff, Volume2, VolumeX, Send, Phone, PhoneOff, Play, Square, Settings } from 'lucide-react'

export default function AvatarCall() {
  const videoRef = useRef(null)
  const [avatarId, setAvatarId] = useState('June_HR_public')
  const [voiceId, setVoiceId] = useState('')
  const [knowledgeId, setKnowledgeId] = useState('')
  const [language, setLanguage] = useState('en')
  const [quality, setQuality] = useState('high')
  const [input, setInput] = useState('')
  const [speaking, setSpeaking] = useState(false)
  const [isSessionActive, setIsSessionActive] = useState(false)
  const [isVoiceChatting, setIsVoiceChatting] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [videoMuted, setVideoMuted] = useState(true)
  const [loading, setLoading] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const avatarRef = useRef(null)

  const canStart = useMemo(() => !!avatarId && !loading && !isSessionActive, [avatarId, loading, isSessionActive])

  useEffect(() => {
    return () => {
      if (avatarRef.current) {
        avatarRef.current.stopAvatar().catch(() => {})
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null
      }
    }
  }, [])

  const startSession = async () => {
    if (!avatarId) return
    setLoading(true)
    try {
      const tokenRes = await fetch('/api/session-token', { method: 'POST' })
      const tokenJson = await tokenRes.json()
      if (!tokenRes.ok) throw new Error(tokenJson?.error || 'Failed to get session token')
      const sessionToken = tokenJson.token

      const avatar = new StreamingAvatar({ token: sessionToken })
      avatarRef.current = avatar

      const onStreamReady = (e) => {
        const stream = e.detail
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          const play = videoRef.current.play?.()
          if (play && typeof play.then === 'function') {
            play.catch(() => {})
          }
        }
      }
      const onDisconnected = () => {
        setIsSessionActive(false)
        setIsVoiceChatting(false)
        setSpeaking(false)
        setVideoMuted(true)
        if (videoRef.current) {
          videoRef.current.srcObject = null
        }
      }
      const onStartTalking = () => setSpeaking(true)
      const onStopTalking = () => setSpeaking(false)

      avatar
        .on(StreamingEvents.STREAM_READY, onStreamReady)
        .on(StreamingEvents.STREAM_DISCONNECTED, onDisconnected)
        .on(StreamingEvents.AVATAR_START_TALKING, onStartTalking)
        .on(StreamingEvents.AVATAR_STOP_TALKING, onStopTalking)

      await avatar.createStartAvatar({
        quality: quality === 'high' ? AvatarQuality.High : quality === 'medium' ? AvatarQuality.Medium : AvatarQuality.Low,
        avatarName: avatarId,
        language,
        disableIdleTimeout: true,
        ...(knowledgeId ? { knowledgeId } : {}),
        ...(voiceId ? { voice: { voiceId } } : {}),
      })

      setIsSessionActive(true)
    } catch (e) {
      console.error(e)
      alert(e.message || 'Failed to start session')
    } finally {
      setLoading(false)
    }
  }

  const stopSession = async () => {
    try {
      await avatarRef.current?.stopAvatar()
    } catch {}
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setIsSessionActive(false)
    setIsVoiceChatting(false)
    setSpeaking(false)
  }

  const startVoice = async () => {
    try {
      await avatarRef.current?.startVoiceChat({ isInputAudioMuted: isMuted })
      setIsVoiceChatting(true)
    } catch (e) {
      console.error(e)
      alert('Microphone permission is required for voice chat')
    }
  }

  const stopVoice = async () => {
    try {
      await avatarRef.current?.closeVoiceChat()
    } catch {}
    setIsVoiceChatting(false)
  }

  const toggleMute = () => {
    if (!avatarRef.current) return
    if (avatarRef.current.isInputAudioMuted) {
      avatarRef.current.unmuteInputAudio()
      setIsMuted(false)
    } else {
      avatarRef.current.muteInputAudio()
      setIsMuted(true)
    }
  }

  const toggleOutput = () => {
    if (!videoRef.current) return
    const next = !videoMuted
    videoRef.current.muted = next
    setVideoMuted(next)
  }

  const sendText = async () => {
    if (!input.trim()) return
    try {
      await avatarRef.current?.speak({ text: input, taskType: TaskType.TALK })
      setInput('')
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all"
              >
                <Settings size={20} />
              </button>
              <h2 className="text-xl font-semibold text-white">Session Controls</h2>
            </div>
            <div className="flex items-center gap-3">
              {!isSessionActive ? (
                <button
                  disabled={!canStart}
                  onClick={startSession}
                  className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 shadow-lg ${
                    canStart
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-green-500/50'
                      : 'bg-gray-600 text-gray-300 cursor-not-allowed'
                  }`}
                >
                  <Play size={20} />
                  {loading ? 'Connecting...' : 'Start Session'}
                </button>
              ) : (
                <button
                  onClick={stopSession}
                  className="px-6 py-3 rounded-xl font-medium bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white transition-all flex items-center gap-2 shadow-lg shadow-red-500/50"
                >
                  <Square size={20} />
                  End Session
                </button>
              )}
            </div>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-black/20 rounded-xl mb-4">
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">Avatar ID</label>
                <input
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={avatarId}
                  onChange={(e) => setAvatarId(e.target.value)}
                  placeholder="e.g. June_HR_public"
                  disabled={isSessionActive}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">Voice ID (Optional)</label>
                <input
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={voiceId}
                  onChange={(e) => setVoiceId(e.target.value)}
                  placeholder="Custom voice"
                  disabled={isSessionActive}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">Quality</label>
                <select
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={quality}
                  onChange={(e) => setQuality(e.target.value)}
                  disabled={isSessionActive}
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Avatar Interface */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Video Section */}
        <div className="lg:col-span-2">
          <div className="relative bg-gradient-to-br from-gray-900 to-black rounded-2xl overflow-hidden shadow-2xl border border-white/10">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full aspect-video object-contain bg-black"
              muted={videoMuted}
            />
            {!isSessionActive && (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-900/50 to-pink-900/50 backdrop-blur-sm">
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center">
                    <Play size={48} className="text-white/60" />
                  </div>
                  <p className="text-white/80 text-lg font-medium">Start a session to begin</p>
                </div>
              </div>
            )}
            {speaking && (
              <div className="absolute top-4 right-4 px-4 py-2 bg-purple-500/90 backdrop-blur-md rounded-full text-white text-sm font-medium flex items-center gap-2 shadow-lg">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                Speaking...
              </div>
            )}
          </div>

          {/* Audio/Video Controls */}
          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={toggleOutput}
              disabled={!isSessionActive}
              className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                isSessionActive
                  ? videoMuted
                    ? 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                    : 'bg-purple-500/90 hover:bg-purple-600 text-white shadow-lg shadow-purple-500/50'
                  : 'bg-gray-800 text-gray-500 cursor-not-allowed'
              }`}
            >
              {videoMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              {videoMuted ? 'Unmute Audio' : 'Mute Audio'}
            </button>
          </div>
        </div>

        {/* Interaction Panel */}
        <div className="space-y-4">
          {/* Text Chat */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-white mb-4">Text Chat</h3>
            <div className="space-y-3">
              <textarea
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendText())}
                rows={3}
                disabled={!isSessionActive}
              />
              <button
                onClick={sendText}
                disabled={!isSessionActive || !input.trim()}
                className={`w-full px-4 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                  isSessionActive && input.trim()
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg shadow-blue-500/50'
                    : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Send size={20} />
                Send Message
              </button>
            </div>
          </div>

          {/* Voice Controls */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-white mb-4">Voice Chat</h3>
            <div className="space-y-3">
              {!isVoiceChatting ? (
                <button
                  onClick={startVoice}
                  disabled={!isSessionActive}
                  className={`w-full px-4 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                    isSessionActive
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg shadow-green-500/50'
                      : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Phone size={20} />
                  Start Voice Chat
                </button>
              ) : (
                <>
                  <button
                    onClick={stopVoice}
                    className="w-full px-4 py-3 rounded-xl font-medium bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-500/50"
                  >
                    <PhoneOff size={20} />
                    End Voice Chat
                  </button>
                  <button
                    onClick={toggleMute}
                    className={`w-full px-4 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                      isMuted
                        ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/50'
                        : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                    }`}
                  >
                    {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                    {isMuted ? 'Unmute Mic' : 'Mute Mic'}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Status */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-4 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-purple-200 text-sm font-medium">Status</span>
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                isSessionActive ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-400'
              }`}>
                <div className={`w-2 h-2 rounded-full ${isSessionActive ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`}></div>
                <span className="text-xs font-medium">{isSessionActive ? 'Connected' : 'Disconnected'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
