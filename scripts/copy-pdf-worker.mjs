// Copies the pdf.js worker out of node_modules into /public so it can be served
// as a static asset (workerSrc = '/pdf.worker.min.js'). Runs on postinstall.
// Relying on import.meta.url / webpack for the worker is brittle under Next, so
// we serve a copied file instead (reliable + offline).
import { copyFile, mkdir, access } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

// pdfjs-dist 3.x ships the worker under build/. Try the common names.
const candidates = [
  'node_modules/pdfjs-dist/build/pdf.worker.min.js',
  'node_modules/pdfjs-dist/legacy/build/pdf.worker.min.js',
];
const dest = resolve(root, 'public/pdf.worker.min.js');

async function exists(p) {
  try { await access(p); return true; } catch { return false; }
}

async function main() {
  await mkdir(resolve(root, 'public'), { recursive: true });
  for (const rel of candidates) {
    const src = resolve(root, rel);
    if (await exists(src)) {
      await copyFile(src, dest);
      console.log(`[copy-pdf-worker] copied ${rel} -> public/pdf.worker.min.js`);
      return;
    }
  }
  console.warn('[copy-pdf-worker] pdf.worker.min.js not found in node_modules; PDF import will not work until it is present.');
}

main().catch((e) => {
  console.warn('[copy-pdf-worker] failed:', e.message);
});
