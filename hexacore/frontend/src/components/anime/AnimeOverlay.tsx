import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

// Katakana characters for the rain effect
const KATAKANA = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';

interface AnimeOverlayProps {
  isAnime: boolean;
}

export function AnimeOverlay({ isAnime }: AnimeOverlayProps) {
  if (!isAnime) return null;

  return (
    <>
      {/* Scanline overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-[200]"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,240,0.015) 2px, rgba(0,255,240,0.015) 4px)',
        }}
      />

      {/* Moving scan line */}
      <motion.div
        className="fixed left-0 right-0 h-px pointer-events-none z-[201]"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(0,255,240,0.4), transparent)' }}
        animate={{ top: ['-2px', '100vh'] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
      />

      {/* Corner decorations */}
      <CornerDeco position="top-left" />
      <CornerDeco position="top-right" />
      <CornerDeco position="bottom-left" />
      <CornerDeco position="bottom-right" />

      {/* Katakana side strips */}
      <KatakanaStrip side="left" />
      <KatakanaStrip side="right" />
    </>
  );
}

function CornerDeco({ position }: { position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' }) {
  const styles: Record<string, React.CSSProperties> = {
    'top-left':     { top: 48, left: 56 },
    'top-right':    { top: 48, right: 0 },
    'bottom-left':  { bottom: 36, left: 56 },
    'bottom-right': { bottom: 36, right: 0 },
  };
  const isRight = position.includes('right');
  const isBottom = position.includes('bottom');

  return (
    <div className="fixed pointer-events-none z-[199]" style={styles[position]}>
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        {/* Corner bracket */}
        <path
          d={isRight
            ? (isBottom ? 'M40 0 L40 40 L0 40' : 'M0 0 L40 0 L40 40')
            : (isBottom ? 'M0 0 L0 40 L40 40' : 'M40 0 L0 0 L0 40')}
          stroke="rgba(0,255,240,0.5)"
          strokeWidth="1.5"
          fill="none"
        />
        {/* Tick marks */}
        <motion.circle
          cx={isRight ? 38 : 2}
          cy={isBottom ? 38 : 2}
          r="2"
          fill="#00fff0"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </svg>
    </div>
  );
}

function KatakanaStrip({ side }: { side: 'left' | 'right' }) {
  const chars = Array.from({ length: 20 }, (_, i) =>
    KATAKANA[Math.floor(Math.random() * KATAKANA.length)]
  );

  return (
    <div
      className="fixed top-12 bottom-9 pointer-events-none z-[198] flex flex-col justify-around items-center overflow-hidden"
      style={{
        [side]: side === 'left' ? 56 : 0,
        width: 14,
        opacity: 0.15,
      }}
    >
      {chars.map((char, i) => (
        <motion.span
          key={i}
          className="font-mono-tech text-xs"
          style={{ color: '#00fff0', fontSize: 9, lineHeight: 1 }}
          animate={{ opacity: [0.2, 0.8, 0.2] }}
          transition={{ duration: 2 + Math.random() * 3, delay: i * 0.15, repeat: Infinity }}
        >
          {char}
        </motion.span>
      ))}
    </div>
  );
}
