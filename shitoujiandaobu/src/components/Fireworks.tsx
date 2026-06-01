import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  alpha: number;
  size: number;
}

interface Firework {
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
  const fireworksRef = useRef<Firework[]>([]);
  const animationRef = useRef<number>();

  const colors = [
    '#FF6B35', '#FFD93D', '#6BCB77', '#4D96FF', '#9B59B6',
    '#FF6B9D', '#00D9FF', '#FF8C00', '#32CD32', '#FF1493'
  ];

  const createFirework = (canvas: HTMLCanvasElement): Firework => {
    return {
      x: Math.random() * canvas.width,
      y: canvas.height,
      targetY: Math.random() * canvas.height * 0.5 + 50,
      vy: -12 - Math.random() * 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      exploded: false,
      particles: []
    };
  };

  const createParticles = (firework: Firework): Particle[] => {
    const particles: Particle[] = [];
    const count = 80 + Math.floor(Math.random() * 40);
    
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 / count) * i;
      const speed = 2 + Math.random() * 6;
      particles.push({
        x: firework.x,
        y: firework.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: firework.color,
        alpha: 1,
        size: 2 + Math.random() * 3
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
      fireworksRef.current = [];
      for (let i = 0; i < 8; i++) {
        setTimeout(() => {
          fireworksRef.current.push(createFirework(canvas));
        }, i * 150);
      }
    }

    const animate = () => {
      if (!active && fireworksRef.current.length === 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }

      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      fireworksRef.current = fireworksRef.current.filter(firework => {
        if (!firework.exploded) {
          firework.y += firework.vy;
          firework.vy += 0.15;

          ctx.beginPath();
          ctx.arc(firework.x, firework.y, 4, 0, Math.PI * 2);
          ctx.fillStyle = firework.color;
          ctx.fill();

          for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.arc(
              firework.x - firework.vx * i * 0.5,
              firework.y - firework.vy * i * 0.5,
              3 - i,
              0,
              Math.PI * 2
            );
            ctx.fillStyle = `rgba(255, 200, 100, ${0.5 - i * 0.15})`;
            ctx.fill();
          }

          if (firework.y <= firework.targetY || firework.vy >= 0) {
            firework.exploded = true;
            firework.particles = createParticles(firework);
          }

          return true;
        } else {
          firework.particles = firework.particles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += 0.05;
            particle.vx *= 0.99;
            particle.alpha -= 0.012;

            if (particle.alpha <= 0) return false;

            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fillStyle = particle.color.replace(')', `, ${particle.alpha})`).replace('rgb', 'rgba');
            if (!particle.color.includes('rgba')) {
              ctx.globalAlpha = particle.alpha;
              ctx.fillStyle = particle.color;
            }
            ctx.fill();
            ctx.globalAlpha = 1;

            return true;
          });

          return firework.particles.length > 0;
        }
      });

      if (active && Math.random() < 0.08) {
        fireworksRef.current.push(createFirework(canvas));
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
