import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';

interface KNode { id: string; label: string; type: string; x: number; y: number; connections: string[] }

const KNODES: KNode[] = [
  { id: 'export', label: 'ExportService', type: 'code', x: 280, y: 140, connections: ['order', 'null-ref', 'handler'] },
  { id: 'order', label: 'Order Model', type: 'model', x: 120, y: 80, connections: ['items'] },
  { id: 'items', label: 'order.items', type: 'field', x: 60, y: 200, connections: ['null-ref'] },
  { id: 'null-ref', label: 'NullReference', type: 'bug', x: 200, y: 260, connections: ['fix'] },
  { id: 'handler', label: 'ExportHandler', type: 'code', x: 400, y: 80, connections: ['null-ref'] },
  { id: 'fix', label: 'Null Check Fix', type: 'fix', x: 340, y: 300, connections: ['test'] },
  { id: 'test', label: 'test_export_empty', type: 'test', x: 460, y: 220, connections: [] },
  { id: 'schema', label: 'exports table', type: 'schema', x: 160, y: 360, connections: ['index'] },
  { id: 'index', label: 'idx_status', type: 'fix', x: 300, y: 400, connections: [] },
];

const TYPE_COLOR: Record<string, string> = {
  code: '#3b82f6', model: '#8b5cf6', field: '#6b7280', bug: '#ef4444',
  fix: '#10b981', test: '#f59e0b', schema: '#06b6d4', index: '#10b981',
};

export function KnowledgeGraph() {
  return (
    <div className="h-full overflow-hidden p-6">
      <div className="text-xs font-mono text-amber-700/50 tracking-widest mb-4">KNOWLEDGE GRAPH — POLLEN STORE</div>

      <div className="relative w-full h-full">
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {KNODES.map(node =>
            node.connections.map(targetId => {
              const target = KNODES.find(n => n.id === targetId);
              if (!target) return null;
              return (
                <motion.line
                  key={`${node.id}-${targetId}`}
                  x1={node.x + 36} y1={node.y + 14}
                  x2={target.x + 36} y2={target.y + 14}
                  stroke={`${TYPE_COLOR[node.type]}44`}
                  strokeWidth={1}
                  strokeDasharray="3 4"
                  animate={{ strokeDashoffset: [0, -14] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                />
              );
            })
          )}
        </svg>

        {KNODES.map((node, i) => (
          <motion.div
            key={node.id}
            style={{ position: 'absolute', left: node.x, top: node.y }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.06, type: 'spring' }}
            whileHover={{ scale: 1.1, zIndex: 10 }}
            className="cursor-pointer"
          >
            <div className="px-2.5 py-1.5 rounded border text-xs font-mono whitespace-nowrap"
              style={{
                borderColor: `${TYPE_COLOR[node.type]}44`,
                background: `${TYPE_COLOR[node.type]}10`,
                color: TYPE_COLOR[node.type],
                boxShadow: `0 0 8px ${TYPE_COLOR[node.type]}22`,
              }}>
              {node.label}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
