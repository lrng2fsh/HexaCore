import React from 'react';
import { Message } from '../api/client';

interface Props {
  messages: Message[];
}

const TYPE_COLOR: Record<string, string> = {
  finding: '#5599ff',
  handoff: '#aa55ff',
  result: '#22aa66',
  risk: '#ff6644',
  question: '#ffaa22',
  approval_request: '#ff8844',
};

export function MessageLog({ messages }: Props) {
  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: '8px 16px' }}>
      <div style={{ fontSize: 11, color: '#666', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
        Message Bus ({messages.length})
      </div>
      {messages.length === 0 ? (
        <div style={{ fontSize: 12, color: '#444' }}>No messages yet</div>
      ) : (
        [...messages].reverse().map((m) => (
          <div key={m.id} style={{
            display: 'flex',
            gap: 10,
            marginBottom: 6,
            fontSize: 12,
            alignItems: 'flex-start',
          }}>
            <span style={{ color: '#555', flexShrink: 0, fontSize: 10, paddingTop: 1 }}>
              {new Date(m.timestamp).toLocaleTimeString()}
            </span>
            <span style={{
              padding: '1px 6px',
              borderRadius: 4,
              background: (TYPE_COLOR[m.type] ?? '#555') + '22',
              color: TYPE_COLOR[m.type] ?? '#888',
              fontSize: 10,
              fontWeight: 600,
              flexShrink: 0,
            }}>
              {m.type}
            </span>
            <span style={{ color: '#aaa' }}>
              <span style={{ color: '#7788cc' }}>{m.from}</span>
              {' → '}
              <span style={{ color: '#55aa88' }}>{m.to}</span>
              {': '}
              <span style={{ color: '#777' }}>
                {JSON.stringify(m.payload).slice(0, 100)}
              </span>
            </span>
          </div>
        ))
      )}
    </div>
  );
}
