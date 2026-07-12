/* ============================================================
   Export : aplatissement des pages (html2canvas) → PDF (jsPDF).
   V1 = aplatissement image, identique au prototype. Voir docs/ROADMAP.md
   pour la V2 pdf-lib (champs AcroForm + texte vectoriel).
   Imports dynamiques → aucun code serveur, tout client.
   ============================================================ */
import type { Page } from './types';
import { PAGE_W } from './types';
import { pageDisplay } from './geometry';

/**
 * Capture chaque page (nœuds `#cap-<i>` déjà montés hors-écran à l'échelle 1)
 * en JPEG. Retourne les data URLs dans l'ordre des pages.
 */
export async function flattenPages(pageCount: number): Promise<string[]> {
  const html2canvas = (await import('html2canvas')).default;
  const imgs: string[] = [];
  for (let i = 0; i < pageCount; i++) {
    const node = document.getElementById('cap-' + i);
    if (!node) continue;
    try {
      const canvas = await html2canvas(node, {
        scale: 2,
        backgroundColor: '#fff',
        useCORS: true,
        logging: false,
      });
      imgs.push(canvas.toDataURL('image/jpeg', 0.92));
    } catch (err) {
      console.warn('Aplatissement de la page', i, 'impossible', err);
    }
  }
  return imgs;
}

/** Assemble les images aplaties en un PDF au format de chaque page. */
export async function buildPdf(imgs: string[], pages: Page[]) {
  const { jsPDF } = await import('jspdf');
  const dims = (p?: Page) => pageDisplay(p?.rotation ?? 0, PAGE_W, p?.h || 1123);
  const d0 = dims(pages[0]);
  const pdf = new jsPDF({
    unit: 'px',
    format: [d0.dW, d0.dH],
    compress: true,
  });
  imgs.forEach((src, i) => {
    const d = dims(pages[i]);
    if (i > 0) pdf.addPage([d.dW, d.dH]);
    pdf.addImage(src, 'JPEG', 0, 0, d.dW, d.dH);
  });
  return pdf;
}

/** Nom de sortie : `<base>-modifie.pdf`. */
export function outputName(docName: string, ext: 'pdf' | 'png'): string {
  const base = (docName || 'document').replace(/\.(pdf|png|jpe?g)$/i, '');
  return ext === 'pdf' ? `${base}-modifie.pdf` : `${base}.png`;
}

/** Télécharge une data URL PNG (page 1). */
export function downloadPng(dataUrl: string, docName: string) {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = outputName(docName, 'png');
  a.click();
}
