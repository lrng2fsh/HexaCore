import React from 'react';
import { AgentInfo, Message } from '../../api/client';

interface Props {
  agent: AgentInfo | null;
  messages: Message[];
}

const STATUS_COLOR: Record<string, string> = {
  idle: '#22aa66',
  busy: '#d4a017',
  error: '#cc3333',
  offline: '#555',
};

export function AgentInspector({ agent, messages }: Props) {
  if (!agent) {
    return (
      <div style={{ padding: 20, color: '#555', fontSize: 13 }}>
        Select an agent to inspect
      </div>
    );
  }

  const agentMessages = messages.filter(
    (m) => m.from === agent.id || m.to === agent.id
  ).slice(-10);

  return (
    <div style={{ padding: 16, overflowY: 'auto', height: '100%' }}>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 2 }}>{agent.role}</div>
        <div style={{ fontSize: 11, color: '#666', marginBottom: 8 }}>{agent.id}</div>
        <span style={{
          padding: '2px 8px',
          borderRadius: 10,
          background: (STATUS_COLOR[agent.status] ?? '#555') + '33',
          color: STATUS_COLOR[agent.status] ?? '#555',
          fontSize: 11,
          fontWeight: 600,
        }}>
          {agent.status}
        </span>
      </div>

      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 11, color: '#888', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>Model</div>
        <div style={{ fontSize: 12, color: '#ccc' }}>
          {agent.llm.provider} / {agent.llm.model}
        </div>
      </div>

      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 11, color: '#888', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>Tools</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {agent.tools.length > 0
            ? agent.tools.map((t) => (
                <span key={t} style={{ padding: '2px 8px', background: '#1e1e2e', borderRadius: 4, fontSize: 11, color: '#aaa' }}>{t}</span>
              ))
            : <span style={{ fontSize: 12, color: '#555' }}>none</span>
          }
        </div>
      </div>

      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 11, color: '#888', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>Skills</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {agent.skills.map((s) => (
            <span key={s} style={{ padding: '2px 8px', background: '#1a1a2a', borderRadius: 4, fontSize: 11, color: '#9090cc' }}>{s}</span>
          ))}
        </div>
      </div>

      <div>
        <div style={{ fontSize: 11, color: '#888', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
          Recent Messages ({agentMessages.length})
        </div>
        {agentMessages.length === 0 ? (
          <div style={{ fontSize: 12, color: '#555' }}>No messages yet</div>
        ) : (
          agentMessages.map((m) => (
            <div key={m.id} style={{
              marginBottom: 8,
              padding: 8,
              background: '#13131f',
              borderRadius: 6,
              borderLeft: `3px solid ${m.from === agent.id ? '#5566cc' : '#336655'}`,
            }}>
              <div style={{ fontSize: 10, color: '#666', marginBottom: 2 }}>
                {m.from === agent.id ? `→ ${m.to}` : `← ${m.from}`} [{m.type}]
              </div>
              <div style={{ fontSize: 11, color: '#aaa' }}>
                {JSON.stringify(m.payload).slice(0, 120)}...
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
