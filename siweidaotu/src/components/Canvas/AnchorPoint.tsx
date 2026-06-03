import React from 'react';
import type { AnchorPosition } from '@/types';
import { ACCENT_COLOR } from '@/types';

interface AnchorPointProps {
  position: AnchorPosition;
  nodeWidth: number;
  nodeHeight: number;
  onMouseDown: (position: AnchorPosition, e: React.MouseEvent) => void;
}

const anchorStyles: Record<AnchorPosition, React.CSSProperties> = {
  top: { top: -6, left: '50%', transform: 'translateX(-50%)' },
  right: { right: -6, top: '50%', transform: 'translateY(-50%)' },
  bottom: { bottom: -6, left: '50%', transform: 'translateX(-50%)' },
  left: { left: -6, top: '50%', transform: 'translateY(-50%)' },
};

export const AnchorPoint: React.FC<AnchorPointProps> = ({
  position,
  onMouseDown,
}) => {
  return (
    <div
      className="absolute w-3 h-3 rounded-full cursor-crosshair opacity-0 hover:opacity-100 transition-opacity z-10"
      style={{
        ...anchorStyles[position],
        backgroundColor: ACCENT_COLOR,
        boxShadow: `0 0 8px ${ACCENT_COLOR}`,
        border: '2px solid #121212',
      }}
      onMouseDown={(e) => {
        e.stopPropagation();
        onMouseDown(position, e);
      }}
      title="拖拽创建连线"
    />
  );
};
