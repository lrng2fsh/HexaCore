import React from 'react';
import { motion } from 'framer-motion';
import { HoneycombGrid } from '../components/hex/HoneycombGrid';
import { Agent, MOCK_WORKFLOW } from '../lib/mockData';
import { Activity, Zap, AlertTriangle, CheckCircle } from 'lucide-react';

interface HiveOverviewProps {
  agents: Agent[];
  selectedAgent: Agent | null;
  onSelectAgent: (agent: Agent) => void;
}

export function HiveOverview({ agents, selectedAgent, onSelectAgent }: HiveOverviewProps) {
  const wf = MOCK_WORKFLOW;
  const done = wf.nodes.filter(n => n.status === 'done').length;
  const running = wf.nodes.filter(n => n.status === 'running').length;
  const busyAgents = agents.filter(a => a.status === 'busy').length;

  return (
    <div className="flex flex-col h-full">
      {/* Status strip */}
      <div className="flex items-center gap-4 px-6 py-3 border-b border-amber-900/15">
        <div className="text-xs font-mono text-amber-700/60 tracking-widest">HIVE OVERVIEW</div>
        <div className="flex-1" />
        <StatusChip icon={<Activity size={11} />} label="Active Agents" value={busyAgents} color="#f59e0b" />
        <StatusChip icon={<Zap size={11} />} label="Running Tasks" value={running} color="#8b5cf6" />
        <StatusChip icon={<CheckCircle size={11} />} label="Completed" value={done} color="#10b981" />
        <StatusChip icon={<AlertTriangle size={11} />} label="Risk" value={wf.riskLevel} color="#f97316" />
      </div>

      {/* Main hive grid */}
      <div className="flex-1 relative overflow-hidden">
        {/* Ambient particles */}
        <ParticleField />

        {/* Center label */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
          <div className="text-xs font-mono text-amber-700/40 tracking-widest text-center">
            {wf.name}
          </div>
        </div>

        <HoneycombGrid
          agents={agents}
          selectedAgent={selectedAgent}
          onSelectAgent={onSelectAgent}
        />

        {/* Progress arc */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
          <div className="w-48 h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #d97706, #f59e0b, #fbbf24)' }}
              initial={{ width: 0 }}
              animate={{ width: `${wf.progress}%` }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
            />
          </div>
          <div className="text-xs font-mono text-amber-700/50">{wf.progress}% COMPLETE</div>
        </div>
      </div>
    </div>
  );
}

function StatusChip({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) {
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-slate-800 bg-slate-900/40">
      <span style={{ color }}>{icon}</span>
      <span className="text-xs text-slate-500">{label}</span>
      <span className="text-xs font-mono font-semibold" style={{ color }}>{value}</span>
    </div>
  );
}

function ParticleField() {
  const particles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 8,
    duration: 6 + Math.random() * 6,
    size: 1 + Math.random() * 2,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-amber-500/20"
          style={{ left: `${p.x}%`, bottom: '-4px', width: p.size, height: p.size }}
          animate={{ y: [0, -600], opacity: [0, 0.5, 0] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'linear' }}
        />
      ))}
    </div>
  );
}
