import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, Cpu, Database, TestTube, Hammer, Zap } from 'lucide-react';
import { HexCell } from './HexCell';
import { Agent, AgentStatus } from '../../lib/mockData';

const AGENT_ICONS: Record<string, React.ReactNode> = {
  queen: <Crown size={22} className="text-amber-400" />,
  'app-agent': <Cpu size={18} className="text-blue-400" />,
  'dba-agent': <Database size={18} className="text-purple-400" />,
  'qa-agent': <TestTube size={18} className="text-green-400" />,
  'build-agent': <Hammer size={18} className="text-orange-400" />,
};

const STATUS_LABEL: Record<AgentStatus, string> = {
  idle: 'IDLE',
  busy: 'ACTIVE',
  error: 'ERROR',
  offline: 'OFFLINE',
  thinking: 'THINKING',
};

const STATUS_COLOR: Record<AgentStatus, string> = {
  idle: '#6b7280',
  busy: '#f59e0b',
  error: '#ef4444',
  offline: '#374151',
  thinking: '#8b5cf6',
};

interface HoneycombGridProps {
  agents: Agent[];
  selectedAgent: Agent | null;
  onSelectAgent: (agent: Agent) => void;
}

// Honeycomb offset layout: queen center, workers surrounding
const HEX_LAYOUT = [
  { id: 'app-agent', col: 0, row: 0 },
  { id: 'dba-agent', col: 1, row: 0 },
  { id: 'queen', col: 0.5, row: 1, isCenter: true },
  { id: 'qa-agent', col: 0, row: 2 },
  { id: 'build-agent', col: 1, row: 2 },
];

export function HoneycombGrid({ agents, selectedAgent, onSelectAgent }: HoneycombGridProps) {
  const HEX_W = 130;
  const HEX_H = HEX_W * 1.1547;
  const GAP = 8;
  const COL_W = HEX_W + GAP;
  const ROW_H = HEX_H * 0.75 + GAP;

  const agentMap = Object.fromEntries(agents.map(a => [a.id, a]));

  return (
    <div className="relative flex items-center justify-center w-full h-full">
      {/* Background hex texture */}
      <div className="absolute inset-0 hive-bg opacity-40 pointer-events-none" />

      {/* Connection lines SVG */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
        <defs>
          <marker id="arrowAmber" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <path d="M0,0 L0,6 L6,3 z" fill="#f59e0b66" />
          </marker>
        </defs>
        <ConnectionLines agents={agents} layout={HEX_LAYOUT} hexW={HEX_W} hexH={HEX_H} colW={COL_W} rowH={ROW_H} />
      </svg>

      {/* Hex cells */}
      <div className="relative" style={{ zIndex: 2 }}>
        <div style={{
          position: 'relative',
          width: COL_W * 2 + HEX_W,
          height: ROW_H * 2 + HEX_H,
        }}>
          {HEX_LAYOUT.map((pos) => {
            const agent = agentMap[pos.id];
            if (!agent) return null;
            const x = pos.col * COL_W;
            const y = pos.row * ROW_H;
            const isSelected = selectedAgent?.id === agent.id;
            const size = agent.isQueen ? 150 : 120;

            return (
              <motion.div
                key={agent.id}
                style={{
                  position: 'absolute',
                  left: x + (agent.isQueen ? -10 : 0),
                  top: y + (agent.isQueen ? -10 : 0),
                }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: HEX_LAYOUT.indexOf(pos) * 0.1, duration: 0.4 }}
              >
                <HexCell
                  size={size}
                  status={agent.status}
                  isQueen={agent.isQueen}
                  isActive={isSelected}
                  onClick={() => onSelectAgent(agent)}
                >
                  <div className="flex flex-col items-center justify-center gap-1 px-2 text-center">
                    <div className="mb-0.5">
                      {AGENT_ICONS[agent.id] ?? <Zap size={18} />}
                    </div>
                    <div className={`font-semibold leading-tight ${agent.isQueen ? 'text-sm text-amber-300' : 'text-xs text-slate-200'}`}>
                      {agent.name}
                    </div>
                    <div style={{
                      fontSize: 9,
                      color: STATUS_COLOR[agent.status],
                      fontFamily: 'JetBrains Mono, monospace',
                      letterSpacing: '0.08em',
                      fontWeight: 600,
                    }}>
                      {STATUS_LABEL[agent.status]}
                    </div>
                    {/* Confidence bar */}
                    <div className="w-10 h-0.5 bg-slate-700 rounded-full overflow-hidden mt-0.5">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: STATUS_COLOR[agent.status] }}
                        initial={{ width: 0 }}
                        animate={{ width: `${agent.confidence}%` }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                      />
                    </div>
                  </div>
                </HexCell>

                {/* Selected ring */}
                {isSelected && (
                  <motion.div
                    style={{
                      position: 'absolute',
                      inset: -6,
                      clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                      border: '2px solid rgba(245,158,11,0.6)',
                      pointerEvents: 'none',
                    }}
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}

                {/* Signal pulse for active agents */}
                {agent.status === 'busy' && (
                  <motion.div
                    style={{
                      position: 'absolute',
                      inset: -12,
                      clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                      border: '1px solid rgba(245,158,11,0.3)',
                      pointerEvents: 'none',
                    }}
                    animate={{ opacity: [0, 0.6, 0], scale: [0.9, 1.1, 0.9] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ConnectionLines({ agents, layout, hexW, hexH, colW, rowH }: {
  agents: Agent[];
  layout: typeof HEX_LAYOUT;
  hexW: number; hexH: number; colW: number; rowH: number;
}) {
  const agentMap = Object.fromEntries(agents.map(a => [a.id, a]));
  const queenPos = layout.find(l => l.id === 'queen')!;

  const getCenterX = (col: number) => col * colW + hexW / 2;
  const getCenterY = (row: number) => row * rowH + hexH / 2;

  const qx = getCenterX(queenPos.col) - 10;
  const qy = getCenterY(queenPos.row) - 10;

  return (
    <>
      {layout.filter(l => l.id !== 'queen').map((pos) => {
        const agent = agentMap[pos.id];
        const ax = getCenterX(pos.col);
        const ay = getCenterY(pos.row);
        const isActive = agent?.status === 'busy' || agent?.status === 'done';
        const color = isActive ? '#f59e0b' : '#374151';
        const opacity = isActive ? 0.5 : 0.2;

        return (
          <motion.line
            key={pos.id}
            x1={ax} y1={ay} x2={qx} y2={qy}
            stroke={color}
            strokeWidth={isActive ? 1.5 : 1}
            strokeOpacity={opacity}
            strokeDasharray={isActive ? '4 4' : '2 6'}
            animate={isActive ? { strokeDashoffset: [0, -16] } : {}}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        );
      })}
    </>
  );
}
