import { PDAConfig, PDATransition, EPSILON } from '@/lib/pda-types';
import { motion } from 'framer-motion';
import { useMemo } from 'react';

interface PDAGraphProps {
  config: PDAConfig;
  currentStateId?: string;
  activeTransitionId?: string;
}

export function PDAGraph({ config, currentStateId, activeTransitionId }: PDAGraphProps) {
  // Auto-layout states in a nice arrangement if positions are too cramped
  const layoutStates = useMemo(() => {
    if (config.states.length === 0) return [];
    return config.states.map((s, i) => ({
      ...s,
      x: s.x,
      y: s.y,
    }));
  }, [config.states]);

  // Compute viewBox to fit all states with padding
  const viewBox = useMemo(() => {
    if (layoutStates.length === 0) return '0 0 600 400';
    const padding = 100;
    const xs = layoutStates.map(s => s.x);
    const ys = layoutStates.map(s => s.y);
    const minX = Math.min(...xs) - padding;
    const minY = Math.min(...ys) - padding;
    const maxX = Math.max(...xs) + padding;
    const maxY = Math.max(...ys) + padding;
    const w = Math.max(maxX - minX, 300);
    const h = Math.max(maxY - minY, 250);
    return `${minX} ${minY} ${w} ${h}`;
  }, [layoutStates]);

  // Group transitions by (from, to) pair for label stacking
  const transitionGroups = useMemo(() => {
    const groups = new Map<string, PDATransition[]>();
    config.transitions.forEach(t => {
      const key = `${t.fromState}->${t.toState}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(t);
    });
    return groups;
  }, [config.transitions]);

  const getGroupPath = (fromId: string, toId: string): { path: string; labelPos: { x: number; y: number } } => {
    const from = layoutStates.find(s => s.id === fromId);
    const to = layoutStates.find(s => s.id === toId);
    if (!from || !to) return { path: '', labelPos: { x: 0, y: 0 } };

    if (from.id === to.id) {
      return {
        path: `M ${from.x - 15} ${from.y - 28} C ${from.x - 45} ${from.y - 85} ${from.x + 45} ${from.y - 85} ${from.x + 15} ${from.y - 28}`,
        labelPos: { x: from.x, y: from.y - 80 },
      };
    }

    const hasReverse = transitionGroups.has(`${toId}->${fromId}`);

    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;

    const offset = hasReverse ? 25 : 0;
    const mx = (from.x + to.x) / 2 + nx * offset;
    const my = (from.y + to.y) / 2 + ny * offset;

    if (offset !== 0) {
      return {
        path: `M ${from.x} ${from.y} Q ${mx} ${my} ${to.x} ${to.y}`,
        labelPos: { x: mx, y: my },
      };
    }

    return {
      path: `M ${from.x} ${from.y} L ${to.x} ${to.y}`,
      labelPos: { x: (from.x + to.x) / 2 + nx * 15, y: (from.y + to.y) / 2 + ny * 15 },
    };
  };

  const formatTransitionLabel = (t: PDATransition) => {
    const input = t.inputSymbol === EPSILON ? 'ε' : t.inputSymbol;
    const pop = t.stackTop === EPSILON ? 'ε' : t.stackTop;
    const push = t.stackPush === EPSILON ? 'E' : t.stackPush;
    return `${input}, ${pop} / ${push}`;
  };

  return (
    <svg
      className="w-full h-full bg-card rounded-lg"
      viewBox={viewBox}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="32" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="hsl(var(--transition-line))" />
        </marker>
        <marker id="arrowhead-active" markerWidth="10" markerHeight="7" refX="32" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="hsl(var(--state-current))" />
        </marker>
        <marker id="arrowhead-self" markerWidth="10" markerHeight="7" refX="22" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="hsl(var(--transition-line))" />
        </marker>
        <marker id="arrowhead-self-active" markerWidth="10" markerHeight="7" refX="22" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="hsl(var(--state-current))" />
        </marker>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Start arrow */}
      {layoutStates.filter(s => s.isStart).map(s => (
        <g key={`start-${s.id}`}>
          <line
            x1={s.x - 65} y1={s.y} x2={s.x - 32} y2={s.y}
            stroke="hsl(var(--foreground))" strokeWidth="2"
            markerEnd="url(#arrowhead)"
          />
          <text
            x={s.x - 70} y={s.y - 8}
            textAnchor="end"
            fill="hsl(var(--muted-foreground))"
            fontSize="11"
            fontFamily="var(--font-mono)"
          >
            start
          </text>
        </g>
      ))}

      {/* Transitions - grouped by (from, to) pair */}
      {Array.from(transitionGroups.entries()).map(([key, transitions]) => {
        const first = transitions[0];
        const { path, labelPos } = getGroupPath(first.fromState, first.toState);
        if (!path) return null;
        const isSelf = first.fromState === first.toState;
        const isAnyActive = transitions.some(t => activeTransitionId === t.id);
        const lineHeight = 14;
        const totalHeight = transitions.length * lineHeight + 6;
        const labelWidth = 110;

        return (
          <g key={key}>
            <path
              d={path}
              fill="none"
              stroke={isAnyActive ? 'hsl(var(--state-current))' : 'hsl(var(--transition-line))'}
              strokeWidth={isAnyActive ? 3 : 1.5}
              markerEnd={`url(#${isSelf ? 'arrowhead-self' : 'arrowhead'}${isAnyActive ? '-active' : ''})`}
              className="transition-all duration-300"
              filter={isAnyActive ? 'url(#glow)' : undefined}
            />
            {/* Label background - offset away from the line */}
            <rect
              x={labelPos.x - labelWidth / 2}
              y={labelPos.y - totalHeight / 2 - 18}
              width={labelWidth}
              height={totalHeight}
              rx={4}
              fill="hsl(var(--card))"
              fillOpacity={0.95}
              stroke={isAnyActive ? 'hsl(var(--state-current))' : 'hsl(var(--border))'}
              strokeWidth={0.5}
            />
            {transitions.map((t, i) => {
              const isActive = activeTransitionId === t.id;
              const ty = labelPos.y - totalHeight / 2 - 18 + 12 + i * lineHeight;
              return (
                <text
                  key={t.id}
                  x={labelPos.x}
                  y={ty}
                  textAnchor="middle"
                  fill={isActive ? 'hsl(var(--state-current))' : 'hsl(var(--foreground))'}
                  fontSize="10"
                  fontFamily="var(--font-mono)"
                  fontWeight={isActive ? 700 : 400}
                >
                  {formatTransitionLabel(t)}
                </text>
              );
            })}
          </g>
        );
      })}

      {/* States */}
      {layoutStates.map(state => {
        const isCurrent = currentStateId === state.id;
        return (
          <g key={state.id}>
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
                animate={{ r: 40, opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                filter="url(#glow)"
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
              fill={isCurrent ? 'hsl(var(--state-current) / 0.15)' : 'hsl(var(--secondary))'}
              stroke={
                isCurrent
                  ? 'hsl(var(--state-current))'
                  : state.isAccepting
                  ? 'hsl(var(--state-accepting))'
                  : 'hsl(var(--primary))'
              }
              strokeWidth={2.5}
              className="transition-all duration-300"
            />
            <text
              x={state.x}
              y={state.y + 5}
              textAnchor="middle"
              fill="hsl(var(--foreground))"
              fontSize="14"
              fontFamily="var(--font-mono)"
              fontWeight={600}
            >
              {state.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
