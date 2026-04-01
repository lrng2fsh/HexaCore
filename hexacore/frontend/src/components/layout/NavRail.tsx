import React from 'react';
import { motion } from 'framer-motion';
import {
  Hexagon, Crown, Users, GitBranch, Network, BookOpen,
  CheckSquare, ScrollText, Settings, Activity
} from 'lucide-react';

export type ViewId = 'overview' | 'queen' | 'workers' | 'flow' | 'system' | 'knowledge' | 'approvals' | 'logs' | 'settings';

interface NavItem {
  id: ViewId;
  icon: React.ReactNode;
  label: string;
  chamber: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'overview', icon: <Hexagon size={16} />, label: 'Hive Overview', chamber: 'MAIN CHAMBER' },
  { id: 'queen', icon: <Crown size={16} />, label: 'Queen Chamber', chamber: 'THRONE ROOM' },
  { id: 'workers', icon: <Users size={16} />, label: 'Worker Bees', chamber: 'WORKER CELLS' },
  { id: 'flow', icon: <GitBranch size={16} />, label: 'Honeycomb Flow', chamber: 'TASK GRAPH' },
  { id: 'system', icon: <Network size={16} />, label: 'System Map', chamber: 'HIVE NETWORK' },
  { id: 'knowledge', icon: <BookOpen size={16} />, label: 'Knowledge Graph', chamber: 'POLLEN STORE' },
  { id: 'approvals', icon: <CheckSquare size={16} />, label: 'Approvals', chamber: 'GATE CHAMBER' },
  { id: 'logs', icon: <ScrollText size={16} />, label: 'Logs', chamber: 'SIGNAL ARCHIVE' },
  { id: 'settings', icon: <Settings size={16} />, label: 'Settings', chamber: 'HIVE CONFIG' },
];

interface NavRailProps {
  activeView: ViewId;
  onNavigate: (view: ViewId) => void;
}

export function NavRail({ activeView, onNavigate }: NavRailProps) {
  return (
    <div className="flex flex-col w-14 h-full border-r border-amber-900/20 bg-hive-bg/80 relative z-40">
      {/* Top hex logo area */}
      <div className="flex items-center justify-center h-12 border-b border-amber-900/20">
        <motion.div
          className="text-amber-600/40"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <Hexagon size={14} />
        </motion.div>
      </div>

      {/* Nav items */}
      <div className="flex flex-col flex-1 py-2 gap-0.5">
        {NAV_ITEMS.map((item) => {
          const isActive = activeView === item.id;
          return (
            <div key={item.id} className="relative group">
              <button
                onClick={() => onNavigate(item.id)}
                className={`
                  relative w-full flex items-center justify-center h-10
                  transition-all duration-200
                  ${isActive
                    ? 'text-amber-300'
                    : 'text-slate-600 hover:text-slate-300'
                  }
                `}
              >
                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="nav-active"
                    className="absolute inset-1 rounded"
                    style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}

                {/* Active left bar */}
                {isActive && (
                  <div className="absolute left-0 top-2 bottom-2 w-0.5 rounded-r bg-amber-500"
                    style={{ boxShadow: '0 0 6px #f59e0b' }} />
                )}

                <span className="relative z-10">{item.icon}</span>
              </button>

              {/* Tooltip */}
              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-hive-panel border border-amber-900/30 rounded px-2.5 py-1.5 whitespace-nowrap shadow-xl">
                  <div className="text-xs font-medium text-slate-200">{item.label}</div>
                  <div className="text-xs font-mono text-amber-700/70 mt-0.5">{item.chamber}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom activity */}
      <div className="flex items-center justify-center h-10 border-t border-amber-900/20">
        <motion.div
          className="text-amber-600/50"
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Activity size={12} />
        </motion.div>
      </div>

      {/* Right glow line */}
      <div className="absolute right-0 top-12 bottom-0 w-px bg-gradient-to-b from-transparent via-amber-600/10 to-transparent" />
    </div>
  );
}
