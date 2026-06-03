import React from 'react';
import type { MindMapNode as MindMapNodeType, AnchorPosition } from '@/types';
import { ACCENT_COLOR } from '@/types';
import { getTextColor, withAlpha } from '@/utils/colors';

interface MindMapNodeProps {
  node: MindMapNodeType;
  isSelected: boolean;
  isHoveredTarget: boolean;
  onSelect: (id: string, e: React.MouseEvent) => void;
  onDragStart: (id: string, e: React.MouseEvent) => void;
  onDoubleClick: (id: string) => void;
  onAnchorDragStart: (nodeId: string, anchor: AnchorPosition, e: React.MouseEvent) => void;
}

const anchorPositions: { pos: AnchorPosition; getCx: (n: MindMapNodeType) => number; getCy: (n: MindMapNodeType) => number }[] = [
  { pos: 'top', getCx: (n) => n.x + n.width / 2, getCy: (n) => n.y },
  { pos: 'right', getCx: (n) => n.x + n.width, getCy: (n) => n.y + n.height / 2 },
  { pos: 'bottom', getCx: (n) => n.x + n.width / 2, getCy: (n) => n.y + n.height },
  { pos: 'left', getCx: (n) => n.x, getCy: (n) => n.y + n.height / 2 },
];

export const MindMapNode: React.FC<MindMapNodeProps> = ({
  node,
  isSelected,
  isHoveredTarget,
  onSelect,
  onDragStart,
  onDoubleClick,
  onAnchorDragStart,
}) => {
  const bgColor = node.color === '#FFFFFF' ? '#1a1a1a' : node.color;
  const borderColor = node.color;
  const textColor = node.color === '#FFFFFF' ? '#FFFFFF' : getTextColor(node.color);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    onSelect(node.id, e);
    onDragStart(node.id, e);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDoubleClick(node.id);
  };

  return (
    <g
      className="mindmap-node"
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      style={{
        cursor: 'move',
        opacity: isHoveredTarget ? 0.6 : 1,
        transition: 'opacity 0.15s',
      }}
    >
      {isSelected && (
        <rect
          x={node.x - 4}
          y={node.y - 4}
          width={node.width + 8}
          height={node.height + 8}
          rx={12}
          ry={12}
          fill="none"
          stroke={ACCENT_COLOR}
          strokeWidth={2}
          style={{
            filter: `drop-shadow(0 0 10px ${withAlpha(ACCENT_COLOR, 0.6)})`,
          }}
        />
      )}

      <rect
        x={node.x}
        y={node.y}
        width={node.width}
        height={node.height}
        rx={8}
        ry={8}
        fill={bgColor}
        stroke={borderColor}
        strokeWidth={3}
        style={{
          filter: isSelected
            ? `drop-shadow(0 0 15px ${withAlpha(ACCENT_COLOR, 0.5)}) drop-shadow(0 0 30px ${withAlpha(ACCENT_COLOR, 0.25)})`
            : 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
          transition: 'filter 0.2s',
        }}
      />

      <text
        x={node.x + node.width / 2}
        y={node.y + node.height / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fill={textColor}
        fontSize={14}
        fontFamily="'JetBrains Mono', monospace"
        fontWeight={500}
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        {node.text}
      </text>

      {anchorPositions.map(({ pos, getCx, getCy }) => (
        <g key={pos}>
          <circle
            cx={getCx(node)}
            cy={getCy(node)}
            r={10}
            fill="transparent"
            stroke="none"
            style={{ cursor: 'crosshair', pointerEvents: 'all' }}
            onMouseDown={(e) => {
              e.stopPropagation();
              onAnchorDragStart(node.id, pos, e);
            }}
          />
          <circle
            cx={getCx(node)}
            cy={getCy(node)}
            r={6}
            fill={ACCENT_COLOR}
            stroke="#121212"
            strokeWidth={2}
            className="anchor-circle"
            style={{
              pointerEvents: 'none',
              transition: 'opacity 0.15s',
            }}
          />
        </g>
      ))}
    </g>
  );
};
