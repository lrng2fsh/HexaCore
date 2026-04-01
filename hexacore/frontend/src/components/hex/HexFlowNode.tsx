import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, AlertTriangle, Loader, XCircle } from 'lucide-react';
import { TaskStatus } from '../../lib/mockData';

interface HexFlowNodeProps {
  label: string;
  type: string;
  agent: string;
  status: TaskStatus;
  duration?: string;
  isSelected?: boolean;
  onClick?: () => void;
  size?: number;
}

const STATUS_CONFIG: Record<TaskStatus, { color: string; bg: string; icon: React.ReactNode; label: string }> = {
  pending: {
    color: '#6b7280', bg: 'rgba(55,65,81,0.3)',
    icon: <Clock size={14} className="text-gray-500" />, label: 'PENDING',
  },
  running: {
    color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',
    icon: <Loader size={14} className="text-amber-400 animate-spin" />, label: 'RUNNING',
  },
  blocked: {
    color: '#ef4444', bg: 'rgba(239,68,68,0.12)',
    icon: <AlertTriangle size={14} className="text-red-400" />, label: 'BLOCKED',
  },
  done: {
    color: '#10b981', bg: 'rgba(16,185,129,0.12)',
    icon: <CheckCircle size={14} className="text-emerald-400" />, label: 'DONE',
  },
  failed: {
    color: '#ef4444', bg: 'rgba(239,68,68,0.12)',
    icon: <XCircle size={14} className="text-red-400" />, label: 'FAILED',
  },
};

export function HexFlowNode({ label, type, agent, status, duration, isSelected, onClick, size = 100 }: HexFlowNodeProps) {
  const cfg = STATUS_CONFIG[status];
  const h = size * 1.1547;
  const isRunning = status === 'running';

  return (
    <motion.div
      style={{ width: size, height: h, cursor: onClick ? 'pointer' : 'default', position: 'relative' }}
      onClick={onClick}
      whileHover={onClick ? { scale: 1.06 } : {}}
      whileTap={onClick ? { scale: 0.96 } : {}}
      animate={isRunning ? {
        filter: [
          `drop-shadow(0 0 6px ${cfg.color}44)`,
          `drop-shadow(0 0 14px ${cfg.color}88)`,
          `drop-shadow(0 0 6px ${cfg.color}44)`,
        ],
      } : { filter: `drop-shadow(0 0 4px ${cfg.color}33)` }}
      transition={isRunning ? { duration: 1.5, repeat: Infinity } : { duration: 0.3 }}
    >
      {/* Outer hex border */}
      <div style={{
        position: 'absolute', inset: 0,
        clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
        background: `linear-gradient(135deg, ${cfg.color}44, transparent)`,
      }} />

      {/* Inner hex */}
      <div style={{
        position: 'absolute', inset: 2,
        clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
        background: cfg.bg,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 2,
      }}>
        <div style={{ marginBottom: 2 }}>{cfg.icon}</div>
        <div style={{ fontSize: 10, fontWeight: 600, color: '#e2e8f0', textAlign: 'center', lineHeight: 1.2, padding: '0 8px' }}>
          {label}
        </div>
        <div style={{ fontSize: 8, color: cfg.color, fontFamily: 'monospace', letterSpacing: '0.06em' }}>
          {cfg.label}
        </div>
        {duration && (
          <div style={{ fontSize: 8, color: '#6b7280', fontFamily: 'monospace' }}>{duration}</div>
        )}
      </div>

      {/* Selected ring */}
      {isSelected && (
        <motion.div
          style={{
            position: 'absolute', inset: -4,
            clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
            border: `2px solid ${cfg.color}88`,
            pointerEvents: 'none',
          }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}
    </motion.div>
  );
}
