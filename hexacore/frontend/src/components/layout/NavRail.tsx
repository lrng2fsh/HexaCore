import React from 'react';
import { motion } from 'framer-motion';
import {
  Hexagon, Crown, Users, GitBranch, Network,
  BookOpen, CheckSquare, ScrollText, Settings, Activity,
} from 'lucide-react';

export type ViewId =
  | 'overview' | 'queen' | 'workers' | 'flow'
  | 'system' | 'knowledge' | 'approvals' | 'logs' | 'settings';

interface NavItemDef {
  id: ViewId;
  icon: React.ReactNode;
  label: string;
  labelJP: string;
  chamber: string;
}

function makeItems(): NavItemDef[] {
  return [
    { id: 'overview',   icon: <Hexagon size={16} />,     label: 'Hive Overview',   labelJP: '\u30CF\u30A4\u30D6',       chamber: 'MAIN CHAMBER'   },
    { id: 'queen',      icon: <Crown size={16} />,        label: 'Queen Chamber',   labelJP: '\u5973\u738B',             chamber: 'THRONE ROOM'    },
    { id: 'workers',    icon: <Users size={16} />,        label: 'Worker Bees',     labelJP: '\u50CD\u304D\u8702',       chamber: 'WORKER CELLS'   },
    { id: 'flow',       icon: <GitBranch size={16} />,    label: 'Honeycomb Flow',  labelJP: '\u30D5\u30ED\u30FC',       chamber: 'TASK GRAPH'     },
    { id: 'system',     icon: <Network size={16} />,      label: 'System Map',      labelJP: '\u30B7\u30B9\u30C6\u30E0', chamber: 'HIVE NETWORK'  },
    { id: 'knowledge',  icon: <BookOpen size={16} />,     label: 'Knowledge Graph', labelJP: '\u77E5\u8B58',             chamber: 'POLLEN STORE'   },
    { id: 'approvals',  icon: <CheckSquare size={16} />,  label: 'Approvals',       labelJP: '\u627F\u8A8D',             chamber: 'GATE CHAMBER'   },
    { id: 'logs',       icon: <ScrollText size={16} />,   label: 'Logs',            labelJP: '\u30ED\u30B0',             chamber: 'SIGNAL ARCHIVE' },
    { id: 'settings',   icon: <Settings size={16} />,     label: 'Settings',        labelJP: '\u8A2D\u5B9A',             chamber: 'HIVE CONFIG'    },
  ];
}

const NAV_ITEMS = makeItems();

interface NavRailProps {
  activeView: ViewId;
  onNavigate: (view: ViewId) => void;
  isAnime?: boolean;
}

export function NavRail({ activeView, onNavigate, isAnime = false }: NavRailProps) {
  return (
    <div
      className="flex flex-col w-16 h-full relative z-40 flex-shrink-0"
      style={{
        background: isAnime
          ? 'linear-gradient(180deg, #02040a, #050810)'
          : 'color-mix(in srgb, var(--hive-bg) 80%, transparent)',
        borderRight: '1px solid color-mix(in srgb, var(--hive-accent) 12%, transparent)',
      }}
    >
      {/* Top hex mark */}
      <div
        className="flex items-center justify-center h-14 flex-shrink-0"
        style={{ borderBottom: '1px solid color-mix(in srgb, var(--hive-accent) 10%, transparent)' }}
      >
        <motion.div
          style={{ color: 'color-mix(in srgb, var(--hive-accent) 40%, transparent)' }}
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2.5, repeat: Infinity }}
        >
          <Hexagon size={14} />
        </motion.div>
      </div>

      {/* Nav items */}
      <div className="flex flex-col flex-1 py-2 gap-0.5 overflow-hidden">
        {NAV_ITEMS.map((item) => {
          const isActive = activeView === item.id;
          return (
            <div key={item.id} className="relative group">
              <button
                onClick={() => onNavigate(item.id)}
                className="relative w-full flex items-center justify-center h-11 transition-all duration-150"
                style={{
                  color: isActive
                    ? 'var(--hive-accent-text)'
                    : 'color-mix(in srgb, var(--hive-accent) 25%, #7c8499)',
                }}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-active"
                    className="absolute inset-1 rounded-sm"
                    style={{
                      background: 'var(--hive-accent-muted)',
                      border: '1px solid color-mix(in srgb, var(--hive-accent) 25%, transparent)',
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                {isActive && (
                  <div
                    className="absolute left-0 top-2 bottom-2 w-0.5 rounded-r"
                    style={{ background: 'var(--hive-accent)', boxShadow: '0 0 6px var(--hive-accent)' }}
                  />
                )}
                <span className="relative z-10">{item.icon}</span>
                {isAnime && isActive && (
                  <span
                    className="absolute bottom-0.5 left-0 right-0 text-center font-jp"
                    style={{ fontSize: 7, color: 'var(--hive-accent)', opacity: 0.7 }}
                  >
                    {item.labelJP}
                  </span>
                )}
              </button>

              {/* Tooltip */}
              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                <div
                  className="rounded px-2.5 py-1.5 whitespace-nowrap shadow-xl"
                  style={{
                    background: 'var(--hive-panel)',
                    border: '1px solid color-mix(in srgb, var(--hive-accent) 25%, transparent)',
                    boxShadow: '0 0 16px color-mix(in srgb, var(--hive-accent) 10%, transparent)',
                  }}
                >
                  <div className="font-rajdhani text-sm font-semibold" style={{ color: '#f0f0f5' }}>
                    {isAnime ? item.labelJP : item.label}
                  </div>
                  <div className="font-mono-tech mt-0.5" style={{ fontSize: 10, color: 'color-mix(in srgb, var(--hive-accent) 50%, transparent)' }}>
                    {item.chamber}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom activity */}
      <div
        className="flex items-center justify-center h-11 flex-shrink-0"
        style={{ borderTop: '1px solid color-mix(in srgb, var(--hive-accent) 10%, transparent)' }}
      >
        <motion.div
          style={{ color: 'color-mix(in srgb, var(--hive-accent) 40%, transparent)' }}
          animate={{ opacity: [0.3, 0.9, 0.3] }}
          transition={{ duration: 1.8, repeat: Infinity }}
        >
          <Activity size={12} />
        </motion.div>
      </div>

      {/* Right edge glow */}
      <div
        className="absolute right-0 top-14 bottom-11 w-px"
        style={{ background: 'linear-gradient(to bottom, transparent, color-mix(in srgb, var(--hive-accent) 15%, transparent), transparent)' }}
      />
    </div>
  );
}
