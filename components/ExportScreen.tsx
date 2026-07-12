'use client';

import { useEffect, useRef } from 'react';
import type { jsPDF } from 'jspdf';
import { useEditor, PAGE_W } from '@/lib/store';
import { flattenPages, buildPdf, downloadPng, outputName } from '@/lib/export';
import ElementView from './ElementView';
import { PageBackground } from './PageBackground';
import s from './ExportScreen.module.css';

export default function ExportScreen() {
  const pages = useEditor((st) => st.pages);
  const elements = useEditor((st) => st.elements);
  const fieldValues = useEditor((st) => st.fieldValues);
  const docName = useEditor((st) => st.docName);
  const exporting = useEditor((st) => st.exporting);
  const exportPages = useEditor((st) => st.exportPages);
  const backToEditor = useEditor((st) => st.backToEditor);
  const setExporting = useEditor((st) => st.setExporting);
  const setExportPages = useEditor((st) => st.setExportPages);

  const pdfRef = useRef<jsPDF | null>(null);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    (async () => {
      setExporting(true);
      setExportPages([]);
      // Laisse le DOM des noeuds de capture se monter avant html2canvas.
      await new Promise((r) => setTimeout(r, 400));
      const imgs = await flattenPages(pages.length);
      setExporting(false);
      setExportPages(imgs);
      try {
        pdfRef.current = await buildPdf(imgs, pages);
      } catch (e) {
        console.warn('Construction PDF impossible', e);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stats = [
    {
      i: 'fa-pen',
      l: 'Champs remplis',
      v: Object.values(fieldValues).filter((v) => v && String(v).trim()).length,
    },
    {
      i: 'fa-i-cursor',
      l: 'Textes modifiés',
      v: elements.filter((e) => e.type === 'ptext' && e.text !== e.orig).length,
    },
    {
      i: 'fa-shapes',
      l: 'Éléments ajoutés',
      v: elements.filter((e) => e.type !== 'ptext').length,
    },
    { i: 'fa-file', l: 'Pages', v: pages.length },
  ];

  function downloadPdf() {
    if (pdfRef.current) pdfRef.current.save(outputName(docName, 'pdf'));
  }

  return (
    <div className={s.screen}>
      {/* Noeuds de capture hors-écran, échelle 1. */}
      <div className={s.capture} aria-hidden="true">
        {pages.map((p, i) => {
          const els = elements.filter((e) => e.page === i);
          return (
            <div
              key={p.id}
              id={`cap-${i}`}
              className={s.captureNode}
              style={{ width: PAGE_W, height: p.h || 1123 }}
            >
              <PageBackground page={p} />
              <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                {els.map((el) => (
                  <ElementView key={el.id} el={el} selected={false} editing={false} readOnly />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className={s.bar}>
        <button className={s.back} onClick={backToEditor}>
          <i className="fas fa-arrow-left" aria-hidden="true" />
          Retour à l’édition
        </button>
        <div style={{ flex: 1 }} />
        <span className={s.barTitle}>Exporter le document</span>
      </div>

      <div className={s.body}>
        <div className={s.previews}>
          {exporting ? (
            <div className={s.placeholder}>
              <div className="pf-spin" aria-hidden="true" />
              <div>Aplatissement du document…</div>
            </div>
          ) : exportPages.length ? (
            exportPages.map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={src} alt={`Page ${i + 1} aplatie`} className={s.preview} />
            ))
          ) : (
            <div className={s.placeholder}>Aperçu indisponible</div>
          )}
        </div>

        <div className={s.side}>
          <div className={s.card}>
            <div className={s.cardTitle}>Document prêt</div>
            <div className={s.cardSub}>Modifications appliquées et fusionnées dans le fichier.</div>
            <div className={s.stats}>
              {stats.map((st2, i) => (
                <div key={i} className={s.stat}>
                  <div className={s.statIcon}>
                    <i className={`fas ${st2.i}`} aria-hidden="true" />
                  </div>
                  <span className={s.statLabel}>{st2.l}</span>
                  <span className={s.statVal}>{st2.v}</span>
                </div>
              ))}
            </div>
            <button className={s.dlPdf} onClick={downloadPdf} disabled={exporting}>
              <i className="fas fa-file-pdf" style={{ marginRight: 8 }} aria-hidden="true" />
              Télécharger le PDF
            </button>
            <button
              className={s.dlPng}
              onClick={() => exportPages[0] && downloadPng(exportPages[0], docName)}
              disabled={exporting}
            >
              <i className="fas fa-image" style={{ marginRight: 8 }} aria-hidden="true" />
              Télécharger en image (PNG)
            </button>
          </div>
          <div className={s.footnote}>
            Le PDF est généré localement dans votre navigateur. Les zones caviardées sont aplaties
            et non récupérables.
          </div>
        </div>
      </div>
    </div>
  );
}
