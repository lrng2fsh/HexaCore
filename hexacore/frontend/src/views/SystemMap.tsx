import React from 'react';
import { motion } from 'framer-motion';
import { Server, Database, Globe, Settings, Package, GitBranch, Cpu } from 'lucide-react';

interface SystemNode {
  id: string;
  label: string;
  type: string;
  status: 'healthy' | 'warning' | 'error' | 'unknown';
  icon: React.ReactNode;
  x: number;
  y: number;
  connections: string[];
}

const NODES: SystemNode[] = [
  { id: 'api', label: 'API Server', type: 'service', status: 'healthy', icon: <Globe size={14} />, x: 300, y: 80, connections: ['db', 'cache', 'queue'] },
  { id: 'db', label: 'PostgreSQL', type: 'database', status: 'healthy', icon: <Database size={14} />, x: 120, y: 220, connections: ['api'] },
  { id: 'cache', label: 'Redis Cache', type: 'service', status: 'healthy', icon: <Server size={14} />, x: 300, y: 260, connections: [] },
  { id: 'queue', label: 'Job Queue', type: 'service', status: 'warning', icon: <Package size={14} />, x: 480, y: 220, connections: ['worker'] },
  { id: 'worker', label: 'Worker Process', type: 'service', status: 'healthy', icon: <Cpu size={14} />, x: 480, y: 80, connections: ['db'] },
  { id: 'export', label: 'Export Service', type: 'service', status: 'error', icon: <Settings size={14} />, x: 200, y: 360, connections: ['db', 'queue'] },
  { id: 'build', label: 'Build Pipeline', type: 'ci', status: 'healthy', icon: <GitBranch size={14} />, x: 400, y: 360, connections: ['api'] },
];

const STATUS_COLOR: Record<string, string> = {
  healthy: '#10b981', warning: '#f59e0b', error: '#ef4444', unknown: '#6b7280',
};

export function SystemMap() {
  return (
    <div className="h-full overflow-hidden p-6">
      <div className="text-xs font-mono text-amber-700/50 tracking-widest mb-4">SYSTEM MAP — HIVE NETWORK</div>

      <div className="relative w-full h-full">
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
          {NODES.map(node =>
            node.connections.map(targetId => {
              const target = NODES.find(n => n.id === targetId);
              if (!target) return null;
              const isError = node.status === 'error' || target.status === 'error';
              const color = isError ? '#ef444444' : '#f59e0b22';
              return (
                <motion.line
                  key={`${node.id}-${targetId}`}
                  x1={node.x + 40} y1={node.y + 20}
                  x2={target.x + 40} y2={target.y + 20}
                  stroke={color}
                  strokeWidth={1}
                  strokeDasharray="4 4"
                  animate={{ strokeDashoffset: [0, -16] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                />
              );
            })
          )}
        </svg>

        {NODES.map((node, i) => (
          <motion.div
            key={node.id}
            style={{ position: 'absolute', left: node.x, top: node.y }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ scale: 1.05, zIndex: 10 }}
            className="cursor-pointer"
          >
            <div className="relative w-20 rounded-lg border p-2.5 text-center"
              style={{
                borderColor: `${STATUS_COLOR[node.status]}44`,
                background: `${STATUS_COLOR[node.status]}08`,
                boxShadow: `0 0 12px ${STATUS_COLOR[node.status]}22`,
              }}>
              <div className="flex items-center justify-center mb-1.5" style={{ color: STATUS_COLOR[node.status] }}>
                {node.icon}
              </div>
              <div className="text-xs text-slate-300 font-medium leading-tight">{node.label}</div>
              <div className="text-xs font-mono mt-1" style={{ color: STATUS_COLOR[node.status], fontSize: 9 }}>
                {node.status.toUpperCase()}
              </div>

              {/* Status dot */}
              <motion.div
                className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
                style={{ background: STATUS_COLOR[node.status] }}
                animate={node.status === 'error' ? { opacity: [1, 0.2, 1] } : {}}
                transition={{ duration: 0.8, repeat: Infinity }}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
