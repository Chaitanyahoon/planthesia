// YouTube IFrame API types
declare global {
  interface Window {
    YT: {
      Player: new (
        elementId: string,
        config: {
          videoId?: string
          playerVars?: {
            autoplay?: number
            controls?: number
            rel?: number
            modestbranding?: number
            enablejsapi?: number
            origin?: string
          }
          events?: {
            onReady?: (event: { target: YT.Player }) => void
            onError?: () => void
          }
        }
      ) => YT.Player
      PlayerState: {
        UNSTARTED: number
        ENDED: number
        PLAYING: number
        PAUSED: number
        BUFFERING: number
        CUED: number
      }
    }
    onYouTubeIframeAPIReady?: () => void
  }

  namespace YT {
    interface Player {
      playVideo(): void
      pauseVideo(): void
      stopVideo(): void
      setVolume(volume: number): void
      getVolume(): number
      destroy(): void
    }
  }
}

export {}

