import { useGameStore } from "@/store/gameStore";

const BOARD_SIZE = 15;
const CELL_SIZE = 32;
const PADDING = 20;
const STONE_RADIUS = 13;

export default function GameBoard() {
  const { board, placeStone, winLine, lastMove, isThinking, gameOver, currentPlayer, playerPiece } = useGameStore();

  const svgSize = CELL_SIZE * (BOARD_SIZE - 1) + PADDING * 2;

  const isWinCell = (row: number, col: number) => {
    if (!winLine) return false;
    return winLine.positions.some((p) => p.row === row && p.col === col);
  };

  const handleClick = (row: number, col: number) => {
    if (isThinking || gameOver) return;
    placeStone(row, col);
  };

  const starPoints = [
    [3, 3], [3, 7], [3, 11],
    [7, 3], [7, 7], [7, 11],
    [11, 3], [11, 7], [11, 11],
  ];

  return (
    <div className="relative">
      <svg
        width={svgSize}
        height={svgSize}
        className="rounded-lg shadow-xl select-none"
        style={{ background: "linear-gradient(135deg, #DEB887 0%, #D2A56C 50%, #C89550 100%)" }}
      >
        <defs>
          <radialGradient id="blackStone" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#555" />
            <stop offset="100%" stopColor="#111" />
          </radialGradient>
          <radialGradient id="whiteStone" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#fff" />
            <stop offset="100%" stopColor="#d4d4d4" />
          </radialGradient>
          <radialGradient id="blackStoneWin" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#666" />
            <stop offset="100%" stopColor="#222" />
          </radialGradient>
          <radialGradient id="whiteStoneWin" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#fff" />
            <stop offset="100%" stopColor="#e0e0e0" />
          </radialGradient>
          <filter id="stoneShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="1" dy="1" stdDeviation="1.5" floodColor="#00000055" />
          </filter>
          <filter id="glowWin" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {Array.from({ length: BOARD_SIZE }).map((_, i) => (
          <g key={`lines-${i}`}>
            <line
              x1={PADDING}
              y1={PADDING + i * CELL_SIZE}
              x2={PADDING + (BOARD_SIZE - 1) * CELL_SIZE}
              y2={PADDING + i * CELL_SIZE}
              stroke="#8B6914"
              strokeWidth={0.8}
            />
            <line
              x1={PADDING + i * CELL_SIZE}
              y1={PADDING}
              x2={PADDING + i * CELL_SIZE}
              y2={PADDING + (BOARD_SIZE - 1) * CELL_SIZE}
              stroke="#8B6914"
              strokeWidth={0.8}
            />
          </g>
        ))}

        {starPoints.map(([r, c]) => (
          <circle
            key={`star-${r}-${c}`}
            cx={PADDING + c * CELL_SIZE}
            cy={PADDING + r * CELL_SIZE}
            r={3}
            fill="#8B6914"
          />
        ))}

        {board.map((row, ri) =>
          row.map((cell, ci) => {
            if (cell === 0) return null;
            const cx = PADDING + ci * CELL_SIZE;
            const cy = PADDING + ri * CELL_SIZE;
            const isWin = isWinCell(ri, ci);
            const isLast = lastMove?.row === ri && lastMove?.col === ci;

            return (
              <g key={`stone-${ri}-${ci}`}>
                <circle
                  cx={cx}
                  cy={cy}
                  r={STONE_RADIUS}
                  fill={cell === 1 ? "url(#blackStone)" : "url(#whiteStone)"}
                  filter={isWin ? "url(#glowWin)" : "url(#stoneShadow)"}
                  stroke={isWin ? "#FFD700" : cell === 2 ? "#bbb" : "none"}
                  strokeWidth={isWin ? 2 : 0}
                />
                {isLast && !isWin && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={3}
                    fill={cell === 1 ? "#ff6b6b" : "#e53e3e"}
                  />
                )}
              </g>
            );
          })
        )}

        {Array.from({ length: BOARD_SIZE }).map((_, ri) =>
          Array.from({ length: BOARD_SIZE }).map((_, ci) => (
            <rect
              key={`click-${ri}-${ci}`}
              x={PADDING + ci * CELL_SIZE - CELL_SIZE / 2}
              y={PADDING + ri * CELL_SIZE - CELL_SIZE / 2}
              width={CELL_SIZE}
              height={CELL_SIZE}
              fill="transparent"
              className="cursor-pointer"
              onClick={() => handleClick(ri, ci)}
            />
          ))
        )}

        {!gameOver && !isThinking && currentPlayer === playerPiece && (
          <g>
            {board.map((row, ri) =>
              row.map((cell, ci) => {
                if (cell !== 0) return null;
                const cx = PADDING + ci * CELL_SIZE;
                const cy = PADDING + ri * CELL_SIZE;
                const hoverFill = playerPiece === 1 ? "rgba(0,0,0,0.15)" : "rgba(255,255,255,0.35)";
                return (
                  <circle
                    key={`hover-${ri}-${ci}`}
                    cx={cx}
                    cy={cy}
                    r={STONE_RADIUS}
                    fill={hoverFill}
                    className="opacity-0 hover:opacity-100 transition-opacity pointer-events-none"
                  />
                );
              })
            )}
          </g>
        )}
      </svg>

      {isThinking && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-black/60 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            AI 思考中...
          </div>
        </div>
      )}
    </div>
  );
}
