/* ============================================================
   Modèle de données de l'éditeur.
   Coordonnées TOUJOURS en espace-page NON zoomé (px).
   ============================================================ */

/** Largeur canonique d'une page A4 @96dpi. La hauteur dérive du ratio. */
export const PAGE_W = 794;
/** Hauteur A4 par défaut (page blanche / démo). */
export const PAGE_H = 1123;

export type Screen = 'import' | 'editor' | 'export';

export type Tool =
  | 'select'
  | 'text'
  | 'field'
  | 'check'
  | 'signature'
  | 'image'
  | 'draw'
  | 'highlight'
  | 'shape'
  | 'redaction';

export type ShapeKind = 'rect' | 'ellipse' | 'line';
export type Align = 'left' | 'center' | 'right';

export interface Page {
  id: string;
  kind: 'image' | 'blank';
  src?: string;
  /** hauteur de page en px (espace non zoomé) */
  h: number;
  /** rotation d'affichage, multiple de 90° (défaut 0) */
  rotation?: 0 | 90 | 180 | 270;
}

/** Champs communs à tous les éléments. */
export interface ElementBase {
  id: string;
  page: number;
  x: number;
  y: number;
  w: number;
  h: number;
  opacity?: number;
}

export interface TextElement extends ElementBase {
  type: 'text';
  text: string;
  fontSize: number;
  color: string;
  bold: boolean;
  /** graisse CSS (100–900) ; prioritaire sur `bold` si définie */
  weight?: number;
  italic: boolean;
  underline?: boolean;
  strike?: boolean;
  align: Align;
}

/** Texte extrait de la couche texte du PDF (pdf.js). */
export interface PTextElement extends ElementBase {
  type: 'ptext';
  /** texte d'origine — sert de référence pour savoir si l'utilisateur a modifié */
  orig: string;
  text: string;
  fontSize: number;
  color: string;
  /** couleur du cache peint sur le raster quand text !== orig */
  mask: string;
  serif: boolean;
  bold: boolean;
  /** graisse CSS (100–900) ; prioritaire sur `bold` si définie */
  weight?: number;
  italic: boolean;
  underline?: boolean;
  strike?: boolean;
  align: Align;
  /**
   * Famille CSS de la police embarquée du PDF (loadedName pdf.js), si elle est
   * réellement chargée dans le navigateur. Quand elle est présente, le texte
   * réécrit s'affiche avec la police réelle ; le gras/italique sont alors portés
   * par la police elle-même.
   */
  fontFamily?: string;
  /**
   * Clone métrique embarqué par l'app (Arimo, Tinos, Marianne…) déduit du nom de
   * police, utilisé quand la police du PDF n'est pas embarquée/chargeable.
   */
  fallbackFamily?: string;
}

export interface FieldElement extends ElementBase {
  type: 'field';
  text: string;
  label: string;
  fontSize: number;
  color: string;
}

export interface CheckElement extends ElementBase {
  type: 'check';
  color: string;
}

export interface SignatureElement extends ElementBase {
  type: 'signature';
  name: string;
  mode: 'type' | 'draw';
  sigSrc: string | null;
}

export interface ImageElement extends ElementBase {
  type: 'image';
  src: string | null;
  opacity: number;
}

export interface RedactionElement extends ElementBase {
  type: 'redaction';
}

export interface HighlightElement extends ElementBase {
  type: 'highlight';
  color: string;
}

export interface ShapeElement extends ElementBase {
  type: 'shape';
  shape: ShapeKind;
  stroke: string;
  fill: string;
  strokeW: number;
}

export interface DrawElement extends ElementBase {
  type: 'draw';
  pts: Array<[number, number]>;
  /** dimensions d'origine du tracé (pour le viewBox SVG lors du resize) */
  ow: number;
  oh: number;
  color: string;
  strokeW: number;
}

export type Element =
  | TextElement
  | PTextElement
  | FieldElement
  | CheckElement
  | SignatureElement
  | ImageElement
  | RedactionElement
  | HighlightElement
  | ShapeElement
  | DrawElement;

export type ElementType = Element['type'];

/** Brouillon en cours de tracé (avant d'être matérialisé en Element). */
export type Draft =
  | { type: 'redaction'; page: number; x: number; y: number; w: number; h: number }
  | { type: 'highlight'; page: number; x: number; y: number; w: number; h: number; color: string }
  | {
      type: 'shape';
      page: number;
      shape: ShapeKind;
      x: number;
      y: number;
      w: number;
      h: number;
      stroke: string;
      fill: string;
      strokeW: number;
    }
  | { type: 'draw'; page: number; pts: Array<[number, number]>; color: string; strokeW: number };

export type FieldValues = Record<string, string | boolean>;

/** Poignées de redimensionnement. */
export type Handle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';
