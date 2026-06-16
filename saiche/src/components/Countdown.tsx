interface CountdownProps {
  value: number;
}

export default function Countdown({ value }: CountdownProps) {
  const isGo = value === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div
        key={`${value}-${Math.random()}`}
        className={`relative flex items-center justify-center ${isGo ? 'animate-go-pop' : 'animate-countdown-pop'}`}
      >
        <div
          className={`absolute rounded-full blur-3xl opacity-40 ${
            isGo ? 'bg-cyan-400' : 'bg-purple-500'
          }`}
          style={{ width: 'clamp(200px, 50vw, 400px)', height: 'clamp(200px, 50vw, 400px)' }}
        />

        <span
          className={`relative font-orbitron font-black ${
            isGo ? 'neon-text-green' : 'neon-text-cyan'
          }`}
          style={{
            fontSize: 'clamp(6rem, 25vw, 16rem)',
            lineHeight: 1,
            letterSpacing: '-0.05em',
          }}
        >
          {isGo ? 'GO!!!' : value}
        </span>

        {isGo && (
          <>
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-3 h-3 rounded-full bg-cyan-400"
                style={{
                  boxShadow: '0 0 15px #00ff88, 0 0 30px #00ff88',
                  animation: `particle-${i} 1s ease-out forwards`,
                  ['--angle' as string]: `${(i * 45)}deg`,
                  left: '50%',
                  top: '50%',
                }}
              />
            ))}
          </>
        )}
      </div>

      <style>{`
        ${Array.from({ length: 8 }).map((_, i) => {
          const angle = (i * 45) * (Math.PI / 180);
          const x = Math.cos(angle) * 120;
          const y = Math.sin(angle) * 120;
          return `
            @keyframes particle-${i} {
              0% {
                transform: translate(-50%, -50%) scale(1);
                opacity: 1;
              }
              100% {
                transform: translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(0);
                opacity: 0;
              }
            }
          `;
        }).join('')}
      `}</style>
    </div>
  );
}
