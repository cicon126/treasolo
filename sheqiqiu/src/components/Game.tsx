import { useState, useEffect, useCallback, useRef } from 'react'

interface Balloon {
  id: string
  x: number
  y: number
  color: string
  size: number
  speed: number
  wobble: number
  wobbleSpeed: number
}

interface ScorePopup {
  id: string
  x: number
  y: number
}

const BALLOON_COLORS = ['#FF6B6B', '#FFE66D', '#4ECDC4', '#45B7D1', '#96CEB4', '#FF8E72', '#DDA0DD', '#98D8C8']
const GAME_DURATION = 60
const BALLOON_SPAWN_INTERVAL = 1500

function Game() {
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION)
  const [balloons, setBalloons] = useState<Balloon[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [scorePopups, setScorePopups] = useState<ScorePopup[]>([])
  const gameAreaRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number>()

  const generateBalloon = useCallback((): Balloon => {
    const size = Math.random() * 40 + 50
    const gameWidth = gameAreaRef.current?.clientWidth || window.innerWidth
    
    return {
      id: Math.random().toString(36).substr(2, 9),
      x: Math.random() * (gameWidth - size * 2) + size,
      y: window.innerHeight + size,
      color: BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)],
      size,
      speed: Math.random() * 2 + 1,
      wobble: 0,
      wobbleSpeed: Math.random() * 0.05 + 0.02
    }
  }, [])

  const startGame = useCallback(() => {
    setScore(0)
    setTimeLeft(GAME_DURATION)
    setBalloons([])
    setScorePopups([])
    setIsPlaying(true)
  }, [])

  const popBalloon = useCallback((balloon: Balloon) => {
    setScore(prev => prev + 10)
    setBalloons(prev => prev.filter(b => b.id !== balloon.id))
    
    const popup: ScorePopup = {
      id: Math.random().toString(36).substr(2, 9),
      x: balloon.x,
      y: balloon.y
    }
    setScorePopups(prev => [...prev, popup])
    
    setTimeout(() => {
      setScorePopups(prev => prev.filter(p => p.id !== popup.id))
    }, 800)
  }, [])

  useEffect(() => {
    if (!isPlaying) return

    const spawnBalloon = () => {
      if (isPlaying && balloons.length < 15) {
        setBalloons(prev => [...prev, generateBalloon()])
      }
    }

    const spawnInterval = setInterval(spawnBalloon, BALLOON_SPAWN_INTERVAL)
    return () => clearInterval(spawnInterval)
  }, [isPlaying, balloons.length, generateBalloon])

  useEffect(() => {
    if (!isPlaying) return

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsPlaying(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isPlaying])

  useEffect(() => {
    if (!isPlaying) return

    const animate = () => {
      const gameWidth = gameAreaRef.current?.clientWidth || window.innerWidth
      
      setBalloons(prev => prev
        .map(balloon => ({
          ...balloon,
          y: balloon.y - balloon.speed,
          wobble: balloon.wobble + balloon.wobbleSpeed,
          x: balloon.x + Math.sin(balloon.wobble) * 2
        }))
        .filter(balloon => balloon.y > -balloon.size * 2 && balloon.x > -balloon.size && balloon.x < gameWidth + balloon.size)
      )

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isPlaying])

  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isPlaying) return

    const rect = gameAreaRef.current?.getBoundingClientRect()
    if (!rect) return

    const clickX = e.clientX - rect.left
    const clickY = e.clientY - rect.top

    for (const balloon of balloons) {
      const dx = clickX - balloon.x
      const dy = clickY - balloon.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < balloon.size / 2) {
        popBalloon(balloon)
        break
      }
    }
  }, [isPlaying, balloons, popBalloon])

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-gradient-to-b from-sky-300 via-sky-200 to-sky-100">
      <div className="cloud w-24 h-12 top-10 left-[10%] opacity-80" style={{ animation: 'float 8s ease-in-out infinite' }} />
      <div className="cloud w-32 h-16 top-20 left-[60%] opacity-70" style={{ animation: 'float 10s ease-in-out infinite 2s' }} />
      <div className="cloud w-20 h-10 top-16 left-[85%] opacity-60" style={{ animation: 'float 7s ease-in-out infinite 1s' }} />
      <div className="cloud w-28 h-14 top-8 left-[35%] opacity-50" style={{ animation: 'float 9s ease-in-out infinite 3s' }} />

      <div className="absolute top-4 left-4 z-10">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl px-6 py-3 shadow-lg">
          <span className="text-gray-600 text-sm">得分</span>
          <p className="text-3xl font-bold text-indigo-600">{score}</p>
        </div>
      </div>

      <div className="absolute top-4 right-4 z-10">
        <div className={`bg-white/80 backdrop-blur-sm rounded-xl px-6 py-3 shadow-lg ${timeLeft <= 10 ? 'animate-pulse bg-red-100/80' : ''}`}>
          <span className="text-gray-600 text-sm">剩余时间</span>
          <p className={`text-3xl font-bold ${timeLeft <= 10 ? 'text-red-500' : 'text-indigo-600'}`}>{timeLeft}s</p>
        </div>
      </div>

      <div 
        ref={gameAreaRef}
        onClick={handleClick}
        className={`absolute inset-0 cursor-crosshair ${isPlaying ? '' : 'cursor-default'}`}
      >
        {balloons.map(balloon => (
          <div
            key={balloon.id}
            className="balloon animate-float"
            style={{
              left: balloon.x - balloon.size / 2,
              top: balloon.y - balloon.size / 2,
              width: balloon.size,
              height: balloon.size * 1.2,
              backgroundColor: balloon.color,
              color: balloon.color,
              borderRadius: '50% 50% 50% 50% / 45% 45% 55% 55%',
              boxShadow: `inset -10px -10px 20px rgba(0,0,0,0.2), inset 10px 10px 20px rgba(255,255,255,0.5)`,
              animationDelay: `${balloon.wobble}s`
            }}
          >
            <div 
              className="absolute top-2 left-4 w-4 h-4 bg-white/60 rounded-full blur-sm"
              style={{ filter: 'blur(2px)' }}
            />
          </div>
        ))}

        {scorePopups.map(popup => (
          <div
            key={popup.id}
            className="absolute score-popup text-2xl font-bold text-yellow-400 drop-shadow-lg pointer-events-none"
            style={{
              left: popup.x,
              top: popup.y,
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
            }}
          >
            +10
          </div>
        ))}
      </div>

      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-20">
          <div className="bg-white rounded-3xl p-8 text-center shadow-2xl max-w-sm mx-4">
            {timeLeft === GAME_DURATION ? (
              <>
                <h1 className="text-4xl font-bold text-indigo-600 mb-2">🎈 射击气球</h1>
                <p className="text-gray-600 mb-6">点击飘浮的气球来得分！<br />60秒内获取最高分！</p>
                <button
                  onClick={startGame}
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-8 py-4 rounded-full text-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                >
                  开始游戏
                </button>
              </>
            ) : (
              <>
                <h2 className="text-3xl font-bold text-indigo-600 mb-2">⏰ 游戏结束！</h2>
                <p className="text-gray-600 mb-2">最终得分</p>
                <p className="text-5xl font-bold text-yellow-500 mb-6">{score}</p>
                <button
                  onClick={startGame}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-4 rounded-full text-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                >
                  再玩一次
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {isPlaying && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/80 backdrop-blur-sm rounded-full px-6 py-2 shadow-lg">
          <span className="text-gray-600 text-sm">点击气球射击 | 每球+10分</span>
        </div>
      )}
    </div>
  )
}

export default Game