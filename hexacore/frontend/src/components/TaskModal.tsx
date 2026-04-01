import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Hexagon } from 'lucide-react';

interface TaskModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (title: string, description: string) => void;
  loading: boolean;
  isAnime?: boolean;
}

export function TaskModal({ open, onClose, onSubmit, loading, isAnime = false }: TaskModalProps) {
  const [title, setTitle] = useState('Fix export failure in QA');
  const [description, setDescription] = useState(
    'The export feature is failing with a null reference error when processing orders with empty items.'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && description.trim()) onSubmit(title.trim(), description.trim());
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed z-50"
            style={{ top: '50%', left: '50%', width: '100%', maxWidth: '28rem', x: '-50%', y: '-50%' }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <div className="rounded overflow-hidden"
              style={{
                background: isAnime ? 'linear-gradient(135deg, #02040a, #050810)' : 'linear-gradient(135deg, #111118 0%, #16161f 100%)',
                border: `1px solid ${isAnime ? 'rgba(0,255,240,0.3)' : 'rgba(245,158,11,0.3)'}`,
                boxShadow: `0 0 40px color-mix(in srgb, var(--hive-accent) 15%, transparent)`,
              }}>
              {/* Anime corner brackets */}
              {isAnime && (
                <>
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2" style={{ borderColor: 'var(--hive-accent)' }} />
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2" style={{ borderColor: 'var(--hive-accent)' }} />
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2" style={{ borderColor: 'var(--hive-accent)' }} />
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2" style={{ borderColor: 'var(--hive-accent)' }} />
                </>
              )}
              {/* Header */}
              <div className="flex items-center gap-3 px-5 py-4"
                style={{ borderBottom: `1px solid color-mix(in srgb, var(--hive-accent) 15%, transparent)` }}>
                <Hexagon size={16} style={{ color: 'var(--hive-accent)' }} />
                <div>
                  <div className={`text-sm font-semibold ${isAnime ? 'font-orbitron' : ''}`}
                    style={{ color: isAnime ? 'var(--hive-accent-text)' : '#f1f5f9' }}>
                    {isAnime ? '新タスク / NEW TASK' : 'New Task'}
                  </div>
                  <div className="text-xs font-mono-tech" style={{ color: '#4b5563' }}>
                    {isAnime ? '女王がワークフローを構築します' : 'Queen will build and execute the workflow'}
                  </div>
                </div>
                <button onClick={onClose} className="ml-auto transition-colors" style={{ color: '#4b5563' }}>
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                <div>
                  <label className="text-xs font-mono text-amber-700/60 tracking-widest block mb-1.5">TASK TITLE</label>
                  <input
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    disabled={loading}
                    className="w-full bg-slate-900/60 border border-slate-700/60 rounded-lg px-3 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-600/50 transition-colors"
                    placeholder="Describe the task..."
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-amber-700/60 tracking-widest block mb-1.5">DESCRIPTION</label>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    disabled={loading}
                    rows={4}
                    className="w-full bg-slate-900/60 border border-slate-700/60 rounded-lg px-3 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-600/50 transition-colors resize-none font-sans"
                    placeholder="Provide context and details..."
                  />
                </div>
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={onClose}
                    className="flex-1 py-2.5 rounded-lg border border-slate-700/50 text-sm text-slate-400 hover:text-slate-200 hover:border-slate-600 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={loading || !title.trim()}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
                    style={{ background: loading ? 'rgba(245,158,11,0.1)' : 'rgba(245,158,11,0.2)', border: '1px solid rgba(245,158,11,0.4)', color: '#fbbf24' }}>
                    {loading ? (
                      <motion.div className="w-4 h-4 border-2 border-amber-500/30 border-t-amber-500 rounded-full"
                        animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} />
                    ) : <Send size={14} />}
                    {loading ? 'Dispatching...' : 'Dispatch to Queen'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
