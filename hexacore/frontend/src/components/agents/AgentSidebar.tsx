import React from 'react';
import { AgentInfo } from '../../api/client';

interface Props {
  agents: AgentInfo[];
  selected: AgentInfo | null;
  onSelect: (agent: AgentInfo) => void;
}

const STATUS_COLOR: Record<string, string> = {
  idle: '#22aa66',
  busy: '#d4a017',
  error: '#cc3333',
  offline: '#555',
};

export function AgentSidebar({ agents, selected, onSelect }: Props) {
  return (
    <div style={{ padding: '12px 8px' }}>
      <div style={{ fontSize: 11, color: '#666', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10, paddingLeft: 8 }}>
        Agents ({agents.length})
      </div>
      {agents.map((agent) => (
        <div
          key={agent.id}
          onClick={() => onSelect(agent)}
          style={{
            padding: '8px 12px',
            borderRadius: 6,
            cursor: 'pointer',
            marginBottom: 4,
            background: selected?.id === agent.id ? '#1e1e30' : 'transparent',
            border: selected?.id === agent.id ? '1px solid #3a3a5a' : '1px solid transparent',
            transition: 'all 0.15s',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: STATUS_COLOR[agent.status] ?? '#555',
              flexShrink: 0,
            }} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{agent.id}</div>
              <div style={{ fontSize: 11, color: '#666' }}>{agent.role}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
