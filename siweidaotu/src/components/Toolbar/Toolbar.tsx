import React, { useRef } from 'react';
import { Trash2, Download, HelpCircle, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { useMindMapStore } from '@/store/useMindMapStore';
import { exportAsPng, exportAsSvg } from '@/utils/export';
import { ACCENT_COLOR } from '@/types';

interface ToolbarProps {
  onShowHelp: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({ onShowHelp }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const { clearAll, updateCanvas, canvas } = useMindMapStore();

  const handleZoomIn = () => {
    const newScale = Math.min(3, canvas.scale * 1.2);
    updateCanvas({ scale: newScale });
  };

  const handleZoomOut = () => {
    const newScale = Math.max(0.25, canvas.scale / 1.2);
    updateCanvas({ scale: newScale });
  };

  const handleResetView = () => {
    updateCanvas({
      scale: 1,
      offsetX: 0,
      offsetY: 0,
    });
  };

  const handleExportSvg = () => {
    const svg = document.querySelector('.mindmap-svg') as SVGSVGElement;
    if (svg) {
      svgRef.current = svg;
      exportAsSvg(svg);
    }
  };

  const handleExportPng = () => {
    const svg = document.querySelector('.mindmap-svg') as SVGSVGElement;
    if (svg) {
      svgRef.current = svg;
      exportAsPng(svg);
    }
  };

  const ToolbarButton: React.FC<{
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    danger?: boolean;
  }> = ({ icon, label, onClick, danger }) => (
    <button
      className="flex items-center gap-2 px-4 py-2 border-2 font-bold text-sm transition-all hover:scale-105 active:scale-95"
      style={{
        borderColor: danger ? '#FF4444' : '#444',
        color: danger ? '#FF4444' : '#fff',
        backgroundColor: 'rgba(20, 20, 20, 0.95)',
        fontFamily: "'JetBrains Mono', monospace",
      }}
      onClick={onClick}
      title={label}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 flex items-center gap-2 p-3"
      style={{
        backgroundColor: 'rgba(15, 15, 15, 0.85)',
        backdropFilter: 'blur(10px)',
        borderBottom: '2px solid #222',
      }}
    >
      <div
        className="text-xl font-bold px-3 py-1 mr-4"
        style={{
          color: ACCENT_COLOR,
          fontFamily: "'Space Mono', monospace",
          letterSpacing: '0.05em',
          textShadow: `0 0 10px ${ACCENT_COLOR}40`,
        }}
      >
        ◆ MINDMAP
      </div>

      <div className="flex items-center gap-2 border-l border-r border-gray-700 px-3">
        <ToolbarButton icon={<ZoomOut size={18} />} label="缩小" onClick={handleZoomOut} />
        <ToolbarButton icon={<ZoomIn size={18} />} label="放大" onClick={handleZoomIn} />
        <ToolbarButton icon={<RotateCcw size={18} />} label="重置视图" onClick={handleResetView} />
      </div>

      <div className="flex items-center gap-2 border-r border-gray-700 px-3">
        <ToolbarButton icon={<Download size={18} />} label="导出PNG" onClick={handleExportPng} />
        <ToolbarButton icon={<Download size={18} />} label="导出SVG" onClick={handleExportSvg} />
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <ToolbarButton icon={<HelpCircle size={18} />} label="帮助" onClick={onShowHelp} />
        <ToolbarButton icon={<Trash2 size={18} />} label="清除全部" onClick={clearAll} danger />
      </div>
    </div>
  );
};
