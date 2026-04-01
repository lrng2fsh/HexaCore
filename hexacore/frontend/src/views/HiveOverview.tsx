import React from 'react';
import { motion } from 'framer-motion';
import { HoneycombGrid } from '../components/hex/HoneycombGrid';
import { ZoomPanCanvas } from '../components/ZoomPanCanvas';
import { Agent, MOCK_WORKFLOW } from '../lib/mockData';
import { Activity, Zap, AlertTriangle, CheckCircle } from 'lucide-react';

interface HiveOverviewProps {
  agents: Agent[];
  selectedAgent: Agent | null;
  onSelectAgent: (agent: Agent) => void;
  isAnime?: boolean;
}

export function HiveOverview({ agents, selectedAgent, onSelectAgent, isAnime = false }: HiveOverviewProps) {
  const wf = MOCK_WORKFLOW;
  const done = wf.nodes.filter(n => n.status === 'done').length;
  const running = wf.nodes.filter(n => n.status === 'running').length;
  const busyAgents = agents.filter(a => a.status === 'busy').length;

  return (
    <div className="flex flex-col h-full">
      {/* Status strip */}
      <div
        className="flex items-center gap-4 px-6 py-3 flex-shrink-0"
        style={{ borderBottom: `1px solid ${isAnime ? 'rgba(0,255,240,0.1)' : 'rgba(245,158,11,0.08)'}` }}
      >
        <div className={`text-xs tracking-widest ${isAnime ? 'font-mono-tech' : 'font-mono'}`}
          style={{ color: 'color-mix(in srgb, var(--hive-accent) 40%, transparent)' }}>
          {isAnime ? 'ハイブ概要 / HIVE OVERVIEW' : 'HIVE OVERVIEW'}
        </div>
        <div className="flex-1" />
        <StatusChip icon={<Activity size={11} />} label="Active Agents" value={busyAgents} color="#f59e0b" />
        <StatusChip icon={<Zap size={11} />} label="Running Tasks" value={running} color="#8b5cf6" />
        <StatusChip icon={<CheckCircle size={11} />} label="Completed" value={done} color="#10b981" />
        <StatusChip icon={<AlertTriangle size={11} />} label="Risk" value={wf.riskLevel} color="#f97316" />
      </div>

      {/* Main hive grid — lighter radial bg so cells pop */}
      <div
        className="flex-1 relative overflow-hidden"
        style={{
          background: 'radial-gradient(ellipse 70% 70% at center, rgba(70,65,95,0.55) 0%, rgba(40,38,55,0.35) 55%, transparent 100%)',
        }}
      >
        {/* Ambient particles */}
        <ParticleField />

        {/* Centered hive grid */}
        <ZoomPanCanvas className="h-full w-full">
          <div className="flex items-center justify-center h-full w-full">
            <HoneycombGrid
              agents={agents}
              selectedAgent={selectedAgent}
              onSelectAgent={onSelectAgent}
            />
          </div>
        </ZoomPanCanvas>

        {/* Title + progress — top left */}
        <div className="absolute top-4 left-6 z-20 flex flex-col gap-2">
          <div className="text-sm font-mono-tech tracking-widest" style={{ color: '#e2e8f0' }}>
            {wf.name}
          </div>
          <div className="flex items-center gap-3">
            <div className="w-36 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #d97706, #f59e0b, #fbbf24)' }}
                initial={{ width: 0 }}
                animate={{ width: `${wf.progress}%` }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
              />
            </div>
            <span className="text-xs font-mono-tech" style={{ color: '#fbbf24' }}>{wf.progress}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusChip({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) {
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded" style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)' }}>
      <span style={{ color }}>{icon}</span>
      <span className="text-xs" style={{ color: '#b8bdd0' }}>{label}</span>
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
