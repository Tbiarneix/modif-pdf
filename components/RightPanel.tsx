'use client';

import { useEditor } from '@/lib/store';
import PropertiesPanel from './PropertiesPanel';
import DocumentPanel from './DocumentPanel';
import s from './Panel.module.css';

export default function RightPanel() {
  const selectedId = useEditor((st) => st.selectedId);
  const el = useEditor((st) => st.elements.find((e) => e.id === st.selectedId));
  const hasSel = !!selectedId && !!el;

  return (
    <div className={s.panel}>
      <div className={s.header}>
        <i
          className={`fas ${hasSel ? 'fa-sliders' : 'fa-layer-group'} ${s.headerIcon}`}
          aria-hidden="true"
        />
        <span className={s.headerTitle}>{hasSel ? 'Propriétés' : 'Document'}</span>
      </div>
      <div className={s.body}>{hasSel && el ? <PropertiesPanel el={el} /> : <DocumentPanel />}</div>
    </div>
  );
}
