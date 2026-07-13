'use client';

import { useEditor } from '@/lib/store';
import Button from './ui/Button';
import IconButton from './ui/IconButton';
import Tag from './ui/Tag';
import s from './Topbar.module.css';
import Link from 'next/link';

export default function Topbar() {
  const docName = useEditor((st) => st.docName);
  const activePage = useEditor((st) => st.activePage);
  const pageCount = useEditor((st) => st.pages.length);
  const zoom = useEditor((st) => st.zoom);
  const canUndo = useEditor((st) => st.canUndo);
  const canRedo = useEditor((st) => st.canRedo);

  const undo = useEditor((st) => st.undo);
  const redo = useEditor((st) => st.redo);
  const goPrev = useEditor((st) => st.goPrev);
  const goNext = useEditor((st) => st.goNext);
  const zoomIn = useEditor((st) => st.zoomIn);
  const zoomOut = useEditor((st) => st.zoomOut);
  const openPreview = useEditor((st) => st.openPreview);
  const goExport = useEditor((st) => st.goExport);

  return (
    <div className={s.bar}>
      <button className={s.logoBrimborion} onClick={() => window.open('https://pdf.brimborion.app', '_self')} title="Retour à l'écran d'accueil">
        <img
          className={s.logoBrimborion}
          src="/logo.svg"
          alt="Retour à l'écran d'accueil"
          />
      </button>
      <div className={s.logo}>
        <i className="fas fa-file-pen" aria-hidden="true" />
      </div>
      <div className={s.name}>
        <span className={s.nameText} title={docName}>
          {docName}
        </span>
        <Tag>Brouillon</Tag>
      </div>

      <div className={s.undoGroup}>
        <IconButton
          icon="fas fa-rotate-left"
          label="Annuler"
          onClick={undo}
          disabled={!canUndo}
          color={canUndo ? 'var(--pd-ink)' : 'var(--pd-slate)'}
        />
        <IconButton
          icon="fas fa-rotate-right"
          label="Rétablir"
          onClick={redo}
          disabled={!canRedo}
          color={canRedo ? 'var(--pd-ink)' : 'var(--pd-slate)'}
        />
      </div>

      <div className={s.spacer} />

      <div className={s.group}>
        <button className={s.groupBtn} onClick={goPrev} aria-label="Page précédente" title="Page précédente">
          <i className="fas fa-chevron-left" aria-hidden="true" />
        </button>
        <span className={s.groupVal} style={{ minWidth: 56 }}>
          {activePage + 1} / {pageCount}
        </span>
        <button className={s.groupBtn} onClick={goNext} aria-label="Page suivante" title="Page suivante">
          <i className="fas fa-chevron-right" aria-hidden="true" />
        </button>
      </div>

      <div className={s.group}>
        <button className={s.groupBtn} onClick={zoomOut} aria-label="Dézoomer" title="Dézoomer">
          <i className="fas fa-minus" aria-hidden="true" />
        </button>
        <span className={s.groupVal} style={{ minWidth: 46 }}>
          {Math.round(zoom * 100)}%
        </span>
        <button className={s.groupBtn} onClick={zoomIn} aria-label="Zoomer" title="Zoomer">
          <i className="fas fa-plus" aria-hidden="true" />
        </button>
      </div>

      <Button variant="white" icon="fas fa-eye" onClick={openPreview}>
        Aperçu
      </Button>
      <Button variant="primary" icon="fas fa-file-arrow-down" onClick={goExport}>
        Exporter
      </Button>
    </div>
  );
}
