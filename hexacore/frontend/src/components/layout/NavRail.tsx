import React from 'react';
import { motion } from 'framer-motion';
import { Hexagon, Crown, Users, GitBranch, Network, BookOpen, CheckSquare, ScrollText, Settings, Activity } from 'lucide-react';

export type ViewId = 'overview' | 'queen' | 'workers' | 'flow' | 'system' | 'knowledge' | 'approvals' | 'logs' | 'settings';

const JP = { overview: '\u30CF\u30A4\u30D6', queen: '\u5973\u738B', workers: '\u50CD\u304D\u8702', flow: '\u30D5\u30ED\u30FC', system: '\u30B7\u30B9\u30C6\u30E0', knowledge: '\u77E5\u8B58', approvals: '\u627F\u8A8D', logs: '\u30ED\u30B0', settings: '\u8A2D\u5B9A' };

const ITEMS: { id: ViewId; label: string; chamber: string }[] = [
  { id: 'overview', label: 'Hive Overview', chamber: 'MAIN CHAMBER' },
  { id: 'queen', label: 'Queen Chamber', chamber: 'THRONE ROOM' },
  { id: 'workers', label: 'Worker Bees', chamber: 'WORKER CELLS' },
  { id: 'flow', label: 'Honeycomb Flow', chamber: 'TASK GRAPH' },
  { id: 'system', label: 'System Map', chamber: 'HIVE NETWORK' },
  { id: 'knowledge', label: 'Knowledge Graph', chamber: 'POLLEN STORE' },
  { id: 'approvals', label: 'Approvals', chamber: 'GATE CHAMBER' },
  { id: 'logs', label: 'Logs', chamber: 'SIGNAL ARCHIVE' },
  { id: 'settings', label: 'Settings', chamber: 'HIVE CONFIG' },
];

const ICONS: Record<string, React.ReactNode> = {
  overview: <Hexagon size={16} />, queen: <Crown size={16} />, workers: <Users size={16} />,
  flow: <GitBranch size={16} />, system: <Network size={16} />, knowledge: <BookOpen size={16} />,
  approvals: <CheckSquare size={16} />, logs: <ScrollText size={16} />, settings: <Settings size={16} />,
};

interface NavRailProps { activeView: ViewId; onNavigate: (v: ViewId) => void; isAnime?: boolean; }

export function NavRail({ activeView, onNavigate, isAnime = false }: NavRailProps) {
  return (
    <div className="flex flex-col w-16 h-full relative z-40 flex-shrink-0"
      style={{ background: isAnime ? 'linear-gradient(180deg,#02040a,#050810)' : 'color-mix(in srgb,var(--hive-bg) 80%,transparent)', borderRight: '1px solid color-mix(in srgb,var(--hive-accent) 12%,transparent)' }}>
      <div className="flex items-center justify-center h-14 flex-shrink-0" style={{ borderBottom: '1px solid color-mix(in srgb,var(--hive-accent) 10%,transparent)' }}>
        <motion.div style={{ color: 'color-mix(in srgb,var(--hive-accent) 40%,transparent)' }} animate={{ opacity: [0.3,0.7,0.3] }} transition={{ duration: 2.5, repeat: Infinity }}><Hexagon size={14} /></motion.div>
      </div>
      <div className="flex flex-col flex-1 py-2 gap-0.5 overflow-hidden">
        {ITEMS.map((item) => {
          const isActive = activeView === item.id;
          const jpLabel = JP[item.id as keyof typeof JP] || item.label;
          return (
            <div key={item.id} className="relative group">
              <button onClick={() => onNavigate(item.id)} className="relative w-full flex items-center justify-center h-11 transition-all duration-150"
                style={{ color: isActive ? 'var(--hive-accent-text)' : 'color-mix(in srgb,var(--hive-accent) 25%,#7c8499)' }}>
                {isActive && <motion.div layoutId="nav-active" className="absolute inset-1 rounded-sm" style={{ background: 'var(--hive-accent-muted)', border: '1px solid color-mix(in srgb,var(--hive-accent) 25%,transparent)' }} transition={{ type: 'spring', stiffness: 400, damping: 30 }} />}
                {isActive && <div className="absolute left-0 top-2 bottom-2 w-0.5 rounded-r" style={{ background: 'var(--hive-accent)', boxShadow: '0 0 6px var(--hive-accent)' }} />}
                <span className="relative z-10">{ICONS[item.id]}</span>
                {isAnime && isActive && <span className="absolute bottom-0.5 left-0 right-0 text-center font-jp" style={{ fontSize: 7, color: 'var(--hive-accent)', opacity: 0.7 }}>{jpLabel}</span>}
              </button>
              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="rounded px-2.5 py-1.5 whitespace-nowrap shadow-xl" style={{ background: 'var(--hive-panel)', border: '1px solid color-mix(in srgb,var(--hive-accent) 25%,transparent)' }}>
                  <div className="font-rajdhani text-sm font-semibold" style={{ color: '#f0f0f5' }}>{isAnime ? jpLabel : item.label}</div>
                  <div className="font-mono-tech mt-0.5" style={{ fontSize: 10, color: 'color-mix(in srgb,var(--hive-accent) 50%,transparent)' }}>{item.chamber}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-center h-11 flex-shrink-0" style={{ borderTop: '1px solid color-mix(in srgb,var(--hive-accent) 10%,transparent)' }}>
        <motion.div style={{ color: 'color-mix(in srgb,var(--hive-accent) 40%,transparent)' }} animate={{ opacity: [0.3,0.9,0.3] }} transition={{ duration: 1.8, repeat: Infinity }}><Activity size={12} /></motion.div>
      </div>
      <div className="absolute right-0 top-14 bottom-11 w-px" style={{ background: 'linear-gradient(to bottom,transparent,color-mix(in srgb,var(--hive-accent) 15%,transparent),transparent)' }} />
    </div>
  );
}