import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TopBar } from './components/layout/TopBar';
import { NavRail, ViewId } from './components/layout/NavRail';
import { HiveInspector } from './components/inspector/HiveInspector';
import { SignalFeedPanel } from './components/console/SignalFeedPanel';
import { TaskModal } from './components/TaskModal';
import { AnimeOverlay } from './components/anime/AnimeOverlay';
import { HiveOverview } from './views/HiveOverview';
import { HoneycombFlow } from './views/HoneycombFlow';
import { QueenChamber } from './views/QueenChamber';
import { WorkerBees } from './views/WorkerBees';
import { SystemMap } from './views/SystemMap';
import { KnowledgeGraph } from './views/KnowledgeGraph';
import { MOCK_AGENTS, Agent } from './lib/mockData';
import { Theme, loadSavedTheme, applyTheme } from './lib/themes';
import { CheckSquare, ScrollText, Settings } from 'lucide-react';

export default function App() {
  const [activeView, setActiveView] = useState<ViewId>('overview');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [consoleCollapsed, setConsoleCollapsed] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<Theme>(loadSavedTheme);

  const isAnime = currentTheme.id === 'anime';

  useEffect(() => {
    applyTheme(currentTheme);
  }, [currentTheme]);

  const handleSelectAgent = (agent: Agent) => {
    setSelectedAgent(prev => prev?.id === agent.id ? null : agent);
  };

  const handleSubmitTask = async (title: string, description: string) => {
    setLoading(true);
    try {
      await fetch('/api/task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description }),
      });
    } catch { /* mock mode */ }
    setLoading(false);
    setTaskModalOpen(false);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden hive-bg relative">
      {/* Anime overlay effects */}
      <AnimeOverlay isAnime={isAnime} />

      <TopBar
        onNewTask={() => setTaskModalOpen(true)}
        isRunning={true}
        currentTheme={currentTheme}
        onThemeChange={setCurrentTheme}
      />

      <div className="flex flex-1 overflow-hidden">
        <NavRail activeView={activeView} onNavigate={setActiveView} isAnime={isAnime} />

        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeView}
                className="h-full"
                initial={{ opacity: 0, y: isAnime ? 0 : 8, x: isAnime ? 8 : 0 }}
                animate={{ opacity: 1, y: 0, x: 0 }}
                exit={{ opacity: 0, y: isAnime ? 0 : -8, x: isAnime ? -8 : 0 }}
                transition={{ duration: isAnime ? 0.15 : 0.2 }}
              >
                {activeView === 'overview' && (
                  <HiveOverview agents={MOCK_AGENTS} selectedAgent={selectedAgent} onSelectAgent={handleSelectAgent} isAnime={isAnime} />
                )}
                {activeView === 'queen'   && <QueenChamber isAnime={isAnime} />}
                {activeView === 'workers' && <WorkerBees onSelectAgent={handleSelectAgent} selectedAgent={selectedAgent} isAnime={isAnime} />}
                {activeView === 'flow'    && <HoneycombFlow isAnime={isAnime} />}
                {activeView === 'system'  && <SystemMap isAnime={isAnime} />}
                {activeView === 'knowledge' && <KnowledgeGraph isAnime={isAnime} />}
                {activeView === 'approvals' && <PlaceholderView icon={<CheckSquare size={32} />} title="Approvals" titleJP="承認" subtitle="GATE CHAMBER" isAnime={isAnime} />}
                {activeView === 'logs'    && <PlaceholderView icon={<ScrollText size={32} />} title="Logs" titleJP="ログ" subtitle="SIGNAL ARCHIVE" isAnime={isAnime} />}
                {activeView === 'settings' && <PlaceholderView icon={<Settings size={32} />} title="Settings" titleJP="設定" subtitle="HIVE CONFIG" isAnime={isAnime} />}
              </motion.div>
            </AnimatePresence>
          </div>

          <SignalFeedPanel collapsed={consoleCollapsed} onToggle={() => setConsoleCollapsed(p => !p)} isAnime={isAnime} />
        </div>

        <HiveInspector agent={selectedAgent} onClose={() => setSelectedAgent(null)} isAnime={isAnime} />
      </div>

      <TaskModal open={taskModalOpen} onClose={() => setTaskModalOpen(false)} onSubmit={handleSubmitTask} loading={loading} isAnime={isAnime} />
    </div>
  );
}

function PlaceholderView({ icon, title, titleJP, subtitle, isAnime }: {
  icon: React.ReactNode; title: string; titleJP: string; subtitle: string; isAnime: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <motion.div
        style={{ color: 'color-mix(in srgb, var(--hive-accent) 30%, transparent)' }}
        animate={{ opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {icon}
      </motion.div>
      <div className={`font-semibold ${isAnime ? 'font-orbitron' : 'font-rajdhani'}`}
        style={{ color: 'color-mix(in srgb, var(--hive-accent) 40%, #6b7280)', fontSize: isAnime ? 14 : 13 }}>
        {isAnime ? titleJP : title}
      </div>
      <div className="font-mono-tech tracking-widest" style={{ fontSize: 9, color: 'color-mix(in srgb, var(--hive-accent) 20%, transparent)' }}>
        {subtitle}
      </div>
    </div>
  );
}
