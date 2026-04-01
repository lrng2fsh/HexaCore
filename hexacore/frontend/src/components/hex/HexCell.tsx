import React from 'react';
import { motion } from 'framer-motion';
import { AgentStatus } from '../../lib/mockData';

interface HexCellProps {
  size?: number;
  status?: AgentStatus | 'done' | 'pending' | 'running' | 'blocked' | 'failed';
  isQueen?: boolean;
  isActive?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
  className?: string;
  glowColor?: string;
  animate?: boolean;
}

const STATUS_GLOW: Record<string, string> = {
  busy: '#f59e0b',
  running: '#f59e0b',
  done: '#10b981',
  idle: '#a0a8c0',
  pending: '#a0a8c0',
  blocked: '#ef4444',
  failed: '#ef4444',
  error: '#ef4444',
  thinking: '#8b5cf6',
  offline: '#475569',
};

const STATUS_BORDER: Record<string, string> = {
  busy: 'rgba(245,158,11,0.95)',
  running: 'rgba(245,158,11,0.95)',
  done: 'rgba(16,185,129,0.85)',
  idle: 'rgba(200,205,225,0.5)',
  pending: 'rgba(200,205,225,0.4)',
  blocked: 'rgba(239,68,68,0.85)',
  failed: 'rgba(239,68,68,0.85)',
  error: 'rgba(239,68,68,0.85)',
  thinking: 'rgba(139,92,246,0.85)',
  offline: 'rgba(100,110,130,0.35)',
};

export function HexCell({
  size = 120,
  status = 'idle',
  isQueen = false,
  isActive = false,
  onClick,
  children,
  className = '',
  animate = true,
}: HexCellProps) {
  const glow = STATUS_GLOW[status] ?? '#374151';
  const border = STATUS_BORDER[status] ?? 'rgba(55,65,81,0.5)';
  const isAnimated = animate && (status === 'busy' || status === 'running' || status === 'thinking');

  // Worker cells: significantly lighter than page bg
  const workerBg = 'linear-gradient(145deg, #3e3c4e 0%, #32303f 100%)';
  const queenBg  = 'linear-gradient(145deg, #3d2800 0%, #4a3200 100%)';

  const hexStyle: React.CSSProperties = {
    width: size,
    height: size * 1.1547,
    clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
    position: 'relative',
    cursor: onClick ? 'pointer' : 'default',
  };

  const innerStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
    background: isQueen ? queenBg : workerBg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  };

  return (
    <motion.div
      style={hexStyle}
      className={className}
      onClick={onClick}
      whileHover={onClick ? { scale: 1.05 } : {}}
      whileTap={onClick ? { scale: 0.97 } : {}}
      animate={isAnimated ? {
        filter: [
          `drop-shadow(0 0 10px ${glow}77) drop-shadow(0 0 24px ${glow}44)`,
          `drop-shadow(0 0 22px ${glow}cc) drop-shadow(0 0 50px ${glow}66)`,
          `drop-shadow(0 0 10px ${glow}77) drop-shadow(0 0 24px ${glow}44)`,
        ],
      } : {
        filter: status === 'idle' || status === 'pending'
          ? `drop-shadow(0 0 12px rgba(180,185,210,0.4))`
          : `drop-shadow(0 0 10px ${glow}66) drop-shadow(0 0 22px ${glow}33)`,
      }}
      transition={isAnimated ? { duration: 2, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.3 }}
    >
      {/* Border layer — full perimeter outline */}
      <div style={{
        position: 'absolute',
        inset: 0,
        clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
        background: `linear-gradient(135deg, ${border}, ${border.replace(/[\d.]+\)$/, '0.2)')} 60%, transparent)`,
        padding: '2px',
      }} />

      {/* Bright top-left edge highlight */}
      <div style={{
        position: 'absolute',
        inset: 0,
        clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
        background: 'linear-gradient(145deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 40%, transparent 65%)',
        pointerEvents: 'none',
      }} />

      {/* Inner content */}
      <div style={innerStyle}>
        {/* Queen shimmer overlay */}
        {isQueen && (
          <motion.div
            style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(135deg, transparent 30%, rgba(245,158,11,0.08) 50%, transparent 70%)',
            }}
            animate={{ backgroundPosition: ['0% 0%', '100% 100%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          />
        )}

        {/* Active ring */}
        {(isActive || isAnimated) && (
          <motion.div
            style={{
              position: 'absolute', inset: 4,
              clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
              border: `1px solid ${glow}44`,
              borderRadius: 0,
            }}
            animate={{ opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}

        {children}
      </div>
    </motion.div>
  );
}
