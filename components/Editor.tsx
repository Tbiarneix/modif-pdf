'use client';

import { useEffect } from 'react';
import { useEditor } from '@/lib/store';
import ImportScreen from './ImportScreen';
import Topbar from './Topbar';
import ToolRail from './ToolRail';
import Canvas from './Canvas';
import RightPanel from './RightPanel';
import PreviewModal from './PreviewModal';
import ExportScreen from './ExportScreen';
import s from './Editor.module.css';

export default function Editor() {
  const screen = useEditor((st) => st.screen);
  const showPreview = useEditor((st) => st.showPreview);

  // Raccourcis clavier globaux (uniquement en mode éditeur).
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const st = useEditor.getState();
      if (st.screen !== 'editor') return;
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      const typing =
        tag === 'INPUT' || tag === 'TEXTAREA' || !!target?.isContentEditable;

      if (e.key === 'Escape') {
        st.select(null);
        st.setEditing(null);
        st.setTool('select');
        st.cancelDraft();
      } else if (
        (e.key === 'Delete' || e.key === 'Backspace') &&
        st.selectedId &&
        !typing &&
        !st.editingId
      ) {
        e.preventDefault();
        st.deleteSel();
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z' && !typing) {
        e.preventDefault();
        if (e.shiftKey) st.redo();
        else st.undo();
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  if (screen === 'import') {
    return (
      <div className={s.app}>
        <ImportScreen />
      </div>
    );
  }

  if (screen === 'export') {
    return <ExportScreen />;
  }

  return (
    <div className={s.app}>
      <Topbar />
      <div className={s.body}>
        <ToolRail />
        <Canvas />
        <RightPanel />
      </div>
      {showPreview ? <PreviewModal /> : null}
    </div>
  );
}
