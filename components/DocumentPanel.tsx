'use client';

import { useEditor } from '@/lib/store';
import { ACCENT, rgba } from '@/lib/tokens';
import { Row, Input, SectionLabel } from './ui/Field';
import ActionButton from './ui/ActionButton';
import { DEMO_FIELDS } from './DemoDocument';
import s from './Panel.module.css';

export default function DocumentPanel() {
  const st = useEditor();
  const {
    docName,
    pages,
    activePage,
    elements,
    fieldValues,
    dragPage,
    dragOverPage,
  } = st;
  const multi = pages.length > 1;

  const thumbIcon = (kind: string) =>
    kind === 'image' ? 'far fa-file-image' : kind === 'demo' ? 'far fa-file-lines' : 'far fa-file';

  const hasDemo = pages.some((p) => p.kind === 'demo');
  const filled = DEMO_FIELDS.filter(([k]) => {
    const v = fieldValues[k];
    return typeof v === 'string' && v.trim();
  }).length;

  const ptextCount = elements.filter((e) => e.type === 'ptext').length;
  const ptextModif = elements.filter((e) => e.type === 'ptext' && e.text !== e.orig).length;

  return (
    <div>
      <Row label="Nom du fichier">
        <Input
          value={docName}
          label="Nom du fichier"
          onChange={(e) => st.setDocName(e.target.value)}
        />
      </Row>

      <SectionLabel>Pages</SectionLabel>
      {multi ? (
        <div className={s.dndHint}>
          <i className="fas fa-up-down-left-right" style={{ fontSize: 10 }} aria-hidden="true" />
          Glissez pour réorganiser
        </div>
      ) : null}

      <div className={s.pageList}>
        {pages.map((p, i) => {
          const active = i === activePage;
          const over = dragOverPage === i;
          const dragging = dragPage === i;
          const count = elements.filter((e) => e.page === i && e.type !== 'ptext').length;
          return (
            <div
              key={p.id}
              draggable={multi}
              onDragStart={
                multi
                  ? (ev) => {
                      st.setDragPage(i);
                      ev.dataTransfer.effectAllowed = 'move';
                      try {
                        ev.dataTransfer.setData('text/plain', String(i));
                      } catch {
                        /* noop */
                      }
                    }
                  : undefined
              }
              onDragOver={
                multi
                  ? (ev) => {
                      ev.preventDefault();
                      ev.dataTransfer.dropEffect = 'move';
                      st.setDragOverPage(i);
                    }
                  : undefined
              }
              onDrop={
                multi
                  ? (ev) => {
                      ev.preventDefault();
                      st.movePage(dragPage, i);
                      st.setDragPage(null);
                      st.setDragOverPage(null);
                    }
                  : undefined
              }
              onDragEnd={
                multi
                  ? () => {
                      st.setDragPage(null);
                      st.setDragOverPage(null);
                    }
                  : undefined
              }
              onClick={() => useEditor.setState({ activePage: i, selectedId: null })}
              className={s.pageItem}
              style={{
                borderColor: over || active ? ACCENT : undefined,
                background: over ? rgba(ACCENT, 0.1) : active ? rgba(ACCENT, 0.05) : '#fff',
                cursor: multi ? 'grab' : 'pointer',
                opacity: dragging ? 0.45 : 1,
                boxShadow: over ? `0 -2px 0 0 ${ACCENT} inset` : 'none',
              }}
            >
              {multi ? <i className={`fas fa-grip-vertical ${s.grip}`} aria-hidden="true" /> : null}
              <div className={s.thumb}>
                <i className={thumbIcon(p.kind)} aria-hidden="true" />
              </div>
              <div className={s.pageMeta}>
                <div className={s.pageName} style={{ color: active ? ACCENT : undefined }}>
                  Page {i + 1}
                </div>
                <div className={s.pageCount}>{count} élément(s)</div>
              </div>
              {multi ? (
                <button
                  className={s.pageDel}
                  aria-label={`Supprimer la page ${i + 1}`}
                  title="Supprimer la page"
                  onClick={(ev) => {
                    ev.stopPropagation();
                    st.deletePage(i);
                  }}
                >
                  <i className="fas fa-trash" aria-hidden="true" />
                </button>
              ) : null}
            </div>
          );
        })}
      </div>

      <div style={{ marginBottom: 18 }}>
        <ActionButton label="Ajouter une page" icon="fas fa-plus" onClick={st.addPage} />
      </div>

      {hasDemo ? (
        <>
          <div className={s.fieldHead}>
            <span>Champs détectés</span>
            <span style={{ color: filled === DEMO_FIELDS.length ? 'var(--pd-success)' : ACCENT }}>
              {filled}/{DEMO_FIELDS.length}
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {DEMO_FIELDS.map(([k, l]) => {
              const raw = fieldValues[k];
              const on = typeof raw === 'string' && raw.trim();
              return (
                <div key={k} className={s.fieldRow}>
                  <i
                    className={on ? 'fas fa-circle-check' : 'far fa-circle'}
                    style={{ color: on ? 'var(--pd-success)' : 'var(--pd-border)', fontSize: 14 }}
                    aria-hidden="true"
                  />
                  <span style={{ flex: 1 }}>{l}</span>
                  {on ? <span className={s.fieldVal}>{raw as string}</span> : null}
                </div>
              );
            })}
          </div>
        </>
      ) : null}

      {ptextCount ? (
        <div className={s.ptextCard}>
          <div className={s.ptextTitle}>
            <i className="fas fa-wand-magic-sparkles" aria-hidden="true" />
            Texte du PDF modifiable
          </div>
          <span style={{ color: 'var(--pd-ink)' }}>
            Double-cliquez sur n’importe quel texte du document pour le corriger. {ptextCount}{' '}
            bloc(s) détecté(s){ptextModif ? `, ${ptextModif} modifié(s)` : ''}.
          </span>
        </div>
      ) : null}

      <div className={s.tip}>
        Astuce : sélectionnez un outil dans la barre de gauche, puis cliquez sur le document pour
        ajouter du contenu.
      </div>
    </div>
  );
}
