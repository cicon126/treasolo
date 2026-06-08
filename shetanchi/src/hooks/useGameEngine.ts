import { useCallback, useEffect, useRef, useState } from 'react';
import { Direction, FOOD_SCORE, LevelConfig, LEVELS, Point } from '../utils/levels';
import { speech } from '../utils/speech';
import { loadGameData, saveGameData, unlockLevel, updateHighScore } from '../utils/storage';

export interface GameEngineState {
  snake: Point[];
  food: Point;
  direction: Direction;
  score: number;
  level: number;
  lives: number;
  isPlaying: boolean;
  isPaused: boolean;
  isGameOver: boolean;
  isVictory: boolean;
  highScore: number;
  unlockedLevels: number[];
  currentLevelConfig: LevelConfig;
  targetScore: number;
}

function getInitialSnake(gridSize: number): Point[] {
  const center = Math.floor(gridSize / 2);
  return [
    { x: center, y: center },
    { x: center - 1, y: center },
    { x: center - 2, y: center },
  ];
}

function getRandomFood(gridSize: number, snake: Point[], obstacles: Point[]): Point {
  const used = new Set<string>();
  snake.forEach(p => used.add(`${p.x},${p.y}`));
  obstacles.forEach(p => used.add(`${p.x},${p.y}`));

  while (true) {
    const x = Math.floor(Math.random() * gridSize);
    const y = Math.floor(Math.random() * gridSize);
    if (!used.has(`${x},${y}`)) return { x, y };
  }
}

function isOpposite(a: Direction, b: Direction): boolean {
  return (a === 'UP' && b === 'DOWN') || (a === 'DOWN' && b === 'UP') ||
    (a === 'LEFT' && b === 'RIGHT') || (a === 'RIGHT' && b === 'LEFT');
}

export function useGameEngine() {
  const data = loadGameData();
  const levelConfig = LEVELS[data.lastPlayedLevel - 1] ?? LEVELS[0];
  const initialSnake = getInitialSnake(levelConfig.gridSize);

  const [state, setState] = useState<GameEngineState>({
    snake: initialSnake,
    food: getRandomFood(levelConfig.gridSize, initialSnake, levelConfig.obstacles),
    direction: 'RIGHT',
    score: 0,
    level: data.lastPlayedLevel,
    lives: levelConfig.lives,
    isPlaying: false,
    isPaused: false,
    isGameOver: false,
    isVictory: false,
    highScore: data.highScore,
    unlockedLevels: data.unlockedLevels,
    currentLevelConfig: levelConfig,
    targetScore: levelConfig.targetScore,
  });

  const nextDirectionRef = useRef<Direction>('RIGHT');
  const gameLoopRef = useRef<number | null>(null);
  const lastTickRef = useRef<number>(0);

  const resetToLevel = useCallback((levelNum: number) => {
    const cfg = LEVELS[levelNum - 1] ?? LEVELS[0];
    const snake = getInitialSnake(cfg.gridSize);
    nextDirectionRef.current = 'RIGHT';
    saveGameData({ lastPlayedLevel: levelNum });
    setState(prev => ({
      ...prev,
      snake,
      food: getRandomFood(cfg.gridSize, snake, cfg.obstacles),
      direction: 'RIGHT',
      score: 0,
      level: levelNum,
      lives: cfg.lives,
      isPlaying: false,
      isPaused: false,
      isGameOver: false,
      isVictory: false,
      currentLevelConfig: cfg,
      targetScore: cfg.targetScore,
    }));
  }, []);

  const setDirection = useCallback((dir: Direction) => {
    setState(prev => {
      if (isOpposite(prev.direction, dir)) return prev;
      nextDirectionRef.current = dir;
      return prev;
    });
  }, []);

  const startGame = useCallback((levelNum?: number) => {
    speech.cancel();
    if (levelNum !== undefined) {
      const cfg = LEVELS[levelNum - 1] ?? LEVELS[0];
      const snake = getInitialSnake(cfg.gridSize);
      nextDirectionRef.current = 'RIGHT';
      saveGameData({ lastPlayedLevel: levelNum });
      setState({
        snake,
        food: getRandomFood(cfg.gridSize, snake, cfg.obstacles),
        direction: 'RIGHT',
        score: 0,
        level: levelNum,
        lives: cfg.lives,
        isPlaying: true,
        isPaused: false,
        isGameOver: false,
        isVictory: false,
        highScore: loadGameData().highScore,
        unlockedLevels: loadGameData().unlockedLevels,
        currentLevelConfig: cfg,
        targetScore: cfg.targetScore,
      });
      speech.startLevel(levelNum);
    } else {
      setState(prev => {
        speech.startLevel(prev.level);
        return { ...prev, isPlaying: true, isPaused: false };
      });
    }
  }, []);

  const togglePause = useCallback(() => {
    setState(prev => {
      const nextPaused = !prev.isPaused;
      if (nextPaused) speech.pause(); else speech.resume();
      return { ...prev, isPaused: nextPaused };
    });
  }, []);

  const goToMenu = useCallback(() => {
    speech.cancel();
    const data = loadGameData();
    setState(prev => ({ ...prev, isPlaying: false, isPaused: false, isGameOver: false, isVictory: false, highScore: data.highScore, unlockedLevels: data.unlockedLevels }));
  }, []);

  const nextLevel = useCallback(() => {
    setState(prev => {
      const nextLv = Math.min(prev.level + 1, LEVELS.length);
      const cfg = LEVELS[nextLv - 1];
      const snake = getInitialSnake(cfg.gridSize);
      nextDirectionRef.current = 'RIGHT';
      saveGameData({ lastPlayedLevel: nextLv });
      unlockLevel(nextLv);
      speech.startLevel(nextLv);
      return {
        ...prev,
        snake,
        food: getRandomFood(cfg.gridSize, snake, cfg.obstacles),
        direction: 'RIGHT',
        score: 0,
        level: nextLv,
        lives: cfg.lives,
        isPlaying: true,
        isPaused: false,
        isGameOver: false,
        isVictory: false,
        currentLevelConfig: cfg,
        targetScore: cfg.targetScore,
        unlockedLevels: loadGameData().unlockedLevels,
      };
    });
  }, []);

  const retry = useCallback(() => {
    setState(prev => {
      const cfg = prev.currentLevelConfig;
      const snake = getInitialSnake(cfg.gridSize);
      nextDirectionRef.current = 'RIGHT';
      speech.startLevel(prev.level);
      return {
        ...prev,
        snake,
        food: getRandomFood(cfg.gridSize, snake, cfg.obstacles),
        direction: 'RIGHT',
        score: 0,
        lives: cfg.lives,
        isPlaying: true,
        isPaused: false,
        isGameOver: false,
        isVictory: false,
      };
    });
  }, []);

  useEffect(() => {
    if (!state.isPlaying || state.isPaused || state.isGameOver || state.isVictory) {
      if (gameLoopRef.current !== null) {
        cancelAnimationFrame(gameLoopRef.current);
        gameLoopRef.current = null;
      }
      return;
    }

    const speed = state.currentLevelConfig.speed;

    const loop = (time: number) => {
      if (time - lastTickRef.current >= speed) {
        lastTickRef.current = time;
        tick();
      }
      gameLoopRef.current = requestAnimationFrame(loop);
    };

    gameLoopRef.current = requestAnimationFrame(loop);

    return () => {
      if (gameLoopRef.current !== null) {
        cancelAnimationFrame(gameLoopRef.current);
        gameLoopRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.isPlaying, state.isPaused, state.isGameOver, state.isVictory, state.currentLevelConfig.speed]);

  function tick() {
    setState(prev => {
      if (!prev.isPlaying || prev.isPaused || prev.isGameOver || prev.isVictory) return prev;

      const cfg = prev.currentLevelConfig;
      const direction = nextDirectionRef.current;
      const head = prev.snake[0];
      let newHead: Point;

      switch (direction) {
        case 'UP': newHead = { x: head.x, y: head.y - 1 }; break;
        case 'DOWN': newHead = { x: head.x, y: head.y + 1 }; break;
        case 'LEFT': newHead = { x: head.x - 1, y: head.y }; break;
        case 'RIGHT': newHead = { x: head.x + 1, y: head.y }; break;
      }

      const hitWall = newHead.x < 0 || newHead.y < 0 || newHead.x >= cfg.gridSize || newHead.y >= cfg.gridSize;
      const hitObstacle = cfg.obstacles.some(o => o.x === newHead.x && o.y === newHead.y);
      const hitSelf = prev.snake.some(p => p.x === newHead.x && p.y === newHead.y);

      if (hitWall || hitObstacle || hitSelf) {
        const newLives = prev.lives - 1;
        if (newLives <= 0) {
          speech.gameOver();
          updateHighScore(prev.score);
          const data = loadGameData();
          return { ...prev, lives: 0, isPlaying: false, isGameOver: true, highScore: data.highScore };
        } else {
          speech.loseLife();
          const snake = getInitialSnake(cfg.gridSize);
          nextDirectionRef.current = 'RIGHT';
          return {
            ...prev,
            snake,
            food: getRandomFood(cfg.gridSize, snake, cfg.obstacles),
            direction: 'RIGHT',
            lives: newLives,
          };
        }
      }

      const ateFood = newHead.x === prev.food.x && newHead.y === prev.food.y;
      let newSnake: Point[];
      if (ateFood) {
        newSnake = [newHead, ...prev.snake];
      } else {
        newSnake = [newHead, ...prev.snake.slice(0, -1)];
      }

      let newScore = prev.score;
      let newFood = prev.food;
      let isVictory = prev.isVictory;
      let unlocked = prev.unlockedLevels;
      let highScore = prev.highScore;

      if (ateFood) {
        newScore = prev.score + FOOD_SCORE;
        newFood = getRandomFood(cfg.gridSize, newSnake, cfg.obstacles);
        speech.eatFood();
        if (newScore >= prev.targetScore) {
          isVictory = true;
          speech.levelVictory();
          unlockLevel(Math.min(prev.level + 1, LEVELS.length));
          updateHighScore(newScore);
          const data = loadGameData();
          unlocked = data.unlockedLevels;
          highScore = data.highScore;
        }
      }

      return {
        ...prev,
        snake: newSnake,
        food: newFood,
        direction,
        score: newScore,
        isVictory,
        unlockedLevels: unlocked,
        highScore,
      };
    });
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp': case 'w': case 'W': setDirection('UP'); break;
        case 'ArrowDown': case 's': case 'S': setDirection('DOWN'); break;
        case 'ArrowLeft': case 'a': case 'A': setDirection('LEFT'); break;
        case 'ArrowRight': case 'd': case 'D': setDirection('RIGHT'); break;
        case ' ':
          e.preventDefault();
          if (state.isPlaying && !state.isGameOver && !state.isVictory) togglePause();
          break;
        case 'Escape':
          if (state.isPlaying) goToMenu();
          break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setDirection, togglePause, goToMenu, state.isPlaying, state.isGameOver, state.isVictory]);

  return {
    state,
    startGame,
    togglePause,
    setDirection,
    goToMenu,
    nextLevel,
    retry,
    resetToLevel,
  };
}
