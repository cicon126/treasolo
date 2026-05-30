import { create } from 'zustand'

export type ShapeType = 'circle' | 'square' | 'rectangle' | 'triangle' | 'pentagon' | 'hexagon' | 'star' | 'diamond'

export interface Shape {
  id: string
  type: ShapeType
  fillColor: string
  strokeColor: string
  strokeWidth: number
  opacity: number
  rotation: number
  size: number
  x: number
  y: number
}

interface ShapeStore {
  shapes: Shape[]
  selectedShapeId: string | null
  currentType: ShapeType
  fillColor: string
  strokeColor: string
  strokeWidth: number
  opacity: number
  rotation: number
  size: number
  history: Shape[][]

  addShape: () => void
  selectShape: (id: string | null) => void
  updateShape: (id: string, updates: Partial<Shape>) => void
  deleteShape: (id: string) => void
  clearCanvas: () => void
  undo: () => void
  setCurrentType: (type: ShapeType) => void
  setFillColor: (color: string) => void
  setStrokeColor: (color: string) => void
  setStrokeWidth: (width: number) => void
  setOpacity: (opacity: number) => void
  setRotation: (rotation: number) => void
  setSize: (size: number) => void
}

const pushHistory = (shapes: Shape[], history: Shape[][]): Shape[][] => {
  return [...history.slice(-19), JSON.parse(JSON.stringify(shapes))]
}

export const useShapeStore = create<ShapeStore>((set, get) => ({
  shapes: [],
  selectedShapeId: null,
  currentType: 'circle',
  fillColor: '#00ff88',
  strokeColor: '#ffffff',
  strokeWidth: 2,
  opacity: 1,
  rotation: 0,
  size: 120,
  history: [],

  addShape: () => {
    const state = get()
    const newShape: Shape = {
      id: `shape-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type: state.currentType,
      fillColor: state.fillColor,
      strokeColor: state.strokeColor,
      strokeWidth: state.strokeWidth,
      opacity: state.opacity,
      rotation: state.rotation,
      size: state.size,
      x: 400 + Math.random() * 200 - 100,
      y: 300 + Math.random() * 200 - 100,
    }
    const newShapes = [...state.shapes, newShape]
    set({
      shapes: newShapes,
      selectedShapeId: newShape.id,
      history: pushHistory(state.shapes, state.history),
    })
  },

  selectShape: (id) => {
    const state = get()
    if (id) {
      const shape = state.shapes.find(s => s.id === id)
      if (shape) {
        set({
          selectedShapeId: id,
          fillColor: shape.fillColor,
          strokeColor: shape.strokeColor,
          strokeWidth: shape.strokeWidth,
          opacity: shape.opacity,
          rotation: shape.rotation,
          size: shape.size,
          currentType: shape.type,
        })
        return
      }
    }
    set({ selectedShapeId: id })
  },

  updateShape: (id, updates) => {
    const state = get()
    const newShapes = state.shapes.map(s =>
      s.id === id ? { ...s, ...updates } : s
    )
    set({
      shapes: newShapes,
      history: pushHistory(state.shapes, state.history),
    })
  },

  deleteShape: (id) => {
    const state = get()
    set({
      shapes: state.shapes.filter(s => s.id !== id),
      selectedShapeId: state.selectedShapeId === id ? null : state.selectedShapeId,
      history: pushHistory(state.shapes, state.history),
    })
  },

  clearCanvas: () => {
    const state = get()
    set({
      shapes: [],
      selectedShapeId: null,
      history: pushHistory(state.shapes, state.history),
    })
  },

  undo: () => {
    const state = get()
    if (state.history.length === 0) return
    const prev = state.history[state.history.length - 1]
    set({
      shapes: prev,
      history: state.history.slice(0, -1),
      selectedShapeId: null,
    })
  },

  setCurrentType: (type) => set({ currentType: type }),
  setFillColor: (color) => {
    set({ fillColor: color })
    const state = get()
    if (state.selectedShapeId) {
      get().updateShape(state.selectedShapeId, { fillColor: color })
    }
  },
  setStrokeColor: (color) => {
    set({ strokeColor: color })
    const state = get()
    if (state.selectedShapeId) {
      get().updateShape(state.selectedShapeId, { strokeColor: color })
    }
  },
  setStrokeWidth: (width) => {
    set({ strokeWidth: width })
    const state = get()
    if (state.selectedShapeId) {
      get().updateShape(state.selectedShapeId, { strokeWidth: width })
    }
  },
  setOpacity: (opacity) => {
    set({ opacity })
    const state = get()
    if (state.selectedShapeId) {
      get().updateShape(state.selectedShapeId, { opacity })
    }
  },
  setRotation: (rotation) => {
    set({ rotation })
    const state = get()
    if (state.selectedShapeId) {
      get().updateShape(state.selectedShapeId, { rotation })
    }
  },
  setSize: (size) => {
    set({ size })
    const state = get()
    if (state.selectedShapeId) {
      get().updateShape(state.selectedShapeId, { size })
    }
  },
}))

export default useShapeStore
