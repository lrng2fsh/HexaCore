import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Hexagon } from 'lucide-react';

interface TaskModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (title: string, description: string) => void;
  loading: boolean;
}

export function TaskModal({ open, onClose, onSubmit, loading }: TaskModalProps) {
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
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <div className="rounded-xl border border-amber-600/30 overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #111118 0%, #16161f 100%)', boxShadow: '0 0 40px rgba(245,158,11,0.15)' }}>
              {/* Header */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-amber-900/20">
                <Hexagon size={16} className="text-amber-500" />
                <div>
                  <div className="text-sm font-semibold text-slate-100">New Task</div>
                  <div className="text-xs text-slate-500">Queen will build and execute the workflow</div>
                </div>
                <button onClick={onClose} className="ml-auto text-slate-600 hover:text-slate-300 transition-colors">
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
