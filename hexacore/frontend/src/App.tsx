import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TopBar } from './components/layout/TopBar';
import { NavRail, ViewId } from './components/layout/NavRail';
import { HiveInspector } from './components/inspector/HiveInspector';
import { SignalFeedPanel } from './components/console/SignalFeedPanel';
import { TaskModal } from './components/TaskModal';
import { HiveOverview } from './views/HiveOverview';
import { HoneycombFlow } from './views/HoneycombFlow';
import { QueenChamber } from './views/QueenChamber';
import { WorkerBees } from './views/WorkerBees';
import { SystemMap } from './views/SystemMap';
import { KnowledgeGraph } from './views/KnowledgeGraph';
import { MOCK_AGENTS, Agent } from './lib/mockData';
import { BookOpen, CheckSquare, ScrollText, Settings } from 'lucide-react';

export default function App() {
  const [activeView, setActiveView] = useState<ViewId>('overview');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [consoleCollapsed, setConsoleCollapsed] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

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
    } catch {
      // mock mode — ignore network errors
    }
    setLoading(false);
    setTaskModalOpen(false);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden hive-bg">
      {/* Top bar */}
      <TopBar onNewTask={() => setTaskModalOpen(true)} isRunning={true} />

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Nav rail */}
        <NavRail activeView={activeView} onNavigate={setActiveView} />

        {/* Center content */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeView}
                className="h-full"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {activeView === 'overview' && (
                  <HiveOverview
                    agents={MOCK_AGENTS}
                    selectedAgent={selectedAgent}
                    onSelectAgent={handleSelectAgent}
                  />
                )}
                {activeView === 'queen' && <QueenChamber />}
                {activeView === 'workers' && (
                  <WorkerBees
                    onSelectAgent={handleSelectAgent}
                    selectedAgent={selectedAgent}
                  />
                )}
                {activeView === 'flow' && <HoneycombFlow />}
                {activeView === 'system' && <SystemMap />}
                {activeView === 'knowledge' && <KnowledgeGraph />}
                {activeView === 'approvals' && <PlaceholderView icon={<CheckSquare size={32} />} title="Approvals" subtitle="GATE CHAMBER" />}
                {activeView === 'logs' && <PlaceholderView icon={<ScrollText size={32} />} title="Logs" subtitle="SIGNAL ARCHIVE" />}
                {activeView === 'settings' && <PlaceholderView icon={<Settings size={32} />} title="Settings" subtitle="HIVE CONFIG" />}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Bottom console */}
          <SignalFeedPanel
            collapsed={consoleCollapsed}
            onToggle={() => setConsoleCollapsed(p => !p)}
          />
        </div>

        {/* Right inspector */}
        <HiveInspector agent={selectedAgent} onClose={() => setSelectedAgent(null)} />
      </div>

      {/* Task modal */}
      <TaskModal
        open={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        onSubmit={handleSubmitTask}
        loading={loading}
      />
    </div>
  );
}

function PlaceholderView({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-700">
      <motion.div
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {icon}
      </motion.div>
      <div className="text-sm font-medium text-slate-600">{title}</div>
      <div className="text-xs font-mono text-amber-800/40 tracking-widest">{subtitle}</div>
    </div>
  );
}
