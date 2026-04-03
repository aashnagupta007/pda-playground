import { PDAConfig, PDATransition, EPSILON } from '@/lib/pda-types';
import { motion } from 'framer-motion';
import { useMemo } from 'react';

interface PDAGraphProps {
  config: PDAConfig;
  currentStateId?: string;
  activeTransitionId?: string;
}

const STATE_RADIUS = 26;

export function PDAGraph({ config, currentStateId, activeTransitionId }: PDAGraphProps) {
  const layoutStates = useMemo(() => {
    if (config.states.length === 0) return [];
    return config.states.map(s => ({ ...s }));
  }, [config.states]);

  const viewBox = useMemo(() => {
    if (layoutStates.length === 0) return '0 0 600 400';
    const padding = 120;
    const xs = layoutStates.map(s => s.x);
    const ys = layoutStates.map(s => s.y);
    const minX = Math.min(...xs) - padding;
    const minY = Math.min(...ys) - padding - 40; // extra top for self-loops
    const maxX = Math.max(...xs) + padding;
    const maxY = Math.max(...ys) + padding;
    const w = Math.max(maxX - minX, 300);
    const h = Math.max(maxY - minY, 280);
    return `${minX} ${minY} ${w} ${h}`;
  }, [layoutStates]);

  // Group transitions by (from, to) pair
  const transitionGroups = useMemo(() => {
    const groups = new Map<string, PDATransition[]>();
    config.transitions.forEach(t => {
      const key = `${t.fromState}->${t.toState}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(t);
    });
    return groups;
  }, [config.transitions]);

  // Compute edge path that starts and ends at circle boundary, not center
  const getGroupPath = (fromId: string, toId: string): { path: string; labelPos: { x: number; y: number }; isSelf: boolean } => {
    const from = layoutStates.find(s => s.id === fromId);
    const to = layoutStates.find(s => s.id === toId);
    if (!from || !to) return { path: '', labelPos: { x: 0, y: 0 }, isSelf: false };

    const R = STATE_RADIUS;

    // Self-loop
    if (from.id === to.id) {
      const loopW = 40;
      const loopH = 70;
      // Start and end points on the top of the circle
      const startAngle = -Math.PI / 2 - 0.4;
      const endAngle = -Math.PI / 2 + 0.4;
      const sx = from.x + R * Math.cos(startAngle);
      const sy = from.y + R * Math.sin(startAngle);
      const ex = from.x + R * Math.cos(endAngle);
      const ey = from.y + R * Math.sin(endAngle);
      const cp1x = from.x - loopW;
      const cp1y = from.y - loopH - R;
      const cp2x = from.x + loopW;
      const cp2y = from.y - loopH - R;
      return {
        path: `M ${sx} ${sy} C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${ex} ${ey}`,
        labelPos: { x: from.x, y: from.y - loopH - R + 10 },
        isSelf: true,
      };
    }

    const hasReverse = transitionGroups.has(`${toId}->${fromId}`);

    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const ux = dx / len; // unit vector along edge
    const uy = dy / len;
    const nx = -uy; // normal vector
    const ny = ux;

    const curveOffset = hasReverse ? 30 : 0;

    // Start point: on circle boundary of `from`
    const sx = from.x + ux * R + nx * (curveOffset * 0.3);
    const sy = from.y + uy * R + ny * (curveOffset * 0.3);
    // End point: on circle boundary of `to`
    const ex = to.x - ux * R + nx * (curveOffset * 0.3);
    const ey = to.y - uy * R + ny * (curveOffset * 0.3);

    if (curveOffset !== 0) {
      const mx = (from.x + to.x) / 2 + nx * curveOffset;
      const my = (from.y + to.y) / 2 + ny * curveOffset;
      return {
        path: `M ${sx} ${sy} Q ${mx} ${my} ${ex} ${ey}`,
        labelPos: { x: mx + nx * 8, y: my + ny * 8 },
        isSelf: false,
      };
    }

    return {
      path: `M ${sx} ${sy} L ${ex} ${ey}`,
      labelPos: { x: (sx + ex) / 2 + nx * 16, y: (sy + ey) / 2 + ny * 16 },
      isSelf: false,
    };
  };

  const formatTransitionLabel = (t: PDATransition) => {
    const input = t.inputSymbol === EPSILON ? 'ε' : t.inputSymbol;
    const pop = t.stackTop === EPSILON ? 'ε' : t.stackTop;
    const push = t.stackPush === EPSILON ? 'ε' : t.stackPush;
    return `${input}, ${pop} / ${push}`;
  };

  return (
    <svg
      className="w-full h-full bg-card rounded-lg"
      viewBox={viewBox}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        {/* Arrowheads for straight/curved edges — refX=0 since path ends at circle edge */}
        <marker id="arrowhead" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto" markerUnits="userSpaceOnUse">
          <polygon points="0 0, 10 4, 0 8" fill="hsl(var(--transition-line))" />
        </marker>
        <marker id="arrowhead-active" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto" markerUnits="userSpaceOnUse">
          <polygon points="0 0, 10 4, 0 8" fill="hsl(var(--state-current))" />
        </marker>
        {/* Self-loop arrowheads */}
        <marker id="arrowhead-self" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto" markerUnits="userSpaceOnUse">
          <polygon points="0 0, 8 3, 0 6" fill="hsl(var(--transition-line))" />
        </marker>
        <marker id="arrowhead-self-active" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto" markerUnits="userSpaceOnUse">
          <polygon points="0 0, 8 3, 0 6" fill="hsl(var(--state-current))" />
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
            x1={s.x - 65} y1={s.y} x2={s.x - STATE_RADIUS - 2} y2={s.y}
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
        const { path, labelPos, isSelf } = getGroupPath(first.fromState, first.toState);
        if (!path) return null;
        const isAnyActive = transitions.some(t => activeTransitionId === t.id);
        const lineHeight = 13;
        const padding = 4;
        const totalHeight = transitions.length * lineHeight + padding * 2;
        // Measure label width based on longest label
        const maxLabelLen = Math.max(...transitions.map(t => formatTransitionLabel(t).length));
        const labelWidth = Math.max(80, maxLabelLen * 6.5 + 16);

        return (
          <g key={key}>
            {/* The edge path */}
            <path
              d={path}
              fill="none"
              stroke={isAnyActive ? 'hsl(var(--state-current))' : 'hsl(var(--transition-line))'}
              strokeWidth={isAnyActive ? 2.5 : 1.5}
              markerEnd={`url(#${isSelf ? 'arrowhead-self' : 'arrowhead'}${isAnyActive ? '-active' : ''})`}
              className="transition-all duration-300"
              filter={isAnyActive ? 'url(#glow)' : undefined}
            />
            {/* Label background */}
            <rect
              x={labelPos.x - labelWidth / 2}
              y={labelPos.y - totalHeight / 2}
              width={labelWidth}
              height={totalHeight}
              rx={3}
              fill="hsl(var(--card))"
              fillOpacity={0.92}
              stroke={isAnyActive ? 'hsl(var(--state-current))' : 'hsl(var(--border))'}
              strokeWidth={0.5}
            />
            {/* Label text lines */}
            {transitions.map((t, i) => {
              const isActive = activeTransitionId === t.id;
              const ty = labelPos.y - totalHeight / 2 + padding + 10 + i * lineHeight;
              return (
                <text
                  key={t.id}
                  x={labelPos.x}
                  y={ty}
                  textAnchor="middle"
                  fill={isActive ? 'hsl(var(--state-current))' : 'hsl(var(--foreground))'}
                  fontSize="9.5"
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

      {/* States (drawn last so they're on top) */}
      {layoutStates.map(state => {
        const isCurrent = currentStateId === state.id;
        return (
          <g key={state.id}>
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
            {state.isAccepting && (
              <circle
                cx={state.x} cy={state.y} r={32}
                fill="none"
                stroke={isCurrent ? 'hsl(var(--state-current))' : 'hsl(var(--state-accepting))'}
                strokeWidth={2}
              />
            )}
            <circle
              cx={state.x} cy={state.y} r={STATE_RADIUS}
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
              x={state.x} y={state.y + 5}
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
