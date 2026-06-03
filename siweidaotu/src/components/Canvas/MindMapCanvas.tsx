import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useMindMapStore } from '@/store/useMindMapStore';
import type { AnchorPosition, DraggingConnection } from '@/types';
import { ACCENT_COLOR } from '@/types';
import {
  screenToWorld,
  worldToScreen,
  getAnchorPosition,
  getNearestAnchor,
  getBezierPath,
} from '@/utils/coordinates';
import { MindMapNode as MindMapNodeComponent } from './MindMapNode';
import { MindMapConnection } from './MindMapConnection';

interface DragState {
  type: 'node' | 'canvas' | null;
  nodeId: string | null;
  startX: number;
  startY: number;
  nodeStartX: number;
  nodeStartY: number;
  canvasStartOffsetX: number;
  canvasStartOffsetY: number;
}

export const MindMapCanvas: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showHelp, setShowHelp] = useState(true);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    nodes,
    connections,
    canvas,
    addNode,
    updateNode,
    deleteNode,
    addConnection,
    setSelectedNode,
    setSelectedConnection,
    updateCanvas,
    getSelectedNode,
    getSelectedConnection,
  } = useMindMapStore();

  const [dragState, setDragState] = useState<DragState>({
    type: null,
    nodeId: null,
    startX: 0,
    startY: 0,
    nodeStartX: 0,
    nodeStartY: 0,
    canvasStartOffsetX: 0,
    canvasStartOffsetY: 0,
  });

  const [draggingConnection, setDraggingConnection] = useState<DraggingConnection | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  useEffect(() => {
    if (editingNodeId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingNodeId]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(0.25, Math.min(3, canvas.scale * delta));

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const worldX = (mouseX - canvas.offsetX) / canvas.scale;
      const worldY = (mouseY - canvas.offsetY) / canvas.scale;

      const newOffsetX = mouseX - worldX * newScale;
      const newOffsetY = mouseY - worldY * newScale;

      updateCanvas({
        scale: newScale,
        offsetX: newOffsetX,
        offsetY: newOffsetY,
      });
    }
  }, [canvas.scale, canvas.offsetX, canvas.offsetY, updateCanvas]);

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;
    if ((e.target as Element).closest('.mindmap-node')) return;

    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const worldPos = screenToWorld(
      mouseX,
      mouseY,
      canvas.offsetX,
      canvas.offsetY,
      canvas.scale
    );

    const nodeWidth = 120;
    const nodeHeight = 50;

    const newNodeId = addNode({
      x: worldPos.x - nodeWidth / 2,
      y: worldPos.y - nodeHeight / 2,
      text: '新节点',
      color: '#FFFFFF',
      width: nodeWidth,
      height: nodeHeight,
    });

    setSelectedNode(newNodeId);
  }, [canvas.offsetX, canvas.offsetY, canvas.scale, addNode, setSelectedNode]);

  const handleCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    if ((e.target as Element).closest('.mindmap-node')) return;
    if ((e.target as Element).closest('path')) return;

    setSelectedNode(null);
    setSelectedConnection(null);

    setDragState({
      type: 'canvas',
      nodeId: null,
      startX: e.clientX,
      startY: e.clientY,
      nodeStartX: 0,
      nodeStartY: 0,
      canvasStartOffsetX: canvas.offsetX,
      canvasStartOffsetY: canvas.offsetY,
    });
  }, [canvas.offsetX, canvas.offsetY, setSelectedNode, setSelectedConnection]);

  const handleNodeSelect = useCallback((id: string, e: React.MouseEvent) => {
    setSelectedNode(id);
  }, [setSelectedNode]);

  const handleNodeDragStart = useCallback((id: string, e: React.MouseEvent) => {
    if (editingNodeId) return;
    const node = nodes.find((n) => n.id === id);
    if (!node) return;

    setDragState({
      type: 'node',
      nodeId: id,
      startX: e.clientX,
      startY: e.clientY,
      nodeStartX: node.x,
      nodeStartY: node.y,
      canvasStartOffsetX: 0,
      canvasStartOffsetY: 0,
    });
  }, [nodes, editingNodeId]);

  const handleNodeDoubleClick = useCallback((id: string) => {
    const node = nodes.find((n) => n.id === id);
    if (!node) return;
    setEditingNodeId(id);
    setEditText(node.text);
  }, [nodes]);

  const handleEditTextChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEditText(e.target.value);
  }, []);

  const handleEditConfirm = useCallback(() => {
    if (editingNodeId) {
      const trimmed = editText.trim() || '新节点';
      const newWidth = Math.max(120, trimmed.length * 15);
      updateNode(editingNodeId, { text: trimmed, width: newWidth });
    }
    setEditingNodeId(null);
    setEditText('');
  }, [editingNodeId, editText, updateNode]);

  const handleEditKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleEditConfirm();
    }
    if (e.key === 'Escape') {
      setEditingNodeId(null);
      setEditText('');
    }
    e.stopPropagation();
  }, [handleEditConfirm]);

  const handleNodeTextChange = useCallback((id: string, text: string) => {
    const newWidth = Math.max(120, text.length * 15);
    updateNode(id, { text, width: newWidth });
  }, [updateNode]);

  const handleAnchorDragStart = useCallback((nodeId: string, anchor: AnchorPosition, e: React.MouseEvent) => {
    e.stopPropagation();
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;

    const anchorPos = getAnchorPosition(node, anchor);
    setDraggingConnection({
      fromNodeId: nodeId,
      fromAnchor: anchor,
      startX: anchorPos.x,
      startY: anchorPos.y,
      currentX: anchorPos.x,
      currentY: anchorPos.y,
    });
  }, [nodes]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const worldPos = screenToWorld(
      mouseX,
      mouseY,
      canvas.offsetX,
      canvas.offsetY,
      canvas.scale
    );

    if (draggingConnection) {
      setDraggingConnection((prev) =>
        prev ? { ...prev, currentX: worldPos.x, currentY: worldPos.y } : null
      );

      let foundHovered: string | null = null;
      for (const node of nodes) {
        if (node.id === draggingConnection.fromNodeId) continue;
        if (
          worldPos.x >= node.x &&
          worldPos.x <= node.x + node.width &&
          worldPos.y >= node.y &&
          worldPos.y <= node.y + node.height
        ) {
          foundHovered = node.id;
          break;
        }
      }
      setHoveredNode(foundHovered);
    }

    if (dragState.type === 'node' && dragState.nodeId) {
      const dx = (e.clientX - dragState.startX) / canvas.scale;
      const dy = (e.clientY - dragState.startY) / canvas.scale;
      updateNode(dragState.nodeId, {
        x: dragState.nodeStartX + dx,
        y: dragState.nodeStartY + dy,
      });
    }

    if (dragState.type === 'canvas') {
      const dx = e.clientX - dragState.startX;
      const dy = e.clientY - dragState.startY;
      updateCanvas({
        offsetX: dragState.canvasStartOffsetX + dx,
        offsetY: dragState.canvasStartOffsetY + dy,
      });
    }
  }, [canvas, dragState, draggingConnection, nodes, updateNode, updateCanvas]);

  const handleMouseUp = useCallback(() => {
    if (draggingConnection && hoveredNode) {
      const fromNode = nodes.find((n) => n.id === draggingConnection.fromNodeId);
      const toNode = nodes.find((n) => n.id === hoveredNode);

      if (fromNode && toNode) {
        const toAnchor = getNearestAnchor(toNode, draggingConnection.currentX, draggingConnection.currentY);
        addConnection({
          fromNodeId: draggingConnection.fromNodeId,
          toNodeId: hoveredNode,
          fromAnchor: draggingConnection.fromAnchor,
          toAnchor,
          color: '#888888',
        });
      }
    }

    setDragState({
      type: null,
      nodeId: null,
      startX: 0,
      startY: 0,
      nodeStartX: 0,
      nodeStartY: 0,
      canvasStartOffsetX: 0,
      canvasStartOffsetY: 0,
    });
    setDraggingConnection(null);
    setHoveredNode(null);
  }, [draggingConnection, hoveredNode, nodes, addConnection]);

  const handleConnectionSelect = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedConnection(id);
  }, [setSelectedConnection]);

  const handleConnectionContextMenu = useCallback((id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    useMindMapStore.getState().deleteConnection(id);
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (editingNodeId) return;
    if (e.key === 'Delete' || e.key === 'Backspace') {
      const selectedNode = getSelectedNode();
      const selectedConn = getSelectedConnection();
      if (selectedNode && document.activeElement?.tagName !== 'INPUT') {
        deleteNode(selectedNode.id);
      } else if (selectedConn) {
        useMindMapStore.getState().deleteConnection(selectedConn.id);
      }
    }
    if (e.key === 'Escape') {
      setSelectedNode(null);
      setSelectedConnection(null);
    }
  }, [editingNodeId, getSelectedNode, getSelectedConnection, deleteNode, setSelectedNode, setSelectedConnection]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const renderDraggingConnection = () => {
    if (!draggingConnection) return null;

    const toAnchor = hoveredNode
      ? getNearestAnchor(
          nodes.find((n) => n.id === hoveredNode)!,
          draggingConnection.currentX,
          draggingConnection.currentY
        )
      : 'right';

    let endX = draggingConnection.currentX;
    let endY = draggingConnection.currentY;

    if (hoveredNode) {
      const node = nodes.find((n) => n.id === hoveredNode);
      if (node) {
        const pos = getAnchorPosition(node, toAnchor);
        endX = pos.x;
        endY = pos.y;
      }
    }

    const pathD = getBezierPath(
      draggingConnection.startX,
      draggingConnection.startY,
      endX,
      endY,
      draggingConnection.fromAnchor,
      toAnchor
    );

    return (
      <g>
        <defs>
          <marker
            id="dragging-arrow"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M0,0 L0,6 L9,3 z" fill={ACCENT_COLOR} />
          </marker>
        </defs>
        <path
          d={pathD}
          fill="none"
          stroke={ACCENT_COLOR}
          strokeWidth="3"
          strokeDasharray="8,4"
          strokeLinecap="round"
          markerEnd="url(#dragging-arrow)"
          className="pointer-events-none"
          style={{
            filter: `drop-shadow(0 0 6px ${ACCENT_COLOR})`,
          }}
        />
      </g>
    );
  };

  const renderTextEditor = () => {
    if (!editingNodeId) return null;
    const node = nodes.find((n) => n.id === editingNodeId);
    if (!node) return null;

    const screenPos = worldToScreen(node.x, node.y, canvas.offsetX, canvas.offsetY, canvas.scale);

    return (
      <div
        className="absolute z-30"
        style={{
          left: screenPos.x,
          top: screenPos.y,
          width: node.width * canvas.scale,
          height: node.height * canvas.scale,
        }}
      >
        <input
          ref={inputRef}
          type="text"
          value={editText}
          onChange={handleEditTextChange}
          onBlur={handleEditConfirm}
          onKeyDown={handleEditKeyDown}
          className="w-full h-full text-center outline-none rounded-lg"
          style={{
            backgroundColor: node.color === '#FFFFFF' ? '#1a1a1a' : node.color,
            border: `3px solid ${ACCENT_COLOR}`,
            color: node.color === '#FFFFFF' ? '#FFFFFF' : '#000000',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 14 * canvas.scale,
            fontWeight: 500,
            boxShadow: `0 0 20px ${ACCENT_COLOR}60`,
          }}
        />
      </div>
    );
  };

  const gridSize = 40;
  const scaledGridSize = gridSize * canvas.scale;

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative overflow-hidden cursor-grab active:cursor-grabbing"
      style={{ backgroundColor: '#121212' }}
      onWheel={handleWheel}
      onMouseDown={handleCanvasMouseDown}
      onDoubleClick={handleDoubleClick}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, #2a2a2a 1.5px, transparent 1.5px)`,
          backgroundSize: `${scaledGridSize}px ${scaledGridSize}px`,
          backgroundPosition: `${canvas.offsetX % scaledGridSize}px ${canvas.offsetY % scaledGridSize}px`,
        }}
      />

      <svg
        ref={svgRef}
        className="mindmap-svg absolute inset-0 w-full h-full"
        style={{ overflow: 'visible' }}
      >
        <g
          style={{
            transform: `translate(${canvas.offsetX}px, ${canvas.offsetY}px) scale(${canvas.scale})`,
            transformOrigin: '0 0',
          }}
        >
          {connections.map((conn) => (
            <MindMapConnection
              key={conn.id}
              connection={conn}
              nodes={nodes}
              isSelected={canvas.selectedConnectionId === conn.id}
              onSelect={handleConnectionSelect}
              onContextMenu={handleConnectionContextMenu}
            />
          ))}

          {renderDraggingConnection()}

          {nodes.map((node) => (
            <MindMapNodeComponent
              key={node.id}
              node={node}
              isSelected={canvas.selectedNodeId === node.id}
              isHoveredTarget={hoveredNode === node.id && !!draggingConnection}
              onSelect={handleNodeSelect}
              onDragStart={handleNodeDragStart}
              onDoubleClick={handleNodeDoubleClick}
              onAnchorDragStart={handleAnchorDragStart}
            />
          ))}
        </g>
      </svg>

      {renderTextEditor()}

      {showHelp && nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className="text-center p-8 rounded-xl border-2 border-dashed pointer-events-auto"
            style={{
              borderColor: '#333',
              backgroundColor: 'rgba(20, 20, 20, 0.9)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <h2
              className="text-2xl font-bold mb-4"
              style={{
                color: ACCENT_COLOR,
                fontFamily: "'Space Mono', monospace",
              }}
            >
              在线思维导图
            </h2>
            <div className="text-gray-400 text-sm space-y-2 mb-6" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              <p>🖱️ 双击画布创建新节点</p>
              <p>📝 双击节点编辑文本</p>
              <p>🔗 拖拽节点边缘锚点创建连线</p>
              <p>🗑️ 右键点击连线删除</p>
              <p>🎨 选中节点/连线后在右侧设置颜色</p>
              <p>🔍 滚轮缩放，拖拽画布平移</p>
            </div>
            <button
              className="px-6 py-2 border-2 font-bold transition-all hover:bg-cyan-400 hover:text-black"
              style={{
                borderColor: ACCENT_COLOR,
                color: ACCENT_COLOR,
                fontFamily: "'Space Mono', monospace",
              }}
              onClick={() => setShowHelp(false)}
            >
              开始使用
            </button>
          </div>
        </div>
      )}

      <div
        className="absolute bottom-4 left-4 text-xs px-3 py-1.5 rounded"
        style={{
          backgroundColor: 'rgba(30, 30, 30, 0.9)',
          color: '#888',
          fontFamily: "'JetBrains Mono', monospace",
          border: '1px solid #333',
        }}
      >
        缩放: {Math.round(canvas.scale * 100)}%
      </div>
    </div>
  );
};
