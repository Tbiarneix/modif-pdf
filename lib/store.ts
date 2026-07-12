/* ============================================================
   Store Zustand unique de l'éditeur.
   Logique reprise 1:1 du prototype `Editeur PDF.dc.html` (l.142‑273).
   L'op de pointeur (drag/resize/draft) vit HORS du store (useRef côté
   composant) pour éviter des re-renders pendant le déplacement.
   ============================================================ */
import { create } from 'zustand';
import { ACCENT } from './tokens';
import { boxFromPoints } from './geometry';
import type {
  Draft,
  Element,
  FieldValues,
  Page,
  Screen,
  ShapeKind,
  Tool,
} from './types';
import { PAGE_H, PAGE_W } from './types';

let seq = 0;
function uid(): string {
  seq += 1;
  return 'e' + seq.toString(36) + Math.abs(Math.floor((seq * 2654435761) % 1e6)).toString(36);
}

/* ---------- historique (hors state réactif) ---------- */
interface Snapshot {
  e: Element[];
  f: FieldValues;
}
const past: string[] = [];
const future: string[] = [];
const MAX_HISTORY = 60;

/** Résultat d'un import (pdf/image) appliqué au store. */
export interface LoadResult {
  pages: Page[];
  elements: Element[];
  docName: string;
}

export interface EditorState {
  screen: Screen;
  docName: string;
  pages: Page[];
  activePage: number;
  zoom: number;
  tool: Tool;
  shapeKind: ShapeKind;
  elements: Element[];
  selectedId: string | null;
  editingId: string | null;
  draft: Draft | null;
  fieldValues: FieldValues;
  showPreview: boolean;
  exporting: boolean;
  exportPages: string[];
  dragPage: number | null;
  dragOverPage: number | null;

  /* dérivés d'historique (rafraîchis à chaque mutation) */
  canUndo: boolean;
  canRedo: boolean;

  /* actions */
  commit: () => void;
  undo: () => void;
  redo: () => void;

  setTool: (tool: Tool) => void;
  setShapeKind: (k: ShapeKind) => void;

  createClick: (tool: Tool, x: number, y: number, page: number) => string | null;
  startDraft: (draft: Draft) => void;
  updateDraft: (patch: Partial<Draft>) => void;
  setDraftPoints: (pts: Array<[number, number]>) => void;
  commitDraft: () => string | null;
  cancelDraft: () => void;

  pushEl: (el: Element) => void;
  updateEl: (id: string, patch: Partial<Element>) => void;
  getEl: (id: string) => Element | undefined;
  select: (id: string | null) => void;
  setEditing: (id: string | null) => void;
  deleteSel: () => void;
  duplicateSel: () => void;
  bringFront: () => void;
  sendBack: () => void;
  setField: (k: string, v: string | boolean) => void;

  addPage: () => void;
  deletePage: (idx: number) => void;
  rotatePage: (idx: number) => void;
  movePage: (from: number | null, to: number | null) => void;
  setDragPage: (i: number | null) => void;
  setDragOverPage: (i: number | null) => void;

  zoomIn: () => void;
  zoomOut: () => void;
  goPrev: () => void;
  goNext: () => void;
  setDocName: (name: string) => void;

  openPreview: () => void;
  closePreview: () => void;
  goExport: () => void;
  backToEditor: () => void;
  setExporting: (v: boolean) => void;
  setExportPages: (imgs: string[]) => void;

  loadResult: (r: LoadResult) => void;
  appendResult: (r: LoadResult) => void;
  reset: () => void;
}

function historyFlags() {
  return { canUndo: past.length > 0, canRedo: future.length > 0 };
}

export const useEditor = create<EditorState>((set, get) => ({
  screen: 'import',
  docName: 'Document.pdf',
  pages: [{ id: 'p1', kind: 'blank', h: PAGE_H }],
  activePage: 0,
  zoom: 0.82,
  tool: 'select',
  shapeKind: 'rect',
  elements: [],
  selectedId: null,
  editingId: null,
  draft: null,
  fieldValues: {},
  showPreview: false,
  exporting: false,
  exportPages: [],
  dragPage: null,
  dragOverPage: null,
  canUndo: false,
  canRedo: false,

  /* ---------- history ---------- */
  commit: () => {
    const s = get();
    try {
      past.push(JSON.stringify({ e: s.elements, f: s.fieldValues }));
      if (past.length > MAX_HISTORY) past.shift();
      future.length = 0;
    } catch {
      /* noop */
    }
    set(historyFlags());
  },
  undo: () => {
    if (!past.length) return;
    const s = get();
    future.push(JSON.stringify({ e: s.elements, f: s.fieldValues }));
    const snap: Snapshot = JSON.parse(past.pop() as string);
    set({
      elements: snap.e,
      fieldValues: snap.f,
      selectedId: null,
      editingId: null,
      ...historyFlags(),
    });
  },
  redo: () => {
    if (!future.length) return;
    const s = get();
    past.push(JSON.stringify({ e: s.elements, f: s.fieldValues }));
    const snap: Snapshot = JSON.parse(future.pop() as string);
    set({
      elements: snap.e,
      fieldValues: snap.f,
      selectedId: null,
      editingId: null,
      ...historyFlags(),
    });
  },

  /* ---------- tools ---------- */
  setTool: (tool) =>
    set((s) => ({
      tool,
      selectedId: tool === 'select' ? s.selectedId : null,
      editingId: null,
    })),
  setShapeKind: (k) => set({ shapeKind: k }),

  createClick: (tool, x, y, page) => {
    get().commit();
    const id = uid();
    let el: Element | null = null;
    if (tool === 'text') {
      el = {
        type: 'text', id, page, x, y: y - 11, w: 210, h: 40,
        text: 'Nouveau texte', fontSize: 16, color: '#1C2527',
        bold: false, italic: false, align: 'left',
      };
    } else if (tool === 'field') {
      el = {
        type: 'field', id, page, x, y: y - 16, w: 220, h: 32,
        text: '', label: 'Champ à remplir', fontSize: 15, color: '#0053B2',
      };
    } else if (tool === 'check') {
      el = { type: 'check', id, page, x: x - 11, y: y - 11, w: 22, h: 22, color: ACCENT };
    } else if (tool === 'signature') {
      el = {
        type: 'signature', id, page, x: x - 90, y: y - 28, w: 180, h: 56,
        name: 'Prénom Nom', mode: 'type', sigSrc: null,
      };
    } else if (tool === 'image') {
      el = { type: 'image', id, page, x: x - 70, y: y - 45, w: 140, h: 90, src: null, opacity: 1 };
    }
    if (!el) return null;
    set((s) => ({
      elements: [...s.elements, el as Element],
      selectedId: id,
      tool: 'select',
      editingId: tool === 'text' || tool === 'field' ? id : null,
    }));
    return id;
  },

  startDraft: (draft) => set({ draft }),
  updateDraft: (patch) =>
    set((s) => (s.draft ? { draft: { ...s.draft, ...patch } as Draft } : {})),
  setDraftPoints: (pts) =>
    set((s) => (s.draft && s.draft.type === 'draw' ? { draft: { ...s.draft, pts } } : {})),
  commitDraft: () => {
    const d = get().draft;
    if (!d) return null;
    const id = uid();
    if (d.type === 'draw') {
      if (d.pts.length <= 1) {
        set({ draft: null });
        return null;
      }
      const b = boxFromPoints(d.pts);
      set((s) => ({
        elements: [
          ...s.elements,
          {
            type: 'draw', id, page: d.page, x: b.x, y: b.y, w: b.w, h: b.h,
            ow: b.w, oh: b.h,
            pts: d.pts.map((p) => [p[0] - b.x, p[1] - b.y] as [number, number]),
            color: d.color, strokeW: d.strokeW,
          },
        ],
        draft: null,
        selectedId: id,
        tool: 'select',
      }));
      return id;
    }
    // draft rectangulaire (redaction / highlight / shape)
    const box = d as Extract<Draft, { w: number }>;
    if (!(box.w > 5 && box.h > 5)) {
      set({ draft: null });
      return null;
    }
    set((s) => ({
      elements: [...s.elements, { ...(d as object), id } as Element],
      draft: null,
      selectedId: id,
      tool: 'select',
    }));
    return id;
  },
  cancelDraft: () => set({ draft: null }),

  /* ---------- elements ---------- */
  pushEl: (el) => set((s) => ({ elements: [...s.elements, el] })),
  updateEl: (id, patch) =>
    set((s) => ({
      elements: s.elements.map((e) => (e.id === id ? ({ ...e, ...patch } as Element) : e)),
    })),
  getEl: (id) => get().elements.find((e) => e.id === id),
  select: (id) => set({ selectedId: id, editingId: null }),
  setEditing: (id) => set({ editingId: id, selectedId: id ?? get().selectedId }),
  deleteSel: () => {
    get().commit();
    const id = get().selectedId;
    set((s) => ({
      elements: s.elements.filter((e) => e.id !== id),
      selectedId: null,
      editingId: null,
    }));
  },
  duplicateSel: () => {
    const e = get().getEl(get().selectedId ?? '');
    if (!e) return;
    get().commit();
    const id = uid();
    set((s) => ({
      elements: [...s.elements, { ...e, id, x: e.x + 16, y: e.y + 16 }],
      selectedId: id,
    }));
  },
  bringFront: () => {
    const id = get().selectedId;
    set((s) => {
      const e = s.elements.find((x) => x.id === id);
      if (!e) return {};
      return { elements: [...s.elements.filter((x) => x.id !== id), e] };
    });
  },
  sendBack: () => {
    const id = get().selectedId;
    set((s) => {
      const e = s.elements.find((x) => x.id === id);
      if (!e) return {};
      return { elements: [e, ...s.elements.filter((x) => x.id !== id)] };
    });
  },
  setField: (k, v) => set((s) => ({ fieldValues: { ...s.fieldValues, [k]: v } })),

  /* ---------- pages ---------- */
  addPage: () => {
    get().commit();
    set((s) => ({
      pages: [...s.pages, { id: uid(), kind: 'blank', h: PAGE_H }],
      activePage: s.pages.length,
    }));
  },
  deletePage: (idx) => {
    if (get().pages.length <= 1) return;
    get().commit();
    set((s) => {
      const pages = s.pages.filter((_, i) => i !== idx);
      const elements = s.elements
        .filter((e) => e.page !== idx)
        .map((e) => (e.page > idx ? { ...e, page: e.page - 1 } : e));
      return {
        pages,
        elements,
        activePage: Math.max(0, Math.min(s.activePage, pages.length - 1)),
        selectedId: null,
      };
    });
  },
  rotatePage: (idx) => {
    get().commit();
    set((s) => ({
      pages: s.pages.map((p, i) =>
        i === idx
          ? { ...p, rotation: ((((p.rotation ?? 0) + 90) % 360) as 0 | 90 | 180 | 270) }
          : p,
      ),
      ...historyFlags(),
    }));
  },
  movePage: (from, to) => {
    if (from === to || from == null || to == null) return;
    get().commit();
    set((s) => {
      const pages = [...s.pages];
      const [m] = pages.splice(from, 1);
      pages.splice(to, 0, m);
      const map: Record<number, number> = {};
      s.pages.forEach((p, oi) => {
        map[oi] = pages.indexOf(p);
      });
      const elements = s.elements.map((e) => ({ ...e, page: map[e.page] }));
      return {
        pages,
        elements,
        activePage: map[s.activePage],
        selectedId: null,
        dragOverPage: null,
      };
    });
  },
  setDragPage: (i) => set({ dragPage: i }),
  setDragOverPage: (i) => set((s) => (s.dragOverPage === i ? {} : { dragOverPage: i })),

  /* ---------- nav ---------- */
  zoomIn: () => set((s) => ({ zoom: Math.min(1.8, +(s.zoom + 0.1).toFixed(2)) })),
  zoomOut: () => set((s) => ({ zoom: Math.max(0.3, +(s.zoom - 0.1).toFixed(2)) })),
  goPrev: () => set((s) => ({ activePage: Math.max(0, s.activePage - 1), selectedId: null })),
  goNext: () =>
    set((s) => ({
      activePage: Math.min(s.pages.length - 1, s.activePage + 1),
      selectedId: null,
    })),
  setDocName: (name) => set({ docName: name }),

  openPreview: () => set({ showPreview: true, selectedId: null, editingId: null }),
  closePreview: () => set({ showPreview: false }),
  goExport: () =>
    set({ screen: 'export', showPreview: false, selectedId: null, editingId: null, exportPages: [] }),
  backToEditor: () => set({ screen: 'editor' }),
  setExporting: (v) => set({ exporting: v }),
  setExportPages: (imgs) => set({ exportPages: imgs }),

  /* ---------- load ---------- */
  loadResult: (r) => {
    past.length = 0;
    future.length = 0;
    set({
      screen: 'editor',
      docName: r.docName,
      pages: r.pages,
      elements: r.elements,
      activePage: 0,
      fieldValues: {},
      selectedId: null,
      editingId: null,
      tool: 'select',
      ...historyFlags(),
    });
  },
  appendResult: (r) => {
    get().commit();
    set((s) => {
      const offset = s.pages.length;
      // Nouvelles pages : ids réattribués (loadPdf produit 'p1','p2'… qui
      // entreraient en collision avec le document courant).
      const newPages = r.pages.map((p) => ({ ...p, id: uid() }));
      // Éléments décalés sur les pages ajoutées, ids réattribués.
      const newEls = r.elements.map((e) => ({ ...e, id: uid(), page: e.page + offset }));
      return {
        pages: [...s.pages, ...newPages],
        elements: [...s.elements, ...newEls],
        activePage: offset, // aller à la première page ajoutée
        selectedId: null,
        editingId: null,
        ...historyFlags(),
      };
    });
  },
  reset: () => {
    past.length = 0;
    future.length = 0;
    set({
      screen: 'import',
      elements: [],
      fieldValues: {},
      selectedId: null,
      editingId: null,
      ...historyFlags(),
    });
  },
}));

export { PAGE_W, PAGE_H };
