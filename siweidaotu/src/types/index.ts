export type AnchorPosition = 'top' | 'right' | 'bottom' | 'left';

export interface MindMapNode {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  width: number;
  height: number;
}

export interface Connection {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  color: string;
  fromAnchor: AnchorPosition;
  toAnchor: AnchorPosition;
}

export interface CanvasState {
  offsetX: number;
  offsetY: number;
  scale: number;
  selectedNodeId: string | null;
  selectedConnectionId: string | null;
}

export interface DraggingConnection {
  fromNodeId: string;
  fromAnchor: AnchorPosition;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

export const PRESET_COLORS = [
  '#FF4444',
  '#FF8800',
  '#FFDD00',
  '#00CC66',
  '#00FFFF',
  '#3388FF',
  '#AA66FF',
  '#FF66AA',
  '#FFFFFF',
];

export const DEFAULT_NODE_COLOR = '#FFFFFF';
export const DEFAULT_CONNECTION_COLOR = '#888888';
export const ACCENT_COLOR = '#00FFFF';
export const BACKGROUND_COLOR = '#121212';
