import { memo } from 'react'
import {
  EdgeLabelRenderer,
  useReactFlow,
  type EdgeProps,
} from '@xyflow/react'
import { useEdgeBendContext } from './EdgeBendContext'

export interface TransitionEdgeData {
  symbol: string
  isSelfLoop?: boolean
  isHighlighted?: boolean
  highlightColor?: string
  isBeingRemoved?: boolean
  bend?: { x: number; y: number }
}

type TransitionEdgeProps = EdgeProps & { data?: TransitionEdgeData }

function TransitionEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  data,
  source,
  target,
}: TransitionEdgeProps) {
  const symbol = data?.symbol ?? ''
  const isHighlighted = data?.isHighlighted ?? false
  const highlightColor = data?.highlightColor ?? '#3b82f6'
  const isBeingRemoved = data?.isBeingRemoved ?? false
  const isSelfLoop = source === target

  const { bends, setEdgeBend } = useEdgeBendContext()
  const { getViewport } = useReactFlow()
  const bend = bends[id] ?? { x: 0, y: 0 }

  const stroke = isBeingRemoved ? '#ef4444' : isHighlighted ? highlightColor : '#94a3b8'
  const strokeWidth = isHighlighted ? 2.5 : 1.5
  const strokeDasharray = isBeingRemoved ? '5,5' : undefined

  if (isSelfLoop) {
    const centerX = (sourceX + targetX) / 2
    const centerY = sourceY

    const nodeRadius = 32
    const loopHeight = 40
    const loopWidth = 30

    const topOfNode = centerY - nodeRadius
    const startX = centerX - 12
    const endX = centerX + 12

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
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          markerEnd="url(#arrowhead)"
        />
        <EdgeLabelRenderer>
          <div
            className="absolute pointer-events-none nodrag nopan"
            style={{
              transform: `translate(-50%, -50%) translate(${centerX}px, ${topOfNode - loopHeight - 8}px)`,
            }}
          >
            <span
              className={`rounded px-1.5 py-0.5 text-xs font-mono ${
                isHighlighted ? 'bg-yellow-100 font-semibold' : 'bg-white/90'
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

  // Quadratic bezier: control point is offset so the curve passes through
  // (naturalMid + bend) at t=0.5. Formula: ctrl = naturalMid + 2*bend
  const naturalMidX = (sourceX + targetX) / 2
  const naturalMidY = (sourceY + targetY) / 2
  const ctrlX = naturalMidX + 2 * bend.x
  const ctrlY = naturalMidY + 2 * bend.y
  const handleX = naturalMidX + bend.x
  const handleY = naturalMidY + bend.y

  const edgePath = `M ${sourceX} ${sourceY} Q ${ctrlX} ${ctrlY} ${targetX} ${targetY}`

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation()
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!(e.buttons & 1)) return
    const { zoom } = getViewport()
    setEdgeBend(id, bend.x + e.movementX / zoom, bend.y + e.movementY / zoom)
  }

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.releasePointerCapture(e.pointerId)
  }

  return (
    <>
      <path
        id={id}
        d={edgePath}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeDasharray={strokeDasharray}
        markerEnd="url(#arrowhead)"
      />
      <EdgeLabelRenderer>
        {/* Label */}
        <div
          className="absolute pointer-events-none nodrag nopan"
          style={{
            transform: `translate(-50%, -50%) translate(${handleX}px, ${handleY}px)`,
          }}
        >
          <span
            className={`rounded px-1.5 py-0.5 text-xs font-mono ${
              isHighlighted ? 'bg-yellow-100 font-semibold' : 'bg-white/90'
            }`}
            style={{ border: '1px solid #e2e8f0' }}
          >
            {symbol}
          </span>
        </div>
        {/* Drag handle */}
        <div
          className="absolute nodrag nopan"
          style={{
            transform: `translate(-50%, -50%) translate(${handleX}px, ${handleY}px)`,
            width: 18,
            height: 18,
            borderRadius: '0%',
            background: 'white',
            border: '0px solid #94a3b8',
            opacity: 0.4,
            cursor: 'grab',
            pointerEvents: 'all',
            zIndex: 10,
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.opacity = '.1' }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.opacity = '0.1' }}
        />
      </EdgeLabelRenderer>
    </>
  )
}

export const TransitionEdge = memo(TransitionEdgeComponent)
