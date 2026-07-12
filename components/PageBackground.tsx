'use client';

import type { Draft, Page } from '@/lib/types';
import { ACCENT } from '@/lib/tokens';

/** Fond d'une page selon son type (raster/image, ou blanc). */
export function PageBackground({ page }: { page: Page }) {
  if (page.kind === 'image') {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={page.src}
        alt=""
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'fill',
          pointerEvents: 'none',
          userSelect: 'none',
        }}
        draggable={false}
      />
    );
  }
  return null; // blank
}

/** Aperçu du brouillon en cours de tracé (redaction / highlight / shape / draw). */
export function DraftView({ draft }: { draft: Draft }) {
  if (draft.type === 'draw') {
    const pts = draft.pts.map((p) => p.join(',')).join(' ');
    return (
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
        <polyline
          points={pts}
          fill="none"
          stroke={draft.color}
          strokeWidth={draft.strokeW}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  const st: React.CSSProperties = {
    position: 'absolute',
    left: draft.x,
    top: draft.y,
    width: draft.w,
    height: draft.h,
    pointerEvents: 'none',
  };

  if (draft.type === 'redaction') {
    return <div style={{ ...st, background: '#000', opacity: 0.85 }} />;
  }
  if (draft.type === 'highlight') {
    return <div style={{ ...st, background: draft.color, opacity: 0.45 }} />;
  }
  // shape
  if (draft.shape === 'ellipse') {
    return <div style={{ ...st, border: `2px dashed ${draft.stroke}`, borderRadius: '50%' }} />;
  }
  return <div style={{ ...st, border: `2px dashed ${draft.stroke}` }} />;
}

export { ACCENT };
