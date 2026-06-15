import React from 'react';
import type { Tile as TileType, Difficulty } from '../types/game';
import { useGameStore } from '../store/gameStore';
import { canMoveTile } from '../game/logic';

interface TileProps {
  tile: TileType;
  boardSize: number;
  size: Difficulty;
}

export const Tile: React.FC<TileProps> = ({ tile, boardSize, size }) => {
  const { tiles, imageUrl, dispatch, isPlaying } = useGameStore();
  const gap = 4;
  const tileSize = (boardSize - gap * (size + 1)) / size;

  if (tile.isEmpty) {
    return null;
  }

  const canMove = isPlaying && canMoveTile(tiles, tile.id, size);
  const row = Math.floor(tile.id / size);
  const col = tile.id % size;
  const currentRow = Math.floor(tile.currentIndex / size);
  const currentCol = tile.currentIndex % size;

  const bgX = -(col * tileSize + col * gap);
  const bgY = -(row * tileSize + row * gap);

  const translateX = currentCol * (tileSize + gap) + gap;
  const translateY = currentRow * (tileSize + gap) + gap;

  return (
    <div
      onClick={() => canMove && dispatch({ type: 'MOVE_TILE', payload: tile.id })}
      className={`
        absolute rounded-xl tile-transition overflow-hidden
        ${canMove ? 'cursor-pointer tile-hover ring-2 ring-accent/30' : 'cursor-default'}
        ${!isPlaying && !canMove ? 'ring-1 ring-white/10' : ''}
      `}
      style={{
        width: tileSize,
        height: tileSize,
        transform: `translate(${translateX}px, ${translateY}px)`,
        backgroundImage: `url(${imageUrl})`,
        backgroundSize: `${boardSize}px ${boardSize}px`,
        backgroundPosition: `${bgX}px ${bgY}px`,
        boxShadow: canMove
          ? '0 4px 20px rgba(45, 212, 191, 0.25), inset 0 1px 0 rgba(255,255,255,0.15)'
          : '0 2px 10px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
      <div
        className="absolute bottom-1.5 right-2 font-mono text-xs font-bold
                   bg-black/50 backdrop-blur-sm rounded-md px-1.5 py-0.5
                   text-white/80 select-none"
      >
        {tile.id + 1}
      </div>
    </div>
  );
};
