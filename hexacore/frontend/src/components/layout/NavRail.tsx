import React from 'react';
import { motion } from 'framer-motion';
import { Hexagon, Crown, Users, GitBranch, Network, BookOpen, CheckSquare, ScrollText, Settings, Activity } from 'lucide-react';

export type ViewId = 'overview' | 'queen' | 'workers' | 'flow' | 'system' | 'knowledge' | 'approvals' | 'logs' | 'settings';

const NAV_ITEMS = [
  { id: 'overview'  as ViewId, icon: React.createElement(Hexagon,    { size: 15 }), label: 'Hive Overview',   labelJP: '???',   chamber: 'MAIN CHAMBER'   },
  { id: 'queen'     as ViewId, icon: React.createElement(Crown,      { size: 15 }), label: 'Queen Chamber',   labelJP: '??',     chamber: 'THRONE ROOM'    },
  { id: 'workers'   as ViewId, icon: React.createElement(Users,      { size: 15 }), label: 'Worker Bees',     labelJP: '???',   chamber: 'WORKER CELLS'   },
  { id: 'flow'      as ViewId, icon: React.createElement(GitBranch,  { size: 15 }), label: 'Honeycomb Flow',  labelJP: '???',   chamber: 'TASK GRAPH'     },
  { id: 'system'    as ViewId, icon: React.createElement(Network,    { size: 15 }), label: 'System Map',      labelJP: '????', chamber: 'HIVE NETWORK'   },
  { id: 'knowledge' as ViewId, icon: React.createElement(BookOpen,   { size: 15 }), label: 'Knowledge Graph', labelJP: '??',     chamber: 'POLLEN STORE'   },
  { id: 'approvals' as ViewId, icon: React.createElement(CheckSquare,{ size: 15 }), label: 'Approvals',       labelJP: '??',     chamber: 'GATE CHAMBER'   },
  { id: 'logs'      as ViewId, icon: React.createElement(ScrollText, { size: 15 }), label: 'Logs',            labelJP: '??',     chamber: 'SIGNAL ARCHIVE' },
  { id: 'settings'  as ViewId, icon: React.createElement(Settings,   { size: 15 }), label: 'Settings',        labelJP: '??',     chamber: 'HIVE CONFIG'    },
];

interface NavRailProps {
  activeView: ViewId;
  onNavigate: (view: ViewId) => void;
  isAnime?: boolean;
}

export function NavRail({ activeView, onNavigate, isAnime = false }: NavRailProps) {
  return (
    React.createElement('div', {
      className: 'flex flex-col w-16 h-full relative z-40 flex-shrink-0',
      style: {
        background: isAnime ? 'linear-gradient(180deg,#02040a,#050810)' : 'color-mix(in srgb,var(--hive-bg) 80%,transparent)',
        borderRight: '1px solid color-mix(in srgb,var(--hive-accent) 12%,transparent)',
      }
    },
      React.createElement('div', {
        className: 'flex items-center justify-center h-12 flex-shrink-0',
        style: { borderBottom: '1px solid color-mix(in srgb,var(--hive-accent) 10%,transparent)' }
      },
        React.createElement(motion.div, {
          style: { color: 'color-mix(in srgb,var(--hive-accent) 40%,transparent)' },
          animate: { opacity: [0.3, 0.7, 0.3] },
          transition: { duration: 2.5, repeat: Infinity }
        }, React.createElement(Hexagon, { size: 13 }))
      ),
      React.createElement('div', { className: 'flex flex-col flex-1 py-2 gap-0.5 overflow-hidden' },
        NAV_ITEMS.map(item => {
          const isActive = activeView === item.id;
          return React.createElement('div', { key: item.id, className: 'relative group' },
            React.createElement('button', {
              onClick: () => onNavigate(item.id),
              className: 'relative w-full flex items-center justify-center h-11 transition-all duration-150',
              style: { color: isActive ? 'var(--hive-accent-text)' : 'color-mix(in srgb,var(--hive-accent) 25%,#4b5563)' }
            },
              isActive && React.createElement(motion.div, {
                layoutId: 'nav-active',
                className: 'absolute inset-1 rounded-sm',
                style: { background: 'var(--hive-accent-muted)', border: '1px solid color-mix(in srgb,var(--hive-accent) 25%,transparent)' },
                transition: { type: 'spring', stiffness: 400, damping: 30 }
              }),
              isActive && React.createElement('div', {
                className: 'absolute left-0 top-2 bottom-2 w-0.5 rounded-r',
                style: { background: 'var(--hive-accent)', boxShadow: '0 0 6px var(--hive-accent)' }
              }),
              React.createElement('span', { className: 'relative z-10' }, item.icon),
              isAnime && isActive && React.createElement('span', {
                className: 'absolute bottom-0.5 left-0 right-0 text-center font-jp',
                style: { fontSize: 7, color: 'var(--hive-accent)', opacity: 0.7 }
              }, item.labelJP)
            ),
            React.createElement('div', {
              className: 'absolute left-full top-1/2 -translate-y-1/2 ml-2 z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity'
            },
              React.createElement('div', {
                className: 'rounded px-2.5 py-1.5 whitespace-nowrap shadow-xl',
                style: { background: 'var(--hive-panel)', border: '1px solid color-mix(in srgb,var(--hive-accent) 25%,transparent)' }
              },
                React.createElement('div', { className: 'font-rajdhani text-xs font-semibold', style: { color: 'var(--hive-accent-text)' } }, isAnime ? item.labelJP : item.label),
                React.createElement('div', { className: 'font-mono-tech mt-0.5', style: { fontSize: 9, color: 'color-mix(in srgb,var(--hive-accent) 40%,transparent)' } }, item.chamber)
              )
            )
          );
        })
      ),
      React.createElement('div', {
        className: 'flex items-center justify-center h-11 flex-shrink-0',
        style: { borderTop: '1px solid color-mix(in srgb,var(--hive-accent) 10%,transparent)' }
      },
        React.createElement(motion.div, {
          style: { color: 'color-mix(in srgb,var(--hive-accent) 40%,transparent)' },
          animate: { opacity: [0.3, 0.9, 0.3] },
          transition: { duration: 1.8, repeat: Infinity }
        }, React.createElement(Activity, { size: 11 }))
      ),
      React.createElement('div', {
        className: 'absolute right-0 top-12 bottom-10 w-px',
        style: { background: 'linear-gradient(to bottom,transparent,color-mix(in srgb,var(--hive-accent) 15%,transparent),transparent)' }
      })
    )
  );
}
