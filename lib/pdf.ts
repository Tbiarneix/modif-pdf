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

/**
 * Échantillonne la couleur de fond sous un bloc de texte, dans le raster de la
 * page (coordonnées en px canvas). On lit quelques points sur les bords haut et
 * bas de la boîte — là où il y a le padding de ligne, donc du fond et non des
 * glyphes — et on renvoie la couleur dominante en hex. Sert de cache par défaut
 * pour que le texte réécrit ne pose pas un rectangle blanc sur un fond coloré.
 */
function sampleBackground(
  data: Uint8ClampedArray,
  cw: number,
  ch: number,
  x: number,
  y: number,
  w: number,
  h: number,
): string {
  const counts = new Map<number, number>();
  const N = 6;
  const rows = [Math.floor(y) + 1, Math.floor(y + h) - 1];
  for (const yy of rows) {
    if (yy < 0 || yy >= ch) continue;
    for (let i = 0; i < N; i++) {
      const xx = Math.floor(x + (w * (i + 0.5)) / N);
      if (xx < 0 || xx >= cw) continue;
      const idx = (yy * cw + xx) * 4;
      if (data[idx + 3] < 200) continue; // ignore le transparent
      // quantifie par pas de 8 pour regrouper l'anti-aliasing
      const r = Math.min(255, Math.round(data[idx] / 8) * 8);
      const g = Math.min(255, Math.round(data[idx + 1] / 8) * 8);
      const b = Math.min(255, Math.round(data[idx + 2] / 8) * 8);
      const key = (r << 16) | (g << 8) | b;
      counts.set(key, (counts.get(key) || 0) + 1);
    }
  }
  let best = -1;
  let bestN = 0;
  for (const [key, n] of counts) {
    if (n > bestN) {
      bestN = n;
      best = key;
    }
  }
  if (best < 0) return '#ffffff';
  return '#' + best.toString(16).padStart(6, '0');
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

    // Pixels de la page (une lecture par page) + facteur px-canvas → px-page,
    // pour échantillonner la couleur de fond sous chaque bloc de texte.
    const pageImg = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    const k = vp.width / PAGE_W;

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
        // Label de police le plus riche possible : id de l'item + famille CSS
        // pdf.js + nom réel de la police chargée (commonObjs, dispo après render).
        // L'id d'item seul (« g_d0_f1 ») ne révèle ni le gras ni l'italique.
        let label = `${it.fontName ?? ''} ${style?.fontFamily ?? ''}`;
        try {
          if (it.fontName && pg.commonObjs.has(it.fontName)) {
            const f = pg.commonObjs.get(it.fontName) as { name?: string; loadedName?: string };
            label += ` ${f?.name ?? f?.loadedName ?? ''}`;
          }
        } catch {
          /* police non résolue : on garde le label courant */
        }
        const serif = /serif|times|roman|georgia|garamond|minion|palatino|book\s?antiqua/i.test(label);
        const bold = /bold|black|heavy|semibold|-b\b|,\s*b\b/i.test(label);
        const italic = /italic|oblique/i.test(label);

        const boxY = top - fontH * 0.12;
        const boxW = Math.max(6, w + 2);
        const boxH = Math.max(9, fontH * 1.28);
        const mask = sampleBackground(
          pageImg,
          canvas.width,
          canvas.height,
          left * k,
          boxY * k,
          boxW * k,
          boxH * k,
        );

        elements.push({
          type: 'ptext',
          id: uid(),
          page: i - 1,
          x: left,
          y: boxY,
          w: boxW,
          h: boxH,
          orig: str,
          text: str,
          // taille réelle de la police (le facteur 0.9 rapetissait le texte
          // réécrit par rapport à l'original).
          fontSize: Math.max(6, fontH),
          color: '#1C2527',
          mask,
          serif,
          bold,
          italic,
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
