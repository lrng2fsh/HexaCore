import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Crown, Cpu, Database, TestTube, Hammer, Zap, MessageSquare, Package, Shield, ChevronRight } from 'lucide-react';
import { Agent, HiveMessage, MOCK_MESSAGES, MOCK_ARTIFACTS } from '../../lib/mockData';

const AGENT_ICONS: Record<string, React.ReactNode> = {
  queen: <Crown size={16} className="text-amber-400" />,
  'app-agent': <Cpu size={16} className="text-blue-400" />,
  'dba-agent': <Database size={16} className="text-purple-400" />,
  'qa-agent': <TestTube size={16} className="text-green-400" />,
  'build-agent': <Hammer size={16} className="text-orange-400" />,
};

const STATUS_COLOR: Record<string, string> = {
  idle: '#6b7280', busy: '#f59e0b', done: '#10b981',
  error: '#ef4444', offline: '#374151', thinking: '#8b5cf6',
};

const MSG_TYPE_COLOR: Record<string, string> = {
  finding: '#3b82f6', handoff: '#8b5cf6', result: '#10b981',
  risk: '#ef4444', question: '#f59e0b', approval_request: '#f97316',
};

interface HiveInspectorProps {
  agent: Agent | null;
  onClose: () => void;
}

export function HiveInspector({ agent, onClose }: HiveInspectorProps) {
  const [tab, setTab] = useState<'overview' | 'messages' | 'artifacts' | 'permissions'>('overview');

  const agentMessages = MOCK_MESSAGES.filter(m => m.from === agent?.id || m.to === agent?.id);
  const agentArtifacts = MOCK_ARTIFACTS.filter(a => a.agent === agent?.id);

  return (
    <AnimatePresence>
      {agent && (
        <motion.div
          key="inspector"
          initial={{ x: 320, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 320, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="flex flex-col w-72 h-full border-l border-amber-900/20 bg-hive-bg/95 backdrop-blur-sm relative z-40 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-amber-900/20">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="flex-shrink-0">
                {AGENT_ICONS[agent.id] ?? <Zap size={16} className="text-slate-400" />}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-slate-100 truncate">{agent.name}</div>
                <div className="text-xs text-slate-500 truncate">{agent.role}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: STATUS_COLOR[agent.status] }} />
                <span className="text-xs font-mono" style={{ color: STATUS_COLOR[agent.status] }}>
                  {agent.status.toUpperCase()}
                </span>
              </div>
              <button onClick={onClose} className="text-slate-600 hover:text-slate-300 transition-colors ml-1">
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-amber-900/20">
            {(['overview', 'messages', 'artifacts', 'permissions'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2 text-xs font-medium transition-colors capitalize ${
                  tab === t ? 'text-amber-400 border-b border-amber-500' : 'text-slate-600 hover:text-slate-400'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {tab === 'overview' && <OverviewTab agent={agent} />}
            {tab === 'messages' && <MessagesTab messages={agentMessages} agentId={agent.id} />}
            {tab === 'artifacts' && <ArtifactsTab artifacts={agentArtifacts} />}
            {tab === 'permissions' && <PermissionsTab agent={agent} />}
          </div>

          {/* Glow line */}
          <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-amber-600/20 to-transparent" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function OverviewTab({ agent }: { agent: Agent }) {
  return (
    <div className="p-4 space-y-4">
      {/* Confidence */}
      <Section title="CONFIDENCE">
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-amber-500"
              initial={{ width: 0 }}
              animate={{ width: `${agent.confidence}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
          <span className="text-xs font-mono text-amber-400">{agent.confidence}%</span>
        </div>
      </Section>

      {/* Model */}
      <Section title="LLM MODEL">
        <div className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-800/50 rounded border border-slate-700/50">
          <Zap size={12} className="text-amber-500" />
          <span className="text-xs font-mono text-slate-300">{agent.model}</span>
        </div>
      </Section>

      {/* Current task */}
      {agent.currentTask && (
        <Section title="CURRENT TASK">
          <div className="text-xs text-slate-300 leading-relaxed bg-amber-900/10 border border-amber-900/20 rounded p-2.5">
            {agent.currentTask}
          </div>
        </Section>
      )}

      {/* Tools */}
      <Section title="TOOLS">
        {agent.tools.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {agent.tools.map(t => (
              <span key={t} className="px-2 py-0.5 bg-slate-800 border border-slate-700/50 rounded text-xs text-slate-400 font-mono">
                {t}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-xs text-slate-600">No tools assigned</span>
        )}
      </Section>

      {/* Skills */}
      <Section title="SKILLS">
        <div className="flex flex-wrap gap-1.5">
          {agent.skills.map(s => (
            <span key={s} className="px-2 py-0.5 bg-amber-900/15 border border-amber-900/25 rounded text-xs text-amber-600/80">
              {s}
            </span>
          ))}
        </div>
      </Section>

      {/* Stats */}
      <Section title="ACTIVITY">
        <div className="grid grid-cols-2 gap-2">
          <StatCard label="Messages" value={agent.messagesCount} color="#3b82f6" />
          <StatCard label="Outputs" value={agent.outputCount} color="#10b981" />
        </div>
      </Section>
    </div>
  );
}

function MessagesTab({ messages, agentId }: { messages: HiveMessage[]; agentId: string }) {
  return (
    <div className="p-3 space-y-2">
      {messages.length === 0 ? (
        <div className="text-xs text-slate-600 text-center py-8">No messages yet</div>
      ) : (
        messages.map(m => (
          <div key={m.id} className="p-2.5 rounded border border-slate-800 bg-slate-900/50">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-1.5 py-0.5 rounded text-xs font-mono font-semibold"
                style={{ background: `${MSG_TYPE_COLOR[m.type]}22`, color: MSG_TYPE_COLOR[m.type] }}>
                {m.type}
              </span>
              <span className="text-xs text-slate-600 ml-auto">
                {new Date(m.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-500 mb-1.5">
              <span className={m.from === agentId ? 'text-amber-600' : 'text-slate-500'}>{m.from}</span>
              <ChevronRight size={10} />
              <span className={m.to === agentId ? 'text-amber-600' : 'text-slate-500'}>{m.to}</span>
            </div>
            <div className="text-xs text-slate-300 leading-relaxed">{m.content}</div>
          </div>
        ))
      )}
    </div>
  );
}

function ArtifactsTab({ artifacts }: { artifacts: typeof MOCK_ARTIFACTS }) {
  const TYPE_ICON: Record<string, string> = {
    report: '📄', schema: '🗄️', log: '📋', build: '📦', test: '🧪', code: '💻',
  };
  return (
    <div className="p-3 space-y-2">
      {artifacts.length === 0 ? (
        <div className="text-xs text-slate-600 text-center py-8">No artifacts yet</div>
      ) : (
        artifacts.map(a => (
          <div key={a.id} className="flex items-center gap-2.5 p-2.5 rounded border border-slate-800 bg-slate-900/50 hover:border-amber-900/30 transition-colors cursor-pointer">
            <span className="text-base">{TYPE_ICON[a.type] ?? '📄'}</span>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-slate-200 truncate font-mono">{a.name}</div>
              <div className="text-xs text-slate-600">{a.size} · {new Date(a.timestamp).toLocaleTimeString()}</div>
            </div>
            <Package size={12} className="text-slate-600 flex-shrink-0" />
          </div>
        ))
      )}
    </div>
  );
}

function PermissionsTab({ agent }: { agent: Agent }) {
  const perms = [
    { label: 'Read Files', granted: agent.tools.includes('file') || agent.id === 'app-agent' },
    { label: 'Write Files', granted: agent.tools.includes('file') },
    { label: 'Execute Commands', granted: agent.id === 'qa-agent' || agent.id === 'build-agent' },
    { label: 'Database Access', granted: agent.tools.includes('sql') },
    { label: 'Approve Tasks', granted: agent.isQueen === true },
    { label: 'Deploy', granted: agent.id === 'build-agent' },
  ];
  return (
    <div className="p-4 space-y-2">
      {perms.map(p => (
        <div key={p.label} className="flex items-center justify-between py-1.5 border-b border-slate-800/50">
          <div className="flex items-center gap-2">
            <Shield size={12} className={p.granted ? 'text-emerald-500' : 'text-slate-700'} />
            <span className="text-xs text-slate-400">{p.label}</span>
          </div>
          <span className={`text-xs font-mono ${p.granted ? 'text-emerald-500' : 'text-slate-700'}`}>
            {p.granted ? 'GRANTED' : 'DENIED'}
          </span>
        </div>
      ))}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs font-mono text-amber-700/70 tracking-widest mb-2">{title}</div>
      {children}
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex flex-col items-center py-2 bg-slate-900/50 rounded border border-slate-800">
      <span className="text-lg font-bold" style={{ color }}>{value}</span>
      <span className="text-xs text-slate-600">{label}</span>
    </div>
  );
}
