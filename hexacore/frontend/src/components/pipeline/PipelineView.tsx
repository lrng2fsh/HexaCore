import React from 'react';
import { Workflow, TaskNode } from '../../api/client';

const STATUS_COLORS: Record<string, string> = {
  pending: '#555577',
  running: '#d4a017',
  blocked: '#cc3333',
  done: '#22aa66',
  failed: '#cc3333',
};

const STATUS_LABELS: Record<string, string> = {
  pending: '○ Pending',
  running: '◉ Running',
  blocked: '✕ Blocked',
  done: '✓ Done',
  failed: '✕ Failed',
};

interface NodeCardProps {
  node: TaskNode;
  allNodes: TaskNode[];
}

function NodeCard({ node, allNodes }: NodeCardProps) {
  const color = STATUS_COLORS[node.status] ?? '#555';
  const deps = node.dependencies
    .map((d) => allNodes.find((n) => n.id === d)?.type ?? d)
    .join(', ');

  return (
    <div style={{
      border: `2px solid ${color}`,
      borderRadius: 8,
      padding: '12px 16px',
      minWidth: 200,
      background: '#13131f',
      position: 'relative',
    }}>
      <div style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>{node.assigned_agent}</div>
      <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 6 }}>{node.type.replace(/_/g, ' ')}</div>
      <div style={{
        display: 'inline-block',
        padding: '2px 8px',
        borderRadius: 12,
        background: color + '33',
        color,
        fontSize: 11,
        fontWeight: 600,
      }}>
        {STATUS_LABELS[node.status]}
      </div>
      {deps && (
        <div style={{ fontSize: 10, color: '#666', marginTop: 6 }}>
          deps: {deps}
        </div>
      )}
      {node.error && (
        <div style={{ fontSize: 11, color: '#ff6666', marginTop: 4 }}>
          ⚠ {node.error}
        </div>
      )}
    </div>
  );
}

interface Props {
  workflow: Workflow | null;
}

export function PipelineView({ workflow }: Props) {
  if (!workflow) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#555' }}>
        Submit a task to see the pipeline
      </div>
    );
  }

  // Group nodes by dependency level for layout
  const levels: TaskNode[][] = [];
  const placed = new Set<string>();

  const getLevel = (node: TaskNode): number => {
    if (node.dependencies.length === 0) return 0;
    return Math.max(...node.dependencies.map((d) => {
      const dep = workflow.nodes.find((n) => n.id === d);
      return dep ? getLevel(dep) + 1 : 0;
    }));
  };

  const maxLevel = Math.max(...workflow.nodes.map(getLevel));
  for (let i = 0; i <= maxLevel; i++) {
    levels.push(workflow.nodes.filter((n) => getLevel(n) === i && !placed.has(n.id)));
    levels[i].forEach((n) => placed.add(n.id));
  }

  const done = workflow.nodes.filter((n) => n.status === 'done').length;
  const total = workflow.nodes.length;

  return (
    <div style={{ padding: 24, height: '100%', overflowY: 'auto' }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{workflow.name}</div>
        <div style={{ fontSize: 13, color: '#888', marginBottom: 8 }}>{workflow.description}</div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <span style={{
            padding: '3px 10px',
            borderRadius: 12,
            background: STATUS_COLORS[workflow.status] + '33',
            color: STATUS_COLORS[workflow.status],
            fontSize: 12,
            fontWeight: 600,
          }}>
            {workflow.status.toUpperCase()}
          </span>
          <span style={{ fontSize: 12, color: '#888' }}>{done}/{total} tasks</span>
          <span style={{ fontSize: 11, color: '#555' }}>ID: {workflow.id}</span>
        </div>
      </div>

      {/* Pipeline DAG */}
      <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start', overflowX: 'auto', paddingBottom: 16 }}>
        {levels.map((level, i) => (
          <React.Fragment key={i}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {level.map((node) => (
                <NodeCard key={node.id} node={node} allNodes={workflow.nodes} />
              ))}
            </div>
            {i < levels.length - 1 && (
              <div style={{ display: 'flex', alignItems: 'center', color: '#444', fontSize: 20, alignSelf: 'center' }}>
                →
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      {workflow.summary && (
        <div style={{
          marginTop: 24,
          padding: 16,
          background: '#13131f',
          borderRadius: 8,
          border: '1px solid #2a2a3a',
          fontSize: 13,
          color: '#aaa',
          whiteSpace: 'pre-wrap',
        }}>
          <div style={{ fontWeight: 600, color: '#ccc', marginBottom: 8 }}>Summary</div>
          {workflow.summary}
        </div>
      )}
    </div>
  );
}
