import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Square, Plus, ChevronDown, Palette, Hexagon } from 'lucide-react';
import { ThemePicker } from '../ThemePicker';
import { Theme } from '../../lib/themes';

interface TopBarProps {
  onNewTask: () => void;
  isRunning: boolean;
  currentTheme: Theme;
  onThemeChange: (theme: Theme) => void;
}

export function TopBar({ onNewTask, isRunning, currentTheme, onThemeChange }: TopBarProps) {
  const [showThemes, setShowThemes] = useState(false);
  const isAnime = currentTheme.id === 'anime';

  return (
    <div
      className="flex items-center h-14 px-5 gap-3 relative z-50 flex-shrink-0"
      style={{
        background: isAnime
          ? 'linear-gradient(90deg, #02040a 0%, #050810 40%, #02040a 100%)'
          : 'color-mix(in srgb, var(--hive-bg) 95%, transparent)',
        borderBottom: `1px solid ${isAnime ? 'rgba(0,255,240,0.2)' : 'color-mix(in srgb, var(--hive-accent) 15%, transparent)'}`,
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 mr-1">
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          style={{ color: 'var(--hive-accent)' }}
        >
          <Hexagon size={18} strokeWidth={1.5} />
        </motion.div>
        <div className="flex items-baseline gap-1.5">
          {isAnime ? (
            <span
              className="font-orbitron font-bold text-sm tracking-widest glitch"
              data-text="HEXACORE"
              style={{ color: 'var(--hive-accent)', textShadow: '0 0 10px var(--hive-accent), 0 0 20px var(--hive-accent-dim)' }}
            >
              HEXACORE
            </span>
          ) : (
            <span
              className="font-orbitron font-bold text-sm tracking-widest"
              style={{ color: '#ffffff', textShadow: '0 0 12px color-mix(in srgb, var(--hive-accent) 60%, transparent), 0 0 24px color-mix(in srgb, var(--hive-accent) 30%, transparent)' }}
            >
              HEXACORE
            </span>
          )}
          <span className="font-mono-tech text-xs" style={{ color: 'color-mix(in srgb, var(--hive-accent) 30%, transparent)' }}>
            {isAnime ? 'v2.0 / ヘキサコア' : 'v1.0'}
          </span>
        </div>
      </div>

      {/* Separator */}
      <div className="w-px h-5 flex-shrink-0" style={{ background: 'rgba(255,255,255,0.1)' }} />

      {/* Environment */}
      <button
        className="flex items-center gap-1.5 px-2 py-1 rounded text-xs font-mono-tech transition-colors flex-shrink-0"
        style={{ color: '#b8bdd0', background: 'transparent' }}
      >
        <motion.span
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ background: '#10b981' }}
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        {isAnime ? '本番環境' : 'production'}
        <ChevronDown size={9} />
      </button>

      {/* Session */}
      <div className="flex items-center gap-1 text-xs font-mono-tech flex-shrink-0" style={{ color: '#b8bdd0' }}>
        {isAnime ? 'セッション' : 'SESSION'}
        <span style={{ color: 'var(--hive-accent)' }}>wf-001</span>
      </div>

      <div className="flex-1" />

      {/* Status indicators */}
      <div className="flex items-center gap-3 mr-1">
        <StatusPip label={isAnime ? '女王' : 'QUEEN'} active color="var(--hive-accent)" isAnime={isAnime} />
        <StatusPip label={isAnime ? '×4' : 'WORKERS ×4'} active={isRunning} color="var(--hive-accent)" isAnime={isAnime} />
        <StatusPip label={isAnime ? '×5' : 'TASKS ×5'} active={isRunning} color="var(--hive-accent)" isAnime={isAnime} />
      </div>

      <div className="w-px h-5 flex-shrink-0" style={{ background: 'rgba(255,255,255,0.1)' }} />

      {/* Theme button */}
      <button
        onClick={() => setShowThemes(p => !p)}
        className="flex items-center gap-1.5 px-2 py-1 rounded text-xs font-mono-tech transition-all flex-shrink-0"
        style={{
          color: showThemes ? 'var(--hive-accent-text)' : 'color-mix(in srgb, var(--hive-accent) 50%, #6b7280)',
          background: showThemes ? 'var(--hive-accent-muted)' : 'transparent',
          border: `1px solid ${showThemes ? 'color-mix(in srgb, var(--hive-accent) 40%, transparent)' : 'transparent'}`,
        }}
      >
        <Palette size={12} />
        <span className="hidden sm:inline">{isAnime ? 'テーマ' : 'THEME'}</span>
      </button>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <AnimeButton icon={<Plus size={12} />} label={isAnime ? '新タスク' : 'New Task'} onClick={onNewTask} variant="primary" isAnime={isAnime} />
        <AnimeButton icon={<Play size={12} />} label={isAnime ? '実行' : 'Run'} onClick={() => {}} variant="ghost" isAnime={isAnime} />
        <AnimeButton icon={<Pause size={12} />} label={isAnime ? '停止' : 'Pause'} onClick={() => {}} variant="ghost" isAnime={isAnime} />
        <AnimeButton icon={<Square size={12} />} label={isAnime ? '中断' : 'Abort'} onClick={() => {}} variant="danger" isAnime={isAnime} />
      </div>

      {/* Live indicator */}
      {isRunning && (
        <div className="flex items-center gap-1 ml-1 flex-shrink-0">
          <motion.div
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: 'var(--hive-accent)' }}
            animate={{ opacity: [1, 0.2, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          />
          <span className="font-mono-tech text-xs" style={{ color: 'var(--hive-accent)' }}>
            {isAnime ? 'ライブ' : 'LIVE'}
          </span>
        </div>
      )}

      {/* Bottom accent line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, var(--hive-accent), transparent)`, opacity: isAnime ? 0.6 : 0.25 }}
      />

      <ThemePicker
        open={showThemes}
        currentTheme={currentTheme}
        onSelect={t => { onThemeChange(t); setShowThemes(false); }}
        onClose={() => setShowThemes(false)}
      />
    </div>
  );
}

function StatusPip({ label, active, color, isAnime }: { label: string; active: boolean; color: string; isAnime: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      <motion.div
        className="w-1.5 h-1.5 rounded-full"
        style={{ background: active ? color : '#374151' }}
        animate={active ? { opacity: [1, 0.3, 1] } : {}}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
      <span className="font-mono-tech text-xs" style={{ color: active ? '#b8bdd0' : '#4b5563', fontSize: 10 }}>
        {label}
      </span>
    </div>
  );
}

function AnimeButton({ icon, label, onClick, variant, isAnime }: {
  icon: React.ReactNode; label: string; onClick: () => void;
  variant: 'primary' | 'ghost' | 'danger'; isAnime: boolean;
}) {
  const base = 'flex items-center gap-1 px-2 py-1 text-xs font-mono-tech transition-all rounded';
  const styles = {
    primary: isAnime
      ? `${base} border` + ' hover:opacity-90'
      : `${base} bg-amber-600/20 border border-amber-600/50 text-amber-200 hover:bg-amber-600/30`,
    ghost: `${base} border border-transparent hover:border-white/10 text-secondary hover:text-slate-200`,
    danger: `${base} border border-transparent text-red-600 hover:text-red-400 hover:border-red-900/40`,
  };

  return (
    <motion.button
      onClick={onClick}
      className={styles[variant]}
      style={variant === 'primary' && isAnime ? {
        background: 'color-mix(in srgb, var(--hive-accent) 12%, transparent)',
        borderColor: 'color-mix(in srgb, var(--hive-accent) 50%, transparent)',
        color: 'var(--hive-accent-text)',
        boxShadow: '0 0 8px color-mix(in srgb, var(--hive-accent) 20%, transparent)',
      } : {}}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
    >
      {icon}
      <span>{label}</span>
    </motion.button>
  );
}
