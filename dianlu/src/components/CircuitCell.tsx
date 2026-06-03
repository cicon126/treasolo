import type { CircuitCellData } from '@/types/circuit';
import { Zap, Lightbulb } from 'lucide-react';

interface CircuitCellProps {
  cell: CircuitCellData;
  onClick: () => void;
  size: number;
}

export function CircuitCell({ cell, onClick, size }: CircuitCellProps) {
  const poweredColor = cell.isPowered ? '#22c55e' : '#475569';
  const lineWidth = size * 0.15;
  const center = size / 2;

  const renderCircuit = () => {
    const svgSize = size;

    switch (cell.type) {
      case 'straight':
        return (
          <svg
            width={svgSize}
            height={svgSize}
            viewBox={`0 0 ${size} ${size}`}
            style={{ transform: `rotate(${cell.rotation}deg`, transition: 'transform 0.3s ease' }}
          >
            <line
              x1={center}
              y1={0}
              x2={center}
              y2={size}
              stroke={poweredColor}
              strokeWidth={lineWidth}
              strokeLinecap="round"
            />
          </svg>
        );

      case 'corner':
        return (
          <svg
            width={svgSize}
            height={svgSize}
            viewBox={`0 0 ${size} ${size}`}
            style={{ transform: `rotate(${cell.rotation}deg`, transition: 'transform 0.3s ease' }}
          >
            <path
              d={`M ${center} 0 L ${center} ${center} L ${size} ${center}`}
              stroke={poweredColor}
              strokeWidth={lineWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        );

      case 'tee':
        return (
          <svg
            width={svgSize}
            height={svgSize}
            viewBox={`0 0 ${size} ${size}`}
            style={{ transform: `rotate(${cell.rotation}deg`, transition: 'transform 0.3s ease' }}
          >
            <line
              x1={center}
              y1={0}
              x2={center}
              y2={size}
              stroke={poweredColor}
              strokeWidth={lineWidth}
              strokeLinecap="round"
            />
            <line
              x1={center}
              y1={center}
              x2={size}
              y2={center}
              stroke={poweredColor}
              strokeWidth={lineWidth}
              strokeLinecap="round"
            />
          </svg>
        );

      case 'cross':
        return (
          <svg
            width={svgSize}
            height={svgSize}
            viewBox={`0 0 ${size} ${size}`}
            style={{ transform: `rotate(${cell.rotation}deg`, transition: 'transform 0.3s ease' }}
          >
            <line
              x1={center}
              y1={0}
              x2={center}
              y2={size}
              stroke={poweredColor}
              strokeWidth={lineWidth}
              strokeLinecap="round"
            />
            <line
              x1={0}
              y1={center}
              x2={size}
              y2={center}
              stroke={poweredColor}
              strokeWidth={lineWidth}
              strokeLinecap="round"
            />
          </svg>
        );

      case 'source':
        return (
          <div
            className="flex items-center justify-center"
            style={{ width: size, height: size }}
          >
            <div
              className={`rounded-full bg-red-500 flex items-center justify-center transition-all duration-300 ${
                cell.isPowered ? 'shadow-lg shadow-red-500/50 animate-pulse' : ''
              }`}
              style={{ width: size * 0.7, height: size * 0.7 }}
            >
              <Zap size={size * 0.4} className="text-white" fill="white" />
            </div>
          </div>
        );

      case 'target':
        return (
          <div
            className="flex items-center justify-center"
            style={{ width: size, height: size }}
          >
            <div
              className={`rounded-full flex items-center justify-center transition-all duration-500 ${
                cell.isPowered
                  ? 'bg-green-500 shadow-lg shadow-green-500/50 animate-pulse'
                  : 'bg-slate-600'
              }`}
              style={{ width: size * 0.7, height: size * 0.7 }}
            >
              <Lightbulb
                size={size * 0.4}
                className={cell.isPowered ? 'text-white' : 'text-slate-400'}
                fill={cell.isPowered ? 'white' : 'none'}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const isClickable = cell.type !== 'source' && cell.type !== 'target';

  return (
    <div
      className={`relative bg-slate-800 border border-slate-700 rounded-lg overflow-hidden ${
        isClickable
          ? 'cursor-pointer hover:bg-slate-700 transition-colors duration-200'
          : ''
      }`}
      onClick={isClickable ? onClick : undefined}
      style={{ width: size, height: size }}
    >
      {renderCircuit()}
      {cell.isPowered && cell.type !== 'source' && cell.type !== 'target' && (
        <div className="absolute inset-0 bg-green-500/10 pointer-events-none" />
      )}
    </div>
  );
}
