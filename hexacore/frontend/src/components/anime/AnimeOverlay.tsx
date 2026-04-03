import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

// Katakana characters for the rain effect
const KATAKANA = '\u30A2\u30A4\u30A6\u30A8\u30AA\u30AB\u30AD\u30AF\u30B1\u30B3\u30B5\u30B7\u30B9\u30BB\u30BD\u30BF\u30C1\u30C4\u30C6\u30C8\u30CA\u30CB\u30CC\u30CD\u30CE\u30CF\u30D2\u30D5\u30D8\u30DB\u30DE\u30DF\u30E0\u30E1\u30E2\u30E4\u30E6\u30E8\u30E9\u30EA\u30EB\u30EC\u30ED\u30EF\u30F2\u30F3';
// Farsi/Arabic characters for Persian theme
const FARSI = '\u0627\u0628\u067E\u062A\u062B\u062C\u0686\u062D\u062E\u062F\u0630\u0631\u0632\u0633\u0634\u0635\u0636\u0637\u0638\u0639\u063A\u0641\u0642\u06A9\u06AF\u0644\u0645\u0646\u0648\u0647\u06CC';

interface AnimeOverlayProps {
  isAnime: boolean;
  isPersian?: boolean;
}

export function AnimeOverlay({ isAnime, isPersian = false }: AnimeOverlayProps) {
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

      {/* Katakana/Farsi side strips */}
      <KatakanaStrip side="left" isPersian={isPersian} />
      <KatakanaStrip side="right" isPersian={isPersian} />
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

function KatakanaStrip({ side, isPersian = false }: { side: 'left' | 'right'; isPersian?: boolean }) {
  const charset = isPersian ? FARSI : KATAKANA;
  const chars = Array.from({ length: 20 }, (_, i) =>
    charset[Math.floor(Math.random() * charset.length)]
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
