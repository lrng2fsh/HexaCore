import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Hexagon, Play, Pause, Square, Plus, Activity, ChevronDown } from 'lucide-react';

interface TopBarProps {
  onNewTask: () => void;
  isRunning: boolean;
}

export function TopBar({ onNewTask, isRunning }: TopBarProps) {
  const [showEnv, setShowEnv] = useState(false);

  return (
    <div className="flex items-center h-12 px-4 gap-4 border-b border-amber-900/20 bg-hive-bg/95 backdrop-blur-sm relative z-50">
      {/* Logo */}
      <div className="flex items-center gap-2.5 mr-2">
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="text-amber-400"
        >
          <Hexagon size={20} fill="rgba(245,158,11,0.15)" strokeWidth={1.5} />
        </motion.div>
        <div className="flex items-baseline gap-1.5">
          <span className="font-bold text-sm tracking-widest text-amber-300" style={{ textShadow: '0 0 12px rgba(245,158,11,0.5)' }}>
            HEXACORE
          </span>
          <span className="text-xs text-slate-600 font-mono">v1.0</span>
        </div>
      </div>

      {/* Separator */}
      <div className="w-px h-5 bg-amber-900/30" />

      {/* Environment selector */}
      <button
        onClick={() => setShowEnv(!showEnv)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs text-slate-400 hover:text-amber-300 hover:bg-amber-900/10 transition-colors font-mono"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        production
        <ChevronDown size={10} />
      </button>

      {/* Session */}
      <div className="flex items-center gap-1.5 text-xs font-mono text-slate-600">
        <span>SESSION</span>
        <span className="text-amber-700">wf-001</span>
      </div>

      <div className="flex-1" />

      {/* Hive status */}
      <div className="flex items-center gap-3 mr-2">
        <HiveStatusIndicator label="QUEEN" active={true} />
        <HiveStatusIndicator label="WORKERS" count={4} active={isRunning} />
        <HiveStatusIndicator label="TASKS" count={5} active={isRunning} />
      </div>

      {/* Separator */}
      <div className="w-px h-5 bg-amber-900/30" />

      {/* Actions */}
      <div className="flex items-center gap-1.5">
        <ActionButton icon={<Plus size={13} />} label="New Task" onClick={onNewTask} variant="primary" />
        <ActionButton icon={<Play size={13} />} label="Run" onClick={() => {}} variant="ghost" />
        <ActionButton icon={<Pause size={13} />} label="Pause" onClick={() => {}} variant="ghost" />
        <ActionButton icon={<Square size={13} />} label="Abort" onClick={() => {}} variant="danger" />
      </div>

      {/* Live indicator */}
      {isRunning && (
        <div className="flex items-center gap-1.5 ml-1">
          <motion.div
            className="w-1.5 h-1.5 rounded-full bg-amber-400"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
          <span className="text-xs font-mono text-amber-500">LIVE</span>
        </div>
      )}

      {/* Bottom glow line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-600/30 to-transparent" />
    </div>
  );
}

function HiveStatusIndicator({ label, active, count }: { label: string; active: boolean; count?: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <motion.div
        className="w-1.5 h-1.5 rounded-full"
        style={{ background: active ? '#f59e0b' : '#374151' }}
        animate={active ? { opacity: [1, 0.4, 1] } : {}}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
      <span className="text-xs font-mono text-slate-500">
        {label}{count !== undefined ? ` ×${count}` : ''}
      </span>
    </div>
  );
}

function ActionButton({ icon, label, onClick, variant }: {
  icon: React.ReactNode; label: string; onClick: () => void;
  variant: 'primary' | 'ghost' | 'danger';
}) {
  const styles = {
    primary: 'bg-amber-600/20 border border-amber-600/40 text-amber-300 hover:bg-amber-600/30 hover:border-amber-500/60',
    ghost: 'bg-transparent border border-slate-700/50 text-slate-400 hover:text-slate-200 hover:border-slate-600',
    danger: 'bg-transparent border border-red-900/40 text-red-600 hover:text-red-400 hover:border-red-700/60',
  };

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-all ${styles[variant]}`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
