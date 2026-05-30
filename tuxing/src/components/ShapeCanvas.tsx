import React, { useState, useCallback, useRef } from 'react'
import useShapeStore, { Shape, ShapeType } from '@/store/useShapeStore'
import { Download, Plus } from 'lucide-react'

type DragMode = 'move' | 'resize' | 'rotate' | null

function getPolygonPoints(type: ShapeType, cx: number, cy: number, size: number): string {
  switch (type) {
    case 'circle':
      return ''
    case 'square': {
      const half = size / 2
      return `${cx - half},${cy - half} ${cx + half},${cy - half} ${cx + half},${cy + half} ${cx - half},${cy + half}`
    }
    case 'rectangle': {
      const hw = (size * 1.5) / 2
      const hh = size / 2
      return `${cx - hw},${cy - hh} ${cx + hw},${cy - hh} ${cx + hw},${cy + hh} ${cx - hw},${cy + hh}`
    }
    case 'triangle': {
      const h = size
      const half = size / 2
      return `${cx},${cy - h * 0.6} ${cx - half},${cy + h * 0.4} ${cx + half},${cy + h * 0.4}`
    }
    case 'pentagon': {
      const points: string[] = []
      for (let i = 0; i < 5; i++) {
        const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2
        points.push(`${cx + (size / 2) * Math.cos(angle)},${cy + (size / 2) * Math.sin(angle)}`)
      }
      return points.join(' ')
    }
    case 'hexagon': {
      const points: string[] = []
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI * 2 * i) / 6 - Math.PI / 2
        points.push(`${cx + (size / 2) * Math.cos(angle)},${cy + (size / 2) * Math.sin(angle)}`)
      }
      return points.join(' ')
    }
    case 'star': {
      const outerR = size / 2
      const innerR = outerR * 0.4
      const points: string[] = []
      for (let i = 0; i < 10; i++) {
        const angle = (Math.PI * 2 * i) / 10 - Math.PI / 2
        const r = i % 2 === 0 ? outerR : innerR
        points.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`)
      }
      return points.join(' ')
    }
    case 'diamond': {
      const hw = size / 2
      const hh = size * 0.65
      return `${cx},${cy - hh} ${cx + hw},${cy} ${cx},${cy + hh} ${cx - hw},${cy}`
    }
    default:
      return ''
  }
}

function getBoundingBox(shape: Shape): { x: number; y: number; width: number; height: number } {
  const size = shape.size
  const multiplier = shape.type === 'rectangle' ? 1.5 : 1
  const width = size * multiplier
  const height = shape.type === 'diamond' ? size * 1.3 : shape.type === 'triangle' ? size : size
  return {
    x: shape.x - width / 2,
    y: shape.y - height / 2,
    width,
    height,
  }
}

const RESIZE_HANDLES = [
  { id: 'nw', cursor: 'nwse-resize', x: 0, y: 0, scaleX: -1, scaleY: -1 },
  { id: 'ne', cursor: 'nesw-resize', x: 1, y: 0, scaleX: 1, scaleY: -1 },
  { id: 'sw', cursor: 'nesw-resize', x: 0, y: 1, scaleX: -1, scaleY: 1 },
  { id: 'se', cursor: 'nwse-resize', x: 1, y: 1, scaleX: 1, scaleY: 1 },
  { id: 'n', cursor: 'ns-resize', x: 0.5, y: 0, scaleX: 0, scaleY: -1 },
  { id: 's', cursor: 'ns-resize', x: 0.5, y: 1, scaleX: 0, scaleY: 1 },
  { id: 'w', cursor: 'ew-resize', x: 0, y: 0.5, scaleX: -1, scaleY: 0 },
  { id: 'e', cursor: 'ew-resize', x: 1, y: 0.5, scaleX: 1, scaleY: 0 },
] as const

export default function ShapeCanvas() {
  const { shapes, selectedShapeId, addShape, selectShape, updateShape } = useShapeStore()
  const svgRef = useRef<SVGSVGElement>(null)

  const [dragState, setDragState] = useState<{
    mode: DragMode
    dragStartX: number
    dragStartY: number
    shapeStartX: number
    shapeStartY: number
    shapeStartSize: number
    shapeStartRotation: number
    dragShapeId: string | null
    resizeHandle: string | null
  }>({
    mode: null,
    dragStartX: 0,
    dragStartY: 0,
    shapeStartX: 0,
    shapeStartY: 0,
    shapeStartSize: 0,
    shapeStartRotation: 0,
    dragShapeId: null,
    resizeHandle: null,
  })

  const getSVGPoint = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current
    if (!svg) return { x: clientX, y: clientY }
    const pt = svg.createSVGPoint()
    pt.x = clientX
    pt.y = clientY
    const svgP = pt.matrixTransform(svg.getScreenCTM()?.inverse())
    return { x: svgP.x, y: svgP.y }
  }, [])

  const handleShapeMouseDown = useCallback((e: React.MouseEvent, shape: Shape) => {
    e.stopPropagation()
    const pt = getSVGPoint(e.clientX, e.clientY)
    selectShape(shape.id)
    setDragState({
      mode: 'move',
      dragStartX: pt.x,
      dragStartY: pt.y,
      shapeStartX: shape.x,
      shapeStartY: shape.y,
      shapeStartSize: shape.size,
      shapeStartRotation: shape.rotation,
      dragShapeId: shape.id,
      resizeHandle: null,
    })
  }, [selectShape, getSVGPoint])

  const handleResizeMouseDown = useCallback((e: React.MouseEvent, shape: Shape, handleId: string) => {
    e.stopPropagation()
    const pt = getSVGPoint(e.clientX, e.clientY)
    setDragState({
      mode: 'resize',
      dragStartX: pt.x,
      dragStartY: pt.y,
      shapeStartX: shape.x,
      shapeStartY: shape.y,
      shapeStartSize: shape.size,
      shapeStartRotation: shape.rotation,
      dragShapeId: shape.id,
      resizeHandle: handleId,
    })
  }, [getSVGPoint])

  const handleRotateMouseDown = useCallback((e: React.MouseEvent, shape: Shape) => {
    e.stopPropagation()
    setDragState({
      mode: 'rotate',
      dragStartX: e.clientX,
      dragStartY: e.clientY,
      shapeStartX: shape.x,
      shapeStartY: shape.y,
      shapeStartSize: shape.size,
      shapeStartRotation: shape.rotation,
      dragShapeId: shape.id,
      resizeHandle: null,
    })
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!dragState.mode || !dragState.dragShapeId) return

    const shape = shapes.find(s => s.id === dragState.dragShapeId)
    if (!shape) return

    if (dragState.mode === 'move') {
      const pt = getSVGPoint(e.clientX, e.clientY)
      const dx = pt.x - dragState.dragStartX
      const dy = pt.y - dragState.dragStartY
      updateShape(dragState.dragShapeId, {
        x: dragState.shapeStartX + dx,
        y: dragState.shapeStartY + dy,
      })
    } else if (dragState.mode === 'resize') {
      const pt = getSVGPoint(e.clientX, e.clientY)
      const handle = RESIZE_HANDLES.find(h => h.id === dragState.resizeHandle)
      if (!handle) return

      const dx = pt.x - dragState.dragStartX
      const dy = pt.y - dragState.dragStartY

      const rad = (dragState.shapeStartRotation * Math.PI) / 180
      const cos = Math.cos(rad)
      const sin = Math.sin(rad)

      const localDx = dx * cos + dy * sin
      const localDy = -dx * sin + dy * cos

      let scale = 1
      if (handle.scaleX !== 0) scale = 1 + (localDx * handle.scaleX) / (dragState.shapeStartSize / 2)
      if (handle.scaleY !== 0) scale = 1 + (localDy * handle.scaleY) / (dragState.shapeStartSize / 2)

      const newSize = Math.max(40, Math.min(400, dragState.shapeStartSize * scale))
      const sizeRatio = newSize / dragState.shapeStartSize

      let newX = dragState.shapeStartX
      let newY = dragState.shapeStartY
      if (handle.scaleX !== 0 || handle.scaleY !== 0) {
        const offsetX = (dragState.shapeStartX - dragState.shapeStartX) * (1 - sizeRatio)
        const offsetY = (dragState.shapeStartY - dragState.shapeStartY) * (1 - sizeRatio)
        newX = dragState.shapeStartX + offsetX * handle.scaleX
        newY = dragState.shapeStartY + offsetY * handle.scaleY
      }

      updateShape(dragState.dragShapeId, {
        size: newSize,
        x: newX,
        y: newY,
      })
    } else if (dragState.mode === 'rotate') {
      const centerX = dragState.shapeStartX
      const centerY = dragState.shapeStartY
      const svg = svgRef.current
      if (!svg) return

      const rect = svg.getBoundingClientRect()
      const scaleX = svg.clientWidth / rect.width
      const scaleY = svg.clientHeight / rect.height

      const mouseX = (e.clientX - rect.left) * scaleX
      const mouseY = (e.clientY - rect.top) * scaleY

      const angle = Math.atan2(mouseY - centerY, mouseX - centerX) * (180 / Math.PI) + 90
      updateShape(dragState.dragShapeId, {
        rotation: angle,
      })
    }
  }, [dragState, shapes, updateShape, getSVGPoint])

  const handleMouseUp = useCallback(() => {
    setDragState(prev => ({ ...prev, mode: null, dragShapeId: null, resizeHandle: null }))
  }, [])

  const handleCanvasClick = useCallback(() => {
    if (!dragState.mode) {
      selectShape(null)
    }
  }, [dragState.mode, selectShape])

  const handleExportPNG = useCallback(() => {
    const svgEl = svgRef.current
    if (!svgEl) return
    const serializer = new XMLSerializer()
    const svgString = serializer.serializeToString(svgEl)
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(svgBlob)
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = svgEl.clientWidth * 2
      canvas.height = svgEl.clientHeight * 2
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.scale(2, 2)
      ctx.drawImage(img, 0, 0)
      URL.revokeObjectURL(url)
      const pngUrl = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.href = pngUrl
      link.download = 'shape-canvas.png'
      link.click()
    }
    img.src = url
  }, [])

  const renderShape = (shape: Shape) => {
    const isSelected = shape.id === selectedShapeId
    const commonProps = {
      fill: shape.fillColor,
      stroke: shape.strokeColor,
      strokeWidth: shape.strokeWidth,
      opacity: shape.opacity,
      transform: `rotate(${shape.rotation} ${shape.x} ${shape.y})`,
    }

    const shapeElement = shape.type === 'circle' ? (
      <circle
        cx={shape.x}
        cy={shape.y}
        r={shape.size / 2}
        {...commonProps}
      />
    ) : (
      <polygon
        points={getPolygonPoints(shape.type, shape.x, shape.y, shape.size)}
        {...commonProps}
      />
    )

    return (
      <g
        key={shape.id}
        onMouseDown={(e) => handleShapeMouseDown(e, shape)}
        onClick={(e) => {
          e.stopPropagation()
          selectShape(shape.id)
        }}
        style={{ cursor: dragState.mode === 'move' && dragState.dragShapeId === shape.id ? 'grabbing' : 'grab' }}
      >
        {shapeElement}

        {isSelected && (
          <g transform={`rotate(${shape.rotation} ${shape.x} ${shape.y})`}>
            <rect
              x={shape.x - shape.size / 2 - 8}
              y={shape.y - shape.size / 2 - 8}
              width={shape.size + 16}
              height={shape.size + 16}
              fill="none"
              stroke="#00ff88"
              strokeWidth={1}
              strokeDasharray="5,5"
            />

            {RESIZE_HANDLES.map((handle) => (
              <rect
                key={handle.id}
                x={shape.x - shape.size / 2 - 6 + handle.x * (shape.size + 12)}
                y={shape.y - shape.size / 2 - 6 + handle.y * (shape.size + 12)}
                width={12}
                height={12}
                fill="#0f0f1a"
                stroke="#00ff88"
                strokeWidth={1.5}
                rx={2}
                style={{ cursor: handle.cursor }}
                onMouseDown={(e) => handleResizeMouseDown(e, shape, handle.id)}
                onClick={(e) => e.stopPropagation()}
              />
            ))}

            <line
              x1={shape.x}
              y1={shape.y - shape.size / 2 - 8}
              x2={shape.x}
              y2={shape.y - shape.size / 2 - 30}
              stroke="#00ff88"
              strokeWidth={1}
              strokeDasharray="3,3"
            />
            <circle
              cx={shape.x}
              cy={shape.y - shape.size / 2 - 30}
              r={10}
              fill="#0f0f1a"
              stroke="#00ff88"
              strokeWidth={1.5}
              style={{ cursor: 'grab' }}
              onMouseDown={(e) => handleRotateMouseDown(e, shape)}
              onClick={(e) => e.stopPropagation()}
            />
            <text
              x={shape.x}
              y={shape.y - shape.size / 2 - 26}
              textAnchor="middle"
              fill="#00ff88"
              fontSize={10}
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              ↻
            </text>
          </g>
        )}
      </g>
    )
  }

  return (
    <div className="flex-1 relative overflow-hidden rounded-2xl border border-white/10">
      <div className="absolute top-4 right-4 flex gap-3 z-10">
        <button
          className="h-9 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-sm flex items-center gap-2 backdrop-blur-sm transition-colors"
          onClick={addShape}
        >
          <Plus size={16} />
          添加图形
        </button>
        <button
          className="h-9 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-sm flex items-center gap-2 backdrop-blur-sm transition-colors"
          onClick={handleExportPNG}
        >
          <Download size={16} />
          导出PNG
        </button>
      </div>

      <svg
        ref={svgRef}
        className="w-full h-full"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleCanvasClick}
      >
        <defs>
          <pattern
            id="grid-pattern"
            x="0"
            y="0"
            width="20"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="10" cy="10" r="1" fill="#1a1a2e" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="#0f0f1a" />
        <rect width="100%" height="100%" fill="url(#grid-pattern)" />
        {shapes.map(renderShape)}
      </svg>
    </div>
  )
}
