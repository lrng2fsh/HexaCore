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
  idle: { color: '#94a3b8', label: 'IDLE', bg: 'rgba(148,163,184,0.1)' },
  busy: { color: '#fbbf24', label: 'ACTIVE', bg: 'rgba(251,191,36,0.1)' },
  done: { color: '#34d399', label: 'DONE', bg: 'rgba(52,211,153,0.1)' },
  error: { color: '#f87171', label: 'ERROR', bg: 'rgba(248,113,113,0.1)' },
  offline: { color: '#374151', label: 'OFFLINE', bg: 'rgba(31,41,55,0.1)' },
  thinking: { color: '#a78bfa', label: 'THINKING', bg: 'rgba(167,139,250,0.1)' },
};

interface WorkerBeesProps {
  onSelectAgent: (agent: Agent) => void;
  selectedAgent: Agent | null;
  isAnime?: boolean;
}

export function WorkerBees({ onSelectAgent, selectedAgent, isAnime = false }: WorkerBeesProps) {
  const workers = MOCK_AGENTS.filter(a => !a.isQueen);

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className={`text-xs tracking-widest mb-6 ${isAnime ? 'font-mono-tech' : 'font-mono'}`}
        style={{ color: 'color-mix(in srgb, var(--hive-accent) 40%, transparent)' }}>
        {isAnime ? '働き蜂 / WORKER BEES' : 'WORKER BEES — SPECIALIST CELLS'}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {workers.map((agent, i) => (
          <WorkerBeeCard
            key={agent.id}
            agent={agent}
            index={i}
            isSelected={selectedAgent?.id === agent.id}
            onClick={() => onSelectAgent(agent)}
            isAnime={isAnime}
          />
        ))}
      </div>
    </div>
  );
}

function WorkerBeeCard({ agent, index, isSelected, onClick, isAnime = false }: {
  agent: Agent; index: number; isSelected: boolean; onClick: () => void; isAnime?: boolean;
}) {
  const cfg = STATUS_CONFIG[agent.status] ?? STATUS_CONFIG.idle;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      onClick={onClick}
      className="relative rounded cursor-pointer overflow-hidden transition-all duration-200"
      style={{
        borderColor: isSelected ? `${cfg.color}60` : isAnime ? 'rgba(0,255,240,0.1)' : 'rgba(30,30,46,0.8)',
        border: `1px solid ${isSelected ? `${cfg.color}60` : isAnime ? 'rgba(0,255,240,0.1)' : 'rgba(30,30,46,0.8)'}`,
        background: isSelected ? cfg.bg : isAnime ? 'rgba(5,8,16,0.9)' : 'rgba(17,17,24,0.8)',
        boxShadow: isSelected ? `0 0 20px ${cfg.color}22` : 'none',
      }}
      whileHover={{ scale: 1.01 }}
    >
      {/* Anime corner brackets */}
      {isAnime && (
        <>
          <div className="absolute top-0 left-0 w-3 h-3 border-t border-l" style={{ borderColor: 'var(--hive-accent)', opacity: 0.6 }} />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r" style={{ borderColor: 'var(--hive-accent)', opacity: 0.6 }} />
        </>
      )}
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
              <span className="font-semibold" style={{ color: '#f0f0f5', fontWeight: 700, fontSize: 15 }}>{agent.name}</span>
              <span className="text-xs font-mono px-1.5 py-0.5 rounded"
                style={{ background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
            </div>
            <div className="text-xs truncate mt-0.5" style={{ color: '#94a3b8' }}>{agent.role}</div>
          </div>
        </div>

        {/* Current task */}
        {agent.currentTask ? (
          <div className="text-xs rounded p-2 mb-3 border leading-relaxed" style={{ color: '#d1d5db', background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' }}>
            {agent.currentTask}
          </div>
        ) : (
          <div className="text-xs rounded p-2 mb-3 border" style={{ color: '#6b7280', background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)' }}>
            Awaiting assignment
          </div>
        )}

        {/* Model + tools */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-mono px-2 py-0.5 rounded" style={{ color: '#b8bdd0', background: 'rgba(255,255,255,0.06)' }}>{agent.model}</span>
          {agent.tools.map(t => (
            <span key={t} className="text-xs font-mono px-1.5 py-0.5 rounded border" style={{ color: '#fbbf24', background: 'rgba(251,191,36,0.08)', borderColor: 'rgba(251,191,36,0.2)' }}>
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
        <div className="flex items-center gap-3 pt-2 border-t" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-1 text-xs" style={{ color: '#94a3b8' }}>
            <MessageSquare size={10} />
            <span>{agent.messagesCount}</span>
          </div>
          <div className="flex items-center gap-1 text-xs" style={{ color: '#94a3b8' }}>
            <Package size={10} />
            <span>{agent.outputCount}</span>
          </div>
          <div className="flex-1" />
          <div className="flex flex-wrap gap-1">
            {agent.skills.slice(0, 2).map(s => (
              <span key={s} className="px-1.5 py-0.5 rounded" style={{ fontSize: 9, color: '#b8bdd0', background: 'rgba(255,255,255,0.06)' }}>
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
