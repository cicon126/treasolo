import { useShapeStore } from '@/store/useShapeStore'

const PRESET_COLORS = [
  '#00ff88', '#ff3366', '#3366ff', '#ffcc00',
  '#ff6600', '#cc33ff', '#00ccff', '#66ff33',
  '#ff99cc', '#99ffcc', '#cc99ff', '#ffff66',
  '#ff3333', '#33ff99', '#9933ff', '#ff9933',
]

function ColorSection({
  title,
  color,
  onChange,
}: {
  title: string
  color: string
  onChange: (color: string) => void
}) {
  return (
    <div className="bg-white/5 rounded-xl p-3">
      <div className="text-sm text-zinc-400 font-medium mb-2">{title}</div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {PRESET_COLORS.map((c) => (
          <div
            key={c}
            className={`w-7 h-7 rounded-full cursor-pointer ${color === c ? 'ring-2 ring-white' : ''}`}
            style={{ backgroundColor: c }}
            onClick={() => onChange(c)}
          />
        ))}
      </div>
      <div className="flex items-center gap-2">
        <label className="relative w-7 h-7 rounded-md overflow-hidden cursor-pointer border border-white/20">
          <input
            type="color"
            value={color}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div
            className="w-full h-full"
            style={{ backgroundColor: color }}
          />
        </label>
        <input
          type="text"
          value={color}
          onChange={(e) => {
            const v = e.target.value
            if (/^#[0-9a-fA-F]{0,6}$/.test(v)) {
              onChange(v)
            }
          }}
          className="flex-1 bg-white/10 rounded-md px-2 py-1 text-xs text-zinc-200 outline-none border border-white/10 focus:border-white/30"
        />
      </div>
    </div>
  )
}

export default function ColorPicker() {
  const fillColor = useShapeStore((s) => s.fillColor)
  const strokeColor = useShapeStore((s) => s.strokeColor)
  const setFillColor = useShapeStore((s) => s.setFillColor)
  const setStrokeColor = useShapeStore((s) => s.setStrokeColor)

  return (
    <div className="flex flex-col gap-3">
      <ColorSection
        title="填充颜色"
        color={fillColor}
        onChange={setFillColor}
      />
      <ColorSection
        title="边框颜色"
        color={strokeColor}
        onChange={setStrokeColor}
      />
    </div>
  )
}
