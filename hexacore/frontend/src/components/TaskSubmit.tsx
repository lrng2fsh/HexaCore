import React, { useState } from 'react';

interface Props {
  onSubmit: (title: string, description: string) => void;
  loading: boolean;
}

export function TaskSubmit({ onSubmit, loading }: Props) {
  const [title, setTitle] = useState('Fix export failure in QA');
  const [description, setDescription] = useState(
    'The export feature is failing with a null reference error when processing orders with empty items.'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && description.trim()) {
      onSubmit(title.trim(), description.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Task title"
        disabled={loading}
        style={{
          background: '#1a1a2a',
          border: '1px solid #2a2a3a',
          borderRadius: 6,
          padding: '8px 12px',
          color: '#e0e0f0',
          fontSize: 13,
          outline: 'none',
        }}
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Task description"
        disabled={loading}
        rows={3}
        style={{
          background: '#1a1a2a',
          border: '1px solid #2a2a3a',
          borderRadius: 6,
          padding: '8px 12px',
          color: '#e0e0f0',
          fontSize: 13,
          resize: 'vertical',
          outline: 'none',
          fontFamily: 'inherit',
        }}
      />
      <button
        type="submit"
        disabled={loading || !title.trim()}
        style={{
          background: loading ? '#2a2a4a' : '#4455cc',
          color: loading ? '#666' : '#fff',
          border: 'none',
          borderRadius: 6,
          padding: '8px 16px',
          fontSize: 13,
          fontWeight: 600,
          cursor: loading ? 'not-allowed' : 'pointer',
          transition: 'background 0.15s',
        }}
      >
        {loading ? '⟳ Running...' : '▶ Submit Task'}
      </button>
    </form>
  );
}
