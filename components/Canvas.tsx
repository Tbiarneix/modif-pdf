'use client';

import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { useEditor, PAGE_W } from '@/lib/store';
import { HILITE } from '@/lib/tokens';
import { pointToPage, boxFromDrag, applyResize, pageDisplay } from '@/lib/geometry';
import type { Draft, Element, Handle, ShapeKind, Tool } from '@/lib/types';
import ElementView, { ElementCallbacks } from './ElementView';
import { PageBackground, DraftView } from './PageBackground';
import s from './Canvas.module.css';

type Op =
  | { mode: 'move'; id: string; rect: DOMRect; px: number; py: number; ex: number; ey: number; moved: boolean; etype: string }
  | { mode: 'resize'; id: string; handle: Handle; rect: DOMRect; px: number; py: number; ex: number; ey: number; ew: number; eh: number }
  | { mode: 'create'; tool: Tool; rect: DOMRect; page: number; sx: number; sy: number }
  | { mode: 'draw'; rect: DOMRect; page: number };

const CLICK_PLACE: Tool[] = ['text', 'field', 'check', 'signature', 'image'];

/** Args de rotation (rotation, W, H) de la page active, pour pointToPage. */
function pageRot(st: ReturnType<typeof useEditor.getState>): [number, number, number] {
  const pg = st.pages[st.activePage];
  return [pg?.rotation ?? 0, PAGE_W, pg?.h ?? 1123];
}

function newDraft(tool: Tool, shapeKind: ShapeKind, x: number, y: number, page: number): Draft {
  if (tool === 'redaction') return { type: 'redaction', page, x, y, w: 1, h: 1 };
  if (tool === 'highlight') return { type: 'highlight', page, x, y, w: 1, h: 1, color: HILITE[0] };
  // shape
  return {
    type: 'shape',
    page,
    shape: shapeKind,
    x,
    y,
    w: 1,
    h: 1,
    stroke: '#0075F1',
    fill: 'transparent',
    strokeW: 2,
  };
}

export default function Canvas() {
  const pages = useEditor((st) => st.pages);
  const activePage = useEditor((st) => st.activePage);
  const zoom = useEditor((st) => st.zoom);
  const tool = useEditor((st) => st.tool);
  const elements = useEditor((st) => st.elements);
  const selectedId = useEditor((st) => st.selectedId);
  const editingId = useEditor((st) => st.editingId);
  const draft = useEditor((st) => st.draft);

  const opRef = useRef<Op | null>(null);

  const page = pages[activePage];

  const pickImage = useCallback((id: string) => {
    const inp = document.createElement('input');
    inp.type = 'file';
    inp.accept = 'image/*';
    inp.onchange = () => {
      const f = inp.files?.[0];
      if (!f) return;
      const rd = new FileReader();
      rd.onload = () => {
        const img = new Image();
        img.onload = () => {
          const el = useEditor.getState().getEl(id);
          const w = el ? el.w : 140;
          useEditor.getState().updateEl(id, { src: rd.result as string, h: w * (img.height / img.width) });
        };
        img.src = rd.result as string;
        useEditor.getState().updateEl(id, { src: rd.result as string });
      };
      rd.readAsDataURL(f);
    };
    inp.click();
  }, []);

  // Listeners fenêtre (attachés une fois ; guardés par opRef.current).
  useEffect(() => {
    function toPage(e: MouseEvent) {
      const op = opRef.current;
      const st = useEditor.getState();
      return pointToPage(e.clientX, e.clientY, op!.rect, st.zoom, ...pageRot(st));
    }
    function onMove(e: MouseEvent) {
      const op = opRef.current;
      if (!op) return;
      const st = useEditor.getState();
      const { x, y } = toPage(e);
      if (op.mode === 'draw') {
        const d = st.draft;
        if (d && d.type === 'draw') st.setDraftPoints([...d.pts, [x, y]]);
        return;
      }
      if (op.mode === 'create') {
        const box = boxFromDrag(op.sx, op.sy, x, y);
        st.updateDraft(box);
        return;
      }
      if (op.mode === 'move') {
        const dx = x - op.px;
        const dy = y - op.py;
        if (Math.abs(dx) > 2 || Math.abs(dy) > 2) op.moved = true;
        st.updateEl(op.id, { x: op.ex + dx, y: op.ey + dy });
        return;
      }
      if (op.mode === 'resize') {
        const box = applyResize(op.handle, op, x, y);
        st.updateEl(op.id, box);
      }
    }
    function onUp() {
      const op = opRef.current;
      const st = useEditor.getState();
      if (!op) return;
      if (op.mode === 'create' || op.mode === 'draw') {
        st.commitDraft();
        opRef.current = null;
        return;
      }
      if (op.mode === 'move' && !op.moved && (op.etype === 'text' || op.etype === 'field' || op.etype === 'ptext')) {
        st.setEditing(op.id);
      }
      opRef.current = null;
    }
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
  }, []);

  const onOverlayMouseDown = useCallback((e: React.MouseEvent) => {
    const st = useEditor.getState();
    const t = st.tool;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const { x, y } = pointToPage(e.clientX, e.clientY, rect, st.zoom, ...pageRot(st));
    if (t === 'select') {
      st.select(null);
      return;
    }
    if (CLICK_PLACE.includes(t)) {
      const id = st.createClick(t, x, y, st.activePage);
      if (t === 'image' && id) setTimeout(() => pickImage(id), 30);
      return;
    }
    if (t === 'draw') {
      st.commit();
      opRef.current = { mode: 'draw', rect, page: st.activePage };
      st.startDraft({ type: 'draw', page: st.activePage, pts: [[x, y]], color: '#0075F1', strokeW: 2.5 });
      e.preventDefault();
      return;
    }
    // redaction / highlight / shape
    st.commit();
    opRef.current = { mode: 'create', tool: t, rect, page: st.activePage, sx: x, sy: y };
    st.startDraft(newDraft(t, st.shapeKind, x, y, st.activePage));
    e.preventDefault();
  }, [pickImage]);

  const cb: ElementCallbacks = useMemo(() => ({
    onMouseDown: (e, el) => {
      const st = useEditor.getState();
      if (st.tool !== 'select') return;
      e.stopPropagation();
      const layer = (e.currentTarget as HTMLElement).closest('[data-overlay]');
      if (!layer) return;
      const rect = layer.getBoundingClientRect();
      const { x, y } = pointToPage(e.clientX, e.clientY, rect, st.zoom, ...pageRot(st));
      opRef.current = {
        mode: 'move',
        id: el.id,
        rect,
        px: x,
        py: y,
        ex: el.x,
        ey: el.y,
        moved: false,
        etype: el.type,
      };
      st.commit();
      st.select(el.id);
      e.preventDefault();
    },
    onHandleDown: (e, el, handle) => {
      const st = useEditor.getState();
      e.stopPropagation();
      const layer = (e.currentTarget as HTMLElement).closest('[data-overlay]');
      if (!layer) return;
      const rect = layer.getBoundingClientRect();
      const { x, y } = pointToPage(e.clientX, e.clientY, rect, st.zoom, ...pageRot(st));
      opRef.current = {
        mode: 'resize',
        id: el.id,
        handle,
        rect,
        px: x,
        py: y,
        ex: el.x,
        ey: el.y,
        ew: el.w,
        eh: el.h,
      };
      st.commit();
      e.preventDefault();
    },
    onStartEdit: (el) => useEditor.getState().setEditing(el.id),
    onEditChange: (id, text) => useEditor.getState().updateEl(id, { text } as Partial<Element>),
    onEditBlur: () => useEditor.getState().setEditing(null),
    pickImage,
  }), [pickImage]);

  if (!page) return <div className={s.canvas} />;

  const W = PAGE_W;
  const H = page.h || 1123;
  const disp = pageDisplay(page.rotation ?? 0, W, H);
  const creating = tool !== 'select';
  const pageEls = elements.filter((e) => e.page === activePage);

  return (
    <div
      className={s.canvas}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && tool === 'select') useEditor.getState().select(null);
      }}
    >
      <div className={s.pageWrap} style={{ width: disp.dW * zoom, height: disp.dH * zoom }}>
        <div
          className={s.page}
          style={{ width: W, height: H, transform: `scale(${zoom}) ${disp.transform}` }}
        >
          <PageBackground page={page} />
          <div
            data-overlay
            className={s.overlay}
            style={{
              pointerEvents: creating ? 'auto' : 'none',
              cursor: creating ? 'crosshair' : 'default',
            }}
            onMouseDown={onOverlayMouseDown}
          >
            {pageEls.map((el) => (
              <ElementView
                key={el.id}
                el={el}
                selected={el.id === selectedId}
                editing={el.id === editingId}
                readOnly={false}
                cb={cb}
              />
            ))}
            {draft && draft.page === activePage ? <DraftView draft={draft} /> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
