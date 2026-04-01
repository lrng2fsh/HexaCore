import React from 'react';
import { motion } from 'framer-motion';
import { Crown, AlertTriangle, CheckCircle, Clock, Zap, ChevronRight, Shield } from 'lucide-react';
import { MOCK_AGENTS, MOCK_WORKFLOW, MOCK_MESSAGES } from '../lib/mockData';

export function QueenChamber() {
  const queen = MOCK_AGENTS.find(a => a.id === 'queen')!;
  const wf = MOCK_WORKFLOW;
  const recentMessages = MOCK_MESSAGES.slice(-4).reverse();

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="text-xs font-mono text-amber-700/50 tracking-widest mb-6">QUEEN CHAMBER — THRONE ROOM</div>

      <div className="grid grid-cols-3 gap-4">
        {/* Queen status card */}
        <div className="col-span-1">
          <motion.div
            className="relative rounded-lg border border-amber-600/30 overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #1a1208 0%, #1e1500 50%, #111118 100%)' }}
            animate={{ boxShadow: ['0 0 20px rgba(245,158,11,0.1)', '0 0 40px rgba(245,158,11,0.2)', '0 0 20px rgba(245,158,11,0.1)'] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            {/* Hex pattern overlay */}
            <div className="absolute inset-0 hive-bg opacity-20" />

            <div className="relative p-5">
              {/* Crown icon */}
              <div className="flex items-center justify-center mb-4">
                <motion.div
                  className="relative"
                  animate={{ filter: ['drop-shadow(0 0 8px #f59e0b44)', 'drop-shadow(0 0 20px #f59e0b88)', 'drop-shadow(0 0 8px #f59e0b44)'] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <div className="w-16 h-16 rounded-full border border-amber-600/40 flex items-center justify-center"
                    style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.15) 0%, transparent 70%)' }}>
                    <Crown size={28} className="text-amber-400" />
                  </div>
                  {/* Pulse rings */}
                  {[1, 2].map(i => (
                    <motion.div
                      key={i}
                      className="absolute inset-0 rounded-full border border-amber-500/20"
                      animate={{ scale: [1, 1.5 + i * 0.3], opacity: [0.4, 0] }}
                      transition={{ duration: 2, delay: i * 0.6, repeat: Infinity }}
                    />
                  ))}
                </motion.div>
              </div>

              <div className="text-center mb-4">
                <div className="text-base font-bold text-amber-300 mb-0.5">Queen</div>
                <div className="text-xs text-slate-500">{queen.role}</div>
                <div className="flex items-center justify-center gap-1.5 mt-2">
                  <motion.div className="w-1.5 h-1.5 rounded-full bg-amber-400"
                    animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1, repeat: Infinity }} />
                  <span className="text-xs font-mono text-amber-500">ORCHESTRATING</span>
                </div>
              </div>

              <div className="space-y-2">
                <StatRow label="Confidence" value={`${queen.confidence}%`} color="#f59e0b" />
                <StatRow label="Model" value={queen.model} color="#94a3b8" />
                <StatRow label="Messages" value={String(queen.messagesCount)} color="#3b82f6" />
                <StatRow label="Outputs" value={String(queen.outputCount)} color="#10b981" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Workflow summary */}
        <div className="col-span-2 space-y-4">
          {/* Active workflow */}
          <div className="rounded-lg border border-amber-900/20 bg-hive-panel/60 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-mono text-amber-700/60 tracking-widest">ACTIVE WORKFLOW</div>
              <span className={`text-xs font-mono px-2 py-0.5 rounded ${
                wf.status === 'running' ? 'bg-amber-900/20 text-amber-400' : 'bg-emerald-900/20 text-emerald-400'
              }`}>{wf.status.toUpperCase()}</span>
            </div>
            <div className="text-sm font-semibold text-slate-100 mb-1">{wf.name}</div>
            <div className="text-xs text-slate-500 mb-3">{wf.description}</div>

            {/* Progress */}
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <motion.div className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg, #d97706, #fbbf24)' }}
                  initial={{ width: 0 }} animate={{ width: `${wf.progress}%` }}
                  transition={{ duration: 1 }} />
              </div>
              <span className="text-xs font-mono text-amber-500">{wf.progress}%</span>
            </div>

            {/* Task status grid */}
            <div className="grid grid-cols-5 gap-1.5">
              {wf.nodes.map(n => (
                <div key={n.id} className="flex flex-col items-center gap-1 p-1.5 rounded border border-slate-800 bg-slate-900/40">
                  <TaskStatusDot status={n.status} />
                  <div className="text-xs text-slate-500 text-center leading-tight" style={{ fontSize: 9 }}>
                    {n.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Risk + Blockers */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-amber-900/20 bg-hive-panel/60 p-3">
              <div className="text-xs font-mono text-amber-700/60 tracking-widest mb-2">RISK LEVEL</div>
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} className={wf.riskLevel === 'high' ? 'text-red-400' : wf.riskLevel === 'medium' ? 'text-amber-400' : 'text-emerald-400'} />
                <span className={`text-sm font-bold uppercase ${wf.riskLevel === 'high' ? 'text-red-400' : wf.riskLevel === 'medium' ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {wf.riskLevel}
                </span>
              </div>
            </div>
            <div className="rounded-lg border border-amber-900/20 bg-hive-panel/60 p-3">
              <div className="text-xs font-mono text-amber-700/60 tracking-widest mb-2">PENDING APPROVALS</div>
              <div className="flex items-center gap-2">
                <Shield size={16} className="text-slate-600" />
                <span className="text-sm font-bold text-slate-400">0 pending</span>
              </div>
            </div>
          </div>

          {/* Recent messages from workers */}
          <div className="rounded-lg border border-amber-900/20 bg-hive-panel/60 p-4">
            <div className="text-xs font-mono text-amber-700/60 tracking-widest mb-3">WORKER SIGNALS</div>
            <div className="space-y-2">
              {recentMessages.map(m => (
                <div key={m.id} className="flex items-start gap-2.5 py-1.5 border-b border-slate-800/40">
                  <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                    style={{ background: m.type === 'risk' ? '#ef4444' : m.type === 'result' ? '#10b981' : '#f59e0b' }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-mono text-amber-600/80">{m.from}</span>
                      <span className="text-xs font-mono text-slate-700">{m.type}</span>
                      <span className="text-xs text-slate-700 ml-auto">{new Date(m.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div className="text-xs text-slate-400 truncate">{m.content}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatRow({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex items-center justify-between py-1 border-b border-amber-900/10">
      <span className="text-xs text-slate-600">{label}</span>
      <span className="text-xs font-mono" style={{ color }}>{value}</span>
    </div>
  );
}

function TaskStatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    done: '#10b981', running: '#f59e0b', pending: '#374151', blocked: '#ef4444', failed: '#ef4444',
  };
  return (
    <motion.div
      className="w-2 h-2 rounded-full"
      style={{ background: colors[status] ?? '#374151' }}
      animate={status === 'running' ? { opacity: [1, 0.3, 1] } : {}}
      transition={{ duration: 1, repeat: Infinity }}
    />
  );
}
