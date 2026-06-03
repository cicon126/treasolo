import { useGameStore } from '@/store/useGameStore';
import { CircuitCell } from './CircuitCell';

interface CircuitGridProps {
  maxSize?: number;
}

export function CircuitGrid({ maxSize = 400 }: CircuitGridProps) {
  const { grid, gridSize, rotateCell } = useGameStore();

  const cellSize = Math.floor(maxSize / gridSize) - 8;
  const gap = 8;

  return (
    <div
      className="bg-slate-900 p-4 rounded-2xl shadow-2xl border border-slate-700"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${gridSize}, ${cellSize}px)`,
        gap: `${gap}px`,
      }}
    >
      {grid.map((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <CircuitCell
            key={`${rowIndex}-${colIndex}`}
            cell={cell}
            onClick={() => rotateCell(rowIndex, colIndex)}
            size={cellSize}
          />
        ))
      )}
    </div>
  );
}
