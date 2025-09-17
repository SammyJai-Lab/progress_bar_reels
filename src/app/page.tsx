'use client'

import { useState, useRef, useEffect } from 'react'

export default function Home() {
  const [startValue, setStartValue] = useState(0)
  const [targetValue, setTargetValue] = useState(100)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [showCountdown, setShowCountdown] = useState(false)
  const [countdown, setCountdown] = useState(3)
  const [currentProgress, setCurrentProgress] = useState(0)
  const [showUI, setShowUI] = useState(true)
  
  const backgroundCanvasRef = useRef<HTMLCanvasElement>(null)
  const progressCanvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const mediaRecorderRef = useRef<MediaRecorder>()
  const chunksRef = useRef<Blob[]>([])
  const audioContextRef = useRef<AudioContext>()
  const lastPlayedValueRef = useRef<number>(0)

  // Easing function for smooth animation
  const easeInOutCubic = (t: number): number => {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
  }

  // Initialize audio context and create click sound
  const initAudio = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
  }

  // Play click sound
  const playClickSound = () => {
    if (!audioContextRef.current) return
    
    const audioContext = audioContextRef.current
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    // Create a short, high-frequency click sound
    oscillator.frequency.setValueAtTime(2000, audioContext.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(1000, audioContext.currentTime + 0.05)
    
    // Create a quick envelope for the click
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05)
    
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.05)
  }

  // Check if number has changed and play sound
  const checkAndPlaySound = (currentValue: number) => {
    const roundedValue = Math.round(currentValue)
    if (roundedValue !== lastPlayedValueRef.current) {
      playClickSound()
      lastPlayedValueRef.current = roundedValue
    }
  }

  // Initialize clean black background (no particles)
  useEffect(() => {
    const canvas = backgroundCanvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = 1080
    canvas.height = 1920

    // Fill with solid black background
    ctx.fillStyle = '#000000'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  // Draw 2D progress bar with white border box
  const drawProgressBar = (progress: number) => {
    const canvas = progressCanvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = 1080
    canvas.height = 1920

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Progress bar dimensions (matching the script proportions)
    const barWidth = 400
    const barHeight = 40
    const barX = (canvas.width - barWidth) / 2
    const barY = canvas.height / 2 - barHeight / 2

    // Draw white border box
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 3
    ctx.strokeRect(barX - 5, barY - 5, barWidth + 10, barHeight + 10)

    // Draw background bar (empty) - dark gray
    ctx.fillStyle = '#333333'
    ctx.fillRect(barX, barY, barWidth, barHeight)

    // Draw progress fill (white)
    const fillWidth = (progress / 100) * barWidth
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(barX, barY, fillWidth, barHeight)

    // Draw percentage text with glow
    ctx.shadowColor = 'rgba(255, 255, 255, 0.8)'
    ctx.shadowBlur = 15
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 48px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(`${Math.round(progress)}%`, canvas.width / 2, barY + barHeight + 60)
    
    // Reset shadow
    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0
  }

  // Start animation
  const startAnimation = (isExport = false) => {
    if (isAnimating) return
    
    // Initialize audio on first user interaction
    initAudio()
    
    setIsAnimating(true)
    setIsRecording(isExport)
    setShowCountdown(true)
    setCountdown(3)
    
    // Reset last played value
    lastPlayedValueRef.current = Math.round(startValue)
    
    // Hide UI during preview
    if (!isExport) {
      setShowUI(false)
    }
    
    // Countdown
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev === 1) {
          clearInterval(countdownInterval)
          setShowCountdown(false)
          
          // Start actual animation
          setCurrentProgress(startValue)
          const startTime = performance.now()
          const duration = 5000 // 5 seconds
          
          const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime
            const rawProgress = Math.min(elapsed / duration, 1)
            
            // Apply easing function for smoother animation
            const easedProgress = easeInOutCubic(rawProgress)
            
            // Calculate current progress value
            const currentValue = startValue + (targetValue - startValue) * easedProgress
            setCurrentProgress(currentValue)
            
            // Check if number changed and play sound
            checkAndPlaySound(currentValue)
            
            // Draw progress bar
            drawProgressBar(currentValue)
            
            if (rawProgress < 1) {
              animationRef.current = requestAnimationFrame(animate)
            } else {
              setIsAnimating(false)
              // Show UI again after animation completes
              setTimeout(() => {
                setShowUI(true)
              }, 1000)
              
              if (isExport && mediaRecorderRef.current?.state === 'recording') {
                mediaRecorderRef.current.stop()
              }
            }
          }
          
          animationRef.current = requestAnimationFrame(animate)
          
          // Start recording if exporting
          if (isExport) {
            // Hide UI during export recording
            setShowUI(false)
            
            const stream = progressCanvasRef.current!.captureStream(30)
            chunksRef.current = []
            
            mediaRecorderRef.current = new MediaRecorder(stream, {
              mimeType: 'video/webm;codecs=vp9'
            })
            
            mediaRecorderRef.current.ondataavailable = (e) => {
              chunksRef.current.push(e.data)
            }
            
            mediaRecorderRef.current.onstop = () => {
              const blob = new Blob(chunksRef.current, { type: 'video/webm' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = 'progress-bar.webm'
              a.click()
              URL.revokeObjectURL(url)
              
              // Show UI again after export
              setTimeout(() => {
                setShowUI(true)
              }, 1000)
            }
            
            mediaRecorderRef.current.start()
          }
          
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  // Cleanup
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      // Clean up audio context
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      {/* Background Canvas */}
      <canvas
        ref={backgroundCanvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ width: '100%', height: '100%' }}
      />
      
      {/* Progress Canvas */}
      <canvas
        ref={progressCanvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ width: '100%', height: '100%' }}
      />
      
      {/* UI Overlay - Only shown when showUI is true */}
      {showUI && (
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8">
          {/* Control Panel */}
          <div className="bg-black/80 backdrop-blur-sm border border-white/20 rounded-lg p-6 max-w-md w-full">
            <h1 className="text-2xl font-bold text-white mb-6 text-center">3D Progress Bar</h1>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Start Value (%)
                </label>
                <input
                  type="number"
                  value={startValue}
                  onChange={(e) => setStartValue(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white"
                  min="0"
                  max="100"
                  step="0.01"
                  disabled={isAnimating}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Target Value (%)
                </label>
                <input
                  type="number"
                  value={targetValue}
                  onChange={(e) => setTargetValue(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white"
                  min="0"
                  max="100"
                  disabled={isAnimating}
                />
              </div>
              
              <div className="flex gap-4">
                <button
                  onClick={() => startAnimation(false)}
                  disabled={isAnimating}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-md transition-colors"
                >
                  Preview
                </button>
                
                <button
                  onClick={() => startAnimation(true)}
                  disabled={isAnimating}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-md transition-colors"
                >
                  Export Video
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Countdown Overlay - Always shown when active */}
      {showCountdown && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-20">
          <div className="text-9xl font-bold text-white">
            {countdown}
          </div>
        </div>
      )}
      
      {/* Recording Indicator - Always shown when active */}
      {isRecording && !showCountdown && (
        <div className="fixed top-8 right-8 flex items-center gap-2 bg-red-600 px-4 py-2 rounded-full">
          <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
          <span className="text-white font-medium">RECORDING</span>
        </div>
      )}
    </div>
  )
}