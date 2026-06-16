import { useEffect, useRef, useState, useCallback } from 'react';
import type { MutableRefObject } from 'react';
import GameCanvas from '@/components/GameCanvas';
import MainMenu from '@/components/MainMenu';
import GameHUD from '@/components/GameHUD';
import GameOver from '@/components/GameOver';
import Countdown from '@/components/Countdown';
import { GameEngine } from '@/game/GameEngine';
import type { GameState } from '@/game/types';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null) as MutableRefObject<GameEngine | null>;

  const [gameState, setGameState] = useState<GameState>('menu');
  const [score, setScore] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [level, setLevel] = useState(1);
  const [countdown, setCountdown] = useState(3);
  const [finalScore, setFinalScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [shakeClass, setShakeClass] = useState('');

  const handleScoreUpdate = useCallback((newScore: number) => {
    setScore(newScore);
  }, []);

  const handleSpeedUpdate = useCallback((newSpeed: number, newLevel: number) => {
    setSpeed(newSpeed);
    setLevel(newLevel);
  }, []);

  const handleGameOver = useCallback((scoreVal: number) => {
    setFinalScore(scoreVal);
    const prevHigh = engineRef.current?.getHighScore() ?? 0;
    setHighScore(prevHigh);
    setIsNewRecord(scoreVal >= prevHigh && scoreVal > 0);
  }, []);

  const handleCountdown = useCallback((value: number) => {
    setCountdown(value);
  }, []);

  const handleStateChange = useCallback((state: GameState) => {
    setGameState(state);
  }, []);

  const handleShake = useCallback(() => {
    setShakeClass('animate-shake');
    setTimeout(() => setShakeClass(''), 500);
  }, []);

  useEffect(() => {
    const engine = new GameEngine({
      onScoreUpdate: handleScoreUpdate,
      onSpeedUpdate: handleSpeedUpdate,
      onGameOver: handleGameOver,
      onCountdown: handleCountdown,
      onStateChange: handleStateChange,
      onShake: handleShake,
    });
    engineRef.current = engine;
    setHighScore(engine.getHighScore());

    return () => {
      engine.destroy();
    };
  }, [handleScoreUpdate, handleSpeedUpdate, handleGameOver, handleCountdown, handleStateChange, handleShake]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const engine = engineRef.current;
    if (!canvas || !engine) return;

    engine.init(canvas);
  }, []);

  const handleStart = useCallback(() => {
    engineRef.current?.startGame();
  }, []);

  const handlePause = useCallback(() => {
    engineRef.current?.togglePause();
  }, []);

  const handleRestart = useCallback(() => {
    engineRef.current?.startGame();
  }, []);

  const handleMenu = useCallback(() => {
    engineRef.current?.goToMenu();
    setHighScore(engineRef.current?.getHighScore() ?? 0);
  }, []);

  const showMenu = gameState === 'menu';
  const showCountdown = gameState === 'countdown';
  const showHUD = gameState === 'playing' || gameState === 'paused' || gameState === 'countdown';
  const showGameOver = gameState === 'gameover';

  return (
    <div className={`relative w-screen h-screen overflow-hidden ${shakeClass}`}>
      <GameCanvas
        engineRef={engineRef as MutableRefObject<unknown>}
        canvasRef={canvasRef}
      />

      <div className="scanline-overlay" />

      {showMenu && (
        <MainMenu
          highScore={highScore}
          onStart={handleStart}
        />
      )}

      {showHUD && !showMenu && (
        <GameHUD
          score={score}
          speed={speed}
          level={level}
          isPaused={gameState === 'paused'}
          onPause={handlePause}
        />
      )}

      {showCountdown && (
        <Countdown value={countdown} />
      )}

      {gameState === 'paused' && (
        <div className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <p
              className="font-orbitron font-black neon-text-yellow animate-pulse-slow"
              style={{ fontSize: 'clamp(3rem, 10vw, 6rem)' }}
            >
              暂停
            </p>
            <p className="text-gray-400 mt-4 text-sm md:text-base tracking-wider">
              按 <span className="neon-text-cyan">空格键</span> 继续
            </p>
          </div>
        </div>
      )}

      {showGameOver && (
        <GameOver
          score={finalScore}
          highScore={highScore}
          isNewRecord={isNewRecord}
          onRestart={handleRestart}
          onMenu={handleMenu}
        />
      )}
    </div>
  );
}
