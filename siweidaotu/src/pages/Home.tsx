import { useState } from 'react';
import { MindMapCanvas } from '@/components/Canvas/MindMapCanvas';
import { Toolbar } from '@/components/Toolbar/Toolbar';
import { PropertyPanel } from '@/components/PropertyPanel/PropertyPanel';
import { useMindMapStore } from '@/store/useMindMapStore';

export default function Home() {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <div className="w-screen h-screen overflow-hidden relative">
      <Toolbar onShowHelp={() => setShowHelp(true)} />

      <div className="w-full h-full pt-16">
        <MindMapCanvas />
      </div>

      <PropertyPanel
        onClose={() => {
          const { setSelectedNode, setSelectedConnection } = useMindMapStore.getState();
          setSelectedNode(null);
          setSelectedConnection(null);
        }}
      />

      {showHelp && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
          onClick={() => setShowHelp(false)}
        >
          <div
            className="max-w-lg p-8 rounded-xl border-2 mx-4"
            style={{
              borderColor: '#333',
              backgroundColor: '#121212',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              className="text-2xl font-bold mb-6 text-center"
              style={{
                color: '#00FFFF',
                fontFamily: "'Space Mono', monospace",
              }}
            >
              ◆ 操作指南
            </h2>
            <div
              className="space-y-4 text-gray-300 text-sm"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              <div className="flex items-start gap-3">
                <span className="text-cyan-400 font-bold">01</span>
                <p><strong className="text-white">创建节点：</strong>双击画布空白处创建新节点</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-cyan-400 font-bold">02</span>
                <p><strong className="text-white">编辑文本：</strong>双击节点进入文本编辑模式</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-cyan-400 font-bold">03</span>
                <p><strong className="text-white">移动节点：</strong>拖拽节点到任意位置</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-cyan-400 font-bold">04</span>
                <p><strong className="text-white">创建连线：</strong>将鼠标悬停在节点上，拖拽边缘的青色锚点到另一个节点</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-cyan-400 font-bold">05</span>
                <p><strong className="text-white">删除连线：</strong>右键点击连线即可删除</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-cyan-400 font-bold">06</span>
                <p><strong className="text-white">设置颜色：</strong>选中节点或连线后，在右侧面板选择颜色</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-cyan-400 font-bold">07</span>
                <p><strong className="text-white">画布操作：</strong>滚轮缩放，拖拽空白区域平移画布</p>
              </div>
            </div>
            <button
              className="w-full mt-6 px-6 py-3 border-2 font-bold transition-all hover:bg-cyan-400 hover:text-black"
              style={{
                borderColor: '#00FFFF',
                color: '#00FFFF',
                fontFamily: "'Space Mono', monospace",
              }}
              onClick={() => setShowHelp(false)}
            >
              知道了
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
