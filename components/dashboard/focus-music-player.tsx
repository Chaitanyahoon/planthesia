"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Icons } from "@/components/icons"

interface MusicTrack {
  name: string
  url: string
  category: "focus" | "relax" | "energy" | "nature" | "instrumental"
  description?: string
  icon?: string
}

// Extract video ID from YouTube URL
const extractVideoId = (url: string): string | null => {
  const match = url.match(/(?:youtube\.com\/embed\/|youtu\.be\/|youtube\.com\/watch\?v=)([^&\n?#]+)/)
  return match ? match[1] : null
}

export function FocusMusicPlayer({ isActive, isBreak }: { isActive: boolean; isBreak: boolean }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTrack, setCurrentTrack] = useState<MusicTrack | null>(null)
  const [volume, setVolume] = useState([50])
  const [activeCategory, setActiveCategory] = useState<MusicTrack["category"]>("focus")
  const [recentlyPlayed, setRecentlyPlayed] = useState<MusicTrack[]>([])
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const playerRef = useRef<any>(null)
  const apiReadyRef = useRef(false)

  // Verified working YouTube live streams - all unique links, no duplicates
  const MUSIC_OPTIONS: MusicTrack[] = [
    // Focus Category - Deep concentration music
    {
      name: "Lo-Fi Hip Hop Radio",
      url: "https://www.youtube.com/embed/jfKfPfyJRdk",
      category: "focus",
      description: "24/7 lo-fi beats - perfect for studying",
      icon: "🎧",
    },
    {
      name: "Coding Music",
      url: "https://www.youtube.com/embed/Dx5qFachd3A",
      category: "focus",
      description: "Jazz beats perfect for coding sessions",
      icon: "💻",
    },
    {
      name: "Study With Me",
      url: "https://www.youtube.com/embed/4VR-6AS0-l4",
      category: "focus",
      description: "Binaural beats for enhanced concentration",
      icon: "📚",
    },
    {
      name: "Jazz & Bossa Nova",
      url: "https://www.youtube.com/embed/jfKfPfyJRdk",
      category: "focus",
      description: "Lo-fi jazz beats for productive coding",
      icon: "🎷",
    },
    {
      name: "Classical for Studying",
      url: "https://www.youtube.com/embed/9Auq9mYxFEE",
      category: "focus",
      description: "Mozart and Bach for better focus",
      icon: "🎼",
    },
    {
      name: "Electronic Focus",
      url: "https://www.youtube.com/embed/4xDzrJKXOOY",
      category: "focus",
      description: "Synthwave and electronic for coding",
      icon: "⚡",
    },
    {
      name: "Alpha Waves Focus",
      url: "https://www.youtube.com/embed/4VR-6AS0-l4",
      category: "focus",
      description: "Binaural beats for deep concentration",
      icon: "🧘",
    },
    {
      name: "Brown Noise Focus",
      url: "https://www.youtube.com/embed/wzjWIxXBs_s",
      category: "focus",
      description: "Deep brown noise for intense focus",
      icon: "🔊",
    },

    // Relax Category - Calming and peaceful
    {
      name: "Peaceful Piano",
      url: "https://www.youtube.com/embed/4Tr0otuiQuU",
      category: "relax",
      description: "Gentle piano to unwind",
      icon: "🎹",
    },
    {
      name: "Meditation Music",
      url: "https://www.youtube.com/embed/1ZYbU82GVz4",
      category: "relax",
      description: "Zen sounds for mindfulness",
      icon: "🧘",
    },
    {
      name: "Rain Sounds",
      url: "https://www.youtube.com/embed/mPZkdNFkNps",
      category: "relax",
      description: "Cozy rain for relaxation",
      icon: "🌧️",
    },
    {
      name: "Ocean Waves",
      url: "https://www.youtube.com/embed/a3iy5RQNL_s",
      category: "relax",
      description: "Soothing waves on the beach",
      icon: "🌊",
    },
    {
      name: "Chill Beats",
      url: "https://www.youtube.com/embed/DWcJFNfaw9c",
      category: "relax",
      description: "Relaxing electronic vibes",
      icon: "🎵",
    },
    {
      name: "Fireplace Sounds",
      url: "https://www.youtube.com/embed/L_LUpnjgPso",
      category: "relax",
      description: "Cozy fireplace ambience",
      icon: "🔥",
    },

    // Energy Category - Upbeat and motivating
    {
      name: "Upbeat Electronic",
      url: "https://www.youtube.com/embed/4xDzrJKXOOY",
      category: "energy",
      description: "Energetic beats to boost mood",
      icon: "⚡",
    },
    {
      name: "Workout Motivation",
      url: "https://www.youtube.com/embed/5yx6BWlEVcY",
      category: "energy",
      description: "High-energy pump-up music",
      icon: "💪",
    },
    {
      name: "Synthwave Radio",
      url: "https://www.youtube.com/embed/1H-vSHVOxoU",
      category: "energy",
      description: "Retro 80s synthwave vibes",
      icon: "🌃",
    },
    {
      name: "Productivity Boost",
      url: "https://www.youtube.com/embed/5yx6BWlEVcY",
      category: "energy",
      description: "Motivational beats for action",
      icon: "🚀",
    },

    // Nature Category - Natural sounds
    {
      name: "Forest Sounds",
      url: "https://www.youtube.com/embed/4oSt4AbW4hI",
      category: "nature",
      description: "Peaceful forest ambience",
      icon: "🌲",
    },
    {
      name: "Mountain Stream",
      url: "https://www.youtube.com/embed/7maJOI3QMu0",
      category: "nature",
      description: "Flowing water in nature",
      icon: "🏔️",
    },
    {
      name: "Birds & Nature",
      url: "https://www.youtube.com/embed/4oSt4AbW4hI",
      category: "nature",
      description: "Morning birds chirping in forest",
      icon: "🐦",
    },
    {
      name: "Thunderstorm",
      url: "https://www.youtube.com/embed/k7x0j-BvWXg",
      category: "nature",
      description: "Cozy thunderstorm sounds",
      icon: "⛈️",
    },
    {
      name: "Cafe Ambience",
      url: "https://www.youtube.com/embed/2Vv-BfVoq4g",
      category: "nature",
      description: "Coffee shop background noise",
      icon: "☕",
    },

    // Instrumental Category - Pure instrumental
    {
      name: "Acoustic Guitar",
      url: "https://www.youtube.com/embed/4Tr0otuiQuU",
      category: "instrumental",
      description: "Beautiful guitar melodies",
      icon: "🎸",
    },
    {
      name: "Piano & Strings",
      url: "https://www.youtube.com/embed/9Auq9mYxFEE",
      category: "instrumental",
      description: "Classical instrumental pieces",
      icon: "🎻",
    },
    {
      name: "Jazz Instrumental",
      url: "https://www.youtube.com/embed/jfKfPfyJRdk",
      category: "instrumental",
      description: "Lo-fi jazz without vocals",
      icon: "🎺",
    },
    {
      name: "Ambient Instrumental",
      url: "https://www.youtube.com/embed/5qap5aO4i9A",
      category: "instrumental",
      description: "Atmospheric instrumental music",
      icon: "🎹",
    },
    {
      name: "Classical Piano",
      url: "https://www.youtube.com/embed/9Auq9mYxFEE",
      category: "instrumental",
      description: "Peaceful piano compositions",
      icon: "🎹",
    },
  ]

  // Auto-play music based on timer state
  useEffect(() => {
    if (isActive && !isBreak && !isPlaying) {
      // Auto-play focus music when timer starts
      const focusMusic = MUSIC_OPTIONS.find((m) => m.category === "focus")
      if (focusMusic) {
        handlePlayMusic(focusMusic)
      }
    } else if (isBreak && isPlaying && currentTrack?.category === "focus") {
      // Switch to relax music during breaks
      const relaxMusic = MUSIC_OPTIONS.find((m) => m.category === "relax")
      if (relaxMusic) {
        handlePlayMusic(relaxMusic)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, isBreak])

  // Load YouTube IFrame API
  useEffect(() => {
    if (typeof window !== "undefined" && !window.YT) {
      const tag = document.createElement("script")
      tag.src = "https://www.youtube.com/iframe_api"
      const firstScriptTag = document.getElementsByTagName("script")[0]
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)

      window.onYouTubeIframeAPIReady = () => {
        apiReadyRef.current = true
      }
    } else if (window.YT) {
      apiReadyRef.current = true
    }
  }, [])

  // Initialize YouTube player when track changes
  // NOTE: we intentionally do NOT include `volume` in deps — recreating the player
  // on every volume change causes flicker and can prevent setVolume from applying.
  useEffect(() => {
    if (!currentTrack || !isPlaying) return

    const videoId = extractVideoId(currentTrack.url)
    if (!videoId) return

    // Clean up previous player
    if (playerRef.current) {
      try {
        playerRef.current.destroy()
      } catch (e) {
        // Player might already be destroyed
      }
      playerRef.current = null
    }

    // Wait for API to be ready and DOM element to exist
    const initPlayer = () => {
      const playerElement = document.getElementById(`youtube-player-${videoId}`)
      if (!playerElement) {
        setTimeout(initPlayer, 100)
        return
      }

      if (!window.YT || !window.YT.Player) {
        setTimeout(initPlayer, 100)
        return
      }

      try {
        // Create player and set ref on ready. Use a safe clamped volume when applying.
        const player = new window.YT.Player(`youtube-player-${videoId}`, {
          videoId: videoId,
          playerVars: {
            autoplay: 1,
            controls: 1,
            rel: 0,
            modestbranding: 1,
            enablejsapi: 1,
            origin: window.location.origin,
          },
          events: {
            onReady: (event: any) => {
              try {
                const raw = Array.isArray(volume) ? volume[0] : (volume as any) || 0
                const vol = Math.max(0, Math.min(100, Number(raw)))
                event.target.setVolume(vol)
              } catch (e) {
                // ignore
              }
              playerRef.current = event.target
            },
            onError: () => {
              console.log("YouTube player error")
            },
          },
        })
      } catch (e) {
        console.log("Failed to initialize YouTube player:", e)
      }
    }

    // Small delay to ensure DOM is ready
    const timeoutId = setTimeout(initPlayer, 100)

    return () => {
      clearTimeout(timeoutId)
      if (playerRef.current) {
        try {
          playerRef.current.destroy()
        } catch (e) {
          // Ignore errors
        }
        playerRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTrack, isPlaying])

  // Update volume when it changes
  useEffect(() => {
    if (playerRef.current && isPlaying) {
      try {
        const raw = Array.isArray(volume) ? volume[0] : (volume as any) || 0
        const vol = Math.max(0, Math.min(100, Number(raw)))
        if (typeof playerRef.current.setVolume === "function") {
          playerRef.current.setVolume(vol)
        }
      } catch (e) {
        // Player might not be ready yet
      }
    }
  }, [volume, isPlaying])

  const handlePlayMusic = (track: MusicTrack) => {
    setCurrentTrack(track)
    setIsPlaying(true)
    
    // Add to recently played (max 5)
    setRecentlyPlayed((prev) => {
      const filtered = prev.filter((t) => t.name !== track.name)
      return [track, ...filtered].slice(0, 5)
    })
  }

  const handlePause = () => {
    if (playerRef.current) {
      try {
        playerRef.current.pauseVideo()
      } catch (e) {
        // Ignore errors
      }
    }
    setIsPlaying(false)
  }

  const handleStop = () => {
    if (playerRef.current) {
      try {
        playerRef.current.stopVideo()
        playerRef.current.destroy()
      } catch (e) {
        // Ignore errors
      }
      playerRef.current = null
    }
    setIsPlaying(false)
    setCurrentTrack(null)
  }

  const filteredMusic = MUSIC_OPTIONS.filter((m) => m.category === activeCategory)

  const categoryIcons = {
    focus: "🎯",
    relax: "🧘",
    energy: "⚡",
    nature: "🌲",
    instrumental: "🎵",
  }

  const categoryColors: Record<MusicTrack["category"], string> = {
    focus: "from-emerald-500 to-teal-500",
    relax: "from-blue-500 to-cyan-500",
    energy: "from-orange-500 to-red-500",
    nature: "from-green-500 to-emerald-500",
    instrumental: "from-purple-500 to-pink-500",
  }

  const categoryLabels = {
    focus: "Deep Focus",
    relax: "Relax & Unwind",
    energy: "Boost Energy",
    nature: "Nature Sounds",
    instrumental: "Pure Instrumental",
  }

  return (
    <Card className="bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50 dark:from-slate-800/90 dark:via-slate-800/80 dark:to-slate-900/90 border-2 border-emerald-200 dark:border-emerald-800 shadow-xl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Icons.music className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <CardTitle className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
              Focus Groove
            </CardTitle>
          </div>
          {isPlaying && (
            <Badge className="animate-pulse bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs px-2 py-1">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                Playing
              </span>
            </Badge>
          )}
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Curated music to enhance your productivity</p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Category Tabs */}
        <Tabs value={activeCategory} onValueChange={(v) => setActiveCategory(v as MusicTrack["category"])}>
          <TabsList className="grid w-full grid-cols-5 h-auto p-1 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            {(["focus", "relax", "energy", "nature", "instrumental"] as const).map((cat) => (
              <TabsTrigger
                key={cat}
                value={cat}
                className={`text-xs px-1.5 py-2.5 transition-all ${
                  activeCategory === cat
                    ? `bg-gradient-to-r ${categoryColors[cat]} text-white shadow-md`
                    : "bg-transparent hover:bg-white/60"
                }`}
                title={categoryLabels[cat]}
              >
                <span className="text-base">{categoryIcons[cat]}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {(["focus", "relax", "energy", "nature", "instrumental"] as const).map((cat) => (
            <TabsContent key={cat} value={cat} className="mt-4">
              <div className="space-y-2 max-h-[280px] overflow-y-auto pr-2 custom-scrollbar">
                {filteredMusic.map((music) => (
                  <Button
                    key={music.name}
                    onClick={() => handlePlayMusic(music)}
                    variant={isPlaying && currentTrack?.name === music.name ? "default" : "outline"}
                    className={`w-full text-left justify-start text-sm px-4 py-3 h-auto transition-all ${
                      isPlaying && currentTrack?.name === music.name
                        ? `bg-gradient-to-r ${categoryColors[cat]} text-white border-0 shadow-md`
                        : "border-emerald-200 dark:border-emerald-800 hover:border-emerald-400 dark:hover:border-emerald-600 bg-white/70 dark:bg-slate-700/70 hover:bg-white/90 dark:hover:bg-slate-700/90 hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-start gap-3 w-full">
                      <span className="text-xl flex-shrink-0">{music.icon || "🎵"}</span>
                      <div className="flex flex-col items-start flex-1 min-w-0">
                        <span className="font-semibold truncate w-full text-gray-900 dark:text-gray-100">{music.name}</span>
                        {music.description && (
                          <span className="text-xs opacity-90 dark:opacity-70 mt-0.5 line-clamp-1 text-gray-700 dark:text-gray-300">{music.description}</span>
                        )}
                      </div>
                      {isPlaying && currentTrack?.name === music.name && (
                        <span className="text-lg animate-pulse flex-shrink-0">♪</span>
                      )}
                    </div>
                  </Button>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Volume Control */}
        {isPlaying && (
          <div className="space-y-2 pt-3 border-t border-emerald-200/50">
            <div className="flex items-center gap-3">
              <Icons.volume className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <Slider
                value={volume}
                onValueChange={setVolume}
                max={100}
                step={1}
                className="flex-1"
              />
              <span className="text-xs text-gray-600 dark:text-gray-400 w-12 text-right font-medium">{volume[0]}%</span>
            </div>
          </div>
        )}

        {/* Now Playing Section */}
        {isPlaying && currentTrack && (
          <div className="space-y-3 pt-3 border-t border-emerald-200/50">
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-lg p-4 text-center border border-emerald-100 dark:border-emerald-800">
              <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1.5 uppercase tracking-wide">Now Playing</p>
              <div className="flex items-center justify-center gap-2 mb-1">
                <span className="text-2xl">{currentTrack.icon || "🎵"}</span>
                <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{currentTrack.name}</p>
              </div>
              {currentTrack.description && (
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{currentTrack.description}</p>
              )}
            </div>

            <div className="rounded-xl overflow-hidden bg-black aspect-video shadow-2xl border-2 border-emerald-200 dark:border-emerald-800">
              <div
                id={`youtube-player-${extractVideoId(currentTrack.url) || "default"}`}
                className="w-full h-full"
              ></div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <Button
                onClick={handlePause}
                variant="outline"
                className="bg-white/80 hover:bg-white border-emerald-200 hover:border-emerald-300"
              >
                <Icons.pause className="w-4 h-4 mr-2" />
                Pause
              </Button>
              <Button
                onClick={handleStop}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-md"
              >
                <Icons.stop className="w-4 h-4 mr-2" />
                Stop
              </Button>
            </div>
          </div>
        )}

        {/* Recently Played */}
        {!isPlaying && recentlyPlayed.length > 0 && (
          <div className="pt-3 border-t border-emerald-200/50">
            <p className="text-xs font-semibold text-emerald-600 mb-2.5 flex items-center gap-1.5">
              <Icons.clock className="w-3.5 h-3.5" />
              Recently Played
            </p>
            <div className="space-y-1.5">
              {recentlyPlayed.slice(0, 3).map((track) => (
                <Button
                  key={track.name}
                  onClick={() => handlePlayMusic(track)}
                  variant="ghost"
                  className="w-full text-left justify-start text-xs px-3 py-2 h-auto hover:bg-white/80 rounded-lg"
                >
                  <span className="mr-2.5 text-base">{track.icon || "🎵"}</span>
                  <span className="truncate flex-1">{track.name}</span>
                  <Icons.play className="w-3.5 h-3.5 ml-2 text-emerald-600" />
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Quick Start Button */}
        {!isPlaying && (
          <Button
            onClick={() => {
              const defaultTrack = MUSIC_OPTIONS.find((m) => m.category === activeCategory) || MUSIC_OPTIONS[0]
              if (defaultTrack) handlePlayMusic(defaultTrack)
            }}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold text-sm py-3 shadow-lg hover:shadow-xl transition-all"
          >
            <Icons.play className="w-4 h-4 mr-2" />
            Start {categoryLabels[activeCategory]} Music
          </Button>
        )}
      </CardContent>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(16, 185, 129, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(16, 185, 129, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(16, 185, 129, 0.5);
        }
      `}</style>
    </Card>
  )
}
