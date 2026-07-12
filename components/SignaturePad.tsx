'use client';

import { useEffect, useRef } from 'react';
import { useEditor } from '@/lib/store';
import type { SignatureElement } from '@/lib/types';
import ActionButton from './ui/ActionButton';

/** Pad de signature : dessin libre sur canvas + Effacer / Valider. */
export default function SignaturePad({ el }: { el: SignatureElement }) {
  const updateEl = useEditor((st) => st.updateEl);
  const commit = useEditor((st) => st.commit);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const hasStroke = useRef(false);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  // Ré-init du canvas si on change d'élément signature.
  useEffect(() => {
    hasStroke.current = false;
  }, [el.id]);

  function toCanvasPoint(e: React.MouseEvent<HTMLCanvasElement>) {
    const c = canvasRef.current!;
    const r = c.getBoundingClientRect();
    return {
      x: (e.clientX - r.left) * (c.width / r.width),
      y: (e.clientY - r.top) * (c.height / r.height),
    };
  }

  function onDown(e: React.MouseEvent<HTMLCanvasElement>) {
    const c = canvasRef.current;
    if (!c) return;
    drawing.current = true;
    const ctx = c.getContext('2d')!;
    ctxRef.current = ctx;
    ctx.lineWidth = 2.4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#12233A';
    const p = toCanvasPoint(e);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
  }

  function onMove(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!drawing.current || !ctxRef.current) return;
    const p = toCanvasPoint(e);
    ctxRef.current.lineTo(p.x, p.y);
    ctxRef.current.stroke();
    hasStroke.current = true;
  }

  function onUp() {
    drawing.current = false;
  }

  function clear() {
    const c = canvasRef.current;
    if (c) c.getContext('2d')?.clearRect(0, 0, c.width, c.height);
    hasStroke.current = false;
    updateEl(el.id, { sigSrc: null });
  }

  function apply() {
    const c = canvasRef.current;
    if (c && hasStroke.current) {
      commit();
      updateEl(el.id, { sigSrc: c.toDataURL(), mode: 'draw' });
    }
  }

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={256}
        height={96}
        onMouseDown={onDown}
        onMouseMove={onMove}
        onMouseUp={onUp}
        onMouseLeave={onUp}
        aria-label="Zone de tracé de la signature"
        style={{
          width: '100%',
          height: 96,
          border: '1px solid var(--pd-border)',
          borderRadius: 8,
          background: '#fff',
          cursor: 'crosshair',
          touchAction: 'none',
        }}
      />
      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <ActionButton label="Effacer" icon="fas fa-eraser" onClick={clear} />
        <ActionButton label="Valider" icon="fas fa-check" onClick={apply} />
      </div>
    </div>
  );
}
