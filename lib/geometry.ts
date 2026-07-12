/* ============================================================
   Conversions de coordonnées et calculs de manipulation.
   ============================================================ */
import type { Handle } from './types';

export interface Point {
  x: number;
  y: number;
}

/**
 * Convertit une position écran (clientX/Y) en coordonnées page NON pivotées et
 * non zoomées. `rect` est l'AABB (getBoundingClientRect) de la couche overlay
 * telle qu'affichée (donc déjà pivotée). La rotation est inversée ici pour que
 * toute la logique d'édition travaille en espace-page canonique.
 */
export function pointToPage(
  clientX: number,
  clientY: number,
  rect: DOMRect,
  zoom: number,
  rotation = 0,
  W = 0,
  H = 0,
): Point {
  const lx = (clientX - rect.left) / zoom;
  const ly = (clientY - rect.top) / zoom;
  const rot = ((rotation % 360) + 360) % 360;
  if (rot === 90) return { x: ly, y: H - lx };
  if (rot === 180) return { x: W - lx, y: H - ly };
  if (rot === 270) return { x: W - ly, y: lx };
  return { x: lx, y: ly };
}

/**
 * Dimensions d'affichage d'une page pivotée + transform CSS pour placer la
 * boîte page (W×H, non pivotée, origine haut-gauche) dans la boîte d'affichage.
 */
export function pageDisplay(rotation: number, W: number, H: number) {
  const rot = ((rotation % 360) + 360) % 360;
  const swapped = rot === 90 || rot === 270;
  const dW = swapped ? H : W;
  const dH = swapped ? W : H;
  let transform = '';
  if (rot === 90) transform = `translate(${H}px,0) rotate(90deg)`;
  else if (rot === 180) transform = `translate(${W}px,${H}px) rotate(180deg)`;
  else if (rot === 270) transform = `translate(0,${W}px) rotate(270deg)`;
  return { dW, dH, rot, transform };
}

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Rectangle normalisé à partir d'un point d'origine et d'un point courant. */
export function boxFromDrag(sx: number, sy: number, x: number, y: number): Box {
  return {
    x: Math.min(sx, x),
    y: Math.min(sy, y),
    w: Math.abs(x - sx),
    h: Math.abs(y - sy),
  };
}

/** Boîte englobante d'un ensemble de points (tracé libre). */
export function boxFromPoints(pts: Array<[number, number]>): Box {
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const minx = Math.min(...xs);
  const miny = Math.min(...ys);
  return {
    x: minx,
    y: miny,
    w: Math.max(6, Math.max(...xs) - minx),
    h: Math.max(6, Math.max(...ys) - miny),
  };
}

export interface ResizeStart {
  ex: number;
  ey: number;
  ew: number;
  eh: number;
  px: number;
  py: number;
}

/**
 * Applique un redimensionnement selon la poignée saisie. Renvoie la nouvelle
 * boîte (min 10px sur chaque dimension). Miroir du proto (l.214‑219).
 */
export function applyResize(
  handle: Handle,
  start: ResizeStart,
  x: number,
  y: number,
): Box {
  const { ex, ey, ew, eh, px, py } = start;
  const dx = x - px;
  const dy = y - py;
  let nx = ex;
  let ny = ey;
  let nw = ew;
  let nh = eh;
  if (handle.includes('e')) nw = Math.max(10, ew + dx);
  if (handle.includes('s')) nh = Math.max(10, eh + dy);
  if (handle.includes('w')) {
    nw = Math.max(10, ew - dx);
    nx = ex + (ew - nw);
  }
  if (handle.includes('n')) {
    nh = Math.max(10, eh - dy);
    ny = ey + (eh - nh);
  }
  return { x: nx, y: ny, w: nw, h: nh };
}

/** Définition des 8 poignées : [clé, fractionX, fractionY, curseur]. */
export const HANDLES: Array<[Handle, number, number, string]> = [
  ['nw', 0, 0, 'nwse'],
  ['n', 0.5, 0, 'ns'],
  ['ne', 1, 0, 'nesw'],
  ['e', 1, 0.5, 'ew'],
  ['se', 1, 1, 'nwse'],
  ['s', 0.5, 1, 'ns'],
  ['sw', 0, 1, 'nesw'],
  ['w', 0, 0.5, 'ew'],
];
