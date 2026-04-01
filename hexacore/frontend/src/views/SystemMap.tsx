import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Server, Database, Globe, Settings, Package, GitBranch, Cpu, Shield, Cloud, HardDrive, Wifi, Lock } from 'lucide-react';
import { ZoomPanCanvas } from '../components/ZoomPanCanvas';

interface SystemNode {
  id: string;
  label: string;
  type: string;
  status: 'healthy' | 'warning' | 'error' | 'unknown';
  icon: React.ReactNode;
  col: number;
  row: number;
  connections: string[];
  detail: string;
  metrics?: { cpu?: string; mem?: string; latency?: string; uptime?: string };
}

const NODES: SystemNode[] = [
  // Row 0 — external
  { id: 'cdn', label: 'CDN Edge', type: 'network', status: 'healthy', icon: <Cloud size={16} />,
    col: 0, row: 0, connections: ['gateway'], detail: 'Cloudflare edge cache',
    metrics: { latency: '12ms', uptime: '99.99%' } },
  { id: 'dns', label: 'DNS', type: 'network', status: 'healthy', icon: <Globe size={16} />,
    col: 1, row: 0, connections: ['gateway'], detail: 'Route53 DNS resolution',
    metrics: { latency: '4ms', uptime: '100%' } },
  { id: 'auth', label: 'Auth Service', type: 'service', status: 'healthy', icon: <Lock size={16} />,
    col: 2, row: 0, connections: ['gateway', 'db-users'], detail: 'OAuth2 / JWT auth provider',
    metrics: { cpu: '12%', mem: '340MB', latency: '45ms' } },

  // Row 1 — gateway + core
  { id: 'gateway', label: 'API Gateway', type: 'service', status: 'healthy', icon: <Shield size={16} />,
    col: 0.5, row: 1, connections: ['api', 'ws'], detail: 'Kong API gateway — rate limiting, routing',
    metrics: { cpu: '18%', mem: '512MB', latency: '8ms' } },
  { id: 'ws', label: 'WebSocket', type: 'service', status: 'healthy', icon: <Wifi size={16} />,
    col: 2, row: 1, connections: ['api'], detail: 'Real-time event push to UI',
    metrics: { cpu: '5%', mem: '128MB' } },

  // Row 2 — application layer
  { id: 'api', label: 'API Server', type: 'service', status: 'healthy', icon: <Server size={16} />,
    col: 1, row: 2, connections: ['db-main', 'cache', 'queue', 'export'], detail: 'Express.js — main application server',
    metrics: { cpu: '34%', mem: '1.2GB', latency: '22ms' } },

  // Row 3 — data + services
  { id: 'db-main', label: 'PostgreSQL', type: 'database', status: 'healthy', icon: <Database size={16} />,
    col: 0, row: 3, connections: [], detail: 'Primary database — orders, users, exports',
    metrics: { cpu: '28%', mem: '4GB', latency: '3ms' } },
  { id: 'db-users', label: 'Users DB', type: 'database', status: 'healthy', icon: <Database size={16} />,
    col: 0, row: 4, connections: [], detail: 'User profiles and permissions',
    metrics: { cpu: '8%', mem: '1GB' } },
  { id: 'cache', label: 'Redis Cache', type: 'service', status: 'healthy', icon: <HardDrive size={16} />,
    col: 1, row: 3, connections: [], detail: 'Session cache + query cache',
    metrics: { mem: '256MB', latency: '0.5ms' } },
  { id: 'queue', label: 'Job Queue', type: 'service', status: 'warning', icon: <Package size={16} />,
    col: 2, row: 3, connections: ['worker'], detail: 'BullMQ — async job processing',
    metrics: { cpu: '22%', mem: '512MB' } },

  // Row 4 — workers + export
  { id: 'worker', label: 'Worker Process', type: 'service', status: 'healthy', icon: <Cpu size={16} />,
    col: 2, row: 4, connections: ['db-main'], detail: 'Background job executor',
    metrics: { cpu: '45%', mem: '768MB' } },
  { id: 'export', label: 'Export Service', type: 'service', status: 'error', icon: <Settings size={16} />,
    col: 1, row: 4, connections: ['db-main', 'storage'], detail: 'CSV/PDF export — NULL REF at line 142',
    metrics: { cpu: '0%', mem: '0MB', latency: 'TIMEOUT' } },

  // Row 5 — storage + CI
  { id: 'storage', label: 'S3 Storage', type: 'storage', status: 'healthy', icon: <Cloud size={16} />,
    col: 0.5, row: 5, connections: [], detail: 'Artifact and export file storage',
    metrics: { uptime: '99.99%' } },
  { id: 'ci', label: 'Build Pipeline', type: 'ci', status: 'healthy', icon: <GitBranch size={16} />,
    col: 2, row: 5, connections: ['api'], detail: 'GitHub Actions — CI/CD pipeline',
    metrics: { uptime: '99.8%' } },
];

const STATUS_COLOR: Record<string, string> = {
  healthy: '#34d399', warning: '#fbbf24', error: '#f87171', unknown: '#94a3b8',
};

const STATUS_LABEL: Record<string, string> = {
  healthy: 'HEALTHY', warning: 'WARNING', error: 'ERROR', unknown: 'UNKNOWN',
};

const TYPE_BG: Record<string, string> = {
  service: 'rgba(56,189,248,0.06)',
  database: 'rgba(139,92,246,0.06)',
  network: 'rgba(16,185,129,0.06)',
  storage: 'rgba(245,158,11,0.06)',
  ci: 'rgba(99,102,241,0.06)',
};

const TYPE_BORDER: Record<string, string> = {
  service: 'rgba(56,189,248,0.2)',
  database: 'rgba(139,92,246,0.2)',
  network: 'rgba(16,185,129,0.2)',
  storage: 'rgba(245,158,11,0.2)',
  ci: 'rgba(99,102,241,0.2)',
};

export function SystemMap({ isAnime = false }: { isAnime?: boolean }) {
  const [selected, setSelected] = useState<SystemNode | null>(null);

  const NODE_W = 140;
  const NODE_H = 80;
  const GAP_X = 48;
  const GAP_Y = 40;
  const COL_W = NODE_W + GAP_X;
  const ROW_H = NODE_H + GAP_Y;

  const gridW = COL_W * 3 + NODE_W;
  const gridH = ROW_H * 5 + NODE_H;

  const nodeCenter = (col: number, row: number) => ({
    x: col * COL_W + NODE_W / 2,
    y: row * ROW_H + NODE_H / 2,
  });

  const nodeMap = Object.fromEntries(NODES.map(n => [n.id, n]));

  return (
    <div className="flex h-full">
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-3 flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className={`text-xs tracking-widest ${isAnime ? 'font-mono-tech' : 'font-mono'}`}
            style={{ color: 'color-mix(in srgb, var(--hive-accent) 40%, transparent)' }}>
            {isAnime ? 'システムマップ / SYSTEM MAP' : 'SYSTEM MAP — HIVE NETWORK'}
          </div>
        </div>

        <ZoomPanCanvas className="flex-1">
          <div className="flex items-center justify-center h-full w-full">
            <div className="relative" style={{ width: gridW, height: gridH }}>

              {/* Connection lines */}
              <svg width={gridW} height={gridH} className="absolute inset-0 pointer-events-none" style={{ overflow: 'visible' }}>
                {NODES.map(node =>
                  node.connections.map(targetId => {
                    const target = nodeMap[targetId];
                    if (!target) return null;
                    const from = nodeCenter(node.col, node.row);
                    const to = nodeCenter(target.col, target.row);
                    const isError = node.status === 'error' || target.status === 'error';
                    const isWarn = node.status === 'warning' || target.status === 'warning';
                    const color = isError ? '#f8717144' : isWarn ? '#fbbf2433' : 'rgba(200,205,225,0.15)';

                    return (
                      <motion.line
                        key={`${node.id}-${targetId}`}
                        x1={from.x} y1={from.y}
                        x2={to.x} y2={to.y}
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

              {/* Nodes */}
              {NODES.map((node, i) => {
                const x = node.col * COL_W;
                const y = node.row * ROW_H;
                const isSelected = selected?.id === node.id;
                const statusColor = STATUS_COLOR[node.status];

                return (
                  <motion.div
                    key={node.id}
                    style={{ position: 'absolute', left: x, top: y, width: NODE_W }}
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.04, duration: 0.3 }}
                    whileHover={{ scale: 1.04, zIndex: 10 }}
                    onClick={() => setSelected(isSelected ? null : node)}
                    className="cursor-pointer"
                  >
                    <div
                      className="relative rounded-lg p-3"
                      style={{
                        background: TYPE_BG[node.type] ?? 'rgba(255,255,255,0.03)',
                        border: `1px solid ${isSelected ? statusColor + '88' : TYPE_BORDER[node.type] ?? 'rgba(255,255,255,0.08)'}`,
                        boxShadow: isSelected
                          ? `0 0 20px ${statusColor}33`
                          : node.status === 'error'
                            ? `0 0 12px ${statusColor}22`
                            : 'none',
                      }}
                    >
                      {/* Status dot */}
                      <motion.div
                        className="absolute top-2 right-2 w-2 h-2 rounded-full"
                        style={{ background: statusColor }}
                        animate={node.status === 'error' ? { opacity: [1, 0.2, 1] } : node.status === 'warning' ? { opacity: [1, 0.5, 1] } : {}}
                        transition={{ duration: 0.8, repeat: Infinity }}
                      />

                      {/* Icon */}
                      <div className="flex items-center gap-2 mb-1.5">
                        <div style={{ color: statusColor }}>{node.icon}</div>
                        <div className="font-rajdhani font-bold text-sm" style={{ color: '#f0f0f5' }}>
                          {node.label}
                        </div>
                      </div>

                      {/* Status */}
                      <div className="font-mono-tech" style={{ fontSize: 9, color: statusColor, letterSpacing: '0.1em' }}>
                        {STATUS_LABEL[node.status]}
                      </div>

                      {/* Quick metrics */}
                      {node.metrics && (
                        <div className="flex gap-2 mt-1.5 flex-wrap">
                          {node.metrics.latency && (
                            <span className="font-mono-tech" style={{ fontSize: 9, color: '#94a3b8' }}>
                              {node.metrics.latency}
                            </span>
                          )}
                          {node.metrics.cpu && (
                            <span className="font-mono-tech" style={{ fontSize: 9, color: '#6b7280' }}>
                              CPU {node.metrics.cpu}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </ZoomPanCanvas>
      </div>

      {/* Detail panel */}
      {selected && (
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
          <div className="text-xs font-mono-tech tracking-widest mb-3" style={{ color: '#94a3b8' }}>NODE DETAIL</div>

          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center gap-2">
              <div style={{ color: STATUS_COLOR[selected.status] }}>{selected.icon}</div>
              <div>
                <div className="font-rajdhani font-bold text-base" style={{ color: '#f0f0f5' }}>{selected.label}</div>
                <div className="font-mono-tech" style={{ fontSize: 10, color: STATUS_COLOR[selected.status] }}>
                  {STATUS_LABEL[selected.status]}
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <div className="text-xs font-mono-tech mb-1" style={{ color: '#94a3b8' }}>DESCRIPTION</div>
              <div className="text-xs leading-relaxed" style={{ color: '#d1d5db' }}>{selected.detail}</div>
            </div>

            {/* Type */}
            <div>
              <div className="text-xs font-mono-tech mb-1" style={{ color: '#94a3b8' }}>TYPE</div>
              <span className="px-2 py-0.5 rounded text-xs font-mono-tech"
                style={{ background: TYPE_BG[selected.type], border: `1px solid ${TYPE_BORDER[selected.type]}`, color: '#b8bdd0' }}>
                {selected.type}
              </span>
            </div>

            {/* Metrics */}
            {selected.metrics && (
              <div>
                <div className="text-xs font-mono-tech mb-2" style={{ color: '#94a3b8' }}>METRICS</div>
                <div className="space-y-1.5">
                  {selected.metrics.cpu && <MetricRow label="CPU" value={selected.metrics.cpu} />}
                  {selected.metrics.mem && <MetricRow label="Memory" value={selected.metrics.mem} />}
                  {selected.metrics.latency && <MetricRow label="Latency" value={selected.metrics.latency} />}
                  {selected.metrics.uptime && <MetricRow label="Uptime" value={selected.metrics.uptime} />}
                </div>
              </div>
            )}

            {/* Connections */}
            {selected.connections.length > 0 && (
              <div>
                <div className="text-xs font-mono-tech mb-1.5" style={{ color: '#94a3b8' }}>CONNECTS TO</div>
                <div className="flex flex-wrap gap-1">
                  {selected.connections.map(c => (
                    <span key={c} className="px-1.5 py-0.5 rounded text-xs font-mono-tech"
                      style={{ background: 'rgba(255,255,255,0.06)', color: '#b8bdd0' }}>
                      {nodeMap[c]?.label ?? c}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}

function MetricRow({ label, value }: { label: string; value: string }) {
  const isAlert = value === 'TIMEOUT' || value === '0%' || value === '0MB';
  return (
    <div className="flex items-center justify-between py-1" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
      <span className="text-xs" style={{ color: '#6b7280' }}>{label}</span>
      <span className="text-xs font-mono-tech font-semibold" style={{ color: isAlert ? '#f87171' : '#e2e8f0' }}>
        {value}
      </span>
    </div>
  );
}
