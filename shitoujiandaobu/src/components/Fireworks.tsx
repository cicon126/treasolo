import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  vx: number;
  vy: number;
  color: string;
  alpha: number;
  size: number;
  arrived: boolean;
  life: number;
}

interface FireworkShell {
  x: number;
  y: number;
  targetY: number;
  vy: number;
  color: string;
  exploded: boolean;
  particles: Particle[];
}

const Fireworks = ({ active }: { active: boolean }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shellsRef = useRef<FireworkShell[]>([]);
  const textParticlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>();
  const phaseRef = useRef<'shells' | 'text'>('shells');
  const startTimeRef = useRef<number>(0);

  const colors = [
    '#FF6B35', '#FFD93D', '#6BCB77', '#4D96FF', '#9B59B6',
    '#FF6B9D', '#00D9FF', '#FF8C00', '#32CD32', '#FF1493'
  ];

  const getTextPoints = (canvas: HTMLCanvasElement, text: string): { x: number; y: number }[] => {
    const offscreen = document.createElement('canvas');
    offscreen.width = canvas.width;
    offscreen.height = canvas.height;
    const offCtx = offscreen.getContext('2d')!;

    const fontSize = Math.min(canvas.width / 3, canvas.height / 3, 200);
    offCtx.font = `bold ${fontSize}px "Fredoka", sans-serif`;
    offCtx.fillStyle = 'white';
    offCtx.textAlign = 'center';
    offCtx.textBaseline = 'middle';
    offCtx.fillText(text, canvas.width / 2, canvas.height / 2);

    const imageData = offCtx.getImageData(0, 0, canvas.width, canvas.height);
    const points: { x: number; y: number }[] = [];
    const gap = 4;

    for (let y = 0; y < canvas.height; y += gap) {
      for (let x = 0; x < canvas.width; x += gap) {
        const idx = (y * canvas.width + x) * 4;
        if (imageData.data[idx + 3] > 128) {
          points.push({ x, y });
        }
      }
    }

    return points;
  };

  const createShell = (canvas: HTMLCanvasElement): FireworkShell => {
    return {
      x: Math.random() * canvas.width,
      y: canvas.height,
      targetY: Math.random() * canvas.height * 0.4 + 50,
      vy: -12 - Math.random() * 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      exploded: false,
      particles: []
    };
  };

  const createBurstParticles = (shell: FireworkShell): Particle[] => {
    const particles: Particle[] = [];
    const count = 60 + Math.floor(Math.random() * 30);
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 / count) * i;
      const speed = 2 + Math.random() * 5;
      particles.push({
        x: shell.x,
        y: shell.y,
        targetX: 0,
        targetY: 0,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: shell.color,
        alpha: 1,
        size: 2 + Math.random() * 2,
        arrived: false,
        life: 1
      });
    }
    return particles;
  };

  const createTextParticles = (canvas: HTMLCanvasElement): Particle[] => {
    const points = getTextPoints(canvas, '胜 利');
    const particles: Particle[] = [];
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    for (const pt of points) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 200 + Math.random() * 300;
      const startX = cx + Math.cos(angle) * dist;
      const startY = cy + Math.sin(angle) * dist;
      particles.push({
        x: startX,
        y: startY,
        targetX: pt.x,
        targetY: pt.y,
        vx: 0,
        vy: 0,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        size: 2 + Math.random() * 2,
        arrived: false,
        life: 1
      });
    }
    return particles;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    if (active) {
      shellsRef.current = [];
      textParticlesRef.current = [];
      phaseRef.current = 'shells';
      startTimeRef.current = Date.now();

      for (let i = 0; i < 6; i++) {
        setTimeout(() => {
          if (canvasRef.current) {
            shellsRef.current.push(createShell(canvasRef.current));
          }
        }, i * 200);
      }

      setTimeout(() => {
        phaseRef.current = 'text';
        textParticlesRef.current = createTextParticles(canvas);
      }, 1200);
    }

    const animate = () => {
      if (!active && shellsRef.current.length === 0 && textParticlesRef.current.length === 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }

      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (phaseRef.current === 'shells') {
        shellsRef.current = shellsRef.current.filter(shell => {
          if (!shell.exploded) {
            shell.y += shell.vy;
            shell.vy += 0.15;

            ctx.beginPath();
            ctx.arc(shell.x, shell.y, 4, 0, Math.PI * 2);
            ctx.fillStyle = shell.color;
            ctx.fill();

            for (let i = 1; i <= 3; i++) {
              ctx.beginPath();
              ctx.arc(shell.x, shell.y - i * 8, 3 - i * 0.5, 0, Math.PI * 2);
              ctx.fillStyle = `rgba(255, 200, 100, ${0.5 - i * 0.12})`;
              ctx.fill();
            }

            if (shell.y <= shell.targetY || shell.vy >= 0) {
              shell.exploded = true;
              shell.particles = createBurstParticles(shell);
            }
            return true;
          } else {
            shell.particles = shell.particles.filter(p => {
              p.x += p.vx;
              p.y += p.vy;
              p.vy += 0.04;
              p.vx *= 0.98;
              p.alpha -= 0.015;

              if (p.alpha <= 0) return false;

              ctx.globalAlpha = p.alpha;
              ctx.beginPath();
              ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
              ctx.fillStyle = p.color;
              ctx.fill();
              ctx.globalAlpha = 1;

              return true;
            });
            return shell.particles.length > 0;
          }
        });

        if (active && Math.random() < 0.06) {
          shellsRef.current.push(createShell(canvas));
        }
      }

      if (phaseRef.current === 'text') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        shellsRef.current = [];

        let allArrived = true;

        textParticlesRef.current = textParticlesRef.current.filter(p => {
          if (!p.arrived) {
            const dx = p.targetX - p.x;
            const dy = p.targetY - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 3) {
              p.x = p.targetX;
              p.y = p.targetY;
              p.arrived = true;
              p.vx = 0;
              p.vy = 0;
            } else {
              allArrived = false;
              p.vx += dx * 0.06;
              p.vy += dy * 0.06;
              p.vx *= 0.85;
              p.vy *= 0.85;
              p.x += p.vx;
              p.y += p.vy;
            }
          }

          if (p.arrived) {
            p.life -= 0.005;
            if (p.life <= 0) return false;
            p.alpha = Math.min(p.life, 1);
          } else {
            allArrived = false;
          }

          ctx.globalAlpha = p.alpha;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.fill();

          if (!p.arrived) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * 0.5, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255,255,255,0.8)';
            ctx.fill();
          }

          ctx.globalAlpha = 1;

          return true;
        });

        if (active && allArrived && textParticlesRef.current.length > 0) {
          for (let i = 0; i < 2; i++) {
            const idx = Math.floor(Math.random() * textParticlesRef.current.length);
            const sp = textParticlesRef.current[idx];
            if (sp && sp.arrived) {
              ctx.globalAlpha = 0.8;
              ctx.beginPath();
              ctx.arc(sp.x, sp.y, sp.size + 2, 0, Math.PI * 2);
              ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
              ctx.fill();
              ctx.globalAlpha = 1;
            }
          }
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [active]);

  return (
    <canvas
      ref={canvasRef}
      id="fireworks-canvas"
      style={{ display: active ? 'block' : 'none' }}
    />
  );
};

export default Fireworks;
