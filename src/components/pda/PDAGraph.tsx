import { PDAConfig, PDAState, PDATransition, EPSILON } from '@/lib/pda-types';
import { motion } from 'framer-motion';
import { useCallback, useRef, useState } from 'react';

interface PDAGraphProps {
  config: PDAConfig;
  currentStateId?: string;
  activeTransitionId?: string;
  onUpdateState?: (state: PDAState) => void;
}

export function PDAGraph({ config, currentStateId, activeTransitionId, onUpdateState }: PDAGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragging, setDragging] = useState<string | null>(null);

  const handleMouseDown = useCallback((stateId: string) => {
    if (onUpdateState) setDragging(stateId);
  }, [onUpdateState]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging || !svgRef.current || !onUpdateState) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const state = config.states.find(s => s.id === dragging);
    if (state) onUpdateState({ ...state, x, y });
  }, [dragging, config.states, onUpdateState]);

  const handleMouseUp = useCallback(() => setDragging(null), []);

  const getTransitionPath = (t: PDATransition): { path: string; labelPos: { x: number; y: number }; angle: number } => {
    const from = config.states.find(s => s.id === t.fromState);
    const to = config.states.find(s => s.id === t.toState);
    if (!from || !to) return { path: '', labelPos: { x: 0, y: 0 }, angle: 0 };

    if (from.id === to.id) {
      // Self-loop
      const r = 30;
      return {
        path: `M ${from.x - 15} ${from.y - 28} C ${from.x - 40} ${from.y - 80} ${from.x + 40} ${from.y - 80} ${from.x + 15} ${from.y - 28}`,
        labelPos: { x: from.x, y: from.y - 75 },
        angle: 0,
      };
    }

    // Check for parallel transitions (opposite direction)
    const hasReverse = config.transitions.some(
      other => other.id !== t.id && other.fromState === t.toState && other.toState === t.fromState
    );

    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);

    if (hasReverse) {
      // Curved path
      const offset = 30;
      const mx = (from.x + to.x) / 2 - (dy / len) * offset;
      const my = (from.y + to.y) / 2 + (dx / len) * offset;
      return {
        path: `M ${from.x} ${from.y} Q ${mx} ${my} ${to.x} ${to.y}`,
        labelPos: { x: mx, y: my - 10 },
        angle: angle * (180 / Math.PI),
      };
    }

    return {
      path: `M ${from.x} ${from.y} L ${to.x} ${to.y}`,
      labelPos: { x: (from.x + to.x) / 2 - (dy / len) * 15, y: (from.y + to.y) / 2 + (dx / len) * 15 - 8 },
      angle: angle * (180 / Math.PI),
    };
  };

  const formatTransitionLabel = (t: PDATransition) => {
    return `${t.inputSymbol}, ${t.stackTop} → ${t.stackPush}`;
  };

  return (
    <svg
      ref={svgRef}
      className="w-full h-full bg-card rounded-lg"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <defs>
        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="32" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" className="fill-transition-line" />
        </marker>
        <marker id="arrowhead-active" markerWidth="10" markerHeight="7" refX="32" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" className="fill-state-current" />
        </marker>
        <marker id="arrowhead-self" markerWidth="10" markerHeight="7" refX="22" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" className="fill-transition-line" />
        </marker>
        <marker id="arrowhead-self-active" markerWidth="10" markerHeight="7" refX="22" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" className="fill-state-current" />
        </marker>
      </defs>

      {/* Start arrow */}
      {config.states.filter(s => s.isStart).map(s => (
        <g key={`start-${s.id}`}>
          <line x1={s.x - 60} y1={s.y} x2={s.x - 32} y2={s.y} stroke="hsl(var(--foreground))" strokeWidth="2" markerEnd="url(#arrowhead)" />
        </g>
      ))}

      {/* Transitions */}
      {config.transitions.map(t => {
        const { path, labelPos } = getTransitionPath(t);
        const isActive = activeTransitionId === t.id;
        const isSelf = t.fromState === t.toState;
        return (
          <g key={t.id}>
            <path
              d={path}
              fill="none"
              stroke={isActive ? 'hsl(var(--state-current))' : 'hsl(var(--transition-line))'}
              strokeWidth={isActive ? 3 : 2}
              markerEnd={`url(#${isSelf ? 'arrowhead-self' : 'arrowhead'}${isActive ? '-active' : ''})`}
              className="transition-all duration-300"
            />
            <rect
              x={labelPos.x - 45}
              y={labelPos.y - 10}
              width={90}
              height={20}
              rx={4}
              fill="hsl(var(--card))"
              fillOpacity={0.9}
            />
            <text
              x={labelPos.x}
              y={labelPos.y + 4}
              textAnchor="middle"
              className="fill-foreground text-[11px]"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              {formatTransitionLabel(t)}
            </text>
          </g>
        );
      })}

      {/* States */}
      {config.states.map(state => {
        const isCurrent = currentStateId === state.id;
        return (
          <g key={state.id} onMouseDown={() => handleMouseDown(state.id)} className="cursor-grab active:cursor-grabbing">
            {/* Glow for current state */}
            {isCurrent && (
              <motion.circle
                cx={state.x}
                cy={state.y}
                r={35}
                fill="none"
                stroke="hsl(var(--state-current))"
                strokeWidth={2}
                initial={{ r: 30, opacity: 0 }}
                animate={{ r: 38, opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}
            {/* Accepting state double circle */}
            {state.isAccepting && (
              <circle
                cx={state.x}
                cy={state.y}
                r={32}
                fill="none"
                stroke={isCurrent ? 'hsl(var(--state-current))' : 'hsl(var(--state-accepting))'}
                strokeWidth={2}
              />
            )}
            <circle
              cx={state.x}
              cy={state.y}
              r={26}
              fill={isCurrent ? 'hsl(var(--state-current) / 0.2)' : 'hsl(var(--secondary))'}
              stroke={
                isCurrent
                  ? 'hsl(var(--state-current))'
                  : state.isAccepting
                  ? 'hsl(var(--state-accepting))'
                  : 'hsl(var(--primary))'
              }
              strokeWidth={2}
              className="transition-all duration-300"
            />
            <text
              x={state.x}
              y={state.y + 5}
              textAnchor="middle"
              className="fill-foreground text-sm font-mono font-semibold select-none pointer-events-none"
            >
              {state.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
