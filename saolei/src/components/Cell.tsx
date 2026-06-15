import React from 'react';
import type { Cell as CellType } from '@/types/game';
import { useGameStore } from '@/store/useGameStore';

interface CellProps {
  cell: CellType;
}

const numberColors: Record<number, string> = {
  1: 'text-blue-600',
  2: 'text-green-600',
  3: 'text-red-600',
  4: 'text-blue-800',
  5: 'text-red-800',
  6: 'text-cyan-600',
  7: 'text-black',
  8: 'text-gray-600',
};

const Cell: React.FC<CellProps> = ({ cell }) => {
  const { handleCellClick, handleCellRightClick, status } = useGameStore();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (status === 'won' || status === 'lost') return;
    handleCellClick(cell.row, cell.col);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    if (status === 'won' || status === 'lost') return;
    handleCellRightClick(cell.row, cell.col);
  };

  const getCellContent = () => {
    if (cell.isFlagged && !cell.isRevealed) {
      return <span className="text-base sm:text-lg">🚩</span>;
    }
    if (!cell.isRevealed) {
      return null;
    }
    if (cell.isMine) {
      return <span className="text-base sm:text-lg">💣</span>;
    }
    if (cell.adjacentMines > 0) {
      return (
        <span
          className={`font-bold text-sm sm:text-base ${numberColors[cell.adjacentMines]}`}
        >
          {cell.adjacentMines}
        </span>
      );
    }
    return null;
  };

  const isClickedMine = cell.isRevealed && cell.isMine;

  return (
    <button
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      className={`
        w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center select-none
        transition-all duration-75
        ${cell.isRevealed
          ? `bg-slate-200 border border-slate-300 ${isClickedMine ? 'bg-red-400' : ''}`
          : `
            bg-gradient-to-br from-slate-300 to-slate-400
            border-t-2 border-l-2 border-slate-200
            border-r-2 border-b-2 border-r-slate-500 border-b-slate-500
            hover:from-slate-200 hover:to-slate-300
            active:border-t-slate-500 active:border-l-slate-500
            active:border-r-slate-200 active:border-b-slate-200
          `
        }
      `}
      disabled={status === 'won' || status === 'lost'}
    >
      {getCellContent()}
    </button>
  );
};

export default Cell;
