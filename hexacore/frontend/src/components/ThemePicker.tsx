import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Check, X } from 'lucide-react';
import { THEMES, Theme, ThemeId } from '../lib/themes';

interface ThemePickerProps {
  open: boolean;
  currentTheme: Theme;
  onSelect: (theme: Theme) => void;
  onClose: () => void;
}

const THEME_PREVIEW: Record<ThemeId, { swatch: string[]; label: string }> = {
  amber:   { swatch: ['#f59e0b', '#d97706', '#0a0a0f'], label: '🟡' },
  cyber:   { swatch: ['#38bdf8', '#0ea5e9', '#050a12'], label: '🔵' },
  emerald: { swatch: ['#10b981', '#059669', '#050f0a'], label: '🟢' },
  crimson: { swatch: ['#f43f5e', '#e11d48', '#0f0508'], label: '🔴' },
  arctic:  { swatch: ['#6366f1', '#4f46e5', '#f8fafc'], label: '⚪' },
  anime:   { swatch: ['#00fff0', '#ff00aa', '#02040a'], label: '⚡' },
};

export function ThemePicker({ open, currentTheme, onSelect, onClose }: ThemePickerProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Panel — anchored top-right below topbar */}
          <motion.div
            className="fixed top-14 right-4 z-50 w-72"
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
          >
            <div
              className="rounded-xl overflow-hidden shadow-2xl"
              style={{
                background: 'var(--hive-panel)',
                border: '1px solid color-mix(in srgb, var(--hive-accent) 25%, transparent)',
                boxShadow: '0 0 40px color-mix(in srgb, var(--hive-accent) 12%, transparent)',
              }}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between px-4 py-3"
                style={{ borderBottom: '1px solid color-mix(in srgb, var(--hive-accent) 12%, transparent)' }}
              >
                <div className="flex items-center gap-2">
                  <Palette size={14} style={{ color: 'var(--hive-accent)' }} />
                  <span className="text-xs font-mono tracking-widest" style={{ color: 'var(--hive-accent-text)' }}>
                    HIVE THEME
                  </span>
                </div>
                <button onClick={onClose} className="text-slate-600 hover:text-slate-300 transition-colors">
                  <X size={13} />
                </button>
              </div>

              {/* Theme list */}
              <div className="p-3 space-y-1.5">
                {Object.values(THEMES).map((theme) => {
                  const preview = THEME_PREVIEW[theme.id];
                  const isActive = theme.id === currentTheme.id;

                  return (
                    <motion.button
                      key={theme.id}
                      onClick={() => onSelect(theme)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all"
                      style={{
                        background: isActive
                          ? `color-mix(in srgb, ${theme.accentHex} 12%, transparent)`
                          : 'transparent',
                        border: `1px solid ${isActive
                          ? `color-mix(in srgb, ${theme.accentHex} 35%, transparent)`
                          : 'transparent'}`,
                      }}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {/* Swatch */}
                      <div className="flex gap-1 flex-shrink-0">
                        {preview.swatch.map((color, i) => (
                          <div
                            key={i}
                            className="rounded-full"
                            style={{
                              width: i === 2 ? 10 : 14,
                              height: i === 2 ? 10 : 14,
                              background: color,
                              border: `1px solid rgba(255,255,255,0.1)`,
                              alignSelf: 'center',
                            }}
                          />
                        ))}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div
                          className="text-sm font-semibold"
                          style={{ color: isActive ? theme.accentHex : '#e2e8f0' }}
                        >
                          {theme.name}
                        </div>
                        <div className="text-xs text-slate-500 truncate">{theme.description}</div>
                      </div>

                      {/* Active check */}
                      {isActive && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="flex-shrink-0"
                        >
                          <Check size={14} style={{ color: theme.accentHex }} />
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* Footer hint */}
              <div
                className="px-4 py-2 text-xs text-slate-600 font-mono"
                style={{ borderTop: '1px solid color-mix(in srgb, var(--hive-accent) 8%, transparent)' }}
              >
                Theme saved automatically
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
