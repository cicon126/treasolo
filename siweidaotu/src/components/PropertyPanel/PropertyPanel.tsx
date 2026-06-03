import React from 'react';
import { X, Palette, Type, Trash2 } from 'lucide-react';
import { useMindMapStore } from '@/store/useMindMapStore';
import { PRESET_COLORS, ACCENT_COLOR } from '@/types';
import { withAlpha } from '@/utils/colors';

interface PropertyPanelProps {
  onClose: () => void;
}

export const PropertyPanel: React.FC<PropertyPanelProps> = ({ onClose }) => {
  const {
    canvas,
    nodes,
    connections,
    getSelectedNode,
    getSelectedConnection,
    updateNode,
    updateConnection,
    deleteNode,
  } = useMindMapStore();

  const selectedNode = getSelectedNode();
  const selectedConnection = getSelectedConnection();

  const hasSelection = selectedNode || selectedConnection;

  const handleColorChange = (color: string) => {
    if (selectedNode) {
      updateNode(selectedNode.id, { color });
    } else if (selectedConnection) {
      updateConnection(selectedConnection.id, { color });
    }
  };

  const handleTextChange = (text: string) => {
    if (selectedNode) {
      const newWidth = Math.max(120, text.length * 15);
      updateNode(selectedNode.id, { text, width: newWidth });
    }
  };

  const handleDelete = () => {
    if (selectedNode) {
      deleteNode(selectedNode.id);
      onClose();
    } else if (selectedConnection) {
      useMindMapStore.getState().deleteConnection(selectedConnection.id);
      onClose();
    }
  };

  const getConnectedNodes = () => {
    if (!selectedConnection) return null;
    const fromNode = nodes.find((n) => n.id === selectedConnection.fromNodeId);
    const toNode = nodes.find((n) => n.id === selectedConnection.toNodeId);
    return { fromNode, toNode };
  };

  const connectedNodes = selectedConnection ? getConnectedNodes() : null;

  return (
    <div
      className="fixed top-0 right-0 h-full z-40 flex flex-col"
      style={{
        width: 320,
        backgroundColor: 'rgba(15, 15, 15, 0.95)',
        backdropFilter: 'blur(10px)',
        borderLeft: '2px solid #222',
        transform: hasSelection ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        paddingTop: 70,
      }}
    >
      <div
        className="flex items-center justify-between px-5 py-4 border-b"
        style={{ borderColor: '#222' }}
      >
        <h3
          className="text-lg font-bold"
          style={{
            color: ACCENT_COLOR,
            fontFamily: "'Space Mono', monospace",
          }}
        >
          {selectedNode ? '◆ 节点属性' : selectedConnection ? '◆ 连线属性' : '属性面板'}
        </h3>
        <button
          className="p-1 hover:bg-gray-800 rounded transition-colors"
          onClick={onClose}
          style={{ color: '#888' }}
        >
          <X size={20} />
        </button>
      </div>

      {!hasSelection && (
        <div className="flex-1 flex items-center justify-center p-6">
          <p
            className="text-center text-gray-500"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            选中一个节点或连线<br />以编辑其属性
          </p>
        </div>
      )}

      {hasSelection && (
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {selectedNode && (
            <div className="space-y-4">
              <div>
                <label
                  className="flex items-center gap-2 text-sm font-bold mb-2"
                  style={{
                    color: '#aaa',
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  <Type size={16} />
                  节点文本
                </label>
                <input
                  type="text"
                  value={selectedNode.text}
                  onChange={(e) => handleTextChange(e.target.value)}
                  className="w-full px-4 py-2.5 border-2 bg-transparent text-white outline-none transition-colors"
                  style={{
                    borderColor: '#333',
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = ACCENT_COLOR)}
                  onBlur={(e) => (e.target.style.borderColor = '#333')}
                />
              </div>

              <div
                className="p-3 rounded"
                style={{
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #222',
                }}
              >
                <p
                  className="text-xs text-gray-500 mb-1"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  位置信息
                </p>
                <p
                  className="text-sm text-gray-400"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  X: {Math.round(selectedNode.x)} | Y: {Math.round(selectedNode.y)}
                </p>
                <p
                  className="text-sm text-gray-400"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  宽度: {Math.round(selectedNode.width)}px
                </p>
              </div>
            </div>
          )}

          {selectedConnection && connectedNodes && (
            <div
              className="p-3 rounded space-y-2"
              style={{
                backgroundColor: '#1a1a1a',
                border: '1px solid #222',
              }}
            >
              <p
                className="text-xs text-gray-500 mb-2"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                连接信息
              </p>
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: connectedNodes.fromNode?.color || '#888' }}
                />
                <span
                  className="text-sm text-gray-300 truncate flex-1"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {connectedNodes.fromNode?.text || '未知'}
                </span>
              </div>
              <div className="flex justify-center">
                <span style={{ color: '#666' }}>↓</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: connectedNodes.toNode?.color || '#888' }}
                />
                <span
                  className="text-sm text-gray-300 truncate flex-1"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {connectedNodes.toNode?.text || '未知'}
                </span>
              </div>
            </div>
          )}

          <div>
            <label
              className="flex items-center gap-2 text-sm font-bold mb-3"
              style={{
                color: '#aaa',
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              <Palette size={16} />
              {selectedNode ? '节点颜色' : '连线颜色'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  className="w-full aspect-square border-2 transition-all hover:scale-110 active:scale-95"
                  style={{
                    backgroundColor: color === '#FFFFFF' ? '#1a1a1a' : color,
                    borderColor:
                      (selectedNode?.color || selectedConnection?.color) === color
                        ? ACCENT_COLOR
                        : '#333',
                    boxShadow:
                      (selectedNode?.color || selectedConnection?.color) === color
                        ? `0 0 15px ${withAlpha(ACCENT_COLOR, 0.5)}`
                        : 'none',
                    cursor: 'pointer',
                  }}
                  onClick={() => handleColorChange(color)}
                  title={color}
                >
                  {color === '#FFFFFF' && (
                    <span
                      className="text-xs font-bold"
                      style={{ color: '#FFFFFF', fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      白
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="mt-4">
              <label
                className="text-xs text-gray-500 block mb-2"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                自定义颜色
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={selectedNode?.color || selectedConnection?.color || '#888888'}
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="w-12 h-10 border-2 cursor-pointer"
                  style={{
                    borderColor: '#333',
                    backgroundColor: 'transparent',
                  }}
                />
                <input
                  type="text"
                  value={selectedNode?.color || selectedConnection?.color || '#888888'}
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="flex-1 px-3 py-2 border-2 bg-transparent text-white text-sm uppercase outline-none"
                  style={{
                    borderColor: '#333',
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                  pattern="#[0-9A-Fa-f]{6}"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t" style={{ borderColor: '#222' }}>
            <button
              className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 font-bold text-sm transition-all hover:bg-red-500/20 active:scale-95"
              style={{
                borderColor: '#FF4444',
                color: '#FF4444',
                fontFamily: "'JetBrains Mono', monospace",
              }}
              onClick={handleDelete}
            >
              <Trash2 size={18} />
              {selectedNode ? '删除节点' : '删除连线'}
            </button>
            <p
              className="text-xs text-gray-600 text-center mt-2"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              按 Delete 键也可删除
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
