/* ============================================================
   Import & extraction de texte via pdf.js (pdfjs-dist).
   Tout est purement côté client. Formule d'extraction reprise du
   prototype (l.243‑246) et du README §60‑63.
   ============================================================ */
import type { Element, Page } from './types';
import { PAGE_W } from './types';
import type { LoadResult } from './store';

let workerConfigured = false;

/** Configure le worker une seule fois (fichier servi depuis /public). */
async function getPdfjs() {
  const pdfjs = await import('pdfjs-dist');
  if (!workerConfigured) {
    // Le worker est copié dans /public par scripts/copy-pdf-worker.mjs.
    pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
    workerConfigured = true;
  }
  return pdfjs;
}

let idSeq = 0;
function uid(): string {
  idSeq += 1;
  return 'x' + idSeq.toString(36);
}

/** Charge un PDF : rasterise chaque page + extrait la couche texte en `ptext`. */
export async function loadPdf(file: File): Promise<LoadResult> {
  const pdfjs = await getPdfjs();
  const buf = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: buf }).promise;
  const pages: Page[] = [];
  const elements: Element[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const pg = await pdf.getPage(i);

    // --- fond raster (scale 2 pour la netteté) ---
    const vp = pg.getViewport({ scale: 2 });
    const canvas = document.createElement('canvas');
    canvas.width = vp.width;
    canvas.height = vp.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D indisponible');
    await pg.render({ canvasContext: ctx, viewport: vp }).promise;
    pages.push({
      id: 'p' + i,
      kind: 'image',
      src: canvas.toDataURL('image/jpeg', 0.85),
      h: PAGE_W * (vp.height / vp.width),
    });

    // --- couche texte → éléments ptext ---
    try {
      const vp1 = pg.getViewport({ scale: 1 });
      const S = PAGE_W / vp1.width;
      const vpS = pg.getViewport({ scale: S });
      const tc = await pg.getTextContent();
      for (const raw of tc.items) {
        const it = raw as {
          str?: string;
          width?: number;
          transform: number[];
          fontName?: string;
        };
        const str = it.str;
        if (!str || !str.trim()) continue;
        const tx = pdfjs.Util.transform(vpS.transform, it.transform);
        const fontH = Math.hypot(tx[1], tx[3]);
        if (fontH < 4 || fontH > 240) continue;
        const w = Math.max((it.width ?? 0) * S, str.length * fontH * 0.28);
        const left = tx[4];
        const top = tx[5] - fontH;
        const style = (tc.styles as Record<string, { fontFamily?: string }> | undefined)?.[
          it.fontName ?? ''
        ];
        const serif = !!(
          style &&
          style.fontFamily &&
          /serif|times|georgia|roman|garamond/i.test(style.fontFamily)
        );
        const bold = /bold|black|heavy|semibold/i.test(it.fontName ?? '');
        elements.push({
          type: 'ptext',
          id: uid(),
          page: i - 1,
          x: left,
          y: top - fontH * 0.12,
          w: Math.max(6, w + 2),
          h: Math.max(9, fontH * 1.28),
          orig: str,
          text: str,
          fontSize: Math.max(6, fontH * 0.9),
          color: '#1C2527',
          mask: '#ffffff',
          serif,
          bold,
          italic: false,
          align: 'left',
        });
      }
    } catch (te) {
      console.warn('Couche texte illisible pour la page', i, te);
    }
  }

  return { pages, elements, docName: file.name };
}

/** Charge une image comme document d'une seule page. */
export function loadImage(file: File): Promise<LoadResult> {
  return new Promise((resolve, reject) => {
    const rd = new FileReader();
    rd.onload = () => {
      const img = new Image();
      img.onload = () => {
        resolve({
          pages: [
            {
              id: 'p1',
              kind: 'image',
              src: rd.result as string,
              h: PAGE_W * (img.height / img.width),
            },
          ],
          elements: [],
          docName: file.name,
        });
      };
      img.onerror = () => reject(new Error('Image illisible'));
      img.src = rd.result as string;
    };
    rd.onerror = () => reject(new Error('Lecture du fichier impossible'));
    rd.readAsDataURL(file);
  });
}
