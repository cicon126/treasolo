import React from 'react';
import type { Connection, MindMapNode as MindMapNodeType } from '@/types';
import { ACCENT_COLOR } from '@/types';
import { getAnchorPosition, getBezierPath } from '@/utils/coordinates';
import { withAlpha } from '@/utils/colors';

interface MindMapConnectionProps {
  connection: Connection;
  nodes: MindMapNodeType[];
  isSelected: boolean;
  onSelect: (id: string, e: React.MouseEvent) => void;
  onContextMenu: (id: string, e: React.MouseEvent) => void;
}

export const MindMapConnection: React.FC<MindMapConnectionProps> = ({
  connection,
  nodes,
  isSelected,
  onSelect,
  onContextMenu,
}) => {
  const fromNode = nodes.find((n) => n.id === connection.fromNodeId);
  const toNode = nodes.find((n) => n.id === connection.toNodeId);

  if (!fromNode || !toNode) return null;

  const startPos = getAnchorPosition(fromNode, connection.fromAnchor);
  const endPos = getAnchorPosition(toNode, connection.toAnchor);

  const pathD = getBezierPath(
    startPos.x,
    startPos.y,
    endPos.x,
    endPos.y,
    connection.fromAnchor,
    connection.toAnchor
  );

  const arrowId = `arrow-${connection.id}`;
  const color = connection.color;

  return (
    <g>
      <defs>
        <marker
          id={arrowId}
          markerWidth="10"
          markerHeight="10"
          refX="9"
          refY="3"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M0,0 L0,6 L9,3 z" fill={color} />
        </marker>
      </defs>

      <path
        d={pathD}
        fill="none"
        stroke="transparent"
        strokeWidth="20"
        className="cursor-pointer"
        onClick={(e) => onSelect(connection.id, e)}
        onContextMenu={(e) => onContextMenu(connection.id, e)}
      />

      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth={isSelected ? 4 : 2.5}
        strokeLinecap="round"
        markerEnd={`url(#${arrowId})`}
        className="pointer-events-none transition-all duration-200"
        style={{
          filter: isSelected
            ? `drop-shadow(0 0 8px ${withAlpha(ACCENT_COLOR, 0.8)})`
            : 'none',
        }}
      />
    </g>
  );
};
