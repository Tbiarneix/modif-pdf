'use client';

import { useState } from 'react';
import { useEditor } from '@/lib/store';
import { ACCENT, REDACT_ACTIVE, rgba } from '@/lib/tokens';
import type { ShapeKind, Tool } from '@/lib/types';
import s from './ToolRail.module.css';

interface ToolDef {
  k: Tool;
  i: string;
  l: string;
}

const GROUPS: ToolDef[][] = [
  [{ k: 'select', i: 'fa-arrow-pointer', l: 'Sélection' }],
  [
    { k: 'text', i: 'fa-font', l: 'Texte' },
    { k: 'field', i: 'fa-i-cursor', l: 'Champ à remplir' },
    { k: 'check', i: 'fa-check', l: 'Coche' },
    { k: 'signature', i: 'fa-signature', l: 'Signature' },
    { k: 'image', i: 'fa-image', l: 'Image / logo' },
  ],
  [
    { k: 'draw', i: 'fa-pen', l: 'Dessin libre' },
    { k: 'highlight', i: 'fa-highlighter', l: 'Surligner' },
    { k: 'shape', i: 'fa-shapes', l: 'Forme' },
    { k: 'redaction', i: 'fa-marker', l: 'Caviarder' },
  ],
];

const SHAPES: Array<[ShapeKind, string]> = [
  ['rect', 'fa-square-full'],
  ['ellipse', 'fa-circle'],
  ['line', 'fa-minus'],
];

export default function ToolRail() {
  const tool = useEditor((st) => st.tool);
  const shapeKind = useEditor((st) => st.shapeKind);
  const setTool = useEditor((st) => st.setTool);
  const setShapeKind = useEditor((st) => st.setShapeKind);
  const [tip, setTip] = useState<{ l: string; y: number } | null>(null);

  return (
    <div className={s.rail}>
      {GROUPS.map((g, gi) => (
        <div key={gi} className={s.group}>
          {g.map((t) => {
            const on = tool === t.k;
            const isRedact = t.k === 'redaction';
            return (
              <button
                key={t.k}
                className={s.btn}
                aria-label={t.l}
                aria-pressed={on}
                title={t.l}
                onMouseEnter={(e) =>
                  setTip({ l: t.l, y: e.currentTarget.getBoundingClientRect().top + 22 })
                }
                onMouseLeave={() => setTip(null)}
                onClick={() => setTool(t.k)}
                style={{
                  background: on ? (isRedact ? REDACT_ACTIVE : ACCENT) : 'transparent',
                  color: on ? '#fff' : 'var(--pd-ink)',
                  boxShadow: on && !isRedact ? `0 0 16px 0 ${rgba(ACCENT, 0.35)}` : 'none',
                }}
              >
                <i className={`fas ${t.i}`} aria-hidden="true" />
              </button>
            );
          })}
          {gi < GROUPS.length - 1 ? <div className={s.divider} /> : null}
        </div>
      ))}

      {tool === 'shape' ? (
        <div className={s.shapeSub}>
          {SHAPES.map(([k, ic]) => {
            const on = shapeKind === k;
            return (
              <button
                key={k}
                className={s.shapeBtn}
                aria-label={`Forme ${k}`}
                aria-pressed={on}
                title={k}
                onClick={() => setShapeKind(k)}
                style={{
                  background: on ? rgba(ACCENT, 0.12) : 'transparent',
                  color: on ? ACCENT : 'var(--pd-gray)',
                }}
              >
                <i className={`far ${ic}`} aria-hidden="true" />
              </button>
            );
          })}
        </div>
      ) : null}

      {tip ? (
        <div className={s.tip} style={{ left: 70, top: tip.y }} role="tooltip">
          <span className={s.tipArrow} />
          {tip.l}
        </div>
      ) : null}
    </div>
  );
}
