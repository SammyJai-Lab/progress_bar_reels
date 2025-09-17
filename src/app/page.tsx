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
    
    oscillator.frequency.setValueAtTime(2000, audioContext.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(1000, audioContext.currentTime + 0.05)
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05)
    
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.05)
  }

  // Check if number has changed and play sound
  const checkAndPlaySound = (currentValue: number) => {
    const roundedValue = Number(currentValue.toFixed(2));
    if (roundedValue !== lastPlayedValueRef.current) {
      playClickSound();
      lastPlayedValueRef.current = roundedValue;
    }
  }

  // Draw 2D progress bar with white border box
  const drawProgressBar = (progress: number) => {
    const canvas = progressCanvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = 1080
    canvas.height = 1920

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const barWidth = 400
    const barHeight = 40
    const barX = (canvas.width - barWidth) / 2
    const barY = canvas.height / 2 - barHeight / 2

    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 3
    ctx.strokeRect(barX - 5, barY - 5, barWidth + 10, barHeight + 10)

    ctx.fillStyle = '#333333'
    ctx.fillRect(barX, barY, barWidth, barHeight)

    const fillWidth = (progress / 100) * barWidth
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(barX, barY, fillWidth, barHeight)

    ctx.shadowColor = 'rgba(255, 255, 255, 0.8)'
    ctx.shadowBlur = 15
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 48px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(`${progress.toFixed(2)}%`, canvas.width / 2, barY + barHeight + 60)
    
    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0
  }

  // [Other functions like startAnimation, useEffect for cleanup, etc., remain unchanged]

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      <canvas
        ref={backgroundCanvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ width: '100%', height: '100%' }}
      />
      
      <canvas
        ref={progressCanvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ width: '100%', height: '100%' }}
      />
      
      {showUI && (
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8">
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
                  onChange={(e) => {
                    const value = e.target.value;
                    setStartValue(value === '' ? 0 : Number(Number(value).toFixed(2)));
                  }}
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
                  onChange={(e) => {
                    const value = e.target.value;
                    setTargetValue(value === '' ? 0 : Number(Number(value).toFixed(2)));
                  }}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white"
                  min="0"
                  max="100"
                  step="0.01"
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
      
      {showCountdown && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-20">
          <div className="text-9xl font-bold text-white">
            {countdown}
          </div>
        </div>
      )}
      
      {isRecording && !showCountdown && (
        <div className="fixed top-8 right-8 flex items-center gap-2 bg-red-600 px-4 py-2 rounded-full">
          <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
          <span className="text-white font-medium">RECORDING</span>
        </div>
      )}
    </div>
  )
}