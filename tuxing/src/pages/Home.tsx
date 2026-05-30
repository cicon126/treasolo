import ShapeSelector from '@/components/ShapeSelector'
import ColorPicker from '@/components/ColorPicker'
import ShapeCanvas from '@/components/ShapeCanvas'
import PropertyPanel from '@/components/PropertyPanel'
import { Hexagon } from 'lucide-react'

export default function Home() {
  return (
    <div className="h-screen w-screen bg-[#0a0a14] flex overflow-hidden">
      <aside className="w-80 flex flex-col border-r border-white/10 bg-[#0f0f1a]/80 backdrop-blur-xl">
        <div className="px-5 py-4 border-b border-white/10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#00ff88]/15 flex items-center justify-center">
            <Hexagon size={20} className="text-[#00ff88]" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-white tracking-tight">图形生成器</h1>
            <p className="text-[11px] text-zinc-500">选择图形 · 配置颜色 · 生成形状</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5 scrollbar-thin">
          <section>
            <h2 className="text-xs text-zinc-500 uppercase tracking-widest mb-3">图形类型</h2>
            <ShapeSelector />
          </section>

          <section>
            <h2 className="text-xs text-zinc-500 uppercase tracking-widest mb-3">颜色设置</h2>
            <ColorPicker />
          </section>

          <section>
            <h2 className="text-xs text-zinc-500 uppercase tracking-widest mb-3">属性调整</h2>
            <PropertyPanel />
          </section>
        </div>

        <div className="px-5 py-3 border-t border-white/10">
          <p className="text-[10px] text-zinc-600 text-center">
            点击「添加图形」将形状添加到画布 · 拖拽移动
          </p>
        </div>
      </aside>

      <main className="flex-1 p-4 flex flex-col">
        <ShapeCanvas />
      </main>
    </div>
  )
}
