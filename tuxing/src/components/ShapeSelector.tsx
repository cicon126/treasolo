import useShapeStore, { ShapeType } from '@/store/useShapeStore'

const SHAPE_TYPES: { type: ShapeType; label: string }[] = [
  { type: 'circle', label: '圆形' },
  { type: 'square', label: '正方形' },
  { type: 'rectangle', label: '矩形' },
  { type: 'triangle', label: '三角形' },
  { type: 'pentagon', label: '五边形' },
  { type: 'hexagon', label: '六边形' },
  { type: 'star', label: '星形' },
  { type: 'diamond', label: '菱形' },
]

function ShapePreview({ type }: { type: ShapeType }) {
  const fill = '#00ff88'
  const stroke = '#0f0f1a'

  switch (type) {
    case 'circle':
      return (
        <svg width={40} height={40} viewBox="0 0 40 40">
          <circle cx={20} cy={20} r={16} fill={fill} stroke={stroke} strokeWidth={1.5} />
        </svg>
      )
    case 'square':
      return (
        <svg width={40} height={40} viewBox="0 0 40 40">
          <rect x={4} y={4} width={32} height={32} fill={fill} stroke={stroke} strokeWidth={1.5} />
        </svg>
      )
    case 'rectangle':
      return (
        <svg width={40} height={40} viewBox="0 0 40 40">
          <rect x={2} y={8} width={36} height={24} fill={fill} stroke={stroke} strokeWidth={1.5} />
        </svg>
      )
    case 'triangle':
      return (
        <svg width={40} height={40} viewBox="0 0 40 40">
          <polygon points="20,4 4,36 36,36" fill={fill} stroke={stroke} strokeWidth={1.5} />
        </svg>
      )
    case 'pentagon':
      return (
        <svg width={40} height={40} viewBox="0 0 40 40">
          <polygon points="20,4 35.2,15.1 29.4,33 10.6,33 4.8,15.1" fill={fill} stroke={stroke} strokeWidth={1.5} />
        </svg>
      )
    case 'hexagon':
      return (
        <svg width={40} height={40} viewBox="0 0 40 40">
          <polygon points="20,4 33.9,12 33.9,28 20,36 6.1,28 6.1,12" fill={fill} stroke={stroke} strokeWidth={1.5} />
        </svg>
      )
    case 'star':
      return (
        <svg width={40} height={40} viewBox="0 0 40 40">
          <polygon
            points="20,4 24.1,14.3 35.2,15.1 26.7,22.2 29.4,33 20,27 10.6,33 13.3,22.2 4.8,15.1 15.9,14.3"
            fill={fill}
            stroke={stroke}
            strokeWidth={1.5}
          />
        </svg>
      )
    case 'diamond':
      return (
        <svg width={40} height={40} viewBox="0 0 40 40">
          <polygon points="20,4 36,20 20,36 4,20" fill={fill} stroke={stroke} strokeWidth={1.5} />
        </svg>
      )
  }
}

export default function ShapeSelector() {
  const currentType = useShapeStore((s) => s.currentType)
  const setCurrentType = useShapeStore((s) => s.setCurrentType)

  return (
    <div className="grid grid-cols-4 gap-2">
      {SHAPE_TYPES.map(({ type, label }) => {
        const isSelected = currentType === type
        return (
          <button
            key={type}
            onClick={() => setCurrentType(type)}
            className={`flex flex-col items-center justify-center gap-1 rounded-xl bg-white/5 p-2 transition-colors hover:bg-white/10 ${
              isSelected ? 'ring-2 ring-[#00ff88]' : ''
            }`}
            style={
              isSelected
                ? { boxShadow: '0 0 12px 2px #00ff88, 0 0 24px 4px rgba(0,255,136,0.3)' }
                : undefined
            }
          >
            <ShapePreview type={type} />
            <span className="text-xs text-white/70">{label}</span>
          </button>
        )
      })}
    </div>
  )
}
