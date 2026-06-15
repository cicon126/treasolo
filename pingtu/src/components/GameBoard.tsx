import React, { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { Tile } from './Tile';

export const GameBoard: React.FC = () => {
  const { tiles, size, isCompleted, imageUrl, showPreview, dispatch } = useGameStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const [boardSize, setBoardSize] = useState(480);

  useEffect(() => {
    const updateSize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setBoardSize(Math.min(width - 48, 400));
      } else if (width < 1024) {
        setBoardSize(440);
      } else {
        setBoardSize(500);
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  return (
    <div className="relative flex justify-center">
      <div
        ref={containerRef}
        className={`
          relative glass-card p-0
          ${isCompleted ? 'animate-pulse-glow' : ''}
        `}
        style={{
          width: boardSize,
          height: boardSize,
          borderRadius: '20px',
        }}
      >
        {showPreview && !isCompleted && (
          <div
            className="absolute inset-2 rounded-xl overflow-hidden z-20
                       ring-2 ring-accent shadow-2xl animate-bounce-in"
          >
            <img
              src={imageUrl}
              alt="原图预览"
              className="w-full h-full object-cover"
            />
            <button
              onClick={() => dispatch({ type: 'TOGGLE_PREVIEW', payload: false })}
              className="absolute top-3 right-3 w-9 h-9 rounded-full
                       bg-black/60 backdrop-blur-sm text-white
                       flex items-center justify-center
                       hover:bg-black/80 transition-colors text-lg"
            >
              ✕
            </button>
          </div>
        )}

        {tiles.map(tile => (
          <Tile
            key={tile.id}
            tile={tile}
            boardSize={boardSize - 16}
            size={size}
          />
        ))}

        <div
          className="absolute inset-2 rounded-xl pointer-events-none
                     border border-white/5"
        />
      </div>

      {isCompleted && (
        <div className="absolute inset-0 flex items-center justify-center
                       pointer-events-none z-30">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br
                          from-accent/20 via-transparent to-primary-500/20
                          animate-pulse" />
        </div>
      )}
    </div>
  );
};
