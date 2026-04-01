import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, Database, TestTube, Hammer, Zap } from 'lucide-react';
import { HexCell } from './HexCell';
import { Agent, AgentStatus } from '../../lib/mockData';

// ─── Bee SVG icons ────────────────────────────────────────────────────────────

function QueenBeeIcon({ size = 44 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      {/* Crown */}
      <path d="M20 22 L32 12 L44 22 L40 18 L32 24 L24 18 Z" fill="#fbbf24" opacity="1" />
      {/* Body */}
      <ellipse cx="32" cy="38" rx="10" ry="14" fill="#f59e0b" />
      {/* Stripes */}
      <rect x="22" y="33" width="20" height="3" rx="1.5" fill="#1a0a00" opacity="0.8" />
      <rect x="22" y="39" width="20" height="3" rx="1.5" fill="#1a0a00" opacity="0.8" />
      <rect x="22" y="45" width="20" height="3" rx="1.5" fill="#1a0a00" opacity="0.6" />
      {/* Head */}
      <circle cx="32" cy="24" r="6" fill="#fcd34d" />
      {/* Eyes */}
      <circle cx="29" cy="23" r="1.2" fill="#1a0a00" />
      <circle cx="35" cy="23" r="1.2" fill="#1a0a00" />
      {/* Antennae */}
      <line x1="29" y1="19" x2="24" y2="12" stroke="#fcd34d" strokeWidth="2" strokeLinecap="round" />
      <line x1="35" y1="19" x2="40" y2="12" stroke="#fcd34d" strokeWidth="2" strokeLinecap="round" />
      <circle cx="24" cy="12" r="2" fill="#fcd34d" />
      <circle cx="40" cy="12" r="2" fill="#fcd34d" />
      {/* Wings — brighter */}
      <ellipse cx="20" cy="31" rx="10" ry="6" fill="white" opacity="0.55" transform="rotate(-20 20 31)" />
      <ellipse cx="44" cy="31" rx="10" ry="6" fill="white" opacity="0.55" transform="rotate(20 44 31)" />
      <ellipse cx="19" cy="38" rx="8" ry="5" fill="white" opacity="0.35" transform="rotate(-10 19 38)" />
      <ellipse cx="45" cy="38" rx="8" ry="5" fill="white" opacity="0.35" transform="rotate(10 45 38)" />
      {/* Stinger */}
      <path d="M32 52 L30 56 L32 54 L34 56 Z" fill="#d97706" />
    </svg>
  );
}

function WorkerBeeIcon({ size = 34, color = '#94a3b8' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      {/* Body */}
      <ellipse cx="32" cy="38" rx="9" ry="12" fill={color} />
      {/* Stripes */}
      <rect x="23" y="33" width="18" height="3" rx="1.5" fill="#0f172a" opacity="0.75" />
      <rect x="23" y="38" width="18" height="3" rx="1.5" fill="#0f172a" opacity="0.75" />
      <rect x="23" y="43" width="18" height="3" rx="1.5" fill="#0f172a" opacity="0.5" />
      {/* Head */}
      <circle cx="32" cy="25" r="6" fill={color} />
      {/* Eyes */}
      <circle cx="29" cy="24" r="1.2" fill="#0f172a" opacity="0.9" />
      <circle cx="35" cy="24" r="1.2" fill="#0f172a" opacity="0.9" />
      {/* Antennae */}
      <line x1="30" y1="20" x2="25" y2="13" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <line x1="34" y1="20" x2="39" y2="13" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <circle cx="25" cy="13" r="2" fill={color} />
      <circle cx="39" cy="13" r="2" fill={color} />
      {/* Wings — much more visible */}
      <ellipse cx="21" cy="31" rx="9" ry="5" fill="white" opacity="0.5" transform="rotate(-15 21 31)" />
      <ellipse cx="43" cy="31" rx="9" ry="5" fill="white" opacity="0.5" transform="rotate(15 43 31)" />
      <ellipse cx="20" cy="38" rx="7" ry="4" fill="white" opacity="0.3" transform="rotate(-8 20 38)" />
      <ellipse cx="44" cy="38" rx="7" ry="4" fill="white" opacity="0.3" transform="rotate(8 44 38)" />
      {/* Stinger */}
      <path d="M32 50 L30 54 L32 52 L34 54 Z" fill="rgba(0,0,0,0.4)" />
    </svg>
  );
}

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<AgentStatus, string> = {
  idle: 'IDLE', busy: 'ACTIVE', error: 'ERROR', offline: 'OFFLINE', thinking: 'THINKING',
};

const STATUS_COLOR: Record<AgentStatus, string> = {
  idle: '#94a3b8', busy: '#fbbf24', error: '#f87171', offline: '#374151', thinking: '#a78bfa',
};

const WORKER_BEE_COLOR: Record<string, string> = {
  'app-agent':   '#60a5fa',  // bright blue
  'dba-agent':   '#c084fc',  // bright purple
  'qa-agent':    '#34d399',  // bright green
  'build-agent': '#fb923c',  // bright orange
};

const ROLE_ICON: Record<string, React.ReactNode> = {
  'app-agent': <Cpu size={11} className="text-blue-400 opacity-60" />,
  'dba-agent': <Database size={11} className="text-purple-400 opacity-60" />,
  'qa-agent': <TestTube size={11} className="text-green-400 opacity-60" />,
  'build-agent': <Hammer size={11} className="text-orange-400 opacity-60" />,
};

// Layout: queen centered, workers at corners
// Using explicit pixel positions for precise control
const HEX_LAYOUT = [
  { id: 'app-agent',   col: 0,   row: 0 },
  { id: 'dba-agent',   col: 1,   row: 0 },
  { id: 'queen',       col: 0.5, row: 1, isCenter: true },
  { id: 'qa-agent',    col: 0,   row: 2 },
  { id: 'build-agent', col: 1,   row: 2 },
];

interface HoneycombGridProps {
  agents: Agent[];
  selectedAgent: Agent | null;
  onSelectAgent: (agent: Agent) => void;
}

export function HoneycombGrid({ agents, selectedAgent, onSelectAgent }: HoneycombGridProps) {
  const HEX_W = 140;
  const HEX_H = HEX_W * 1.1547;
  const GAP = 36;           // increased gap between cells
  const COL_W = HEX_W + GAP;
  const ROW_H = HEX_H * 0.75 + GAP;

  const QUEEN_SIZE = 180;
  const WORKER_SIZE = 148;

  const agentMap = Object.fromEntries(agents.map(a => [a.id, a]));

  const gridW = COL_W * 2 + HEX_W;
  const gridH = ROW_H * 2 + HEX_H;

  // Compute center of each cell in grid coordinates
  const cellCenter = (col: number, row: number, isQueen = false) => {
    const size = isQueen ? QUEEN_SIZE : WORKER_SIZE;
    const h = size * 1.1547;
    // queen is offset by -12 to center it
    const ox = isQueen ? -12 : 0;
    const oy = isQueen ? -12 : 0;
    return {
      x: col * COL_W + ox + size / 2,
      y: row * ROW_H + oy + h / 2,
    };
  };

  const queenPos = HEX_LAYOUT.find(l => l.id === 'queen')!;
  const qc = cellCenter(queenPos.col, queenPos.row, true);

  return (
    <div className="relative" style={{ width: gridW, height: gridH }}>

      {/* SVG connection lines */}
      <svg
        width={gridW}
        height={gridH}
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 1, overflow: 'visible' }}
      >
            {HEX_LAYOUT.filter(l => l.id !== 'queen').map((pos) => {
              const agent = agentMap[pos.id];
              const wc = cellCenter(pos.col, pos.row, false);
              const isActive = agent?.status === 'busy';
              const isDone = agent?.status === 'idle'; // idle = completed in mock
              const color = isActive ? 'rgba(245,158,11,0.7)' : isDone ? 'rgba(245,158,11,0.4)' : 'rgba(200,205,225,0.25)';
              const opacity = isActive ? 1 : isDone ? 0.6 : 1;
              const strokeW = isActive ? 1.5 : 1;

              return (
                <motion.line
                  key={pos.id}
                  x1={wc.x} y1={wc.y}
                  x2={qc.x} y2={qc.y}
                  stroke={color}
                  strokeWidth={strokeW}
                  strokeOpacity={opacity}
                  strokeDasharray={isActive ? '5 4' : '3 6'}
                  animate={isActive ? { strokeDashoffset: [0, -18] } : {}}
                  transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                />
              );
            })}
          </svg>

          {/* Hex cells */}
          {HEX_LAYOUT.map((pos, i) => {
            const agent = agentMap[pos.id];
            if (!agent) return null;

            const isQueen = !!agent.isQueen;
            const size = isQueen ? QUEEN_SIZE : WORKER_SIZE;
            const x = pos.col * COL_W + (isQueen ? -12 : 0);
            const y = pos.row * ROW_H + (isQueen ? -12 : 0);
            const isSelected = selectedAgent?.id === agent.id;
            const beeColor = WORKER_BEE_COLOR[agent.id] ?? '#94a3b8';

            return (
              <motion.div
                key={agent.id}
                style={{ position: 'absolute', left: x, top: y, zIndex: 3 }}
                initial={{ opacity: 0, scale: 0.75 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.08, duration: 0.4, type: 'spring', stiffness: 200 }}
              >
                <HexCell
                  size={size}
                  status={agent.status}
                  isQueen={isQueen}
                  isActive={isSelected}
                  onClick={() => onSelectAgent(agent)}
                >
                  <div className="flex flex-col items-center justify-center gap-0.5 px-2 text-center select-none">
                    {/* Bee icon — animated when busy */}
                    <motion.div
                      className="mb-0.5"
                      animate={agent.status === 'busy' ? {
                        y: [0, -3, 0, -2, 0],
                        rotate: [0, -6, 0, 6, 0],
                      } : {}}
                      transition={agent.status === 'busy' ? {
                        duration: 1.2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      } : {}}
                    >
                      {isQueen
                        ? <QueenBeeIcon size={52} />
                        : <WorkerBeeIcon size={40} color={beeColor} />
                      }
                    </motion.div>

                    {/* Role icon + name */}
                    <div className="flex items-center gap-1">
                      {!isQueen && ROLE_ICON[agent.id]}
                      <span style={{
                        fontFamily: 'Rajdhani, sans-serif',
                        fontWeight: 700,
                        fontSize: isQueen ? 17 : 14,
                        color: '#f0f0f5',
                        letterSpacing: '0.04em',
                        textShadow: '0 1px 4px rgba(0,0,0,0.8)',
                        lineHeight: 1.1,
                      }}>
                        {agent.name}
                      </span>
                    </div>

                    {/* Status */}
                    <div style={{
                      fontSize: 9,
                      color: STATUS_COLOR[agent.status],
                      fontFamily: 'Share Tech Mono, monospace',
                      letterSpacing: '0.14em',
                      fontWeight: 700,
                      textShadow: `0 0 8px ${STATUS_COLOR[agent.status]}, 0 0 16px ${STATUS_COLOR[agent.status]}88`,
                    }}>
                      {STATUS_LABEL[agent.status]}
                    </div>

                    {/* Confidence bar */}
                    <div className="w-10 h-px rounded-full overflow-hidden mt-1" style={{ background: 'rgba(255,255,255,0.12)' }}>
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: STATUS_COLOR[agent.status] }}
                        initial={{ width: 0 }}
                        animate={{ width: `${agent.confidence}%` }}
                        transition={{ delay: 0.6 + i * 0.1, duration: 0.9 }}
                      />
                    </div>
                  </div>
                </HexCell>

                {/* Selected ring */}
                {isSelected && (
                  <motion.div
                    style={{
                      position: 'absolute',
                      inset: -8,
                      clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                      border: '2px solid rgba(245,158,11,0.55)',
                      pointerEvents: 'none',
                    }}
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}

                {/* Active pulse ring */}
                {agent.status === 'busy' && (
                  <motion.div
                    style={{
                      position: 'absolute',
                      inset: -14,
                      clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                      border: '1px solid rgba(245,158,11,0.25)',
                      pointerEvents: 'none',
                    }}
                    animate={{ opacity: [0, 0.7, 0], scale: [0.92, 1.08, 0.92] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                  />
                )}
              </motion.div>
            );
          })}
    </div>
  );
}
