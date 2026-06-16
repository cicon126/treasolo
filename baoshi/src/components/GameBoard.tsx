import { Gem as GemType } from '@/types/game';
import Gem from './Gem';
import { BOARD_SIZE } from '@/types/game';

interface GameBoardProps {
  board: GemType[][];
  selectedGem: { row: number; col: number } | null;
  onGemClick: (row: number, col: number) => void;
  cellSize?: number;
}

export default function GameBoard({ board, selectedGem, onGemClick, cellSize = 60 }: GameBoardProps) {
  const boardSize = BOARD_SIZE * cellSize;
  
  return (
    <div
      className="relative rounded-2xl p-3"
      style={{
        width: boardSize + 24,
        height: boardSize + 24,
        background: 'linear-gradient(145deg, #1a1a2e, #16213e)',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
      }}
    >
      <div
        className="relative rounded-xl overflow-hidden"
        style={{
          width: boardSize,
          height: boardSize,
          background: 'linear-gradient(145deg, #0f0f23, #1a1a3a)',
        }}
      >
        {Array.from({ length: BOARD_SIZE }).map((_, row) =>
          Array.from({ length: BOARD_SIZE }).map((_, col) => (
            <div
              key={`cell-${row}-${col}`}
              className="absolute"
              style={{
                width: cellSize,
                height: cellSize,
                left: col * cellSize,
                top: row * cellSize,
                background: (row + col) % 2 === 0
                  ? 'rgba(255, 255, 255, 0.02)'
                  : 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.03)',
              }}
            />
          ))
        )}
        
        {board.map((row, rowIndex) =>
          row.map((gem, colIndex) => (
            <Gem
              key={gem.id}
              gem={gem}
              isSelected={selectedGem?.row === rowIndex && selectedGem?.col === colIndex}
              onClick={() => onGemClick(rowIndex, colIndex)}
              cellSize={cellSize}
            />
          ))
        )}
      </div>
    </div>
  );
}
