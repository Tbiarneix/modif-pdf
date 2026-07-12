'use client';

import { useEditor } from '@/lib/store';
import ReadOnlyPage from './ReadOnlyPage';
import s from './PreviewModal.module.css';

export default function PreviewModal() {
  const pages = useEditor((st) => st.pages);
  const docName = useEditor((st) => st.docName);
  const closePreview = useEditor((st) => st.closePreview);
  const goExport = useEditor((st) => st.goExport);

  return (
    <div className={s.scrim} role="dialog" aria-modal="true" aria-label={`Aperçu de ${docName}`}>
      <div className={s.bar}>
        <i className="fas fa-eye" style={{ color: 'var(--pd-blue)', marginRight: 10 }} aria-hidden="true" />
        <span className={s.title}>Aperçu — {docName}</span>
        <div style={{ flex: 1 }} />
        <button className={s.exportBtn} onClick={goExport}>
          <i className="fas fa-file-arrow-down" style={{ marginRight: 7 }} aria-hidden="true" />
          Exporter
        </button>
        <button className={s.closeBtn} onClick={closePreview} aria-label="Fermer l’aperçu">
          <i className="fas fa-times" aria-hidden="true" />
        </button>
      </div>
      <div className={s.pages}>
        {pages.map((p, i) => (
          <ReadOnlyPage key={p.id} page={p} index={i} scale={0.62} />
        ))}
      </div>
    </div>
  );
}
