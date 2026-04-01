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
  idle: '#374151',
  pending: '#374151',
  blocked: '#ef4444',
  failed: '#ef4444',
  error: '#ef4444',
  thinking: '#8b5cf6',
  offline: '#1f2937',
};

const STATUS_BORDER: Record<string, string> = {
  busy: 'rgba(245,158,11,0.7)',
  running: 'rgba(245,158,11,0.7)',
  done: 'rgba(16,185,129,0.6)',
  idle: 'rgba(55,65,81,0.5)',
  pending: 'rgba(55,65,81,0.4)',
  blocked: 'rgba(239,68,68,0.6)',
  failed: 'rgba(239,68,68,0.6)',
  error: 'rgba(239,68,68,0.6)',
  thinking: 'rgba(139,92,246,0.6)',
  offline: 'rgba(31,41,55,0.4)',
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
    background: isQueen
      ? 'linear-gradient(135deg, #1a1208 0%, #2d1f00 50%, #1a1208 100%)'
      : 'linear-gradient(135deg, #111118 0%, #16161f 100%)',
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
          `drop-shadow(0 0 8px ${glow}44) drop-shadow(0 0 20px ${glow}22)`,
          `drop-shadow(0 0 16px ${glow}88) drop-shadow(0 0 40px ${glow}44)`,
          `drop-shadow(0 0 8px ${glow}44) drop-shadow(0 0 20px ${glow}22)`,
        ],
      } : {
        filter: `drop-shadow(0 0 6px ${glow}33) drop-shadow(0 0 16px ${glow}11)`,
      }}
      transition={isAnimated ? { duration: 2, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.3 }}
    >
      {/* Border layer */}
      <div style={{
        position: 'absolute',
        inset: 0,
        clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
        background: `linear-gradient(135deg, ${border}, transparent 60%)`,
        padding: '1.5px',
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
