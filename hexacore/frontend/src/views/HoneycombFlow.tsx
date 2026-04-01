import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { HexFlowNode } from '../components/hex/HexFlowNode';
import { MOCK_WORKFLOW, TaskNode } from '../lib/mockData';
import { GitBranch, Clock, User, Package } from 'lucide-react';

export function HoneycombFlow() {
  const [selectedTask, setSelectedTask] = useState<TaskNode | null>(null);
  const wf = MOCK_WORKFLOW;

  // Layout: two parallel columns then sequential
  const LAYOUT: { id: string; col: number; row: number }[] = [
    { id: 't1', col: 0, row: 0 },
    { id: 't2', col: 1, row: 0 },
    { id: 't3', col: 0.5, row: 1 },
    { id: 't4', col: 0.5, row: 2 },
    { id: 't5', col: 0.5, row: 3 },
  ];

  const HEX_W = 110;
  const HEX_H = HEX_W * 1.1547;
  const COL_W = HEX_W + 20;
  const ROW_H = HEX_H * 0.78 + 12;
  const nodeMap = Object.fromEntries(wf.nodes.map(n => [n.id, n]));

  const getCenter = (col: number, row: number) => ({
    x: col * COL_W + HEX_W / 2,
    y: row * ROW_H + HEX_H / 2,
  });

  const CONNECTIONS = [
    { from: 't1', to: 't3' }, { from: 't2', to: 't3' },
    { from: 't3', to: 't4' }, { from: 't4', to: 't5' },
  ];

  const STATUS_EDGE_COLOR: Record<string, string> = {
    done: '#10b981', running: '#f59e0b', pending: '#374151', blocked: '#ef4444', failed: '#ef4444',
  };

  return (
    <div className="flex h-full">
      {/* Flow canvas */}
      <div className="flex-1 relative overflow-auto p-8">
        <div className="text-xs font-mono text-amber-700/50 tracking-widest mb-6">HONEYCOMB FLOW — {wf.name}</div>

        <div className="relative" style={{ width: COL_W * 2 + HEX_W, height: ROW_H * 4 + HEX_H }}>
          {/* SVG connections */}
          <svg className="absolute inset-0 pointer-events-none" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
            <defs>
              <marker id="arrowGreen" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                <path d="M0,0 L0,6 L6,3 z" fill="#10b98166" />
              </marker>
              <marker id="arrowAmber" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                <path d="M0,0 L0,6 L6,3 z" fill="#f59e0b66" />
              </marker>
              <marker id="arrowGray" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                <path d="M0,0 L0,6 L6,3 z" fill="#37415166" />
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
                  strokeOpacity={isActive ? 0.7 : 0.3}
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

      {/* Task detail panel */}
      {selectedTask && (
        <motion.div
          initial={{ x: 280, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 280, opacity: 0 }}
          className="w-64 border-l border-amber-900/20 bg-hive-bg/95 p-4 overflow-y-auto"
        >
          <div className="text-xs font-mono text-amber-700/60 tracking-widest mb-3">TASK DETAIL</div>

          <div className="space-y-3">
            <div>
              <div className="text-sm font-semibold text-slate-100">{selectedTask.label}</div>
              <div className="text-xs font-mono text-slate-600 mt-0.5">{selectedTask.id}</div>
            </div>

            <InfoRow icon={<User size={11} />} label="Agent" value={selectedTask.assigned_agent} />
            <InfoRow icon={<GitBranch size={11} />} label="Type" value={selectedTask.type} />
            {selectedTask.duration && <InfoRow icon={<Clock size={11} />} label="Duration" value={selectedTask.duration} />}

            {selectedTask.dependencies.length > 0 && (
              <div>
                <div className="text-xs font-mono text-amber-700/60 mb-1.5">DEPENDENCIES</div>
                <div className="flex flex-wrap gap-1">
                  {selectedTask.dependencies.map(d => (
                    <span key={d} className="px-1.5 py-0.5 bg-slate-800 rounded text-xs font-mono text-slate-400">{d}</span>
                  ))}
                </div>
              </div>
            )}

            {selectedTask.artifacts.length > 0 && (
              <div>
                <div className="text-xs font-mono text-amber-700/60 mb-1.5">ARTIFACTS</div>
                <div className="space-y-1">
                  {selectedTask.artifacts.map(a => (
                    <div key={a} className="flex items-center gap-1.5 text-xs text-slate-400">
                      <Package size={10} className="text-amber-600/60" />
                      <span className="font-mono truncate">{a}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedTask.output && (
              <div>
                <div className="text-xs font-mono text-amber-700/60 mb-1.5">OUTPUT</div>
                <pre className="text-xs text-slate-400 bg-slate-900/60 rounded p-2 overflow-x-auto border border-slate-800">
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
      <span className="text-amber-700/60">{icon}</span>
      <span className="text-xs text-slate-600 w-16">{label}</span>
      <span className="text-xs font-mono text-slate-300">{value}</span>
    </div>
  );
}
