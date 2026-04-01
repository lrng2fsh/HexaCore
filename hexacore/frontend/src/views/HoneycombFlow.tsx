import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { HexFlowNode } from '../components/hex/HexFlowNode';
import { ZoomPanCanvas } from '../components/ZoomPanCanvas';
import { MOCK_WORKFLOW, TaskNode } from '../lib/mockData';
import { GitBranch, Clock, User, Package } from 'lucide-react';

export function HoneycombFlow({ isAnime = false }: { isAnime?: boolean }) {
  const [selectedTask, setSelectedTask] = useState<TaskNode | null>(null);
  const wf = MOCK_WORKFLOW;

  const LAYOUT: { id: string; col: number; row: number }[] = [
    { id: 't1', col: 0, row: 0 },
    { id: 't2', col: 1, row: 0 },
    { id: 't3', col: 0.5, row: 1 },
    { id: 't4', col: 0.5, row: 2 },
    { id: 't5', col: 0.5, row: 3 },
  ];

  // Match HiveOverview spacing
  const HEX_W = 134;
  const HEX_H = HEX_W * 1.1547;
  const GAP = 32;
  const COL_W = HEX_W + GAP;
  const ROW_H = HEX_H + GAP;
  const nodeMap = Object.fromEntries(wf.nodes.map(n => [n.id, n]));

  const gridW = COL_W * 2 + HEX_W;
  const gridH = ROW_H * 4 + HEX_H;

  const getCenter = (col: number, row: number) => ({
    x: col * COL_W + HEX_W / 2,
    y: row * ROW_H + HEX_H / 2,
  });

  const CONNECTIONS = [
    { from: 't1', to: 't3' }, { from: 't2', to: 't3' },
    { from: 't3', to: 't4' }, { from: 't4', to: 't5' },
  ];

  const STATUS_EDGE_COLOR: Record<string, string> = {
    done: '#34d399', running: '#fbbf24', pending: '#94a3b8', blocked: '#f87171', failed: '#f87171',
  };

  return (
    <div className="flex h-full">
      {/* Flow canvas with zoom */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-3 flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className={`text-xs tracking-widest ${isAnime ? 'font-mono-tech' : 'font-mono'}`}
            style={{ color: 'color-mix(in srgb, var(--hive-accent) 40%, transparent)' }}>
            {isAnime ? `フロー / ${wf.name}` : `HONEYCOMB FLOW — ${wf.name}`}
          </div>
        </div>

        {/* Zoomable canvas */}
        <ZoomPanCanvas className="flex-1">
          <div className="flex items-center justify-center h-full w-full">
            <div className="relative" style={{ width: gridW, height: gridH }}>
              {/* SVG connections */}
              <svg
                width={gridW}
                height={gridH}
                className="absolute inset-0 pointer-events-none"
                style={{ overflow: 'visible' }}
              >
                <defs>
                  <marker id="arrowGreen" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L6,3 z" fill="#34d39966" />
                  </marker>
                  <marker id="arrowAmber" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L6,3 z" fill="#fbbf2466" />
                  </marker>
                  <marker id="arrowGray" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L6,3 z" fill="#94a3b866" />
                  </marker>
                </defs>
                {CONNECTIONS.map(({ from, to }) => {
                  const fromPos = LAYOUT.find(l => l.id === from)!;
                  const toPos = LAYOUT.find(l => l.id === to)!;
                  const fromNode = nodeMap[from];
                  const toNode = nodeMap[to];
                  const fc = getCenter(fromPos.col, fromPos.row);
                  const tc = getCenter(toPos.col, toPos.row);
                  const color = STATUS_EDGE_COLOR[fromNode?.status ?? 'pending'];
                  const isActive = fromNode?.status === 'done' && toNode?.status !== 'pending';
                  const markerId = fromNode?.status === 'done' ? 'arrowGreen' : fromNode?.status === 'running' ? 'arrowAmber' : 'arrowGray';

                  return (
                    <motion.line
                      key={`${from}-${to}`}
                      x1={fc.x} y1={fc.y + HEX_H / 2 - 10}
                      x2={tc.x} y2={tc.y - HEX_H / 2 + 10}
                      stroke={color}
                      strokeWidth={isActive ? 1.5 : 1}
                      strokeOpacity={isActive ? 0.8 : 0.35}
                      strokeDasharray={isActive ? '5 3' : '3 5'}
                      markerEnd={`url(#${markerId})`}
                      animate={isActive ? { strokeDashoffset: [0, -16] } : {}}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                  );
                })}
              </svg>

              {/* Hex nodes */}
              {LAYOUT.map((pos) => {
                const node = nodeMap[pos.id];
                if (!node) return null;
                return (
                  <motion.div
                    key={pos.id}
                    style={{ position: 'absolute', left: pos.col * COL_W, top: pos.row * ROW_H }}
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: LAYOUT.indexOf(pos) * 0.1 }}
                  >
                    <HexFlowNode
                      label={node.label}
                      type={node.type}
                      agent={node.assigned_agent}
                      status={node.status}
                      duration={node.duration}
                      isSelected={selectedTask?.id === node.id}
                      onClick={() => setSelectedTask(selectedTask?.id === node.id ? null : node)}
                      size={HEX_W}
                    />
                  </motion.div>
                );
              })}
            </div>
          </div>
        </ZoomPanCanvas>
      </div>

      {/* Task detail panel */}
      {selectedTask && (
        <motion.div
          initial={{ x: 280, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 280, opacity: 0 }}
          className="w-64 p-4 overflow-y-auto flex-shrink-0"
          style={{
            borderLeft: '1px solid rgba(255,255,255,0.08)',
            background: 'color-mix(in srgb, var(--hive-bg) 95%, transparent)',
          }}
        >
          <div className="text-xs font-mono-tech tracking-widest mb-3" style={{ color: '#94a3b8' }}>TASK DETAIL</div>

          <div className="space-y-3">
            <div>
              <div className="text-sm font-semibold" style={{ color: '#f0f0f5' }}>{selectedTask.label}</div>
              <div className="text-xs font-mono-tech mt-0.5" style={{ color: '#6b7280' }}>{selectedTask.id}</div>
            </div>

            <InfoRow icon={<User size={11} />} label="Agent" value={selectedTask.assigned_agent} />
            <InfoRow icon={<GitBranch size={11} />} label="Type" value={selectedTask.type} />
            {selectedTask.duration && <InfoRow icon={<Clock size={11} />} label="Duration" value={selectedTask.duration} />}

            {selectedTask.dependencies.length > 0 && (
              <div>
                <div className="text-xs font-mono-tech mb-1.5" style={{ color: '#94a3b8' }}>DEPENDENCIES</div>
                <div className="flex flex-wrap gap-1">
                  {selectedTask.dependencies.map(d => (
                    <span key={d} className="px-1.5 py-0.5 rounded text-xs font-mono-tech"
                      style={{ background: 'rgba(255,255,255,0.06)', color: '#b8bdd0' }}>{d}</span>
                  ))}
                </div>
              </div>
            )}

            {selectedTask.artifacts.length > 0 && (
              <div>
                <div className="text-xs font-mono-tech mb-1.5" style={{ color: '#94a3b8' }}>ARTIFACTS</div>
                <div className="space-y-1">
                  {selectedTask.artifacts.map(a => (
                    <div key={a} className="flex items-center gap-1.5 text-xs" style={{ color: '#b8bdd0' }}>
                      <Package size={10} style={{ color: 'var(--hive-accent)', opacity: 0.6 }} />
                      <span className="font-mono-tech truncate">{a}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedTask.output && (
              <div>
                <div className="text-xs font-mono-tech mb-1.5" style={{ color: '#94a3b8' }}>OUTPUT</div>
                <pre className="text-xs font-mono-tech rounded p-2 overflow-x-auto"
                  style={{ color: '#b8bdd0', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  {JSON.stringify(selectedTask.output, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <span style={{ color: 'var(--hive-accent)', opacity: 0.5 }}>{icon}</span>
      <span className="text-xs w-16" style={{ color: '#6b7280' }}>{label}</span>
      <span className="text-xs font-mono-tech" style={{ color: '#e2e8f0' }}>{value}</span>
    </div>
  );
}
