import React, { useEffect } from 'react';
import { useStore } from './store/useStore';
import { AgentSidebar } from './components/agents/AgentSidebar';
import { AgentInspector } from './components/agents/AgentInspector';
import { PipelineView } from './components/pipeline/PipelineView';
import { TaskSubmit } from './components/TaskSubmit';
import { MessageLog } from './components/MessageLog';

const PANEL = {
  sidebar: { width: 200, background: '#0f0f1a', borderRight: '1px solid #1e1e2e' },
  inspector: { width: 280, background: '#0f0f1a', borderLeft: '1px solid #1e1e2e' },
  header: { height: 48, background: '#0a0a14', borderBottom: '1px solid #1e1e2e' },
  bottom: { height: 180, background: '#0a0a14', borderTop: '1px solid #1e1e2e' },
};

export default function App() {
  const {
    workflows, activeWorkflow, agents, selectedAgent, messages,
    loading, error,
    submitTask, loadAgents, loadMessages, selectAgent, clearError,
  } = useStore();

  useEffect(() => {
    loadAgents();
    loadMessages();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ ...PANEL.header, display: 'flex', alignItems: 'center', padding: '0 20px', gap: 16, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 20 }}>⬡</span>
          <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: 1 }}>HEXACORE</span>
          <span style={{ fontSize: 11, color: '#555', marginLeft: 4 }}>AI Engineering OS</span>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ fontSize: 11, color: '#555' }}>
          {agents.length} agents · {workflows.length} workflows
        </div>
      </div>

      {/* Main area */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left sidebar */}
        <div style={{ ...PANEL.sidebar, display: 'flex', flexDirection: 'column', flexShrink: 0, overflowY: 'auto' }}>
          <div style={{ padding: '12px 12px 8px', borderBottom: '1px solid #1a1a2a' }}>
            <TaskSubmit onSubmit={submitTask} loading={loading} />
          </div>
          <AgentSidebar agents={agents} selected={selectedAgent} onSelect={selectAgent} />

          {workflows.length > 0 && (
            <div style={{ padding: '8px', borderTop: '1px solid #1a1a2a', marginTop: 'auto' }}>
              <div style={{ fontSize: 11, color: '#666', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6, paddingLeft: 4 }}>
                Workflows
              </div>
              {workflows.map((wf) => (
                <div
                  key={wf.id}
                  onClick={() => useStore.getState().selectWorkflow(wf)}
                  style={{
                    padding: '6px 8px',
                    borderRadius: 4,
                    cursor: 'pointer',
                    fontSize: 11,
                    color: activeWorkflow?.id === wf.id ? '#aabbff' : '#777',
                    background: activeWorkflow?.id === wf.id ? '#1a1a30' : 'transparent',
                    marginBottom: 2,
                  }}
                >
                  {wf.name.slice(0, 24)}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Main panel */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {error && (
            <div style={{
              padding: '8px 16px',
              background: '#330000',
              color: '#ff8888',
              fontSize: 12,
              display: 'flex',
              justifyContent: 'space-between',
            }}>
              <span>⚠ {error}</span>
              <button onClick={clearError} style={{ background: 'none', border: 'none', color: '#ff8888', cursor: 'pointer' }}>✕</button>
            </div>
          )}
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <PipelineView workflow={activeWorkflow} />
          </div>
        </div>

        {/* Right inspector */}
        <div style={{ ...PANEL.inspector, flexShrink: 0, overflowY: 'auto' }}>
          <AgentInspector agent={selectedAgent} messages={messages} />
        </div>
      </div>

      {/* Bottom message log */}
      <div style={{ ...PANEL.bottom, flexShrink: 0 }}>
        <MessageLog messages={messages} />
      </div>
    </div>
  );
}
