import React from 'react';
import { useGameStore } from '@/store/useGameStore';
import Cell from './Cell';

const GameBoard: React.FC = () => {
  const { board } = useGameStore();

  return (
    <div
      className="
        inline-block p-1 bg-slate-400
        border-t-2 border-l-2 border-slate-600 border-r-2 border-b-2 border-r-slate-200 border-b-slate-200"
    >
      <div className="flex flex-col">
        {board.map((row, rowIndex) => (
          <div key={rowIndex} className="flex">
          {row.map((cell) => (
            <Cell key={`${cell.row}-${cell.col}`} cell={cell} />
          ))}
        </div>
        ))}
      </div>
    </div>
  );
};

export default GameBoard;
