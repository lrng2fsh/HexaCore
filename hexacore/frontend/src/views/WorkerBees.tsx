import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, Cpu, Database, TestTube, Hammer, Zap, MessageSquare, Package } from 'lucide-react';
import { Agent, MOCK_AGENTS } from '../lib/mockData';

const AGENT_ICONS: Record<string, React.ReactNode> = {
  queen: <Crown size={20} className="text-amber-400" />,
  'app-agent': <Cpu size={20} className="text-blue-400" />,
  'dba-agent': <Database size={20} className="text-purple-400" />,
  'qa-agent': <TestTube size={20} className="text-green-400" />,
  'build-agent': <Hammer size={20} className="text-orange-400" />,
};

const STATUS_CONFIG: Record<string, { color: string; label: string; bg: string }> = {
  idle: { color: '#6b7280', label: 'IDLE', bg: 'rgba(55,65,81,0.15)' },
  busy: { color: '#f59e0b', label: 'ACTIVE', bg: 'rgba(245,158,11,0.1)' },
  done: { color: '#10b981', label: 'DONE', bg: 'rgba(16,185,129,0.1)' },
  error: { color: '#ef4444', label: 'ERROR', bg: 'rgba(239,68,68,0.1)' },
  offline: { color: '#374151', label: 'OFFLINE', bg: 'rgba(31,41,55,0.1)' },
  thinking: { color: '#8b5cf6', label: 'THINKING', bg: 'rgba(139,92,246,0.1)' },
};

interface WorkerBeesProps {
  onSelectAgent: (agent: Agent) => void;
  selectedAgent: Agent | null;
}

export function WorkerBees({ onSelectAgent, selectedAgent }: WorkerBeesProps) {
  const workers = MOCK_AGENTS.filter(a => !a.isQueen);

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="text-xs font-mono text-amber-700/50 tracking-widest mb-6">WORKER BEES — SPECIALIST CELLS</div>

      <div className="grid grid-cols-2 gap-4">
        {workers.map((agent, i) => (
          <WorkerBeeCard
            key={agent.id}
            agent={agent}
            index={i}
            isSelected={selectedAgent?.id === agent.id}
            onClick={() => onSelectAgent(agent)}
          />
        ))}
      </div>
    </div>
  );
}

function WorkerBeeCard({ agent, index, isSelected, onClick }: {
  agent: Agent; index: number; isSelected: boolean; onClick: () => void;
}) {
  const cfg = STATUS_CONFIG[agent.status] ?? STATUS_CONFIG.idle;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      onClick={onClick}
      className="relative rounded-lg border cursor-pointer overflow-hidden transition-all duration-200"
      style={{
        borderColor: isSelected ? `${cfg.color}60` : 'rgba(30,30,46,0.8)',
        background: isSelected ? cfg.bg : 'rgba(17,17,24,0.8)',
        boxShadow: isSelected ? `0 0 20px ${cfg.color}22` : 'none',
      }}
      whileHover={{ scale: 1.01, borderColor: `${cfg.color}40` }}
    >
      {/* Hex accent top-right */}
      <div className="absolute top-0 right-0 w-16 h-16 opacity-5"
        style={{ background: `radial-gradient(circle at top right, ${cfg.color}, transparent)` }} />

      {/* Active pulse */}
      {agent.status === 'busy' && (
        <motion.div
          className="absolute inset-0 rounded-lg"
          style={{ border: `1px solid ${cfg.color}33` }}
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ background: `${cfg.color}15`, border: `1px solid ${cfg.color}30` }}>
            {AGENT_ICONS[agent.id] ?? <Zap size={20} />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-100">{agent.name}</span>
              <span className="text-xs font-mono px-1.5 py-0.5 rounded"
                style={{ background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
            </div>
            <div className="text-xs text-slate-500 truncate mt-0.5">{agent.role}</div>
          </div>
        </div>

        {/* Current task */}
        {agent.currentTask ? (
          <div className="text-xs text-slate-400 bg-slate-900/60 rounded p-2 mb-3 border border-slate-800/50 leading-relaxed">
            {agent.currentTask}
          </div>
        ) : (
          <div className="text-xs text-slate-700 bg-slate-900/30 rounded p-2 mb-3 border border-slate-800/30">
            Awaiting assignment
          </div>
        )}

        {/* Model + tools */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-mono text-slate-600 bg-slate-800/50 px-2 py-0.5 rounded">{agent.model}</span>
          {agent.tools.map(t => (
            <span key={t} className="text-xs font-mono text-amber-700/70 bg-amber-900/10 px-1.5 py-0.5 rounded border border-amber-900/20">
              {t}
            </span>
          ))}
        </div>

        {/* Confidence bar */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
            <motion.div className="h-full rounded-full"
              style={{ background: cfg.color }}
              initial={{ width: 0 }}
              animate={{ width: `${agent.confidence}%` }}
              transition={{ delay: 0.3 + index * 0.1, duration: 0.8 }} />
          </div>
          <span className="text-xs font-mono" style={{ color: cfg.color }}>{agent.confidence}%</span>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 pt-2 border-t border-slate-800/50">
          <div className="flex items-center gap-1 text-xs text-slate-600">
            <MessageSquare size={10} />
            <span>{agent.messagesCount}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-600">
            <Package size={10} />
            <span>{agent.outputCount}</span>
          </div>
          <div className="flex-1" />
          <div className="flex flex-wrap gap-1">
            {agent.skills.slice(0, 2).map(s => (
              <span key={s} className="text-xs text-amber-700/50 bg-amber-900/10 px-1.5 py-0.5 rounded" style={{ fontSize: 9 }}>
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
