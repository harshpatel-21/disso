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
    // Render self-loop as an arc above the node
    const loopSize = 30
    const path = `M ${sourceX} ${sourceY - 32} C ${sourceX - loopSize} ${sourceY - 70}, ${sourceX + loopSize} ${sourceY - 70}, ${sourceX} ${sourceY - 32}`

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
              transform: `translate(-50%, -50%) translate(${sourceX}px, ${sourceY - 75}px)`,
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
