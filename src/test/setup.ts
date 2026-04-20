import '@testing-library/jest-dom'
import React from 'react'
import { vi } from 'vitest'

vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
  motion: new Proxy(
    {},
    {
      get: (_target, tag: string) =>
        ({ children, ...props }: React.HTMLAttributes<HTMLElement> & { children?: React.ReactNode }) =>
          React.createElement(tag, props, children),
    }
  ),
}))

vi.mock('@xyflow/react', () => ({
  ReactFlow: ({ children }: { children?: React.ReactNode }) =>
    React.createElement('div', { 'data-testid': 'react-flow' }, children),
  Background: () => null,
  Controls: () => null,
  ReactFlowProvider: ({ children }: { children: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children),
  MarkerType: { ArrowClosed: 'arrowclosed' },
  applyNodeChanges: (_changes: unknown[], nodes: unknown[]) => nodes,
  Handle: ({ type, position, className }: { type: string; position: string; className?: string }) =>
    React.createElement('div', { 'data-testid': `handle-${type}`, 'data-position': position, className }),
  Position: { Left: 'left', Right: 'right', Top: 'top', Bottom: 'bottom' },
  useReactFlow: () => ({
    fitView: vi.fn(),
    getNodes: vi.fn(() => []),
    getEdges: vi.fn(() => []),
    getViewport: vi.fn(() => ({ x: 0, y: 0, zoom: 1 })),
  }),
  getBezierPath: vi.fn(() => ['M0,0 L100,100', 50, 50]),
  EdgeLabelRenderer: ({ children }: { children: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children),
  BaseEdge: () => null,
}))
