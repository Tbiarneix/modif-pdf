/* ============================================================
   Constantes de design réutilisées côté TSX (valeurs injectées
   en inline-style là où une variable CSS ne suffit pas — glows
   calculés, palettes de swatches…). Les couleurs miroir des
   variables CSS de globals.css.
   ============================================================ */
export { PAGE_W, PAGE_H } from './types';

/** Palette générale des sélecteurs de couleur. */
export const PALETTE = [
  '#1C2527',
  '#2C3E50',
  '#0075F1',
  '#dc2626',
  '#22c55e',
  '#f59e0b',
  '#8C00F1',
  '#FFFFFF',
];

/** Couleurs de surlignage translucides. */
export const HILITE = ['#F7E463', '#8CE9A0', '#9FD0FF', '#FFB3C1'];

/** Couleurs de cache (fond) pour le texte du PDF réécrit. */
export const MASK_COLORS = ['#ffffff', '#F3F5F7', '#FBF7EC', '#000000'];

/** Bleu primaire Publidata (accent par défaut de l'éditeur). */
export const ACCENT = '#0075F1';

/** Couleur de fond du bouton « Caviarder » quand actif. */
export const REDACT_ACTIVE = '#1C2527';

export const C = {
  blue: '#0075F1',
  blueDark: '#0053B2',
  blueLight: '#7DA7D6',
  ink: '#2C3E50',
  slate: '#BBC7D2',
  line: '#E6EBEF',
  mist: '#F3F5F7',
  gray: '#8E9299',
  border: '#D4DDE4',
  success: '#22c55e',
  danger: '#dc2626',
  white: '#FFFFFF',
  canvas: '#DCE3E9',
  docText: '#1C2527',
};

/** hex (#rrggbb ou #rgb) → rgba(r,g,b,a). Pour les glows colorés. */
export function rgba(hex: string, a: number): string {
  const c = hex.replace('#', '');
  const full = c.length === 3 ? c.split('').map((x) => x + x).join('') : c;
  const n = parseInt(full, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}
