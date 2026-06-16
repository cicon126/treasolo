import { MutableRefObject, useEffect, useRef } from 'react';

interface GameCanvasProps {
  engineRef: MutableRefObject<unknown>;
  canvasRef: MutableRefObject<HTMLCanvasElement | null>;
}

export default function GameCanvas({ engineRef, canvasRef }: GameCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const handleResize = () => {
      const { clientWidth, clientHeight } = container;
      const dpr = window.devicePixelRatio || 1;

      canvas.width = clientWidth * dpr;
      canvas.height = clientHeight * dpr;
      canvas.style.width = `${clientWidth}px`;
      canvas.style.height = `${clientHeight}px`;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }

      const engine = engineRef.current as {
        resize?: (w: number, h: number) => void;
      } | null;
      if (engine && typeof engine.resize === 'function') {
        engine.resize(clientWidth, clientHeight);
      }
    };

    handleResize();

    resizeObserverRef.current = new ResizeObserver(handleResize);
    resizeObserverRef.current.observe(container);

    window.addEventListener('orientationchange', handleResize);

    return () => {
      resizeObserverRef.current?.disconnect();
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [engineRef, canvasRef]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 w-full h-full overflow-hidden bg-game-gradient"
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0, 245, 255, 0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 245, 255, 0.5) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />
      </div>
      <canvas
        ref={canvasRef}
        className="relative block w-full h-full"
        style={{ imageRendering: 'pixelated' }}
      />
    </div>
  );
}
