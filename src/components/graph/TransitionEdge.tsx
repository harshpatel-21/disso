import { memo } from 'react'
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type EdgeProps,
} from '@xyflow/react'

export interface TransitionEdgeData {
  symbol: string
  isSelfLoop?: boolean
  isHighlighted?: boolean
  highlightColor?: string
  isBeingRemoved?: boolean
}

type TransitionEdgeProps = EdgeProps & { data?: TransitionEdgeData }

function TransitionEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  source,
  target,
}: TransitionEdgeProps) {
  const symbol = data?.symbol ?? ''
  const isHighlighted = data?.isHighlighted ?? false
  const highlightColor = data?.highlightColor ?? '#3b82f6'
  const isBeingRemoved = data?.isBeingRemoved ?? false
  const isSelfLoop = source === target

  if (isSelfLoop) {
    // For self-loops: sourceX/Y is right handle, targetX/Y is left handle
    // Calculate the actual center of the node from handle positions
    const centerX = (sourceX + targetX) / 2
    const centerY = sourceY // Both handles are at same Y level
    
    const nodeRadius = 32
    const loopHeight = 40
    const loopWidth = 30
    
    // Top of the node circle
    const topOfNode = centerY - nodeRadius
    
    // Start and end points at the top curve of the node
    const startX = centerX - 12
    const endX = centerX + 12
    
    // SVG cubic bezier: smooth loop arc above the node
    const path = `
      M ${startX} ${topOfNode}
      C ${startX - loopWidth} ${topOfNode - loopHeight},
        ${endX + loopWidth} ${topOfNode - loopHeight},
        ${endX} ${topOfNode}
    `

    return (
      <>
        <path
          id={id}
          d={path}
          fill="none"
          stroke={isBeingRemoved ? '#ef4444' : isHighlighted ? highlightColor : '#94a3b8'}
          strokeWidth={isHighlighted ? 2.5 : 1.5}
          strokeDasharray={isBeingRemoved ? '5,5' : undefined}
          markerEnd="url(#arrowhead)"
        />
        <EdgeLabelRenderer>
          <div
            className="absolute pointer-events-all nodrag nopan"
            style={{
              transform: `translate(-50%, -50%) translate(${centerX}px, ${topOfNode - loopHeight - 8}px)`,
            }}
          >
            <span
              className={`rounded px-1.5 py-0.5 text-xs font-mono ${
                isHighlighted
                  ? 'bg-yellow-100 font-semibold'
                  : 'bg-white/90'
              }`}
              style={{ border: '1px solid #e2e8f0' }}
            >
              {symbol}
            </span>
          </div>
        </EdgeLabelRenderer>
      </>
    )
  }

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: isBeingRemoved
            ? '#ef4444'
            : isHighlighted
              ? highlightColor
              : '#94a3b8',
          strokeWidth: isHighlighted ? 2.5 : 1.5,
          strokeDasharray: isBeingRemoved ? '5,5' : undefined,
        }}
        markerEnd="url(#arrowhead)"
      />
      <EdgeLabelRenderer>
        <div
          className="absolute pointer-events-all nodrag nopan"
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
          }}
        >
          <span
            className={`rounded px-1.5 py-0.5 text-xs font-mono ${
              isHighlighted
                ? 'bg-yellow-100 font-semibold'
                : 'bg-white/90'
            }`}
            style={{ border: '1px solid #e2e8f0' }}
          >
            {symbol}
          </span>
        </div>
      </EdgeLabelRenderer>
    </>
  )
}

export const TransitionEdge = memo(TransitionEdgeComponent)
