import { create } from 'zustand';
import type { MindMapNode, Connection, CanvasState } from '@/types';
import {
  DEFAULT_NODE_COLOR,
  DEFAULT_CONNECTION_COLOR,
} from '@/types';
import { generateId } from '@/utils/coordinates';

interface MindMapStore {
  nodes: MindMapNode[];
  connections: Connection[];
  canvas: CanvasState;
  addNode: (node: Omit<MindMapNode, 'id'>) => string;
  updateNode: (id: string, updates: Partial<MindMapNode>) => void;
  deleteNode: (id: string) => void;
  addConnection: (connection: Omit<Connection, 'id'>) => string;
  updateConnection: (id: string, updates: Partial<Connection>) => void;
  deleteConnection: (id: string) => void;
  setSelectedNode: (id: string | null) => void;
  setSelectedConnection: (id: string | null) => void;
  updateCanvas: (updates: Partial<CanvasState>) => void;
  clearAll: () => void;
  getSelectedNode: () => MindMapNode | undefined;
  getSelectedConnection: () => Connection | undefined;
}

export const useMindMapStore = create<MindMapStore>((set, get) => ({
  nodes: [],
  connections: [],
  canvas: {
    offsetX: 0,
    offsetY: 0,
    scale: 1,
    selectedNodeId: null,
    selectedConnectionId: null,
  },

  addNode: (node) => {
    const id = generateId();
    set((state) => ({
      nodes: [
        ...state.nodes,
        {
          ...node,
          id,
          color: node.color || DEFAULT_NODE_COLOR,
        },
      ],
    }));
    return id;
  },

  updateNode: (id, updates) => {
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === id ? { ...node, ...updates } : node
      ),
    }));
  },

  deleteNode: (id) => {
    set((state) => ({
      nodes: state.nodes.filter((node) => node.id !== id),
      connections: state.connections.filter(
        (conn) => conn.fromNodeId !== id && conn.toNodeId !== id
      ),
      canvas: {
        ...state.canvas,
        selectedNodeId: state.canvas.selectedNodeId === id ? null : state.canvas.selectedNodeId,
      },
    }));
  },

  addConnection: (connection) => {
    const id = generateId();
    set((state) => ({
      connections: [
        ...state.connections,
        {
          ...connection,
          id,
          color: connection.color || DEFAULT_CONNECTION_COLOR,
        },
      ],
    }));
    return id;
  },

  updateConnection: (id, updates) => {
    set((state) => ({
      connections: state.connections.map((conn) =>
        conn.id === id ? { ...conn, ...updates } : conn
      ),
    }));
  },

  deleteConnection: (id) => {
    set((state) => ({
      connections: state.connections.filter((conn) => conn.id !== id),
      canvas: {
        ...state.canvas,
        selectedConnectionId: state.canvas.selectedConnectionId === id ? null : state.canvas.selectedConnectionId,
      },
    }));
  },

  setSelectedNode: (id) => {
    set((state) => ({
      canvas: {
        ...state.canvas,
        selectedNodeId: id,
        selectedConnectionId: null,
      },
    }));
  },

  setSelectedConnection: (id) => {
    set((state) => ({
      canvas: {
        ...state.canvas,
        selectedConnectionId: id,
        selectedNodeId: null,
      },
    }));
  },

  updateCanvas: (updates) => {
    set((state) => ({
      canvas: { ...state.canvas, ...updates },
    }));
  },

  clearAll: () => {
    set({
      nodes: [],
      connections: [],
      canvas: {
        offsetX: 0,
        offsetY: 0,
        scale: 1,
        selectedNodeId: null,
        selectedConnectionId: null,
      },
    });
  },

  getSelectedNode: () => {
    const state = get();
    return state.nodes.find((n) => n.id === state.canvas.selectedNodeId);
  },

  getSelectedConnection: () => {
    const state = get();
    return state.connections.find((c) => c.id === state.canvas.selectedConnectionId);
  },
}));
