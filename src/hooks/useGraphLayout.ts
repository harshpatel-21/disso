import { useCallback } from 'react';
import dagre from 'dagre';
import type { NFA } from '../core/types';
import type { Node, Edge } from '@xyflow/react';

export interface LayoutResult {
  nodes: Node[];
  edges: Edge[];
}

export function useGraphLayout() {
  const getLayout = useCallback((nfa: NFA): LayoutResult => {
    const g = new dagre.graphlib.Graph();
    g.setDefaultEdgeLabel(() => ({}));
    g.setGraph({ rankdir: 'LR', nodesep: 80, ranksep: 120, marginx: 40, marginy: 40 });

    // Add nodes
    for (const state of nfa.states) {
      g.setNode(state.id, { width: 80, height: 80 });
    }

    // Add edges
    const edgeMap = new Map<string, string[]>();
    for (const t of nfa.transitions) {
      const key = `${t.source}-${t.target}`;
      if (!edgeMap.has(key)) {
        edgeMap.set(key, []);
        g.setEdge(t.source, t.target);
      }
      edgeMap.get(key)!.push(t.symbol);
    }

    dagre.layout(g);

    const nodes: Node[] = nfa.states.map(state => {
      const nodeWithPos = g.node(state.id);
      return {
        id: state.id,
        type: 'stateNode',
        position: {
          x: (nodeWithPos?.x ?? 0) - 40,
          y: (nodeWithPos?.y ?? 0) - 40,
        },
        data: {
          label: state.label,
          isStart: state.isStart,
          isFinal: state.isFinal,
        },
      };
    });

    const edges: Edge[] = [];
    for (const [key, symbols] of edgeMap) {
      const [source, target] = key.split('-');
      edges.push({
        id: `edge-${key}`,
        source,
        target,
        type: 'transitionEdge',
        label: symbols.join(', '),
        data: { symbols },
      });
    }

    return { nodes, edges };
  }, []);

  return { getLayout };
}
