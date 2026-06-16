import { RoadRenderer } from './RoadRenderer';
import { CarManager } from './CarManager';
import { ParticleSystem } from './ParticleSystem';
import { Collision } from './Collision';
import type { GameState, GameStats } from './types';

export interface GameEngineCallbacks {
  onScoreUpdate: (score: number) => void;
  onSpeedUpdate: (speed: number, level: number) => void;
  onGameOver: (finalScore: number) => void;
  onCountdown: (value: number) => void;
  onStateChange: (state: GameState) => void;
  onShake?: (intensity: number) => void;
}

export class GameEngine {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private width: number = 0;
  private height: number = 0;

  private roadRenderer!: RoadRenderer;
  private carManager!: CarManager;
  private particleSystem!: ParticleSystem;

  private state: GameState = 'menu';
  private stats: GameStats = {
    score: 0,
    highScore: 0,
    speed: 1,
    level: 1,
    time: 0,
  };

  private animationFrameId: number | null = null;
  private lastTime: number = 0;
  private cameraY: number = 0;
  private spawnTimer: number = 0;
  private countdownValue: number = 3;
  private countdownTimer: number = 0;

  private callbacks: GameEngineCallbacks;

  private keysPressed: Set<string> = new Set();

  constructor(callbacks: GameEngineCallbacks) {
    this.callbacks = callbacks;
    this.stats.highScore = this.loadHighScore();
  }

  public init(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.resize(canvas.clientWidth, canvas.clientHeight);
    this.roadRenderer = new RoadRenderer(canvas, this.ctx!);
    this.carManager = new CarManager();
    this.particleSystem = new ParticleSystem();
    this.setupInputListeners();
  }

  public resize(w: number, h: number): void {
    this.width = w;
    this.height = h;
    if (this.canvas) {
      const dpr = window.devicePixelRatio || 1;
      this.canvas.width = w * dpr;
      this.canvas.height = h * dpr;
      this.ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  }

  public startGame(): void {
    this.reset();
    this.state = 'countdown';
    this.countdownValue = 3;
    this.countdownTimer = 0;
    this.callbacks.onStateChange(this.state);
    this.callbacks.onCountdown(this.countdownValue);
    this.startLoop();
  }

  public togglePause(): void {
    if (this.state === 'playing') {
      this.state = 'paused';
      this.callbacks.onStateChange(this.state);
    } else if (this.state === 'paused') {
      this.state = 'playing';
      this.lastTime = performance.now();
      this.callbacks.onStateChange(this.state);
    }
  }

  public goToMenu(): void {
    this.stopLoop();
    this.state = 'menu';
    this.callbacks.onStateChange(this.state);
    this.renderMenuBackground();
  }

  public getState(): GameState {
    return this.state;
  }

  public getHighScore(): number {
    return this.stats.highScore;
  }

  public destroy(): void {
    this.stopLoop();
    this.removeInputListeners();
  }

  private reset(): void {
    this.stats = {
      score: 0,
      highScore: this.stats.highScore,
      speed: 1,
      level: 1,
      time: 0,
    };
    this.cameraY = 0;
    this.spawnTimer = 0;
    this.carManager?.initPlayer();
    this.particleSystem?.clear();
    this.callbacks.onScoreUpdate(0);
    this.callbacks.onSpeedUpdate(1, 1);
  }

  private setupInputListeners(): void {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    window.addEventListener('touchstart', this.handleTouchStart);
  }

  private removeInputListeners(): void {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('touchstart', this.handleTouchStart);
  }

  private handleKeyDown = (e: KeyboardEvent): void => {
    if (this.state === 'playing') {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        this.carManager.changeLane(-1);
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        this.carManager.changeLane(1);
      }
    }
    if (e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      if (this.state === 'playing' || this.state === 'paused') {
        this.togglePause();
      }
    }
    this.keysPressed.add(e.key);
  };

  private handleKeyUp = (e: KeyboardEvent): void => {
    this.keysPressed.delete(e.key);
  };

  private handleTouchStart = (e: TouchEvent): void => {
    if (this.state !== 'playing') return;
    const touch = e.touches[0];
    const screenMid = window.innerWidth / 2;
    if (touch.clientX < screenMid) {
      this.carManager.changeLane(-1);
    } else {
      this.carManager.changeLane(1);
    }
  };

  private startLoop(): void {
    this.lastTime = performance.now();
    const loop = (now: number): void => {
      const dt = Math.min((now - this.lastTime) / 1000, 0.05);
      this.lastTime = now;
      this.update(dt);
      this.render();
      this.animationFrameId = requestAnimationFrame(loop);
    };
    this.animationFrameId = requestAnimationFrame(loop);
  }

  private stopLoop(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private update(dt: number): void {
    if (this.state === 'countdown') {
      this.updateCountdown(dt);
    } else if (this.state === 'playing') {
      this.updateGame(dt);
    }
    this.particleSystem.updateAll(dt);
  }

  private updateCountdown(dt: number): void {
    this.countdownTimer += dt;
    if (this.countdownTimer >= 1) {
      this.countdownTimer = 0;
      this.countdownValue--;
      if (this.countdownValue < 0) {
        this.state = 'playing';
        this.callbacks.onStateChange(this.state);
      } else {
        this.callbacks.onCountdown(this.countdownValue);
      }
    }
  }

  private updateGame(dt: number): void {
    this.stats.time += dt;

    const baseSpeed = 1 + this.stats.time * 0.03;
    this.stats.speed = Math.min(baseSpeed, 3.5);
    this.stats.level = Math.min(Math.floor(this.stats.time / 10) + 1, 10);

    const scorePerSecond = 10 * this.stats.speed;
    this.stats.score += scorePerSecond * dt;

    this.cameraY += this.stats.speed * 60 * dt;

    const spawnInterval = Math.max(0.4, 1.2 - this.stats.time * 0.01);
    this.spawnTimer += dt;
    if (this.spawnTimer >= spawnInterval) {
      this.spawnTimer = 0;
      this.carManager.spawnEnemy(this.stats.speed);
    }

    this.carManager.updateAll(dt, this.stats.speed);

    const playerLane = this.carManager.getPlayerInterpolatedLane();
    const playerPos = this.roadRenderer.worldToScreen(playerLane, this.carManager.player.z);
    this.particleSystem.emitTrail(playerPos.x, playerPos.y + 5);

    const collidedEnemy = Collision.checkPlayerEnemies(
      this.carManager.player,
      this.carManager.getActiveEnemies()
    );

    if (collidedEnemy) {
      this.handleCollision(playerPos.x, playerPos.y - playerPos.scale * 30);
    }

    this.callbacks.onScoreUpdate(Math.floor(this.stats.score));
    this.callbacks.onSpeedUpdate(Math.floor(this.stats.speed * 100), this.stats.level);
  }

  private handleCollision(x: number, y: number): void {
    this.particleSystem.emitExplosion(x, y);
    this.callbacks.onShake?.(10);

    if (this.stats.score > this.stats.highScore) {
      this.stats.highScore = Math.floor(this.stats.score);
      this.saveHighScore(this.stats.highScore);
    }

    setTimeout(() => {
      this.stopLoop();
      this.state = 'gameover';
      this.callbacks.onStateChange(this.state);
      this.callbacks.onGameOver(Math.floor(this.stats.score));
    }, 500);
  }

  private render(): void {
    if (!this.ctx || !this.canvas) return;

    if (this.state === 'countdown' || this.state === 'playing' || this.state === 'paused' || this.state === 'gameover') {
      this.roadRenderer.render(this.cameraY, this.stats.speed);
      this.carManager.renderAll(this.ctx, this.roadRenderer);
      this.particleSystem.renderAll(this.ctx);

      if (this.state === 'paused') {
        this.renderPauseOverlay();
      }
    } else {
      this.renderMenuBackground();
    }
  }

  private renderMenuBackground(): void {
    if (!this.ctx) return;
    this.roadRenderer.render(this.cameraY, 0.3);
    this.cameraY += 0.5;
    if (this.state === 'menu' && this.animationFrameId === null) {
      requestAnimationFrame(() => this.renderMenuBackground());
    }
  }

  private renderPauseOverlay(): void {
    if (!this.ctx) return;
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  private loadHighScore(): number {
    try {
      const saved = localStorage.getItem('saiche_highscore');
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  }

  private saveHighScore(score: number): void {
    try {
      localStorage.setItem('saiche_highscore', score.toString());
    } catch {}
  }
}
