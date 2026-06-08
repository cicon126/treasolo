import { useEffect, useRef } from 'react';
import { Direction, LevelConfig, Point } from '../utils/levels';

interface GameCanvasProps {
  snake: Point[];
  food: Point;
  direction: Direction;
  levelConfig: LevelConfig;
  onSwipe?: (dir: Direction) => void;
}

export default function GameCanvas({ snake, food, levelConfig, onSwipe }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { gridSize, obstacles } = levelConfig;
    const dpr = window.devicePixelRatio || 1;
    const size = Math.min(600, typeof window !== 'undefined' ? Math.min(window.innerWidth - 48, window.innerHeight - 260) : 600);
    const cell = Math.floor(size / gridSize);
    const canvasSize = cell * gridSize;

    canvas.width = canvasSize * dpr;
    canvas.height = canvasSize * dpr;
    canvas.style.width = `${canvasSize}px`;
    canvas.style.height = `${canvasSize}px`;
    ctx.scale(dpr, dpr);

    // Background
    const bgGrad = ctx.createLinearGradient(0, 0, canvasSize, canvasSize);
    bgGrad.addColorStop(0, '#ecfdf5');
    bgGrad.addColorStop(1, '#f0f9ff');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    // Grid
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.08)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= gridSize; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cell, 0);
      ctx.lineTo(i * cell, canvasSize);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * cell);
      ctx.lineTo(canvasSize, i * cell);
      ctx.stroke();
    }

    // Obstacles
    obstacles.forEach(o => {
      const x = o.x * cell + 2;
      const y = o.y * cell + 2;
      const w = cell - 4;
      const h = cell - 4;
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      const r = Math.min(6, w / 4);
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.25)';
      ctx.fillRect(x + 2, y + 2, w - 4, 2);
    });

    // Food (glowing orange)
    const fx = food.x * cell + cell / 2;
    const fy = food.y * cell + cell / 2;
    const fr = cell * 0.4;
    const glow = ctx.createRadialGradient(fx, fy, fr * 0.2, fx, fy, fr * 1.8);
    glow.addColorStop(0, 'rgba(251, 146, 60, 0.6)');
    glow.addColorStop(1, 'rgba(251, 146, 60, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(fx - fr * 2, fy - fr * 2, fr * 4, fr * 4);

    const foodGrad = ctx.createRadialGradient(fx - fr * 0.3, fy - fr * 0.3, 0, fx, fy, fr);
    foodGrad.addColorStop(0, '#fdba74');
    foodGrad.addColorStop(1, '#ea580c');
    ctx.fillStyle = foodGrad;
    ctx.beginPath();
    ctx.arc(fx, fy, fr, 0, Math.PI * 2);
    ctx.fill();

    // Snake
    snake.forEach((seg, idx) => {
      const x = seg.x * cell + 2;
      const y = seg.y * cell + 2;
      const w = cell - 4;
      const h = cell - 4;

      if (idx === 0) {
        // Head
        const headGrad = ctx.createLinearGradient(x, y, x + w, y + h);
        headGrad.addColorStop(0, '#34d399');
        headGrad.addColorStop(1, '#059669');
        ctx.fillStyle = headGrad;
      } else {
        const t = idx / Math.max(snake.length - 1, 1);
        const r = Math.floor(16 + (52 - 16) * (1 - t) * 0.4);
        const g = Math.floor(185 + (211 - 185) * (1 - t));
        const b = Math.floor(129 + (153 - 129) * (1 - t));
        ctx.fillStyle = `rgb(${r},${g},${b})`;
      }

      const radius = Math.min(8, w / 3);
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.arcTo(x + w, y, x + w, y + h, radius);
      ctx.arcTo(x + w, y + h, x, y + h, radius);
      ctx.arcTo(x, y + h, x, y, radius);
      ctx.arcTo(x, y, x + w, y, radius);
      ctx.closePath();
      ctx.fill();

      if (idx === 0) {
        // Eyes
        ctx.fillStyle = 'white';
        const ex1 = x + w * 0.3;
        const ex2 = x + w * 0.7;
        const ey = y + h * 0.35;
        const er = Math.max(2, cell * 0.09);
        ctx.beginPath();
        ctx.arc(ex1, ey, er, 0, Math.PI * 2);
        ctx.arc(ex2, ey, er, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(ex1, ey, er * 0.55, 0, Math.PI * 2);
        ctx.arc(ex2, ey, er * 0.55, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  }, [snake, food, levelConfig]);

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current || !onSwipe) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStart.current.x;
    const dy = t.clientY - touchStart.current.y;
    const adx = Math.abs(dx);
    const ady = Math.abs(dy);
    if (Math.max(adx, ady) < 20) return;
    if (adx > ady) onSwipe(dx > 0 ? 'RIGHT' : 'LEFT');
    else onSwipe(dy > 0 ? 'DOWN' : 'UP');
    touchStart.current = null;
  };

  return (
    <div ref={containerRef} className="relative">
      <canvas
        ref={canvasRef}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        className="rounded-3xl shadow-xl border-4 border-emerald-100 bg-emerald-50 touch-none"
      />
    </div>
  );
}
