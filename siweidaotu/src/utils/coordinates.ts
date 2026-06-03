import type { AnchorPosition, MindMapNode } from '@/types';

export interface Point {
  x: number;
  y: number;
}

export function screenToWorld(
  screenX: number,
  screenY: number,
  offsetX: number,
  offsetY: number,
  scale: number
): Point {
  return {
    x: (screenX - offsetX) / scale,
    y: (screenY - offsetY) / scale,
  };
}

export function worldToScreen(
  worldX: number,
  worldY: number,
  offsetX: number,
  offsetY: number,
  scale: number
): Point {
  return {
    x: worldX * scale + offsetX,
    y: worldY * scale + offsetY,
  };
}

export function getAnchorPosition(
  node: MindMapNode,
  anchor: AnchorPosition
): Point {
  const { x, y, width, height } = node;
  switch (anchor) {
    case 'top':
      return { x: x + width / 2, y };
    case 'right':
      return { x: x + width, y: y + height / 2 };
    case 'bottom':
      return { x: x + width / 2, y: y + height };
    case 'left':
      return { x, y: y + height / 2 };
  }
}

export function getNearestAnchor(
  node: MindMapNode,
  targetX: number,
  targetY: number
): AnchorPosition {
  const anchors: AnchorPosition[] = ['top', 'right', 'bottom', 'left'];
  let nearest: AnchorPosition = 'right';
  let minDist = Infinity;

  for (const anchor of anchors) {
    const pos = getAnchorPosition(node, anchor);
    const dist = Math.hypot(pos.x - targetX, pos.y - targetY);
    if (dist < minDist) {
      minDist = dist;
      nearest = anchor;
    }
  }

  return nearest;
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

export function getBezierPath(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  startAnchor: AnchorPosition,
  endAnchor: AnchorPosition
): string {
  const dx = Math.abs(endX - startX);
  const dy = Math.abs(endY - startY);
  const controlOffset = Math.max(dx, dy) * 0.5;

  let cp1x = startX;
  let cp1y = startY;
  let cp2x = endX;
  let cp2y = endY;

  switch (startAnchor) {
    case 'top':
      cp1y -= controlOffset;
      break;
    case 'right':
      cp1x += controlOffset;
      break;
    case 'bottom':
      cp1y += controlOffset;
      break;
    case 'left':
      cp1x -= controlOffset;
      break;
  }

  switch (endAnchor) {
    case 'top':
      cp2y -= controlOffset;
      break;
    case 'right':
      cp2x += controlOffset;
      break;
    case 'bottom':
      cp2y += controlOffset;
      break;
    case 'left':
      cp2x -= controlOffset;
      break;
  }

  return `M ${startX} ${startY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${endX} ${endY}`;
}
