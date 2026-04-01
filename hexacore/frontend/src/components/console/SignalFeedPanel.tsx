import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, MessageSquare, ScrollText, Package, Terminal, ChevronUp, ChevronDown } from 'lucide-react';
import { HiveMessage, Artifact, MOCK_MESSAGES, MOCK_ARTIFACTS } from '../../lib/mockData';

type ConsoleTab = 'signals' | 'messages' | 'logs' | 'artifacts';

const MSG_TYPE_COLOR: Record<string, string> = {
  finding: '#3b82f6', handoff: '#8b5cf6', result: '#10b981',
  risk: '#ef4444', question: '#f59e0b', approval_request: '#f97316',
};

const MOCK_LOGS = [
  { ts: new Date(Date.now() - 8 * 60000).toISOString(), level: 'INFO', ctx: 'Orchestrator', msg: 'Hexacore initialized — 5 agents loaded' },
  { ts: new Date(Date.now() - 7 * 60000).toISOString(), level: 'INFO', ctx: 'Queen', msg: 'Task submitted: Fix export failure in QA' },
  { ts: new Date(Date.now() - 7 * 60000).toISOString(), level: 'INFO', ctx: 'WorkflowEngine', msg: 'Created workflow wf-001 — 5 nodes' },
  { ts: new Date(Date.now() - 6 * 60000).toISOString(), level: 'INFO', ctx: 'AppAgent', msg: 'Analyzing code — scanning ExportService.ts' },
  { ts: new Date(Date.now() - 6 * 60000).toISOString(), level: 'INFO', ctx: 'DBAAgent', msg: 'Querying schema — checking exports table' },
  { ts: new Date(Date.now() - 5 * 60000).toISOString(), level: 'WARN', ctx: 'AppAgent', msg: 'Null reference identified at ExportService.ts:142' },
  { ts: new Date(Date.now() - 5 * 60000).toISOString(), level: 'WARN', ctx: 'DBAAgent', msg: 'Missing index on exports(status) — full table scan detected' },
  { ts: new Date(Date.now() - 3 * 60000).toISOString(), level: 'INFO', ctx: 'QAAgent', msg: 'Bug reproduced — test_export_empty_order confirmed' },
  { ts: new Date(Date.now() - 60000).toISOString(), level: 'INFO', ctx: 'BuildAgent', msg: 'Build successful — 44/44 tests passing' },
  { ts: new Date(Date.now() - 45000).toISOString(), level: 'INFO', ctx: 'QAAgent', msg: 'Validation started — running regression suite' },
  { ts: new Date(Date.now() - 20000).toISOString(), level: 'INFO', ctx: 'QAAgent', msg: '38/44 regression tests passed — 6 remaining' },
];

interface SignalFeedPanelProps {
  collapsed: boolean;
  onToggle: () => void;
  isAnime?: boolean;
}

export function SignalFeedPanel({ collapsed, onToggle, isAnime = false }: SignalFeedPanelProps) {
  const [tab, setTab] = useState<ConsoleTab>('signals');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [tab]);

  const TABS = [
    { id: 'signals' as ConsoleTab, icon: <Radio size={12} />, label: 'Signals', count: MOCK_MESSAGES.length },
    { id: 'messages' as ConsoleTab, icon: <MessageSquare size={12} />, label: 'Messages', count: MOCK_MESSAGES.length },
    { id: 'logs' as ConsoleTab, icon: <ScrollText size={12} />, label: 'Logs', count: MOCK_LOGS.length },
    { id: 'artifacts' as ConsoleTab, icon: <Package size={12} />, label: 'Artifacts', count: MOCK_ARTIFACTS.length },
  ];

  return (
    <div
      className={`flex flex-col backdrop-blur-sm transition-all duration-300 flex-shrink-0 ${collapsed ? 'h-10' : 'h-52'}`}
      style={{
        borderTop: `1px solid ${isAnime ? 'rgba(0,255,240,0.15)' : 'color-mix(in srgb, var(--hive-accent) 12%, transparent)'}`,
        background: isAnime ? 'rgba(2,4,10,0.97)' : 'color-mix(in srgb, var(--hive-bg) 95%, transparent)',
      }}
    >
      {/* Tab bar */}
      <div className="flex items-center h-9 px-3 gap-1 flex-shrink-0"
        style={{ borderBottom: `1px solid color-mix(in srgb, var(--hive-accent) 10%, transparent)` }}>
        <div className="flex items-center gap-0.5 flex-1">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); if (collapsed) onToggle(); }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition-colors ${isAnime ? 'font-mono-tech' : 'font-mono'}`}
              style={{
                background: tab === t.id && !collapsed ? 'var(--hive-accent-muted)' : 'transparent',
                color: tab === t.id && !collapsed ? '#f0f0f5' : '#7c8499',
                border: `1px solid ${tab === t.id && !collapsed ? 'color-mix(in srgb, var(--hive-accent) 25%, transparent)' : 'transparent'}`,
                borderBottom: tab === t.id && !collapsed ? '1px solid var(--hive-accent)' : undefined,
              }}
            >
              {t.icon}
              <span>{t.label}</span>
              <span className="text-xs font-mono" style={{ color: tab === t.id && !collapsed ? '#fbbf24' : '#4b5563' }}>
                {t.count}
              </span>
            </button>
          ))}
        </div>

        {/* Live pulse */}
        <div className="flex items-center gap-1.5 mr-2">
          <motion.div
            className="w-1 h-1 rounded-full bg-amber-500"
            animate={{ opacity: [1, 0.2, 1] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          />
          <span className="text-xs font-mono text-amber-700/60">LIVE</span>
        </div>

        <button onClick={onToggle} className="text-slate-600 hover:text-slate-400 transition-colors">
          {collapsed ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {/* Content */}
      {!collapsed && (
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          {tab === 'signals' && <SignalsView />}
          {tab === 'messages' && <MessagesView />}
          {tab === 'logs' && <LogsView />}
          {tab === 'artifacts' && <ArtifactsView />}
          <div ref={bottomRef} />
        </div>
      )}
    </div>
  );
}

function SignalsView() {
  return (
    <div className="space-y-1">
      {[...MOCK_MESSAGES].reverse().map((m, i) => (
        <motion.div
          key={m.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.03 }}
          className="flex items-start gap-2.5 py-1.5 border-b"
          style={{ borderColor: 'rgba(255,255,255,0.06)' }}
        >
          <span className="text-xs font-mono flex-shrink-0 mt-0.5" style={{ color: '#6b7280' }}>
            {new Date(m.timestamp).toLocaleTimeString()}
          </span>
          <span className="px-1.5 py-0.5 rounded text-xs font-mono font-semibold flex-shrink-0"
            style={{ background: `${MSG_TYPE_COLOR[m.type]}22`, color: MSG_TYPE_COLOR[m.type] }}>
            {m.type}
          </span>
          <span className="text-xs flex-shrink-0" style={{ color: '#fbbf24' }}>{m.from}</span>
          <span className="text-xs" style={{ color: '#6b7280' }}>→</span>
          <span className="text-xs flex-shrink-0" style={{ color: '#94a3b8' }}>{m.to}</span>
          <span className="text-xs truncate" style={{ color: '#e2e8f0' }}>{m.content}</span>
        </motion.div>
      ))}
    </div>
  );
}

function MessagesView() {
  return (
    <div className="space-y-1">
      {MOCK_MESSAGES.map((m, i) => (
        <motion.div
          key={m.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.04 }}
          className="flex items-start gap-2 py-1"
        >
          <div className="w-1 h-1 rounded-full mt-1.5 flex-shrink-0" style={{ background: MSG_TYPE_COLOR[m.type] }} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-xs font-mono" style={{ color: '#fbbf24' }}>{m.from}</span>
              <span className="text-xs" style={{ color: '#6b7280' }}>→</span>
              <span className="text-xs font-mono" style={{ color: '#94a3b8' }}>{m.to}</span>
              <span className="text-xs font-mono ml-auto" style={{ color: MSG_TYPE_COLOR[m.type] }}>{m.type}</span>
            </div>
            <div className="text-xs truncate" style={{ color: '#d1d5db' }}>{m.content}</div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function LogsView() {
  const LEVEL_COLOR: Record<string, string> = { INFO: '#94a3b8', WARN: '#fbbf24', ERROR: '#f87171', DEBUG: '#a78bfa' };
  return (
    <div className="space-y-0.5 font-mono">
      {MOCK_LOGS.map((l, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.02 }}
          className="flex items-start gap-2 text-xs py-0.5"
        >
          <span className="flex-shrink-0" style={{ color: '#6b7280' }}>{new Date(l.ts).toLocaleTimeString()}</span>
          <span className="flex-shrink-0 w-10" style={{ color: LEVEL_COLOR[l.level] }}>{l.level}</span>
          <span className="flex-shrink-0" style={{ color: '#a78bfa' }}>[{l.ctx}]</span>
          <span style={{ color: '#d1d5db' }}>{l.msg}</span>
        </motion.div>
      ))}
    </div>
  );
}

function ArtifactsView() {
  const TYPE_COLOR: Record<string, string> = {
    report: '#3b82f6', schema: '#8b5cf6', log: '#6b7280', build: '#f59e0b', test: '#10b981', code: '#06b6d4',
  };
  return (
    <div className="flex flex-wrap gap-2">
      {MOCK_ARTIFACTS.map((a, i) => (
        <motion.div
          key={a.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.05 }}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded cursor-pointer transition-colors"
          style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)' }}
        >
          <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: TYPE_COLOR[a.type] }} />
          <span className="text-xs font-mono" style={{ color: '#e2e8f0' }}>{a.name}</span>
          <span className="text-xs" style={{ color: '#6b7280' }}>{a.size}</span>
        </motion.div>
      ))}
    </div>
  );
}
