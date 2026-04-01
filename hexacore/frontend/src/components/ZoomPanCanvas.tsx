import React, { useRef, useState, useCallback } from 'react';
import { ZoomIn, ZoomOut, Maximize } from 'lucide-react';

interface ZoomPanCanvasProps {
  children: React.ReactNode;
  minZoom?: number;
  maxZoom?: number;
  className?: string;
}

export function ZoomPanCanvas({ children, minZoom = 0.3, maxZoom = 2.5, className = '' }: ZoomPanCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  const clampZoom = (z: number) => Math.min(maxZoom, Math.max(minZoom, z));

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.08 : 0.08;
    setZoom(prev => clampZoom(prev + delta));
  }, [minZoom, maxZoom]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return; // left click only
    setDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
  }, [pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setPan({ x: dragStart.current.panX + dx, y: dragStart.current.panY + dy });
  }, [dragging]);

  const handleMouseUp = useCallback(() => {
    setDragging(false);
  }, []);

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      style={{ cursor: dragging ? 'grabbing' : 'grab' }}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Transformed content */}
      <div
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: 'center center',
          width: '100%',
          height: '100%',
          transition: dragging ? 'none' : 'transform 0.15s ease-out',
        }}
      >
        {children}
      </div>

      {/* Zoom controls — bottom right */}
      <div className="absolute bottom-3 right-3 z-30 flex items-center gap-1">
        <ZoomButton onClick={() => setZoom(prev => clampZoom(prev - 0.15))} title="Zoom out">
          <ZoomOut size={13} />
        </ZoomButton>

        <button
          onClick={resetView}
          className="px-2 py-1 rounded text-xs font-mono-tech transition-all"
          style={{
            background: 'rgba(0,0,0,0.5)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#b8bdd0',
            backdropFilter: 'blur(8px)',
          }}
          title="Reset view"
        >
          {Math.round(zoom * 100)}%
        </button>

        <ZoomButton onClick={() => setZoom(prev => clampZoom(prev + 0.15))} title="Zoom in">
          <ZoomIn size={13} />
        </ZoomButton>

        <ZoomButton onClick={resetView} title="Fit to screen">
          <Maximize size={13} />
        </ZoomButton>
      </div>
    </div>
  );
}

function ZoomButton({ children, onClick, title }: { children: React.ReactNode; onClick: () => void; title: string }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className="p-1.5 rounded transition-all"
      style={{
        background: 'rgba(0,0,0,0.5)',
        border: '1px solid rgba(255,255,255,0.1)',
        color: '#b8bdd0',
        backdropFilter: 'blur(8px)',
      }}
      title={title}
      onMouseDown={e => e.stopPropagation()}
    >
      {children}
    </button>
  );
}
